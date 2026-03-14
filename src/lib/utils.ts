/**
 * Calculates the absolute difference between two numbers
 */
export function delta(a: bigint, b: bigint): bigint {
  return a > b ? a - b : b - a;
}

/**
 * Returns the minimum of two or more numbers
 */
export function min(...values: bigint[]): bigint {
  if (values.length === 0) {
    throw new Error("At least one value must be provided");
  }
  return values.reduce((min, value) => (value < min ? value : min));
}

/**
 * Returns the maximum of two or more numbers
 */
export function max(...values: bigint[]): bigint {
  if (values.length === 0) {
    throw new Error("At least one value must be provided");
  }
  return values.reduce((max, value) => (value > max ? value : max));
}

export function truncateTimestampToMidnight(timestampSec: number): number {
  return Math.floor(timestampSec / (24 * 60 * 60)) * (24 * 60 * 60);
}

export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}
