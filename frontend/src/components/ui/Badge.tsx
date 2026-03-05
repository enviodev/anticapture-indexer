interface BadgeProps {
  label: string;
  variant?: "green" | "red" | "amber" | "blue" | "cyan" | "purple" | "muted";
}

const VARIANT_CLASSES: Record<string, string> = {
  green: "bg-accent-green/15 text-accent-green border-accent-green/30",
  red: "bg-accent-red/15 text-accent-red border-accent-red/30",
  amber: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  blue: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  cyan: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
  purple: "bg-accent-purple/15 text-accent-purple border-accent-purple/30",
  muted: "bg-bg-tertiary text-text-muted border-border-secondary",
};

export function Badge({ label, variant = "muted" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded border ${VARIANT_CLASSES[variant]}`}
    >
      {label}
    </span>
  );
}
