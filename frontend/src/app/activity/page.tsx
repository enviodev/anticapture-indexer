"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, formatUSDC, formatNumber, timeAgo, shortenAddress } from "@/lib/graphql";
import {
  RECENT_SPLITS,
  RECENT_MERGES,
  RECENT_REDEMPTIONS,
  SPLITS_BY_STAKEHOLDER,
  SPLITS_BY_CONDITION,
} from "@/lib/queries";
import { DataTable } from "@/components/DataTable";
import { AddressLink } from "@/components/AddressLink";
import { PageHeader } from "@/components/PageHeader";
import { TabSelector } from "@/components/TabSelector";
import { SearchInput } from "@/components/SearchInput";

const PAGE_SIZE = 25;

export default function ActivityPage() {
  const [tab, setTab] = useState("splits");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [searchType, setSearchType] = useState<"stakeholder" | "condition">(
    "stakeholder"
  );

  const { data: splitsData, isLoading: splitsLoading } = useQuery({
    queryKey: ["splits", page],
    queryFn: () =>
      client.request(RECENT_SPLITS, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "splits" && !activeSearch,
  });

  const { data: mergesData, isLoading: mergesLoading } = useQuery({
    queryKey: ["merges", page],
    queryFn: () =>
      client.request(RECENT_MERGES, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "merges",
  });

  const { data: redemptionsData, isLoading: redemptionsLoading } = useQuery({
    queryKey: ["redemptions", page],
    queryFn: () =>
      client.request(RECENT_REDEMPTIONS, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "redemptions",
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["splitSearch", activeSearch, searchType, page],
    queryFn: () =>
      client.request(
        searchType === "stakeholder"
          ? SPLITS_BY_STAKEHOLDER
          : SPLITS_BY_CONDITION,
        {
          [searchType]: activeSearch,
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
        }
      ),
    enabled: tab === "splits" && !!activeSearch,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const splits = activeSearch
    ? (searchResults as any)?.Split || []
    : (splitsData as any)?.Split || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merges = (mergesData as any)?.Merge || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const redemptions = (redemptionsData as any)?.Redemption || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Activity"
        subtitle="Conditional token splits, merges, and redemptions"
      />

      <div className="flex items-center justify-between">
        <TabSelector
          tabs={[
            { key: "splits", label: "Splits" },
            { key: "merges", label: "Merges" },
            { key: "redemptions", label: "Redemptions" },
          ]}
          activeTab={tab}
          onTabChange={(t) => {
            setTab(t);
            setPage(0);
            setActiveSearch("");
            setSearch("");
          }}
        />

        {tab === "splits" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-md p-0.5">
              <button
                onClick={() => setSearchType("stakeholder")}
                className={`px-2 py-1 text-[0.65rem] rounded ${searchType === "stakeholder" ? "bg-bg-tertiary text-accent-green" : "text-text-muted"}`}
              >
                Address
              </button>
              <button
                onClick={() => setSearchType("condition")}
                className={`px-2 py-1 text-[0.65rem] rounded ${searchType === "condition" ? "bg-bg-tertiary text-accent-green" : "text-text-muted"}`}
              >
                Condition
              </button>
            </div>
            <div className="w-72">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={`Search by ${searchType}...`}
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

      {tab === "splits" && (
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
              key: "condition",
              header: "Condition",
              render: (r: any) => (
                <span
                  className="text-accent-purple font-mono cursor-pointer hover:underline"
                  title={r.condition}
                >
                  {shortenAddress(r.condition)}
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
          loading={splitsLoading || searchLoading}
        />
      )}

      {tab === "merges" && (
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
              key: "condition",
              header: "Condition",
              render: (r: any) => (
                <span
                  className="text-accent-purple font-mono"
                  title={r.condition}
                >
                  {shortenAddress(r.condition)}
                </span>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-accent-amber">
                  {formatUSDC(r.amount)}
                </span>
              ),
            },
          ]}
          data={merges}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={mergesLoading}
        />
      )}

      {tab === "redemptions" && (
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
              key: "redeemer",
              header: "Redeemer",
              render: (r: any) => <AddressLink address={r.redeemer} />,
            },
            {
              key: "condition",
              header: "Condition",
              render: (r: any) => (
                <span
                  className="text-accent-purple font-mono"
                  title={r.condition}
                >
                  {shortenAddress(r.condition)}
                </span>
              ),
            },
            {
              key: "payout",
              header: "Payout",
              align: "right" as const,
              render: (r: any) => (
                <span className="text-accent-green">
                  {formatUSDC(r.payout)}
                </span>
              ),
            },
            {
              key: "indexSets",
              header: "Index Sets",
              render: (r: any) => (
                <span className="text-text-muted text-[0.7rem]">
                  [{r.indexSets?.join(", ")}]
                </span>
              ),
            },
          ]}
          data={redemptions}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={redemptionsLoading}
        />
      )}
    </div>
  );
}
