"use client";

import { useQuery } from "urql";
import { use } from "react";
import Link from "next/link";
import {
  FPMM_MARKET_DETAIL_QUERY,
  FPMM_TRANSACTIONS_QUERY,
  MARKET_OPEN_INTEREST_QUERY,
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
  DollarSign,
  TrendingUp,
  Activity,
  ArrowLeft,
  Droplets,
  PieChart,
  ExternalLink,
} from "lucide-react";

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);

  const [marketResult] = useQuery({
    query: FPMM_MARKET_DETAIL_QUERY,
    variables: { id: decodedId },
  });

  const [txnsResult] = useQuery({
    query: FPMM_TRANSACTIONS_QUERY,
    variables: { limit: 20, market_id: decodedId },
  });

  const [oiResult] = useQuery({
    query: MARKET_OPEN_INTEREST_QUERY,
    variables: { id: decodedId },
  });

  const market = marketResult.data?.FixedProductMarketMaker_by_pk;
  const txns = txnsResult.data?.FpmmTransaction || [];
  const oi = oiResult.data?.MarketOpenInterest_by_pk;
  const loading = marketResult.fetching;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/markets"
        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-cyan transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Markets
      </Link>

      {/* Market Header */}
      <div className="bg-bg-card border border-border-primary rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">
              FPMM Market
            </div>
            <h1 className="text-sm font-bold text-text-primary break-all">
              {decodedId}
            </h1>
            {market && (
              <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                <span>
                  Creator:{" "}
                  <Link
                    href={`/wallets/${market.creator}`}
                    className="text-accent-cyan hover:underline"
                  >
                    {truncateAddress(market.creator)}
                  </Link>
                </span>
                <span>Created: {formatTimestamp(market.creationTimestamp)}</span>
                {market.creationTransactionHash && (
                  <a
                    href={`https://polygonscan.com/tx/${market.creationTransactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 text-accent-cyan hover:underline"
                  >
                    Tx <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Outcome Prices */}
        {market?.outcomeTokenPrices && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[10px] text-text-muted uppercase tracking-widest">
              Outcome Prices:
            </span>
            {market.outcomeTokenPrices.map((p: string, i: number) => {
              const pct = (parseFloat(p) * 100).toFixed(1);
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <Badge
                    label={`Outcome ${i}`}
                    variant={i === 0 ? "green" : i === 1 ? "red" : "amber"}
                  />
                  <span className="text-sm font-bold tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Volume"
          value={market ? formatScaledVolume(market.scaledCollateralVolume) : "—"}
          icon={DollarSign}
          loading={loading}
        />
        <StatCard
          label="Buy Volume"
          value={market ? formatScaledVolume(market.scaledCollateralBuyVolume) : "—"}
          icon={TrendingUp}
          loading={loading}
          trend="up"
        />
        <StatCard
          label="Sell Volume"
          value={market ? formatScaledVolume(market.scaledCollateralSellVolume) : "—"}
          icon={TrendingUp}
          loading={loading}
          trend="down"
        />
        <StatCard
          label="Trades"
          value={market ? formatNumber(market.tradesQuantity) : "—"}
          icon={BarChart3}
          loading={loading}
          subtitle={market ? `${formatNumber(market.buysQuantity)} buys / ${formatNumber(market.sellsQuantity)} sells` : undefined}
        />
        <StatCard
          label="Liquidity"
          value={market ? formatScaledVolume(market.scaledLiquidityParameter) : "—"}
          icon={Droplets}
          loading={loading}
        />
        <StatCard
          label="Open Interest"
          value={oi ? formatUSDC(oi.amount) : "—"}
          icon={PieChart}
          loading={oiResult.fetching}
        />
      </div>

      {/* Additional Details */}
      {market && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-bg-card border border-border-primary rounded-lg p-4 space-y-2">
            <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2">
              Market Details
            </div>
            <DetailRow label="Fee" value={`${Number(market.fee) / 1e16}%`} />
            <DetailRow label="Fee Volume" value={formatScaledVolume(market.scaledFeeVolume)} />
            <DetailRow label="Liquidity Adds" value={formatNumber(market.liquidityAddQuantity)} />
            <DetailRow label="Liquidity Removes" value={formatNumber(market.liquidityRemoveQuantity)} />
            <DetailRow label="Total Supply" value={formatNumber(market.totalSupply)} />
            <DetailRow label="Outcome Slots" value={String(market.outcomeSlotCount || "—")} />
          </div>
          <div className="bg-bg-card border border-border-primary rounded-lg p-4 space-y-2">
            <div className="text-[10px] text-text-muted uppercase tracking-widest mb-2">
              Token Amounts
            </div>
            {market.outcomeTokenAmounts?.map((amt: string, i: number) => (
              <DetailRow
                key={i}
                label={`Outcome ${i}`}
                value={formatUSDC(amt)}
              />
            ))}
            <div className="border-t border-border-primary pt-2 mt-2">
              <DetailRow label="Conditions" value={`${market.conditions?.length || 0} condition(s)`} />
              <DetailRow label="Collateral" value={truncateAddress(market.collateralToken)} />
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <SectionHeader title="Recent Transactions" icon={Activity} />
        <DataTable
          loading={txnsResult.fetching}
          columns={[
            {
              key: "time",
              label: "Time",
              render: (r: Record<string, string>) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "type",
              label: "Type",
              render: (r: Record<string, string>) => (
                <Badge
                  label={r.type}
                  variant={r.type === "Buy" ? "green" : "red"}
                />
              ),
            },
            {
              key: "user",
              label: "User",
              render: (r: Record<string, string>) => (
                <Link
                  href={`/wallets/${r.user}`}
                  className="text-accent-cyan hover:underline"
                >
                  {truncateAddress(r.user)}
                </Link>
              ),
            },
            {
              key: "amount",
              label: "Trade Amount",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-accent-green">
                  {formatUSDC(r.tradeAmount)}
                </span>
              ),
            },
            {
              key: "fee",
              label: "Fee",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-text-muted">
                  {formatUSDC(r.feeAmount)}
                </span>
              ),
            },
            {
              key: "outcome",
              label: "Outcome",
              render: (r: Record<string, string>) => (
                <Badge
                  label={`#${r.outcomeIndex}`}
                  variant={Number(r.outcomeIndex) === 0 ? "green" : "red"}
                />
              ),
            },
            {
              key: "tokens",
              label: "Tokens",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums">
                  {formatUSDC(r.outcomeTokensAmount)}
                </span>
              ),
            },
          ]}
          data={txns}
          emptyMessage="No transactions found for this market"
        />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="tabular-nums text-text-primary">{value}</span>
    </div>
  );
}
