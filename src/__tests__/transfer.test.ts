import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const UNI_TOKEN = getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");
const COMP_TOKEN = getAddress("0xc00e94Cb662C3520282E6f5717214004A7f26888");

describe("UNI Token - First Mint", () => {
  it("processes the first UNI mint at block 10_861_674", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    // This should auto-fill with all entity changes
    t.expect(result.changes).toMatchInlineSnapshot(`
      [
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
      ]
    `);
  });

  it("creates Token entity with correct initial values", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    const token = await indexer.Token.get(UNI_TOKEN);
    t.expect(token).toMatchInlineSnapshot(`
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
      }
    `);
  });

  it("creates Account entities for zero address and recipient", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    const allAccounts = await indexer.Account.getAll();
    t.expect(allAccounts.length).toBeGreaterThan(0);
    // Zero address (sender of mint)
    const zeroAccount = await indexer.Account.get(
      "0x0000000000000000000000000000000000000000"
    );
    t.expect(zeroAccount).toBeDefined();
    // Recipient
    const recipient = await indexer.Account.get(
      "0x41653c7d61609D856f29355E404F310Ec4142Cfb"
    );
    t.expect(recipient).toBeDefined();
  });

  it("creates AccountBalance for mint recipient", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    const abId = `0x41653c7d61609D856f29355E404F310Ec4142Cfb_${UNI_TOKEN}`;
    const ab = await indexer.AccountBalance.get(abId);
    t.expect(ab).toMatchInlineSnapshot(`
      {
        "account_id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
        "balance": 1000000000000000000000000000n,
        "delegate": "0x0000000000000000000000000000000000000000",
        "id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      }
    `);
  });

  it("creates Transfer entity with isTotal=true (mint from zero/burning)", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    const transfers = await indexer.Transfer.getAll();
    // Filter UNI transfers
    const uniTransfers = transfers.filter(
      (tr: any) => tr.token_id === UNI_TOKEN
    );
    t.expect(uniTransfers.length).toBe(1);
    t.expect(uniTransfers[0]).toMatchInlineSnapshot(`
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
      }
    `);
  });

  it("creates FeedEvent entries for the block", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    const feedEvents = await indexer.FeedEvent.getAll();
    t.expect(feedEvents.length).toBeGreaterThan(0);
    t.expect(feedEvents).toMatchInlineSnapshot(`
      [
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
      ]
    `);
  });

  it("creates BalanceHistory entries", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    const history = await indexer.BalanceHistory.getAll();
    t.expect(history.length).toBeGreaterThan(0);
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

  it("updates totalSupply via burning address detection", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    const token = await indexer.Token.get(UNI_TOKEN);
    // Mint from zero address triggers totalSupply update
    t.expect(token!.totalSupply).toMatchInlineSnapshot(`1000000000000000000000000000n`);
  });

  it("creates DaoMetricsDayBucket entries for supply changes", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });
    const buckets = await indexer.DaoMetricsDayBucket.getAll();
    t.expect(buckets.length).toBeGreaterThan(0);
    t.expect(buckets).toMatchInlineSnapshot(`
      [
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
      ]
    `);
  });
});

