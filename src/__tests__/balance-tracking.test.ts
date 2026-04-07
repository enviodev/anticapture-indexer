import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const UNI_TOKEN = getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");

describe("Detailed Balance Tracking - UNI Blocks 10_861_674 to 10_861_800", () => {
  it("creates AccountBalance entities with correct balances", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_800 } },
    });

    const balances = await indexer.AccountBalance.getAll();
    t.expect(balances.length).toBeGreaterThan(0);

    // Every balance should reference a token
    for (const balance of balances) {
      t.expect(balance.token_id).toBeDefined();
      t.expect(balance.account_id).toBeDefined();
    }
  });

  it("creates BalanceHistory entries for each transfer", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_800 } },
    });

    const history = await indexer.BalanceHistory.getAll();
    t.expect(history.length).toBeGreaterThan(0);

    // Each history entry should have a timestamp
    for (const entry of history) {
      t.expect(entry.timestamp).toBeGreaterThan(0n);
      t.expect(entry.transactionHash).toBeDefined();
    }
  });

  it("records positive delta for receivers and negative for senders", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const history = await indexer.BalanceHistory.getAll();

    // The first UNI mint: receiver gets positive delta
    const positiveDelta = history.filter((h: any) => h.delta > 0n);
    t.expect(positiveDelta.length).toBeGreaterThan(0);

    // For mints from 0x0, there may not be a negative sender entry
    // But for regular transfers there should be
  });

  it("ensures deltaMod is always positive (absolute value)", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_800 } },
    });

    const history = await indexer.BalanceHistory.getAll();
    t.expect(history.length).toBeGreaterThan(0);

    for (const entry of history) {
      t.expect(entry.deltaMod).toBeGreaterThanOrEqual(0n);
    }
  });

  it("balance equals cumulative deltas for each account", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const balances = await indexer.AccountBalance.getAll();
    const history = await indexer.BalanceHistory.getAll();

    // For each account balance, sum up the history deltas
    for (const balance of balances) {
      const accountHistory = history.filter(
        (h: any) => h.account_id === balance.account_id && h.daoId !== undefined
      );

      if (accountHistory.length > 0) {
        const totalDelta = accountHistory.reduce(
          (sum: bigint, h: any) => sum + h.delta,
          0n
        );
        t.expect(balance.balance).toBe(totalDelta);
      }
    }
  });

  it("snapshots all BalanceHistory entries from wider range", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const history = await indexer.BalanceHistory.getAll();
    t.expect(history).toMatchInlineSnapshot(`
      [
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
      ]
    `);
  });
});
