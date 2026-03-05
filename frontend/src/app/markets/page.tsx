"use client";

import { useQuery } from "urql";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FPMM_MARKETS_QUERY,
  ALL_MARKETS_QUERY,
  ALL_GAMES_QUERY,
} from "@/lib/queries";
import {
  formatScaledVolume,
  formatNumber,
  truncateAddress,
} from "@/lib/format";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Store } from "lucide-react";

const PAGE_SIZE = 20;

type TabId = "fpmm" | "sports" | "games";

export default function MarketsPage() {
  return (
    <Suspense fallback={<div className="text-xs text-text-muted">Loading markets...</div>}>
      <MarketsContent />
    </Suspense>
  );
}

function MarketsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [tab, setTab] = useState<TabId>("fpmm");
  const [fpmmPage, setFpmmPage] = useState(0);
  const [sportsPage, setSportsPage] = useState(0);

  const [fpmmResult] = useQuery({
    query: FPMM_MARKETS_QUERY,
    variables: { limit: PAGE_SIZE + 1, offset: fpmmPage * PAGE_SIZE },
    pause: tab !== "fpmm",
  });

  const [sportsResult] = useQuery({
    query: ALL_MARKETS_QUERY,
    variables: { limit: PAGE_SIZE + 1, offset: sportsPage * PAGE_SIZE },
    pause: tab !== "sports",
  });

  const [gamesResult] = useQuery({
    query: ALL_GAMES_QUERY,
    variables: { limit: 50 },
    pause: tab !== "games",
  });

  const fpmmData = fpmmResult.data?.FixedProductMarketMaker || [];
  const sportsData = sportsResult.data?.Market || [];
  const gamesData = gamesResult.data?.Game || [];

  // Client-side search filter
  const filteredFpmm = searchQuery
    ? fpmmData.filter(
        (m: Record<string, string>) =>
          m.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.creator?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : fpmmData;

  const TABS: { id: TabId; label: string }[] = [
    { id: "fpmm", label: "FPMM Markets" },
    { id: "sports", label: "Sports Markets" },
    { id: "games", label: "Games" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <SectionHeader title="Markets Explorer" icon={Store} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-primary pb-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-accent-cyan text-accent-cyan"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {searchQuery && (
        <div className="text-xs text-text-muted">
          Filtering for: <span className="text-accent-amber">{searchQuery}</span>
        </div>
      )}

      {/* FPMM Markets Tab */}
      {tab === "fpmm" && (
        <>
          <DataTable
            loading={fpmmResult.fetching}
            columns={[
              {
                key: "id",
                label: "Market",
                render: (r: Record<string, string>) => (
                  <Link
                    href={`/markets/${r.id}`}
                    className="text-accent-cyan hover:underline"
                  >
                    {r.id?.slice(0, 14)}...
                  </Link>
                ),
              },
              {
                key: "creator",
                label: "Creator",
                render: (r: Record<string, string>) => (
                  <Link
                    href={`/wallets/${r.creator}`}
                    className="text-text-secondary hover:text-accent-cyan"
                  >
                    {truncateAddress(r.creator)}
                  </Link>
                ),
              },
              {
                key: "trades",
                label: "Trades",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums">{formatNumber(r.tradesQuantity)}</span>
                ),
              },
              {
                key: "volume",
                label: "Volume",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums text-accent-green">
                    {formatScaledVolume(r.scaledCollateralVolume)}
                  </span>
                ),
              },
              {
                key: "buyVol",
                label: "Buy Vol",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums text-accent-green">
                    {formatScaledVolume(r.scaledCollateralBuyVolume)}
                  </span>
                ),
              },
              {
                key: "sellVol",
                label: "Sell Vol",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums text-accent-red">
                    {formatScaledVolume(r.scaledCollateralSellVolume)}
                  </span>
                ),
              },
              {
                key: "liquidity",
                label: "Liquidity",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums">
                    {formatScaledVolume(r.scaledLiquidityParameter)}
                  </span>
                ),
              },
              {
                key: "prices",
                label: "Outcomes",
                render: (r: Record<string, string[]>) => {
                  const prices = r.outcomeTokenPrices || [];
                  return (
                    <div className="flex gap-1">
                      {prices.slice(0, 3).map((p: string, i: number) => {
                        const pct = (parseFloat(p) * 100).toFixed(0);
                        return (
                          <Badge
                            key={i}
                            label={`${pct}%`}
                            variant={i === 0 ? "green" : i === 1 ? "red" : "amber"}
                          />
                        );
                      })}
                    </div>
                  );
                },
              },
            ]}
            data={filteredFpmm.slice(0, PAGE_SIZE)}
            onRowClick={(r: Record<string, string>) => {
              window.location.href = `/markets/${r.id}`;
            }}
          />
          <Pagination
            page={fpmmPage}
            hasMore={fpmmData.length > PAGE_SIZE}
            onPrev={() => setFpmmPage((p) => Math.max(0, p - 1))}
            onNext={() => setFpmmPage((p) => p + 1)}
          />
        </>
      )}

      {/* Sports Markets Tab */}
      {tab === "sports" && (
        <>
          <DataTable
            loading={sportsResult.fetching}
            columns={[
              {
                key: "id",
                label: "Market ID",
                render: (r: Record<string, string>) => (
                  <span className="text-accent-cyan">{r.id?.slice(0, 14)}...</span>
                ),
              },
              {
                key: "gameId",
                label: "Game",
                render: (r: Record<string, string>) => (
                  <span className="text-text-secondary">{r.gameId?.slice(0, 14)}...</span>
                ),
              },
              {
                key: "state",
                label: "State",
                render: (r: Record<string, string>) => {
                  const s = r.state;
                  const variant =
                    s === "Active" ? "green" : s === "Resolved" ? "blue" : s === "Paused" ? "amber" : "muted";
                  return <Badge label={s} variant={variant} />;
                },
              },
              {
                key: "type",
                label: "Type",
                render: (r: Record<string, string>) => (
                  <span className="text-text-muted">{r.marketType}</span>
                ),
              },
              {
                key: "line",
                label: "Line",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums">{r.line}</span>
                ),
              },
            ]}
            data={sportsData.slice(0, PAGE_SIZE)}
          />
          <Pagination
            page={sportsPage}
            hasMore={sportsData.length > PAGE_SIZE}
            onPrev={() => setSportsPage((p) => Math.max(0, p - 1))}
            onNext={() => setSportsPage((p) => p + 1)}
          />
        </>
      )}

      {/* Games Tab */}
      {tab === "games" && (
        <DataTable
          loading={gamesResult.fetching}
          columns={[
            {
              key: "id",
              label: "Game ID",
              render: (r: Record<string, string>) => (
                <span className="text-accent-cyan">{r.id?.slice(0, 14)}...</span>
              ),
            },
            {
              key: "state",
              label: "State",
              render: (r: Record<string, string>) => {
                const s = r.state;
                const variant =
                  s === "Active" ? "green" : s === "Settled" ? "blue" : s === "Canceled" ? "red" : "muted";
                return <Badge label={s} variant={variant} />;
              },
            },
            {
              key: "home",
              label: "Home",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums font-bold">{r.homeScore}</span>
              ),
            },
            {
              key: "away",
              label: "Away",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums font-bold">{r.awayScore}</span>
              ),
            },
            {
              key: "ordering",
              label: "Ordering",
              render: (r: Record<string, string>) => (
                <span className="text-text-muted">{r.ordering}</span>
              ),
            },
          ]}
          data={gamesData}
        />
      )}
    </div>
  );
}
