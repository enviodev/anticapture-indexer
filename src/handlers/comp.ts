import { COMPToken, COMPGovernor } from "generated";
import { getAddress, type Address } from "viem";
import { DaoIdEnum } from "../lib/enums";
import { MetricTypesEnum, CONTRACT_ADDRESSES, ProposalStatus } from "../lib/constants";
import { getAddressSetsForDao } from "../lib/dao-router";
import { tokenTransfer } from "../eventHandlers/transfer";
import { delegateChanged, delegatedVotesChanged } from "../eventHandlers/delegation";
import { voteCast, proposalCreated, updateProposalStatus, proposalExtended } from "../eventHandlers/voting";
import { updateSupplyMetric } from "../eventHandlers/metrics/supply";
import { updateTotalSupply } from "../eventHandlers/metrics/total";
import { updateCirculatingSupply } from "../eventHandlers/metrics/circulating";
import { updateDelegatedSupply } from "../eventHandlers/metrics/delegated";
import { handleTransaction } from "../eventHandlers/shared";

const daoId = DaoIdEnum.COMP;
const config = CONTRACT_ADDRESSES[daoId];
const tokenAddress = getAddress(config.token.address) as Address;
const decimals = config.token.decimals;
const blockTime = config.blockTime;
const sets = getAddressSetsForDao(daoId);

const ensureToken = async (context: any) => {
  const token = await context.Token.get(tokenAddress);
  if (!token) {
    context.Token.set({
      id: tokenAddress, name: daoId, decimals,
      totalSupply: 0n, delegatedSupply: 0n, cexSupply: 0n, dexSupply: 0n,
      lendingSupply: 0n, circulatingSupply: 0n, treasury: 0n, nonCirculatingSupply: 0n,
    });
  }
};

COMPToken.Transfer.handler(async ({ event, context }) => {
  await ensureToken(context);
  const { from, to, amount: value } = event.params;
  const timestamp = BigInt(event.block.timestamp);

  await tokenTransfer(context, daoId, {
    from, to, value, token: tokenAddress,
    transactionHash: event.transaction.hash as `0x${string}`,
    timestamp, logIndex: event.logIndex,
  }, { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });

  const lendingChanged = await updateSupplyMetric(context, "lendingSupply", sets.lending, MetricTypesEnum.LENDING_SUPPLY, from, to, value, daoId, tokenAddress, timestamp);
  const cexChanged = await updateSupplyMetric(context, "cexSupply", sets.cex, MetricTypesEnum.CEX_SUPPLY, from, to, value, daoId, tokenAddress, timestamp);
  const dexChanged = await updateSupplyMetric(context, "dexSupply", sets.dex, MetricTypesEnum.DEX_SUPPLY, from, to, value, daoId, tokenAddress, timestamp);
  const treasuryChanged = await updateSupplyMetric(context, "treasury", sets.treasury, MetricTypesEnum.TREASURY, from, to, value, daoId, tokenAddress, timestamp);
  const nonCirculatingChanged = await updateSupplyMetric(context, "nonCirculatingSupply", sets.nonCirculating, MetricTypesEnum.NON_CIRCULATING_SUPPLY, from, to, value, daoId, tokenAddress, timestamp);
  const totalSupplyChanged = await updateTotalSupply(context, sets.burning, MetricTypesEnum.TOTAL_SUPPLY, from, to, value, daoId, tokenAddress, timestamp);

  if (lendingChanged || cexChanged || dexChanged || treasuryChanged || nonCirculatingChanged || totalSupplyChanged) {
    await updateCirculatingSupply(context, daoId, tokenAddress, timestamp);
  }

  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (!txTo) return;
  await handleTransaction(context, event.transaction.hash, txFrom!, txTo, timestamp, [from, to], { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });
});

COMPToken.DelegateChanged.handler(async ({ event, context }) => {
  await delegateChanged(context, daoId, {
    delegator: event.params.delegator, delegate: event.params.toDelegate,
    tokenId: event.srcAddress as Address, previousDelegate: event.params.fromDelegate,
    txHash: event.transaction.hash as `0x${string}`, timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  }, { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });

  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (!txTo) return;
  await handleTransaction(context, event.transaction.hash, txFrom!, txTo, BigInt(event.block.timestamp), [event.params.delegator, event.params.toDelegate]);
});

COMPToken.DelegateVotesChanged.handler(async ({ event, context }) => {
  await delegatedVotesChanged(context, daoId, {
    delegate: event.params.delegate, txHash: event.transaction.hash as `0x${string}`,
    newBalance: event.params.newBalance, oldBalance: event.params.previousBalance,
    timestamp: BigInt(event.block.timestamp), logIndex: event.logIndex,
  });
  await updateDelegatedSupply(context, daoId, event.srcAddress as Address, event.params.newBalance - event.params.previousBalance, BigInt(event.block.timestamp));

  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (!txTo) return;
  await handleTransaction(context, event.transaction.hash, txFrom!, txTo, BigInt(event.block.timestamp), [event.params.delegate]);
});

// Governor handlers
COMPGovernor.VoteCast.handler(async ({ event, context }) => {
  await voteCast(context, daoId, {
    proposalId: event.params.proposalId.toString(), voter: event.params.voter,
    reason: event.params.reason, support: Number(event.params.support),
    timestamp: BigInt(event.block.timestamp), txHash: event.transaction.hash as `0x${string}`,
    votingPower: event.params.weight, logIndex: event.logIndex,
  });
});

COMPGovernor.ProposalCreated.handler(async ({ event, context }) => {
  await proposalCreated(context, daoId, blockTime, {
    proposalId: event.params.proposalId.toString(), proposer: event.params.proposer,
    txHash: event.transaction.hash as `0x${string}`, targets: [...event.params.targets] as `0x${string}`[],
    values: [...event.params.values], signatures: [...event.params.signatures],
    calldatas: [...event.params.calldatas] as `0x${string}`[], startBlock: event.params.voteStart.toString(),
    endBlock: event.params.voteEnd.toString(), description: event.params.description,
    timestamp: BigInt(event.block.timestamp), blockNumber: BigInt(event.block.number),
    logIndex: event.logIndex,
  });
});

COMPGovernor.ProposalExtended.handler(async ({ event, context }) => {
  await proposalExtended(
    context,
    event.params.proposalId.toString(),
    blockTime,
    event.params.extendedDeadline,
    event.transaction.hash as `0x${string}`,
    event.logIndex,
    BigInt(event.block.timestamp),
  );
});

COMPGovernor.ProposalCanceled.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.proposalId.toString(), ProposalStatus.CANCELED);
});

COMPGovernor.ProposalExecuted.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.proposalId.toString(), ProposalStatus.EXECUTED);
});

COMPGovernor.ProposalQueued.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.proposalId.toString(), ProposalStatus.QUEUED);
});
