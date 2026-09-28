"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyHref } from "@/lib/apply-link";

export type CourseRow = {
  id: string;
  name: string;
  degree: string | null;
  level: string | null;
  duration: string | null;
  tuition: string | null;
  intakes: string | null;
  description: string | null;
};

const PAGE = 12;

export function CourseExplorer({
  courses,
  schoolSlug,
}: {
  courses: CourseRow[];
  schoolName: string;
  schoolSlug: string;
}) {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");
  const [shown, setShown] = useState(PAGE);

  const levels = useMemo(() => {
    const set = new Set(courses.map((c) => c.level).filter((l): l is string => !!l));
    return ["All", ...Array.from(set)];
  }, [courses]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (level === "All" || c.level === level) &&
        (!term || c.name.toLowerCase().includes(term) || (c.degree ?? "").toLowerCase().includes(term))
    );
  }, [courses, q, level]);

  const reset = () => setShown(PAGE);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              reset();
            }}
            placeholder="Search courses or degrees"
            aria-label="Search courses"
            className="h-11 w-full rounded-full border border-ink/15 bg-white pl-10 pr-4 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-ruby"
          />
        </div>

        {levels.length > 2 && (
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLevel(l);
                  reset();
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  level === l ? "bg-ink text-cloud" : "bg-white text-ink/70 ring-1 ring-ink/15 hover:text-ink"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-ink/50" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "course" : "courses"}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl bg-white p-6 text-sm text-ink/60 ring-1 ring-ink/10">
          No courses match that search.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtered.slice(0, shown).map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-ink/10 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{c.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/55">
                  {c.degree && (
                    <span className="rounded-full bg-ruby/10 px-2.5 py-0.5 font-semibold text-ruby">{c.degree}</span>
                  )}
                  {c.level && <span>{c.level}</span>}
                  {c.duration && <span>{c.duration}</span>}
                  {c.intakes && <span>Intake: {c.intakes}</span>}
                  {c.tuition && <span className="font-medium text-ink/70">{c.tuition}</span>}
                </div>
                {c.description && <p className="mt-1.5 line-clamp-2 text-xs text-ink/50">{c.description}</p>}
              </div>

              {/* carries school + course to the dashboard; signed-out users are sent to login first */}
              <a
                href={applyHref(schoolSlug, c.id)}
                className="shrink-0 self-start rounded-full border border-ruby px-4 py-1.5 text-sm font-medium text-ruby transition-colors hover:bg-ruby hover:text-white sm:self-center"
              >
                Choose this course
              </a>
            </li>
          ))}
        </ul>
      )}

      {shown < filtered.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cloud transition-colors hover:bg-ruby"
          >
            Show more courses ({filtered.length - shown} left)
          </button>
        </div>
      )}
    </div>
  );
}