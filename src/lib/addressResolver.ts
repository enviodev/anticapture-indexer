import { DaoIdEnum } from "./enums";
import {
  CONTRACT_ADDRESSES,
  CEXAddresses,
  DEXAddresses,
  LendingAddresses,
  BurningAddresses,
  TreasuryAddresses,
} from "./constants";

/**
 * Resolve DAO ID from a token contract address
 */
export function resolveDaoFromTokenAddress(address: string): DaoIdEnum | undefined {
  const normalized = address.toLowerCase();
  for (const [daoId, config] of Object.entries(CONTRACT_ADDRESSES)) {
    if (config.token.address.toLowerCase() === normalized) {
      return daoId as DaoIdEnum;
    }
  }
  return undefined;
}

/**
 * Resolve DAO ID from a governor contract address
 */
export function resolveDaoFromGovernorAddress(address: string): DaoIdEnum | undefined {
  const normalized = address.toLowerCase();
  for (const [daoId, config] of Object.entries(CONTRACT_ADDRESSES)) {
    if (config.governor && config.governor.address.toLowerCase() === normalized) {
      return daoId as DaoIdEnum;
    }
  }
  return undefined;
}

/**
 * Get block time for a specific DAO
 */
export function getBlockTime(daoId: DaoIdEnum): number {
  return CONTRACT_ADDRESSES[daoId].blockTime;
}

/**
 * Get the token address for a specific DAO
 */
export function getTokenAddress(daoId: DaoIdEnum): string {
  return CONTRACT_ADDRESSES[daoId].token.address;
}

/**
 * Get the token decimals for a specific DAO
 */
export function getTokenDecimals(daoId: DaoIdEnum): number {
  return CONTRACT_ADDRESSES[daoId].token.decimals;
}

/**
 * Get normalized address lists for a DAO (for classification flags)
 */
export function getAddressLists(daoId: DaoIdEnum) {
  return {
    cex: Object.values(CEXAddresses[daoId] || {}).map((a) => a.toLowerCase()),
    dex: Object.values(DEXAddresses[daoId] || {}).map((a) => a.toLowerCase()),
    lending: Object.values(LendingAddresses[daoId] || {}).map((a) => a.toLowerCase()),
    burning: Object.values(BurningAddresses[daoId] || {}).map((a) => a.toLowerCase()),
    treasury: Object.values(TreasuryAddresses[daoId] || {}).map((a) => a.toLowerCase()),
  };
}

/**
 * Check if an address is in a list (case-insensitive)
 */
export function addressInList(address: string, list: string[]): boolean {
  return list.includes(address.toLowerCase());
}
