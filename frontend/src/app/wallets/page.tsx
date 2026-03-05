"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, formatUSDC, formatTimestamp } from "@/lib/graphql";
import {
  WALLET_BY_SIGNER,
  POSITIONS_BY_USER,
  ORDER_FILLS_BY_MAKER,
  FPMM_TRANSACTIONS_BY_USER,
  SPLITS_BY_STAKEHOLDER,
} from "@/lib/queries";
import { DataTable } from "@/components/DataTable";
import { AddressLink } from "@/components/AddressLink";
import { PageHeader } from "@/components/PageHeader";
import { TabSelector } from "@/components/TabSelector";
import { SearchInput } from "@/components/SearchInput";
import { StatCard } from "@/components/StatCard";
import { formatNumber, timeAgo } from "@/lib/graphql";
import { Wallet, ArrowRightLeft, TrendingUp } from "lucide-react";

const PAGE_SIZE = 25;

export default function WalletsPage() {
  const [search, setSearch] = useState("");
  const [activeAddress, setActiveAddress] = useState("");
  const [tab, setTab] = useState("overview");
  const [page, setPage] = useState(0);

  const { data: walletData } = useQuery({
    queryKey: ["wallet", activeAddress],
    queryFn: () => client.request(WALLET_BY_SIGNER, { signer: activeAddress }),
    enabled: !!activeAddress,
  });

  const { data: orderData, isLoading: ordersLoading } = useQuery({
    queryKey: ["walletOrders", activeAddress, page],
    queryFn: () =>
      client.request(ORDER_FILLS_BY_MAKER, {
        maker: activeAddress,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "orders" && !!activeAddress,
  });

  const { data: posData, isLoading: posLoading } = useQuery({
    queryKey: ["walletPositions", activeAddress, page],
    queryFn: () =>
      client.request(POSITIONS_BY_USER, {
        user: activeAddress,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "positions" && !!activeAddress,
  });

  const { data: fpmmData, isLoading: fpmmLoading } = useQuery({
    queryKey: ["walletFpmm", activeAddress, page],
    queryFn: () =>
      client.request(FPMM_TRANSACTIONS_BY_USER, {
        user: activeAddress,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "fpmm" && !!activeAddress,
  });

  const { data: splitsData, isLoading: splitsLoading } = useQuery({
    queryKey: ["walletSplits", activeAddress, page],
    queryFn: () =>
      client.request(SPLITS_BY_STAKEHOLDER, {
        stakeholder: activeAddress,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "activity" && !!activeAddress,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wallets = (walletData as any)?.Wallet || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = (orderData as any)?.OrderFilledEvent || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const positions = (posData as any)?.UserPosition || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fpmmTxs = (fpmmData as any)?.FpmmTransaction || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const splits = (splitsData as any)?.Split || [];

  const wallet = wallets[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Wallet Explorer"
        subtitle="Explore wallet activity across the Polymarket protocol"
      />

      <div className="flex items-center gap-3">
        <div className="w-96">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Enter signer/wallet address (0x...) and press Enter"
            onSubmit={() => {
              setActiveAddress(search);
              setTab("overview");
              setPage(0);
            }}
          />
        </div>
        {activeAddress && (
          <button
            onClick={() => {
              setActiveAddress("");
              setSearch("");
              setTab("overview");
              setPage(0);
            }}
            className="text-[0.65rem] text-accent-red hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {!activeAddress && (
        <div className="bg-bg-secondary border border-border rounded-md p-8 text-center">
          <div className="text-text-muted text-sm mb-2">
            Enter a wallet or signer address to explore
          </div>
          <div className="text-text-muted text-[0.7rem]">
            View wallet details, order history, positions, FPMM trades, and CT
            activity
          </div>
        </div>
      )}

      {activeAddress && (
        <>
          {/* Wallet Info */}
          {wallet && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Wallet Balance"
                value={formatUSDC(wallet.balance)}
                icon={<Wallet size={14} />}
              />
              <StatCard
                label="Wallet Type"
                value={wallet.type}
                color="text-accent-blue"
              />
              <StatCard
                label="Created"
                value={formatTimestamp(wallet.createdAt)}
                color="text-text-secondary"
              />
              <StatCard
                label="Last Transfer"
                value={timeAgo(wallet.lastTransfer)}
                color="text-accent-amber"
              />
            </div>
          )}

          {!wallet && wallets.length === 0 && (
            <div className="bg-bg-secondary border border-border rounded-md p-3 text-[0.75rem] text-text-muted">
              No registered wallet found for this signer. Showing available
              on-chain data.
            </div>
          )}

          <div className="bg-bg-secondary border border-border rounded-md p-3 text-[0.75rem]">
            <span className="text-text-muted">Address: </span>
            <AddressLink address={activeAddress} short={false} />
          </div>

          {/* Tab Navigation */}
          <TabSelector
            tabs={[
              { key: "overview", label: "Overview" },
              { key: "orders", label: "Orders" },
              { key: "positions", label: "Positions" },
              { key: "fpmm", label: "FPMM Trades" },
              { key: "activity", label: "CT Activity" },
            ]}
            activeTab={tab}
            onTabChange={(t) => {
              setTab(t);
              setPage(0);
            }}
          />

          {tab === "overview" && (
            <div className="bg-bg-secondary border border-border rounded-md p-6 text-center text-text-muted text-sm">
              Select a tab above to explore this wallet&apos;s activity across
              different protocol modules
            </div>
          )}

          {tab === "orders" && (
            <DataTable
              columns={[
                {
                  key: "time",
                  header: "Time",
                  render: (r: any) => (
                    <span className="text-text-muted">
                      {timeAgo(r.timestamp)}
                    </span>
                  ),
                },
                {
                  key: "taker",
                  header: "Taker",
                  render: (r: any) => <AddressLink address={r.taker} />,
                },
                {
                  key: "makerAmt",
                  header: "Maker Amt",
                  align: "right" as const,
                  render: (r: any) => (
                    <span className="text-accent-green">
                      {formatUSDC(r.makerAmountFilled)}
                    </span>
                  ),
                },
                {
                  key: "takerAmt",
                  header: "Taker Amt",
                  align: "right" as const,
                  render: (r: any) => (
                    <span className="text-accent-amber">
                      {formatUSDC(r.takerAmountFilled)}
                    </span>
                  ),
                },
                {
                  key: "fee",
                  header: "Fee",
                  align: "right" as const,
                  render: (r: any) => (
                    <span className="text-text-muted">
                      {formatUSDC(r.fee)}
                    </span>
                  ),
                },
              ]}
              data={orders}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              loading={ordersLoading}
              emptyMessage="No order fills found as maker"
            />
          )}

          {tab === "positions" && (
            <DataTable
              columns={[
                {
                  key: "tokenId",
                  header: "Token ID",
                  render: (r: any) => (
                    <span className="text-accent-blue font-mono text-[0.65rem]">
                      {r.tokenId}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  header: "Amount",
                  align: "right" as const,
                  render: (r: any) => (
                    <span className="text-text-primary">
                      {formatNumber(r.amount)}
                    </span>
                  ),
                },
                {
                  key: "avgPrice",
                  header: "Avg Price",
                  align: "right" as const,
                  render: (r: any) => (
                    <span className="text-text-secondary">
                      {formatUSDC(r.avgPrice)}
                    </span>
                  ),
                },
                {
                  key: "pnl",
                  header: "Realized PnL",
                  align: "right" as const,
                  render: (r: any) => (
                    <span
                      className={
                        Number(r.realizedPnl) >= 0
                          ? "text-accent-green"
                          : "text-accent-red"
                      }
                    >
                      {formatUSDC(r.realizedPnl)}
                    </span>
                  ),
                },
              ]}
              data={positions}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              loading={posLoading}
              emptyMessage="No positions found"
            />
          )}

          {tab === "fpmm" && (
            <DataTable
              columns={[
                {
                  key: "time",
                  header: "Time",
                  render: (r: any) => (
                    <span className="text-text-muted">
                      {timeAgo(r.timestamp)}
                    </span>
                  ),
                },
                {
                  key: "type",
                  header: "Type",
                  render: (r: any) => (
                    <span
                      className={
                        r.type === "Buy"
                          ? "text-accent-green"
                          : "text-accent-red"
                      }
                    >
                      {r.type}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  header: "Trade Amt",
                  align: "right" as const,
                  render: (r: any) => (
                    <span className="text-accent-green">
                      {formatUSDC(r.tradeAmount)}
                    </span>
                  ),
                },
                {
                  key: "outcome",
                  header: "Outcome",
                  align: "right" as const,
                  render: (r: any) => (
                    <span className="text-text-secondary">
                      {r.outcomeIndex}
                    </span>
                  ),
                },
              ]}
              data={fpmmTxs}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              loading={fpmmLoading}
              emptyMessage="No FPMM trades found"
            />
          )}

          {tab === "activity" && (
            <DataTable
              columns={[
                {
                  key: "time",
                  header: "Time",
                  render: (r: any) => (
                    <span className="text-text-muted">
                      {timeAgo(r.timestamp)}
                    </span>
                  ),
                },
                {
                  key: "condition",
                  header: "Condition",
                  render: (r: any) => (
                    <span className="text-accent-purple font-mono text-[0.65rem]">
                      {r.condition}
                    </span>
                  ),
                },
                {
                  key: "amount",
                  header: "Amount",
                  align: "right" as const,
                  render: (r: any) => (
                    <span className="text-accent-green">
                      {formatUSDC(r.amount)}
                    </span>
                  ),
                },
              ]}
              data={splits}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              loading={splitsLoading}
              emptyMessage="No CT splits found"
            />
          )}
        </>
      )}
    </div>
  );
}
