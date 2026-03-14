import { ERC20Token } from "generated";
import {
  resolveDaoFromTokenAddress,
  getAddressLists,
  addressInList,
  getTokenAddress,
} from "../lib/addressResolver";
import { DaoIdEnum } from "../lib/enums";
import { ZERO_ADDRESS } from "../lib/constants";
import {
  handleTokenTransfer,
  handleDelegateChanged,
  handleDelegateVotesChanged,
} from "./shared/tokenHandlers";

// ============================================================
// Transfer(address indexed from, address indexed to, uint256 value)
// Used by: ENS, OP, ARB, SCR, OBOL, ZK tokens
// ============================================================
ERC20Token.Transfer.handler(async ({ event, context }) => {
  const daoId = resolveDaoFromTokenAddress(event.srcAddress);
  if (!daoId) return;

  const from = event.params.from;
  const to = event.params.to;
  const value = event.params.value;
  const timestamp = BigInt(event.block.timestamp);
  const txHash = event.transaction.hash;
  const logIndex = event.logIndex;
  const tokenAddress = getTokenAddress(daoId);

  await handleTokenTransfer(context, daoId, {
    from,
    to,
    value,
    tokenAddress,
    txHash,
    timestamp,
    logIndex,
  });
});

// ============================================================
// DelegateChanged
// ============================================================
ERC20Token.DelegateChanged.handler(async ({ event, context }) => {
  const daoId = resolveDaoFromTokenAddress(event.srcAddress);
  if (!daoId) return;

  await handleDelegateChanged(context, daoId, {
    delegator: event.params.delegator,
    toDelegate: event.params.toDelegate,
    fromDelegate: event.params.fromDelegate,
    tokenAddress: event.srcAddress,
    txHash: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  });
});

// ============================================================
// DelegateVotesChanged
// ============================================================
ERC20Token.DelegateVotesChanged.handler(async ({ event, context }) => {
  const daoId = resolveDaoFromTokenAddress(event.srcAddress);
  if (!daoId) return;

  await handleDelegateVotesChanged(context, daoId, {
    delegate: event.params.delegate,
    previousBalance: event.params.previousBalance,
    newBalance: event.params.newBalance,
    tokenAddress: event.srcAddress,
    txHash: event.transaction.hash,
    timestamp: BigInt(event.block.timestamp),
    logIndex: event.logIndex,
  });
});
