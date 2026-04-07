import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

describe("Multiple VoteCast Events in Same Block - Block 13_798_162", () => {
  it("creates multiple VotesOnchain entities", async (t) => {
    const indexer = createTestIndexer();

    // Preset a proposal so VoteCast events can reference it
    // Block 13_798_162 has 2 UNI VoteCast events
    indexer.ProposalsOnchain.set({
      id: "10",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 10",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    // Also preset proposal 11 in case the votes reference it
    indexer.ProposalsOnchain.set({
      id: "11",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 11",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_798_162, endBlock: 13_798_162 } },
    });

    const votes = await indexer.VotesOnchain.getAll();
    t.expect(votes.length).toBeGreaterThanOrEqual(2);
  });

  it("accumulates proposal vote tallies from multiple votes", async (t) => {
    const indexer = createTestIndexer();

    indexer.ProposalsOnchain.set({
      id: "10",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 10",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    indexer.ProposalsOnchain.set({
      id: "11",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 11",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_798_162, endBlock: 13_798_162 } },
    });

    // Check that at least one proposal has accumulated votes
    const proposals = await indexer.ProposalsOnchain.getAll();
    const votedProposals = proposals.filter(
      (p: any) =>
        p.forVotes > 0n || p.againstVotes > 0n || p.abstainVotes > 0n
    );
    t.expect(votedProposals.length).toBeGreaterThan(0);
  });

  it("creates multiple AccountPower records", async (t) => {
    const indexer = createTestIndexer();

    indexer.ProposalsOnchain.set({
      id: "10",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 10",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    indexer.ProposalsOnchain.set({
      id: "11",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 11",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_798_162, endBlock: 13_798_162 } },
    });

    const powers = await indexer.AccountPower.getAll();
    const voters = powers.filter((p: any) => p.votesCount > 0);
    t.expect(voters.length).toBeGreaterThanOrEqual(1);
  });

  it("creates multiple FeedEvent VOTE entries", async (t) => {
    const indexer = createTestIndexer();

    indexer.ProposalsOnchain.set({
      id: "10",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 10",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    indexer.ProposalsOnchain.set({
      id: "11",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 11",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_798_162, endBlock: 13_798_162 } },
    });

    const feedEvents = await indexer.FeedEvent.getAll();
    const voteEvents = feedEvents.filter((fe: any) => fe.type === "VOTE");
    t.expect(voteEvents.length).toBeGreaterThanOrEqual(2);
  });

  it("snapshots all votes from block 13_798_162", async (t) => {
    const indexer = createTestIndexer();

    indexer.ProposalsOnchain.set({
      id: "10",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 10",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    indexer.ProposalsOnchain.set({
      id: "11",
      txHash: "0x0",
      daoId: "UNI",
      proposer_id: getAddress(
        "0x0000000000000000000000000000000000000001"
      ),
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
      startBlock: 13750000,
      endBlock: 13850000,
      title: "Test Proposal 11",
      description: "Test proposal for multi-vote",
      timestamp: 1639000000n,
      logIndex: 0,
      endTimestamp: 1640000000n,
      status: "ACTIVE",
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      proposalType: undefined,
    });

    await indexer.process({
      chains: { 1: { startBlock: 13_798_162, endBlock: 13_798_162 } },
    });

    const votes = await indexer.VotesOnchain.getAll();
    t.expect(votes).toMatchInlineSnapshot(`
      [
        {
          "daoId": "UNI",
          "id": "0x975edA58218ef5f9a4954A22e5C30FB591D3F36D_10",
          "proposal_id": "10",
          "reason": "",
          "support": "1",
          "timestamp": 1639415750n,
          "txHash": "0xddd099caf819719ce363dd89edecef5a85189b1b1020344281b0c57860b8fd8e",
          "voter_id": "0x975edA58218ef5f9a4954A22e5C30FB591D3F36D",
          "votingPower": 1000000000000000000n,
        },
        {
          "daoId": "UNI",
          "id": "0x3f8Ea4ceF86151E592Eb9E816051B54f55599cee_10",
          "proposal_id": "10",
          "reason": "",
          "support": "1",
          "timestamp": 1639415750n,
          "txHash": "0x735784bdb43236ddbe24212d1bbce7eeb40bf531c015c5a296822224f1faf5d8",
          "voter_id": "0x3f8Ea4ceF86151E592Eb9E816051B54f55599cee",
          "votingPower": 1000000000000000000n,
        },
      ]
    `);
  });
});
