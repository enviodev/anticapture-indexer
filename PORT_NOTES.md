# Anticapture Indexer — Envio Port Notes

This repo is a 1:1 port of the Anticapture [Ponder indexer](https://github.com/blockful/anticapture/tree/main/apps/indexer) onto the [Envio HyperIndex](https://docs.envio.dev) framework. The goal is to evaluate migrating from Ponder → Envio for the 14-DAO governance indexing workload.

**Source of truth for business logic:** `../anticapture/apps/indexer/` (Ponder + Drizzle).
**This repo:** `./` (Envio HyperIndex + generated GraphQL).

---

## Port status: 1:1 on Ethereum

All entities, event handlers, supply metrics, and address constants are preserved exactly. What differs from Ponder is deployment surface (which chains are active) and three write-path toggles, both reversible via config.

### What's ported

| Area | Count | Status |
|------|-------|--------|
| Entities (`schema.graphql`) | 14 | 1:1 with Ponder `ponder.schema.ts` |
| Enums (MetricType, EventType) | 2 | 1:1 |
| DAO handler modules (`src/handlers/`) | 14 | 1:1 — mirrors `src/indexer/` in Ponder |
| Shared event handlers (`src/eventHandlers/`) | 5 + metrics/ | 1:1 logic, adapted to Envio API |
| ABI files (`abis/`) | 31 | Extracted from Ponder TS ABI modules |
| Address constants (`src/lib/constants.ts`) | ~900 lines | Direct copy |

### What's different by design

| Change | Reason |
|--------|--------|
| (previously) Non-Ethereum chains / write toggles disabled | Temporary gating for faster initial backfill. **Currently all chains active and all toggles `true`** — full Ponder parity. The gating mechanism is documented below for future use. |
| Composite PKs → synthetic string IDs | Envio has no composite primary keys. Centralized in `src/lib/id-helpers.ts`. |
| One named contract per DAO (`UNIToken`, `ENSToken`, …) | Cleaner per-DAO typed handlers vs. sharing a single `ERC20Token`; no multi-dispatch. |
| `DAO_ID` env var → address-based router | `src/lib/dao-router.ts` maps contract address → DAO metadata, so one process handles all DAOs. |

---

## Write toggles

Four files carry boolean flags that gate writes to the highest-volume entities. **All are currently `false` to speed up multi-chain backfill.** Flip them to `true` for full Ponder write parity. These control **DB writes only** — no RPC, no external effects, no `createEffect` calls.

### Flag definitions

| Flag | Entity | Cost per event | What you lose when `false` |
|------|--------|----------------|-----------------------------|
| `WRITE_BALANCE_HISTORY` | `BalanceHistory` | 2 writes per Transfer (sender + receiver) | Historical balance-at-block lookups. `AccountBalance` (current state) is always updated regardless. |
| `WRITE_FEED_EVENTS` | `FeedEvent` | 1 write per Transfer / Vote / Delegation / Proposal / ProposalExtended / DelegateVotesChanged | The unified activity-feed stream (`type: "TRANSFER" \| "VOTE" \| ...`) used by the dashboard UI. |
| `WRITE_TRANSFERS` | `Transfer` | 1 read + 1 write per ERC20 Transfer | Per-transfer history (who sent what to whom, with CEX/DEX/lending flags). Balance state is unaffected. |

### Flag locations

All flags must be set consistently across files — they are declared at the top of each module:

```
src/eventHandlers/transfer.ts       → WRITE_BALANCE_HISTORY, WRITE_FEED_EVENTS, WRITE_TRANSFERS
src/eventHandlers/aave-shared.ts    → WRITE_BALANCE_HISTORY, WRITE_FEED_EVENTS, WRITE_TRANSFERS
src/eventHandlers/delegation.ts     → WRITE_FEED_EVENTS
src/eventHandlers/voting.ts         → WRITE_FEED_EVENTS
```

**Important:** `aave-shared.ts` is used only for AAVE/StkAave/AAave tokens (they have custom voting-power-on-transfer logic). Flipping `transfer.ts` flags without `aave-shared.ts` leaves AAVE out of sync.

### Cost comparison (per ERC20 Transfer)

| Configuration | DB ops per transfer |
|---------------|----------------------|
| All toggles `false` | ~4–5 (accounts, balances, supply fast-path) |
| All toggles `true` (current) | ~9–10 |

### Storage impact (all toggles `true`, Ethereum from genesis)

`Transfer`, `BalanceHistory`, `FeedEvent` are the unbounded-growth tables. Ballpark **50–150M combined rows**, **~10–50 GB** on disk including indexes. Everything else (Token, Account, AccountBalance, AccountPower, ProposalsOnchain, DaoMetricsDayBucket, …) scales with entity cardinality and stays small.

If sync or DB size becomes a problem, the easiest lever is disabling `WRITE_BALANCE_HISTORY` first (it's the 2×-per-transfer amplifier), then `WRITE_TRANSFERS`, then `WRITE_FEED_EVENTS`.

---

## Chain activation

All five chains are currently active: **Ethereum (`id: 1`), Arbitrum (`42161`), Optimism (`10`), Scroll (`534352`), zkSync (`324`)**.

If you need to disable a chain for a faster backfill or to isolate problems, comment out its **network block** at the bottom of `config.yaml` (the `- id: X / contracts: ...` block under `chains:`). The per-contract event definitions higher up in the file can stay — they're harmless if no network references them. If you disable Arbitrum / Optimism / zkSync or cross-chain-specific tests, also rename the relevant test files to `.disabled` so they don't run:

```
src/__tests__/arb-delegation.test.ts
src/__tests__/op-delegation.test.ts
src/__tests__/cross-chain-state.test.ts
src/__tests__/multi-chain.test.ts
```

After toggling chains, run `pnpm codegen` before `pnpm dev`.

---

## Key design decisions

1. **Composite PKs → synthetic string IDs.** Envio has no composite keys, so `${txHash}_${from}_${to}` etc. All ID builders live in `src/lib/id-helpers.ts`.
2. **`onConflictDoUpdate` → get-then-set.** Envio has no upsert; every mutation is `await context.Entity.get(id)` → merge → `context.Entity.set(...)`. Reads are batched via `Promise.all` in hot paths for concurrency.
3. **Fast path in `updateAllSupplyMetrics`.** Single `Token` read with early exit if neither side of the transfer is a classified address (CEX / DEX / lending / treasury / burn / non-circulating), replacing Ponder's 7 serial reads.
4. **Solidity tuples are positional arrays, not objects.** Envio decodes `(address,uint256,bytes,uint8)` as `[to, value, data, operation]`, not `{to, value, data, operation}`. Applied in SCR `DelegateChanged` and Azorius `ProposalCreated`. Any new tuple handler needs `t[0]` access, not `t.to`.
5. **`viem` as explicit dependency.** Not just transitive — the hosted service needs it in `package.json` to resolve at runtime.
6. **`proposalType: undefined`, not `null`.** Envio schema typing quirk on optional fields.
7. **`ENVIO_` env var prefix.** The hosted service only exposes env vars with this prefix. See `CLAUDE.md`.
8. **Tests use real chain data with explicit block ranges**, not `simulate` mode. Simulate returned empty changesets for this codebase; real-block tests are slower but give meaningful diffs.

---

## Layout

```
anticapture-indexer/
├── config.yaml                          # Chains, contracts, events, start blocks
├── schema.graphql                       # 14 entities + 2 enums
├── abis/                                # 31 ABI JSON files
├── src/
│   ├── handlers/                        # 14 DAO handler modules — one file per DAO
│   │   ├── uni.ts  ens.ts  arb.ts  op.ts  gtc.ts
│   │   ├── nouns.ts  lil-nouns.ts  scr.ts  comp.ts
│   │   ├── obol.ts  zk.ts  shu.ts  fluid.ts  aave.ts
│   ├── eventHandlers/
│   │   ├── transfer.ts                  # tokenTransfer()  [WRITE_* flags]
│   │   ├── delegation.ts                # delegateChanged(), delegatedVotesChanged()
│   │   ├── voting.ts                    # voteCast(), proposalCreated(), updateProposalStatus(), proposalExtended()
│   │   ├── aave-shared.ts               # aaveTransfer(), aaveDelegateChanged()  [WRITE_* flags]
│   │   ├── shared.ts                    # ensureAccountExists(), storeDailyBucket(), handleTransaction()
│   │   └── metrics/
│   │       ├── index.ts                 # updateAllSupplyMetrics() — single Token read + fast path
│   │       ├── supply.ts  total.ts  delegated.ts  circulating.ts
│   └── lib/
│       ├── constants.ts                 # ~900 lines of addresses (CEX, DEX, lending, treasury, …)
│       ├── dao-router.ts                # address → DAO metadata lookup
│       ├── id-helpers.ts                # synthetic composite ID builders
│       ├── enums.ts  utils.ts  date-helpers.ts
├── src/__tests__/                       # 15 test files; 4 .disabled (multi-chain)
└── AGENTS.md  CLAUDE.md  README.md
```

---

## Running locally

```bash
pnpm install
pnpm codegen                 # after any schema.graphql or config.yaml change
TUI_OFF=true pnpm dev        # AI-friendly log output; GraphQL at http://localhost:8080 (password: testing)
pnpm tsc --noEmit            # type check
pnpm test                    # vitest, 30s timeout
```

---

## Upstream sync checklist

When pulling new commits from the Ponder source:

1. `cd ../anticapture && git fetch origin main`
2. Check for changes to `apps/indexer/`: `git log HEAD..origin/main --oneline -- apps/indexer/`
3. If zero commits touch `apps/indexer/`, no port work needed.
4. Ignore `apps/offchain-indexer/` — that's a separate service (Snapshot/Tally poller), not the onchain indexer.
5. Ignore `Dockerfile.indexer`, `infra/indexer/`, `railway.*` — deployment plumbing, doesn't affect handler logic.

Changes that **do** need porting: new DAO additions, new event handlers, schema changes, new address lists in `constants.ts`, changes to `eventHandlers/*.ts` shared logic.

---

## Known issues / gotchas

- **Test framework:** `simulate` mode returns empty changesets; tests use real HyperSync block ranges instead. Slower but correct.
- **Azorius tuples:** `ProposalCreated` emits a tuple-array `transactions` param. Must access positionally (`t[0]`, `t[1]`, `t[2]`) — named field access returns `undefined`. See `src/handlers/shu.ts`.
- **SCR partial delegation:** `newDelegatees` is a tuple array `(address, uint96)[]`. Iterate with positional access.
- **Worker crash after auto-exit:** Tests that auto-exit the indexer must run **last** in their file, otherwise subsequent tests hit a crashed worker. See existing tests for pattern.
- **Hosted service env:** Only vars prefixed `ENVIO_` are exposed at runtime.
