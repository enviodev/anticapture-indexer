import {
  Exchange,
  type Orderbook,
  type OrdersMatchedGlobal,
  type PriceLevel,
  type MarketMicrostructure,
  type OrderbookSnapshot,
} from "generated";
import {
  parseOrderFilled,
  updateUserPositionWithBuy,
  updateUserPositionWithSell,
} from "../utils/pnl.js";
import { COLLATERAL_SCALE, LARGE_ORDER_THRESHOLD } from "../utils/constants.js";
import { computeFillPrice, quantizePrice, computeFillUsdcValue } from "../utils/price.js";

const TRADE_TYPE_BUY = "Buy";
const TRADE_TYPE_SELL = "Sell";
const COLLATERAL_SCALE_DEC = 1_000_000;

function getOrderSide(makerAssetId: bigint): string {
  return makerAssetId === 0n ? TRADE_TYPE_BUY : TRADE_TYPE_SELL;
}

function getOrderSize(
  makerAmountFilled: bigint,
  takerAmountFilled: bigint,
  side: string,
): bigint {
  return side === TRADE_TYPE_BUY ? makerAmountFilled : takerAmountFilled;
}

function scaleBigInt(value: bigint): number {
  return Number(value) / COLLATERAL_SCALE_DEC;
}

async function getOrCreateOrderbook(
  context: any,
  tokenId: string,
): Promise<Orderbook> {
  const existing = await context.Orderbook.get(tokenId);
  if (existing) return existing;
  return {
    id: tokenId,
    tradesQuantity: 0n,
    buysQuantity: 0n,
    sellsQuantity: 0n,
    collateralVolume: 0n,
    scaledCollateralVolume: 0,
    collateralBuyVolume: 0n,
    scaledCollateralBuyVolume: 0,
    collateralSellVolume: 0n,
    scaledCollateralSellVolume: 0,
  };
}

async function getOrCreateGlobal(
  context: any,
): Promise<OrdersMatchedGlobal> {
  const existing = await context.OrdersMatchedGlobal.get("");
  if (existing) return existing;
  return {
    id: "",
    tradesQuantity: 0n,
    buysQuantity: 0n,
    sellsQuantity: 0n,
    collateralVolume: 0,
    scaledCollateralVolume: 0,
    collateralBuyVolume: 0,
    scaledCollateralBuyVolume: 0,
    collateralSellVolume: 0,
    scaledCollateralSellVolume: 0,
  };
}

async function getOrCreatePriceLevel(
  context: any,
  tokenId: string,
  price: bigint,
  side: string,
): Promise<PriceLevel> {
  const sideEnum = side === TRADE_TYPE_BUY ? "BUY" : "SELL";
  const id = `${tokenId}-${sideEnum}-${price.toString()}`;
  const existing = await context.PriceLevel.get(id);
  if (existing) return existing;
  return {
    id,
    tokenId,
    price,
    side: sideEnum,
    volume: 0n,
    fillCount: 0n,
    lastUpdatedTimestamp: 0n,
  };
}

async function getOrCreateMicrostructure(
  context: any,
  tokenId: string,
  conditionId: string,
): Promise<MarketMicrostructure> {
  const existing = await context.MarketMicrostructure.get(tokenId);
  if (existing) return existing;
  return {
    id: tokenId,
    tokenId,
    conditionId,
    totalFills: 0n,
    totalVolume: 0n,
    avgFillSize: 0n,
    makerVolume: 0n,
    takerVolume: 0n,
    lastUpdatedTimestamp: 0n,
  };
}

async function getOrCreateSnapshot(
  context: any,
  tokenId: string,
  conditionId: string,
  timestamp: bigint,
): Promise<OrderbookSnapshot> {
  // Bucket snapshots per 5-minute interval
  const interval = 300n;
  const bucket = (timestamp / interval) * interval;
  const id = `${tokenId}-${bucket.toString()}`;
  const existing = await context.OrderbookSnapshot.get(id);
  if (existing) return existing;
  return {
    id,
    timestamp: bucket,
    tokenId,
    conditionId,
    spread: 0n,
    midPrice: 0n,
    totalBidVolume: 0n,
    totalAskVolume: 0n,
    bestBid: 0n,
    bestAsk: 0n,
    fillCount: 0n,
  };
}

// ============================================================
// OrderFilled — individual order fill records + orderbook updates
// ============================================================

