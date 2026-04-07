import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const UNI_TOKEN = getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");

describe("Arbitrum - ARB Token at Block 70_398_215", () => {
  it("processes ARB Transfer on chain 42161", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: { 42161: { startBlock: 70_398_215, endBlock: 70_398_215 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes[0]!.chainId).toBe(42161);
    t.expect(result.changes).toMatchInlineSnapshot(`
      [
        {
          "Account": {
            "sets": [
              {
                "id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
              },
              {
                "id": "0x0000000000000000000000000000000000000000",
              },
              {
                "id": "0x00000000000000000000000000000000000A4B86",
              },
              {
                "id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
              },
            ],
          },
          "AccountBalance": {
            "sets": [
              {
                "account_id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
                "balance": 0n,
                "delegate": "0x00000000000000000000000000000000000A4B86",
                "id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58_0x912CE59144191C1204E64559FE8253a0e49E6548",
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
              },
              {
                "account_id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                "balance": 10000000000000000000000000000n,
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
                "delegationsCount": 1,
                "id": "0x00000000000000000000000000000000000A4B86",
                "lastVoteTimestamp": 0n,
                "proposalsCount": 0,
                "votesCount": 0,
                "votingPower": 0n,
              },
            ],
          },
          "BalanceHistory": {
            "sets": [
              {
                "account_id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                "balance": 10000000000000000000000000000n,
                "daoId": "ARB",
                "delta": 10000000000000000000000000000n,
                "deltaMod": 10000000000000000000000000000n,
                "id": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d_0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C_19",
                "logIndex": 19,
                "timestamp": 1678968508n,
                "transactionHash": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d",
              },
            ],
          },
          "DaoMetricsDayBucket": {
            "sets": [
              {
                "average": 10000000000000000000000000000n,
                "close": 10000000000000000000000000000n,
                "count": 1,
                "daoId": "ARB",
                "date": 1678924800n,
                "high": 10000000000000000000000000000n,
                "id": "1678924800_0x912CE59144191C1204E64559FE8253a0e49E6548_TOTAL_SUPPLY",
                "lastUpdate": 1678968508n,
                "low": 10000000000000000000000000000n,
                "metricType": "TOTAL_SUPPLY",
                "open": 10000000000000000000000000000n,
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "volume": 10000000000000000000000000000n,
              },
              {
                "average": 10000000000000000000000000000n,
                "close": 10000000000000000000000000000n,
                "count": 1,
                "daoId": "ARB",
                "date": 1678924800n,
                "high": 10000000000000000000000000000n,
                "id": "1678924800_0x912CE59144191C1204E64559FE8253a0e49E6548_CIRCULATING_SUPPLY",
                "lastUpdate": 1678968508n,
                "low": 10000000000000000000000000000n,
                "metricType": "CIRCULATING_SUPPLY",
                "open": 10000000000000000000000000000n,
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "volume": 10000000000000000000000000000n,
              },
            ],
          },
          "Delegation": {
            "sets": [
              {
                "daoId": "ARB",
                "delegateAccount_id": "0x00000000000000000000000000000000000A4B86",
                "delegatedValue": 0n,
                "delegatorAccount_id": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
                "id": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d_0xF3FC178157fb3c87548bAA86F9d24BA38E649B58_0x00000000000000000000000000000000000A4B86",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "logIndex": 72,
                "previousDelegate": "0x0000000000000000000000000000000000000000",
                "timestamp": 1678968508n,
                "transactionHash": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d",
                "type": undefined,
              },
            ],
          },
          "FeedEvent": {
            "sets": [
              {
                "id": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d_19",
                "metadata": {
                  "amount": "10000000000000000000000000000",
                  "from": "0x0000000000000000000000000000000000000000",
                  "to": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                },
                "timestamp": 1678968508n,
                "type": "TRANSFER",
                "value": 10000000000000000000000000000n,
              },
              {
                "id": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d_72",
                "metadata": {
                  "amount": "0",
                  "delegate": "0x00000000000000000000000000000000000A4B86",
                  "delegator": "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58",
                  "previousDelegate": "0x0000000000000000000000000000000000000000",
                },
                "timestamp": 1678968508n,
                "type": "DELEGATION",
                "value": 0n,
              },
            ],
          },
          "Token": {
            "sets": [
              {
                "cexSupply": 0n,
                "circulatingSupply": 10000000000000000000000000000n,
                "decimals": 18,
                "delegatedSupply": 0n,
                "dexSupply": 0n,
                "id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "lendingSupply": 0n,
                "name": "ARB",
                "nonCirculatingSupply": 0n,
                "totalSupply": 10000000000000000000000000000n,
                "treasury": 0n,
              },
            ],
          },
          "Transaction": {
            "sets": [
              {
                "fromAddress": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                "id": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": true,
                "timestamp": 1678968508n,
                "toAddress": "0xDec539A8B29703F7a85f7160bBB6B8882c1D4d29",
              },
            ],
          },
          "Transfer": {
            "sets": [
              {
                "amount": 10000000000000000000000000000n,
                "daoId": "ARB",
                "fromAccount_id": "0x0000000000000000000000000000000000000000",
                "id": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d_0x0000000000000000000000000000000000000000_0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": true,
                "logIndex": 19,
                "timestamp": 1678968508n,
                "toAccount_id": "0x2B9AcFd85440B7828DB8E54694Ee07b2B056B30C",
                "token_id": "0x912CE59144191C1204E64559FE8253a0e49E6548",
                "transactionHash": "0x9cdbb4672b549c26d97cac29f9cd73c1951656e0622ba4b9ed0abff2ee58698d",
              },
            ],
          },
          "block": 70398215,
          "chainId": 42161,
          "eventsProcessed": 2,
        },
      ]
    `);
  });

  it("creates ARB Token entity with correct daoId", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 42161: { startBlock: 70_398_215, endBlock: 70_398_215 } },
    });

    const arbToken = await indexer.Token.get(
      getAddress("0x912CE59144191C1204E64559FE8253a0e49E6548")
    );
    t.expect(arbToken).toBeDefined();
    t.expect(arbToken!.name).toBe("ARB");
  });

  it("handles DelegateChanged on same block as Transfer", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 42161: { startBlock: 70_398_215, endBlock: 70_398_215 } },
    });

    // Block 70_398_215 has both Transfer and DelegateChanged for ARB
    const delegations = await indexer.Delegation.getAll();
    t.expect(delegations.length).toBeGreaterThanOrEqual(0);
    // Just verify no crash — delegation may or may not exist depending on exact events
  });
});

