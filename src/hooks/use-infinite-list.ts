"use client";

// src/hooks/use-infinite-list.ts
// Page by page loader for any /api/v1 list endpoint. It resets by itself when
// the path or the params change (a new search), ignores answers that arrive
// after a reset, and never lists the same id twice.
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, type Paged } from "@/lib/api-client";

export type ListStatus = "loading" | "ready" | "loading-more" | "error";

export type InfiniteList<T> = {
  items: T[];
  total: number | null; // meta.total from the API, null until the first page lands
  status: ListStatus;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
};

type Options = {
  path: string;
  params?: Record<string, string | undefined>;
  limit?: number;
  // Stop after this many pages. A dashboard preview uses 1.
  maxPages?: number;
};

export function useInfiniteList<T extends { id: string }>({
  path,
  params,
  limit = 12,
  maxPages,
}: Options): InfiniteList<T> {
  const paramsKey = JSON.stringify(params ?? {});

  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [meta, setMeta] = useState<{ page: number; totalPages: number } | null>(null);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const busyRef = useRef(false);
  const generationRef = useRef(0); // bumps on every reset
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (page: number) => {
      if (busyRef.current) return;
      busyRef.current = true;

      const generation = generationRef.current;
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus(page === 1 ? "loading" : "loading-more");
      setError(null);

      try {
        const res = await apiGet<Paged<T>>(
          path,
          { ...(JSON.parse(paramsKey) as Record<string, string>), page, limit },
          controller.signal
        );
        if (generation !== generationRef.current) return;

        setTotal(res.meta.total);
        setMeta({ page: res.meta.page, totalPages: res.meta.totalPages });
        setItems((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          return [...prev, ...res.data.filter((item) => !seen.has(item.id))];
        });
        setStatus("ready");
      } catch (err) {
        if (controller.signal.aborted || generation !== generationRef.current) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      } finally {
        if (generation === generationRef.current) busyRef.current = false;
      }
    },
    [path, paramsKey, limit]
  );

  // First page, and again whenever the query changes.
  useEffect(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    busyRef.current = false;

    setItems([]);
    setTotal(null);
    setMeta(null);
    void load(1);

    return () => abortRef.current?.abort();
  }, [load]);

  const hasMore = meta !== null && meta.page < meta.totalPages && (!maxPages || meta.page < maxPages);

  const loadMore = useCallback(() => {
    if (hasMore && meta && !busyRef.current) void load(meta.page + 1);
  }, [hasMore, meta, load]);

  const retry = useCallback(() => {
    void load((meta?.page ?? 0) + 1);
  }, [meta, load]);

  return { items, total, status, error, hasMore, loadMore, retry };
}
