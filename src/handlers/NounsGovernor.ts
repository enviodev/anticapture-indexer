import { NounsGovernor } from "generated";
import { DaoIdEnum } from "../lib/enums";
import { ProposalStatus, CONTRACT_ADDRESSES } from "../lib/constants";
import {
  handleVoteCast,
  handleProposalCreated,
  handleProposalStatusUpdate,
} from "./shared/governorHandlers";

const daoId = DaoIdEnum.NOUNS;
const blockTime = CONTRACT_ADDRESSES[daoId].blockTime;

// ============================================================
// VoteCast (Nouns legacy: bool support, votes instead of weight)
// ============================================================
NounsGovernor.VoteCast.handler(async ({ event, context }) => {
  await handleVoteCast(context, daoId, {
    proposalId: event.params.proposalId.toString(),
    voter: event.params.voter,
    reason: event.params.reason,
    support: event.params.support ? 1 : 0,
    timestamp: BigInt(event.block.timestamp),
    txHash: event.transaction.hash,
    votingPower: event.params.votes,
    logIndex: event.logIndex,
  });
});

// ============================================================
// ProposalCreated (Nouns: uses "id" instead of "proposalId")
// ============================================================
NounsGovernor.ProposalCreated.handler(async ({ event, context }) => {
  await handleProposalCreated(context, daoId, blockTime, {
    proposalId: event.params.id.toString(),
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
NounsGovernor.ProposalCanceled.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.id.toString(), ProposalStatus.CANCELED);
});

// ============================================================
// ProposalExecuted
// ============================================================
NounsGovernor.ProposalExecuted.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.id.toString(), ProposalStatus.EXECUTED);
});

// ============================================================
// ProposalQueued
// ============================================================
NounsGovernor.ProposalQueued.handler(async ({ event, context }) => {
  await handleProposalStatusUpdate(context, event.params.id.toString(), ProposalStatus.QUEUED);
});
