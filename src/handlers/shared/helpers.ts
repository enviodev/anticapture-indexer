/**
 * Core helper functions for entity operations.
 * Converts Ponder's context.db.insert().onConflictDoUpdate() pattern
 * to Envio's context.Entity.get() + context.Entity.set() pattern.
 */

import { DaoIdEnum } from "../../lib/enums";
import { MetricTypesEnum, ZERO_ADDRESS, BurningAddresses } from "../../lib/constants";
import { getAddressLists, addressInList } from "../../lib/addressResolver";
import { delta, max, min, truncateTimestampToMidnight } from "../../lib/utils";

import type { HandlerContext } from "generated";

type Context = HandlerContext;

// ============================================================
// Account helpers
// ============================================================

export async function ensureAccountExists(context: Context, address: string): Promise<void> {
  const id = address.toLowerCase();
  const existing = await context.Account.get(id);
  if (!existing) {
    context.Account.set({ id });
  }
}

export async function ensureAccountsExist(context: Context, addresses: string[]): Promise<void> {
  for (const address of addresses) {
    await ensureAccountExists(context, address);
  }
}

// ============================================================
// Daily Bucket Metric Storage
// ============================================================

export async function storeDailyBucket(
  context: Context,
  metricType: MetricTypesEnum,
  currentValue: bigint,
  newValue: bigint,
  daoId: string,
  timestamp: bigint,
  tokenAddress: string,
): Promise<void> {
  const date = BigInt(truncateTimestampToMidnight(Number(timestamp)));
  const normalizedTokenId = tokenAddress.toLowerCase();
  const id = `${date}-${normalizedTokenId}-${metricType}`;
  const volume = delta(newValue, currentValue);

  const existing = await context.DaoMetricsDayBucket.get(id);
  if (existing) {
    const newCount = existing.count + 1;
    context.DaoMetricsDayBucket.set({
      ...existing,
      average: (existing.average * BigInt(existing.count) + newValue) / BigInt(newCount),
      high: max(newValue, existing.high),
      low: min(newValue, existing.low),
      close: newValue,
      volume: existing.volume + volume,
      count: newCount,
      lastUpdate: timestamp,
    });
  } else {
    context.DaoMetricsDayBucket.set({
      id,
      date,
      tokenId: normalizedTokenId,
      metricType,
      daoId,
      average: newValue,
      open: newValue,
      high: newValue,
      low: newValue,
      close: newValue,
      volume,
      count: 1,
      lastUpdate: timestamp,
    });
  }
}

// ============================================================
// Transfer Core Logic
// ============================================================

export async function handleTransferCore(
  context: Context,
  daoId: DaoIdEnum,
  args: {
    from: string;
    to: string;
    value: bigint;
    tokenAddress: string;
    txHash: string;
    timestamp: bigint;
    logIndex: number;
  },
): Promise<void> {
  const { from, to, value, tokenAddress, txHash, timestamp, logIndex } = args;
  const normalizedFrom = from.toLowerCase();
  const normalizedTo = to.toLowerCase();
  const normalizedTokenId = tokenAddress.toLowerCase();

  await ensureAccountExists(context, to);
  await ensureAccountExists(context, from);

  // Update receiver balance
  const receiverBalanceId = `${normalizedTo}-${normalizedTokenId}`;
  const receiverBal = await context.AccountBalance.get(receiverBalanceId);
  const currentReceiverBalance = receiverBal ? receiverBal.balance + value : value;
  context.AccountBalance.set({
    id: receiverBalanceId,
    accountId: normalizedTo,
    tokenId: normalizedTokenId,
    balance: currentReceiverBalance,
    delegate: receiverBal?.delegate ?? ZERO_ADDRESS,
  });

  // Balance history for receiver
  const receiverHistId = `${txHash}-${normalizedTo}-${logIndex}`;
  const existingReceiverHist = await context.BalanceHistory.get(receiverHistId);
  if (!existingReceiverHist) {
    context.BalanceHistory.set({
      id: receiverHistId,
      daoId,
      transactionHash: txHash,
      accountId: normalizedTo,
      balance: currentReceiverBalance,
      delta: value,
      deltaMod: value > 0n ? value : -value,
      timestamp,
      logIndex,
    });
  }

  // Update sender balance (if not minting)
  if (normalizedFrom !== ZERO_ADDRESS) {
    const senderBalanceId = `${normalizedFrom}-${normalizedTokenId}`;
    const senderBal = await context.AccountBalance.get(senderBalanceId);
    const currentSenderBalance = senderBal ? senderBal.balance - value : -value;
    context.AccountBalance.set({
      id: senderBalanceId,
      accountId: normalizedFrom,
      tokenId: normalizedTokenId,
      balance: currentSenderBalance,
      delegate: senderBal?.delegate ?? ZERO_ADDRESS,
    });

    const senderHistId = `${txHash}-${normalizedFrom}-${logIndex}`;
    const existingSenderHist = await context.BalanceHistory.get(senderHistId);
    if (!existingSenderHist) {
      context.BalanceHistory.set({
        id: senderHistId,
        daoId,
        transactionHash: txHash,
        accountId: normalizedFrom,
        balance: currentSenderBalance,
        delta: -value,
        deltaMod: value > 0n ? value : -value,
        timestamp,
        logIndex,
      });
    }
  }

  // Transfer entity
  const lists = getAddressLists(daoId);
  const transferId = `${txHash}-${normalizedFrom}-${normalizedTo}`;
  const existingTransfer = await context.Transfer.get(transferId);
  if (existingTransfer) {
    context.Transfer.set({
      ...existingTransfer,
      amount: existingTransfer.amount + value,
    });
  } else {
    context.Transfer.set({
      id: transferId,
      transactionHash: txHash,
      daoId,
      tokenId: normalizedTokenId,
      amount: value,
      fromAccountId: normalizedFrom,
      toAccountId: normalizedTo,
      timestamp,
      logIndex,
      isCex: addressInList(normalizedFrom, lists.cex) || addressInList(normalizedTo, lists.cex),
      isDex: addressInList(normalizedFrom, lists.dex) || addressInList(normalizedTo, lists.dex),
      isLending: addressInList(normalizedFrom, lists.lending) || addressInList(normalizedTo, lists.lending),
      isTotal: addressInList(normalizedFrom, lists.burning) || addressInList(normalizedTo, lists.burning),
    });
  }

  // Feed event
  const feedId = `${txHash}-${logIndex}`;
  context.FeedEvent.set({
    id: feedId,
    txHash,
    logIndex,
    eventType: "TRANSFER",
    value,
    timestamp,
    metadata: JSON.stringify({
      from: normalizedFrom,
      to: normalizedTo,
      amount: value.toString(),
    }),
  });
}

