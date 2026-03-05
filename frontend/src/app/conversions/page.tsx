"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, formatUSDC, formatNumber, timeAgo, shortenAddress } from "@/lib/graphql";
import { RECENT_CONVERSIONS, RECENT_FEE_REFUNDS, FEE_REFUNDS_BY_REFUNDEE } from "@/lib/queries";
import { DataTable } from "@/components/DataTable";
import { AddressLink } from "@/components/AddressLink";
import { PageHeader } from "@/components/PageHeader";
import { TabSelector } from "@/components/TabSelector";
import { SearchInput } from "@/components/SearchInput";

const PAGE_SIZE = 25;

export default function ConversionsPage() {
  const [tab, setTab] = useState("conversions");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: convData, isLoading: convLoading } = useQuery({
    queryKey: ["conversions", page],
    queryFn: () =>
      client.request(RECENT_CONVERSIONS, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "conversions",
  });

  const { data: feeData, isLoading: feeLoading } = useQuery({
    queryKey: ["feeRefunds", page],
    queryFn: () =>
      client.request(RECENT_FEE_REFUNDS, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "fees" && !activeSearch,
  });

  const { data: feeSearchData, isLoading: feeSearchLoading } = useQuery({
    queryKey: ["feeRefundSearch", activeSearch, page],
    queryFn: () =>
      client.request(FEE_REFUNDS_BY_REFUNDEE, {
        refundee: activeSearch,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "fees" && !!activeSearch,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conversions = (convData as any)?.NegRiskConversion || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fees = activeSearch
    ? (feeSearchData as any)?.FeeRefunded || []
    : (feeData as any)?.FeeRefunded || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Conversions & Fees"
        subtitle="NegRisk position conversions and fee refunds"
      />

      <div className="flex items-center justify-between">
        <TabSelector
          tabs={[
            { key: "conversions", label: "NegRisk Conversions" },
            { key: "fees", label: "Fee Refunds" },
          ]}
          activeTab={tab}
          onTabChange={(t) => {
            setTab(t);
            setPage(0);
            setActiveSearch("");
            setSearch("");
          }}
        />

        {tab === "fees" && (
          <div className="flex items-center gap-2">
            <div className="w-72">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by refundee address..."
                onSubmit={() => {
                  setActiveSearch(search);
                  setPage(0);
                }}
              />
            </div>
            {activeSearch && (
              <button
                onClick={() => {
                  setActiveSearch("");
                  setSearch("");
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

      {tab === "conversions" && (
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
              key: "stakeholder",
              header: "Stakeholder",
              render: (r: any) => <AddressLink address={r.stakeholder} />,
            },
            {
              key: "market",
              header: "NegRisk Market",
              render: (r: any) => (
                <span
                  className="text-accent-purple font-mono"
                  title={r.negRiskMarketId}
                >
                  {shortenAddress(r.negRiskMarketId)}
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
            {
              key: "indexSet",
              header: "Index Set",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-text-secondary">{r.indexSet}</span>
              ),
            },
            {
              key: "questions",
              header: "Questions",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-text-muted">{r.questionCount}</span>
              ),
            },
          ]}
          data={conversions}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={convLoading}
        />
      )}

      {tab === "fees" && (
        <DataTable
          columns={[
            {
              key: "time",
              header: "Time",
              render: (r: any) => (
                <span className="text-text-muted">{r.timestamp}</span>
              ),
            },
            {
              key: "refundee",
              header: "Refundee",
              render: (r: any) => <AddressLink address={r.refundee} />,
            },
            {
              key: "orderHash",
              header: "Order Hash",
              render: (r: any) => (
                <span className="text-accent-blue font-mono" title={r.orderHash}>
                  {shortenAddress(r.orderHash)}
                </span>
              ),
            },
            {
              key: "refunded",
              header: "Refunded",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-accent-green">
                  {formatUSDC(r.feeRefunded)}
                </span>
              ),
            },
            {
              key: "charged",
              header: "Charged",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-accent-amber">
                  {formatUSDC(r.feeCharged)}
                </span>
              ),
            },
            {
              key: "negRisk",
              header: "NegRisk",
              render: (r: any) => (
                <span
                  className={
                    r.negRisk ? "text-accent-green" : "text-text-muted"
                  }
                >
                  {r.negRisk ? "Yes" : "No"}
                </span>
              ),
            },
          ]}
          data={fees}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={feeLoading || feeSearchLoading}
        />
      )}
    </div>
  );
}
