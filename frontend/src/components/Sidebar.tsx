"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Users,
  Gamepad2,
  ArrowLeftRight,
  TrendingUp,
  Droplets,
  Github,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orderbook", label: "Orderbook", icon: BarChart3 },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/sports", label: "Sports", icon: Gamepad2 },
  { href: "/fpmm", label: "FPMM", icon: Droplets },
  { href: "/positions", label: "Positions", icon: TrendingUp },
  { href: "/wallets", label: "Wallets", icon: Users },
  { href: "/conversions", label: "Conversions", icon: ArrowLeftRight },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 bg-bg-secondary border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="block">
          <div className="text-accent-green font-bold text-sm tracking-wider">
            POLYMARKET
          </div>
          <div className="text-text-muted text-[0.65rem] tracking-widest uppercase">
            Explorer
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2 text-xs transition-colors ${
                isActive
                  ? "text-accent-green bg-bg-tertiary border-r-2 border-accent-green"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <a
          href="https://github.com/moose-code/polymarket-indexer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-text-muted hover:text-text-secondary text-[0.65rem] transition-colors"
        >
          <Github size={12} />
          <span>GitHub</span>
        </a>
        <div className="mt-2 text-text-muted text-[0.6rem]">
          Powered by{" "}
          <a
            href="https://envio.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:underline"
          >
            Envio HyperIndex
          </a>
        </div>
      </div>
    </aside>
  );
}
