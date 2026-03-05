"use client";

import { useQuery } from "urql";
import {
  GLOBAL_STATS_QUERY,
  RECENT_ORDER_FILLS_QUERY,
  FPMM_MARKETS_QUERY,
  RECENT_ORDERS_MATCHED_QUERY,
} from "@/lib/queries";
import {
  formatUSDC,
  formatScaledVolume,
  formatNumber,
  formatTimestamp,
  truncateAddress,
  timeAgo,
} from "@/lib/format";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Layers,
  Activity,
  Repeat,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [statsResult] = useQuery({ query: GLOBAL_STATS_QUERY });
  const [fillsResult] = useQuery({
    query: RECENT_ORDER_FILLS_QUERY,
    variables: { limit: 10 },
  });
  const [matchesResult] = useQuery({
    query: RECENT_ORDERS_MATCHED_QUERY,
    variables: { limit: 10 },
  });
  const [fpmmResult] = useQuery({
    query: FPMM_MARKETS_QUERY,
    variables: { limit: 5, offset: 0 },
  });

  const orderbook = statsResult.data?.Orderbook?.[0];
  const matchedGlobal = statsResult.data?.OrdersMatchedGlobal?.[0];
  const globalOI = statsResult.data?.GlobalOpenInterest?.[0];
  const globalBalance = statsResult.data?.GlobalUSDCBalance?.[0];
  const loading = statsResult.fetching;

  // Aggregate total trades from both orderbooks
  const totalTrades = orderbook
    ? formatNumber(orderbook.tradesQuantity)
    : "—";
  const totalVolume = orderbook
    ? formatScaledVolume(orderbook.scaledCollateralVolume)
    : "—";
  const openInterest = globalOI
    ? formatUSDC(globalOI.amount)
    : "—";
  const platformBalance = globalBalance
    ? formatUSDC(globalBalance.balance)
    : "—";

  const matchedTrades = matchedGlobal
    ? formatNumber(matchedGlobal.tradesQuantity)
    : "—";
  const matchedVolume = matchedGlobal
    ? formatScaledVolume(matchedGlobal.scaledCollateralVolume)
    : "—";

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="CTF Trades"
          value={totalTrades}
          icon={BarChart3}
          loading={loading}
          subtitle="Exchange fills"
        />
        <StatCard
          label="CTF Volume"
          value={totalVolume}
          icon={DollarSign}
          loading={loading}
          subtitle="Collateral traded"
        />
        <StatCard
          label="Matched Trades"
          value={matchedTrades}
          icon={Repeat}
          loading={loading}
          subtitle="Order matches"
        />
        <StatCard
          label="Matched Volume"
          value={matchedVolume}
          icon={TrendingUp}
          loading={loading}
          subtitle="Matched collateral"
        />
        <StatCard
          label="Open Interest"
          value={openInterest}
          icon={Layers}
          loading={loading}
          subtitle="Global OI"
        />
        <StatCard
          label="USDC Balance"
          value={platformBalance}
          icon={DollarSign}
          loading={loading}
          subtitle="Platform balance"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fills */}
        <div>
          <SectionHeader
            title="Recent Order Fills"
            icon={Activity}
            action={
              <Link
                href="/activity"
                className="text-[10px] text-accent-cyan hover:underline flex items-center gap-0.5"
              >
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
          />
          <DataTable
            loading={fillsResult.fetching}
            columns={[
              {
                key: "time",
                label: "Time",
                render: (r: Record<string, string>) => (
                  <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
                ),
              },
              {
                key: "maker",
                label: "Maker",
                render: (r: Record<string, string>) => (
                  <Link
                    href={`/wallets/${r.maker}`}
                    className="text-accent-cyan hover:underline"
                  >
                    {truncateAddress(r.maker)}
                  </Link>
                ),
              },
              {
                key: "taker",
                label: "Taker",
                render: (r: Record<string, string>) => (
                  <Link
                    href={`/wallets/${r.taker}`}
                    className="text-accent-cyan hover:underline"
                  >
                    {truncateAddress(r.taker)}
                  </Link>
                ),
              },
              {
                key: "amount",
                label: "Amount",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums text-accent-green">
                    {formatUSDC(r.makerAmountFilled)}
                  </span>
                ),
              },
            ]}
            data={fillsResult.data?.OrderFilledEvent || []}
          />
        </div>

        {/* Recent Matches */}
        <div>
          <SectionHeader
            title="Recent Order Matches"
            icon={Repeat}
            action={
              <Link
                href="/activity"
                className="text-[10px] text-accent-cyan hover:underline flex items-center gap-0.5"
              >
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
          />
          <DataTable
            loading={matchesResult.fetching}
            columns={[
              {
                key: "time",
                label: "Time",
                render: (r: Record<string, string>) => (
                  <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
                ),
              },
              {
                key: "makerAsset",
                label: "Maker Asset",
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums">{r.makerAssetID}</span>
                ),
              },
              {
                key: "takerAsset",
                label: "Taker Asset",
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums">{r.takerAssetID}</span>
                ),
              },
              {
                key: "filled",
                label: "Filled",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums text-accent-green">
                    {formatUSDC(r.makerAmountFilled)}
                  </span>
                ),
              },
            ]}
            data={matchesResult.data?.OrdersMatchedEvent || []}
          />
        </div>
      </div>

      {/* Top FPMM Markets */}
      <div>
        <SectionHeader
          title="FPMM Markets"
          icon={TrendingUp}
          action={
            <Link
              href="/markets"
              className="text-[10px] text-accent-cyan hover:underline flex items-center gap-0.5"
            >
              All Markets <ArrowUpRight className="w-3 h-3" />
            </Link>
          }
        />
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
                  {r.id?.slice(0, 10)}...
                </Link>
              ),
            },
            {
              key: "trades",
              label: "Trades",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums">
                  {formatNumber(r.tradesQuantity)}
                </span>
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
          data={fpmmResult.data?.FixedProductMarketMaker || []}
          onRowClick={(r: Record<string, string>) => {
            window.location.href = `/markets/${r.id}`;
          }}
        />
      </div>
    </div>
  );
}
