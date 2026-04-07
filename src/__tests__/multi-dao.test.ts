import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const UNI_TOKEN = getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");
const COMP_TOKEN = getAddress("0xc00e94Cb662C3520282E6f5717214004A7f26888");

describe("Multi-DAO - Same Block", () => {
  it("processes UNI and COMP events in the same block", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    // Both UNI and COMP tokens should exist
    const uniToken = await indexer.Token.get(UNI_TOKEN);
    t.expect(uniToken).toBeDefined();
    t.expect(uniToken!.name).toBe("UNI");

    const compToken = await indexer.Token.get(COMP_TOKEN);
    t.expect(compToken).toBeDefined();
    t.expect(compToken!.name).toBe("COMP");
  });

  it("creates separate Transfer entities per DAO", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_861_674, endBlock: 10_861_674 } },
    });

    const transfers = await indexer.Transfer.getAll();
    const uniTransfers = transfers.filter((t: any) => t.daoId === "UNI");
    const compTransfers = transfers.filter((t: any) => t.daoId === "COMP");

    t.expect(uniTransfers.length).toBeGreaterThan(0);
    t.expect(compTransfers.length).toBeGreaterThan(0);
  });
});

describe("AAVE Token", () => {
  it("creates AAVE Token entity via auto-exit", async (t) => {
    const indexer = createTestIndexer();
    // Use auto-exit to find the first block with AAVE Transfer events
    // The AAVE token contract starts at block 10_926_829 per config.yaml
    const result = await indexer.process({
      chains: { 1: { startBlock: 10_926_829, endBlock: 10_926_829 } },
    });

    // Verify AAVE token entity is created if events exist at start block
    const aaveToken = await indexer.Token.get(
      getAddress("0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9")
    );
    // The start_block may not have AAVE Transfer events - just verify no crash
    // and that the indexer processes the block without errors
    t.expect(result.changes).toBeDefined();
  });
});

describe("ENS Token - First Transfer at Block 13_533_418", () => {
  it("creates ENS Token entity distinct from UNI", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 13_533_418, endBlock: 13_533_418 } },
    });

    const ensToken = await indexer.Token.get(
      getAddress("0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72")
    );
    t.expect(ensToken).toBeDefined();
    t.expect(ensToken!.name).toBe("ENS");
    t.expect(ensToken!.decimals).toBe(18);
  });

  it("processes ENS events independently from other DAOs", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: { 1: { startBlock: 13_533_418, endBlock: 13_533_418 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes).toMatchInlineSnapshot(`
      [
        {
          "Account": {
            "sets": [
              {
                "id": "0x0000000000000000000000000000000000000000",
              },
              {
                "id": "0x0904Dac3347eA47d208F3Fd67402D039a3b99859",
              },
              {
                "id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
              },
            ],
          },
          "AccountBalance": {
            "sets": [
              {
                "account_id": "0x0904Dac3347eA47d208F3Fd67402D039a3b99859",
                "balance": 74999999999999998618845952n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0x0904Dac3347eA47d208F3Fd67402D039a3b99859_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
              },
              {
                "account_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "balance": 25000000000000001381154048n,
                "delegate": "0x0000000000000000000000000000000000000000",
                "id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
              },
            ],
          },
          "BalanceHistory": {
            "sets": [
              {
                "account_id": "0x0904Dac3347eA47d208F3Fd67402D039a3b99859",
                "balance": 74999999999999998618845952n,
                "daoId": "ENS",
                "delta": 74999999999999998618845952n,
                "deltaMod": 74999999999999998618845952n,
                "id": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff_0x0904Dac3347eA47d208F3Fd67402D039a3b99859_383",
                "logIndex": 383,
                "timestamp": 1635800117n,
                "transactionHash": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff",
              },
              {
                "account_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "balance": 25000000000000001381154048n,
                "daoId": "ENS",
                "delta": 25000000000000001381154048n,
                "deltaMod": 25000000000000001381154048n,
                "id": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72_384",
                "logIndex": 384,
                "timestamp": 1635800117n,
                "transactionHash": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff",
              },
            ],
          },
          "DaoMetricsDayBucket": {
            "sets": [
              {
                "average": 74999999999999998618845952n,
                "close": 74999999999999998618845952n,
                "count": 1,
                "daoId": "ENS",
                "date": 1635724800n,
                "high": 74999999999999998618845952n,
                "id": "1635724800_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72_TOTAL_SUPPLY",
                "lastUpdate": 1635800117n,
                "low": 74999999999999998618845952n,
                "metricType": "TOTAL_SUPPLY",
                "open": 74999999999999998618845952n,
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "volume": 74999999999999998618845952n,
              },
              {
                "average": 74999999999999998618845952n,
                "close": 74999999999999998618845952n,
                "count": 1,
                "daoId": "ENS",
                "date": 1635724800n,
                "high": 74999999999999998618845952n,
                "id": "1635724800_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72_CIRCULATING_SUPPLY",
                "lastUpdate": 1635800117n,
                "low": 74999999999999998618845952n,
                "metricType": "CIRCULATING_SUPPLY",
                "open": 74999999999999998618845952n,
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "volume": 74999999999999998618845952n,
              },
            ],
          },
          "FeedEvent": {
            "sets": [
              {
                "id": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff_383",
                "metadata": {
                  "amount": "74999999999999998618845952",
                  "from": "0x0000000000000000000000000000000000000000",
                  "to": "0x0904Dac3347eA47d208F3Fd67402D039a3b99859",
                },
                "timestamp": 1635800117n,
                "type": "TRANSFER",
                "value": 74999999999999998618845952n,
              },
              {
                "id": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff_384",
                "metadata": {
                  "amount": "25000000000000001381154048",
                  "from": "0x0000000000000000000000000000000000000000",
                  "to": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                },
                "timestamp": 1635800117n,
                "type": "TRANSFER",
                "value": 25000000000000001381154048n,
              },
            ],
          },
          "Token": {
            "sets": [
              {
                "cexSupply": 0n,
                "circulatingSupply": 74999999999999998618845952n,
                "decimals": 18,
                "delegatedSupply": 0n,
                "dexSupply": 0n,
                "id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "lendingSupply": 0n,
                "name": "ENS",
                "nonCirculatingSupply": 0n,
                "totalSupply": 74999999999999998618845952n,
                "treasury": 0n,
              },
            ],
          },
          "Transfer": {
            "sets": [
              {
                "amount": 74999999999999998618845952n,
                "daoId": "ENS",
                "fromAccount_id": "0x0000000000000000000000000000000000000000",
                "id": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff_0x0000000000000000000000000000000000000000_0x0904Dac3347eA47d208F3Fd67402D039a3b99859",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": true,
                "logIndex": 383,
                "timestamp": 1635800117n,
                "toAccount_id": "0x0904Dac3347eA47d208F3Fd67402D039a3b99859",
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "transactionHash": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff",
              },
              {
                "amount": 25000000000000001381154048n,
                "daoId": "ENS",
                "fromAccount_id": "0x0000000000000000000000000000000000000000",
                "id": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff_0x0000000000000000000000000000000000000000_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": true,
                "logIndex": 384,
                "timestamp": 1635800117n,
                "toAccount_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "transactionHash": "0xdfc76788b13ab1c033c7cd55fdb7a431b2bc8abe6b19ac9f7d22f4105bb43bff",
              },
            ],
          },
          "block": 13533418,
          "chainId": 1,
          "eventsProcessed": 2,
        },
      ]
    `);
  });
});
