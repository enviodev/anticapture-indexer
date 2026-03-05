"use client";

import { useQuery } from "urql";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  RECENT_ORDER_FILLS_QUERY,
  RECENT_SPLITS_QUERY,
  RECENT_MERGES_QUERY,
  RECENT_REDEMPTIONS_QUERY,
  RECENT_CONVERSIONS_QUERY,
  FEE_REFUNDS_QUERY,
} from "@/lib/queries";
import {
  formatUSDC,
  truncateAddress,
  truncateHash,
  timeAgo,
} from "@/lib/format";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import {
  Activity,
  ArrowDownUp,
  Merge as MergeIcon,
  Split as SplitIcon,
  Gift,
  RefreshCw,
  DollarSign,
} from "lucide-react";

type FeedTab = "fills" | "splits" | "merges" | "redemptions" | "conversions" | "fees";

const TABS: { id: FeedTab; label: string; icon: React.ElementType }[] = [
  { id: "fills", label: "Order Fills", icon: ArrowDownUp },
  { id: "splits", label: "Splits", icon: SplitIcon },
  { id: "merges", label: "Merges", icon: MergeIcon },
  { id: "redemptions", label: "Redemptions", icon: Gift },
  { id: "conversions", label: "Conversions", icon: RefreshCw },
  { id: "fees", label: "Fee Refunds", icon: DollarSign },
];

const PAGE_SIZE = 25;

