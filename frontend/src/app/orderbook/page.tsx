"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, formatUSDC, formatNumber, timeAgo } from "@/lib/graphql";
import {
  GLOBAL_STATS,
  RECENT_ORDER_FILLS,
  RECENT_ORDERS_MATCHED,
  ORDER_FILLS_BY_MAKER,
  ORDER_FILLS_BY_TAKER,
} from "@/lib/queries";
import { DataTable } from "@/components/DataTable";
import { StatCard } from "@/components/StatCard";
import { AddressLink } from "@/components/AddressLink";
import { PageHeader } from "@/components/PageHeader";
import { TabSelector } from "@/components/TabSelector";
import { SearchInput } from "@/components/SearchInput";
import { BarChart3, ArrowRightLeft } from "lucide-react";

const PAGE_SIZE = 25;

export default function OrderbookPage() {
  const [tab, setTab] = useState("fills");
  const [page, setPage] = useState(0);
  const [searchAddress, setSearchAddress] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searchRole, setSearchRole] = useState<"maker" | "taker">("maker");

  const { data: stats } = useQuery({
    queryKey: ["globalStats"],
    queryFn: () => client.request(GLOBAL_STATS),
  });

  const { data: fillsData, isLoading: fillsLoading } = useQuery({
    queryKey: ["orderFills", page],
    queryFn: () =>
      client.request(RECENT_ORDER_FILLS, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "fills" && !activeSearch,
  });

  const { data: matchedData, isLoading: matchedLoading } = useQuery({
    queryKey: ["ordersMatched", page],
    queryFn: () =>
      client.request(RECENT_ORDERS_MATCHED, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "matched",
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["orderSearch", activeSearch, searchRole, page],
    queryFn: () =>
      client.request(
        searchRole === "maker" ? ORDER_FILLS_BY_MAKER : ORDER_FILLS_BY_TAKER,
        {
          [searchRole]: activeSearch,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        }
      ),
    enabled: tab === "fills" && !!activeSearch,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = stats as any;
  const orderbook = s?.Orderbook?.[0];
  const matched = s?.OrdersMatchedGlobal?.[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fills = activeSearch
    ? (searchData as any)?.OrderFilledEvent || []
    : (fillsData as any)?.OrderFilledEvent || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchedEvents = (matchedData as any)?.OrdersMatchedEvent || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orderbook"
        subtitle="CTF Exchange order fills & NegRisk matched orders"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="CTF Volume"
          value={orderbook ? formatUSDC(orderbook.collateralVolume) : "..."}
          icon={<BarChart3 size={14} />}
        />
        <StatCard
          label="CTF Trades"
          value={orderbook ? formatNumber(orderbook.tradesQuantity) : "..."}
          subValue={
            orderbook
              ? `${formatNumber(orderbook.buysQuantity)}B / ${formatNumber(orderbook.sellsQuantity)}S`
              : ""
          }
          color="text-accent-amber"
        />
        <StatCard
          label="NegRisk Volume"
          value={
            matched
              ? `$${Number(matched.scaledCollateralVolume).toFixed(0)}`
              : "..."
          }
          icon={<ArrowRightLeft size={14} />}
          color="text-accent-blue"
        />
        <StatCard
          label="NegRisk Trades"
          value={matched ? formatNumber(matched.tradesQuantity) : "..."}
          color="text-accent-purple"
        />
      </div>

      {/* Tab Selector */}
      <div className="flex items-center justify-between">
        <TabSelector
          tabs={[
            { key: "fills", label: "Order Fills" },
            { key: "matched", label: "Orders Matched" },
          ]}
          activeTab={tab}
          onTabChange={(t) => {
            setTab(t);
            setPage(0);
          }}
        />

        {tab === "fills" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-md p-0.5">
              <button
                onClick={() => setSearchRole("maker")}
                className={`px-2 py-1 text-[0.65rem] rounded ${searchRole === "maker" ? "bg-bg-tertiary text-accent-green" : "text-text-muted"}`}
              >
                Maker
              </button>
              <button
                onClick={() => setSearchRole("taker")}
                className={`px-2 py-1 text-[0.65rem] rounded ${searchRole === "taker" ? "bg-bg-tertiary text-accent-green" : "text-text-muted"}`}
              >
                Taker
              </button>
            </div>
            <div className="w-72">
              <SearchInput
                value={searchAddress}
                onChange={setSearchAddress}
                placeholder="Search by address (0x...)"
                onSubmit={() => {
                  setActiveSearch(searchAddress);
                  setPage(0);
                }}
              />
            </div>
            {activeSearch && (
              <button
                onClick={() => {
                  setActiveSearch("");
                  setSearchAddress("");
                  setPage(0);
                }}
                className="text-[0.65rem] text-accent-red hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Data Tables */}
      {tab === "fills" && (
        <DataTable
          columns={[
            {
              key: "time",
              header: "Time",
              render: (r: any) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "tx",
              header: "Tx",
              render: (r: any) => (
                <AddressLink address={r.transactionHash} type="tx" />
              ),
            },
            {
              key: "maker",
              header: "Maker",
              render: (r: any) => <AddressLink address={r.maker} />,
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
                <span className="text-text-muted">{formatUSDC(r.fee)}</span>
              ),
            },
          ]}
          data={fills}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={fillsLoading || searchLoading}
        />
      )}

      {tab === "matched" && (
        <DataTable
          columns={[
            {
              key: "time",
              header: "Time",
              render: (r: any) => (
                <span className="text-text-muted">{timeAgo(r.timestamp)}</span>
              ),
            },
            {
              key: "makerAsset",
              header: "Maker Asset ID",
              render: (r: any) => (
                <span className="text-text-secondary font-mono">
                  {r.makerAssetID}
                </span>
              ),
            },
            {
              key: "takerAsset",
              header: "Taker Asset ID",
              render: (r: any) => (
                <span className="text-text-secondary font-mono">
                  {r.takerAssetID}
                </span>
              ),
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
          ]}
          data={matchedEvents}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={matchedLoading}
        />
      )}
    </div>
  );
}
