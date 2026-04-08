import { getAddress, type Address } from "viem";
import { type AddressCollection, storeDailyBucket, toAddressSet } from "../shared";
import { type MetricTypesEnum } from "../../lib/constants";

/**
 * Update a supply metric on a pre-fetched token entity.
 * Returns the updated token (or the same one if no change) and whether it changed.
 * DOES NOT re-read Token — caller passes it in and handles the single context.Token.set().
 */
export const applySupplyMetric = (
  token: any,
  supplyField:
    | "lendingSupply"
    | "cexSupply"
    | "dexSupply"
    | "treasury"
    | "nonCirculatingSupply",
  addressList: ReadonlySet<Address>,
  from: Address,
  to: Address,
  value: bigint,
): { changed: boolean; currentSupply: bigint; newSupply: bigint; token: any } => {
  const isToRelevant = addressList.has(getAddress(to));
  const isFromRelevant = addressList.has(getAddress(from));

  if ((isToRelevant || isFromRelevant) && !(isToRelevant && isFromRelevant)) {
    const currentSupply = token[supplyField] as bigint;
    const newSupply = isToRelevant
      ? currentSupply + value
      : currentSupply - value;

    return {
      changed: true,
      currentSupply,
      newSupply,
      token: { ...token, [supplyField]: newSupply },
    };
  }

  return { changed: false, currentSupply: 0n, newSupply: 0n, token };
};

/**
 * Legacy wrapper that reads Token from context. Still used by some callers.
 */
export const updateSupplyMetric = async (
  context: any,
  supplyField:
    | "lendingSupply"
    | "cexSupply"
    | "dexSupply"
    | "treasury"
    | "nonCirculatingSupply",
  addressList: AddressCollection,
  metricType: MetricTypesEnum,
  from: Address,
  to: Address,
  value: bigint,
  daoId: string,
  tokenAddress: Address,
  timestamp: bigint,
) => {
  const normalizedAddressList = toAddressSet(addressList);
  const isToRelevant = normalizedAddressList.has(getAddress(to));
  const isFromRelevant = normalizedAddressList.has(getAddress(from));

  if ((isToRelevant || isFromRelevant) && !(isToRelevant && isFromRelevant)) {
    const tokenId = getAddress(tokenAddress);
    const token = await context.Token.get(tokenId);
    if (!token) return false;

    const currentSupply = token[supplyField];
    const newSupply = isToRelevant
      ? currentSupply + value
      : currentSupply - value;

    context.Token.set({
      ...token,
      [supplyField]: newSupply,
    });

    await storeDailyBucket(
      context,
      metricType,
      currentSupply,
      newSupply,
      daoId,
      timestamp,
      tokenAddress,
    );

    return true;
  }

  return false;
};
