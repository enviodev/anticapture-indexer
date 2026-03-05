"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Column {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  render: (row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
}

export function DataTable({
  columns,
  data,
  loading,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="border border-border-primary rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-primary bg-bg-secondary">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-medium text-text-muted uppercase tracking-wider text-[10px] text-${col.align || "left"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border-primary/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5">
                    <div className="h-4 w-20 bg-bg-tertiary rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="border border-border-primary rounded-lg p-8 text-center text-text-muted text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border border-border-primary rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-primary bg-bg-secondary">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2 font-medium text-text-muted uppercase tracking-wider text-[10px] whitespace-nowrap text-${col.align || "left"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border-primary/50 table-row-hover animate-slide-in ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 whitespace-nowrap text-${col.align || "left"}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