// ============================================================
// Delegate Changed Core
// ============================================================

export async function handleDelegateChangedCore(
  context: Context,
  daoId: DaoIdEnum,
  args: {
    delegator: string;
    toDelegate: string;
    fromDelegate: string;
    tokenAddress: string;
    txHash: string;
    timestamp: bigint;
    logIndex: number;
  },
): Promise<void> {
  const { delegator, toDelegate, fromDelegate, tokenAddress, txHash, timestamp, logIndex } = args;
  const normalizedDelegator = delegator.toLowerCase();
  const normalizedDelegate = toDelegate.toLowerCase();
  const normalizedTokenId = tokenAddress.toLowerCase();

  await ensureAccountsExist(context, [delegator, toDelegate]);

  // Get delegator balance
  const balanceId = `${normalizedDelegator}-${normalizedTokenId}`;
  const delegatorBalance = await context.AccountBalance.get(balanceId);
  const delegatorBalanceValue = delegatorBalance?.balance ?? 0n;

  // Determine flags
  const lists = getAddressLists(daoId);
  const isCex = addressInList(normalizedDelegator, lists.cex) || addressInList(normalizedDelegate, lists.cex);
  const isDex = addressInList(normalizedDelegator, lists.dex) || addressInList(normalizedDelegate, lists.dex);
  const isLending = addressInList(normalizedDelegator, lists.lending) || addressInList(normalizedDelegate, lists.lending);
  const isBurning = addressInList(normalizedDelegator, lists.burning) || addressInList(normalizedDelegate, lists.burning);

  // Delegation entity
  const delegationId = `${txHash}-${normalizedDelegator}-${normalizedDelegate}`;
  const existingDelegation = await context.Delegation.get(delegationId);
  if (existingDelegation) {
    context.Delegation.set({
      ...existingDelegation,
      delegatedValue: existingDelegation.delegatedValue + delegatorBalanceValue,
    });
  } else {
    context.Delegation.set({
      id: delegationId,
      transactionHash: txHash,
      daoId,
      delegateAccountId: normalizedDelegate,
      delegatorAccountId: normalizedDelegator,
      delegatedValue: delegatorBalanceValue,
      previousDelegate: fromDelegate.toLowerCase(),
      timestamp,
      logIndex,
      isCex,
      isDex,
      isLending,
      isTotal: isBurning,
    });
  }

  // Update account balance delegate
  context.AccountBalance.set({
    id: balanceId,
    accountId: normalizedDelegator,
    tokenId: normalizedTokenId,
    balance: delegatorBalanceValue,
    delegate: normalizedDelegate,
  });

  // Update previous delegate's power
  const normalizedPrevDelegate = fromDelegate.toLowerCase();
  if (normalizedPrevDelegate !== ZERO_ADDRESS) {
    const prevPower = await context.AccountPower.get(normalizedPrevDelegate);
    if (prevPower) {
      context.AccountPower.set({
        ...prevPower,
        delegationsCount: Math.max(0, prevPower.delegationsCount - 1),
      });
    }
  }

  // Update new delegate's power
  const newPower = await context.AccountPower.get(normalizedDelegate);
  if (newPower) {
    context.AccountPower.set({
      ...newPower,
      delegationsCount: newPower.delegationsCount + 1,
    });
  } else {
    context.AccountPower.set({
      id: normalizedDelegate,
      accountId: normalizedDelegate,
      daoId,
      votingPower: 0n,
      votesCount: 0,
      proposalsCount: 0,
      delegationsCount: 1,
      lastVoteTimestamp: 0n,
    });
  }

  // Feed event
  context.FeedEvent.set({
    id: `${txHash}-${logIndex}`,
    txHash,
    logIndex,
    eventType: "DELEGATION",
    value: delegatorBalanceValue,
    timestamp,
    metadata: JSON.stringify({
      delegator: normalizedDelegator,
      delegate: normalizedDelegate,
      previousDelegate: normalizedPrevDelegate,
      amount: delegatorBalanceValue.toString(),
    }),
  });
}

