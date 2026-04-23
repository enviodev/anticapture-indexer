import { getAddress, type Address, type Hex } from "viem";
import { type DaoIdEnum } from "../lib/enums";
import {
  CEXAddresses,
  DEXAddresses,
  LendingAddresses,
  BurningAddresses,
} from "../lib/constants";
import {
  accountBalanceId,
  delegationId,
  votingPowerHistoryId,
  feedEventId,
} from "../lib/id-helpers";
import {
  createAddressSet,
  ensureAccountsExist,
} from "./shared";

const zeroAddress = "0x0000000000000000000000000000000000000000";

// Toggle — set to true to re-enable FeedEvent writes
const WRITE_FEED_EVENTS = true;

type DelegationAddressSets = {
  cex: ReadonlySet<Address>;
  dex: ReadonlySet<Address>;
  lending: ReadonlySet<Address>;
  burning: ReadonlySet<Address>;
};

export const delegateChanged = async (
  context: any,
  daoId: DaoIdEnum,
  args: {
    delegator: Address;
    delegate: Address;
    tokenId: Address;
    previousDelegate: Address;
    txHash: Hex;
    timestamp: bigint;
    logIndex: number;
    delegatorBalance?: bigint;
  },
  addressSets?: DelegationAddressSets,
) => {
  const {
    delegator,
    delegate,
    tokenId,
    txHash,
    previousDelegate,
    timestamp,
    logIndex,
    delegatorBalance: _delegatorBalance,
  } = args;

  const normalizedDelegator = getAddress(delegator);
  const normalizedDelegate = getAddress(delegate);
  const normalizedTokenId = getAddress(tokenId);
  const abId = accountBalanceId(normalizedDelegator, normalizedTokenId);

  // === Concurrent reads: accounts + delegation + accountBalance + accountPowers ===
  const prevDelegateAddr = previousDelegate !== zeroAddress ? getAddress(previousDelegate) : null;

  const readPromises: Promise<any>[] = [
    context.Account.get(normalizedDelegator),   // [0]
    context.Account.get(normalizedDelegate),    // [1]
    context.Delegation.get(delegationId(txHash, normalizedDelegator, normalizedDelegate)), // [2]
    context.AccountBalance.get(abId),           // [3]
    context.AccountPower.get(normalizedDelegate), // [4]
  ];
  if (prevDelegateAddr) {
    readPromises.push(context.AccountPower.get(prevDelegateAddr)); // [5]
  }

  const results = await Promise.all(readPromises);
  const existingDelegatorAccount = results[0];
  const existingDelegateAccount = results[1];
  const existingDel = results[2];
  const existingAb = results[3];
  const existingNewPower = results[4];
  const existingPrevPower = prevDelegateAddr ? results[5] : null;

  // Ensure accounts
  if (!existingDelegatorAccount) context.Account.set({ id: normalizedDelegator });
  if (!existingDelegateAccount) context.Account.set({ id: normalizedDelegate });

  // Get delegator balance
  let delegatorBalanceValue: bigint = 0n;
  if (_delegatorBalance !== undefined) {
    delegatorBalanceValue = _delegatorBalance;
  } else if (existingAb) {
    delegatorBalanceValue = existingAb.balance;
  }

  // Pre-compute address sets
  const { cex, dex, lending, burning } = addressSets ?? {
    cex: createAddressSet(Object.values(CEXAddresses[daoId] || {})),
    dex: createAddressSet(Object.values(DEXAddresses[daoId] || {})),
    lending: createAddressSet(Object.values(LendingAddresses[daoId] || {})),
    burning: createAddressSet(Object.values(BurningAddresses[daoId] || {})),
  };

  const isCex = cex.has(normalizedDelegator) || cex.has(normalizedDelegate);
  const isDex = dex.has(normalizedDelegator) || dex.has(normalizedDelegate);
  const isLending = lending.has(normalizedDelegator) || lending.has(normalizedDelegate);
  const isBurning = burning.has(normalizedDelegator) || burning.has(normalizedDelegate);

  // Upsert delegation
  if (existingDel) {
    context.Delegation.set({
      ...existingDel,
      delegatedValue: existingDel.delegatedValue + delegatorBalanceValue,
    });
  } else {
    context.Delegation.set({
      id: delegationId(txHash, normalizedDelegator, normalizedDelegate),
      transactionHash: txHash,
      daoId,
      delegateAccount_id: normalizedDelegate,
      delegatorAccount_id: normalizedDelegator,
      delegatedValue: delegatorBalanceValue,
      previousDelegate: getAddress(previousDelegate),
      timestamp,
      logIndex,
      isCex,
      isDex,
      isLending,
      isTotal: isBurning,
      type: null,
    });
  }

  // Update delegator's accountBalance delegate
  if (existingAb) {
    context.AccountBalance.set({ ...existingAb, delegate: normalizedDelegate });
  } else {
    context.AccountBalance.set({
      id: abId,
      account_id: normalizedDelegator,
      token_id: normalizedTokenId,
      delegate: normalizedDelegate,
      balance: 0n,
    });
  }

  // Decrement previous delegate's delegation count
  if (prevDelegateAddr) {
    if (existingPrevPower) {
      context.AccountPower.set({
        ...existingPrevPower,
        delegationsCount: Math.max(0, existingPrevPower.delegationsCount - 1),
      });
    } else {
      context.AccountPower.set({
        id: prevDelegateAddr, account_id: prevDelegateAddr, daoId,
        votingPower: 0n, votesCount: 0, proposalsCount: 0, delegationsCount: 0, lastVoteTimestamp: 0n,
      });
    }
  }

  // Increment new delegate's delegation count
  if (existingNewPower) {
    context.AccountPower.set({
      ...existingNewPower,
      delegationsCount: existingNewPower.delegationsCount + 1,
    });
  } else {
    context.AccountPower.set({
      id: normalizedDelegate, account_id: normalizedDelegate, daoId,
      votingPower: 0n, votesCount: 0, proposalsCount: 0, delegationsCount: 1, lastVoteTimestamp: 0n,
    });
  }

  // Feed event
  if (WRITE_FEED_EVENTS) {
    const feId = feedEventId(txHash, logIndex);
    context.FeedEvent.set({
      id: feId, type: "DELEGATION", value: delegatorBalanceValue, timestamp,
      metadata: {
        delegator: normalizedDelegator, delegate: normalizedDelegate,
        previousDelegate: getAddress(previousDelegate), amount: delegatorBalanceValue.toString(),
      },
    });
  }
};

