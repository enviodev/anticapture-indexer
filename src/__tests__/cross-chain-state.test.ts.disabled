import { describe, it } from "vitest";
import { createTestIndexer } from "generated";
import { getAddress } from "viem";

const UNI_TOKEN = getAddress("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");
const COMP_TOKEN = getAddress("0xc00e94Cb662C3520282E6f5717214004A7f26888");
const ARB_TOKEN = getAddress("0x912CE59144191C1204E64559FE8253a0e49E6548");
const OP_TOKEN = getAddress("0x4200000000000000000000000000000000000042");
const SCR_TOKEN = getAddress("0xd29687c813D741E2F938F4aC377128810E217b1b");
const ZK_TOKEN = getAddress("0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E");

describe("Cross-Chain State Isolation", () => {
  it("processes ETH + ARB + OP simultaneously with separate Token entities", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: {
        1: { startBlock: 10_861_674, endBlock: 10_861_674 },
        42161: { startBlock: 70_398_215, endBlock: 70_398_215 },
        10: { startBlock: 6_491_116, endBlock: 6_491_116 },
      },
    });

    // Verify Token entities are separate per chain
    const uniToken = await indexer.Token.get(UNI_TOKEN);
    t.expect(uniToken).toBeDefined();
    t.expect(uniToken!.name).toBe("UNI");

    const compToken = await indexer.Token.get(COMP_TOKEN);
    t.expect(compToken).toBeDefined();
    t.expect(compToken!.name).toBe("COMP");

    const arbToken = await indexer.Token.get(ARB_TOKEN);
    t.expect(arbToken).toBeDefined();
    t.expect(arbToken!.name).toBe("ARB");

    const opToken = await indexer.Token.get(OP_TOKEN);
    t.expect(opToken).toBeDefined();
    t.expect(opToken!.name).toBe("OP");
  });

  it("has no cross-contamination of daoId values", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: {
        1: { startBlock: 10_861_674, endBlock: 10_861_674 },
        42161: { startBlock: 70_398_215, endBlock: 70_398_215 },
        10: { startBlock: 6_491_116, endBlock: 6_491_116 },
      },
    });

    const transfers = await indexer.Transfer.getAll();

    // UNI transfers should have daoId "UNI"
    const uniTransfers = transfers.filter(
      (t: any) => t.token_id === UNI_TOKEN
    );
    for (const transfer of uniTransfers) {
      t.expect(transfer.daoId).toBe("UNI");
    }

    // ARB transfers should have daoId "ARB"
    const arbTransfers = transfers.filter(
      (t: any) => t.token_id === ARB_TOKEN
    );
    for (const transfer of arbTransfers) {
      t.expect(transfer.daoId).toBe("ARB");
    }

    // OP transfers should have daoId "OP"
    const opTransfers = transfers.filter(
      (t: any) => t.token_id === OP_TOKEN
    );
    for (const transfer of opTransfers) {
      t.expect(transfer.daoId).toBe("OP");
    }
  });

  it("Transfer entities reference correct tokens", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: {
        1: { startBlock: 10_861_674, endBlock: 10_861_674 },
        42161: { startBlock: 70_398_215, endBlock: 70_398_215 },
        10: { startBlock: 6_491_116, endBlock: 6_491_116 },
      },
    });

    const transfers = await indexer.Transfer.getAll();
    const tokenIds = new Set(
      transfers.map((t: any) => t.token_id)
    );

    // Should have transfers for UNI (or COMP) on ETH, ARB on Arbitrum, OP on Optimism
    t.expect(tokenIds.size).toBeGreaterThanOrEqual(3);
  });

  it("processes zkSync + Scroll as additional chains", async (t) => {
    const indexer = createTestIndexer();

    // First process 3 chains
    await indexer.process({
      chains: {
        1: { startBlock: 10_861_674, endBlock: 10_861_674 },
        42161: { startBlock: 70_398_215, endBlock: 70_398_215 },
        10: { startBlock: 6_491_116, endBlock: 6_491_116 },
      },
    });

    // Then process 2 more chains
    await indexer.process({
      chains: {
        324: { startBlock: 34_572_100, endBlock: 34_572_100 },
        534352: { startBlock: 9_590_019, endBlock: 9_590_019 },
      },
    });

    // Verify all 5+ chains' tokens exist
    const zkToken = await indexer.Token.get(ZK_TOKEN);
    t.expect(zkToken).toBeDefined();
    t.expect(zkToken!.name).toBe("ZK");

    const scrToken = await indexer.Token.get(SCR_TOKEN);
    t.expect(scrToken).toBeDefined();
    t.expect(scrToken!.name).toBe("SCR");

    // Previous tokens should still exist
    const uniToken = await indexer.Token.get(UNI_TOKEN);
    t.expect(uniToken).toBeDefined();

    const arbToken = await indexer.Token.get(ARB_TOKEN);
    t.expect(arbToken).toBeDefined();

    const opToken = await indexer.Token.get(OP_TOKEN);
    t.expect(opToken).toBeDefined();
  });

  it("counts total entities per type across all chains", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({
      chains: {
        1: { startBlock: 10_861_674, endBlock: 10_861_674 },
        42161: { startBlock: 70_398_215, endBlock: 70_398_215 },
        10: { startBlock: 6_491_116, endBlock: 6_491_116 },
        324: { startBlock: 34_572_100, endBlock: 34_572_100 },
        534352: { startBlock: 9_590_019, endBlock: 9_590_019 },
      },
    });

    const tokens = await indexer.Token.getAll();
    const transfers = await indexer.Transfer.getAll();
    const accounts = await indexer.Account.getAll();
    const balances = await indexer.AccountBalance.getAll();

    // At least one token per chain (some chains may create multiple)
    t.expect(tokens.length).toBeGreaterThanOrEqual(5);
    t.expect(transfers.length).toBeGreaterThanOrEqual(5);
    t.expect(accounts.length).toBeGreaterThanOrEqual(5);
    t.expect(balances.length).toBeGreaterThanOrEqual(5);
  });
});
