"use client";

// src/components/dashboard/infinite-grid.tsx
// Grid with skeleton cards on the first load, skeletons appended while the next
// page loads, and an invisible sentinel that triggers the next page just before
// the visitor reaches the bottom.
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { RotateCw, SearchX } from "lucide-react";
import type { InfiniteList } from "@/hooks/use-infinite-list";
import { cn } from "@/lib/utils";
import { DiscoverCardSkeleton } from "./discover-card";
import { outlinedButton } from "./styles";

type InfiniteGridProps<T extends { id: string }> = {
  list: InfiniteList<T>;
  renderItem: (item: T) => React.ReactNode;
  emptyTitle: string;
  emptyHint?: string;
  skeletonCount?: number;
  className?: string;
};

export const gridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3";

export function InfiniteGrid<T extends { id: string }>({
  list,
  renderItem,
  emptyTitle,
  emptyHint,
  skeletonCount = 9,
  className = gridClass,
}: InfiniteGridProps<T>) {
  const { items, status, error, hasMore, loadMore, retry } = list;
  const { ref, inView } = useInView({ rootMargin: "600px 0px" });

  // Re-checks after every page, so a tall screen keeps filling until it is full.
  useEffect(() => {
    if (inView && status === "ready" && hasMore) loadMore();
  }, [inView, status, hasMore, loadMore, items.length]);

  if (status === "loading") {
    return (
      <div className={className}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <DiscoverCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    const failed = status === "error";
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-ruby-50 text-ruby-600">
          {failed ? <RotateCw size={24} /> : <SearchX size={24} />}
        </span>
        <h3 className="mt-4 text-base font-semibold text-ink">{failed ? "We couldn't load this" : emptyTitle}</h3>
        <p className="mt-1 max-w-sm text-sm text-neutral-500">{failed ? error : emptyHint}</p>
        {failed && (
          <button type="button" onClick={retry} className={cn(outlinedButton, "mt-5")}>
            <RotateCw size={16} /> Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {items.map((item) => (
          <div key={item.id}>{renderItem(item)}</div>
        ))}
        {status === "loading-more" &&
          Array.from({ length: 3 }, (_, i) => <DiscoverCardSkeleton key={`more-${i}`} />)}
      </div>

      {status === "error" && (
        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-neutral-500">
          <p>{error}</p>
          <button type="button" onClick={retry} className={outlinedButton}>
            <RotateCw size={16} /> Try again
          </button>
        </div>
      )}

      {/* sentinel */}
      <div ref={ref} aria-hidden className="h-px" />

      {!hasMore && status === "ready" && items.length > 12 && (
        <p className="mt-8 text-center text-xs text-neutral-400">You&apos;ve reached the end of the list</p>
      )}
    </>
  );
}
