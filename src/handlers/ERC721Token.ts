import { ERC721Token } from "generated";
import { DaoIdEnum } from "../lib/enums";
import { ZERO_ADDRESS, MetricTypesEnum, BurningAddresses, TreasuryAddresses } from "../lib/constants";
import { getTokenAddress } from "../lib/addressResolver";
import {
  handleDelegateChangedCore,
  handleDelegateVotesChangedCore,
  handleTransferCore,
  handleSupplyMetric,
  handleTotalSupply,
  handleCirculatingSupply,
  handleDelegatedSupply,
  handleTransactionRecord,
} from "./shared/helpers";

// ============================================================
// Nouns ERC721 Transfer
// ============================================================
ERC721Token.Transfer.handler(async ({ event, context }) => {
  const daoId = DaoIdEnum.NOUNS;
  const tokenAddress = getTokenAddress(daoId);
  const from = event.params.from;
  const to = event.params.to;
  const timestamp = BigInt(event.block.timestamp);
  const txHash = event.transaction.hash;
  const logIndex = event.logIndex;

  // Auto-self-delegate for Nouns when no explicit delegate is set
  const balanceId = `${to.toLowerCase()}-${tokenAddress.toLowerCase()}`;
  const toBal = await context.AccountBalance.get(balanceId);

  if (toBal && toBal.delegate === ZERO_ADDRESS) {
    await handleDelegateChangedCore(context, daoId, {
      delegator: to,
      toDelegate: to,
      fromDelegate: ZERO_ADDRESS,
      tokenAddress,
      txHash,
      timestamp,
      logIndex,
    });
  }

  // Nouns transfer always has value=1
  await handleTransferCore(context, daoId, {
    from,
    to,
    value: 1n,
    tokenAddress,
    txHash,
    timestamp,
    logIndex,
  });

  // Treasury tracking
  const treasuryAddresses = Object.values(TreasuryAddresses[daoId]).map((a) => a.toLowerCase());
  const timelock = TreasuryAddresses[daoId].timelock;
  if (timelock) {
    const isFromTimelock = from.toLowerCase() === timelock.toLowerCase();
    const isToTimelock = to.toLowerCase() === timelock.toLowerCase();

    if (isFromTimelock || isToTimelock) {
      await handleSupplyMetric(
        context,
        "treasury",
        treasuryAddresses,
        MetricTypesEnum.TREASURY,
        ZERO_ADDRESS,
        timelock,
        isFromTimelock ? -1n : 1n,
        daoId,
        tokenAddress,
        timestamp,
      );
      await handleCirculatingSupply(context, daoId, tokenAddress, timestamp);
    }
  }

  // If this is a mint (from === 0x0), handle total supply + delegated supply
  // This replaces the NounCreated handler since every mint triggers a Transfer from 0x0
  if (from.toLowerCase() === ZERO_ADDRESS) {
    const burningAddressList = Object.values(BurningAddresses[daoId]).map((a) => a.toLowerCase());
    const timelock = TreasuryAddresses[daoId].timelock!;

    await handleTotalSupply(
      context,
      burningAddressList,
      MetricTypesEnum.TOTAL_SUPPLY,
      ZERO_ADDRESS,
      timelock,
      1n,
      daoId,
      tokenAddress,
      timestamp,
    );

    await handleDelegatedSupply(context, daoId, tokenAddress, 1n, timestamp);
  }

  // Transaction record
  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (txTo && txFrom) {
    await handleTransactionRecord(context, txHash, txFrom, txTo, timestamp, [from, to], {});
  }
});

// ============================================================
// DelegateChanged
// ============================================================
ERC721Token.DelegateChanged.handler(async ({ event, context }) => {
  const daoId = DaoIdEnum.NOUNS;

  await handleDelegateChangedCore(context, daoId, {
    delegator: event.params.delegator,
    toDelegate: event.params.toDelegate,
    fromDelegate: event.params.fromDelegate,
    tokenAddress: event.srcAddress,
    txHash: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  });
});

// ============================================================
// DelegateVotesChanged
// ============================================================
ERC721Token.DelegateVotesChanged.handler(async ({ event, context }) => {
  const daoId = DaoIdEnum.NOUNS;

  await handleDelegateVotesChangedCore(context, daoId, {
    delegate: event.params.delegate,
    previousBalance: event.params.previousBalance,
    newBalance: event.params.newBalance,
    tokenAddress: event.srcAddress,
    txHash: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  });
});
