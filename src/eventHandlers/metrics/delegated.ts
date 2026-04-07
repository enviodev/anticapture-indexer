import { getAddress, type Address } from "viem";
import { type DaoIdEnum } from "../../lib/enums";
import { MetricTypesEnum } from "../../lib/constants";
import { storeDailyBucket } from "../shared";

export const updateDelegatedSupply = async (
  context: any,
  daoId: DaoIdEnum,
  tokenId: Address,
  amount: bigint,
  timestamp: bigint,
) => {
  const normalizedTokenId = getAddress(tokenId);
  const token = await context.Token.get(normalizedTokenId);
  if (!token) return;

  const currentDelegatedSupply = token.delegatedSupply;
  const newDelegatedSupply = currentDelegatedSupply + amount;

  context.Token.set({
    ...token,
    delegatedSupply: newDelegatedSupply,
  });

  await storeDailyBucket(
    context,
    MetricTypesEnum.DELEGATED_SUPPLY,
    currentDelegatedSupply,
    newDelegatedSupply,
    daoId,
    timestamp,
    tokenId,
  );
};
