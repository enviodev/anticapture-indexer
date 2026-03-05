import { type LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function SectionHeader({ title, icon: Icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-accent-cyan" />}
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
