import { LilNounsToken, LilNounsGovernor } from "generated";
import { getAddress, type Address } from "viem";
import { DaoIdEnum } from "../lib/enums";
import { CONTRACT_ADDRESSES, ProposalStatus } from "../lib/constants";
import { getAddressSetsForDao } from "../lib/dao-router";
import { tokenTransfer } from "../eventHandlers/transfer";
import { delegateChanged, delegatedVotesChanged } from "../eventHandlers/delegation";
import { voteCast, proposalCreated, updateProposalStatus } from "../eventHandlers/voting";
import { updateAllSupplyMetrics } from "../eventHandlers/metrics";
import { updateDelegatedSupply } from "../eventHandlers/metrics/delegated";
import { handleTransaction } from "../eventHandlers/shared";
import { accountBalanceId } from "../lib/id-helpers";

const zeroAddress = "0x0000000000000000000000000000000000000000" as Address;

const daoId = DaoIdEnum.LIL_NOUNS;
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

LilNounsToken.Transfer.handler(async ({ event, context }) => {
  await ensureToken(context);
  const { from, to } = event.params;
  const value = 1n; // NFT transfer, always 1
  const timestamp = BigInt(event.block.timestamp);

  await tokenTransfer(context, daoId, {
    from, to, value, token: tokenAddress,
    transactionHash: event.transaction.hash as `0x${string}`,
    timestamp, logIndex: event.logIndex,
  }, { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });

  await updateAllSupplyMetrics(context, from, to, value, daoId, tokenAddress, timestamp, sets);

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

LilNounsToken.DelegateChanged.handler(async ({ event, context }) => {
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

LilNounsToken.DelegateVotesChanged.handler(async ({ event, context }) => {
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
LilNounsGovernor.VoteCast.handler(async ({ event, context }) => {
  await voteCast(context, daoId, {
    proposalId: event.params.proposalId.toString(), voter: event.params.voter,
    reason: event.params.reason, support: Number(event.params.support),
    timestamp: BigInt(event.block.timestamp), txHash: event.transaction.hash as `0x${string}`,
    votingPower: event.params.votes, logIndex: event.logIndex,
  });
});

LilNounsGovernor.ProposalCreated.handler(async ({ event, context }) => {
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

LilNounsGovernor.ProposalCanceled.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.id.toString(), ProposalStatus.CANCELED);
});

LilNounsGovernor.ProposalExecuted.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.id.toString(), ProposalStatus.EXECUTED);
});

LilNounsGovernor.ProposalQueued.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.id.toString(), ProposalStatus.QUEUED);
});

LilNounsGovernor.ProposalVetoed.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.id.toString(), ProposalStatus.VETOED);
});
