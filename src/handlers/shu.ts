import { SHUToken, Azorius, LinearVotingStrategy } from "generated";
import { getAddress, type Address } from "viem";
import { DaoIdEnum } from "../lib/enums";
import { CONTRACT_ADDRESSES, ProposalStatus } from "../lib/constants";
import { getAddressSetsForDao } from "../lib/dao-router";
import { tokenTransfer } from "../eventHandlers/transfer";
import { delegateChanged, delegatedVotesChanged } from "../eventHandlers/delegation";
import { voteCast, updateProposalStatus } from "../eventHandlers/voting";
import { updateAllSupplyMetrics } from "../eventHandlers/metrics";
import { updateDelegatedSupply } from "../eventHandlers/metrics/delegated";
import { handleTransaction, ensureAccountExists } from "../eventHandlers/shared";
import { feedEventId } from "../lib/id-helpers";

const daoId = DaoIdEnum.SHU;
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

SHUToken.Transfer.handler(async ({ event, context }) => {
  await ensureToken(context);
  const { from, to, value } = event.params;
  const timestamp = BigInt(event.block.timestamp);

  await tokenTransfer(context, daoId, {
    from, to, value, token: tokenAddress,
    transactionHash: event.transaction.hash as `0x${string}`,
    timestamp, logIndex: event.logIndex,
  }, { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });

  await updateAllSupplyMetrics(context, from, to, value, daoId, tokenAddress, timestamp, sets);

  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (!txTo) return;
  await handleTransaction(context, event.transaction.hash, txFrom!, txTo, timestamp, [from, to], { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });
});

SHUToken.DelegateChanged.handler(async ({ event, context }) => {
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

SHUToken.DelegateVotesChanged.handler(async ({ event, context }) => {
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

// LinearVotingStrategy.ProposalInitialized fires BEFORE Azorius.ProposalCreated
// Upsert a partial proposal row with endBlock/endTimestamp
LinearVotingStrategy.ProposalInitialized.handler(async ({ event, context }) => {
  const proposalId = event.params.proposalId.toString();
  const votingEndBlock = Number(event.params.votingEndBlock);
  const blockDelta = votingEndBlock - event.block.number;
  const endTimestamp = BigInt(event.block.timestamp) + BigInt(blockDelta * blockTime);

  const existing = await context.ProposalsOnchain.get(proposalId);
  if (existing) {
    context.ProposalsOnchain.set({
      ...existing,
      endBlock: votingEndBlock,
      endTimestamp,
    });
  } else {
    context.ProposalsOnchain.set({
      id: proposalId,
      txHash: event.transaction.hash as `0x${string}`,
      daoId,
      proposer_id: getAddress(event.transaction.from!),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: event.block.number,
      endBlock: votingEndBlock,
      title: "",
      description: "",
      timestamp: BigInt(event.block.timestamp),
      logIndex: event.logIndex,
      status: ProposalStatus.PENDING,
      endTimestamp,
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });
  }
});

// LinearVotingStrategy.Voted
LinearVotingStrategy.Voted.handler(async ({ event, context }) => {
  await voteCast(context, daoId, {
    proposalId: event.params.proposalId.toString(), voter: event.params.voter,
    reason: "", support: Number(event.params.voteType),
    timestamp: BigInt(event.block.timestamp), txHash: event.transaction.hash as `0x${string}`,
    votingPower: event.params.weight, logIndex: event.logIndex,
  });
});

// Azorius.ProposalCreated - parse metadata JSON for title/description
Azorius.ProposalCreated.handler(async ({ event, context }) => {
  const proposalId = event.params.proposalId.toString();
  const proposer = event.params.proposer;
  const metadata = event.params.metadata;
  const transactions = event.params.transactions;

  await ensureAccountExists(context, proposer);

  let title = "";
  let description = metadata;
  try {
    const parsed = JSON.parse(metadata);
    title = parsed.title || "";
    description = parsed.description || metadata;
  } catch {
    // metadata is not JSON, use as description
  }

  const targets = transactions.map((t: any) => getAddress(t.to));
  const values = transactions.map((t: any) => t.value.toString());
  const calldatas = transactions.map((t: any) => t.data);

  // Upsert: ProposalInitialized may have already created a partial row
  const existing = await context.ProposalsOnchain.get(proposalId);
  const normalizedProposer = getAddress(proposer);

  if (existing) {
    context.ProposalsOnchain.set({
      ...existing,
      proposer_id: normalizedProposer,
      targets,
      values,
      calldatas,
      title,
      description,
      timestamp: BigInt(event.block.timestamp),
      logIndex: event.logIndex,
    });
  } else {
    context.ProposalsOnchain.set({
      id: proposalId,
      txHash: event.transaction.hash as `0x${string}`,
      daoId,
      proposer_id: normalizedProposer,
      targets,
      values,
      signatures: [],
      calldatas,
      startBlock: event.block.number,
      endBlock: 0,
      title,
      description,
      timestamp: BigInt(event.block.timestamp),
      logIndex: event.logIndex,
      status: ProposalStatus.PENDING,
      endTimestamp: 0n,
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });
  }

  // Update proposer's proposal count
  const existingPower = await context.AccountPower.get(normalizedProposer);
  if (existingPower) {
    context.AccountPower.set({
      ...existingPower,
      proposalsCount: existingPower.proposalsCount + 1,
    });
  } else {
    context.AccountPower.set({
      id: normalizedProposer,
      account_id: normalizedProposer,
      daoId,
      votingPower: 0n,
      votesCount: 0,
      proposalsCount: 1,
      delegationsCount: 0,
      lastVoteTimestamp: 0n,
    });
  }

  // Feed event
  const feId = feedEventId(event.transaction.hash as `0x${string}`, event.logIndex);
  context.FeedEvent.set({
    id: feId,
    type: "PROPOSAL",
    value: 0n,
    timestamp: BigInt(event.block.timestamp),
    metadata: {
      id: proposalId,
      proposer: normalizedProposer,
      title,
    },
  });
});

Azorius.AzoriusProposalExecuted.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.proposalId.toString(), ProposalStatus.EXECUTED);
});
