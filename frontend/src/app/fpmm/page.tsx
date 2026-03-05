"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  client,
  formatUSDC,
  formatNumber,
  timeAgo,
  shortenAddress,
  formatTimestamp,
} from "@/lib/graphql";
import {
  FPMM_LIST,
  FPMM_DETAIL,
  RECENT_FPMM_TRANSACTIONS,
  FPMM_TRANSACTIONS_BY_MARKET,
  FPMM_FUNDING_BY_POOL,
  POOL_MEMBERSHIPS_BY_POOL,
} from "@/lib/queries";
import { DataTable } from "@/components/DataTable";
import { AddressLink } from "@/components/AddressLink";
import { PageHeader } from "@/components/PageHeader";
import { TabSelector } from "@/components/TabSelector";
import { StatCard } from "@/components/StatCard";
import { Droplets, ArrowLeft } from "lucide-react";

const PAGE_SIZE = 25;

export default function FpmmPage() {
  const [tab, setTab] = useState("pools");
  const [page, setPage] = useState(0);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);

  // Pool list
  const { data: poolsData, isLoading: poolsLoading } = useQuery({
    queryKey: ["fpmmList", page],
    queryFn: () =>
      client.request(FPMM_LIST, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "pools" && !selectedPool,
  });

  // Pool detail
  const { data: poolDetail } = useQuery({
    queryKey: ["fpmmDetail", selectedPool],
    queryFn: () => client.request(FPMM_DETAIL, { id: selectedPool }),
    enabled: !!selectedPool,
  });

  // Recent FPMM transactions
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["fpmmTx", page, selectedPool],
    queryFn: () =>
      selectedPool
        ? client.request(FPMM_TRANSACTIONS_BY_MARKET, {
            marketId: selectedPool,
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
          })
        : client.request(RECENT_FPMM_TRANSACTIONS, {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
          }),
    enabled: tab === "transactions",
  });

  // Pool funding
  const { data: fundingData, isLoading: fundingLoading } = useQuery({
    queryKey: ["fpmmFunding", selectedPool, page],
    queryFn: () =>
      client.request(FPMM_FUNDING_BY_POOL, {
        fpmmId: selectedPool,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "funding" && !!selectedPool,
  });

  // Pool members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["fpmmMembers", selectedPool, page],
    queryFn: () =>
      client.request(POOL_MEMBERSHIPS_BY_POOL, {
        poolId: selectedPool,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "members" && !!selectedPool,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pools = (poolsData as any)?.FixedProductMarketMaker || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detail = (poolDetail as any)?.FixedProductMarketMaker_by_pk;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactions = (txData as any)?.FpmmTransaction || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const additions = (fundingData as any)?.FpmmFundingAddition || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removals = (fundingData as any)?.FpmmFundingRemoval || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const members = (membersData as any)?.FpmmPoolMembership || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="FPMM"
        subtitle="Fixed Product Market Makers — AMM pools"
      >
        {selectedPool && (
          <button
            onClick={() => {
              setSelectedPool(null);
              setTab("pools");
              setPage(0);
            }}
            className="flex items-center gap-1 text-[0.7rem] text-accent-green hover:underline"
          >
            <ArrowLeft size={12} />
            Back to Pools
          </button>
        )}
      </PageHeader>

      {/* Pool Detail View */}
      {selectedPool && detail && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Volume"
            value={formatUSDC(detail.collateralVolume)}
            icon={<Droplets size={14} />}
          />
          <StatCard
            label="Total Trades"
            value={formatNumber(detail.tradesQuantity)}
            subValue={`${formatNumber(detail.buysQuantity)}B / ${formatNumber(detail.sellsQuantity)}S`}
            color="text-accent-amber"
          />
          <StatCard
            label="Fee Volume"
            value={formatUSDC(detail.feeVolume)}
            color="text-accent-purple"
          />
          <StatCard
            label="Liquidity"
            value={`$${Number(detail.scaledLiquidityParameter).toFixed(2)}`}
            subValue={`Supply: ${formatNumber(detail.totalSupply)}`}
            color="text-accent-blue"
          />
        </div>
      )}

      {selectedPool && detail && (
        <div className="bg-bg-secondary border border-border rounded-md p-4 space-y-2 text-[0.75rem]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-text-muted">Pool ID: </span>
              <span className="text-accent-blue font-mono">{detail.id}</span>
            </div>
            <div>
              <span className="text-text-muted">Creator: </span>
              <AddressLink address={detail.creator} />
            </div>
            <div>
              <span className="text-text-muted">Created: </span>
              <span className="text-text-primary">
                {formatTimestamp(detail.creationTimestamp)}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Fee: </span>
              <span className="text-text-primary">{detail.fee} bps</span>
            </div>
            <div>
              <span className="text-text-muted">Outcome Prices: </span>
              <span className="text-accent-green">
                [{detail.outcomeTokenPrices?.map((p: string) => Number(p).toFixed(4)).join(", ")}]
              </span>
            </div>
            <div>
              <span className="text-text-muted">Outcome Amounts: </span>
              <span className="text-text-secondary">
                [{detail.outcomeTokenAmounts?.map((a: string) => formatNumber(a)).join(", ")}]
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <TabSelector
        tabs={
          selectedPool
            ? [
                { key: "transactions", label: "Trades" },
                { key: "funding", label: "Funding" },
                { key: "members", label: "Members" },
              ]
            : [
                { key: "pools", label: "All Pools" },
                { key: "transactions", label: "Recent Trades" },
              ]
        }
        activeTab={tab}
        onTabChange={(t) => {
          setTab(t);
          setPage(0);
        }}
      />

      {/* Pool List */}
      {tab === "pools" && !selectedPool && (
        <DataTable
          columns={[
            {
              key: "id",
              header: "Pool",
              render: (r: any) => (
                <span
                  className="text-accent-blue font-mono cursor-pointer hover:underline"
                  onClick={() => {
                    setSelectedPool(r.id);
                    setTab("transactions");
                    setPage(0);
                  }}
                >
                  {shortenAddress(r.id)}
                </span>
              ),
            },
            {
              key: "creator",
              header: "Creator",
              render: (r: any) => <AddressLink address={r.creator} />,
            },
            {
              key: "trades",
              header: "Trades",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-text-primary">
                  {formatNumber(r.tradesQuantity)}
                </span>
              ),
            },
            {
              key: "volume",
              header: "Volume",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-accent-green">
                  {formatUSDC(r.collateralVolume)}
                </span>
              ),
            },
            {
              key: "liquidity",
              header: "Liquidity",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-accent-blue">
                  ${Number(r.scaledLiquidityParameter).toFixed(2)}
                </span>
              ),
            },
            {
              key: "prices",
              header: "Prices",
              render: (r: any) => (
                <span className="text-text-secondary text-[0.65rem]">
                  [{r.outcomeTokenPrices?.map((p: string) => Number(p).toFixed(3)).join(", ")}]
                </span>
              ),
            },
          ]}
          data={pools}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={poolsLoading}
        />
      )}

      {/* Transactions */}
      {tab === "transactions" && (
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
              key: "user",
              header: "User",
              render: (r: any) => <AddressLink address={r.user} />,
            },
            {
              key: "market",
              header: "Market",
              render: (r: any) => (
                <span
                  className="text-accent-blue font-mono cursor-pointer hover:underline"
                  onClick={() => {
                    setSelectedPool(r.market_id);
                    setPage(0);
                  }}
                >
                  {shortenAddress(r.market_id)}
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
              key: "fee",
              header: "Fee",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-text-muted">
                  {formatUSDC(r.feeAmount)}
                </span>
              ),
            },
            {
              key: "outcome",
              header: "Outcome",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-text-secondary">{r.outcomeIndex}</span>
              ),
            },
          ]}
          data={transactions}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={txLoading}
        />
      )}

      {/* Funding */}
      {tab === "funding" && selectedPool && (
        <div className="space-y-4">
          <div className="text-[0.7rem] text-text-secondary uppercase tracking-wider">
            Funding Additions
          </div>
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
                key: "funder",
                header: "Funder",
                render: (r: any) => <AddressLink address={r.funder} />,
              },
              {
                key: "shares",
                header: "Shares Minted",
                align: "right" as const,
                render: (r: any) => (
                  <span className="text-accent-green">
                    {formatNumber(r.sharesMinted)}
                  </span>
                ),
              },
            ]}
            data={additions}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            loading={fundingLoading}
          />

          <div className="text-[0.7rem] text-text-secondary uppercase tracking-wider">
            Funding Removals
          </div>
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
                key: "funder",
                header: "Funder",
                render: (r: any) => <AddressLink address={r.funder} />,
              },
              {
                key: "collateral",
                header: "Collateral Removed",
                align: "right" as const,
                render: (r: any) => (
                  <span className="text-accent-red">
                    {formatUSDC(r.collateralRemoved)}
                  </span>
                ),
              },
              {
                key: "shares",
                header: "Shares Burnt",
                align: "right" as const,
                render: (r: any) => (
                  <span className="text-text-muted">
                    {formatNumber(r.sharesBurnt)}
                  </span>
                ),
              },
            ]}
            data={removals}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            loading={fundingLoading}
          />
        </div>
      )}

      {/* Members */}
      {tab === "members" && selectedPool && (
        <DataTable
          columns={[
            {
              key: "funder",
              header: "Funder",
              render: (r: any) => <AddressLink address={r.funder} />,
            },
            {
              key: "amount",
              header: "Amount",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-accent-green">
                  {formatNumber(r.amount)}
                </span>
              ),
            },
          ]}
          data={members}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={membersLoading}
        />
      )}
    </div>
  );
}
