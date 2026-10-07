"use client";

// src/components/institutions/detail/InstitutionCourses.tsx
// Compact course cards in the Edvoy style: name, degree badge, a 2x2 grid of facts
// (Fee / Duration / Next intake / Study level), "View details" and "Proceed to apply".
// The detail page only sends the first batch of courses; the big button at the bottom
// goes to the full courses page.
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { applyHref } from "@/lib/apply-link";
import { cn } from "@/lib/utils";
import { btn } from "./ui";

export type CourseRow = {
  id: string;
  name: string;
  degree: string | null;
  level: string | null;
  subject: string | null;
  duration: string | null;
  nextIntake: string | null;
  intakes: string | null;
  description: string | null;
  fee: string | null; // ready to show, e.g. "£25,500 / yr"
};

const PAGE = 6;

const uniq = (list: (string | null)[]) =>
  Array.from(new Set(list.filter((x): x is string => !!x))).sort((a, b) => a.localeCompare(b));

const selectClass =
  "h-9 rounded-md border border-ink/20 bg-white px-2.5 text-sm text-ink outline-none focus:border-ruby";

export function InstitutionCourses({
  courses,
  institutionSlug,
  coursesHref,
  total,
}: {
  courses: CourseRow[];
  institutionSlug: string;
  coursesHref: string;
  total: number;
}) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");
  const [subject, setSubject] = useState("All");
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<string | null>(null);

  const levels = useMemo(() => uniq(courses.map((c) => c.level)), [courses]);
  const subjects = useMemo(() => uniq(courses.map((c) => c.subject)), [courses]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (level === "All" || c.level === level) &&
        (subject === "All" || c.subject === subject) &&
        (!term ||
          c.name.toLowerCase().includes(term) ||
          (c.degree ?? "").toLowerCase().includes(term) ||
          (c.subject ?? "").toLowerCase().includes(term))
    );
  }, [courses, q, level, subject]);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:flex-1">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search courses, degrees or subjects"
            aria-label="Search courses"
            className="h-9 w-full rounded-md border border-ink/20 bg-white pl-8 pr-3 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-ruby"
          />
        </div>
        {levels.length > 1 && (
          <select
            aria-label="Study level"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setShown(PAGE);
            }}
            className={selectClass}
          >
            <option value="All">All levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        )}
        {subjects.length > 1 && (
          <select
            aria-label="Subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setShown(PAGE);
            }}
            className={cn(selectClass, "sm:max-w-48")}
          >
            <option value="All">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="mt-2 text-xs text-ink/55" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "course" : "courses"}
        {total > courses.length && ` shown of ${total}`}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-2 rounded-md border border-ink/15 bg-neutral-50 p-3 text-sm text-ink/65">
          No courses match that search here.{" "}
          <Link href={coursesHref} className="font-semibold text-ruby hover:underline">
            Browse all {total} courses
          </Link>
        </p>
      ) : (
        <ul className="mt-2 grid gap-2.5 md:grid-cols-2">
          {filtered.slice(0, shown).map((c) => {
            const facts = [
              c.fee && { label: "Fee", value: c.fee },
              c.duration && { label: "Duration", value: c.duration },
              c.nextIntake && { label: "Next intake", value: c.nextIntake },
              c.level && { label: "Study level", value: c.level },
            ].filter((f): f is { label: string; value: string } => !!f);

            const hasDetails = Boolean(c.description || c.intakes);
            const isOpen = open === c.id;

            return (
              <li key={c.id} className="flex flex-col rounded-md border border-ink/15 bg-white">
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{c.name}</h3>
                    {c.degree && (
                      <span className="shrink-0 rounded-sm bg-ruby/10 px-1.5 py-0.5 text-[11px] font-semibold text-ruby">
                        {c.degree}
                      </span>
                    )}
                  </div>
                  {c.subject && <p className="mt-0.5 text-xs text-ink/55">{c.subject}</p>}

                  {facts.length > 0 && (
                    <dl className="mt-2.5 grid grid-cols-2 gap-px overflow-hidden rounded border border-ink/10 bg-ink/10">
                      {facts.map((f) => (
                        <div
                          key={f.label}
                          className="bg-white px-2 py-1.5 [&:last-child:nth-child(odd)]:col-span-2"
                        >
                          <dd className="text-[13px] font-semibold leading-4 text-ink">{f.value}</dd>
                          <dt className="text-[11px] text-ink/50">{f.label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}

                  {isOpen && (
                    <div className="mt-2.5 space-y-1.5 border-t border-ink/10 pt-2.5 text-xs leading-5 text-ink/75">
                      {c.intakes && (
                        <p>
                          <span className="font-semibold text-ink">Intakes:</span> {c.intakes}
                        </p>
                      )}
                      {c.description && <p>{c.description}</p>}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex gap-2 border-t border-ink/10 p-2.5">
                  {hasDetails && (
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(isOpen ? null : c.id)}
                      className={cn(btn("secondary", "sm"), "flex-1")}
                    >
                      {isOpen ? "Hide details" : "View details"}
                    </button>
                  )}
                  {/* carries institution + course to the portal; signed-out users are sent to login first */}
                  <Link href={applyHref(institutionSlug, c.id)} className={cn(btn("primary", "sm"), "flex-1")}>
                    Proceed to apply
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
        {shown < filtered.length && (
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className={btn("secondary")}>
            Show more ({filtered.length - shown} left)
          </button>
        )}
        <Link href={coursesHref} className={cn(btn("primary", "lg"), "w-full sm:w-auto")}>
          View all {total} courses
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}