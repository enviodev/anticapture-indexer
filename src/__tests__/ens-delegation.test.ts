import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const ENS_TOKEN = getAddress("0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72");

describe("ENS Delegation Flow", () => {
  it("creates ENS Token entity with name ENS on first Transfer", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 13_533_418, endBlock: 13_533_418 } },
    });

    const ensToken = await indexer.Token.get(ENS_TOKEN);
    t.expect(ensToken).toBeDefined();
    t.expect(ensToken!.name).toBe("ENS");
    t.expect(ensToken!.decimals).toBe(18);
  });

  it("creates Delegation entity with daoId ENS on DelegateChanged", async (t) => {
    const indexer = createTestIndexer();

    // First process the Transfer to create the token
    await indexer.process({
      chains: { 1: { startBlock: 13_533_418, endBlock: 13_533_418 } },
    });

    // Then process the DelegateChanged
    await indexer.process({
      chains: { 1: { startBlock: 13_557_162, endBlock: 13_557_162 } },
    });

    const delegations = await indexer.Delegation.getAll();
    const ensDelegations = delegations.filter(
      (d: any) => d.daoId === "ENS"
    );
    t.expect(ensDelegations.length).toBeGreaterThan(0);
  });

  it("creates AccountPower for ENS delegates", async (t) => {
    const indexer = createTestIndexer();

    await indexer.process({
      chains: { 1: { startBlock: 13_533_418, endBlock: 13_533_418 } },
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_557_162, endBlock: 13_557_162 } },
    });

    const powers = await indexer.AccountPower.getAll();
    const ensPowers = powers.filter((p: any) => p.daoId === "ENS");
    t.expect(ensPowers.length).toBeGreaterThan(0);
    t.expect(ensPowers[0]!.delegationsCount).toBeGreaterThanOrEqual(1);
  });

  it("creates FeedEvents for both TRANSFER and DELEGATION types", async (t) => {
    const indexer = createTestIndexer();

    await indexer.process({
      chains: { 1: { startBlock: 13_533_418, endBlock: 13_533_418 } },
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_557_162, endBlock: 13_557_162 } },
    });

    const feedEvents = await indexer.FeedEvent.getAll();
    const transferEvents = feedEvents.filter(
      (fe: any) => fe.type === "TRANSFER"
    );
    const delegationEvents = feedEvents.filter(
      (fe: any) => fe.type === "DELEGATION"
    );

    t.expect(transferEvents.length).toBeGreaterThan(0);
    t.expect(delegationEvents.length).toBeGreaterThan(0);
  });

  it("snapshots full ENS delegation state", async (t) => {
    const indexer = createTestIndexer();

    await indexer.process({
      chains: { 1: { startBlock: 13_533_418, endBlock: 13_533_418 } },
    });

    const result = await indexer.process({
      chains: { 1: { startBlock: 13_557_162, endBlock: 13_557_162 } },
    });

    t.expect(result.changes).toMatchInlineSnapshot(`
      [
        {
          "Account": {
            "sets": [
              {
                "id": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
              },
            ],
          },
          "AccountBalance": {
            "sets": [
              {
                "account_id": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                "balance": 0n,
                "delegate": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                "id": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0_0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
                "token_id": "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
              },
            ],
          },
          "AccountPower": {
            "sets": [
              {
                "account_id": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                "daoId": "ENS",
                "delegationsCount": 1,
                "id": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                "lastVoteTimestamp": 0n,
                "proposalsCount": 0,
                "votesCount": 0,
                "votingPower": 0n,
              },
            ],
          },
          "Delegation": {
            "sets": [
              {
                "daoId": "ENS",
                "delegateAccount_id": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                "delegatedValue": 0n,
                "delegatorAccount_id": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                "id": "0xaad38247fd089deb44e7f7a5a0a105f5cda0a213cc87b26939c493544c78dc2e_0x59D6779Eca6c91eD7679E261b54299b5155EAdF0_0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                "isCex": false,
                "isDex": false,
                "isLending": false,
                "isTotal": false,
                "logIndex": 631,
                "previousDelegate": "0x0000000000000000000000000000000000000000",
                "timestamp": 1636122963n,
                "transactionHash": "0xaad38247fd089deb44e7f7a5a0a105f5cda0a213cc87b26939c493544c78dc2e",
                "type": undefined,
              },
            ],
          },
          "FeedEvent": {
            "sets": [
              {
                "id": "0xaad38247fd089deb44e7f7a5a0a105f5cda0a213cc87b26939c493544c78dc2e_631",
                "metadata": {
                  "amount": "0",
                  "delegate": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                  "delegator": "0x59D6779Eca6c91eD7679E261b54299b5155EAdF0",
                  "previousDelegate": "0x0000000000000000000000000000000000000000",
                },
                "timestamp": 1636122963n,
                "type": "DELEGATION",
                "value": 0n,
              },
            ],
          },
          "block": 13557162,
          "chainId": 1,
          "eventsProcessed": 1,
        },
      ]
    `);
  });
});
