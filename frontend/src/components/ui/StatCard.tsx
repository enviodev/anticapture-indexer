"use client";

import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-accent-green"
      : trend === "down"
        ? "text-accent-red"
        : "text-text-secondary";

  return (
    <div className="bg-bg-card border border-border-primary rounded-lg p-4 hover:border-border-secondary transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">
          {label}
        </span>
        <Icon className="w-3.5 h-3.5 text-text-muted" />
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-bg-tertiary rounded animate-pulse" />
      ) : (
        <div className={`text-xl font-bold tabular-nums ${trendColor}`}>
          {value}
        </div>
      )}
      {subtitle && (
        <div className="text-[10px] text-text-muted mt-1">{subtitle}</div>
      )}
    </div>
  );
}