Exchange.OrderFilled.handler(async ({ event, context }) => {
  const makerAssetId = event.params.makerAssetId;
  const takerAssetId = event.params.takerAssetId;
  const side = getOrderSide(makerAssetId);
  const size = getOrderSize(
    event.params.makerAmountFilled,
    event.params.takerAmountFilled,
    side,
  );

  const tokenId =
    side === TRADE_TYPE_BUY ? takerAssetId.toString() : makerAssetId.toString();

  // Record OrderFilledEvent
  const eventId = `${event.transaction.hash}_${event.params.orderHash}`;
  context.OrderFilledEvent.set({
    id: eventId,
    transactionHash: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    orderHash: event.params.orderHash,
    maker: event.params.maker,
    taker: event.params.taker,
    makerAssetId: makerAssetId.toString(),
    takerAssetId: takerAssetId.toString(),
    makerAmountFilled: event.params.makerAmountFilled,
    takerAmountFilled: event.params.takerAmountFilled,
    fee: event.params.fee,
  });

  // Update Orderbook
  const orderbook = await getOrCreateOrderbook(context, tokenId);
  const newVolume = orderbook.collateralVolume + size;

  if (side === TRADE_TYPE_BUY) {
    const newBuyVol = orderbook.collateralBuyVolume + size;
    context.Orderbook.set({
      ...orderbook,
      collateralVolume: newVolume,
      scaledCollateralVolume: scaleBigInt(newVolume),
      tradesQuantity: orderbook.tradesQuantity + 1n,
      buysQuantity: orderbook.buysQuantity + 1n,
      collateralBuyVolume: newBuyVol,
      scaledCollateralBuyVolume: scaleBigInt(newBuyVol),
    });
  } else {
    const newSellVol = orderbook.collateralSellVolume + size;
    context.Orderbook.set({
      ...orderbook,
      collateralVolume: newVolume,
      scaledCollateralVolume: scaleBigInt(newVolume),
      tradesQuantity: orderbook.tradesQuantity + 1n,
      sellsQuantity: orderbook.sellsQuantity + 1n,
      collateralSellVolume: newSellVol,
      scaledCollateralSellVolume: scaleBigInt(newSellVol),
    });
  }

  // PnL: Update user position based on order fill
  const order = parseOrderFilled(event.params);
  const price =
    order.baseAmount > 0n
      ? (order.quoteAmount * COLLATERAL_SCALE) / order.baseAmount
      : 0n;

  if (order.side === "BUY") {
    await updateUserPositionWithBuy(
      context,
      order.account,
      order.positionId,
      price,
      order.baseAmount,
    );
  } else {
    await updateUserPositionWithSell(
      context,
      order.account,
      order.positionId,
      price,
      order.baseAmount,
    );
  }

  // ---- Heatmap / Replay: PriceLevel, LargeOrder, Microstructure, Snapshot ----
  const isBuy = side === TRADE_TYPE_BUY;
  const fillPrice = computeFillPrice(
    event.params.makerAmountFilled,
    event.params.takerAmountFilled,
    isBuy,
  );
  const quantizedPrice = quantizePrice(fillPrice);
  const usdcValue = computeFillUsdcValue(
    event.params.makerAmountFilled,
    event.params.takerAmountFilled,
    isBuy,
  );
  const timestamp = BigInt(event.block.timestamp);

  // Update PriceLevel — cumulative volume at each quantized price
  const priceLevel = await getOrCreatePriceLevel(context, tokenId, quantizedPrice, side);
  context.PriceLevel.set({
    ...priceLevel,
    volume: priceLevel.volume + usdcValue,
    fillCount: priceLevel.fillCount + 1n,
    lastUpdatedTimestamp: timestamp,
  });

  // Detect large orders
  if (usdcValue >= LARGE_ORDER_THRESHOLD) {
    const largeOrderId = `${event.transaction.hash}-${event.params.orderHash}`;
    context.LargeOrder.set({
      id: largeOrderId,
      timestamp,
      tokenId,
      maker: event.params.maker,
      side: isBuy ? "BUY" : "SELL",
      size: usdcValue,
      price: fillPrice,
      txHash: event.transaction.hash,
    });
  }

  // Update MarketMicrostructure
  const marketData = await context.MarketData.get(tokenId);
  const conditionId = marketData ? marketData.condition : "";
  const micro = await getOrCreateMicrostructure(context, tokenId, conditionId);
  const newTotalFills = micro.totalFills + 1n;
  const newTotalVolume = micro.totalVolume + usdcValue;
  const newAvgFillSize = newTotalFills > 0n ? newTotalVolume / newTotalFills : 0n;

  context.MarketMicrostructure.set({
    ...micro,
    totalFills: newTotalFills,
    totalVolume: newTotalVolume,
    avgFillSize: newAvgFillSize,
    makerVolume: isBuy ? micro.makerVolume + usdcValue : micro.makerVolume,
    takerVolume: isBuy ? micro.takerVolume : micro.takerVolume + usdcValue,
    lastUpdatedTimestamp: timestamp,
  });

  // Update OrderbookSnapshot (5-minute buckets)
  const snapshot = await getOrCreateSnapshot(context, tokenId, conditionId, timestamp);
  const newBidVol = isBuy ? snapshot.totalBidVolume + usdcValue : snapshot.totalBidVolume;
  const newAskVol = isBuy ? snapshot.totalAskVolume : snapshot.totalAskVolume + usdcValue;
  const newBestBid = isBuy && fillPrice > snapshot.bestBid ? fillPrice : snapshot.bestBid;
  const newBestAsk = !isBuy && (snapshot.bestAsk === 0n || fillPrice < snapshot.bestAsk) ? fillPrice : snapshot.bestAsk;
  const newMidPrice = newBestBid > 0n && newBestAsk > 0n ? (newBestBid + newBestAsk) / 2n : fillPrice;
  const newSpread = newBestAsk > newBestBid && newBestBid > 0n ? newBestAsk - newBestBid : 0n;

  context.OrderbookSnapshot.set({
    ...snapshot,
    totalBidVolume: newBidVol,
    totalAskVolume: newAskVol,
    bestBid: newBestBid,
    bestAsk: newBestAsk,
    midPrice: newMidPrice,
    spread: newSpread,
    fillCount: snapshot.fillCount + 1n,
  });
});

