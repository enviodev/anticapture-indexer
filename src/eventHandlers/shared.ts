import { getAddress, type Address } from "viem";
import { type MetricTypesEnum } from "../lib/constants";
import { delta, max, min } from "../lib/utils";
import { truncateTimestampToMidnight } from "../lib/date-helpers";
import { daoMetricsDayBucketId } from "../lib/id-helpers";

const zeroAddress = "0x0000000000000000000000000000000000000000";

export type AddressCollection = readonly Address[] | ReadonlySet<Address>;

const normalizeAddressCollection = (
  addresses: AddressCollection,
): Address[] => {
  if (Array.isArray(addresses)) {
    return [...new Set(addresses.map((address) => getAddress(address)))];
  }
  return [...addresses];
};

export const createAddressSet = (
  addresses: readonly Address[],
): ReadonlySet<Address> =>
  new Set(addresses.map((address) => getAddress(address)));

export const toAddressSet = (
  addresses: AddressCollection,
): ReadonlySet<Address> => {
  if (Array.isArray(addresses)) {
    return new Set(addresses.map((address) => getAddress(address)));
  }
  return addresses as ReadonlySet<Address>;
};

export const ensureAccountExists = async (
  context: any,
  address: Address,
): Promise<void> => {
  const id = getAddress(address);
  const existing = await context.Account.get(id);
  if (!existing) {
    context.Account.set({ id });
  }
};

export const ensureAccountsExist = async (
  context: any,
  addresses: Address[],
): Promise<void> => {
  const normalized = normalizeAddressCollection(addresses);
  for (const id of normalized) {
    const existing = await context.Account.get(id);
    if (!existing) {
      context.Account.set({ id });
    }
  }
};

export const storeDailyBucket = async (
  context: any,
  metricType: MetricTypesEnum,
  currentValue: bigint,
  newValue: bigint,
  daoId: string,
  timestamp: bigint,
  tokenAddress: Address,
) => {
  const volume = delta(newValue, currentValue);
  const date = BigInt(truncateTimestampToMidnight(Number(timestamp)));
  const tokenId = getAddress(tokenAddress);
  const id = daoMetricsDayBucketId(date, tokenId, metricType);

  const existing = await context.DaoMetricsDayBucket.get(id);
  if (existing) {
    context.DaoMetricsDayBucket.set({
      ...existing,
      average:
        (existing.average * BigInt(existing.count) + newValue) /
        BigInt(existing.count + 1),
      high: max(newValue, existing.high),
      low: min(newValue, existing.low),
      close: newValue,
      volume: existing.volume + volume,
      count: existing.count + 1,
      lastUpdate: timestamp,
    });
  } else {
    context.DaoMetricsDayBucket.set({
      id,
      date,
      token_id: tokenId,
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
};

export const handleTransaction = async (
  context: any,
  transactionHash: string,
  from: Address,
  to: Address,
  timestamp: bigint,
  addresses: AddressCollection,
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
  } = {
    cex: [],
    dex: [],
    lending: [],
    burning: [],
  },
) => {
  const normalizedAddresses = normalizeAddressCollection(addresses);
  const normalizedCex = toAddressSet(cex);
  const normalizedDex = toAddressSet(dex);
  const normalizedLending = toAddressSet(lending);
  const normalizedBurning = toAddressSet(burning);

  const isCex = normalizedAddresses.some((addr) => normalizedCex.has(addr));
  const isDex = normalizedAddresses.some((addr) => normalizedDex.has(addr));
  const isLending = normalizedAddresses.some((addr) =>
    normalizedLending.has(addr),
  );
  const isTotal = normalizedAddresses.some((addr) =>
    normalizedBurning.has(addr),
  );

  if (!(isCex || isDex || isLending || isTotal)) {
    return;
  }

  const existing = await context.Transaction.get(transactionHash);
  if (existing) {
    context.Transaction.set({
      ...existing,
      isCex: existing.isCex || isCex,
      isDex: existing.isDex || isDex,
      isLending: existing.isLending || isLending,
      isTotal: existing.isTotal || isTotal,
    });
  } else {
    context.Transaction.set({
      id: transactionHash,
      fromAddress: getAddress(from),
      toAddress: getAddress(to),
      timestamp,
      isCex,
      isDex,
      isLending,
      isTotal,
    });
  }
};
