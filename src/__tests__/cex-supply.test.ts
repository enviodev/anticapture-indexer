import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const UNI_TOKEN = getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");
const BINANCE_HOT = getAddress(
  "0x28C6c06298d514Db089934071355E5743bf21d60"
);

describe("CEX Supply Tracking - UNI Transfer to Binance at Block 15_000_008", () => {
  it("increases Token.cexSupply on transfer to Binance", async (t) => {
    const indexer = createTestIndexer();

    // Preset UNI Token entity with known supply values
    indexer.Token.set({
      id: UNI_TOKEN,
      name: "UNI",
      decimals: 18,
      totalSupply: 1_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 1_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 1: { startBlock: 15_000_008, endBlock: 15_000_008 } },
    });

    const token = await indexer.Token.get(UNI_TOKEN);
    t.expect(token).toBeDefined();
    t.expect(token!.cexSupply).toBeGreaterThan(0n);
  });

  it("marks Transfer entity as isCex=true", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: UNI_TOKEN,
      name: "UNI",
      decimals: 18,
      totalSupply: 1_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 1_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 1: { startBlock: 15_000_008, endBlock: 15_000_008 } },
    });

    const transfers = await indexer.Transfer.getAll();
    const cexTransfers = transfers.filter((t: any) => t.isCex === true);
    t.expect(cexTransfers.length).toBeGreaterThan(0);

    // Verify the CEX transfer involves Binance address
    const binanceTransfer = cexTransfers.find(
      (t: any) =>
        t.toAccount_id === BINANCE_HOT || t.fromAccount_id === BINANCE_HOT
    );
    t.expect(binanceTransfer).toBeDefined();
  });

  it("creates Transaction entity with isCex=true", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: UNI_TOKEN,
      name: "UNI",
      decimals: 18,
      totalSupply: 1_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 1_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 1: { startBlock: 15_000_008, endBlock: 15_000_008 } },
    });

    const transactions = await indexer.Transaction.getAll();
    const cexTxs = transactions.filter((tx: any) => tx.isCex === true);
    t.expect(cexTxs.length).toBeGreaterThan(0);
  });

  it("creates DaoMetricsDayBucket for CEX_SUPPLY metric", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: UNI_TOKEN,
      name: "UNI",
      decimals: 18,
      totalSupply: 1_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 1_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    await indexer.process({
      chains: { 1: { startBlock: 15_000_008, endBlock: 15_000_008 } },
    });

    const buckets = await indexer.DaoMetricsDayBucket.getAll();
    const cexBuckets = buckets.filter(
      (b: any) => b.metricType === "CEX_SUPPLY"
    );
    t.expect(cexBuckets.length).toBeGreaterThan(0);
    t.expect(cexBuckets[0]!.daoId).toBe("UNI");
  });

  it("snapshots all CEX-related changes", async (t) => {
    const indexer = createTestIndexer();

    indexer.Token.set({
      id: UNI_TOKEN,
      name: "UNI",
      decimals: 18,
      totalSupply: 1_000_000_000n * 10n ** 18n,
      delegatedSupply: 0n,
      cexSupply: 0n,
      dexSupply: 0n,
      lendingSupply: 0n,
      circulatingSupply: 1_000_000_000n * 10n ** 18n,
      treasury: 0n,
      nonCirculatingSupply: 0n,
    });

    const result = await indexer.process({
      chains: { 1: { startBlock: 15_000_008, endBlock: 15_000_008 } },
    });

    t.expect(result.changes).toMatchInlineSnapshot(`
      [
        {
          "Account": {
            "sets": [
              {
                "id": "0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe",
              },
              {
                "id": "0x5A7059D6E391B40667ac018054Db1d1eE4763aC9",
              },
              {
                "id": "0x28C6c06298d514Db089934071355E5743bf21d60",
              },
            ],
          },
          "AccountBalance": {
            "sets": [
              {
                "account_id": "0x28C6c06298d514Db089934071355E5743bf21d60",
                "balance": 1000000000000000000000n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x28C6c06298d514Db089934071355E5743bf21d60_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
              },
              {
                "account_id": "0x28C6c06298d514Db089934071355E5743bf21d60",
                "balance": 4262297599999999737856n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x28C6c06298d514Db089934071355E5743bf21d60_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
              },
              {
                "account_id": "0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe",
                "balance": -1000000000000000000000n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
              },
              {
                "account_id": "0x5A7059D6E391B40667ac018054Db1d1eE4763aC9",
                "balance": -4262297599999999737856n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x5A7059D6E391B40667ac018054Db1d1eE4763aC9_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
              },
            ],
          },
          "BalanceHistory": {
            "sets": [
              {
                "account_id": "0x28C6c06298d514Db089934071355E5743bf21d60",
                "balance": 1000000000000000000000n,
                "daoId": "ENS",
                "delta": 1000000000000000000000n,
                "deltaMod": 1000000000000000000000n,
                "id": "0x9e00304f4aaea03032e84decd485fd14e294ea0eaa0101168446bcfd526cffec_0x28C6c06298d514Db089934071355E5743bf21d60_164",
                "logIndex": 164,
                "timestamp": 1655778625n,
                "transactionHash": "0x9e00304f4aaea03032e84decd485fd14e294ea0eaa0101168446bcfd526cffec",
              },
              {
                "account_id": "0x28C6c06298d514Db089934071355E5743bf21d60",
                "balance": 4262297599999999737856n,
                "daoId": "UNI",
                "delta": 4262297599999999737856n,
                "deltaMod": 4262297599999999737856n,
                "id": "0x20f7311466d1489f1a05dbeef837bbad8a94351227ec819ff2579009eef5bbc0_0x28C6c06298d514Db089934071355E5743bf21d60_180",
                "logIndex": 180,
                "timestamp": 1655778625n,
                "transactionHash": "0x20f7311466d1489f1a05dbeef837bbad8a94351227ec819ff2579009eef5bbc0",
              },
              {
                "account_id": "0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe",
                "balance": -1000000000000000000000n,
                "daoId": "ENS",
                "delta": -1000000000000000000000n,
                "deltaMod": 1000000000000000000000n,
                "id": "0x9e00304f4aaea03032e84decd485fd14e294ea0eaa0101168446bcfd526cffec_0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe_164",
                "logIndex": 164,
                "timestamp": 1655778625n,
                "transactionHash": "0x9e00304f4aaea03032e84decd485fd14e294ea0eaa0101168446bcfd526cffec",
              },
              {
                "account_id": "0x5A7059D6E391B40667ac018054Db1d1eE4763aC9",
                "balance": -4262297599999999737856n,
                "daoId": "UNI",
                "delta": -4262297599999999737856n,
                "deltaMod": 4262297599999999737856n,
                "id": "0x20f7311466d1489f1a05dbeef837bbad8a94351227ec819ff2579009eef5bbc0_0x5A7059D6E391B40667ac018054Db1d1eE4763aC9_180",
                "logIndex": 180,
                "timestamp": 1655778625n,
                "transactionHash": "0x20f7311466d1489f1a05dbeef837bbad8a94351227ec819ff2579009eef5bbc0",
              },
            ],
          },
          "DaoMetricsDayBucket": {
            "sets": [
              {
                "average": 4262297599999999737856n,
                "close": 4262297599999999737856n,
                "count": 1,
                "daoId": "UNI",
                "date": 1655769600n,
                "high": 4262297599999999737856n,
                "id": "1655769600_0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984_CEX_SUPPLY",
                "lastUpdate": 1655778625n,
                "low": 4262297599999999737856n,
                "metricType": "CEX_SUPPLY",
                "open": 4262297599999999737856n,
                "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                "volume": 4262297599999999737856n,
              },
              {
                "average": 1000000000000000000000n,
                "close": 1000000000000000000000n,
                "count": 1,
                "daoId": "ENS",
                "date": 1655769600n,
                "high": 1000000000000000000000n,
                "id": "1655769600_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72_CEX_SUPPLY",
                "lastUpdate": 1655778625n,
                "low": 1000000000000000000000n,
                "metricType": "CEX_SUPPLY",
                "open": 1000000000000000000000n,
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "volume": 1000000000000000000000n,
              },
            ],
          },
          "FeedEvent": {
            "sets": [
              {
                "id": "0x9e00304f4aaea03032e84decd485fd14e294ea0eaa0101168446bcfd526cffec_164",
                "metadata": {
                  "amount": "1000000000000000000000",
                  "from": "0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe",
                  "to": "0x28C6c06298d514Db089934071355E5743bf21d60",
                },
                "timestamp": 1655778625n,
                "type": "TRANSFER",
                "value": 1000000000000000000000n,
              },
              {
                "id": "0x20f7311466d1489f1a05dbeef837bbad8a94351227ec819ff2579009eef5bbc0_180",
                "metadata": {
                  "amount": "4262297599999999737856",
                  "from": "0x5A7059D6E391B40667ac018054Db1d1eE4763aC9",
                  "to": "0x28C6c06298d514Db089934071355E5743bf21d60",
                },
                "timestamp": 1655778625n,
                "type": "TRANSFER",
                "value": 4262297599999999737856n,
              },
            ],
          },
          "Token": {
            "sets": [
              {
                "cexSupply": 1000000000000000000000n,
                "circulatingSupply": 0n,
                "decimals": 18,
                "delegatedSupply": 0n,
                "dexSupply": 0n,
                "id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "lendingSupply": 0n,
                "name": "ENS",
                "nonCirculatingSupply": 0n,
                "totalSupply": 0n,
                "treasury": 0n,
              },
              {
                "cexSupply": 4262297599999999737856n,
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
            ],
          },
          "Transaction": {
            "sets": [
              {
                "fromAddress": "0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe",
                "id": "0x9e00304f4aaea03032e84decd485fd14e294ea0eaa0101168446bcfd526cffec",
                "isCex": true,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "timestamp": 1655778625n,
                "toAddress": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
              },
              {
                "fromAddress": "0x5A7059D6E391B40667ac018054Db1d1eE4763aC9",
                "id": "0x20f7311466d1489f1a05dbeef837bbad8a94351227ec819ff2579009eef5bbc0",
                "isCex": true,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "timestamp": 1655778625n,
                "toAddress": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
              },
            ],
          },
          "Transfer": {
            "sets": [
              {
                "amount": 1000000000000000000000n,
                "daoId": "ENS",
                "fromAccount_id": "0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe",
                "id": "0x9e00304f4aaea03032e84decd485fd14e294ea0eaa0101168446bcfd526cffec_0x892e9e24AeA3f27f4C6E9360e312Cce93cc98Ebe_0x28C6c06298d514Db089934071355E5743bf21d60",
                "isCex": true,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "logIndex": 164,
                "timestamp": 1655778625n,
                "toAccount_id": "0x28C6c06298d514Db089934071355E5743bf21d60",
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "transactionHash": "0x9e00304f4aaea03032e84decd485fd14e294ea0eaa0101168446bcfd526cffec",
              },
              {
                "amount": 4262297599999999737856n,
                "daoId": "UNI",
                "fromAccount_id": "0x5A7059D6E391B40667ac018054Db1d1eE4763aC9",
                "id": "0x20f7311466d1489f1a05dbeef837bbad8a94351227ec819ff2579009eef5bbc0_0x5A7059D6E391B40667ac018054Db1d1eE4763aC9_0x28C6c06298d514Db089934071355E5743bf21d60",
                "isCex": true,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "logIndex": 180,
                "timestamp": 1655778625n,
                "toAccount_id": "0x28C6c06298d514Db089934071355E5743bf21d60",
                "token_id": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                "transactionHash": "0x20f7311466d1489f1a05dbeef837bbad8a94351227ec819ff2579009eef5bbc0",
              },
            ],
          },
          "block": 15000008,
          "chainId": 1,
          "eventsProcessed": 2,
        },
      ]
    `);
  });
});
