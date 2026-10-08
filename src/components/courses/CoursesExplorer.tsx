"use client";

// src/components/courses/CoursesExplorer.tsx
// The whole /courses page below the navbar: ink hero with the search box, then the
// infinite list of course cards. It reads GET /api/v1/courses (the single Hono route
// file) through the existing useInfiniteList hook, 12 cards per page.
//
// Same behaviour as the institutions page:
//  - ONE search box that is created once and never re-created
//  - the search runs by itself 2 seconds after typing stops (Enter or X = straight away)
//  - ?q= is kept in the address bar without navigating, so a search can be shared
//  - the next page loads just before the visitor reaches the bottom
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { RotateCw, Search, SearchX, X } from "lucide-react";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import type { CourseCardData } from "@/components/dashboard/types";
import { btn, card } from "@/components/institutions/detail/ui";
import { cn } from "@/lib/utils";

const SEARCH_DELAY_MS = 2000;

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

/* --------------------------------- card ---------------------------------- */

// Institution logo. Falls back to initials when there is no logo or it fails to load.
function InstitutionLogo({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-ruby-50 text-xs font-semibold text-ruby-700">
        {initialsOf(name) || "?"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-10 shrink-0 rounded-md border border-ink/10 bg-white object-contain p-1"
    />
  );
}

function CourseListCard({ course }: { course: CourseCardData }) {
  const { institution } = course;
  // only real course rows have their own page; a "programme" opens its institution
  const href =
    course.kind === "course"
      ? `/institutions/${institution.slug}/courses/${course.id}`
      : `/institutions/${institution.slug}`;
  const place = [institution.city, institution.country].filter(Boolean).join(", ");
  const chips = [
    course.kind === "programme" ? "Subject area" : null,
    course.level,
    course.duration,
    course.nextIntake ? `Intake ${course.nextIntake}` : null,
  ].filter((x): x is string => Boolean(x));

  return (
    <Link
      href={href}
      className={cn(
        card,
        "group flex h-full min-h-[190px] flex-col justify-between p-4 transition-colors hover:border-ruby focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby/40"
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug text-ink group-hover:text-ruby">
            {course.name}
          </h2>
          {course.degree && (
            <span className="shrink-0 rounded-sm bg-ruby/10 px-2 py-0.5 text-xs font-semibold text-ruby">
              {course.degree}
            </span>
          )}
        </div>
        {course.subject && <p className="mt-1 text-sm text-ink/55">{course.subject}</p>}

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.slice(0, 3).map((chip) => (
              <span
                key={chip}
                className="rounded-sm border border-ink/15 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-ink/70"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-3">
        <InstitutionLogo src={institution.logoUrl} name={institution.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{institution.name}</p>
          {place && <p className="truncate text-xs text-ink/55">{place}</p>}
        </div>
        {course.tuition && <span className="shrink-0 text-sm font-semibold text-ruby">{course.tuition}</span>}
      </div>
    </Link>
  );
}

function CourseCardSkeleton() {
  return (
    <div aria-hidden className={cn(card, "flex h-full min-h-[190px] flex-col justify-between p-4")}>
      <div>
        <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
        <div className="mt-4 flex gap-1.5">
          <div className="h-5 w-16 animate-pulse rounded bg-neutral-100" />
          <div className="h-5 w-20 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-3">
        <div className="size-10 shrink-0 animate-pulse rounded-md bg-neutral-100" />
        <div className="h-4 flex-1 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}

/* -------------------------------- explorer -------------------------------- */

const gridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export function CoursesExplorer({ initialQuery }: { initialQuery?: string }) {
  const [value, setValue] = useState(initialQuery ?? ""); // what is in the box
  const [query, setQuery] = useState<string | undefined>(initialQuery); // what the list is showing

  // the hook restarts the list by itself whenever the search changes
  const { items, total, status, error, hasMore, loadMore, retry } = useInfiniteList<CourseCardData>({
    path: "/courses",
    params: { q: query },
    limit: 12,
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

  return (
    <div className="bg-cloud pb-10 text-ink">
      {/* HERO: same size and padding as the school, institution and course pages */}
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Courses</span>
          </nav>

          <h1 className="mt-8 font-display text-3xl font-semibold leading-tight sm:text-5xl">Find your course</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
            Courses from our partner institutions around the world. Open one to see its fees, intakes and entry
            requirements.
          </p>

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
                placeholder="Search by course, subject or institution"
                aria-label="Search courses"
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
          <div className={gridClass}>
            {Array.from({ length: 9 }, (_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={cn(card, "flex flex-col items-center border-dashed px-6 py-14 text-center")}>
            <span className="grid size-14 place-items-center rounded-full bg-ruby-50 text-ruby">
              {status === "error" ? <RotateCw size={24} /> : <SearchX size={24} />}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-ink">
              {status === "error" ? "We couldn't load the courses" : query ? `No courses match "${query}"` : "No courses yet"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-ink/60">
              {status === "error" ? error : "Try a different course, subject or institution name."}
            </p>
            <div className="mt-5">
              {status === "error" ? (
                <button type="button" onClick={retry} className={btn("secondary")}>
                  <RotateCw size={16} /> Try again
                </button>
              ) : (
                query && (
                  <button type="button" onClick={clearSearch} className={btn("secondary")}>
                    Clear search
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={gridClass}>
              {items.map((course) => (
                <CourseListCard key={course.id} course={course} />
              ))}
              {status === "loading-more" &&
                Array.from({ length: 3 }, (_, i) => <CourseCardSkeleton key={`more-${i}`} />)}
            </div>

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

            {!hasMore && status === "ready" && items.length > 12 && (
              <p className="mt-8 text-center text-xs text-ink/45">You&apos;ve reached the end of the list</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}