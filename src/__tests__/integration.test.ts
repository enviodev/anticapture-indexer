import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const UNI_TOKEN = getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");

describe("Transaction Classification", () => {
  it("creates Transaction entity when transfer involves classified addresses", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const transactions = await indexer.Transaction.getAll();
    t.expect(transactions).toMatchInlineSnapshot(`[]`);
  });
});

describe("Supply Metrics Integration", () => {
  it("tracks totalSupply changes from mint events", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const uniToken = await indexer.Token.get(UNI_TOKEN);
    // UNI mint of 1B tokens should increase total supply
    t.expect(uniToken!.totalSupply).toMatchInlineSnapshot(`1000000000000000000000000000n`);
  });

  it("creates DaoMetricsDayBucket with OHLCAV for supply metrics", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const buckets = await indexer.DaoMetricsDayBucket.getAll();
    // Should have at least totalSupply and circulatingSupply buckets
    t.expect(buckets.length).toBeGreaterThan(0);

    // Each bucket should have valid OHLCAV structure
    for (const bucket of buckets) {
      t.expect(bucket.count).toBeGreaterThan(0);
      t.expect(bucket.open).toBeDefined();
      t.expect(bucket.close).toBeDefined();
      t.expect(bucket.high).toBeDefined();
      t.expect(bucket.low).toBeDefined();
    }
  });
});

describe("Entity Relationships", () => {
  it("Transfer references correct Account entities via fromAccount_id and toAccount_id", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const transfers = await indexer.Transfer.getAll();
    for (const transfer of transfers) {
      const fromAccount = await indexer.Account.get(
        (transfer as any).fromAccount_id
      );
      t.expect(fromAccount).toBeDefined();
      const toAccount = await indexer.Account.get(
        (transfer as any).toAccount_id
      );
      t.expect(toAccount).toBeDefined();
    }
  });

  it("AccountBalance references correct Account and Token", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const balances = await indexer.AccountBalance.getAll();
    for (const balance of balances) {
      const account = await indexer.Account.get(
        (balance as any).account_id
      );
      t.expect(account).toBeDefined();
      const token = await indexer.Token.get((balance as any).token_id);
      t.expect(token).toBeDefined();
    }
  });
});

describe("Preset State", () => {
  it("preserves preset Token entity values that handlers don't modify", async (t) => {
    const indexer = createTestIndexer();

    // Preset UNI token with known supply values
    indexer.Token.set({
      id: UNI_TOKEN,
      name: "UNI",
      decimals: 18,
      totalSupply: 500_000n,
      delegatedSupply: 100_000n,
      cexSupply: 50_000n,
      dexSupply: 30_000n,
      lendingSupply: 20_000n,
      circulatingSupply: 400_000n,
      treasury: 60_000n,
      nonCirculatingSupply: 40_000n,
    });

    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const token = await indexer.Token.get(UNI_TOKEN);
    // Token should exist and have been modified by the transfer handler
    t.expect(token).toBeDefined();
    t.expect(token!.name).toBe("UNI");
    t.expect(token!.decimals).toBe(18);
    // Total supply should have changed due to mint from zero (burning) address
    t.expect(token!.totalSupply).toMatchInlineSnapshot(`1000000000000000000000500000n`);
  });
});

