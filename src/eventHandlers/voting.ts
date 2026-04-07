import { getAddress, type Address, type Hex } from "viem";
import { ProposalStatus } from "../lib/constants";
import { votesOnchainId, feedEventId } from "../lib/id-helpers";
import { ensureAccountExists } from "./shared";

const MAX_TITLE_LENGTH = 200;

function parseProposalTitle(description: string): string {
  const normalized = description.replace(/\\n/g, "\n");
  const lines = normalized.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^# /.test(trimmed)) {
      return trimmed.replace(/^# +/, "");
    }
    break;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || /^#{1,6}\s/.test(trimmed)) continue;
    return trimmed.length > MAX_TITLE_LENGTH
      ? trimmed.substring(0, MAX_TITLE_LENGTH) + "..."
      : trimmed;
  }

  return "";
}

export const voteCast = async (
  context: any,
  daoId: string,
  args: {
    proposalId: string;
    voter: Address;
    reason: string;
    support: number;
    timestamp: bigint;
    txHash: Hex;
    votingPower: bigint;
    logIndex: number;
  },
) => {
  const {
    voter,
    timestamp,
    txHash,
    proposalId,
    support,
    votingPower,
    reason,
    logIndex,
  } = args;

  await ensureAccountExists(context, voter);

  const normalizedVoter = getAddress(voter);

  // Upsert account power
  const existingPower = await context.AccountPower.get(normalizedVoter);
  if (existingPower) {
    context.AccountPower.set({
      ...existingPower,
      votesCount: existingPower.votesCount + 1,
      lastVoteTimestamp: timestamp,
    });
  } else {
    context.AccountPower.set({
      id: normalizedVoter,
      account_id: normalizedVoter,
      daoId,
      votingPower: 0n,
      votesCount: 1,
      proposalsCount: 0,
      delegationsCount: 0,
      lastVoteTimestamp: timestamp,
    });
  }

  // Create vote record
  const vId = votesOnchainId(normalizedVoter, proposalId);
  context.VotesOnchain.set({
    id: vId,
    txHash,
    daoId,
    proposal_id: proposalId,
    voter_id: normalizedVoter,
    support: support.toString(),
    votingPower,
    reason,
    timestamp,
  });

  // Update proposal vote totals
  const proposal = await context.ProposalsOnchain.get(proposalId);
  if (proposal) {
    context.ProposalsOnchain.set({
      ...proposal,
      againstVotes: proposal.againstVotes + (support === 0 ? votingPower : 0n),
      forVotes: proposal.forVotes + (support === 1 ? votingPower : 0n),
      abstainVotes: proposal.abstainVotes + (support === 2 ? votingPower : 0n),
    });
  }

  // Feed event
  const feId = feedEventId(txHash, logIndex);
  context.FeedEvent.set({
    id: feId,
    type: "VOTE",
    value: votingPower,
    timestamp,
    metadata: {
      voter: normalizedVoter,
      reason,
      support,
      votingPower: votingPower.toString(),
      proposalId,
      title: proposal?.title ?? undefined,
    },
  });
};

export const proposalCreated = async (
  context: any,
  daoId: string,
  blockTime: number,
  args: {
    proposalId: string;
    txHash: Hex;
    proposer: Address;
    targets: Address[];
    values: bigint[];
    signatures: string[];
    calldatas: Hex[];
    startBlock: string;
    endBlock: string;
    description: string;
    blockNumber: bigint;
    timestamp: bigint;
    proposalType?: number;
    logIndex: number;
  },
) => {
  const {
    proposer,
    proposalId,
    txHash,
    targets,
    values,
    signatures,
    calldatas,
    startBlock,
    endBlock,
    description,
    blockNumber,
    timestamp,
    logIndex,
  } = args;

  await ensureAccountExists(context, proposer);

  const title = parseProposalTitle(description);
  const blockDelta = parseInt(endBlock) - Number(blockNumber);

  context.ProposalsOnchain.set({
    id: proposalId,
    txHash,
    daoId,
    proposer_id: getAddress(proposer),
    targets: targets.map((a) => getAddress(a)),
    values: values.map((v) => v.toString()),
    signatures,
    calldatas,
    startBlock: parseInt(startBlock),
    endBlock: parseInt(endBlock),
    title,
    description,
    timestamp,
    logIndex,
    status: ProposalStatus.PENDING,
    endTimestamp: timestamp + BigInt(blockDelta * blockTime),
    forVotes: 0n,
    againstVotes: 0n,
    abstainVotes: 0n,
    proposalType: args.proposalType ?? undefined,
  });

  // Update proposer's proposal count
  const normalizedProposer = getAddress(proposer);
  const existingPower = await context.AccountPower.get(normalizedProposer);
  let proposerVotingPower = 0n;
  if (existingPower) {
    proposerVotingPower = existingPower.votingPower;
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
  const feId = feedEventId(txHash, logIndex);
  context.FeedEvent.set({
    id: feId,
    type: "PROPOSAL",
    value: 0n,
    timestamp,
    metadata: {
      id: proposalId,
      proposer: normalizedProposer,
      votingPower: proposerVotingPower.toString(),
      title,
    },
  });
};

export const updateProposalStatus = async (
  context: any,
  proposalId: string,
  status: string,
) => {
  const proposal = await context.ProposalsOnchain.get(proposalId);
  if (proposal) {
    context.ProposalsOnchain.set({
      ...proposal,
      status,
    });
  }
};

export const proposalExtended = async (
  context: any,
  proposalId: string,
  blockTime: number,
  extendedDeadline: bigint,
  txHash: Hex,
  logIndex: number,
  timestamp: bigint,
) => {
  const proposal = await context.ProposalsOnchain.get(proposalId);
  if (!proposal) return;

  const endTimestamp =
    proposal.endTimestamp +
    BigInt((Number(extendedDeadline) - proposal.endBlock) * blockTime);

  context.ProposalsOnchain.set({
    ...proposal,
    endBlock: Number(extendedDeadline),
    endTimestamp,
  });

  const feId = feedEventId(txHash, logIndex);
  context.FeedEvent.set({
    id: feId,
    type: "PROPOSAL_EXTENDED",
    value: 0n,
    timestamp,
    metadata: {
      id: proposalId,
      title: proposal.title ?? undefined,
      endBlock: Number(extendedDeadline),
      endTimestamp: endTimestamp.toString(),
      proposer: proposal.proposer_id,
    },
  });
};
