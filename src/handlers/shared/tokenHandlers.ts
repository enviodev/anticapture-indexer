/**
 * Shared token handler logic for ERC20 transfers, delegation, and metrics.
 * This mirrors the Ponder event handler pattern for ENS, UNI, OP, ARB, etc.
 */

import { DaoIdEnum } from "../../lib/enums";
import { MetricTypesEnum, CONTRACT_ADDRESSES } from "../../lib/constants";
import { getAddressLists, getTokenAddress } from "../../lib/addressResolver";
import {
  handleTransferCore,
  handleDelegateChangedCore,
  handleDelegateVotesChangedCore,
  handleSupplyMetric,
  handleTotalSupply,
  handleCirculatingSupply,
  handleDelegatedSupply,
  handleTransactionRecord,
} from "./helpers";

import type { HandlerContext } from "generated";

type Context = HandlerContext;

// ============================================================
// Full token transfer handler with all supply metrics
// ============================================================
export async function handleTokenTransfer(
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

  // Ensure Token entity exists (setup equivalent)
  const tokenId = tokenAddress.toLowerCase();
  const tokenEntity = await context.Token.get(tokenId);
  if (!tokenEntity) {
    const config = CONTRACT_ADDRESSES[daoId];
    context.Token.set({
      id: tokenId,
      name: daoId,
      decimals: config.token.decimals,
      totalSupply: 0n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 0n,
      treasury: 0n,
    });
  }

  // Core transfer logic (accounts, balances, transfer entity, feed event)
  await handleTransferCore(context, daoId, args);

  // Supply metrics
  const lists = getAddressLists(daoId);

  await handleSupplyMetric(
    context, "lendingSupply", lists.lending, MetricTypesEnum.LENDING_SUPPLY,
    from, to, value, daoId, tokenAddress, timestamp,
  );

  await handleSupplyMetric(
    context, "cexSupply", lists.cex, MetricTypesEnum.CEX_SUPPLY,
    from, to, value, daoId, tokenAddress, timestamp,
  );

  await handleSupplyMetric(
    context, "dexSupply", lists.dex, MetricTypesEnum.DEX_SUPPLY,
    from, to, value, daoId, tokenAddress, timestamp,
  );

  await handleSupplyMetric(
    context, "treasury", lists.treasury, MetricTypesEnum.TREASURY,
    from, to, value, daoId, tokenAddress, timestamp,
  );

  await handleTotalSupply(
    context, lists.burning, MetricTypesEnum.TOTAL_SUPPLY,
    from, to, value, daoId, tokenAddress, timestamp,
  );

  await handleCirculatingSupply(context, daoId, tokenAddress, timestamp);

  // Transaction record
  await handleTransactionRecord(context, txHash, from, to, timestamp, [from, to], {
    cex: lists.cex,
    dex: lists.dex,
    lending: lists.lending,
    burning: lists.burning,
  });
}

// ============================================================
// DelegateChanged handler
// ============================================================
export async function handleDelegateChanged(
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
  await handleDelegateChangedCore(context, daoId, args);

  // Transaction record for delegation
  await handleTransactionRecord(
    context,
    args.txHash,
    args.delegator,
    args.toDelegate,
    args.timestamp,
    [args.delegator, args.toDelegate],
    {},
  );
}

// ============================================================
// DelegateVotesChanged handler
// ============================================================
export async function handleDelegateVotesChanged(
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
  await handleDelegateVotesChangedCore(context, daoId, args);

  // Update delegated supply
  await handleDelegatedSupply(
    context,
    daoId,
    args.tokenAddress,
    args.newBalance - args.previousBalance,
    args.timestamp,
  );

  // Transaction record
  await handleTransactionRecord(
    context,
    args.txHash,
    args.delegate,
    args.delegate,
    args.timestamp,
    [args.delegate],
    {},
  );
}