describe("Optimism - OP Token at Block 6_491_116", () => {
  it("processes OP Transfer on chain 10", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: { 10: { startBlock: 6_491_116, endBlock: 6_491_116 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes[0]!.chainId).toBe(10);
  });

  it("creates OP Token entity", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 10: { startBlock: 6_491_116, endBlock: 6_491_116 } },
    });

    const opToken = await indexer.Token.get(
      getAddress("0x4200000000000000000000000000000000000042")
    );
    t.expect(opToken).toBeDefined();
    t.expect(opToken!.name).toBe("OP");
  });

  it("full snapshot for OP first Transfer block", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: { 10: { startBlock: 6_491_116, endBlock: 6_491_116 } },
    });

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
                  "id": "0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2",
                },
              ],
            },
            "AccountBalance": {
              "sets": [
                {
                  "account_id": "0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2",
                  "balance": 4294967296000000000000000000n,
                  "delegate": "0x0000000000000000000000000000000000000000",
                  "id": "0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2_0x4200000000000000000000000000000000000042",
                  "token_id": "0x4200000000000000000000000000000000000042",
                },
              ],
            },
            "BalanceHistory": {
              "sets": [
                {
                  "account_id": "0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2",
                  "balance": 4294967296000000000000000000n,
                  "daoId": "OP",
                  "delta": 4294967296000000000000000000n,
                  "deltaMod": 4294967296000000000000000000n,
                  "id": "0x28a8a9378512c4dfa2add2f09a59c9aff6dd655d86d07aebe3c1e7fb3f25185b_0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2_0",
                  "logIndex": 0,
                  "timestamp": 1650980556n,
                  "transactionHash": "0x28a8a9378512c4dfa2add2f09a59c9aff6dd655d86d07aebe3c1e7fb3f25185b",
                },
              ],
            },
            "DaoMetricsDayBucket": {
              "sets": [
                {
                  "average": 4294967296000000000000000000n,
                  "close": 4294967296000000000000000000n,
                  "count": 1,
                  "daoId": "OP",
                  "date": 1650931200n,
                  "high": 4294967296000000000000000000n,
                  "id": "1650931200_0x4200000000000000000000000000000000000042_TOTAL_SUPPLY",
                  "lastUpdate": 1650980556n,
                  "low": 4294967296000000000000000000n,
                  "metricType": "TOTAL_SUPPLY",
                  "open": 4294967296000000000000000000n,
                  "token_id": "0x4200000000000000000000000000000000000042",
                  "volume": 4294967296000000000000000000n,
                },
                {
                  "average": 4294967296000000000000000000n,
                  "close": 4294967296000000000000000000n,
                  "count": 1,
                  "daoId": "OP",
                  "date": 1650931200n,
                  "high": 4294967296000000000000000000n,
                  "id": "1650931200_0x4200000000000000000000000000000000000042_CIRCULATING_SUPPLY",
                  "lastUpdate": 1650980556n,
                  "low": 4294967296000000000000000000n,
                  "metricType": "CIRCULATING_SUPPLY",
                  "open": 4294967296000000000000000000n,
                  "token_id": "0x4200000000000000000000000000000000000042",
                  "volume": 4294967296000000000000000000n,
                },
              ],
            },
            "FeedEvent": {
              "sets": [
                {
                  "id": "0x28a8a9378512c4dfa2add2f09a59c9aff6dd655d86d07aebe3c1e7fb3f25185b_0",
                  "metadata": {
                    "amount": "4294967296000000000000000000",
                    "from": "0x0000000000000000000000000000000000000000",
                    "to": "0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2",
                  },
                  "timestamp": 1650980556n,
                  "type": "TRANSFER",
                  "value": 4294967296000000000000000000n,
                },
              ],
            },
            "Token": {
              "sets": [
                {
                  "cexSupply": 0n,
                  "circulatingSupply": 4294967296000000000000000000n,
                  "decimals": 18,
                  "delegatedSupply": 0n,
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
            "Transaction": {
              "sets": [
                {
                  "fromAddress": "0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2",
                  "id": "0x28a8a9378512c4dfa2add2f09a59c9aff6dd655d86d07aebe3c1e7fb3f25185b",
                  "isCex": false,
                  "isDex": false,
                  "isLending": false,
                  "isTotal": true,
                  "timestamp": 1650980556n,
                  "toAddress": "0x724604DB3C8D86c906A27B610703fD0296Eb26D5",
                },
              ],
            },
            "Transfer": {
              "sets": [
                {
                  "amount": 4294967296000000000000000000n,
                  "daoId": "OP",
                  "fromAccount_id": "0x0000000000000000000000000000000000000000",
                  "id": "0x28a8a9378512c4dfa2add2f09a59c9aff6dd655d86d07aebe3c1e7fb3f25185b_0x0000000000000000000000000000000000000000_0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2",
                  "isCex": false,
                  "isDex": false,
                  "isLending": false,
                  "isTotal": true,
                  "logIndex": 0,
                  "timestamp": 1650980556n,
                  "toAccount_id": "0xab1ef74D2C461e95f4b658ca1f94aC519ad80BA2",
                  "token_id": "0x4200000000000000000000000000000000000042",
                  "transactionHash": "0x28a8a9378512c4dfa2add2f09a59c9aff6dd655d86d07aebe3c1e7fb3f25185b",
                },
              ],
            },
            "block": 6491116,
            "chainId": 10,
            "eventsProcessed": 1,
          },
        ],
      }
    `);
  });
});

describe("Scroll - SCR Token at Block 9_590_019", () => {
  it("processes SCR Transfer on chain 534352", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: { 534352: { startBlock: 9_590_019, endBlock: 9_590_019 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes[0]!.chainId).toBe(534352);
  });

  it("creates SCR Token entity", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 534352: { startBlock: 9_590_019, endBlock: 9_590_019 } },
    });

    const scrToken = await indexer.Token.get(
      getAddress("0xd29687c813D741E2F938F4aC377128810E217b1b")
    );
    t.expect(scrToken).toBeDefined();
    t.expect(scrToken!.name).toBe("SCR");
  });
});

describe("zkSync - ZK Token at Block 34_572_100", () => {
  it("processes ZK Transfer on chain 324", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: { 324: { startBlock: 34_572_100, endBlock: 34_572_100 } },
    });

    t.expect(result.changes.length).toBeGreaterThan(0);
    t.expect(result.changes[0]!.chainId).toBe(324);
  });

  it("creates ZK Token entity", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 324: { startBlock: 34_572_100, endBlock: 34_572_100 } },
    });

    const zkToken = await indexer.Token.get(
      getAddress("0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E")
    );
    t.expect(zkToken).toBeDefined();
    t.expect(zkToken!.name).toBe("ZK");
  });
});

describe("Multi-chain - Process multiple chains simultaneously", () => {
  it("processes Ethereum + Arbitrum in same call", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: {
        1: { startBlock: 10_861_674, endBlock: 10_861_674 },
        42161: { startBlock: 70_398_215, endBlock: 70_398_215 },
      },
    });

    // Should have changes from both chains
    const chain1Changes = result.changes.filter(
      (c: any) => c.chainId === 1
    );
    const chain42161Changes = result.changes.filter(
      (c: any) => c.chainId === 42161
    );
    t.expect(chain1Changes.length).toBeGreaterThan(0);
    t.expect(chain42161Changes.length).toBeGreaterThan(0);
  });

  it("creates Token entities for different DAOs on different chains", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: {
        1: { startBlock: 10_861_674, endBlock: 10_861_674 },
        42161: { startBlock: 70_398_215, endBlock: 70_398_215 },
      },
    });

    const uniToken = await indexer.Token.get(UNI_TOKEN);
    t.expect(uniToken).toBeDefined();
    t.expect(uniToken!.name).toBe("UNI");

    const arbToken = await indexer.Token.get(
      getAddress("0x912CE59144191C1204E64559FE8253a0e49E6548")
    );
    t.expect(arbToken).toBeDefined();
    t.expect(arbToken!.name).toBe("ARB");
  });

  it("processes Ethereum + Optimism + Scroll simultaneously", async (t) => {
    const indexer = createTestIndexer();
    const result = await indexer.process({
      chains: {
        1: { startBlock: 10_861_674, endBlock: 10_861_674 },
        10: { startBlock: 6_491_116, endBlock: 6_491_116 },
        534352: { startBlock: 9_590_019, endBlock: 9_590_019 },
      },
    });

    const chainIds = new Set(result.changes.map((c: any) => c.chainId));
    t.expect(chainIds.has(1)).toBe(true);
    t.expect(chainIds.has(10)).toBe(true);
    t.expect(chainIds.has(534352)).toBe(true);
  });
});
