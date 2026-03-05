"use client";

import { useQuery } from "urql";
import { use } from "react";
import Link from "next/link";
import {
  WALLET_BY_SIGNER_QUERY,
  USER_POSITIONS_QUERY,
  WALLET_FILLS_QUERY,
  WALLET_FPMM_TXNS_QUERY,
} from "@/lib/queries";
import {
  formatUSDC,
  formatTimestamp,
  truncateAddress,
  truncateHash,
  formatNumber,
  timeAgo,
} from "@/lib/format";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable } from "@/components/ui/DataTable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import {
  Wallet,
  ArrowLeft,
  Activity,
  TrendingUp,
  DollarSign,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

type WalletTab = "positions" | "fills" | "fpmm";

export default function WalletDetailPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const addr = address.toLowerCase();
  const [tab, setTab] = useState<WalletTab>("positions");

  const [walletResult] = useQuery({
    query: WALLET_BY_SIGNER_QUERY,
    variables: { signer: addr },
  });

  const [positionsResult] = useQuery({
    query: USER_POSITIONS_QUERY,
    variables: { user: addr, limit: 50 },
    pause: tab !== "positions",
  });

  const [fillsResult] = useQuery({
    query: WALLET_FILLS_QUERY,
    variables: { address: addr, limit: 20 },
    pause: tab !== "fills",
  });

  const [fpmmResult] = useQuery({
    query: WALLET_FPMM_TXNS_QUERY,
    variables: { user: addr, limit: 20 },
    pause: tab !== "fpmm",
  });

  const wallets = walletResult.data?.Wallet || [];
  const wallet = wallets[0];
  const positions = positionsResult.data?.UserPosition || [];
  const makerFills = fillsResult.data?.maker || [];
  const takerFills = fillsResult.data?.taker || [];
  const allFills = [...makerFills, ...takerFills].sort(
    (a: Record<string, string>, b: Record<string, string>) => Number(b.timestamp) - Number(a.timestamp)
  );
  const fpmmTxns = fpmmResult.data?.FpmmTransaction || [];

  // Calculate aggregate P&L from positions
  const totalRealizedPnl = positions.reduce(
    (sum: number, p: Record<string, string>) => sum + Number(p.realizedPnl || 0),
    0
  );
  const totalPositionValue = positions.reduce(
    (sum: number, p: Record<string, string>) => sum + Number(p.amount || 0),
    0
  );

  const TABS: { id: WalletTab; label: string }[] = [
    { id: "positions", label: "Positions" },
    { id: "fills", label: "Order Fills" },
    { id: "fpmm", label: "FPMM Activity" },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/wallets"
        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-cyan transition-colors"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to Wallets
      </Link>

      {/* Address Header */}
      <div className="bg-bg-card border border-border-primary rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">
              Wallet Address
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-text-primary break-all font-mono">
                {addr}
              </h1>
              <button
                onClick={() => navigator.clipboard.writeText(addr)}
                className="p-1 text-text-muted hover:text-accent-cyan transition-colors"
                title="Copy address"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <a
                href={`https://polygonscan.com/address/${addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-text-muted hover:text-accent-cyan transition-colors"
                title="View on Polygonscan"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            {wallet && (
              <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
                <span>
                  Type: <Badge label={wallet.type} variant="cyan" />
                </span>
                <span>Created: {formatTimestamp(wallet.createdAt)}</span>
                <span>Last Transfer: {formatTimestamp(wallet.lastTransfer)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Wallet Balance"
          value={wallet ? formatUSDC(wallet.balance) : "—"}
          icon={DollarSign}
          loading={walletResult.fetching}
        />
        <StatCard
          label="Positions"
          value={String(positions.length)}
          icon={TrendingUp}
          loading={positionsResult.fetching && tab === "positions"}
        />
        <StatCard
          label="Position Value"
          value={formatUSDC(totalPositionValue)}
          icon={Activity}
          loading={positionsResult.fetching && tab === "positions"}
        />
        <StatCard
          label="Realized P&L"
          value={formatUSDC(totalRealizedPnl)}
          icon={TrendingUp}
          loading={positionsResult.fetching && tab === "positions"}
          trend={totalRealizedPnl >= 0 ? "up" : "down"}
        />
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

      {/* Positions */}
      {tab === "positions" && (
        <DataTable
          loading={positionsResult.fetching}
          emptyMessage="No positions found for this address"
          columns={[
            {
              key: "tokenId",
              label: "Token ID",
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-text-secondary">
                  {String(r.tokenId).slice(0, 12)}...
                </span>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums">{formatUSDC(r.amount)}</span>
              ),
            },
            {
              key: "avgPrice",
              label: "Avg Price",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums">{formatUSDC(r.avgPrice)}</span>
              ),
            },
            {
              key: "totalBought",
              label: "Total Bought",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums">{formatUSDC(r.totalBought)}</span>
              ),
            },
            {
              key: "pnl",
              label: "Realized P&L",
              align: "right" as const,
              render: (r: Record<string, string>) => {
                const pnl = Number(r.realizedPnl);
                return (
                  <span
                    className={`tabular-nums font-medium ${
                      pnl > 0
                        ? "text-accent-green"
                        : pnl < 0
                          ? "text-accent-red"
                          : "text-text-muted"
                    }`}
                  >
                    {pnl >= 0 ? "+" : ""}
                    {formatUSDC(r.realizedPnl)}
                  </span>
                );
              },
            },
          ]}
          data={positions}
        />
      )}

      {/* Order Fills */}
      {tab === "fills" && (
        <DataTable
          loading={fillsResult.fetching}
          emptyMessage="No order fills found for this address"
          columns={[
            {
              key: "time",
              label: "Time",
              render: (r: Record<string, string>) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "role",
              label: "Role",
              render: (r: Record<string, string>) => (
                <Badge
                  label={r.maker?.toLowerCase() === addr ? "Maker" : "Taker"}
                  variant={r.maker?.toLowerCase() === addr ? "cyan" : "purple"}
                />
              ),
            },
            {
              key: "counterparty",
              label: "Counterparty",
              render: (r: Record<string, string>) => {
                const cp =
                  r.maker?.toLowerCase() === addr ? r.taker : r.maker;
                return (
                  <Link
                    href={`/wallets/${cp}`}
                    className="text-accent-cyan hover:underline"
                  >
                    {truncateAddress(cp)}
                  </Link>
                );
              },
            },
            {
              key: "makerAmt",
              label: "Maker Amt",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums">
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
          data={allFills.slice(0, 20)}
        />
      )}

      {/* FPMM Activity */}
      {tab === "fpmm" && (
        <DataTable
          loading={fpmmResult.fetching}
          emptyMessage="No FPMM activity found for this address"
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
              key: "market",
              label: "Market",
              render: (r: Record<string, string>) => (
                <Link
                  href={`/markets/${r.market_id}`}
                  className="text-accent-cyan hover:underline"
                >
                  {r.market_id?.slice(0, 10)}...
                </Link>
              ),
            },
            {
              key: "amount",
              label: "Amount",
              align: "right" as const,
              render: (r: Record<string, string>) => (
                <span className="tabular-nums text-accent-green">
                  {formatUSDC(r.tradeAmount)}
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
          ]}
          data={fpmmTxns}
        />
      )}
    </div>
  );
}
