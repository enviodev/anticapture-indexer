/**
 * Format a BigInt USDC amount (6 decimals) to a human-readable string.
 */
export function formatUSDC(amount: string | number | bigint): string {
  const num = Number(amount) / 1e6;
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Format a raw BigInt amount with custom decimals.
 */
export function formatAmount(amount: string | number | bigint, decimals = 6): string {
  const num = Number(amount) / Math.pow(10, decimals);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Format a BigDecimal string (already scaled).
 */
export function formatScaledVolume(scaled: string): string {
  const num = parseFloat(scaled);
  if (isNaN(num)) return "$0.00";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

/**
 * Format a unix timestamp.
 */
export function formatTimestamp(ts: string | number): string {
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Relative time (e.g. "2m ago").
 */
export function timeAgo(ts: string | number): string {
  const seconds = Math.floor(Date.now() / 1000 - Number(ts));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Truncate address for display.
 */
export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Truncate hash for display.
 */
export function truncateHash(hash: string): string {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

/**
 * Format a number with commas.
 */
export function formatNumber(n: string | number): string {
  return Number(n).toLocaleString("en-US");
}

/**
 * Format percentage with color indicator.
 */
export function formatPrice(price: string | number): string {
  const num = parseFloat(String(price));
  if (isNaN(num)) return "—";
  return `${(num * 100).toFixed(1)}%`;
}
