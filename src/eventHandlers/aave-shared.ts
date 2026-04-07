import { getAddress, type Address } from "viem";
import { type DaoIdEnum } from "../lib/enums";
import { MetricTypesEnum } from "../lib/constants";
import {
  accountBalanceId,
  transferId,
  balanceHistoryId,
  votingPowerHistoryId,
  delegationId,
  feedEventId,
} from "../lib/id-helpers";
import { ensureAccountsExist } from "./shared";
import { updateSupplyMetric } from "./metrics/supply";
import { updateTotalSupply } from "./metrics/total";
import { updateCirculatingSupply } from "./metrics/circulating";

const zeroAddress = "0x0000000000000000000000000000000000000000";

export type AaveAddressSets = {
  cex: ReadonlySet<Address>;
  dex: ReadonlySet<Address>;
  lending: ReadonlySet<Address>;
  treasury: ReadonlySet<Address>;
  nonCirculating: ReadonlySet<Address>;
  burning: ReadonlySet<Address>;
};

export async function aaveSetup(
  context: any,
  address: Address,
  daoId: DaoIdEnum,
  decimals: number,
) {
  const id = getAddress(address);
  const existing = await context.Token.get(id);
  if (!existing) {
    context.Token.set({
      id,
      name: daoId,
      decimals,
      totalSupply: 0n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 0n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });
  }
}

