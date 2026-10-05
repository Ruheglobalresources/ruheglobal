"use client";

// src/components/dashboard/catalog-lists.tsx
// Everything that reads the catalog from the Hono API:
//   CoursesPreview / InstitutionsPreview  swipeable strips for the dashboard home
//   CoursesBrowser / InstitutionsBrowser  full pages with infinite scroll
//   CatalogTabs                           Courses | Institutions switcher with totals
import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, GraduationCap } from "lucide-react";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { apiGet } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { CourseCard, InstitutionCard } from "./discover-card";
import { InfiniteGrid } from "./infinite-grid";
import { SwipeSection } from "./swipe-section";
import type { CatalogSummary, CourseCardData, InstitutionCardData } from "./types";

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);

// ── Dashboard home: swipeable previews (12 cards, then a "See all" card) ──

export function CoursesPreview() {
  const list = useInfiniteList<CourseCardData>({ path: "/courses", limit: 12, maxPages: 1 });

  return (
    <SwipeSection
      title={
        <>
          <span className="grid size-10 place-items-center rounded-full bg-ruby-50 text-ruby-600">
            <GraduationCap size={22} />
          </span>
          <h2 className="text-xl font-semibold text-ink">Courses</h2>
          {list.total !== null ? (
            <span className="rounded-full bg-ruby-50 px-3 py-1 text-xs font-semibold text-ruby-700">
              {fmt(list.total)} available
            </span>
          ) : (
            <span className="h-6 w-24 animate-pulse rounded-full bg-neutral-100" />
          )}
        </>
      }
      showAllHref="/portal/courses"
      seeAllLabel={list.total !== null ? `See all ${fmt(list.total)} courses` : "See all courses"}
      list={list}
      emptyText="Courses will appear here as soon as they are added."
      renderItem={(course) => <CourseCard course={course} />}
    />
  );
}

export function InstitutionsPreview() {
  const list = useInfiniteList<InstitutionCardData>({ path: "/institutions", limit: 12, maxPages: 1 });

  return (
    <SwipeSection
      title={
        <h2 className="text-xl font-semibold text-ink sm:text-2xl">
          Meet{" "}
          {list.total !== null ? (
            fmt(list.total)
          ) : (
            <span className="inline-block h-6 w-14 translate-y-1 animate-pulse rounded-full bg-neutral-100" />
          )}{" "}
          institutions around the world
        </h2>
      }
      description="Our trusted partners meet the highest standards of education."
      showAllHref="/portal/institutions"
      seeAllLabel={list.total !== null ? `See all ${fmt(list.total)} institutions` : "See all institutions"}
      list={list}
      emptyText="Partner institutions will appear here as soon as they are added."
      renderItem={(institution) => <InstitutionCard institution={institution} />}
    />
  );
}



// ── Full pages ──────────────────────────────────────────────────────────

export function CatalogTabs({ active }: { active: "courses" | "institutions" }) {
  const [summary, setSummary] = useState<CatalogSummary | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiGet<{ data: CatalogSummary }>("/catalog/summary", {}, controller.signal)
      .then((res) => setSummary(res.data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const tabs = [
    { key: "courses", label: "Courses", href: "/portal/courses", icon: GraduationCap, count: summary?.courses },
    { key: "institutions", label: "Institutions", href: "/portal/institutions", icon: Building2, count: summary?.institutions },
  ] as const;

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map(({ key, label, href, icon: Icon, count }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition",
            active === key
              ? "border-ruby-500 bg-ruby-50 text-ruby-700"
              : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
          )}
        >
          <Icon size={18} />
          {label}
          {count !== undefined && <span className="font-medium opacity-70">{fmt(count)}</span>}
        </Link>
      ))}
    </div>
  );
}

export function CoursesBrowser({ q }: { q?: string }) {
  const list = useInfiniteList<CourseCardData>({ path: "/courses", params: { q }, limit: 12 });

  return (
    <>
      <p className="mb-4 text-sm text-neutral-500">
        {list.total === null ? (
          <span className="inline-block h-4 w-40 animate-pulse rounded-full bg-neutral-100" />
        ) : (
          <>
            <strong className="font-semibold text-ink">{fmt(list.total)}</strong> {list.total === 1 ? "course" : "courses"}
            {q ? <> for &ldquo;{q}&rdquo;</> : null}
          </>
        )}
      </p>
      <InfiniteGrid
        list={list}
        emptyTitle={q ? `No courses match "${q}"` : "No courses yet"}
        emptyHint="Try a different course name or the name of a school."
        renderItem={(course) => <CourseCard course={course} />}
      />
    </>
  );
}

export function InstitutionsBrowser({ q }: { q?: string }) {
  const list = useInfiniteList<InstitutionCardData>({ path: "/institutions", params: { q }, limit: 12 });

  return (
    <>
      <p className="mb-4 text-sm text-neutral-500">
        {list.total === null ? (
          <span className="inline-block h-4 w-40 animate-pulse rounded-full bg-neutral-100" />
        ) : (
          <>
            <strong className="font-semibold text-ink">{fmt(list.total)}</strong>{" "}
            {list.total === 1 ? "institution" : "institutions"}
            {q ? <> for &ldquo;{q}&rdquo;</> : null}
          </>
        )}
      </p>
      <InfiniteGrid
        list={list}
        emptyTitle={q ? `No institutions match "${q}"` : "No institutions yet"}
        emptyHint="Try a different name or city."
        renderItem={(institution) => <InstitutionCard institution={institution} />}
      />
    </>
  );
}