export default function ActivityPage() {
  const [tab, setTab] = useState<FeedTab>("fills");
  const [page, setPage] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Reset page when tab changes
  useEffect(() => setPage(0), [tab]);

  const [fillsResult, reexecuteFills] = useQuery({
    query: RECENT_ORDER_FILLS_QUERY,
    variables: { limit: PAGE_SIZE + 1, offset: page * PAGE_SIZE },
    pause: tab !== "fills",
    requestPolicy: autoRefresh ? "cache-and-network" : "cache-first",
  });

  const [splitsResult] = useQuery({
    query: RECENT_SPLITS_QUERY,
    variables: { limit: PAGE_SIZE + 1 },
    pause: tab !== "splits",
  });

  const [mergesResult] = useQuery({
    query: RECENT_MERGES_QUERY,
    variables: { limit: PAGE_SIZE + 1 },
    pause: tab !== "merges",
  });

  const [redemptionsResult] = useQuery({
    query: RECENT_REDEMPTIONS_QUERY,
    variables: { limit: PAGE_SIZE + 1 },
    pause: tab !== "redemptions",
  });

  const [conversionsResult] = useQuery({
    query: RECENT_CONVERSIONS_QUERY,
    variables: { limit: PAGE_SIZE + 1 },
    pause: tab !== "conversions",
  });

  const [feesResult] = useQuery({
    query: FEE_REFUNDS_QUERY,
    variables: { limit: PAGE_SIZE + 1 },
    pause: tab !== "fees",
  });

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      reexecuteFills({ requestPolicy: "network-only" });
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, reexecuteFills]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader title="Live Activity Feed" icon={Activity} />
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded border transition-colors ${
            autoRefresh
              ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
              : "bg-bg-tertiary border-border-secondary text-text-muted"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              autoRefresh ? "bg-accent-green animate-pulse-glow" : "bg-text-muted"
            }`}
          />
          {autoRefresh ? "AUTO-REFRESH ON" : "AUTO-REFRESH OFF"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-primary pb-0 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors -mb-px whitespace-nowrap ${
                tab === t.id
                  ? "border-accent-cyan text-accent-cyan"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className="w-3 h-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Order Fills */}
      {tab === "fills" && (
        <>
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
                key: "hash",
                label: "Tx Hash",
                render: (r: Record<string, string>) => (
                  <a
                    href={`https://polygonscan.com/tx/${r.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-cyan hover:underline"
                  >
                    {truncateHash(r.transactionHash)}
                  </a>
                ),
              },
              {
                key: "maker",
                label: "Maker",
                render: (r: Record<string, string>) => (
                  <Link
                    href={`/wallets/${r.maker}`}
                    className="text-text-secondary hover:text-accent-cyan"
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
                    className="text-text-secondary hover:text-accent-cyan"
                  >
                    {truncateAddress(r.taker)}
                  </Link>
                ),
              },
              {
                key: "makerAmt",
                label: "Maker Amt",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums text-accent-green">
                    {formatUSDC(r.makerAmountFilled)}
                  </span>
                ),
              },
              {
                key: "takerAmt",
                label: "Taker Amt",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums">
                    {formatUSDC(r.takerAmountFilled)}
                  </span>
                ),
              },
              {
                key: "fee",
                label: "Fee",
                align: "right" as const,
                render: (r: Record<string, string>) => (
                  <span className="tabular-nums text-text-muted">
                    {formatUSDC(r.fee)}
                  </span>
                ),
              },
            ]}
            data={(fillsResult.data?.OrderFilledEvent || []).slice(0, PAGE_SIZE)}
          />
          <Pagination
            page={page}
            hasMore={(fillsResult.data?.OrderFilledEvent || []).length > PAGE_SIZE}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}

      {/* Splits */}
      {tab === "splits" && (
        <DataTable
          loading={splitsResult.fetching}
          columns={[
            {
              key: "time",
              label: "Time",
              render: (r: Record<string, string>) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "stakeholder",
              label: "Stakeholder",
              render: (r: Record<string, string>) => (
                <Link
                  href={`/wallets/${r.stakeholder}`}
                  className="text-accent-cyan hover:underline"
                >
                  {truncateAddress(r.stakeholder)}
                </Link>
              ),
            },
            {
              key: "condition",
              label: "Condition",
              render: (r: Record<string, string>) => (
                <span className="text-text-secondary">
                  {r.condition?.slice(0, 14)}...
                </span>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-accent-green">
                  {formatUSDC(r.amount)}
                </span>
              ),
            },
          ]}
          data={(splitsResult.data?.Split || []).slice(0, PAGE_SIZE)}
        />
      )}

      {/* Merges */}
      {tab === "merges" && (
        <DataTable
          loading={mergesResult.fetching}
          columns={[
            {
              key: "time",
              label: "Time",
              render: (r: Record<string, string>) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "stakeholder",
              label: "Stakeholder",
              render: (r: Record<string, string>) => (
                <Link
                  href={`/wallets/${r.stakeholder}`}
                  className="text-accent-cyan hover:underline"
                >
                  {truncateAddress(r.stakeholder)}
                </Link>
              ),
            },
            {
              key: "condition",
              label: "Condition",
              render: (r: Record<string, string>) => (
                <span className="text-text-secondary">
                  {r.condition?.slice(0, 14)}...
                </span>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-accent-red">
                  {formatUSDC(r.amount)}
                </span>
              ),
            },
          ]}
          data={(mergesResult.data?.Merge || []).slice(0, PAGE_SIZE)}
        />
      )}

      {/* Redemptions */}
      {tab === "redemptions" && (
        <DataTable
          loading={redemptionsResult.fetching}
          columns={[
            {
              key: "time",
              label: "Time",
              render: (r: Record<string, string>) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "redeemer",
              label: "Redeemer",
              render: (r: Record<string, string>) => (
                <Link
                  href={`/wallets/${r.redeemer}`}
                  className="text-accent-cyan hover:underline"
                >
                  {truncateAddress(r.redeemer)}
                </Link>
              ),
            },
            {
              key: "condition",
              label: "Condition",
              render: (r: Record<string, string>) => (
                <span className="text-text-secondary">
                  {r.condition?.slice(0, 14)}...
                </span>
              ),
            },
            {
              key: "payout",
              label: "Payout",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-accent-green font-medium">
                  {formatUSDC(r.payout)}
                </span>
              ),
            },
          ]}
          data={(redemptionsResult.data?.Redemption || []).slice(0, PAGE_SIZE)}
        />
      )}

      {/* Conversions */}
      {tab === "conversions" && (
        <DataTable
          loading={conversionsResult.fetching}
          columns={[
            {
              key: "time",
              label: "Time",
              render: (r: Record<string, string>) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "stakeholder",
              label: "Stakeholder",
              render: (r: Record<string, string>) => (
                <Link
                  href={`/wallets/${r.stakeholder}`}
                  className="text-accent-cyan hover:underline"
                >
                  {truncateAddress(r.stakeholder)}
                </Link>
              ),
            },
            {
              key: "market",
              label: "NegRisk Market",
              render: (r: Record<string, string>) => (
                <span className="text-text-secondary">
                  {r.negRiskMarketId?.slice(0, 14)}...
                </span>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-accent-amber">
                  {formatUSDC(r.amount)}
                </span>
              ),
            },
            {
              key: "questions",
              label: "Questions",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-text-muted">
                  {r.questionCount}
                </span>
              ),
            },
          ]}
          data={(conversionsResult.data?.NegRiskConversion || []).slice(0, PAGE_SIZE)}
        />
      )}

      {/* Fee Refunds */}
      {tab === "fees" && (
        <DataTable
          loading={feesResult.fetching}
          columns={[
            {
              key: "time",
              label: "Time",
              render: (r: Record<string, string>) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "refundee",
              label: "Refundee",
              render: (r: Record<string, string>) => (
                <Link
                  href={`/wallets/${r.refundee}`}
                  className="text-accent-cyan hover:underline"
                >
                  {truncateAddress(r.refundee)}
                </Link>
              ),
            },
            {
              key: "refunded",
              label: "Refunded",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-accent-green">
                  {formatUSDC(r.feeRefunded)}
                </span>
              ),
            },
            {
              key: "charged",
              label: "Charged",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-accent-red">
                  {formatUSDC(r.feeCharged)}
                </span>
              ),
            },
            {
              key: "negRisk",
              label: "NegRisk",
              render: (r: Record<string, string | boolean>) => (
                <Badge
                  label={r.negRisk ? "Yes" : "No"}
                  variant={r.negRisk ? "amber" : "muted"}
                />
              ),
            },
          ]}
          data={(feesResult.data?.FeeRefunded || []).slice(0, PAGE_SIZE)}
        />
      )}
    </div>
  );
}
