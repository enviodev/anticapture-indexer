import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const OP_TOKEN = getAddress("0x4200000000000000000000000000000000000042");

describe("Optimism - OP Delegation on Chain 10", () => {
  it("creates Delegation entity with daoId OP on DelegateChanged", async (t) => {
    const indexer = createTestIndexer();

    // Preset OP Token entity
    indexer.Token.set({
      id: OP_TOKEN,
      name: "OP",
      decimals: 18,
      totalSupply: 4_294_967_296n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 4_294_967_296n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 10: { startBlock: 9_076_285, endBlock: 9_076_285 } },
    });

    const delegations = await indexer.Delegation.getAll();
    const opDelegations = delegations.filter(
      (d: any) => d.daoId === "OP"
    );
    t.expect(opDelegations.length).toBeGreaterThan(0);
  });

  it("creates AccountPower for OP delegate", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: OP_TOKEN,
      name: "OP",
      decimals: 18,
      totalSupply: 4_294_967_296n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 4_294_967_296n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 10: { startBlock: 9_076_285, endBlock: 9_076_285 } },
    });

    const powers = await indexer.AccountPower.getAll();
    t.expect(powers.length).toBeGreaterThan(0);
    t.expect(powers[0]!.daoId).toBe("OP");
  });

  it("creates FeedEvent with type DELEGATION on chain 10", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: OP_TOKEN,
      name: "OP",
      decimals: 18,
      totalSupply: 4_294_967_296n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 4_294_967_296n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 10: { startBlock: 9_076_285, endBlock: 9_076_285 } },
    });

    const feedEvents = await indexer.FeedEvent.getAll();
    const delegationEvents = feedEvents.filter(
      (fe: any) => fe.type === "DELEGATION"
    );
    t.expect(delegationEvents.length).toBeGreaterThan(0);
  });

  it("snapshots changes from chain 10 delegation", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: OP_TOKEN,
      name: "OP",
      decimals: 18,
      totalSupply: 4_294_967_296n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 4_294_967_296n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    const result = await indexer.process({
      chains: { 10: { startBlock: 9_076_285, endBlock: 9_076_285 } },
    });

    t.expect(result.changes).toMatchInlineSnapshot(`
      [
        {
          "Account": {
            "sets": [
              {
                "id": "0x030e1A57F1b3058135786C07e59E544b3BD266fe",
              },
              {
                "id": "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
              },
            ],
          },
          "AccountBalance": {
            "sets": [
              {
                "account_id": "0x030e1A57F1b3058135786C07e59E544b3BD266fe",
                "balance": 0n,
                "delegate": "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
                "id": "0x030e1A57F1b3058135786C07e59E544b3BD266fe_0x4200000000000000000000000000000000000042",
                "token_id": "0x4200000000000000000000000000000000000042",
              },
            ],
          },
          "AccountPower": {
            "sets": [
              {
                "account_id": "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
                "daoId": "OP",
                "delegationsCount": 1,
                "id": "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
                "lastVoteTimestamp": 0n,
                "proposalsCount": 0,
                "votesCount": 0,
                "votingPower": 1000000000000000000n,
              },
            ],
          },
          "DaoMetricsDayBucket": {
            "sets": [
              {
                "average": 1000000000000000000n,
                "close": 1000000000000000000n,
                "count": 1,
                "daoId": "OP",
                "date": 1653523200n,
                "high": 1000000000000000000n,
                "id": "1653523200_0x4200000000000000000000000000000000000042_DELEGATED_SUPPLY",
                "lastUpdate": 1653609083n,
                "low": 1000000000000000000n,
                "metricType": "DELEGATED_SUPPLY",
                "open": 1000000000000000000n,
                "token_id": "0x4200000000000000000000000000000000000042",
                "volume": 1000000000000000000n,
              },
            ],
          },
          "Delegation": {
            "sets": [
              {
                "daoId": "OP",
                "delegateAccount_id": "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
                "delegatedValue": 0n,
                "delegatorAccount_id": "0x030e1A57F1b3058135786C07e59E544b3BD266fe",
                "id": "0xfb08137a048d2de0fe5cbe73e0aca7795c28ba1867cc68571323a9e78c4324a9_0x030e1A57F1b3058135786C07e59E544b3BD266fe_0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "logIndex": 0,
                "previousDelegate": "0x0000000000000000000000000000000000000000",
                "timestamp": 1653609083n,
                "transactionHash": "0xfb08137a048d2de0fe5cbe73e0aca7795c28ba1867cc68571323a9e78c4324a9",
                "type": undefined,
              },
            ],
          },
          "FeedEvent": {
            "sets": [
              {
                "id": "0xfb08137a048d2de0fe5cbe73e0aca7795c28ba1867cc68571323a9e78c4324a9_0",
                "metadata": {
                  "amount": "0",
                  "delegate": "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
                  "delegator": "0x030e1A57F1b3058135786C07e59E544b3BD266fe",
                  "previousDelegate": "0x0000000000000000000000000000000000000000",
                },
                "timestamp": 1653609083n,
                "type": "DELEGATION",
                "value": 0n,
              },
              {
                "id": "0xfb08137a048d2de0fe5cbe73e0aca7795c28ba1867cc68571323a9e78c4324a9_1",
                "metadata": {
                  "delegate": "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
                  "delta": "1000000000000000000",
                  "deltaMod": "1000000000000000000",
                },
                "timestamp": 1653609083n,
                "type": "DELEGATION_VOTES_CHANGED",
                "value": 1000000000000000000n,
              },
            ],
          },
          "Token": {
            "sets": [
              {
                "cexSupply": 0n,
                "circulatingSupply": 4294967296000000000000000000n,
                "decimals": 18,
                "delegatedSupply": 1000000000000000000n,
                "dexSupply": 0n,
                "id": "0x4200000000000000000000000000000000000042",
                "lendingSupply": 0n,
                "name": "OP",
                "nonCirculatingSupply": 0n,
                "totalSupply": 4294967296000000000000000000n,
                "treasury": 0n,
              },
            ],
          },
          "VotingPowerHistory": {
            "sets": [
              {
                "account_id": "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12",
                "daoId": "OP",
                "delta": 1000000000000000000n,
                "deltaMod": 1000000000000000000n,
                "id": "0xfb08137a048d2de0fe5cbe73e0aca7795c28ba1867cc68571323a9e78c4324a9_0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12_1",
                "logIndex": 1,
                "timestamp": 1653609083n,
                "transactionHash": "0xfb08137a048d2de0fe5cbe73e0aca7795c28ba1867cc68571323a9e78c4324a9",
                "votingPower": 1000000000000000000n,
              },
            ],
          },
          "block": 9076285,
          "chainId": 10,
          "eventsProcessed": 2,
        },
      ]
    `);
  });
});
