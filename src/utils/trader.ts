import { EXCHANGE, NEG_RISK_EXCHANGE, NEG_RISK_ADAPTER } from "./constants.js";

// Contract addresses to exclude from trader profiles
const EXCLUDED_ADDRESSES = new Set([
  EXCHANGE.toLowerCase(),
  NEG_RISK_EXCHANGE.toLowerCase(),
  NEG_RISK_ADAPTER.toLowerCase(),
]);

export function isExcludedAddress(address: string): boolean {
  return EXCLUDED_ADDRESSES.has(address.toLowerCase());
}

export function getDayKey(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function getOrCreateTraderProfile(
  context: any,
  traderAddress: string,
): Promise<any> {
  const existing = await context.TraderProfile.get(traderAddress);
  if (existing) return existing;
  return {
    id: traderAddress,
    totalTrades: 0n,
    totalVolume: 0n,
    totalMarketsTraded: 0n,
    firstTradeTimestamp: 0n,
    lastTradeTimestamp: 0n,
    totalBuyVolume: 0n,
    totalSellVolume: 0n,
    totalPositionSplits: 0n,
    totalPositionMerges: 0n,
    totalRedemptions: 0n,
    totalFeeRefunds: 0n,
    winCount: 0n,
    lossCount: 0n,
    largestSingleTrade: 0n,
    mostTradedTokenId: "",
    mostTradedConditionId: "",
  };
}

export async function getOrCreateTraderMarketActivity(
  context: any,
  traderAddress: string,
  conditionId: string,
  tokenId: string,
): Promise<any> {
  const id = `${traderAddress}-${conditionId}`;
  const existing = await context.TraderMarketActivity.get(id);
  if (existing) return existing;
  return {
    id,
    traderAddress,
    conditionId,
    tokenId,
    totalBuys: 0n,
    totalSells: 0n,
    totalVolume: 0n,
    avgBuyPrice: 0n,
    avgSellPrice: 0n,
    firstActivityTimestamp: 0n,
    lastActivityTimestamp: 0n,
    netPosition: 0n,
    realizedPnl: 0n,
  };
}

export async function getOrCreateTraderDailyStats(
  context: any,
  traderAddress: string,
  date: string,
): Promise<any> {
  const id = `${traderAddress}-${date}`;
  const existing = await context.TraderDailyStats.get(id);
  if (existing) return existing;
  return {
    id,
    traderAddress,
    date,
    tradesCount: 0n,
    volume: 0n,
    marketsActive: 0n,
    pnl: 0n,
  };
}

export async function getOrCreateGlobalTraderStats(
  context: any,
): Promise<any> {
  const existing = await context.GlobalTraderStats.get("global");
  if (existing) return existing;
  return {
    id: "global",
    totalUniqueTraders: 0n,
    totalTrades: 0n,
    totalVolume: 0n,
    mostActiveTrader: "",
    highestVolumeTrader: "",
  };
}

/**
 * Update trader profile and related entities for an order fill.
 */
export async function updateTraderOnOrderFill(
  context: any,
  traderAddress: string,
  tokenId: string,
  conditionId: string,
  side: string,
  size: bigint,
  price: bigint,
  timestamp: number,
): Promise<void> {
  if (isExcludedAddress(traderAddress)) return;

  const ts = BigInt(timestamp);
  const dayKey = getDayKey(timestamp);

  // 1. Update TraderProfile
  const profile = await getOrCreateTraderProfile(context, traderAddress);
  const isNew = profile.totalTrades === 0n;

  const updatedProfile = {
    ...profile,
    totalTrades: profile.totalTrades + 1n,
    totalVolume: profile.totalVolume + size,
    lastTradeTimestamp: ts,
    largestSingleTrade:
      size > profile.largestSingleTrade ? size : profile.largestSingleTrade,
  };

  if (isNew || profile.firstTradeTimestamp === 0n) {
    updatedProfile.firstTradeTimestamp = ts;
  }

  if (side === "BUY") {
    updatedProfile.totalBuyVolume = profile.totalBuyVolume + size;
  } else {
    updatedProfile.totalSellVolume = profile.totalSellVolume + size;
  }

  // 2. Update TraderMarketActivity
  const activity = await getOrCreateTraderMarketActivity(
    context,
    traderAddress,
    conditionId,
    tokenId,
  );
  const isNewMarket = activity.totalBuys === 0n && activity.totalSells === 0n;

  const updatedActivity = {
    ...activity,
    totalVolume: activity.totalVolume + size,
    lastActivityTimestamp: ts,
    tokenId,
  };

  if (activity.firstActivityTimestamp === 0n) {
    updatedActivity.firstActivityTimestamp = ts;
  }

  if (side === "BUY") {
    updatedActivity.totalBuys = activity.totalBuys + 1n;
    updatedActivity.netPosition = activity.netPosition + size;
    // Weighted average buy price
    const prevBuySum = BigInt(activity.avgBuyPrice) * BigInt(activity.totalBuys);
    const totalBuyVolume = prevBuySum + price;
    updatedActivity.avgBuyPrice =
      updatedActivity.totalBuys > 0n
        ? totalBuyVolume / BigInt(updatedActivity.totalBuys)
        : 0n;
  } else {
    updatedActivity.totalSells = activity.totalSells + 1n;
    updatedActivity.netPosition = activity.netPosition - size;
    // Weighted average sell price
    const prevSellSum = BigInt(activity.avgSellPrice) * BigInt(activity.totalSells);
    const totalSellVolume = prevSellSum + price;
    updatedActivity.avgSellPrice =
      updatedActivity.totalSells > 0n
        ? totalSellVolume / BigInt(updatedActivity.totalSells)
        : 0n;
  }

  context.TraderMarketActivity.set(updatedActivity);

  // Track markets traded count and most traded
  if (isNewMarket) {
    updatedProfile.totalMarketsTraded = profile.totalMarketsTraded + 1n;
  }

  // Update most traded token/condition by checking activity volume
  if (
    updatedActivity.totalVolume > 0n &&
    (profile.mostTradedTokenId === "" ||
      updatedActivity.totalVolume > profile.totalVolume / 2n)
  ) {
    updatedProfile.mostTradedTokenId = tokenId;
    updatedProfile.mostTradedConditionId = conditionId;
  }

  context.TraderProfile.set(updatedProfile);

  // 3. Update TraderDailyStats
  const daily = await getOrCreateTraderDailyStats(
    context,
    traderAddress,
    dayKey,
  );
  const updatedDaily = {
    ...daily,
    tradesCount: daily.tradesCount + 1n,
    volume: daily.volume + size,
  };
  if (isNewMarket) {
    updatedDaily.marketsActive = daily.marketsActive + 1n;
  }
  context.TraderDailyStats.set(updatedDaily);

  // 4. Update GlobalTraderStats
  const global = await getOrCreateGlobalTraderStats(context);
  const updatedGlobal = {
    ...global,
    totalTrades: global.totalTrades + 1n,
    totalVolume: global.totalVolume + size,
  };

  if (isNew) {
    updatedGlobal.totalUniqueTraders = global.totalUniqueTraders + 1n;
  }

  // Update most active / highest volume trader
  if (
    updatedProfile.totalTrades >
    (global.mostActiveTrader === traderAddress
      ? updatedProfile.totalTrades - 1n
      : 0n)
  ) {
    // Simple heuristic: update if this trader is already the most active
    // or if global hasn't been set yet
    if (global.mostActiveTrader === "" || global.mostActiveTrader === traderAddress) {
      updatedGlobal.mostActiveTrader = traderAddress;
    }
  }
  if (global.highestVolumeTrader === "" || global.highestVolumeTrader === traderAddress) {
    updatedGlobal.highestVolumeTrader = traderAddress;
  }

  context.GlobalTraderStats.set(updatedGlobal);
}