// ============================================================
// Delegate Votes Changed Core
// ============================================================

export async function handleDelegateVotesChangedCore(
  context: Context,
  daoId: DaoIdEnum,
  args: {
    delegate: string;
    previousBalance: bigint;
    newBalance: bigint;
    tokenAddress: string;
    txHash: string;
    timestamp: bigint;
    logIndex: number;
  },
): Promise<void> {
  const { delegate, previousBalance, newBalance, tokenAddress, txHash, timestamp, logIndex } = args;
  const normalizedDelegate = delegate.toLowerCase();

  await ensureAccountExists(context, delegate);

  const votingDelta = newBalance - previousBalance;
  const votingDeltaMod = votingDelta > 0n ? votingDelta : -votingDelta;

  // Voting power history
  const histId = `${txHash}-${normalizedDelegate}-${logIndex}`;
  const existingHist = await context.VotingPowerHistory.get(histId);
  if (!existingHist) {
    context.VotingPowerHistory.set({
      id: histId,
      daoId,
      transactionHash: txHash,
      accountId: normalizedDelegate,
      votingPower: newBalance,
      delta: votingDelta,
      deltaMod: votingDeltaMod,
      timestamp,
      logIndex,
    });
  }

  // Update account power
  const power = await context.AccountPower.get(normalizedDelegate);
  if (power) {
    context.AccountPower.set({
      ...power,
      votingPower: newBalance,
    });
  } else {
    context.AccountPower.set({
      id: normalizedDelegate,
      accountId: normalizedDelegate,
      daoId,
      votingPower: newBalance,
      votesCount: 0,
      proposalsCount: 0,
      delegationsCount: 0,
      lastVoteTimestamp: 0n,
    });
  }

  // Feed event
  context.FeedEvent.set({
    id: `${txHash}-${logIndex}`,
    txHash,
    logIndex,
    eventType: "DELEGATION_VOTES_CHANGED",
    value: votingDeltaMod,
    timestamp,
    metadata: JSON.stringify({
      delta: votingDelta.toString(),
      deltaMod: votingDeltaMod.toString(),
      delegate: normalizedDelegate,
    }),
  });
}

// ============================================================
// Supply Metric Helpers
// ============================================================

export async function handleSupplyMetric(
  context: Context,
  supplyField: "lendingSupply" | "cexSupply" | "dexSupply" | "treasury",
  addressList: string[],
  metricType: MetricTypesEnum,
  from: string,
  to: string,
  value: bigint,
  daoId: string,
  tokenAddress: string,
  timestamp: bigint,
): Promise<void> {
  const normalizedFrom = from.toLowerCase();
  const normalizedTo = to.toLowerCase();
  const isToRelevant = addressList.includes(normalizedTo);
  const isFromRelevant = addressList.includes(normalizedFrom);

  if ((isToRelevant || isFromRelevant) && !(isToRelevant && isFromRelevant)) {
    const tokenId = tokenAddress.toLowerCase();
    const tokenEntity = await context.Token.get(tokenId);
    if (!tokenEntity) return;

    const currentSupply = tokenEntity[supplyField] as bigint;
    const newSupply = isToRelevant ? currentSupply + value : currentSupply - value;

    context.Token.set({
      ...tokenEntity,
      [supplyField]: newSupply,
    });

    await storeDailyBucket(context, metricType, currentSupply, newSupply, daoId, timestamp, tokenAddress);
  }
}

