"use client";

// src/components/dashboard/institutions-explorer.tsx
// The search box and the infinite list of institution cards in ONE client component.
//
// Why one component: the search box is created once and never re-created. Typing
// only changes state here, the list restarts by itself when the search changes, and
// the page is not navigated or re-rendered by the server on every search. The
// address bar is kept in sync with ?q=, so a search can still be shared.
//
// The search runs by itself 2 seconds after the visitor stops typing. Enter, or the
// X button, searches straight away.
import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { InstitutionsBrowser } from "./catalog-lists";

const SEARCH_DELAY_MS = 2000;

const normalise = (raw: string) => raw.trim().slice(0, 80) || undefined;

export function InstitutionsExplorer({ initialQuery }: { initialQuery?: string }) {
  const [value, setValue] = useState(initialQuery ?? ""); // what is in the box
  const [query, setQuery] = useState<string | undefined>(initialQuery); // what the list is showing

  const commit = useCallback((next: string | undefined) => {
    setQuery(next);

    // keep ?q= in the address bar without navigating
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("q", next);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, []);

  // Wait 2 seconds after the last keystroke, then search. Typing again restarts the wait.
  useEffect(() => {
    const next = normalise(value);
    if (next === query) return;

    const timer = window.setTimeout(() => commit(next), SEARCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [value, query, commit]);

  const waiting = normalise(value) !== query;

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          commit(normalise(value));
        }}
        className="mb-5 max-w-xl"
      >
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search by institution name or city"
            aria-label="Search institutions"
            maxLength={80}
            className="h-12 w-full rounded-full border border-neutral-200 bg-white pl-11 pr-12 text-sm text-ink outline-none transition placeholder:text-neutral-400 focus:border-ruby-500 focus:ring-2 focus:ring-ruby-500/20 [&::-webkit-search-cancel-button]:hidden"
          />
          {value && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setValue("");
                commit(undefined);
              }}
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <p className="mt-1.5 h-4 px-4 text-xs text-neutral-400" aria-live="polite">
          {waiting ? "Searching in a moment. Press Enter to search now." : ""}
        </p>
      </form>

      {/* key restarts the list (and its scroll loading) for every new search */}
      <InstitutionsBrowser key={query ?? ""} q={query} />
    </>
  );
}