export async function aaveTransfer(
  context: any,
  {
    from: _from,
    to: _to,
    value,
    transactionHash,
    timestamp,
    logIndex,
  }: {
    from: Address;
    to: Address;
    value: bigint;
    transactionHash: `0x${string}`;
    timestamp: bigint;
    logIndex: number;
  },
  address: Address,
  daoId: DaoIdEnum,
  addressSets: AaveAddressSets,
) {
  const from = getAddress(_from);
  const to = getAddress(_to);
  const tokenId = getAddress(address);

  await ensureAccountsExist(context, [_to, _from]);

  // Upsert transfer
  const tId = transferId(transactionHash, from, to);
  const existingTransfer = await context.Transfer.get(tId);
  if (existingTransfer) {
    context.Transfer.set({
      ...existingTransfer,
      amount: existingTransfer.amount + value,
    });
  } else {
    context.Transfer.set({
      id: tId,
      transactionHash,
      daoId,
      token_id: tokenId,
      amount: value,
      fromAccount_id: from,
      toAccount_id: to,
      timestamp,
      logIndex,
      isCex: false,
      isDex: false,
      isLending: false,
      isTotal: false,
    });
  }

  // Receiver
  if (to !== zeroAddress) {
    const receiverAbId = accountBalanceId(to, tokenId);
    const existingReceiverAb = await context.AccountBalance.get(receiverAbId);
    let currentReceiverBalance: bigint;
    let toDelegate = zeroAddress;
    if (existingReceiverAb) {
      currentReceiverBalance = existingReceiverAb.balance + value;
      toDelegate = existingReceiverAb.delegate;
      context.AccountBalance.set({
        ...existingReceiverAb,
        balance: currentReceiverBalance,
      });
    } else {
      currentReceiverBalance = value;
      context.AccountBalance.set({
        id: receiverAbId,
        account_id: to,
        token_id: tokenId,
        balance: value,
        delegate: zeroAddress,
      });
    }

    if (toDelegate !== zeroAddress) {
      const existingPower = await context.AccountPower.get(toDelegate);
      const currentVP = existingPower ? existingPower.votingPower : 0n;
      if (existingPower) {
        context.AccountPower.set({
          ...existingPower,
          votingPower: existingPower.votingPower + value,
        });
      } else {
        context.AccountPower.set({
          id: toDelegate,
          account_id: toDelegate,
          daoId,
          votingPower: value,
          votesCount: 0,
          proposalsCount: 0,
          delegationsCount: 0,
          lastVoteTimestamp: 0n,
        });
      }

      const vphId = votingPowerHistoryId(transactionHash, toDelegate, logIndex + 1);
      const existingVph = await context.VotingPowerHistory.get(vphId);
      if (!existingVph) {
        context.VotingPowerHistory.set({
          id: vphId,
          daoId,
          transactionHash,
          account_id: toDelegate,
          votingPower: currentVP + value,
          delta: value,
          deltaMod: value,
          timestamp,
          logIndex: logIndex + 1,
        });
      }
    }

    const bhId = balanceHistoryId(transactionHash, to, logIndex);
    const existingBh = await context.BalanceHistory.get(bhId);
    if (!existingBh) {
      context.BalanceHistory.set({
        id: bhId,
        daoId,
        transactionHash,
        account_id: to,
        balance: currentReceiverBalance,
        delta: value,
        deltaMod: value > 0n ? value : -value,
        timestamp,
        logIndex,
      });
    }
  }

  // Sender
  if (from !== zeroAddress) {
    const senderAbId = accountBalanceId(from, tokenId);
    const existingSenderAb = await context.AccountBalance.get(senderAbId);
    let currentSenderBalance: bigint;
    let fromDelegate = zeroAddress;
    if (existingSenderAb) {
      currentSenderBalance = existingSenderAb.balance - value;
      fromDelegate = existingSenderAb.delegate;
      context.AccountBalance.set({
        ...existingSenderAb,
        balance: currentSenderBalance,
      });
    } else {
      currentSenderBalance = -value;
      context.AccountBalance.set({
        id: senderAbId,
        account_id: from,
        token_id: tokenId,
        balance: -value,
        delegate: zeroAddress,
      });
    }

    if (fromDelegate !== zeroAddress) {
      const existingPower = await context.AccountPower.get(fromDelegate);
      const currentVP = existingPower ? existingPower.votingPower : 0n;
      if (existingPower) {
        context.AccountPower.set({
          ...existingPower,
          votingPower: existingPower.votingPower - value,
        });
      } else {
        context.AccountPower.set({
          id: fromDelegate,
          account_id: fromDelegate,
          daoId,
          votingPower: -value,
          votesCount: 0,
          proposalsCount: 0,
          delegationsCount: 0,
          lastVoteTimestamp: 0n,
        });
      }

      const vphId = votingPowerHistoryId(transactionHash, fromDelegate, logIndex + 1);
      const existingVph = await context.VotingPowerHistory.get(vphId);
      if (!existingVph) {
        context.VotingPowerHistory.set({
          id: vphId,
          daoId,
          transactionHash,
          account_id: fromDelegate,
          votingPower: currentVP - value,
          delta: -value,
          deltaMod: value > 0n ? value : -value,
          timestamp,
          logIndex: logIndex + 1,
        });
      }
    }

    const bhId = balanceHistoryId(transactionHash, from, logIndex);
    const existingBh = await context.BalanceHistory.get(bhId);
    if (!existingBh) {
      context.BalanceHistory.set({
        id: bhId,
        daoId,
        transactionHash,
        account_id: from,
        balance: currentSenderBalance,
        delta: -value,
        deltaMod: value > 0n ? value : -value,
        timestamp,
        logIndex,
      });
    }
  }

  // Feed event
  const feId = feedEventId(transactionHash, logIndex);
  context.FeedEvent.set({
    id: feId,
    type: "TRANSFER",
    value,
    timestamp,
    metadata: { from, to, amount: value.toString() },
  });

  // Supply metrics
  const { cex, dex, lending, treasury, nonCirculating, burning } = addressSets;

  const lendingChanged = await updateSupplyMetric(context, "lendingSupply", lending, MetricTypesEnum.LENDING_SUPPLY, _from, _to, value, daoId, address, timestamp);
  const cexChanged = await updateSupplyMetric(context, "cexSupply", cex, MetricTypesEnum.CEX_SUPPLY, _from, _to, value, daoId, address, timestamp);
  const dexChanged = await updateSupplyMetric(context, "dexSupply", dex, MetricTypesEnum.DEX_SUPPLY, _from, _to, value, daoId, address, timestamp);
  const treasuryChanged = await updateSupplyMetric(context, "treasury", treasury, MetricTypesEnum.TREASURY, _from, _to, value, daoId, address, timestamp);
  const nonCirculatingChanged = await updateSupplyMetric(context, "nonCirculatingSupply", nonCirculating, MetricTypesEnum.NON_CIRCULATING_SUPPLY, _from, _to, value, daoId, address, timestamp);
  const totalSupplyChanged = await updateTotalSupply(context, burning, MetricTypesEnum.TOTAL_SUPPLY, _from, _to, value, daoId, address, timestamp);

  if (lendingChanged || cexChanged || dexChanged || treasuryChanged || nonCirculatingChanged || totalSupplyChanged) {
    await updateCirculatingSupply(context, daoId, address, timestamp);
  }
}

