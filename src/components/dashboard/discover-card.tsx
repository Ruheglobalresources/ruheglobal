"use client";

// src/components/dashboard/discover-card.tsx
// ONE card shell for courses and institutions (they look the same on purpose),
// its skeleton, and the two small adapters that feed it API rows.
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { elevation1, elevation2Hover } from "./styles";
import type { CourseCardData, InstitutionCardData } from "./types";

type DiscoverCardProps = {
  href: string;
  title: string;
  subtitle: string;
  logoUrl: string | null;
  price: string | null;
  chips?: string[];
};

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// The school icon. Falls back to initials when there is no logo or it fails to load.
function SchoolIcon({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ruby-50 text-[11px] font-semibold text-ruby-700">
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
      className="size-9 shrink-0 rounded-full border border-neutral-200 bg-white object-contain p-1"
    />
  );
}

export function DiscoverCard({ href, title, subtitle, logoUrl, price, chips = [] }: DiscoverCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full min-h-[176px] flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/50",
        elevation1,
        elevation2Hover
      )}
    >
      <div>
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-ink group-hover:text-ruby-700">
          {title}
        </h3>
        <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
          {chips.slice(0, 2).map((chip) => (
            <span key={chip} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <SchoolIcon src={logoUrl} name={subtitle} />
        <p className="min-w-0 flex-1 truncate text-sm text-neutral-500">{subtitle}</p>
        {price && <span className="shrink-0 text-sm font-semibold text-ruby-600">{price}</span>}
      </div>
    </Link>
  );
}

export function DiscoverCardSkeleton() {
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full min-h-[176px] flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5",
        elevation1
      )}
    >
      <div>
        <div className="h-4 w-11/12 animate-pulse rounded-full bg-neutral-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-neutral-100" />
        <div className="mt-3 flex gap-1.5">
          <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-100" />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <div className="size-9 shrink-0 animate-pulse rounded-full bg-neutral-100" />
        <div className="h-3.5 flex-1 animate-pulse rounded-full bg-neutral-100" />
        <div className="h-4 w-20 animate-pulse rounded-full bg-neutral-100" />
      </div>
    </div>
  );
}

// The institution page (/institutions/[slug]) is the next page to build.
const pageFor = (slug: string) => `/institutions/${slug}`;

export function CourseCard({ course }: { course: CourseCardData }) {
  const { institution } = course;
  return (
    <DiscoverCard
      href={pageFor(institution.slug)}
      title={course.name}
      subtitle={institution.name}
      logoUrl={institution.logoUrl}
      price={course.tuition}
      chips={[course.level, course.duration, course.nextIntake ? `Intake ${course.nextIntake}` : null].filter(
        (x): x is string => Boolean(x)
      )}
    />
  );
}

export function InstitutionCard({ institution }: { institution: InstitutionCardData }) {
  const place = [institution.city, institution.country].filter(Boolean).join(", ");
  return (
    <DiscoverCard
      href={pageFor(institution.slug)}
      title={institution.name}
      subtitle={place || "Partner institution"}
      logoUrl={institution.logoUrl}
      price={institution.tuition}
      chips={[
        institution.ranking,
        institution.courseCount > 0
          ? `${institution.courseCount} ${institution.courseCount === 1 ? "course" : "courses"}`
          : null,
      ].filter((x): x is string => Boolean(x))}
    />
  );
}
