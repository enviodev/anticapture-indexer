import { getAddress, type Address } from "viem";
import { DaoIdEnum } from "./enums";
import {
  CONTRACT_ADDRESSES,
  CEXAddresses,
  DEXAddresses,
  LendingAddresses,
  BurningAddresses,
  TreasuryAddresses,
  NonCirculatingAddresses,
} from "./constants";

export type AddressCollection = readonly Address[] | ReadonlySet<Address>;

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

export type DaoAddressSets = {
  cex: ReadonlySet<Address>;
  dex: ReadonlySet<Address>;
  lending: ReadonlySet<Address>;
  burning: ReadonlySet<Address>;
  treasury: ReadonlySet<Address>;
  nonCirculating: ReadonlySet<Address>;
};

const addressSetCache = new Map<DaoIdEnum, DaoAddressSets>();

export function getAddressSetsForDao(daoId: DaoIdEnum): DaoAddressSets {
  const cached = addressSetCache.get(daoId);
  if (cached) return cached;

  const sets: DaoAddressSets = {
    cex: createAddressSet(Object.values(CEXAddresses[daoId] || {})),
    dex: createAddressSet(Object.values(DEXAddresses[daoId] || {})),
    lending: createAddressSet(Object.values(LendingAddresses[daoId] || {})),
    burning: createAddressSet(Object.values(BurningAddresses[daoId] || {})),
    treasury: createAddressSet(Object.values(TreasuryAddresses[daoId] || {})),
    nonCirculating: createAddressSet(Object.values(NonCirculatingAddresses[daoId] || {})),
  };

  addressSetCache.set(daoId, sets);
  return sets;
}

export type TokenDaoInfo = {
  daoId: DaoIdEnum;
  tokenAddress: string;
  decimals: number;
  blockTime: number;
};

export type GovernorDaoInfo = {
  daoId: DaoIdEnum;
  blockTime: number;
};

// Build lookup maps from CONTRACT_ADDRESSES
const _addressToDao = new Map<string, TokenDaoInfo>();
const _governorToDao = new Map<string, GovernorDaoInfo>();

// Standard DAOs (have token.address and optionally governor.address)
const standardDaos: DaoIdEnum[] = [
  DaoIdEnum.UNI, DaoIdEnum.ENS, DaoIdEnum.ARB, DaoIdEnum.OP,
  DaoIdEnum.GTC, DaoIdEnum.NOUNS, DaoIdEnum.SCR, DaoIdEnum.COMP,
  DaoIdEnum.OBOL, DaoIdEnum.ZK, DaoIdEnum.SHU, DaoIdEnum.FLUID,
  DaoIdEnum.LIL_NOUNS,
];

for (const daoId of standardDaos) {
  const config = CONTRACT_ADDRESSES[daoId];
  const tokenAddr = getAddress(config.token.address);
  _addressToDao.set(tokenAddr, {
    daoId,
    tokenAddress: tokenAddr,
    decimals: config.token.decimals,
    blockTime: config.blockTime,
  });

  if ("governor" in config && config.governor) {
    const govAddr = getAddress((config as any).governor.address);
    _governorToDao.set(govAddr, {
      daoId,
      blockTime: config.blockTime,
    });
  }

  // GTC has a governorAlpha too
  if (daoId === DaoIdEnum.GTC && "governorAlpha" in config) {
    const govAlphaAddr = getAddress((config as any).governorAlpha.address);
    _governorToDao.set(govAlphaAddr, {
      daoId,
      blockTime: config.blockTime,
    });
  }

  // SHU special: azorius and linearVotingStrategy addresses
  if (daoId === DaoIdEnum.SHU) {
    const shuConfig = config as typeof CONTRACT_ADDRESSES[typeof DaoIdEnum.SHU];
    _governorToDao.set(getAddress(shuConfig.azorius.address), { daoId, blockTime: config.blockTime });
    _governorToDao.set(getAddress(shuConfig.linearVotingStrategy.address), { daoId, blockTime: config.blockTime });
  }

  // NOUNS special: auction address
  if (daoId === DaoIdEnum.NOUNS) {
    const nounsConfig = config as typeof CONTRACT_ADDRESSES[typeof DaoIdEnum.NOUNS];
    _governorToDao.set(getAddress(nounsConfig.auction.address), { daoId, blockTime: config.blockTime });
  }
}

// AAVE special: 3 token addresses
const aaveConfig = CONTRACT_ADDRESSES[DaoIdEnum.AAVE];
for (const [key, tokenConfig] of Object.entries({ aave: aaveConfig.aave, stkAAVE: aaveConfig.stkAAVE, aAAVE: aaveConfig.aAAVE })) {
  const addr = getAddress(tokenConfig.address);
  _addressToDao.set(addr, {
    daoId: DaoIdEnum.AAVE,
    tokenAddress: addr,
    decimals: tokenConfig.decimals,
    blockTime: aaveConfig.blockTime,
  });
}

export const ADDRESS_TO_DAO = Object.fromEntries(_addressToDao) as Record<string, TokenDaoInfo>;
export const GOVERNOR_TO_DAO = Object.fromEntries(_governorToDao) as Record<string, GovernorDaoInfo>;
