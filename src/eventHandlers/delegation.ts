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
  ensureAccountExists,
  ensureAccountsExist,
} from "./shared";

const zeroAddress = "0x0000000000000000000000000000000000000000";

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

  await ensureAccountsExist(context, [delegator, delegate]);

  // Get delegator balance
  let delegatorBalanceValue: bigint = 0n;
  if (_delegatorBalance !== undefined) {
    delegatorBalanceValue = _delegatorBalance;
  } else {
    const abId = accountBalanceId(normalizedDelegator, getAddress(tokenId));
    const ab = await context.AccountBalance.get(abId);
    if (ab) {
      delegatorBalanceValue = ab.balance;
    }
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
  const isLending =
    lending.has(normalizedDelegator) || lending.has(normalizedDelegate);
  const isBurning =
    burning.has(normalizedDelegator) || burning.has(normalizedDelegate);
  const isTotal = isBurning;

  // Upsert delegation
  const delId = delegationId(txHash, normalizedDelegator, normalizedDelegate);
  const existingDel = await context.Delegation.get(delId);
  if (existingDel) {
    context.Delegation.set({
      ...existingDel,
      delegatedValue: existingDel.delegatedValue + delegatorBalanceValue,
    });
  } else {
    context.Delegation.set({
      id: delId,
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
      isTotal,
      type: null,
    });
  }

  // Update delegator's accountBalance delegate
  const abId = accountBalanceId(normalizedDelegator, getAddress(tokenId));
  const existingAb = await context.AccountBalance.get(abId);
  if (existingAb) {
    context.AccountBalance.set({
      ...existingAb,
      delegate: normalizedDelegate,
    });
  } else {
    context.AccountBalance.set({
      id: abId,
      account_id: normalizedDelegator,
      token_id: getAddress(tokenId),
      delegate: normalizedDelegate,
      balance: 0n,
    });
  }

  // Decrement previous delegate's delegation count
  if (previousDelegate !== zeroAddress) {
    const prevPowerId = getAddress(previousDelegate);
    const existingPrevPower = await context.AccountPower.get(prevPowerId);
    if (existingPrevPower) {
      context.AccountPower.set({
        ...existingPrevPower,
        delegationsCount: Math.max(0, existingPrevPower.delegationsCount - 1),
      });
    } else {
      context.AccountPower.set({
        id: prevPowerId,
        account_id: prevPowerId,
        daoId,
        votingPower: 0n,
        votesCount: 0,
        proposalsCount: 0,
        delegationsCount: 0,
        lastVoteTimestamp: 0n,
      });
    }
  }

  // Increment new delegate's delegation count
  const existingNewPower = await context.AccountPower.get(normalizedDelegate);
  if (existingNewPower) {
    context.AccountPower.set({
      ...existingNewPower,
      delegationsCount: existingNewPower.delegationsCount + 1,
    });
  } else {
    context.AccountPower.set({
      id: normalizedDelegate,
      account_id: normalizedDelegate,
      daoId,
      votingPower: 0n,
      votesCount: 0,
      proposalsCount: 0,
      delegationsCount: 1,
      lastVoteTimestamp: 0n,
    });
  }

  // Feed event
  const feId = feedEventId(txHash, logIndex);
  context.FeedEvent.set({
    id: feId,
    type: "DELEGATION",
    value: delegatorBalanceValue,
    timestamp,
    metadata: {
      delegator: normalizedDelegator,
      delegate: normalizedDelegate,
      previousDelegate: getAddress(previousDelegate),
      amount: delegatorBalanceValue.toString(),
    },
  });
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
  const { delegate, txHash, newBalance, oldBalance, timestamp, logIndex } =
    args;

  const normalizedDelegate = getAddress(delegate);

  await ensureAccountExists(context, delegate);

  const vpDelta = newBalance - oldBalance;
  const deltaMod = vpDelta > 0n ? vpDelta : -vpDelta;

  // Insert voting power history (no conflict)
  const vphId = votingPowerHistoryId(txHash, normalizedDelegate, logIndex);
  const existingVph = await context.VotingPowerHistory.get(vphId);
  if (!existingVph) {
    context.VotingPowerHistory.set({
      id: vphId,
      daoId,
      transactionHash: txHash,
      account_id: normalizedDelegate,
      votingPower: newBalance,
      delta: vpDelta,
      deltaMod,
      timestamp,
      logIndex,
    });
  }

  // Upsert account power
  const existingPower = await context.AccountPower.get(normalizedDelegate);
  if (existingPower) {
    context.AccountPower.set({
      ...existingPower,
      votingPower: newBalance,
    });
  } else {
    context.AccountPower.set({
      id: normalizedDelegate,
      account_id: normalizedDelegate,
      daoId,
      votingPower: newBalance,
      votesCount: 0,
      proposalsCount: 0,
      delegationsCount: 0,
      lastVoteTimestamp: 0n,
    });
  }

  // Feed event
  const feId = feedEventId(txHash, logIndex);
  context.FeedEvent.set({
    id: feId,
    type: "DELEGATION_VOTES_CHANGED",
    value: deltaMod,
    timestamp,
    metadata: {
      delta: vpDelta.toString(),
      deltaMod: deltaMod.toString(),
      delegate: normalizedDelegate,
    },
  });
};
