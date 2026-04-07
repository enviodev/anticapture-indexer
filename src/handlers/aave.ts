import { AaveToken, StkAave, AAave, AaveV3 } from "generated";
import { getAddress, type Address } from "viem";
import { DaoIdEnum } from "../lib/enums";
import { CONTRACT_ADDRESSES } from "../lib/constants";
import { getAddressSetsForDao } from "../lib/dao-router";
import { aaveSetup, aaveTransfer, aaveDelegateChanged, type AaveAddressSets } from "../eventHandlers/aave-shared";

const daoId = DaoIdEnum.AAVE;
const aaveConfig = CONTRACT_ADDRESSES[daoId];
const sets = getAddressSetsForDao(daoId);

const aaveAddressSets: AaveAddressSets = {
  cex: sets.cex, dex: sets.dex, lending: sets.lending,
  treasury: sets.treasury, nonCirculating: sets.nonCirculating, burning: sets.burning,
};

// AAVE Token
const aaveAddr = getAddress(aaveConfig.aave.address) as Address;
AaveToken.Transfer.handler(async ({ event, context }) => {
  await aaveSetup(context, aaveAddr, daoId, aaveConfig.aave.decimals);
  await aaveTransfer(context, {
    from: event.params.from, to: event.params.to, value: event.params.value,
    transactionHash: event.transaction.hash as `0x${string}`, timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  }, aaveAddr, daoId, aaveAddressSets);
});

// stkAAVE Token
const stkAaveAddr = getAddress(aaveConfig.stkAAVE.address) as Address;
StkAave.Transfer.handler(async ({ event, context }) => {
  await aaveSetup(context, stkAaveAddr, daoId, aaveConfig.stkAAVE.decimals);
  await aaveTransfer(context, {
    from: event.params.from, to: event.params.to, value: event.params.value,
    transactionHash: event.transaction.hash as `0x${string}`, timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  }, stkAaveAddr, daoId, aaveAddressSets);
});

// aAAVE Token
const aAaveAddr = getAddress(aaveConfig.aAAVE.address) as Address;
AAave.Transfer.handler(async ({ event, context }) => {
  await aaveSetup(context, aAaveAddr, daoId, aaveConfig.aAAVE.decimals);
  await aaveTransfer(context, {
    from: event.params.from, to: event.params.to, value: event.params.value,
    transactionHash: event.transaction.hash as `0x${string}`, timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  }, aAaveAddr, daoId, aaveAddressSets);
});

// AaveV3 DelegateChanged (fired for all 3 token addresses)
AaveV3.DelegateChanged.handler(async ({ event, context }) => {
  const tokenAddress = event.srcAddress as Address;
  await aaveDelegateChanged(context, {
    delegationType: Number(event.params.delegationType),
    delegator: event.params.delegator, delegatee: event.params.delegatee,
    transactionHash: event.transaction.hash as `0x${string}`, timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  }, tokenAddress, daoId);
});