describe("UNI Token - Sequential Blocks", () => {
  it("processes two sequential blocks and accumulates state", async (t) => {
    const indexer = createTestIndexer();

    // First block - mint
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    // Second block - transfer
    const result2 = await indexer.process({
      chains: { 1: { startBlock: 10_861_766, endBlock: 10_861_766 } },
    });

    t.expect(result2.changes).toMatchInlineSnapshot(`
      [
        {
          "Account": {
            "sets": [
              {
                "id": "0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F",
              },
              {
                "id": "0x31503dcb60119A812feE820bb7042752019F2355",
              },
              {
                "id": "0xe5737257D9406019768167C26f5C6123864ceC1e",
              },
            ],
          },
          "AccountBalance": {
            "sets": [
              {
                "account_id": "0x31503dcb60119A812feE820bb7042752019F2355",
                "balance": 56772717558560889847n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x31503dcb60119A812feE820bb7042752019F2355_0xc00e94Cb662C3520282E6f5717214004A7f26888",
                "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
              },
              {
                "account_id": "0xe5737257D9406019768167C26f5C6123864ceC1e",
                "balance": 2000000000000000000n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0xe5737257D9406019768167C26f5C6123864ceC1e_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
              },
              {
                "account_id": "0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F",
                "balance": -56772717558560889847n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F_0xc00e94Cb662C3520282E6f5717214004A7f26888",
                "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
              },
              {
                "account_id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                "balance": 999999998000000000000000000n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
              },
            ],
          },
          "BalanceHistory": {
            "sets": [
              {
                "account_id": "0x31503dcb60119A812feE820bb7042752019F2355",
                "balance": 56772717558560889847n,
                "daoId": "COMP",
                "delta": 56772717558560889847n,
                "deltaMod": 56772717558560889847n,
                "id": "0xb614293ab5bab5c2e75425320ba6c59e204ae6b049a829f0a2f26bc640f86ecd_0x31503dcb60119A812feE820bb7042752019F2355_122",
                "logIndex": 122,
                "timestamp": 1600108316n,
                "transactionHash": "0xb614293ab5bab5c2e75425320ba6c59e204ae6b049a829f0a2f26bc640f86ecd",
              },
              {
                "account_id": "0xe5737257D9406019768167C26f5C6123864ceC1e",
                "balance": 2000000000000000000n,
                "daoId": "UNI",
                "delta": 2000000000000000000n,
                "deltaMod": 2000000000000000000n,
                "id": "0x0169d8b766b66447e7f869ea46980555bb7f377941d93ddfc581684aa9c9c5d3_0xe5737257D9406019768167C26f5C6123864ceC1e_202",
                "logIndex": 202,
                "timestamp": 1600108316n,
                "transactionHash": "0x0169d8b766b66447e7f869ea46980555bb7f377941d93ddfc581684aa9c9c5d3",
              },
              {
                "account_id": "0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F",
                "balance": -56772717558560889847n,
                "daoId": "COMP",
                "delta": -56772717558560889847n,
                "deltaMod": 56772717558560889847n,
                "id": "0xb614293ab5bab5c2e75425320ba6c59e204ae6b049a829f0a2f26bc640f86ecd_0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F_122",
                "logIndex": 122,
                "timestamp": 1600108316n,
                "transactionHash": "0xb614293ab5bab5c2e75425320ba6c59e204ae6b049a829f0a2f26bc640f86ecd",
              },
              {
                "account_id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                "balance": 999999998000000000000000000n,
                "daoId": "UNI",
                "delta": -2000000000000000000n,
                "deltaMod": 2000000000000000000n,
                "id": "0x0169d8b766b66447e7f869ea46980555bb7f377941d93ddfc581684aa9c9c5d3_0x41653c7d61609D856f29355E404F310Ec4142Cfb_202",
                "logIndex": 202,
                "timestamp": 1600108316n,
                "transactionHash": "0x0169d8b766b66447e7f869ea46980555bb7f377941d93ddfc581684aa9c9c5d3",
              },
            ],
          },
          "FeedEvent": {
            "sets": [
              {
                "id": "0xb614293ab5bab5c2e75425320ba6c59e204ae6b049a829f0a2f26bc640f86ecd_122",
                "metadata": {
                  "amount": "56772717558560889847",
                  "from": "0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F",
                  "to": "0x31503dcb60119A812feE820bb7042752019F2355",
                },
                "timestamp": 1600108316n,
                "type": "TRANSFER",
                "value": 56772717558560889847n,
              },
              {
                "id": "0x0169d8b766b66447e7f869ea46980555bb7f377941d93ddfc581684aa9c9c5d3_202",
                "metadata": {
                  "amount": "2000000000000000000",
                  "from": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                  "to": "0xe5737257D9406019768167C26f5C6123864ceC1e",
                },
                "timestamp": 1600108316n,
                "type": "TRANSFER",
                "value": 2000000000000000000n,
              },
            ],
          },
          "Transfer": {
            "sets": [
              {
                "amount": 56772717558560889847n,
                "daoId": "COMP",
                "fromAccount_id": "0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F",
                "id": "0xb614293ab5bab5c2e75425320ba6c59e204ae6b049a829f0a2f26bc640f86ecd_0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F_0x31503dcb60119A812feE820bb7042752019F2355",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "logIndex": 122,
                "timestamp": 1600108316n,
                "toAccount_id": "0x31503dcb60119A812feE820bb7042752019F2355",
                "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
                "transactionHash": "0xb614293ab5bab5c2e75425320ba6c59e204ae6b049a829f0a2f26bc640f86ecd",
              },
              {
                "amount": 2000000000000000000n,
                "daoId": "UNI",
                "fromAccount_id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
                "id": "0x0169d8b766b66447e7f869ea46980555bb7f377941d93ddfc581684aa9c9c5d3_0x41653c7d61609D856f29355E404F310Ec4142Cfb_0xe5737257D9406019768167C26f5C6123864ceC1e",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "logIndex": 202,
                "timestamp": 1600108316n,
                "toAccount_id": "0xe5737257D9406019768167C26f5C6123864ceC1e",
                "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                "transactionHash": "0x0169d8b766b66447e7f869ea46980555bb7f377941d93ddfc581684aa9c9c5d3",
              },
            ],
          },
          "block": 10861766,
          "chainId": 1,
          "eventsProcessed": 2,
        },
      ]
    `);

    // Both accounts from both blocks should exist
    const allAccounts = await indexer.Account.getAll();
    t.expect(allAccounts.length).toBeGreaterThanOrEqual(3); // zero + first recipient + second recipient
  });

  it("AccountBalance updates correctly across multiple transfers", async (t) => {
    const indexer = createTestIndexer();

    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_766 } },
    });

    // Check all account balances
    const balances = await indexer.AccountBalance.getAll();
    t.expect(balances).toMatchInlineSnapshot(`
      [
        {
          "account_id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb",
          "balance": 999999998000000000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x41653c7d61609D856f29355E404F310Ec4142Cfb_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        },
        {
          "account_id": "0xe5737257D9406019768167C26f5C6123864ceC1e",
          "balance": 2000000000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xe5737257D9406019768167C26f5C6123864ceC1e_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
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
          "account_id": "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56",
          "balance": 97063654055230274n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x00000000001876eB1444c986fD502e618c587430",
          "balance": 43942801413950803n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x00000000001876eB1444c986fD502e618c587430_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x9d18dB4f86f4Aa900670389e25Cdb3b62909926d",
          "balance": 14617008005643572n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x9d18dB4f86f4Aa900670389e25Cdb3b62909926d_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x497eccC27142DA7ACbe460A89bB162b09A5EA725",
          "balance": 2644728583172293n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x497eccC27142DA7ACbe460A89bB162b09A5EA725_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xBB8a373d3348e2D25DB7aB8FB1C990FC0bf21032",
          "balance": 201623771657209935n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xBB8a373d3348e2D25DB7aB8FB1C990FC0bf21032_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xA01f4c825889646387F3D9D486aDc001452F4c3a",
          "balance": 53542253564725252n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xA01f4c825889646387F3D9D486aDc001452F4c3a_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xE09568554BA1820aF4cf5dbaCBc4dB1575167452",
          "balance": 243432017779161367n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xE09568554BA1820aF4cf5dbaCBc4dB1575167452_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x6d2AF065CcB60c0F7E8eC5907C961C42A3447127",
          "balance": 88782621023430414018n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x6d2AF065CcB60c0F7E8eC5907C961C42A3447127_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x5783fD342Bf83dAA165aD578bB2AF46CC8842168",
          "balance": 2263552975395251n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x5783fD342Bf83dAA165aD578bB2AF46CC8842168_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xAA708e0b2249d4900B0e7eE95B3E9fe62ae9fA2a",
          "balance": 35619268219698884872n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xAA708e0b2249d4900B0e7eE95B3E9fe62ae9fA2a_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x31503dcb60119A812feE820bb7042752019F2355",
          "balance": -8522981154751182467n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x31503dcb60119A812feE820bb7042752019F2355_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x854aB5a6A99De149A88EdFB516DBAa3B097A7ce1",
          "balance": 0n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x854aB5a6A99De149A88EdFB516DBAa3B097A7ce1_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xcED5EEC770DE9681984b0eC1426B3F17E99dEb38",
          "balance": 0n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xcED5EEC770DE9681984b0eC1426B3F17E99dEb38_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xAdDc653D133AA36DEEDf146FCB454a02064180CC",
          "balance": 0n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xAdDc653D133AA36DEEDf146FCB454a02064180CC_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xde98541c16829250A62ee0d23499Ada0C94f75f1",
          "balance": 1970000000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xde98541c16829250A62ee0d23499Ada0C94f75f1_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x32E9dc9968Fab4C4528165cd37B613dD5d229650",
          "balance": 568809080000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x32E9dc9968Fab4C4528165cd37B613dD5d229650_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
          "balance": 0n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x805054C222F2D242A394A20AC98c8b53DbEaF805",
          "balance": 0n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x805054C222F2D242A394A20AC98c8b53DbEaF805_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x31e3195706ed3c1961674EAf26B5072ea5cEe8b5",
          "balance": 0n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x31e3195706ed3c1961674EAf26B5072ea5cEe8b5_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
          "balance": 0n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x362E5681c042f6ad8D0Ea1DCA0F4E1f12332865d",
          "balance": 203988476791430417253n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x362E5681c042f6ad8D0Ea1DCA0F4E1f12332865d_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F",
          "balance": 0n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x3a4C3F00d216Fcc47Ac8Ef18eFBfa8AD7e3cB92F_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x423334aB36c4a12efCdE887914a7CC4D4C017B1C",
          "balance": 9960300000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x423334aB36c4a12efCdE887914a7CC4D4C017B1C_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xCFfDdeD873554F362Ac02f8Fb1f02E5ada10516f",
          "balance": -190512063824500703579n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xCFfDdeD873554F362Ac02f8Fb1f02E5ada10516f_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x65806153C7698aa673298A3A4d2D8A177e2B2a02",
          "balance": 4600000000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x65806153C7698aa673298A3A4d2D8A177e2B2a02_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x9401989882a05eD83862629851aA53e06b47ce9f",
          "balance": 64000000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x9401989882a05eD83862629851aA53e06b47ce9f_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d",
          "balance": -132235370000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x961fCAb84A9F96A9843E1cF42a43E50155d0ba5d_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B",
          "balance": -125061019031163787637n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x31132888D62bbcF35b702123B8a8a37dB411185a",
          "balance": -4953431812178531207n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x31132888D62bbcF35b702123B8a8a37dB411185a_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xFBbA1a5b60aABD767F2fA8D7bAb80517a3a7104c",
          "balance": -632809080000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xFBbA1a5b60aABD767F2fA8D7bAb80517a3a7104c_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xA25aA6DFBf6d9bbd7a6A9eb47B9f1e57a2BD92d7",
          "balance": -990000000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xA25aA6DFBf6d9bbd7a6A9eb47B9f1e57a2BD92d7_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x46340b20830761efd32832A74d7169B29FEB9758",
          "balance": -980000000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x46340b20830761efd32832A74d7169B29FEB9758_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0xA1C50AfAc5e0f57368B6993CC76e3897dAbaECf2",
          "balance": -9960300000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0xA1C50AfAc5e0f57368B6993CC76e3897dAbaECf2_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
        {
          "account_id": "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
          "balance": -4600000000000000000n,
          "delegate": "0x0000000000000000000000000000000000000000",
          "id": "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE_0xc00e94Cb662C3520282E6f5717214004A7f26888",
          "token_id": "0xc00e94Cb662C3520282E6f5717214004A7f26888",
        },
      ]
    `);
  });
});
