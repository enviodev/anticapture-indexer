import { SCRToken, SCRGovernor } from "generated";
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

const daoId = DaoIdEnum.SCR;
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

SCRToken.Transfer.handler(async ({ event, context }) => {
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

// SCR has partial delegation with newDelegatees/oldDelegatees arrays
SCRToken.DelegateChanged.handler(async ({ event, context }) => {
  const { delegator, newDelegatees } = event.params;
  const timestamp = BigInt(event.block.timestamp);

  // Get delegator balance for proportional delegation
  const normalizedDelegator = getAddress(delegator);
  const abId = accountBalanceId(normalizedDelegator, tokenAddress);
  const ab = await context.AccountBalance.get(abId);
  const balance = ab ? ab.balance : 0n;

  for (const entry of newDelegatees) {
    const delegatee = entry[0] as Address;
    const numerator = BigInt(entry[1]);
    const delegatedValue = balance * numerator / 10000n;

    await delegateChanged(context, daoId, {
      delegator, delegate: delegatee,
      tokenId: event.srcAddress as Address, previousDelegate: zeroAddress,
      txHash: event.transaction.hash as `0x${string}`, timestamp,
      logIndex: event.logIndex,
      delegatorBalance: delegatedValue,
    }, { cex: sets.cex, dex: sets.dex, lending: sets.lending, burning: sets.burning });
  }

  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (!txTo) return;
  const delegateeAddresses = newDelegatees.map((d: readonly [`0x${string}`, bigint]) => d[0] as Address);
  await handleTransaction(context, event.transaction.hash, txFrom!, txTo, timestamp, [delegator, ...delegateeAddresses]);
});

SCRToken.DelegateVotesChanged.handler(async ({ event, context }) => {
  await delegatedVotesChanged(context, daoId, {
    delegate: event.params.delegate, txHash: event.transaction.hash as `0x${string}`,
    newBalance: event.params.newVotes, oldBalance: event.params.previousVotes,
    timestamp: BigInt(event.block.timestamp), logIndex: event.logIndex,
  });
  await updateDelegatedSupply(context, daoId, event.srcAddress as Address, event.params.newVotes - event.params.previousVotes, BigInt(event.block.timestamp));

  const txTo = event.transaction.to;
  const txFrom = event.transaction.from;
  if (!txTo) return;
  await handleTransaction(context, event.transaction.hash, txFrom!, txTo, BigInt(event.block.timestamp), [event.params.delegate]);
});

// Governor handlers
SCRGovernor.VoteCast.handler(async ({ event, context }) => {
  await voteCast(context, daoId, {
    proposalId: event.params.proposalId.toString(), voter: event.params.voter,
    reason: event.params.reason, support: Number(event.params.support),
    timestamp: BigInt(event.block.timestamp), txHash: event.transaction.hash as `0x${string}`,
    votingPower: event.params.weight, logIndex: event.logIndex,
  });
});

SCRGovernor.ProposalCreatedStandard.handler(async ({ event, context }) => {
  await proposalCreated(context, daoId, blockTime, {
    proposalId: event.params.proposalId.toString(), proposer: event.params.proposer,
    txHash: event.transaction.hash as `0x${string}`, targets: [...event.params.targets] as `0x${string}`[],
    values: [...event.params.values], signatures: [...event.params.signatures],
    calldatas: [...event.params.calldatas] as `0x${string}`[], startBlock: event.params.startBlock.toString(),
    endBlock: event.params.endBlock.toString(), description: event.params.description,
    timestamp: BigInt(event.block.timestamp), blockNumber: BigInt(event.block.number),
    logIndex: event.logIndex,
  });
});

SCRGovernor.ProposalCreatedWithType.handler(async ({ event, context }) => {
  await proposalCreated(context, daoId, blockTime, {
    proposalId: event.params.proposalId.toString(), proposer: event.params.proposer,
    txHash: event.transaction.hash as `0x${string}`, targets: [...event.params.targets] as `0x${string}`[],
    values: [...event.params.values], signatures: [...event.params.signatures],
    calldatas: [...event.params.calldatas] as `0x${string}`[], startBlock: event.params.startBlock.toString(),
    endBlock: event.params.endBlock.toString(), description: event.params.description,
    timestamp: BigInt(event.block.timestamp), blockNumber: BigInt(event.block.number),
    logIndex: event.logIndex, proposalType: Number(event.params.proposalType),
  });
});

SCRGovernor.ProposalCanceled.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.proposalId.toString(), ProposalStatus.CANCELED);
});

SCRGovernor.ProposalExecuted.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.proposalId.toString(), ProposalStatus.EXECUTED);
});

SCRGovernor.ProposalQueued.handler(async ({ event, context }) => {
  await updateProposalStatus(context, event.params.proposalId.toString(), ProposalStatus.QUEUED);
});
