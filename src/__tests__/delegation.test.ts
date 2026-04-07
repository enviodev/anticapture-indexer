import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const UNI_TOKEN = getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");

describe("UNI Delegation - Block 10_863_690", () => {
  it("creates Delegation entity on DelegateChanged event", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_863_690, endBlock: 10_863_690 } },
    });

    const delegations = await indexer.Delegation.getAll();
    t.expect(delegations.length).toBeGreaterThan(0);
    t.expect(delegations).toMatchInlineSnapshot(`
      [
        {
          "daoId": "UNI",
          "delegateAccount_id": "0x557847aA724eA004041522ee550e1aE14Ced6D7E",
          "delegatedValue": 0n,
          "delegatorAccount_id": "0x7Ce77efA0D84104b3806Af29B62814E6a27E427d",
          "id": "0x1a31db380ee03a6b066a682320e96411537f8f25b6bceae380551fe585482227_0x7Ce77efA0D84104b3806Af29B62814E6a27E427d_0x557847aA724eA004041522ee550e1aE14Ced6D7E",
          "isCex": false,
          "isDex": false,
          "isLending": false,
          "isTotal": false,
          "logIndex": 279,
          "previousDelegate": "0x0000000000000000000000000000000000000000",
          "timestamp": 1600133748n,
          "transactionHash": "0x1a31db380ee03a6b066a682320e96411537f8f25b6bceae380551fe585482227",
          "type": undefined,
        },
      ]
    `);
  });

  it("creates AccountPower for delegates", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_863_690, endBlock: 10_863_690 } },
    });

    const powers = await indexer.AccountPower.getAll();
    t.expect(powers.length).toBeGreaterThan(0);
    t.expect(powers).toMatchInlineSnapshot(`
      [
        {
          "account_id": "0x557847aA724eA004041522ee550e1aE14Ced6D7E",
          "daoId": "UNI",
          "delegationsCount": 1,
          "id": "0x557847aA724eA004041522ee550e1aE14Ced6D7E",
          "lastVoteTimestamp": 0n,
          "proposalsCount": 0,
          "votesCount": 0,
          "votingPower": 0n,
        },
      ]
    `);
  });

  it("updates AccountBalance delegate field", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_863_690, endBlock: 10_863_690 } },
    });

    const balances = await indexer.AccountBalance.getAll();
    // At least one balance should have a non-zero delegate
    const withDelegate = balances.filter(
      (b: any) =>
        b.delegate !== "0x0000000000000000000000000000000000000000"
    );
    t.expect(withDelegate.length).toBeGreaterThan(0);
  });

  it("creates FeedEvent with type DELEGATION", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_863_690, endBlock: 10_863_690 } },
    });

    const feedEvents = await indexer.FeedEvent.getAll();
    const delegationEvents = feedEvents.filter(
      (fe: any) => fe.type === "DELEGATION"
    );
    t.expect(delegationEvents.length).toBeGreaterThan(0);
  });
});

describe("UNI DelegateVotesChanged - Block 10_876_484", () => {
  it("creates VotingPowerHistory on DelegateVotesChanged", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_876_484, endBlock: 10_876_484 } },
    });

    const vpHistory = await indexer.VotingPowerHistory.getAll();
    t.expect(vpHistory.length).toBeGreaterThan(0);
    t.expect(vpHistory).toMatchInlineSnapshot(`
      [
        {
          "account_id": "0x272370BCF690FC496470429b0Bdc09b841Dd1CdE",
          "daoId": "UNI",
          "delta": 400096920000000000000n,
          "deltaMod": 400096920000000000000n,
          "id": "0x2dd49982dbf54d4d995864c10b8e8ac7caad53311c8123df932ae2a6040e1c42_0x272370BCF690FC496470429b0Bdc09b841Dd1CdE_356",
          "logIndex": 356,
          "timestamp": 1600303775n,
          "transactionHash": "0x2dd49982dbf54d4d995864c10b8e8ac7caad53311c8123df932ae2a6040e1c42",
          "votingPower": 400096920000000000000n,
        },
      ]
    `);
  });

  it("creates FeedEvent with type DELEGATION_VOTES_CHANGED", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 10_876_484, endBlock: 10_876_484 } },
    });

    const feedEvents = await indexer.FeedEvent.getAll();
    const vpcEvents = feedEvents.filter(
      (fe: any) => fe.type === "DELEGATION_VOTES_CHANGED"
    );
    t.expect(vpcEvents.length).toBeGreaterThan(0);
  });

  it("updates Token.delegatedSupply", async (t) => {
    const indexer = createTestIndexer();

    // Preset UNI token so delegatedSupply starts at 0
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
      chains: { 1: { startBlock: 10_876_484, endBlock: 10_876_484 } },
    });

    const token = await indexer.Token.get(UNI_TOKEN);
    // delegatedSupply should have changed from DelegateVotesChanged events
    t.expect(token!.delegatedSupply).toMatchInlineSnapshot(`400096920000000000000n`);
  });
});
