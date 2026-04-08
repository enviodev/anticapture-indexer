import { getAddress, type Address } from "viem";
import { MetricTypesEnum } from "../../lib/constants";
import { type DaoIdEnum } from "../../lib/enums";
import { type DaoAddressSets } from "../../lib/dao-router";
import { storeDailyBucket } from "../shared";
import { applySupplyMetric } from "./supply";

/**
 * Batched supply metric update — reads Token ONCE, applies all 6 metrics,
 * writes Token ONCE, then writes DaoMetricsDayBuckets for any that changed.
 * Reduces Token reads from 7 (per transfer) to 1.
 */
export const updateAllSupplyMetrics = async (
  context: any,
  from: Address,
  to: Address,
  value: bigint,
  daoId: DaoIdEnum,
  tokenAddress: Address,
  timestamp: bigint,
  sets: DaoAddressSets,
) => {
  const tokenId = getAddress(tokenAddress);

  // Check if ANY address set is relevant BEFORE reading Token
  const normalizedFrom = getAddress(from);
  const normalizedTo = getAddress(to);

  const isLendingRelevant =
    sets.lending.has(normalizedFrom) || sets.lending.has(normalizedTo);
  const isCexRelevant =
    sets.cex.has(normalizedFrom) || sets.cex.has(normalizedTo);
  const isDexRelevant =
    sets.dex.has(normalizedFrom) || sets.dex.has(normalizedTo);
  const isTreasuryRelevant =
    sets.treasury.has(normalizedFrom) || sets.treasury.has(normalizedTo);
  const isNonCircRelevant =
    sets.nonCirculating.has(normalizedFrom) || sets.nonCirculating.has(normalizedTo);
  const isBurningRelevant =
    sets.burning.has(normalizedFrom) || sets.burning.has(normalizedTo);

  const anyRelevant =
    isLendingRelevant ||
    isCexRelevant ||
    isDexRelevant ||
    isTreasuryRelevant ||
    isNonCircRelevant ||
    isBurningRelevant;

  // === FAST PATH: ~95% of transfers hit no classified address — skip entirely ===
  if (!anyRelevant) {
    return;
  }

  // === SLOW PATH: at least one supply metric needs updating ===
  const token = await context.Token.get(tokenId);
  if (!token) return;

  let currentToken = token;
  const bucketWrites: Array<{
    metricType: MetricTypesEnum;
    currentSupply: bigint;
    newSupply: bigint;
  }> = [];

  // Apply each metric in-memory on the same token object (no DB reads)
  if (isLendingRelevant) {
    const r = applySupplyMetric(currentToken, "lendingSupply", sets.lending, from, to, value);
    if (r.changed) {
      currentToken = r.token;
      bucketWrites.push({ metricType: MetricTypesEnum.LENDING_SUPPLY, currentSupply: r.currentSupply, newSupply: r.newSupply });
    }
  }

  if (isCexRelevant) {
    const r = applySupplyMetric(currentToken, "cexSupply", sets.cex, from, to, value);
    if (r.changed) {
      currentToken = r.token;
      bucketWrites.push({ metricType: MetricTypesEnum.CEX_SUPPLY, currentSupply: r.currentSupply, newSupply: r.newSupply });
    }
  }

  if (isDexRelevant) {
    const r = applySupplyMetric(currentToken, "dexSupply", sets.dex, from, to, value);
    if (r.changed) {
      currentToken = r.token;
      bucketWrites.push({ metricType: MetricTypesEnum.DEX_SUPPLY, currentSupply: r.currentSupply, newSupply: r.newSupply });
    }
  }

  if (isTreasuryRelevant) {
    const r = applySupplyMetric(currentToken, "treasury", sets.treasury, from, to, value);
    if (r.changed) {
      currentToken = r.token;
      bucketWrites.push({ metricType: MetricTypesEnum.TREASURY, currentSupply: r.currentSupply, newSupply: r.newSupply });
    }
  }

  if (isNonCircRelevant) {
    const r = applySupplyMetric(currentToken, "nonCirculatingSupply", sets.nonCirculating, from, to, value);
    if (r.changed) {
      currentToken = r.token;
      bucketWrites.push({ metricType: MetricTypesEnum.NON_CIRCULATING_SUPPLY, currentSupply: r.currentSupply, newSupply: r.newSupply });
    }
  }

  // Total supply (burning addresses)
  if (isBurningRelevant) {
    const isToBurning = sets.burning.has(normalizedTo);
    const isFromBurning = sets.burning.has(normalizedFrom);
    if ((isToBurning || isFromBurning) && !(isToBurning && isFromBurning)) {
      const currentTotalSupply = currentToken.totalSupply as bigint;
      const newTotalSupply = isToBurning
        ? currentTotalSupply - value
        : currentTotalSupply + value;
      currentToken = { ...currentToken, totalSupply: newTotalSupply };
      bucketWrites.push({ metricType: MetricTypesEnum.TOTAL_SUPPLY, currentSupply: currentTotalSupply, newSupply: newTotalSupply });
    }
  }

  // Circulating supply derived update
  if (bucketWrites.length > 0) {
    const currentCirculating = token.circulatingSupply as bigint;
    const newCirculating =
      (currentToken.totalSupply as bigint) -
      (currentToken.treasury as bigint) -
      (currentToken.nonCirculatingSupply as bigint);

    if (currentCirculating !== newCirculating) {
      currentToken = { ...currentToken, circulatingSupply: newCirculating };
      bucketWrites.push({
        metricType: MetricTypesEnum.CIRCULATING_SUPPLY,
        currentSupply: currentCirculating,
        newSupply: newCirculating,
      });
    }

    // === SINGLE Token.set() for ALL supply changes ===
    context.Token.set(currentToken);

    // Write all day buckets
    for (const bw of bucketWrites) {
      await storeDailyBucket(
        context,
        bw.metricType,
        bw.currentSupply,
        bw.newSupply,
        daoId,
        timestamp,
        tokenAddress,
      );
    }
  }
};