export const delegatedVotesChanged = async (
  context: any,
  daoId: DaoIdEnum,
  args: {
    delegate: Address;
    txHash: Hex;
    newBalance: bigint;
    oldBalance: bigint;
    timestamp: bigint;
    logIndex: number;
  },
) => {
  const { delegate, txHash, newBalance, oldBalance, timestamp, logIndex } = args;
  const normalizedDelegate = getAddress(delegate);

  const vpDelta = newBalance - oldBalance;
  const deltaMod = vpDelta > 0n ? vpDelta : -vpDelta;

  // === Concurrent reads: account + votingPowerHistory + accountPower ===
  const vphId = votingPowerHistoryId(txHash, normalizedDelegate, logIndex);
  const [existingAccount, existingVph, existingPower] = await Promise.all([
    context.Account.get(normalizedDelegate),
    context.VotingPowerHistory.get(vphId),
    context.AccountPower.get(normalizedDelegate),
  ]);

  if (!existingAccount) context.Account.set({ id: normalizedDelegate });

  // VotingPowerHistory (no conflict)
  if (!existingVph) {
    context.VotingPowerHistory.set({
      id: vphId, daoId, transactionHash: txHash, account_id: normalizedDelegate,
      votingPower: newBalance, delta: vpDelta, deltaMod, timestamp, logIndex,
    });
  }

  // Upsert account power
  if (existingPower) {
    context.AccountPower.set({ ...existingPower, votingPower: newBalance });
  } else {
    context.AccountPower.set({
      id: normalizedDelegate, account_id: normalizedDelegate, daoId,
      votingPower: newBalance, votesCount: 0, proposalsCount: 0, delegationsCount: 0, lastVoteTimestamp: 0n,
    });
  }

  // Feed event
  if (WRITE_FEED_EVENTS) {
    const feId = feedEventId(txHash, logIndex);
    context.FeedEvent.set({
      id: feId, type: "DELEGATION_VOTES_CHANGED", value: deltaMod, timestamp,
      metadata: { delta: vpDelta.toString(), deltaMod: deltaMod.toString(), delegate: normalizedDelegate },
    });
  }
};
