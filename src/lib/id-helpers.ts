export const accountBalanceId = (accountId: string, tokenId: string) =>
  `${accountId}_${tokenId}`;

export const votingPowerHistoryId = (txHash: string, accountId: string, logIndex: number) =>
  `${txHash}_${accountId}_${logIndex}`;

export const balanceHistoryId = (txHash: string, accountId: string, logIndex: number) =>
  `${txHash}_${accountId}_${logIndex}`;

export const delegationId = (txHash: string, delegatorId: string, delegateId: string) =>
  `${txHash}_${delegatorId}_${delegateId}`;

export const transferId = (txHash: string, fromId: string, toId: string) =>
  `${txHash}_${fromId}_${toId}`;

export const votesOnchainId = (voterAccountId: string, proposalId: string) =>
  `${voterAccountId}_${proposalId}`;

export const daoMetricsDayBucketId = (date: bigint, tokenId: string, metricType: string) =>
  `${date}_${tokenId}_${metricType}`;

export const feedEventId = (txHash: string, logIndex: number) =>
  `${txHash}_${logIndex}`;
