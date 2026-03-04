import { COLLATERAL_SCALE } from "./constants.js";

/**
 * Compute effective price from an order fill.
 * For BUY: maker pays USDC (makerAmountFilled), receives tokens (takerAmountFilled)
 *   price = makerAmountFilled * COLLATERAL_SCALE / takerAmountFilled
 * For SELL: maker gives tokens (makerAmountFilled), receives USDC (takerAmountFilled)
 *   price = takerAmountFilled * COLLATERAL_SCALE / makerAmountFilled
 *
 * Returns price as 6-decimal fixed point (e.g., 500000 = $0.50).
 */
export function computeFillPrice(
  makerAmountFilled: bigint,
  takerAmountFilled: bigint,
  isBuy: boolean,
): bigint {
  if (isBuy) {
    // maker pays USDC, taker gives position tokens
    if (takerAmountFilled === 0n) return 0n;
    return (makerAmountFilled * COLLATERAL_SCALE) / takerAmountFilled;
  } else {
    // maker gives position tokens, taker pays USDC
    if (makerAmountFilled === 0n) return 0n;
    return (takerAmountFilled * COLLATERAL_SCALE) / makerAmountFilled;
  }
}

/**
 * Quantize a price to a bucket for the heatmap.
 * Rounds down to nearest cent (10_000 = $0.01 in 6-decimal).
 */
export function quantizePrice(price: bigint): bigint {
  const bucket = 10_000n; // $0.01
  return (price / bucket) * bucket;
}

/**
 * Compute USDC value of a fill (the collateral side).
 */
export function computeFillUsdcValue(
  makerAmountFilled: bigint,
  takerAmountFilled: bigint,
  isBuy: boolean,
): bigint {
  return isBuy ? makerAmountFilled : takerAmountFilled;
}
