import { getAddress, type Address, type Hex } from "viem";
import { type DaoIdEnum } from "../lib/enums";
import { accountBalanceId, balanceHistoryId, transferId, feedEventId } from "../lib/id-helpers";
import { type AddressCollection, ensureAccountsExist, toAddressSet } from "./shared";

const zeroAddress = "0x0000000000000000000000000000000000000000";

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

  await ensureAccountsExist(context, [from, to]);

  // Upsert receiver AccountBalance
  const receiverAbId = accountBalanceId(normalizedTo, normalizedTokenId);
  const existingReceiverAb = await context.AccountBalance.get(receiverAbId);
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

  // Insert receiver BalanceHistory (no conflict)
  const receiverBhId = balanceHistoryId(transactionHash, normalizedTo, logIndex);
  const existingReceiverBh = await context.BalanceHistory.get(receiverBhId);
  if (!existingReceiverBh) {
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

  // Update sender (skip if minting from zero address)
  if (from !== zeroAddress) {
    const senderAbId = accountBalanceId(normalizedFrom, normalizedTokenId);
    const existingSenderAb = await context.AccountBalance.get(senderAbId);
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

    const senderBhId = balanceHistoryId(transactionHash, normalizedFrom, logIndex);
    const existingSenderBh = await context.BalanceHistory.get(senderBhId);
    if (!existingSenderBh) {
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

  // Upsert Transfer
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

  // Insert feed event
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
};
