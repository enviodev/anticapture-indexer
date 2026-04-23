import { getAddress, type Address } from "viem";
import { type DaoIdEnum } from "../lib/enums";
import {
  accountBalanceId,
  votingPowerHistoryId,
  delegationId,
  feedEventId,
} from "../lib/id-helpers";
import { updateAllSupplyMetrics } from "./metrics";

const zeroAddress = "0x0000000000000000000000000000000000000000";

// Toggle flags — match transfer.ts
const WRITE_BALANCE_HISTORY = true;
const WRITE_FEED_EVENTS = true;
const WRITE_TRANSFERS = true;

export type AaveAddressSets = {
  cex: ReadonlySet<Address>;
  dex: ReadonlySet<Address>;
  lending: ReadonlySet<Address>;
  treasury: ReadonlySet<Address>;
  nonCirculating: ReadonlySet<Address>;
  burning: ReadonlySet<Address>;
};

export async function aaveSetup(
  context: any,
  address: Address,
  daoId: DaoIdEnum,
  decimals: number,
) {
  const id = getAddress(address);
  const existing = await context.Token.get(id);
  if (!existing) {
    context.Token.set({
      id, name: daoId, decimals,
      totalSupply: 0n, delegatedSupply: 0n, cexSupply: 0n, dexSupply: 0n,
      lendingSupply: 0n, circulatingSupply: 0n, treasury: 0n, nonCirculatingSupply: 0n,
    });
  }
}

