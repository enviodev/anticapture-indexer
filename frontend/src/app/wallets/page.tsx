"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Search, ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function WalletsPage() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = address.trim().toLowerCase();
    if (q) {
      router.push(`/wallets/${q}`);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Wallet Explorer" icon={Wallet} />

      <div className="max-w-2xl">
        <div className="bg-bg-card border border-border-primary rounded-lg p-6">
          <p className="text-xs text-text-secondary mb-4">
            Search by wallet address or signer address to explore trading
            activity, positions, and P&L data.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter wallet address (0x...)"
                className="w-full h-10 pl-10 pr-4 text-xs bg-bg-tertiary border border-border-secondary rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"
              />
            </div>
            <button
              type="submit"
              disabled={!address.trim()}
              className="flex items-center gap-1.5 px-4 h-10 text-xs bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan rounded hover:bg-accent-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Explore <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>

        <div className="mt-6 bg-bg-card border border-border-primary rounded-lg p-4">
          <div className="text-[10px] text-text-muted uppercase tracking-widest mb-3">
            What you can find
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary">
            <InfoItem title="Wallet Info" desc="Type, balance, creation date, signer" />
            <InfoItem title="Order Activity" desc="Fills as maker and taker" />
            <InfoItem title="FPMM Transactions" desc="Buys and sells on markets" />
            <InfoItem title="Positions & P&L" desc="Current positions, avg price, realized PnL" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-bg-tertiary rounded p-3 border border-border-primary">
      <div className="text-text-primary font-medium mb-0.5">{title}</div>
      <div className="text-text-muted text-[10px]">{desc}</div>
    </div>
  );
}
