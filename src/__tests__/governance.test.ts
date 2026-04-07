import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

describe("UNI Governor - ProposalCreated at Block 13_129_516", () => {
  it("creates ProposalsOnchain entity with correct fields", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 13_129_516, endBlock: 13_129_516 } },
    });

    const proposals = await indexer.ProposalsOnchain.getAll();
    t.expect(proposals.length).toBeGreaterThan(0);
    t.expect(proposals).toMatchInlineSnapshot(`
      [
        {
          "abstainVotes": 0n,
          "againstVotes": 0n,
          "calldatas": [
            "0x",
          ],
          "daoId": "UNI",
          "description": """",
          "endBlock": 13182976,
          "endTimestamp": 1631003292n,
          "forVotes": 0n,
          "id": "1",
          "logIndex": 38,
          "proposalType": undefined,
          "proposer_id": "0x81A7f10003D5cA866da96299Ff1D3C673afcc138",
          "signatures": [
            "",
          ],
          "startBlock": 13142656,
          "status": "PENDING",
          "targets": [
            "0x0000000000000000000000000000000000000000",
          ],
          "timestamp": 1630361772n,
          "title": """",
          "txHash": "0x52371bf3cc7dc7169203e70e2e914c31408021d38c6b44d8c8652099e2fa5c12",
          "values": [
            "0",
          ],
        },
      ]
    `);
  });

  it("sets proposal status to PENDING", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 13_129_516, endBlock: 13_129_516 } },
    });

    const proposals = await indexer.ProposalsOnchain.getAll();
    for (const p of proposals) {
      t.expect(p.status).toBe("PENDING");
    }
  });

  it("creates FeedEvent with type PROPOSAL", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 13_129_516, endBlock: 13_129_516 } },
    });

    const feedEvents = await indexer.FeedEvent.getAll();
    const proposalEvents = feedEvents.filter(
      (fe: any) => fe.type === "PROPOSAL"
    );
    t.expect(proposalEvents.length).toBeGreaterThan(0);
  });

  it("increments proposer's AccountPower proposalsCount", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: { 1: { startBlock: 13_129_516, endBlock: 13_129_516 } },
    });

    const powers = await indexer.AccountPower.getAll();
    const proposers = powers.filter((p: any) => p.proposalsCount > 0);
    t.expect(proposers.length).toBeGreaterThan(0);
  });
});

describe("UNI Governor - VoteCast at Block 13_553_145", () => {
  it("creates VotesOnchain entity", async (t) => {
    const indexer = createTestIndexer();

    // Preset a proposal so VoteCast can reference it
    indexer.ProposalsOnchain.set({
      id: "8",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress("0x0000000000000000000000000000000000000001"),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13550000,
      endBlock: 13600000,
      title: "Test",
      description: "Test proposal",
      timestamp: 1636000000n,
      logIndex: 0,
      endTimestamp: 1637000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_553_145, endBlock: 13_553_145 } },
    });

    const votes = await indexer.VotesOnchain.getAll();
    t.expect(votes.length).toBeGreaterThan(0);
    t.expect(votes).toMatchInlineSnapshot(`
      [
        {
          "daoId": "UNI",
          "id": "0xD724107AE1047b50B543aD4D940deE18e99261f1_9",
          "proposal_id": "9",
          "reason": "",
          "support": "1",
          "timestamp": 1636068638n,
          "txHash": "0xd1963da94947c2cd4f10867207fb5b12b08b242f120d8aadbdb73e26109eece6",
          "voter_id": "0xD724107AE1047b50B543aD4D940deE18e99261f1",
          "votingPower": 100000738338212320570n,
        },
      ]
    `);
  });

  it("updates proposal vote tallies", async (t) => {
    const indexer = createTestIndexer();

    // Preset proposal with id "9" to match the actual VoteCast event's proposalId
    indexer.ProposalsOnchain.set({
      id: "9",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress("0x0000000000000000000000000000000000000001"),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13550000,
      endBlock: 13600000,
      title: "Test",
      description: "Test proposal",
      timestamp: 1636000000n,
      logIndex: 0,
      endTimestamp: 1637000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_553_145, endBlock: 13_553_145 } },
    });

    const proposal = await indexer.ProposalsOnchain.get("9");
    // The VoteCast event at this block votes on proposal 9
    t.expect(proposal).toMatchInlineSnapshot(`
      {
        "abstainVotes": 0n,
        "againstVotes": 0n,
        "calldatas": [],
        "daoId": "UNI",
        "description": "Test proposal",
        "endBlock": 13600000,
        "endTimestamp": 1637000000n,
        "forVotes": 100000738338212320570n,
        "id": "9",
        "logIndex": 0,
        "proposalType": undefined,
        "proposer_id": "0x0000000000000000000000000000000000000001",
        "signatures": [],
        "startBlock": 13550000,
        "status": "ACTIVE",
        "targets": [],
        "timestamp": 1636000000n,
        "title": "Test",
        "txHash": "0x0",
        "values": [],
      }
    `);
  });

  it("creates FeedEvent with type VOTE", async (t) => {
    const indexer = createTestIndexer();

    indexer.ProposalsOnchain.set({
      id: "8",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress("0x0000000000000000000000000000000000000001"),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13550000,
      endBlock: 13600000,
      title: "Test",
      description: "Test proposal",
      timestamp: 1636000000n,
      logIndex: 0,
      endTimestamp: 1637000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_553_145, endBlock: 13_553_145 } },
    });

    const feedEvents = await indexer.FeedEvent.getAll();
    const voteEvents = feedEvents.filter((fe: any) => fe.type === "VOTE");
    t.expect(voteEvents.length).toBeGreaterThan(0);
  });

  it("updates voter's AccountPower votesCount", async (t) => {
    const indexer = createTestIndexer();

    indexer.ProposalsOnchain.set({
      id: "8",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress("0x0000000000000000000000000000000000000001"),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13550000,
      endBlock: 13600000,
      title: "Test",
      description: "Test proposal",
      timestamp: 1636000000n,
      logIndex: 0,
      endTimestamp: 1637000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_553_145, endBlock: 13_553_145 } },
    });

    const powers = await indexer.AccountPower.getAll();
    const voters = powers.filter((p: any) => p.votesCount > 0);
    t.expect(voters.length).toBeGreaterThan(0);
    t.expect(voters[0]!.lastVoteTimestamp).toBeGreaterThan(0n);
  });
});