// ============================================================
// OrdersMatched — batch match records + global volume
// ============================================================

Exchange.OrdersMatched.handler(async ({ event, context }) => {
  // Note: In the original subgraph, amounts are swapped for OrdersMatched
  const makerAmountFilled = event.params.takerAmountFilled;
  const takerAmountFilled = event.params.makerAmountFilled;
  const side = getOrderSide(event.params.makerAssetId);
  const size = getOrderSize(makerAmountFilled, takerAmountFilled, side);

  // Record OrdersMatchedEvent
  context.OrdersMatchedEvent.set({
    id: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    makerAssetID: event.params.makerAssetId,
    takerAssetID: event.params.takerAssetId,
    makerAmountFilled: event.params.makerAmountFilled,
    takerAmountFilled: event.params.takerAmountFilled,
  });

  // Update global volume
  const global = await getOrCreateGlobal(context);
  const sizeNum = Number(size) / COLLATERAL_SCALE_DEC;
  const newVolume = global.collateralVolume + sizeNum;

  if (side === TRADE_TYPE_BUY) {
    const newBuyVol = global.collateralBuyVolume + sizeNum;
    context.OrdersMatchedGlobal.set({
      ...global,
      tradesQuantity: global.tradesQuantity + 1n,
      collateralVolume: newVolume,
      scaledCollateralVolume: newVolume,
      buysQuantity: global.buysQuantity + 1n,
      collateralBuyVolume: newBuyVol,
      scaledCollateralBuyVolume: newBuyVol,
    });
  } else {
    const newSellVol = global.collateralSellVolume + sizeNum;
    context.OrdersMatchedGlobal.set({
      ...global,
      tradesQuantity: global.tradesQuantity + 1n,
      collateralVolume: newVolume,
      scaledCollateralVolume: newVolume,
      sellsQuantity: global.sellsQuantity + 1n,
      collateralSellVolume: newSellVol,
      scaledCollateralSellVolume: newSellVol,
    });
  }
});

// ============================================================
// TokenRegistered — link token IDs to conditions
// ============================================================

Exchange.TokenRegistered.handler(async ({ event, context }) => {
  const token0Str = event.params.token0.toString();
  const token1Str = event.params.token1.toString();
  const condition = event.params.conditionId;

  const data0 = await context.MarketData.get(token0Str);
  if (!data0) {
    context.MarketData.set({
      id: token0Str,
      condition,
      outcomeIndex: undefined,
    });
  }

  const data1 = await context.MarketData.get(token1Str);
  if (!data1) {
    context.MarketData.set({
      id: token1Str,
      condition,
      outcomeIndex: undefined,
    });
  }
});
