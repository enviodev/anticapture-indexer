"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, shortenAddress } from "@/lib/graphql";
import { GAMES_ALL, GAMES_LIST, MARKETS_BY_GAME, MARKETS_BY_STATE } from "@/lib/queries";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { TabSelector } from "@/components/TabSelector";
import { SearchInput } from "@/components/SearchInput";

const PAGE_SIZE = 25;

function StateBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    Created: "text-accent-blue bg-accent-blue/10",
    Active: "text-accent-green bg-accent-green/10",
    Settled: "text-accent-amber bg-accent-amber/10",
    Canceled: "text-accent-red bg-accent-red/10",
    Paused: "text-text-muted bg-bg-tertiary",
    Resolved: "text-accent-green bg-accent-green/10",
  };
  const cls = colors[state] || "text-text-secondary bg-bg-tertiary";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[0.65rem] ${cls}`}>
      {state}
    </span>
  );
}

export default function SportsPage() {
  const [tab, setTab] = useState("games");
  const [page, setPage] = useState(0);
  const [gameFilter, setGameFilter] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");

  const { data: gamesData, isLoading: gamesLoading } = useQuery({
    queryKey: ["games", page, gameFilter],
    queryFn: () =>
      gameFilter
        ? client.request(GAMES_LIST, {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
            state: gameFilter,
          })
        : client.request(GAMES_ALL, {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
          }),
    enabled: tab === "games",
  });

  const { data: marketsData, isLoading: marketsLoading } = useQuery({
    queryKey: ["markets", page, marketFilter],
    queryFn: () =>
      client.request(MARKETS_BY_STATE, {
        state: marketFilter || "Active",
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: tab === "markets" && !selectedGameId,
  });

  const { data: gameMarketsData, isLoading: gameMarketsLoading } = useQuery({
    queryKey: ["gameMarkets", selectedGameId],
    queryFn: () =>
      client.request(MARKETS_BY_GAME, { gameId: selectedGameId }),
    enabled: tab === "markets" && !!selectedGameId,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const games = (gamesData as any)?.Game || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markets = selectedGameId
    ? (gameMarketsData as any)?.Market || []
    : (marketsData as any)?.Market || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sports Oracle"
        subtitle="UMA Sports Oracle games and markets"
      />

      <div className="flex items-center justify-between">
        <TabSelector
          tabs={[
            { key: "games", label: "Games" },
            { key: "markets", label: "Markets" },
          ]}
          activeTab={tab}
          onTabChange={(t) => {
            setTab(t);
            setPage(0);
            setSelectedGameId("");
          }}
        />

        {tab === "games" && (
          <div className="flex items-center gap-2">
            {["", "Created", "Active", "Settled", "Canceled"].map((state) => (
              <button
                key={state}
                onClick={() => {
                  setGameFilter(state);
                  setPage(0);
                }}
                className={`px-2 py-1 text-[0.65rem] rounded border ${
                  gameFilter === state
                    ? "border-accent-green text-accent-green bg-bg-tertiary"
                    : "border-border text-text-muted hover:text-text-secondary"
                }`}
              >
                {state || "All"}
              </button>
            ))}
          </div>
        )}

        {tab === "markets" && (
          <div className="flex items-center gap-2">
            {selectedGameId && (
              <button
                onClick={() => setSelectedGameId("")}
                className="text-[0.65rem] text-accent-red hover:underline"
              >
                Clear Game Filter
              </button>
            )}
            {!selectedGameId &&
              ["Active", "Resolved", "Paused"].map((state) => (
                <button
                  key={state}
                  onClick={() => {
                    setMarketFilter(state);
                    setPage(0);
                  }}
                  className={`px-2 py-1 text-[0.65rem] rounded border ${
                    marketFilter === state
                      ? "border-accent-green text-accent-green bg-bg-tertiary"
                      : "border-border text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {state}
                </button>
              ))}
          </div>
        )}
      </div>

      {tab === "games" && (
        <DataTable
          columns={[
            {
              key: "id",
              header: "Game ID",
              render: (r: any) => (
                <span
                  className="text-accent-blue font-mono cursor-pointer hover:underline"
                  title={r.id}
                  onClick={() => {
                    setSelectedGameId(r.id);
                    setTab("markets");
                    setPage(0);
                  }}
                >
                  {shortenAddress(r.id)}
                </span>
              ),
            },
            {
              key: "state",
              header: "State",
              render: (r: any) => <StateBadge state={r.state} />,
            },
            {
              key: "ordering",
              header: "Ordering",
              render: (r: any) => (
                <span className="text-text-secondary">{r.ordering}</span>
              ),
            },
            {
              key: "score",
              header: "Score",
              render: (r: any) => (
                <span className="text-text-primary font-mono">
                  {r.homeScore} - {r.awayScore}
                </span>
              ),
            },
            {
              key: "ancillary",
              header: "Data",
              render: (r: any) => (
                <span
                  className="text-text-muted text-[0.65rem] max-w-[200px] truncate block"
                  title={r.ancillaryData}
                >
                  {r.ancillaryData?.slice(0, 40)}...
                </span>
              ),
            },
          ]}
          data={games}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={gamesLoading}
        />
      )}

      {tab === "markets" && (
        <>
          {selectedGameId && (
            <div className="bg-bg-secondary border border-border rounded-md p-3 text-[0.7rem]">
              <span className="text-text-muted">Showing markets for game: </span>
              <span className="text-accent-blue font-mono">{selectedGameId}</span>
            </div>
          )}
          <DataTable
            columns={[
              {
                key: "id",
                header: "Market ID",
                render: (r: any) => (
                  <span className="text-accent-blue font-mono" title={r.id}>
                    {shortenAddress(r.id)}
                  </span>
                ),
              },
              {
                key: "state",
                header: "State",
                render: (r: any) => <StateBadge state={r.state} />,
              },
              {
                key: "type",
                header: "Type",
                render: (r: any) => (
                  <span className="text-text-secondary">{r.marketType}</span>
                ),
              },
              {
                key: "underdog",
                header: "Underdog",
                render: (r: any) => (
                  <span className="text-text-primary">{r.underdog}</span>
                ),
              },
              {
                key: "line",
                header: "Line",
                align: "right" as const,
                render: (r: any) => (
                  <span className="text-accent-amber">{r.line}</span>
                ),
              },
              {
                key: "payouts",
                header: "Payouts",
                render: (r: any) => (
                  <span className="text-text-muted text-[0.65rem]">
                    [{r.payouts?.join(", ")}]
                  </span>
                ),
              },
              {
                key: "gameId",
                header: "Game",
                render: (r: any) => (
                  <span
                    className="text-accent-blue font-mono cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedGameId(r.gameId);
                    }}
                  >
                    {shortenAddress(r.gameId)}
                  </span>
                ),
              },
            ]}
            data={markets}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            loading={marketsLoading || gameMarketsLoading}
          />
        </>
      )}
    </div>
  );
}