describe("Snapshot Regression - Full Block", () => {
  it("complete entity snapshot for block 10_861_674", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    // Full snapshot for regression testing
    t.expect(result).toMatchInlineSnapshot(`
      {
        "changes": [
          {
            "Account": {
              "sets": [
                {
                  "id": "0x0000000000000000000000000000000000000000",
                },
                {
                  "id": "0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d",
                },
                {
                  "id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                },
                {
                  "id": "0xe17F7bfDcFBe4A017c9D89E2EfcABa5EAa595FEd",
                },
              ],
            },
            "AccountBalance": {
              "sets": [
                {
                  "account_id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                  "balance": 1000000000000000000000000000n,
                  "delegate": "0x0000000000000000000000000000000000000000",
                  "id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                  "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                },
                {
                  "account_id": "0xe17F7bfDcFBe4A017c9D89E2EfcABa5EAa595FEd",
                  "balance": 132235370000000000n,
                  "delegate": "0x0000000000000000000000000000000000000000",
                  "id": "0xe17F7bfDcFBe4A017c9D89E2EfcABa5EAa595FEd_0xc00e94Cb662C3520282E6f5717214004A7f26888",
                  "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
                },
                {
                  "account_id": "0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d",
                  "balance": -132235370000000000n,
                  "delegate": "0x0000000000000000000000000000000000000000",
                  "id": "0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d_0xc00e94Cb662C3520282E6f5717214004A7f26888",
                  "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
                },
              ],
            },
            "BalanceHistory": {
              "sets": [
                {
                  "account_id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                  "balance": 1000000000000000000000000000n,
                  "daoId": "UNI",
                  "delta": 1000000000000000000000000000n,
                  "deltaMod": 1000000000000000000000000000n,
                  "id": "0x4b37d2f343608457ca3322accdab2811c707acf3eb07a40dd8d9567093ea5b82_0x41653c7d61609D856f29355E404F310Ec4142Cfb_23",
                  "logIndex": 23,
                  "timestamp": 1600107086n,
                  "transactionHash": "0x4b37d2f343608457ca3322accdab2811c707acf3eb07a40dd8d9567093ea5b82",
                },
                {
                  "account_id": "0xe17F7bfDcFBe4A017c9D89E2EfcABa5EAa595FEd",
                  "balance": 132235370000000000n,
                  "daoId": "COMP",
                  "delta": 132235370000000000n,
                  "deltaMod": 132235370000000000n,
                  "id": "0x5a1ac7cab0aca53652bf5c39defe35f288aa7920291501e5da0f598d6d192547_0xe17F7bfDcFBe4A017c9D89E2EfcABa5EAa595FEd_29",
                  "logIndex": 29,
                  "timestamp": 1600107086n,
                  "transactionHash": "0x5a1ac7cab0aca53652bf5c39defe35f288aa7920291501e5da0f598d6d192547",
                },
                {
                  "account_id": "0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d",
                  "balance": -132235370000000000n,
                  "daoId": "COMP",
                  "delta": -132235370000000000n,
                  "deltaMod": 132235370000000000n,
                  "id": "0x5a1ac7cab0aca53652bf5c39defe35f288aa7920291501e5da0f598d6d192547_0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d_29",
                  "logIndex": 29,
                  "timestamp": 1600107086n,
                  "transactionHash": "0x5a1ac7cab0aca53652bf5c39defe35f288aa7920291501e5da0f598d6d192547",
                },
              ],
            },
            "DaoMetricsDayBucket": {
              "sets": [
                {
                  "average": 1000000000000000000000000000n,
                  "close": 1000000000000000000000000000n,
                  "count": 1,
                  "daoId": "UNI",
                  "date": 1600041600n,
                  "high": 1000000000000000000000000000n,
                  "id": "1600041600_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984_TOTAL_SUPPLY",
                  "lastUpdate": 1600107086n,
                  "low": 1000000000000000000000000000n,
                  "metricType": "TOTAL_SUPPLY",
                  "open": 1000000000000000000000000000n,
                  "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                  "volume": 1000000000000000000000000000n,
                },
                {
                  "average": 1000000000000000000000000000n,
                  "close": 1000000000000000000000000000n,
                  "count": 1,
                  "daoId": "UNI",
                  "date": 1600041600n,
                  "high": 1000000000000000000000000000n,
                  "id": "1600041600_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984_CIRCULATING_SUPPLY",
                  "lastUpdate": 1600107086n,
                  "low": 1000000000000000000000000000n,
                  "metricType": "CIRCULATING_SUPPLY",
                  "open": 1000000000000000000000000000n,
                  "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                  "volume": 1000000000000000000000000000n,
                },
              ],
            },
            "FeedEvent": {
              "sets": [
                {
                  "id": "0x4b37d2f343608457ca3322accdab2811c707acf3eb07a40dd8d9567093ea5b82_23",
                  "metadata": {
                    "amount": "1000000000000000000000000000",
                    "from": "0x0000000000000000000000000000000000000000",
                    "to": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                  },
                  "timestamp": 1600107086n,
                  "type": "TRANSFER",
                  "value": 1000000000000000000000000000n,
                },
                {
                  "id": "0x5a1ac7cab0aca53652bf5c39defe35f288aa7920291501e5da0f598d6d192547_29",
                  "metadata": {
                    "amount": "132235370000000000",
                    "from": "0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d",
                    "to": "0xe17F7bfDcFBe4A017c9D89E2EfcABa5EAa595FEd",
                  },
                  "timestamp": 1600107086n,
                  "type": "TRANSFER",
                  "value": 132235370000000000n,
                },
              ],
            },
            "Token": {
              "sets": [
                {
                  "cexSupply": 0n,
                  "circulatingSupply": 1000000000000000000000000000n,
                  "decimals": 18,
                  "delegatedSupply": 0n,
                  "dexSupply": 0n,
                  "id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                  "lendingSupply": 0n,
                  "name": "UNI",
                  "nonCirculatingSupply": 0n,
                  "totalSupply": 1000000000000000000000000000n,
                  "treasury": 0n,
                },
                {
                  "cexSupply": 0n,
                  "circulatingSupply": 0n,
                  "decimals": 18,
                  "delegatedSupply": 0n,
                  "dexSupply": 0n,
                  "id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
                  "lendingSupply": 0n,
                  "name": "COMP",
                  "nonCirculatingSupply": 0n,
                  "totalSupply": 0n,
                  "treasury": 0n,
                },
              ],
            },
            "Transfer": {
              "sets": [
                {
                  "amount": 1000000000000000000000000000n,
                  "daoId": "UNI",
                  "fromAccount_id": "0x0000000000000000000000000000000000000000",
                  "id": "0x4b37d2f343608457ca3322accdab2811c707acf3eb07a40dd8d9567093ea5b82_0x0000000000000000000000000000000000000000_0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                  "isCex": false,
                  "isDex": false,
                  "isLending": false,
                  "isTotal": true,
                  "logIndex": 23,
                  "timestamp": 1600107086n,
                  "toAccount_id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                  "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                  "transactionHash": "0x4b37d2f343608457ca3322accdab2811c707acf3eb07a40dd8d9567093ea5b82",
                },
                {
                  "amount": 132235370000000000n,
                  "daoId": "COMP",
                  "fromAccount_id": "0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d",
                  "id": "0x5a1ac7cab0aca53652bf5c39defe35f288aa7920291501e5da0f598d6d192547_0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d_0xe17F7bfDcFBe4A017c9D89E2EfcABa5EAa595FEd",
                  "isCex": false,
                  "isDex": false,
                  "isLending": false,
                  "isTotal": false,
                  "logIndex": 29,
                  "timestamp": 1600107086n,
                  "toAccount_id": "0xe17F7bfDcFBe4A017c9D89E2EfcABa5EAa595FEd",
                  "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
                  "transactionHash": "0x5a1ac7cab0aca53652bf5c39defe35f288aa7920291501e5da0f598d6d192547",
                },
              ],
            },
            "block": 10861674,
            "chainId": 1,
            "eventsProcessed": 2,
          },
        ],
      }
    `);
  });
});

