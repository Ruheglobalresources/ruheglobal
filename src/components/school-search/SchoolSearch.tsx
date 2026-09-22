"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { DEFAULT_FILTERS } from "@/lib/school-search/constants";
import type { SearchFilters, SearchResponse } from "@/lib/school-search/types";
import { SearchForm } from "./SearchForm";
import { ResultCard } from "./ResultCard";
import { LoadingState } from "./LoadingState";

type Status = "idle" | "loading" | "done" | "error";

// A little longer than the server's own limit, so the server answers first.
const CLIENT_TIMEOUT_MS = 125_000;

class ApiError extends Error {}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SchoolSearch() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [searched, setSearched] = useState<SearchFilters | null>(null);
  const [error, setError] = useState("");

  const [featured, setFeatured] = useState<SearchResponse | null>(null);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Stop any in-flight request if the page is left.
  useEffect(() => () => abortRef.current?.abort(), []);

  // Our partner institutions, shown by default before the student searches.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/schools/search", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SearchResponse | null) => {
        if (data?.schools) setFeatured(data);
      })
      .catch(() => {
        // Quietly fall back to the plain empty state below.
      })
      .finally(() => setFeaturedLoading(false));
    return () => controller.abort();
  }, []);

  async function runSearch() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, CLIENT_TIMEOUT_MS);

    const submitted = { ...filters };
    setSearched(submitted);
    setStatus("loading");
    setError("");

    // On phones the results sit below the form, so bring them into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    try {
      const res = await fetch("/api/schools/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitted),
        signal: controller.signal,
      });

      const data = (await res.json().catch(() => null)) as
        | (Partial<SearchResponse> & { error?: string })
        | null;

      if (!res.ok || !data?.schools) {
        throw new ApiError(data?.error ?? "Something went wrong. Please try again.");
      }

      setResult(data as SearchResponse);
      setStatus("done");
    } catch (err) {
      // Cancelled by the user, or replaced by a newer search: say nothing.
      if (controller.signal.aborted && !timedOut) return;

      setError(
        timedOut
          ? "The search took too long. Please try again, or ask for fewer schools."
          : err instanceof ApiError
            ? err.message
            : "We couldn't reach the server. Check your connection and try again.",
      );
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }

  function cancelSearch() {
    abortRef.current?.abort();
    setStatus(result ? "done" : "idle");
  }

  const loading = status === "loading";

  return (
    <section className="bg-cloud text-ink">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-12">
       <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
  <SearchForm
    value={filters}
    onChange={setFilters}
    onSubmit={runSearch}
    loading={loading}
  />
</aside>

        <div ref={resultsRef} className="min-w-0 scroll-mt-4">
          {loading && <LoadingState onCancel={cancelSearch} />}

          {!loading && status === "idle" && (
            <div>
              

              {!featuredLoading && featured && featured.schools.length > 0 && (
                <div className="mt-6 space-y-5">
                  {featured.schools.map((school) => (
                    <ResultCard key={school.id} school={school} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && status === "error" && (
            <div role="alert" className="rounded-2xl border border-ruby/25 bg-ruby-50 p-6">
              <h2 className="text-lg font-semibold">We couldn&apos;t finish that search</h2>
              <p className="mt-1 text-ink/75">{error}</p>
              <button
                type="button"
                onClick={runSearch}
                className="mt-4 rounded-full bg-ruby px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ruby-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby/50 focus-visible:ring-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && status === "done" && result && searched && (
            <div>
              <h2 className="text-xl font-semibold text-ink">
                {searched.institution !== "Any institution"
                  ? searched.institution
                  : `${result.schools.length} ${result.schools.length === 1 ? "school" : "schools"} in ${searched.country}`}
              </h2>
              <p className="mt-1 text-sm text-ink/70">
                {searched.level}
                {searched.field !== "Any field" ? ` in ${searched.field}` : ""}
              </p>

              {result.source === "demo" && (
                <p className="mt-4 rounded-xl bg-gold/40 px-4 py-3 text-sm text-ink">
                  These are sample results. Add your ANTHROPIC_API_KEY to search live.
                </p>
              )}

              {result.source === "database" && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-teal/10 px-4 py-3 text-sm text-ink/80">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>From our own partner network — checked and kept up to date by our team.</span>
                </p>
              )}

              {result.source === "ai" && (
                <p className="mb-5 mt-4 flex items-start gap-2 rounded-xl bg-ink/5 px-4 py-3 text-sm text-ink/75">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                 <span>
  Fees and IELTS requirements are subject to change at any time. Please confirm the latest information on each school&apos;s official website before applying.
</span>
                </p>
              )}

              {result.schools.length === 0 ? (
                <p className="rounded-2xl border border-ink/10 bg-white p-6 text-ink/70">
                  {searched.institution !== "Any institution"
                    ? `We couldn't verify a matching programme at ${searched.institution} for this level and field.`
                    : "No schools came back for this search. Try a different country, level or field."}
                </p>
              ) : (
                <div className="space-y-5">
                  {result.schools.map((school) => (
                    <ResultCard key={school.id} school={school} />
                  ))}
                </div>
              )}

             
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
