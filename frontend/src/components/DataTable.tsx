"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  page,
  pageSize,
  onPageChange,
  loading,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr className="bg-bg-tertiary">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.align === "right" ? "text-right" : ""}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-text-muted py-8"
                >
                  <span className="text-accent-green cursor-blink">|</span>{" "}
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center text-text-muted py-8"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={col.align === "right" ? "text-right" : ""}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-3 py-2 bg-bg-tertiary border-t border-border text-[0.7rem]">
        <span className="text-text-muted">
          Showing {data.length} rows (page {page + 1})
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-1 text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={data.length < pageSize}
            className="p-1 text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
