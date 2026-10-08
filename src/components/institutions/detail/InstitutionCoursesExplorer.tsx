"use client";

// src/components/institutions/detail/InstitutionCoursesExplorer.tsx
// The whole courses page of ONE institution below the navbar: ink hero with the search
// box, then the infinite list of course cards. It reads
// GET /api/v1/courses?institution=<slug> through the useInfiniteList hook, 12 cards per page.
//
// Same behaviour as the /courses and institutions pages:
//  - ONE search box that is created once and never re-created
//  - the search runs by itself 2 seconds after typing stops (Enter or X = straight away)
//  - ?q= is kept in the address bar without navigating, so a search can be shared
//  - the next page loads just before the visitor reaches the bottom
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowLeft, MapPin, RotateCw, Search, SearchX, X } from "lucide-react";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import type { CourseCardData } from "@/components/dashboard/types";
import { applyHref } from "@/lib/apply-link";
import { cn } from "@/lib/utils";
import { btn, card } from "./ui";

const SEARCH_DELAY_MS = 2000;
const PAGE_SIZE = 12;

const normalise = (raw: string) => raw.trim().slice(0, 80) || undefined;
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export type ExplorerInstitution = {
  slug: string;
  name: string;
  city: string | null;
  country: string | null;
  logoUrl: string | null;
};

/* --------------------------------- card ---------------------------------- */