export async function handleTotalSupply(
  context: Context,
  burningAddressList: string[],
  metricType: MetricTypesEnum,
  from: string,
  to: string,
  value: bigint,
  daoId: string,
  tokenAddress: string,
  timestamp: bigint,
): Promise<void> {
  const normalizedFrom = from.toLowerCase();
  const normalizedTo = to.toLowerCase();
  const isToBurning = burningAddressList.includes(normalizedTo);
  const isFromBurning = burningAddressList.includes(normalizedFrom);
  const isTotalSupplyTransaction = (isToBurning || isFromBurning) && !(isToBurning && isFromBurning);

  if (isTotalSupplyTransaction) {
    const tokenId = tokenAddress.toLowerCase();
    const tokenEntity = await context.Token.get(tokenId);
    if (!tokenEntity) return;

    const currentTotalSupply = tokenEntity.totalSupply;
    const newTotalSupply = isToBurning
      ? currentTotalSupply - value
      : currentTotalSupply + value;

    context.Token.set({
      ...tokenEntity,
      totalSupply: newTotalSupply,
    });

    await storeDailyBucket(context, metricType, currentTotalSupply, newTotalSupply, daoId, timestamp, tokenAddress);
  }
}

export async function handleCirculatingSupply(
  context: Context,
  daoId: string,
  tokenAddress: string,
  timestamp: bigint,
): Promise<void> {
  const tokenId = tokenAddress.toLowerCase();
  const tokenEntity = await context.Token.get(tokenId);
  if (!tokenEntity) return;

  const currentCirculating = tokenEntity.circulatingSupply;
  const newCirculating = tokenEntity.totalSupply - tokenEntity.treasury;

  context.Token.set({
    ...tokenEntity,
    circulatingSupply: newCirculating,
  });

  await storeDailyBucket(
    context,
    MetricTypesEnum.CIRCULATING_SUPPLY,
    currentCirculating,
    newCirculating,
    daoId,
    timestamp,
    tokenAddress,
  );
}

export async function handleDelegatedSupply(
  context: Context,
  daoId: DaoIdEnum,
  tokenAddress: string,
  amount: bigint,
  timestamp: bigint,
): Promise<void> {
  const tokenId = tokenAddress.toLowerCase();
  const tokenEntity = await context.Token.get(tokenId);
  if (!tokenEntity) return;

  const currentDelegated = tokenEntity.delegatedSupply;
  const newDelegated = currentDelegated + amount;

  context.Token.set({
    ...tokenEntity,
    delegatedSupply: newDelegated,
  });

  await storeDailyBucket(
    context,
    MetricTypesEnum.DELEGATED_SUPPLY,
    currentDelegated,
    newDelegated,
    daoId,
    timestamp,
    tokenAddress,
  );
}

// ============================================================
// Transaction Record
// ============================================================

export async function handleTransactionRecord(
  context: Context,
  txHash: string,
  from: string,
  to: string,
  timestamp: bigint,
  addresses: string[],
  additionalLists: {
    cex?: string[];
    dex?: string[];
    lending?: string[];
    burning?: string[];
  },
): Promise<void> {
  const normalizedAddresses = addresses.map((a) => a.toLowerCase());
  const normalizedCex = (additionalLists.cex || []).map((a) => a.toLowerCase());
  const normalizedDex = (additionalLists.dex || []).map((a) => a.toLowerCase());
  const normalizedLending = (additionalLists.lending || []).map((a) => a.toLowerCase());
  const normalizedBurning = (additionalLists.burning || []).map((a) => a.toLowerCase());

  const existing = await context.Transaction.get(txHash);
  if (existing) {
    context.Transaction.set({
      ...existing,
      isCex: existing.isCex || normalizedAddresses.some((addr) => normalizedCex.includes(addr)),
      isDex: existing.isDex || normalizedAddresses.some((addr) => normalizedDex.includes(addr)),
      isLending: existing.isLending || normalizedAddresses.some((addr) => normalizedLending.includes(addr)),
      isTotal: existing.isTotal || normalizedAddresses.some((addr) => normalizedBurning.includes(addr)),
    });
  } else {
    context.Transaction.set({
      id: txHash,
      transactionHash: txHash,
      fromAddress: from.toLowerCase(),
      toAddress: to.toLowerCase(),
      isCex: normalizedAddresses.some((addr) => normalizedCex.includes(addr)),
      isDex: normalizedAddresses.some((addr) => normalizedDex.includes(addr)),
      isLending: normalizedAddresses.some((addr) => normalizedLending.includes(addr)),
      isTotal: normalizedAddresses.some((addr) => normalizedBurning.includes(addr)),
      timestamp,
    });
  }
}
