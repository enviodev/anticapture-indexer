import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const ARB_TOKEN = getAddress("0x912CE59144191C1204E64559FE8253a0e49E6548");

describe("Arbitrum - ARB DelegateVotesChanged at Block 70_506_540", () => {
  it("creates VotingPowerHistory with correct delta", async (t) => {
    const indexer = createTestIndexer();

    // Preset ARB Token entity
    indexer.Token.set({
      id: ARB_TOKEN,
      name: "ARB",
      decimals: 18,
      totalSupply: 10_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 10_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 42161: { startBlock: 70_506_540, endBlock: 70_506_540 } },
    });

    const vpHistory = await indexer.VotingPowerHistory.getAll();
    t.expect(vpHistory.length).toBeGreaterThan(0);
    t.expect(vpHistory[0]!.daoId).toBe("ARB");
  });

  it("updates AccountPower votingPower", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: ARB_TOKEN,
      name: "ARB",
      decimals: 18,
      totalSupply: 10_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 10_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 42161: { startBlock: 70_506_540, endBlock: 70_506_540 } },
    });

    const powers = await indexer.AccountPower.getAll();
    const withVotingPower = powers.filter(
      (p: any) => p.votingPower > 0n
    );
    t.expect(withVotingPower.length).toBeGreaterThan(0);
  });

  it("creates DaoMetricsDayBucket for DELEGATED_SUPPLY", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: ARB_TOKEN,
      name: "ARB",
      decimals: 18,
      totalSupply: 10_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 10_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 42161: { startBlock: 70_506_540, endBlock: 70_506_540 } },
    });

    const buckets = await indexer.DaoMetricsDayBucket.getAll();
    const delegatedBuckets = buckets.filter(
      (b: any) => b.metricType === "DELEGATED_SUPPLY"
    );
    t.expect(delegatedBuckets.length).toBeGreaterThan(0);
    t.expect(delegatedBuckets[0]!.daoId).toBe("ARB");
  });

  it("snapshots all ARB delegation changes", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: ARB_TOKEN,
      name: "ARB",
      decimals: 18,
      totalSupply: 10_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 10_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    const result = await indexer.process({
      chains: { 42161: { startBlock: 70_506_540, endBlock: 70_506_540 } },
    });

    t.expect(result.changes).toMatchInlineSnapshot(`
      [
        {
          "Account": {
            "sets": [
              {
                "id": "0x00000000000000000000000000000000000A4B86",
              },
              {
                "id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
              },
              {
                "id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
              },
            ],
          },
          "AccountBalance": {
            "sets": [
              {
                "account_id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
                "balance": 3527046079000000000000000000n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58_0x912CE59144191C1204E64559FE8253a0e49E6548",
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
              },
              {
                "account_id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                "balance": -3527046079000000000000000000n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C_0x912CE59144191C1204E64559FE8253a0e49E6548",
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
              },
            ],
          },
          "AccountPower": {
            "sets": [
              {
                "account_id": "0x00000000000000000000000000000000000A4B86",
                "daoId": "ARB",
                "delegationsCount": 0,
                "id": "0x00000000000000000000000000000000000A4B86",
                "lastVoteTimestamp": 0n,
                "proposalsCount": 0,
                "votesCount": 0,
                "votingPower": 3527046079000000000000000000n,
              },
            ],
          },
          "BalanceHistory": {
            "sets": [
              {
                "account_id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
                "balance": 3527046079000000000000000000n,
                "daoId": "ARB",
                "delta": 3527046079000000000000000000n,
                "deltaMod": 3527046079000000000000000000n,
                "id": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531_0xF3FC178157fb3c87548bAA86F9d24BA38E649B58_2",
                "logIndex": 2,
                "timestamp": 1678995402n,
                "transactionHash": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531",
              },
              {
                "account_id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                "balance": -3527046079000000000000000000n,
                "daoId": "ARB",
                "delta": -3527046079000000000000000000n,
                "deltaMod": 3527046079000000000000000000n,
                "id": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531_0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C_2",
                "logIndex": 2,
                "timestamp": 1678995402n,
                "transactionHash": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531",
              },
            ],
          },
          "DaoMetricsDayBucket": {
            "sets": [
              {
                "average": 3527046079000000000000000000n,
                "close": 3527046079000000000000000000n,
                "count": 1,
                "daoId": "ARB",
                "date": 1678924800n,
                "high": 3527046079000000000000000000n,
                "id": "1678924800_0x912CE59144191C1204E64559FE8253a0e49E6548_DELEGATED_SUPPLY",
                "lastUpdate": 1678995402n,
                "low": 3527046079000000000000000000n,
                "metricType": "DELEGATED_SUPPLY",
                "open": 3527046079000000000000000000n,
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "volume": 3527046079000000000000000000n,
              },
              {
                "average": 3527046079000000000000000000n,
                "close": 3527046079000000000000000000n,
                "count": 1,
                "daoId": "ARB",
                "date": 1678924800n,
                "high": 3527046079000000000000000000n,
                "id": "1678924800_0x912CE59144191C1204E64559FE8253a0e49E6548_TREASURY",
                "lastUpdate": 1678995402n,
                "low": 3527046079000000000000000000n,
                "metricType": "TREASURY",
                "open": 3527046079000000000000000000n,
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "volume": 3527046079000000000000000000n,
              },
              {
                "average": 6472953921000000000000000000n,
                "close": 6472953921000000000000000000n,
                "count": 1,
                "daoId": "ARB",
                "date": 1678924800n,
                "high": 6472953921000000000000000000n,
                "id": "1678924800_0x912CE59144191C1204E64559FE8253a0e49E6548_CIRCULATING_SUPPLY",
                "lastUpdate": 1678995402n,
                "low": 6472953921000000000000000000n,
                "metricType": "CIRCULATING_SUPPLY",
                "open": 6472953921000000000000000000n,
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "volume": 3527046079000000000000000000n,
              },
            ],
          },
          "FeedEvent": {
            "sets": [
              {
                "id": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531_2",
                "metadata": {
                  "amount": "3527046079000000000000000000",
                  "from": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                  "to": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
                },
                "timestamp": 1678995402n,
                "type": "TRANSFER",
                "value": 3527046079000000000000000000n,
              },
              {
                "id": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531_3",
                "metadata": {
                  "delegate": "0x00000000000000000000000000000000000A4B86",
                  "delta": "3527046079000000000000000000",
                  "deltaMod": "3527046079000000000000000000",
                },
                "timestamp": 1678995402n,
                "type": "DELEGATION_VOTES_CHANGED",
                "value": 3527046079000000000000000000n,
              },
            ],
          },
          "Token": {
            "sets": [
              {
                "cexSupply": 0n,
                "circulatingSupply": 6472953921000000000000000000n,
                "decimals": 18,
                "delegatedSupply": 3527046079000000000000000000n,
                "dexSupply": 0n,
                "id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "lendingSupply": 0n,
                "name": "ARB",
                "nonCirculatingSupply": 0n,
                "totalSupply": 10000000000000000000000000000n,
                "treasury": 3527046079000000000000000000n,
              },
            ],
          },
          "Transfer": {
            "sets": [
              {
                "amount": 3527046079000000000000000000n,
                "daoId": "ARB",
                "fromAccount_id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                "id": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531_0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C_0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "logIndex": 2,
                "timestamp": 1678995402n,
                "toAccount_id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "transactionHash": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531",
              },
            ],
          },
          "VotingPowerHistory": {
            "sets": [
              {
                "account_id": "0x00000000000000000000000000000000000A4B86",
                "daoId": "ARB",
                "delta": 3527046079000000000000000000n,
                "deltaMod": 3527046079000000000000000000n,
                "id": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531_0x00000000000000000000000000000000000A4B86_3",
                "logIndex": 3,
                "timestamp": 1678995402n,
                "transactionHash": "0xc815f5fae3a872f6fa01f734cb766fc7d5fcf147a90560f2cb604b7f43f8e531",
                "votingPower": 3527046079000000000000000000n,
              },
            ],
          },
          "block": 70506540,
          "chainId": 42161,
          "eventsProcessed": 2,
        },
      ]
    `);
  });
});
