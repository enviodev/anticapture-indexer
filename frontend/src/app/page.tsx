"use client";

import { useQuery } from "@tanstack/react-query";
import { client, formatUSDC, formatNumber, timeAgo } from "@/lib/graphql";
import {
  GLOBAL_STATS,
  RECENT_ORDER_FILLS,
  RECENT_ORDERS_MATCHED,
  RECENT_SPLITS,
  RECENT_REDEMPTIONS,
} from "@/lib/queries";
import { StatCard } from "@/components/StatCard";
import { AddressLink } from "@/components/AddressLink";
import { PageHeader } from "@/components/PageHeader";
import {
  BarChart3,
  Activity,
  TrendingUp,
  Wallet,
  ArrowRightLeft,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["globalStats"],
    queryFn: () => client.request(GLOBAL_STATS),
  });

  const { data: recentFills } = useQuery({
    queryKey: ["recentFills", 0],
    queryFn: () =>
      client.request(RECENT_ORDER_FILLS, { limit: 8, offset: 0 }),
  });

  const { data: recentMatched } = useQuery({
    queryKey: ["recentMatched", 0],
    queryFn: () =>
      client.request(RECENT_ORDERS_MATCHED, { limit: 8, offset: 0 }),
  });

  const { data: recentSplits } = useQuery({
    queryKey: ["recentSplits", 0],
    queryFn: () => client.request(RECENT_SPLITS, { limit: 6, offset: 0 }),
  });

  const { data: recentRedemptions } = useQuery({
    queryKey: ["recentRedemptions", 0],
    queryFn: () => client.request(RECENT_REDEMPTIONS, { limit: 6, offset: 0 }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = stats as any;
  const orderbook = s?.Orderbook?.[0];
  const matched = s?.OrdersMatchedGlobal?.[0];
  const oi = s?.GlobalOpenInterest?.[0];
  const balance = s?.GlobalUSDCBalance?.[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        subtitle="Polymarket protocol overview — Polygon mainnet"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="CTF Volume"
          value={orderbook ? formatUSDC(orderbook.collateralVolume) : "..."}
          subValue="Exchange lifetime"
          icon={<BarChart3 size={14} />}
        />
        <StatCard
          label="Neg Risk Volume"
          value={
            matched
              ? `$${Number(matched.scaledCollateralVolume).toFixed(0)}`
              : "..."
          }
          subValue="NegRisk exchange"
          color="text-accent-amber"
          icon={<ArrowRightLeft size={14} />}
        />
        <StatCard
          label="CTF Trades"
          value={orderbook ? formatNumber(orderbook.tradesQuantity) : "..."}
          subValue={
            orderbook
              ? `${formatNumber(orderbook.buysQuantity)} buys / ${formatNumber(orderbook.sellsQuantity)} sells`
              : ""
          }
          color="text-accent-amber"
          icon={<Activity size={14} />}
        />
        <StatCard
          label="Neg Risk Trades"
          value={matched ? formatNumber(matched.tradesQuantity) : "..."}
          color="text-accent-amber"
          icon={<Zap size={14} />}
        />
        <StatCard
          label="Open Interest"
          value={oi ? formatUSDC(oi.amount) : "..."}
          subValue="Global OI"
          color="text-accent-blue"
          icon={<TrendingUp size={14} />}
        />
        <StatCard
          label="USDC Balance"
          value={balance ? formatUSDC(balance.balance) : "..."}
          subValue="Protocol balance"
          color="text-accent-purple"
          icon={<Wallet size={14} />}
        />
      </div>

      {/* Two column layout: Recent Fills + Matched */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Order Fills */}
        <div className="bg-bg-secondary border border-border rounded-md">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[0.7rem] text-text-secondary uppercase tracking-wider">
              Recent Order Fills (CTF Exchange)
            </span>
            <Link
              href="/orderbook"
              className="text-[0.65rem] text-accent-green hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Maker</th>
                  <th>Taker</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Fee</th>
                </tr>
              </thead>
              <tbody>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(recentFills as any)?.OrderFilledEvent?.map((fill: any) => (
                  <tr key={fill.id}>
                    <td className="text-text-muted">
                      {timeAgo(fill.timestamp)}
                    </td>
                    <td>
                      <AddressLink address={fill.maker} />
                    </td>
                    <td>
                      <AddressLink address={fill.taker} />
                    </td>
                    <td className="text-right text-accent-green">
                      {formatUSDC(fill.makerAmountFilled)}
                    </td>
                    <td className="text-right text-text-muted">
                      {formatUSDC(fill.fee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders Matched (NegRisk) */}
        <div className="bg-bg-secondary border border-border rounded-md">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[0.7rem] text-text-secondary uppercase tracking-wider">
              Recent Orders Matched (Neg Risk)
            </span>
            <Link
              href="/orderbook?tab=matched"
              className="text-[0.65rem] text-accent-green hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th className="text-right">Maker Asset</th>
                  <th className="text-right">Taker Asset</th>
                  <th className="text-right">Maker Amt</th>
                  <th className="text-right">Taker Amt</th>
                </tr>
              </thead>
              <tbody>
                {(recentMatched as any)?.OrdersMatchedEvent?.map(
                  (match: any) => (
                    <tr key={match.id}>
                      <td className="text-text-muted">
                        {timeAgo(match.timestamp)}
                      </td>
                      <td className="text-right font-mono text-text-secondary">
                        {match.makerAssetID}
                      </td>
                      <td className="text-right font-mono text-text-secondary">
                        {match.takerAssetID}
                      </td>
                      <td className="text-right text-accent-green">
                        {formatUSDC(match.makerAmountFilled)}
                      </td>
                      <td className="text-right text-accent-amber">
                        {formatUSDC(match.takerAmountFilled)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Splits */}
        <div className="bg-bg-secondary border border-border rounded-md">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[0.7rem] text-text-secondary uppercase tracking-wider">
              Recent Position Splits
            </span>
            <Link
              href="/activity?tab=splits"
              className="text-[0.65rem] text-accent-green hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Stakeholder</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(recentSplits as any)?.Split?.map((split: any) => (
                  <tr key={split.id}>
                    <td className="text-text-muted">
                      {timeAgo(split.timestamp)}
                    </td>
                    <td>
                      <AddressLink address={split.stakeholder} />
                    </td>
                    <td className="text-right text-accent-green">
                      {formatUSDC(split.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Redemptions */}
        <div className="bg-bg-secondary border border-border rounded-md">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[0.7rem] text-text-secondary uppercase tracking-wider">
              Recent Redemptions
            </span>
            <Link
              href="/activity?tab=redemptions"
              className="text-[0.65rem] text-accent-green hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Redeemer</th>
                  <th className="text-right">Payout</th>
                </tr>
              </thead>
              <tbody>
                {(recentRedemptions as any)?.Redemption?.map(
                  (redemption: any) => (
                    <tr key={redemption.id}>
                      <td className="text-text-muted">
                        {timeAgo(redemption.timestamp)}
                      </td>
                      <td>
                        <AddressLink address={redemption.redeemer} />
                      </td>
                      <td className="text-right text-accent-green">
                        {formatUSDC(redemption.payout)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
