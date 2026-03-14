import { Governor } from "generated";
import { resolveDaoFromGovernorAddress, getBlockTime } from "../lib/addressResolver";
import { ProposalStatus } from "../lib/constants";
import {
  handleVoteCast,
  handleProposalCreated,
  handleProposalStatusUpdate,
  handleProposalExtended,
} from "./shared/governorHandlers";

// ============================================================
// VoteCast - Governor with startBlock/endBlock naming
// Used by: ENS, UNI, GTC, OP governors
// ============================================================
Governor.VoteCast.handler(async ({ event, context }) => {
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
// ProposalCreated
// ============================================================
Governor.ProposalCreated.handler(async ({ event, context }) => {
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
    startBlock: event.params.startBlock.toString(),
    endBlock: event.params.endBlock.toString(),
    description: event.params.description,
    blockNumber: BigInt(event.block.number),
    timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  });
});

// ============================================================
// ProposalCanceled
// ============================================================
Governor.ProposalCanceled.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.proposalId.toString(), ProposalStatus.CANCELED);
});

// ============================================================
// ProposalExecuted
// ============================================================
Governor.ProposalExecuted.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.proposalId.toString(), ProposalStatus.EXECUTED);
});

// ============================================================
// ProposalQueued
// ============================================================
Governor.ProposalQueued.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.proposalId.toString(), ProposalStatus.QUEUED);
});

// ============================================================
// ProposalExtended
// ============================================================
Governor.ProposalExtended.handler(async ({ event, context }) => {
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
