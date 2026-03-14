/**
 * Shared governor handler logic for votes, proposals, and status updates.
 * Mirrors the Ponder event handler pattern.
 */

import { DaoIdEnum } from "../../lib/enums";
import { ProposalStatus } from "../../lib/constants";
import { ensureAccountExists } from "./helpers";

import type { HandlerContext } from "generated";

type Context = HandlerContext;

// ============================================================
// VoteCast handler
// ============================================================
export async function handleVoteCast(
  context: Context,
  daoId: string,
  args: {
    proposalId: string;
    voter: string;
    reason: string;
    support: number;
    timestamp: bigint;
    txHash: string;
    votingPower: bigint;
    logIndex: number;
  },
): Promise<void> {
  const { voter, timestamp, txHash, proposalId, support, votingPower, reason, logIndex } = args;
  const normalizedVoter = voter.toLowerCase();

  await ensureAccountExists(context, voter);

  // Update account power with vote statistics
  const power = await context.AccountPower.get(normalizedVoter);
  if (power) {
    context.AccountPower.set({
      ...power,
      votesCount: power.votesCount + 1,
      lastVoteTimestamp: timestamp,
    });
  } else {
    context.AccountPower.set({
      id: normalizedVoter,
      accountId: normalizedVoter,
      daoId,
      votingPower: 0n,
      votesCount: 1,
      proposalsCount: 0,
      delegationsCount: 0,
      lastVoteTimestamp: timestamp,
    });
  }

  // Create vote record
  const voteId = `${normalizedVoter}-${proposalId}`;
  context.VoteOnchain.set({
    id: voteId,
    txHash,
    daoId,
    proposalId,
    voterAccountId: normalizedVoter,
    support: support.toString(),
    votingPower,
    reason: reason || undefined,
    timestamp,
  });

  // Update proposal vote totals
  const proposal = await context.ProposalOnchain.get(proposalId);
  if (proposal) {
    context.ProposalOnchain.set({
      ...proposal,
      againstVotes: proposal.againstVotes + (support === 0 ? votingPower : 0n),
      forVotes: proposal.forVotes + (support === 1 ? votingPower : 0n),
      abstainVotes: proposal.abstainVotes + (support === 2 ? votingPower : 0n),
    });
  }

  // Feed event
  context.FeedEvent.set({
    id: `${txHash}-${logIndex}`,
    txHash,
    logIndex,
    eventType: "VOTE",
    value: votingPower,
    timestamp,
    metadata: JSON.stringify({
      voter: normalizedVoter,
      reason,
      support,
      votingPower: votingPower.toString(),
      proposalId,
      title: proposal?.title ?? undefined,
    }),
  });
}

// ============================================================
// ProposalCreated handler
// ============================================================
export async function handleProposalCreated(
  context: Context,
  daoId: string,
  blockTime: number,
  args: {
    proposalId: string;
    txHash: string;
    proposer: string;
    targets: readonly string[];
    values: readonly bigint[];
    signatures: readonly string[];
    calldatas: readonly string[];
    startBlock: string;
    endBlock: string;
    description: string;
    blockNumber: bigint;
    timestamp: bigint;
    proposalType?: number;
    logIndex: number;
  },
): Promise<void> {
  const {
    proposer, proposalId, txHash, targets, values, signatures, calldatas,
    startBlock, endBlock, description, blockNumber, timestamp, logIndex,
  } = args;
  const normalizedProposer = proposer.toLowerCase();

  await ensureAccountExists(context, proposer);

  const title = description.split("\n")[0]?.replace(/^#+\s*/, "") || undefined;
  const blockDelta = parseInt(endBlock) - Number(blockNumber);
  const endTimestamp = timestamp + BigInt(Math.floor(blockDelta * blockTime));

  context.ProposalOnchain.set({
    id: proposalId,
    txHash,
    daoId,
    proposerAccountId: normalizedProposer,
    targets: JSON.stringify([...targets]),
    values: JSON.stringify([...values].map((v) => v.toString())),
    signatures: JSON.stringify([...signatures]),
    calldatas: JSON.stringify([...calldatas]),
    startBlock: parseInt(startBlock),
    endBlock: parseInt(endBlock),
    title,
    description,
    timestamp,
    status: ProposalStatus.PENDING,
    endTimestamp,
    forVotes: 0n,
    againstVotes: 0n,
    abstainVotes: 0n,
    proposalType: args.proposalType ?? undefined,
  });

  // Update proposer's proposal count
  const power = await context.AccountPower.get(normalizedProposer);
  if (power) {
    context.AccountPower.set({
      ...power,
      proposalsCount: power.proposalsCount + 1,
    });
  } else {
    context.AccountPower.set({
      id: normalizedProposer,
      accountId: normalizedProposer,
      daoId,
      votingPower: 0n,
      votesCount: 0,
      proposalsCount: 1,
      delegationsCount: 0,
      lastVoteTimestamp: 0n,
    });
  }

  // Feed event
  context.FeedEvent.set({
    id: `${txHash}-${logIndex}`,
    txHash,
    logIndex,
    eventType: "PROPOSAL",
    value: 0n,
    timestamp,
    metadata: JSON.stringify({
      id: proposalId,
      proposer: normalizedProposer,
      votingPower: (power?.votingPower ?? 0n).toString(),
      title,
    }),
  });
}

// ============================================================
// Update proposal status
// ============================================================
export async function handleProposalStatusUpdate(
  context: Context,
  proposalId: string,
  status: string,
): Promise<void> {
  const proposal = await context.ProposalOnchain.get(proposalId);
  if (proposal) {
    context.ProposalOnchain.set({
      ...proposal,
      status,
    });
  }
}

// ============================================================
// ProposalExtended handler
// ============================================================
export async function handleProposalExtended(
  context: Context,
  proposalId: string,
  blockTime: number,
  extendedDeadline: bigint,
  txHash: string,
  logIndex: number,
  timestamp: bigint,
): Promise<void> {
  const proposal = await context.ProposalOnchain.get(proposalId);
  if (!proposal) return;

  const newEndTimestamp =
    proposal.endTimestamp +
    BigInt(Math.floor((Number(extendedDeadline) - proposal.endBlock) * blockTime));

  context.ProposalOnchain.set({
    ...proposal,
    endBlock: Number(extendedDeadline),
    endTimestamp: newEndTimestamp,
  });

  // Feed event
  context.FeedEvent.set({
    id: `${txHash}-${logIndex}`,
    txHash,
    logIndex,
    eventType: "PROPOSAL_EXTENDED",
    value: 0n,
    timestamp,
    metadata: JSON.stringify({
      id: proposalId,
      title: proposal.title ?? undefined,
      endBlock: Number(extendedDeadline),
      endTimestamp: newEndTimestamp.toString(),
      proposer: proposal.proposerAccountId,
    }),
  });
}