export async function aaveTransfer(
  context: any,
  {
    from: _from,
    to: _to,
    value,
    transactionHash,
    timestamp,
    logIndex,
  }: {
    from: Address;
    to: Address;
    value: bigint;
    transactionHash: `0x${string}`;
    timestamp: bigint;
    logIndex: number;
  },
  address: Address,
  daoId: DaoIdEnum,
  addressSets: AaveAddressSets,
) {
  const from = getAddress(_from);
  const to = getAddress(_to);
  const tokenId = getAddress(address);
  const isMint = _from === zeroAddress;
  const isBurn = _to === zeroAddress;

  // === Concurrent read batch ===
  const receiverAbId = !isBurn ? accountBalanceId(to, tokenId) : null;
  const senderAbId = !isMint ? accountBalanceId(from, tokenId) : null;

  const readPromises: Promise<any>[] = [
    context.Account.get(from),  // [0]
    context.Account.get(to),    // [1]
  ];
  if (receiverAbId) readPromises.push(context.AccountBalance.get(receiverAbId)); // [2]
  if (senderAbId) readPromises.push(context.AccountBalance.get(senderAbId));     // [3] or [2]

  const results = await Promise.all(readPromises);
  if (!results[0]) context.Account.set({ id: from });
  if (!results[1]) context.Account.set({ id: to });

  let receiverAbIdx = 2;
  const existingReceiverAb = receiverAbId ? results[receiverAbIdx++] : null;
  const existingSenderAb = senderAbId ? results[receiverAbIdx] : null;

  // === Transfer entity ===
  if (WRITE_TRANSFERS) {
    const { transferId } = await import("../lib/id-helpers");
    const tId = transferId(transactionHash, from, to);
    context.Transfer.set({
      id: tId, transactionHash, daoId, token_id: tokenId,
      amount: value, fromAccount_id: from, toAccount_id: to,
      timestamp, logIndex, isCex: false, isDex: false, isLending: false, isTotal: false,
    });
  }

  // === Receiver ===
  if (!isBurn && receiverAbId) {
    let currentReceiverBalance: bigint;
    let toDelegate = zeroAddress;
    if (existingReceiverAb) {
      currentReceiverBalance = existingReceiverAb.balance + value;
      toDelegate = existingReceiverAb.delegate;
      context.AccountBalance.set({ ...existingReceiverAb, balance: currentReceiverBalance });
    } else {
      currentReceiverBalance = value;
      context.AccountBalance.set({
        id: receiverAbId, account_id: to, token_id: tokenId, balance: value, delegate: zeroAddress,
      });
    }

    if (toDelegate !== zeroAddress) {
      const existingPower = await context.AccountPower.get(toDelegate);
      const currentVP = existingPower ? existingPower.votingPower : 0n;
      if (existingPower) {
        context.AccountPower.set({ ...existingPower, votingPower: existingPower.votingPower + value });
      } else {
        context.AccountPower.set({
          id: toDelegate, account_id: toDelegate, daoId,
          votingPower: value, votesCount: 0, proposalsCount: 0, delegationsCount: 0, lastVoteTimestamp: 0n,
        });
      }

      const vphId = votingPowerHistoryId(transactionHash, toDelegate, logIndex + 1);
      context.VotingPowerHistory.set({
        id: vphId, daoId, transactionHash, account_id: toDelegate,
        votingPower: currentVP + value, delta: value, deltaMod: value, timestamp, logIndex: logIndex + 1,
      });
    }

    if (WRITE_BALANCE_HISTORY) {
      const { balanceHistoryId } = await import("../lib/id-helpers");
      context.BalanceHistory.set({
        id: balanceHistoryId(transactionHash, to, logIndex), daoId, transactionHash,
        account_id: to, balance: currentReceiverBalance, delta: value,
        deltaMod: value > 0n ? value : -value, timestamp, logIndex,
      });
    }
  }

  // === Sender ===
  if (!isMint && senderAbId) {
    let currentSenderBalance: bigint;
    let fromDelegate = zeroAddress;
    if (existingSenderAb) {
      currentSenderBalance = existingSenderAb.balance - value;
      fromDelegate = existingSenderAb.delegate;
      context.AccountBalance.set({ ...existingSenderAb, balance: currentSenderBalance });
    } else {
      currentSenderBalance = -value;
      context.AccountBalance.set({
        id: senderAbId, account_id: from, token_id: tokenId, balance: -value, delegate: zeroAddress,
      });
    }

    if (fromDelegate !== zeroAddress) {
      const existingPower = await context.AccountPower.get(fromDelegate);
      const currentVP = existingPower ? existingPower.votingPower : 0n;
      if (existingPower) {
        context.AccountPower.set({ ...existingPower, votingPower: existingPower.votingPower - value });
      } else {
        context.AccountPower.set({
          id: fromDelegate, account_id: fromDelegate, daoId,
          votingPower: -value, votesCount: 0, proposalsCount: 0, delegationsCount: 0, lastVoteTimestamp: 0n,
        });
      }

      const vphId = votingPowerHistoryId(transactionHash, fromDelegate, logIndex + 1);
      context.VotingPowerHistory.set({
        id: vphId, daoId, transactionHash, account_id: fromDelegate,
        votingPower: currentVP - value, delta: -value,
        deltaMod: value > 0n ? value : -value, timestamp, logIndex: logIndex + 1,
      });
    }

    if (WRITE_BALANCE_HISTORY) {
      const { balanceHistoryId } = await import("../lib/id-helpers");
      context.BalanceHistory.set({
        id: balanceHistoryId(transactionHash, from, logIndex), daoId, transactionHash,
        account_id: from, balance: currentSenderBalance, delta: -value,
        deltaMod: value > 0n ? value : -value, timestamp, logIndex,
      });
    }
  }

  // === FeedEvent ===
  if (WRITE_FEED_EVENTS) {
    const feId = feedEventId(transactionHash, logIndex);
    context.FeedEvent.set({
      id: feId, type: "TRANSFER", value, timestamp,
      metadata: { from, to, amount: value.toString() },
    });
  }

  // === Batched supply metrics ===
  await updateAllSupplyMetrics(context, _from, _to, value, daoId, address, timestamp, addressSets);
}

