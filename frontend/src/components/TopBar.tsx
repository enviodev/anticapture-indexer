"use client";

import { useQuery } from "@tanstack/react-query";
import { client, formatUSDC, formatNumber } from "@/lib/graphql";
import { GLOBAL_STATS } from "@/lib/queries";
import { Github } from "lucide-react";

interface GlobalStatsData {
  Orderbook: Array<{
    tradesQuantity: string;
    collateralVolume: string;
    scaledCollateralVolume: string;
  }>;
  OrdersMatchedGlobal: Array<{
    tradesQuantity: string;
    scaledCollateralVolume: string;
  }>;
  GlobalOpenInterest: Array<{ amount: string }>;
  GlobalUSDCBalance: Array<{ balance: string }>;
}

export function TopBar() {
  const { data } = useQuery<GlobalStatsData>({
    queryKey: ["globalStats"],
    queryFn: () => client.request(GLOBAL_STATS),
  });

  const orderbook = data?.Orderbook?.[0];
  const matched = data?.OrdersMatchedGlobal?.[0];
  const oi = data?.GlobalOpenInterest?.[0];
  const balance = data?.GlobalUSDCBalance?.[0];

  return (
    <header className="h-10 bg-bg-secondary border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-6 text-[0.7rem]">
        <Ticker
          label="CTF VOL"
          value={orderbook ? formatUSDC(orderbook.collateralVolume) : "..."}
          color="text-accent-green"
        />
        <Ticker
          label="NEG VOL"
          value={
            matched ? `$${Number(matched.scaledCollateralVolume).toFixed(2)}` : "..."
          }
          color="text-accent-green"
        />
        <Ticker
          label="CTF TRADES"
          value={orderbook ? formatNumber(orderbook.tradesQuantity) : "..."}
          color="text-accent-amber"
        />
        <Ticker
          label="NEG TRADES"
          value={matched ? formatNumber(matched.tradesQuantity) : "..."}
          color="text-accent-amber"
        />
        <Ticker
          label="OPEN INT"
          value={oi ? formatUSDC(oi.amount) : "..."}
          color="text-accent-blue"
        />
        <Ticker
          label="USDC BAL"
          value={balance ? formatUSDC(balance.balance) : "..."}
          color="text-accent-purple"
        />
      </div>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/moose-code/polymarket-indexer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-text-muted hover:text-accent-green transition-colors text-[0.65rem] bg-bg-tertiary px-2 py-1 rounded border border-border hover:border-accent-green-dim"
        >
          <Github size={12} />
          <span>moose-code/polymarket-indexer</span>
        </a>
        <div className="text-text-muted text-[0.6rem]">
          <span className="text-accent-green cursor-blink">|</span> POLYGON
        </div>
      </div>
    </header>
  );
}

function Ticker({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