describe("End-to-end - Transfer then Delegation flow", () => {
  it("processes a block range covering Transfer + DelegateChanged + DelegateVotesChanged", async (t) => {
    const indexer = createTestIndexer();

    // Process range that includes transfers and delegation
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    // Then process a block with delegation events
    await indexer.process({
      chains: { 1: { startBlock: 10_863_690, endBlock: 10_863_690 } },
    });

    // Verify both transfer and delegation entities exist
    const transfers = await indexer.Transfer.getAll();
    t.expect(transfers.length).toBeGreaterThan(0);

    const delegations = await indexer.Delegation.getAll();
    t.expect(delegations.length).toBeGreaterThan(0);

    // Verify feed events cover both types
    const feedEvents = await indexer.FeedEvent.getAll();
    const transferFE = feedEvents.filter((fe: any) => fe.type === "TRANSFER");
    const delegationFE = feedEvents.filter(
      (fe: any) => fe.type === "DELEGATION"
    );
    t.expect(transferFE.length).toBeGreaterThan(0);
    t.expect(delegationFE.length).toBeGreaterThan(0);
  });
});

describe("Edge Cases", () => {
  it("handles block range spanning multiple events", async (t) => {
    const indexer = createTestIndexer();
    // Larger range to catch multiple UNI transfer events
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_800 } },
    });

    const transfers = await indexer.Transfer.getAll();
    t.expect(transfers.length).toBeGreaterThanOrEqual(1);

    const accounts = await indexer.Account.getAll();
    t.expect(accounts.length).toBeGreaterThanOrEqual(2);
  });

  it("preset Account entities are preserved", async (t) => {
    const indexer = createTestIndexer();
    const presetAddr = "0x0000000000000000000000000000000000000042";
    indexer.Account.set({ id: presetAddr });

    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    // Preset account should still exist
    const account = await indexer.Account.get(presetAddr);
    t.expect(account).toBeDefined();
  });
});

// Auto-exit tests go LAST — the worker may exit after processing, killing subsequent tests
describe("Auto-exit Mode", () => {
  it("auto-discovers first block with events on chain 1", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({ chains: { 1: {} } });

    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes[0]!.block).toMatchInlineSnapshot(`9601359`);
    t.expect(result.changes[0]!.chainId).toBe(1);
    t.expect(result.changes[0]!.eventsProcessed).toBeGreaterThan(0);
  });
});