export async function aaveDelegateChanged(
  context: any,
  {
    delegationType,
    delegator: _delegator,
    delegatee: _delegate,
    transactionHash,
    timestamp,
    logIndex,
  }: {
    delegationType: number;
    delegator: Address;
    delegatee: Address;
    transactionHash: `0x${string}`;
    timestamp: bigint;
    logIndex: number;
  },
  address: Address,
  daoId: DaoIdEnum,
) {
  if (delegationType === 1) return; // skip proposal delegation

  const delegator = getAddress(_delegator);
  const delegate = getAddress(_delegate);
  const tokenId = getAddress(address);
  const abId = accountBalanceId(delegator, tokenId);

  // === Concurrent reads ===
  const [existingDelegatorAcc, existingDelegateAcc, existingAb, existingDel, existingNewPower] = await Promise.all([
    context.Account.get(delegator),
    context.Account.get(delegate),
    context.AccountBalance.get(abId),
    context.Delegation.get(delegationId(transactionHash, delegator, delegate)),
    delegate !== zeroAddress ? context.AccountPower.get(delegate) : Promise.resolve(null),
  ]);

  if (!existingDelegatorAcc) context.Account.set({ id: delegator });
  if (!existingDelegateAcc) context.Account.set({ id: delegate });

  const previousDelegate = existingAb?.delegate ?? zeroAddress;
  const redelegation = previousDelegate !== zeroAddress;
  const delegatorBalance = existingAb?.balance ?? 0n;

  // Update delegator's balance delegate
  if (existingAb) {
    context.AccountBalance.set({ ...existingAb, delegate });
  } else {
    context.AccountBalance.set({
      id: abId, account_id: delegator, token_id: tokenId, delegate, balance: 0n,
    });
  }

  // Upsert delegation
  if (existingDel) {
    context.Delegation.set({ ...existingDel, delegatedValue: existingDel.delegatedValue + delegatorBalance });
  } else {
    context.Delegation.set({
      id: delegationId(transactionHash, delegator, delegate),
      transactionHash, daoId, delegateAccount_id: delegate, delegatorAccount_id: delegator,
      delegatedValue: delegatorBalance, previousDelegate, timestamp, logIndex,
      isCex: false, isDex: false, isLending: false, isTotal: false, type: delegationType,
    });
  }

  // New delegate power
  if (delegate !== zeroAddress) {
    if (existingNewPower) {
      context.AccountPower.set({
        ...existingNewPower,
        delegationsCount: existingNewPower.delegationsCount + 1,
        votingPower: existingNewPower.votingPower + delegatorBalance,
      });
    } else {
      context.AccountPower.set({
        id: delegate, account_id: delegate, daoId,
        votingPower: delegatorBalance, votesCount: 0, proposalsCount: 0,
        delegationsCount: 1, lastVoteTimestamp: 0n,
      });
    }

    const vphId = votingPowerHistoryId(transactionHash, delegate, logIndex + 1);
    context.VotingPowerHistory.set({
      id: vphId, daoId, transactionHash, account_id: delegate,
      votingPower: delegatorBalance, delta: delegatorBalance, deltaMod: delegatorBalance,
      timestamp, logIndex: logIndex + 1,
    });
  }

  // Redelegation: update previous delegate
  if (redelegation) {
    const prevPower = await context.AccountPower.get(previousDelegate);
    if (prevPower) {
      const newVP = prevPower.votingPower - delegatorBalance;
      context.AccountPower.set({
        ...prevPower, delegationsCount: prevPower.delegationsCount - 1, votingPower: newVP,
      });

      const vphId = votingPowerHistoryId(transactionHash, previousDelegate, logIndex + 1);
      context.VotingPowerHistory.set({
        id: vphId, daoId, transactionHash, account_id: previousDelegate,
        votingPower: newVP, delta: -delegatorBalance, deltaMod: delegatorBalance,
        timestamp, logIndex: logIndex + 1,
      });
    }
  }

  if (WRITE_FEED_EVENTS) {
    const feId = feedEventId(transactionHash, logIndex);
    context.FeedEvent.set({
      id: feId, type: "DELEGATION", value: delegatorBalance, timestamp,
      metadata: { delegator, delegate, previousDelegate, amount: delegatorBalance.toString() },
    });
  }
}
