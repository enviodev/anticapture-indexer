import { NounsToken, NounsGovernor, NounsAuction } from "generated";
import { getAddress, type Address } from "viem";
import { DaoIdEnum } from "../lib/enums";
import { MetricTypesEnum, CONTRACT_ADDRESSES, ProposalStatus } from "../lib/constants";
import { getAddressSetsForDao } from "../lib/dao-router";
import { tokenTransfer } from "../eventHandlers/transfer";
import { delegateChanged, delegatedVotesChanged } from "../eventHandlers/delegation";
import { voteCast, proposalCreated, updateProposalStatus } from "../eventHandlers/voting";
import { updateTotalSupply } from "../eventHandlers/metrics/total";
import { updateCirculatingSupply } from "../eventHandlers/metrics/circulating";
import { updateDelegatedSupply } from "../eventHandlers/metrics/delegated";
import { updateSupplyMetric } from "../eventHandlers/metrics/supply";
import { handleTransaction } from "../eventHandlers/shared";
import { accountBalanceId, feedEventId } from "../lib/id-helpers";

const zeroAddress = "0x0000000000000000000000000000000000000000" as Address;

const daoId = DaoIdEnum.NOUNS;
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

NounsToken.Transfer.handler(async ({ event, context }) => {
  await ensureToken(context);
  const { from, to } = event.params;
  const value = 1n; // NFT transfer, always 1
  const timestamp = BigInt(event.block.timestamp);

  await tokenTransfer(context, daoId, {
    from, to, value, token: tokenAddress,
    transactionHash: event.transaction.hash as `0x${string}`,
    timestamp, logIndex: event.logIndex,
  }, { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });

  const treasuryChanged = await updateSupplyMetric(context, "treasury", sets.treasury, MetricTypesEnum.TREASURY, from, to, value, daoId, tokenAddress, timestamp);
  const nonCirculatingChanged = await updateSupplyMetric(context, "nonCirculatingSupply", sets.nonCirculating, MetricTypesEnum.NON_CIRCULATING_SUPPLY, from, to, value, daoId, tokenAddress, timestamp);
  const totalSupplyChanged = await updateTotalSupply(context, sets.burning, MetricTypesEnum.TOTAL_SUPPLY, from, to, value, daoId, tokenAddress, timestamp);

  if (treasuryChanged || nonCirculatingChanged || totalSupplyChanged) {
    await updateCirculatingSupply(context, daoId, tokenAddress, timestamp);
  }

  // Auto self-delegate: if receiver has no delegate, self-delegate
  const normalizedTo = getAddress(to);
  if (normalizedTo !== zeroAddress) {
    const abId = accountBalanceId(normalizedTo, tokenAddress);
    const ab = await context.AccountBalance.get(abId);
    if (ab && ab.delegate === zeroAddress) {
      await delegateChanged(context, daoId, {
        delegator: to, delegate: to,
        tokenId: tokenAddress, previousDelegate: zeroAddress,
        txHash: event.transaction.hash as `0x${string}`, timestamp,
        logIndex: event.logIndex,
      });
    }
  }

  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (!txTo) return;
  await handleTransaction(context, event.transaction.hash, txFrom!, txTo, timestamp, [from, to], { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });
});

NounsToken.DelegateChanged.handler(async ({ event, context }) => {
  await delegateChanged(context, daoId, {
    delegator: event.params.delegator, delegate: event.params.toDelegate,
    tokenId: event.srcAddress as Address, previousDelegate: event.params.fromDelegate,
    txHash: event.transaction.hash as `0x${string}`, timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  });

  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (!txTo) return;
  await handleTransaction(context, event.transaction.hash, txFrom!, txTo, BigInt(event.block.timestamp), [event.params.delegator, event.params.toDelegate]);
});

NounsToken.DelegateVotesChanged.handler(async ({ event, context }) => {
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
NounsGovernor.VoteCast.handler(async ({ event, context }) => {
  await voteCast(context, daoId, {
    proposalId: event.params.proposalId.toString(), voter: event.params.voter,
    reason: event.params.reason, support: Number(event.params.support),
    timestamp: BigInt(event.block.timestamp), txHash: event.transaction.hash as `0x${string}`,
    votingPower: event.params.votes, logIndex: event.logIndex,
  });
});

NounsGovernor.ProposalCreated.handler(async ({ event, context }) => {
  await proposalCreated(context, daoId, blockTime, {
    proposalId: event.params.id.toString(), proposer: event.params.proposer,
    txHash: event.transaction.hash as `0x${string}`, targets: [...event.params.targets] as `0x${string}`[],
    values: [...event.params.values], signatures: [...event.params.signatures],
    calldatas: [...event.params.calldatas] as `0x${string}`[], startBlock: event.params.startBlock.toString(),
    endBlock: event.params.endBlock.toString(), description: event.params.description,
    timestamp: BigInt(event.block.timestamp), blockNumber: BigInt(event.block.number),
    logIndex: event.logIndex,
  });
});

NounsGovernor.ProposalCanceled.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.id.toString(), ProposalStatus.CANCELED);
});

NounsGovernor.ProposalExecuted.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.id.toString(), ProposalStatus.EXECUTED);
});

NounsGovernor.ProposalQueued.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.id.toString(), ProposalStatus.QUEUED);
});

NounsGovernor.ProposalVetoed.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.id.toString(), ProposalStatus.VETOED);
});

// Auction handler
NounsAuction.AuctionSettled.handler(async ({ event, context }) => {
  const tokenPriceId = `${daoId}-${event.params.nounId.toString()}`;
  context.TokenPrice.set({
    id: tokenPriceId,
    price: event.params.amount,
    timestamp: BigInt(event.block.timestamp),
  });
});
