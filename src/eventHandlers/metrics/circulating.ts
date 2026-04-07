import { getAddress, type Address } from "viem";
import { MetricTypesEnum } from "../../lib/constants";
import { storeDailyBucket } from "../shared";

export const updateCirculatingSupply = async (
  context: any,
  daoId: string,
  tokenAddress: Address,
  timestamp: bigint,
) => {
  const tokenId = getAddress(tokenAddress);
  const token = await context.Token.get(tokenId);
  if (!token) return false;

  const currentCirculatingSupply = token.circulatingSupply as bigint;
  const newCirculatingSupply =
    (token.totalSupply as bigint) - (token.treasury as bigint) - (token.nonCirculatingSupply as bigint);

  if (currentCirculatingSupply === newCirculatingSupply) {
    return false;
  }

  context.Token.set({
    ...token,
    circulatingSupply: newCirculatingSupply,
  });

  await storeDailyBucket(
    context,
    MetricTypesEnum.CIRCULATING_SUPPLY,
    currentCirculatingSupply,
    newCirculatingSupply,
    daoId,
    timestamp,
    tokenAddress,
  );

  return true;
};
