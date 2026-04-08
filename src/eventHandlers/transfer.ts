import { getAddress, type Address, type Hex } from "viem";
import { type DaoIdEnum } from "../lib/enums";
import { accountBalanceId, transferId } from "../lib/id-helpers";
import { type AddressCollection, toAddressSet } from "./shared";

const zeroAddress = "0x0000000000000000000000000000000000000000";

// Toggle flags — comment/uncomment to enable/disable high-volume entities
const WRITE_BALANCE_HISTORY = false; // #1: BalanceHistory — 2 writes per transfer
const WRITE_FEED_EVENTS = false;    // #2: FeedEvent — 1 write per transfer
const WRITE_TRANSFERS = false;      // #3: Transfer entity — 1 read + 1 write per transfer

export const tokenTransfer = async (
  context: any,
  daoId: DaoIdEnum,
  args: {
    from: Address;
    to: Address;
    token: Address;
    transactionHash: Hex;
    value: bigint;
    timestamp: bigint;
    logIndex: number;
  },
  {
    cex = [],
    dex = [],
    lending = [],
    burning = [],
  }: {
    cex?: AddressCollection;
    dex?: AddressCollection;
    lending?: AddressCollection;
    burning?: AddressCollection;
  },
) => {
  const {
    from,
    to,
    token: tokenId,
    transactionHash,
    value,
    timestamp,
    logIndex,
  } = args;

  const normalizedFrom = getAddress(from);
  const normalizedTo = getAddress(to);
  const normalizedTokenId = getAddress(tokenId);

  const isMint = from === zeroAddress;

  // Build all entity IDs upfront
  const receiverAbId = accountBalanceId(normalizedTo, normalizedTokenId);
  const senderAbId = isMint ? null : accountBalanceId(normalizedFrom, normalizedTokenId);

  // === SINGLE concurrent read batch for ALL entities we need ===
  const readPromises: Promise<any>[] = [
    context.Account.get(normalizedFrom),      // [0] sender account
    context.Account.get(normalizedTo),        // [1] receiver account
    context.AccountBalance.get(receiverAbId), // [2] receiver balance
  ];
  if (senderAbId) {
    readPromises.push(context.AccountBalance.get(senderAbId)); // [3] sender balance
  }

  const results = await Promise.all(readPromises);
  const existingSenderAccount = results[0];
  const existingReceiverAccount = results[1];
  const existingReceiverAb = results[2];
  const existingSenderAb = senderAbId ? results[3] : null;

  // === Ensure accounts ===
  if (!existingSenderAccount) {
    context.Account.set({ id: normalizedFrom });
  }
  if (!existingReceiverAccount) {
    context.Account.set({ id: normalizedTo });
  }

  // === Upsert receiver AccountBalance ===
  let currentReceiverBalance: bigint;
  if (existingReceiverAb) {
    currentReceiverBalance = existingReceiverAb.balance + value;
    context.AccountBalance.set({
      ...existingReceiverAb,
      balance: currentReceiverBalance,
    });
  } else {
    currentReceiverBalance = value;
    context.AccountBalance.set({
      id: receiverAbId,
      account_id: normalizedTo,
      token_id: normalizedTokenId,
      balance: value,
      delegate: zeroAddress,
    });
  }

  // === Receiver BalanceHistory ===
  if (WRITE_BALANCE_HISTORY) {
    const { balanceHistoryId } = await import("../lib/id-helpers");
    const receiverBhId = balanceHistoryId(transactionHash, normalizedTo, logIndex);
    context.BalanceHistory.set({
      id: receiverBhId,
      daoId,
      transactionHash,
      account_id: normalizedTo,
      balance: currentReceiverBalance,
      delta: value,
      deltaMod: value > 0n ? value : -value,
      timestamp,
      logIndex,
    });
  }

  // === Sender balance (skip for mints) ===
  if (!isMint && senderAbId) {
    let currentSenderBalance: bigint;
    if (existingSenderAb) {
      currentSenderBalance = existingSenderAb.balance - value;
      context.AccountBalance.set({
        ...existingSenderAb,
        balance: currentSenderBalance,
      });
    } else {
      currentSenderBalance = -value;
      context.AccountBalance.set({
        id: senderAbId,
        account_id: normalizedFrom,
        token_id: normalizedTokenId,
        balance: -value,
        delegate: zeroAddress,
      });
    }

    if (WRITE_BALANCE_HISTORY) {
      const { balanceHistoryId } = await import("../lib/id-helpers");
      const senderBhId = balanceHistoryId(transactionHash, normalizedFrom, logIndex);
      context.BalanceHistory.set({
        id: senderBhId,
        daoId,
        transactionHash,
        account_id: normalizedFrom,
        balance: currentSenderBalance,
        delta: -value,
        deltaMod: value > 0n ? value : -value,
        timestamp,
        logIndex,
      });
    }
  }

  // === Transfer entity ===
  if (WRITE_TRANSFERS) {
    const normalizedCex = toAddressSet(cex);
    const normalizedDex = toAddressSet(dex);
    const normalizedLending = toAddressSet(lending);
    const normalizedBurning = toAddressSet(burning);

    const tId = transferId(transactionHash, normalizedFrom, normalizedTo);
    const existingTransfer = await context.Transfer.get(tId);
    if (existingTransfer) {
      context.Transfer.set({
        ...existingTransfer,
        amount: existingTransfer.amount + value,
      });
    } else {
      context.Transfer.set({
        id: tId,
        transactionHash,
        daoId,
        token_id: normalizedTokenId,
        amount: value,
        fromAccount_id: normalizedFrom,
        toAccount_id: normalizedTo,
        timestamp,
        logIndex,
        isCex:
          normalizedCex.has(normalizedFrom) || normalizedCex.has(normalizedTo),
        isDex:
          normalizedDex.has(normalizedFrom) || normalizedDex.has(normalizedTo),
        isLending:
          normalizedLending.has(normalizedFrom) ||
          normalizedLending.has(normalizedTo),
        isTotal:
          normalizedBurning.has(normalizedFrom) ||
          normalizedBurning.has(normalizedTo),
      });
    }
  }

  // === FeedEvent ===
  if (WRITE_FEED_EVENTS) {
    const { feedEventId } = await import("../lib/id-helpers");
    const feId = feedEventId(transactionHash, logIndex);
    context.FeedEvent.set({
      id: feId,
      type: "TRANSFER",
      value,
      timestamp,
      metadata: {
        from: normalizedFrom,
        to: normalizedTo,
        amount: value.toString(),
      },
    });
  }
};
