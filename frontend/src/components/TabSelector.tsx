"use client";

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TabSelector({ tabs, activeTab, onTabChange }: TabSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-md p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1.5 text-[0.7rem] rounded transition-colors ${
            activeTab === tab.key
              ? "bg-bg-tertiary text-accent-green border border-border"
              : "text-text-secondary hover:text-text-primary border border-transparent"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-text-muted">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
