import { GovernorVoteStart } from "generated";
import { resolveDaoFromGovernorAddress, getBlockTime } from "../lib/addressResolver";
import { ProposalStatus } from "../lib/constants";
import {
  handleVoteCast,
  handleProposalCreated,
  handleProposalStatusUpdate,
  handleProposalExtended,
} from "./shared/governorHandlers";

// ============================================================
// VoteCast - Governor with voteStart/voteEnd naming
// Used by: COMP, SCR, OBOL, ZK governors
// ============================================================
GovernorVoteStart.VoteCast.handler(async ({ event, context }) => {
  const daoId = resolveDaoFromGovernorAddress(event.srcAddress);
  if (!daoId) return;

  await handleVoteCast(context, daoId, {
    proposalId: event.params.proposalId.toString(),
    voter: event.params.voter,
    reason: event.params.reason,
    support: Number(event.params.support),
    timestamp: BigInt(event.block.timestamp),
    txHash: event.transaction.hash,
    votingPower: event.params.weight,
    logIndex: event.logIndex,
  });
});

// ============================================================
// ProposalCreated (voteStart/voteEnd variant)
// ============================================================
GovernorVoteStart.ProposalCreated.handler(async ({ event, context }) => {
  const daoId = resolveDaoFromGovernorAddress(event.srcAddress);
  if (!daoId) return;
  const blockTime = getBlockTime(daoId);

  await handleProposalCreated(context, daoId, blockTime, {
    proposalId: event.params.proposalId.toString(),
    txHash: event.transaction.hash,
    proposer: event.params.proposer,
    targets: event.params.targets,
    values: event.params.values,
    signatures: event.params.signatures,
    calldatas: event.params.calldatas,
    startBlock: event.params.voteStart.toString(),
    endBlock: event.params.voteEnd.toString(),
    description: event.params.description,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  });
});

// ============================================================
// ProposalCanceled
// ============================================================
GovernorVoteStart.ProposalCanceled.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.proposalId.toString(), ProposalStatus.CANCELED);
});

// ============================================================
// ProposalExecuted
// ============================================================
GovernorVoteStart.ProposalExecuted.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.proposalId.toString(), ProposalStatus.EXECUTED);
});

// ============================================================
// ProposalQueued
// ============================================================
GovernorVoteStart.ProposalQueued.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.proposalId.toString(), ProposalStatus.QUEUED);
});

// ============================================================
// ProposalExtended
// ============================================================
GovernorVoteStart.ProposalExtended.handler(async ({ event, context }) => {
  const daoId = resolveDaoFromGovernorAddress(event.srcAddress);
  if (!daoId) return;
  const blockTime = getBlockTime(daoId);

  await handleProposalExtended(
    context,
    event.params.proposalId.toString(),
    blockTime,
    event.params.extendedDeadline,
    event.transaction.hash,
    event.logIndex,
    BigInt(event.block.timestamp),
  );
});
