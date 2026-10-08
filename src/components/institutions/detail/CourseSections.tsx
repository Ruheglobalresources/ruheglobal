// src/components/institutions/detail/CourseSections.tsx
// Small server pieces used only by the course detail page.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { btn } from "./ui";

/* ------------------------------ intake chips ----------------------------- */

/** "Next intake" in ruby, then every intake the course has as small chips. */
export function IntakeChips({ next, intakes }: { next: string | null; intakes: string | null }) {
  const all = (intakes ?? "")
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!next && all.length === 0) return null;

  return (
    <div className="space-y-3">
      {next && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink/55">Next intake</span>
          <span className="rounded-sm bg-ruby px-3 py-1 text-sm font-semibold text-white">{next}</span>
        </div>
      )}
      {all.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink/55">All intakes</span>
          {all.map((i) => (
            <span
              key={i}
              className="rounded-sm border border-ink/15 bg-neutral-50 px-3 py-1 text-sm font-medium text-ink/80"
            >
              {i}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- related courses --------------------------- */

export type RelatedCourse = {
  id: string;
  name: string;
  degree: string | null;
  subject: string | null;
  duration: string | null;
  nextIntake: string | null;
  fee: string | null; // ready to show, e.g. "£25,500 / yr"
};

/** Other courses at the same institution. Each card opens that course's own page. */
export function RelatedCourses({
  courses,
  institutionSlug,
  institutionName,
}: {
  courses: RelatedCourse[];
  institutionSlug: string;
  institutionName: string;
}) {
  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {courses.map((c) => {
          const line = [c.duration, c.nextIntake ? `Intake ${c.nextIntake}` : null, c.fee]
            .filter(Boolean)
            .join(" · ");

          return (
            <li key={c.id}>
              <Link
                href={`/institutions/${institutionSlug}/courses/${c.id}`}
                className="group flex h-full flex-col justify-between rounded-md border border-ink/15 bg-white p-4 transition-colors hover:border-ruby"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-ink group-hover:text-ruby">
                      {c.name}
                    </h3>
                    {c.degree && (
                      <span className="shrink-0 rounded-sm bg-ruby/10 px-2 py-0.5 text-xs font-semibold text-ruby">
                        {c.degree}
                      </span>
                    )}
                  </div>
                  {c.subject && <p className="mt-1 text-sm text-ink/55">{c.subject}</p>}
                </div>

                <div className="mt-3">
                  {line && <p className="text-sm text-ink/70">{line}</p>}
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ruby">
                    View course
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex justify-center">
        <Link href={`/institutions/${institutionSlug}#courses`} className={btn("secondary", "lg")}>
          See all courses at {institutionName}
        </Link>
      </div>
    </>
  );
}