export async function aaveDelegateChanged(
  context: any,
  {
    delegationType,
    delegator: _delegator,
    delegatee: _delegate,
    transactionHash,
    timestamp,
    logIndex,
  }: {
    delegationType: number;
    delegator: Address;
    delegatee: Address;
    transactionHash: `0x${string}`;
    timestamp: bigint;
    logIndex: number;
  },
  address: Address,
  daoId: DaoIdEnum,
) {
  if (delegationType === 1) {
    return; // skip proposal delegation
  }

  const delegator = getAddress(_delegator);
  const delegate = getAddress(_delegate);
  const tokenId = getAddress(address);

  await ensureAccountsExist(context, [_delegator, _delegate]);

  // Get previous delegate
  const abId = accountBalanceId(delegator, tokenId);
  const existingAb = await context.AccountBalance.get(abId);
  const previousDelegate = existingAb?.delegate ?? zeroAddress;
  const redelegation = previousDelegate !== zeroAddress;

  // Update delegator's balance delegate
  if (existingAb) {
    context.AccountBalance.set({ ...existingAb, delegate });
  } else {
    context.AccountBalance.set({
      id: abId,
      account_id: delegator,
      token_id: tokenId,
      delegate,
      balance: 0n,
    });
  }

  const delegatorBalance = existingAb?.balance ?? 0n;

  // Insert delegation
  const delId = delegationId(transactionHash, delegator, delegate);
  const existingDel = await context.Delegation.get(delId);
  if (existingDel) {
    context.Delegation.set({
      ...existingDel,
      delegatedValue: existingDel.delegatedValue + delegatorBalance,
    });
  } else {
    context.Delegation.set({
      id: delId,
      transactionHash,
      daoId,
      delegateAccount_id: delegate,
      delegatorAccount_id: delegator,
      delegatedValue: delegatorBalance,
      previousDelegate,
      timestamp,
      logIndex,
      isCex: false,
      isDex: false,
      isLending: false,
      isTotal: false,
      type: delegationType,
    });
  }

  // Update new delegate power
  if (delegate !== zeroAddress) {
    const existingPower = await context.AccountPower.get(delegate);
    if (existingPower) {
      context.AccountPower.set({
        ...existingPower,
        delegationsCount: existingPower.delegationsCount + 1,
        votingPower: existingPower.votingPower + delegatorBalance,
      });
    } else {
      context.AccountPower.set({
        id: delegate,
        account_id: delegate,
        daoId,
        votingPower: delegatorBalance,
        votesCount: 0,
        proposalsCount: 0,
        delegationsCount: 1,
        lastVoteTimestamp: 0n,
      });
    }

    const vphId = votingPowerHistoryId(transactionHash, delegate, logIndex + 1);
    const existingVph = await context.VotingPowerHistory.get(vphId);
    if (!existingVph) {
      context.VotingPowerHistory.set({
        id: vphId,
        daoId,
        transactionHash,
        account_id: delegate,
        votingPower: delegatorBalance,
        delta: delegatorBalance,
        deltaMod: delegatorBalance,
        timestamp,
        logIndex: logIndex + 1,
      });
    }
  }

  // Redelegation: update previous delegate
  if (redelegation) {
    const prevPower = await context.AccountPower.get(previousDelegate);
    if (prevPower) {
      const newVP = prevPower.votingPower - delegatorBalance;
      context.AccountPower.set({
        ...prevPower,
        delegationsCount: prevPower.delegationsCount - 1,
        votingPower: newVP,
      });

      const vphId = votingPowerHistoryId(transactionHash, previousDelegate, logIndex + 1);
      const existingVph = await context.VotingPowerHistory.get(vphId);
      if (!existingVph) {
        context.VotingPowerHistory.set({
          id: vphId,
          daoId,
          transactionHash,
          account_id: previousDelegate,
          votingPower: newVP,
          delta: -delegatorBalance,
          deltaMod: delegatorBalance,
          timestamp,
          logIndex: logIndex + 1,
        });
      }
    }
  }

  // Feed event
  const feId = feedEventId(transactionHash, logIndex);
  context.FeedEvent.set({
    id: feId,
    type: "DELEGATION",
    value: delegatorBalance,
    timestamp,
    metadata: {
      delegator,
      delegate,
      previousDelegate,
      amount: delegatorBalance.toString(),
    },
  });
}
