"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function Pagination({ page, hasMore, onPrev, onNext }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={onPrev}
        disabled={page === 0}
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-3 h-3" />
        Prev
      </button>
      <span className="text-[10px] text-text-muted tabular-nums">
        Page {page + 1}
      </span>
      <button
        onClick={onNext}
        disabled={!hasMore}
        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-border-primary text-text-secondary hover:text-text-primary hover:border-border-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}
