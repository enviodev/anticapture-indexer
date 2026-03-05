"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, formatUSDC, formatNumber } from "@/lib/graphql";
import { POSITIONS_BY_USER } from "@/lib/queries";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";

const PAGE_SIZE = 25;

export default function PositionsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["positions", activeUser, page],
    queryFn: () =>
      client.request(POSITIONS_BY_USER, {
        user: activeUser,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: !!activeUser,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const positions = (data as any)?.UserPosition || [];

  // Compute aggregate stats
  const totalRealizedPnl = positions.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, p: any) => sum + Number(p.realizedPnl),
    0
  );
  const totalBought = positions.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, p: any) => sum + Number(p.totalBought),
    0
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Positions & PnL"
        subtitle="User position tracking with realized PnL"
      />

      <div className="flex items-center gap-3">
        <div className="w-96">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Enter user address (0x...) and press Enter"
            onSubmit={() => {
              setActiveUser(search);
              setPage(0);
            }}
          />
        </div>
        {activeUser && (
          <button
            onClick={() => {
              setActiveUser("");
              setSearch("");
              setPage(0);
            }}
            className="text-[0.65rem] text-accent-red hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {!activeUser && (
        <div className="bg-bg-secondary border border-border rounded-md p-8 text-center">
          <div className="text-text-muted text-sm mb-2">
            Enter a user address to view their positions
          </div>
          <div className="text-text-muted text-[0.7rem]">
            Positions are indexed by user address — search to explore PnL data
          </div>
        </div>
      )}

      {activeUser && positions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-bg-secondary border border-border rounded-md p-4">
            <div className="text-text-muted text-[0.65rem] uppercase tracking-wider mb-1">
              Active Positions
            </div>
            <div className="text-xl font-bold text-accent-blue">
              {positions.length}
            </div>
          </div>
          <div className="bg-bg-secondary border border-border rounded-md p-4">
            <div className="text-text-muted text-[0.65rem] uppercase tracking-wider mb-1">
              Realized PnL
            </div>
            <div
              className={`text-xl font-bold ${totalRealizedPnl >= 0 ? "text-accent-green" : "text-accent-red"}`}
            >
              {formatUSDC(totalRealizedPnl)}
            </div>
          </div>
          <div className="bg-bg-secondary border border-border rounded-md p-4">
            <div className="text-text-muted text-[0.65rem] uppercase tracking-wider mb-1">
              Total Bought
            </div>
            <div className="text-xl font-bold text-accent-amber">
              {formatUSDC(totalBought)}
            </div>
          </div>
        </div>
      )}

      {activeUser && (
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
              key: "totalBought",
              header: "Total Bought",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-accent-amber">
                  {formatUSDC(r.totalBought)}
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
          loading={isLoading}
          emptyMessage="No positions found for this user"
        />
      )}
    </div>
  );
}
