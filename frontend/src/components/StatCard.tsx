"use client";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  subValue,
  color = "text-accent-green",
  icon,
}: StatCardProps) {
  return (
    <div className="bg-bg-secondary border border-border rounded-md p-4 hover:border-border-bright transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-[0.65rem] uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className={`text-xl font-bold ${color} glow-green`}>{value}</div>
      {subValue && (
        <div className="text-text-secondary text-[0.7rem] mt-1">{subValue}</div>
      )}
    </div>
  );
}
