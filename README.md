# Anticapture Indexer

Anticapture DAO Governance Indexer. Built with [Envio HyperIndex](https://docs.envio.dev).

## Chains

| Network | Chain ID |
|---|---|
| Ethereum Mainnet | 1 |
| Arbitrum | 42161 |
| Optimism | 10 |
| Scroll | 534352 |
| ZKsync | 324 |

## Contracts

- **`UNIToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`UNIGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`ENSToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`ENSGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`ARBToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`OPToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`OPGovernor`**: `VoteCast`, `ProposalCreatedStandard`, `ProposalCreatedWithType`, `ProposalCreatedModuleWithType`, `ProposalCreatedModule`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`GTCToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`GTCGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`NounsToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`NounsGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`, `ProposalVetoed`
- **`NounsAuction`**: `AuctionSettled`
- **`LilNounsToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`LilNounsGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`, `ProposalVetoed`
- **`SCRToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`SCRGovernor`**: `VoteCast`, `ProposalCreatedStandard`, `ProposalCreatedWithType`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`COMPToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`COMPGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalExtended`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`ObolToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`ObolGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`ZKToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`ZKGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`SHUToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`Azorius`**: `ProposalCreated`, `AzoriusProposalExecuted`
- **`LinearVotingStrategy`**: `ProposalInitialized`, `Voted`
- **`FLUIDToken`**: `Transfer`, `DelegateChanged`, `DelegateVotesChanged`
- **`FLUIDGovernor`**: `VoteCast`, `ProposalCreated`, `ProposalExtended`, `ProposalCanceled`, `ProposalExecuted`, `ProposalQueued`
- **`AaveToken`**: `Transfer`
- **`StkAave`**: `Transfer`
- **`AAave`**: `Transfer`
- **`AaveV3`**: `DelegateChanged`

## Schema entities (14)

`Token`, `Account`, `AccountBalance`, `AccountPower`, `VotingPowerHistory`, `BalanceHistory`, `Delegation`, `Transfer`, `VotesOnchain`, `ProposalsOnchain`, `DaoMetricsDayBucket`, `Transaction`, `TokenPrice`, `FeedEvent`

## Run locally

```bash
pnpm install
pnpm dev
```

GraphQL playground at [http://localhost:8080](http://localhost:8080) (local password: `testing`).

## Generate from `config.yaml` or `schema.graphql`

```bash
pnpm codegen
```

## Pre-requisites

- [Node.js v22+ (v24 recommended)](https://nodejs.org/en/download/current)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/) or [Podman](https://podman.io/)

## Resources

- [Envio docs](https://docs.envio.dev)
- [HyperIndex overview](https://docs.envio.dev/docs/HyperIndex/overview)
- [Discord](https://discord.gg/envio)