function CourseCard({ course, institutionSlug }: { course: CourseCardData; institutionSlug: string }) {
  const isCourse = course.kind === "course";

  const facts = [
    course.tuition && { label: "Fee", value: course.tuition },
    course.duration && { label: "Duration", value: course.duration },
    course.nextIntake && { label: "Next intake", value: course.nextIntake },
    course.level && { label: "Study level", value: course.level },
  ].filter((f): f is { label: string; value: string } => !!f);

  return (
    <li className={cn(card, "flex h-full flex-col")}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug text-ink">{course.name}</h2>
          {course.degree ? (
            <span className="shrink-0 rounded-sm bg-ruby/10 px-2 py-0.5 text-xs font-semibold text-ruby">
              {course.degree}
            </span>
          ) : !isCourse ? (
            <span className="shrink-0 rounded-sm bg-ruby/10 px-2 py-0.5 text-xs font-semibold text-ruby">
              Subject area
            </span>
          ) : null}
        </div>
        {course.subject && <p className="mt-1 text-sm text-ink/55">{course.subject}</p>}

        {facts.length > 0 && (
          <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded border border-ink/10 bg-ink/10">
            {facts.map((f) => (
              <div key={f.label} className="bg-white px-3 py-2.5 [&:last-child:nth-child(odd)]:col-span-2">
                <dd className="text-sm font-semibold leading-5 text-ink">{f.value}</dd>
                <dt className="text-xs text-ink/50">{f.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="mt-auto flex gap-3 border-t border-ink/10 p-3">
        {/* only real course rows have their own page; a subject area opens the institution */}
        <Link
          href={isCourse ? `/institutions/${institutionSlug}/courses/${course.id}` : `/institutions/${institutionSlug}`}
          className={cn(btn("secondary", "sm"), "flex-1")}
        >
          {isCourse ? "View details" : "About the institution"}
        </Link>
        {/* carries institution + course to the portal; signed out users are sent to login first */}
        <Link
          href={applyHref(institutionSlug, isCourse ? course.id : undefined)}
          className={cn(btn("primary", "sm"), "flex-1")}
        >
          Proceed to apply
        </Link>
      </div>
    </li>
  );
}

function CourseCardSkeleton() {
  return (
    <li aria-hidden className={cn(card, "flex h-full min-h-[250px] flex-col")}>
      <div className="p-4">
        <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="h-11 animate-pulse rounded bg-neutral-100" />
          <div className="h-11 animate-pulse rounded bg-neutral-100" />
          <div className="h-11 animate-pulse rounded bg-neutral-100" />
          <div className="h-11 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
      <div className="mt-auto flex gap-3 border-t border-ink/10 p-3">
        <div className="h-9 flex-1 animate-pulse rounded bg-neutral-100" />
        <div className="h-9 flex-1 animate-pulse rounded bg-neutral-100" />
      </div>
    </li>
  );
}

/* -------------------------------- explorer -------------------------------- */

const gridClass = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";

export function InstitutionCoursesExplorer({
  institution,
  courseCount,
  initialQuery,
}: {
  institution: ExplorerInstitution;
  courseCount: number;
  initialQuery?: string;
}) {
  const [value, setValue] = useState(initialQuery ?? ""); // what is in the box
  const [query, setQuery] = useState<string | undefined>(initialQuery); // what the list is showing
  const [logoFailed, setLogoFailed] = useState(false);

  // the hook restarts the list by itself whenever the search changes
  const { items, total, status, error, hasMore, loadMore, retry } = useInfiniteList<CourseCardData>({
    path: "/courses",
    params: { institution: institution.slug, q: query },
    limit: PAGE_SIZE,
  });

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

  // Invisible sentinel just below the grid. Re-checks after every page, so a tall
  // screen keeps filling until it is full.
  const { ref, inView } = useInView({ rootMargin: "600px 0px" });
  useEffect(() => {
    if (inView && status === "ready" && hasMore) loadMore();
  }, [inView, status, hasMore, loadMore, items.length]);

  const clearSearch = () => {
    setValue("");
    commit(undefined);
  };

  const place = [institution.city, institution.country].filter(Boolean).join(", ");
  const institutionHref = `/institutions/${institution.slug}`;

  return (
    <div className="bg-cloud pb-10 text-ink">
      {/* HERO: same size and padding as the school, institution and course pages */}
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/search" className="hover:text-white">
              Institutions
            </Link>
            <span className="mx-2">/</span>
            <Link href={institutionHref} className="hover:text-white">
              {institution.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Courses</span>
          </nav>

          <div className="mt-8 flex items-start gap-5">
            {institution.logoUrl && !logoFailed ? (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-white p-3 sm:size-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={institution.logoUrl}
                  alt={`${institution.name} logo`}
                  onError={() => setLogoFailed(true)}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-white text-lg font-semibold text-ruby-700 sm:size-24 sm:text-2xl">
                {initialsOf(institution.name) || "?"}
              </span>
            )}

            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-5xl">
                Courses at {institution.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
                {place && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={18} className="text-gold" />
                    {place}
                  </span>
                )}
                {courseCount > 0 && (
                  <span className="text-white/75">
                    {fmt(courseCount)} {courseCount === 1 ? "course" : "courses"} in total
                  </span>
                )}
                <Link
                  href={institutionHref}
                  className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-gold"
                >
                  <ArrowLeft size={16} />
                  Back to {institution.name}
                </Link>
              </div>
            </div>
          </div>

          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              commit(normalise(value));
            }}
            className="mt-7 max-w-2xl"
          >
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search by course, subject or degree"
                aria-label={`Search courses at ${institution.name}`}
                maxLength={80}
                className="h-14 w-full rounded-md border border-transparent bg-white pl-12 pr-12 text-base text-ink outline-none placeholder:text-ink/45 focus:border-ruby focus:ring-2 focus:ring-ruby/30 [&::-webkit-search-cancel-button]:hidden"
              />
              {value && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-md text-ink/50 transition-colors hover:bg-neutral-100"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <p className="mt-2 h-5 text-sm text-white/60" aria-live="polite">
              {waiting ? "Searching in a moment. Press Enter to search now." : ""}
            </p>
          </form>
        </div>
      </header>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <p className="mb-4 text-sm text-ink/60" aria-live="polite">
          {total === null ? (
            <span className="inline-block h-4 w-40 animate-pulse rounded bg-neutral-200" />
          ) : (
            <>
              <strong className="font-semibold text-ink">{fmt(total)}</strong> {total === 1 ? "course" : "courses"}
              {query ? <> for &ldquo;{query}&rdquo;</> : null}
            </>
          )}
        </p>

        {status === "loading" ? (
          <ul className={gridClass}>
            {Array.from({ length: 6 }, (_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className={cn(card, "flex flex-col items-center border-dashed px-6 py-14 text-center")}>
            <span className="grid size-14 place-items-center rounded-full bg-ruby-50 text-ruby">
              {status === "error" ? <RotateCw size={24} /> : <SearchX size={24} />}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-ink">
              {status === "error"
                ? "We couldn't load the courses"
                : query
                  ? `No courses match "${query}"`
                  : "No courses listed yet"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-ink/60">
              {status === "error"
                ? error
                : query
                  ? `Try a different course, subject or degree at ${institution.name}.`
                  : `Courses for ${institution.name} will appear here as soon as they are added.`}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {status === "error" ? (
                <button type="button" onClick={retry} className={btn("secondary")}>
                  <RotateCw size={16} /> Try again
                </button>
              ) : query ? (
                <button type="button" onClick={clearSearch} className={btn("secondary")}>
                  Clear search
                </button>
              ) : (
                <Link href={institutionHref} className={btn("secondary")}>
                  Back to {institution.name}
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <ul className={gridClass}>
              {items.map((course) => (
                <CourseCard key={course.id} course={course} institutionSlug={institution.slug} />
              ))}
              {status === "loading-more" &&
                Array.from({ length: 3 }, (_, i) => <CourseCardSkeleton key={`more-${i}`} />)}
            </ul>

            {status === "error" && (
              <div className="mt-6 flex flex-col items-center gap-2 text-sm text-ink/60">
                <p>{error}</p>
                <button type="button" onClick={retry} className={btn("secondary")}>
                  <RotateCw size={16} /> Try again
                </button>
              </div>
            )}

            {/* sentinel */}
            <div ref={ref} aria-hidden className="h-px" />

            {!hasMore && status === "ready" && items.length > PAGE_SIZE && (
              <p className="mt-8 text-center text-xs text-ink/45">You&apos;ve reached the end of the list</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}