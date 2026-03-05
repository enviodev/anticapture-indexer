"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Activity,
  Store,
  Wallet,
  Zap,
  Github,
  Search,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/markets", label: "Markets", icon: Store },
  { href: "/wallets", label: "Wallets", icon: Wallet },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();
    if (q.startsWith("0x") && q.length >= 40) {
      window.location.href = `/wallets/${q}`;
    } else {
      window.location.href = `/markets?search=${encodeURIComponent(q)}`;
    }
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="border-b border-border-primary bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Zap className="w-5 h-5 text-accent-amber" />
          <span className="text-sm font-bold tracking-wider text-text-primary">
            POLYMARKET<span className="text-accent-amber">TERMINAL</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 mx-6">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                  active
                    ? "bg-bg-tertiary text-accent-cyan border border-border-secondary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="relative">
              <input
                autoFocus
                type="text"
                placeholder="Address or market ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setSearchOpen(false);
                }}
                className="w-64 h-7 px-3 text-xs bg-bg-tertiary border border-border-secondary rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan"
              />
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
              title="Search (address or market)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-glow" />
            <span className="hidden sm:inline">LIVE</span>
          </div>

          {/* GitHub */}
          <a
            href="https://github.com/enviodev/hyperindex"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
            title="Envio HyperIndex on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
