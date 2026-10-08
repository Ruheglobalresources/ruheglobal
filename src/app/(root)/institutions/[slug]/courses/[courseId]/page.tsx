// src/app/(root)/institutions/[slug]/courses/[courseId]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ArrowRight, Banknote, CalendarDays, Check, Clock, GraduationCap, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { applyHref } from "@/lib/apply-link";
import { cn } from "@/lib/utils";
import {
  courseFee,
  englishRequirement,
  groupDocuments,
  safeUrl,
  truncate,
  tuitionLabel,
} from "@/lib/institution-format";
import { SchoolTabs, type SchoolTab } from "@/components/schools/detail/SchoolTabs";
import { btn } from "@/components/institutions/detail/ui";
import {
  Card,
  FaqList,
  Prose,
  QuickFacts,
  StatStrip,
  type Stat,
} from "@/components/institutions/detail/InstitutionSections";
import { IntakeChips, RelatedCourses } from "@/components/institutions/detail/CourseSections";
import { DocumentsPanel } from "@/components/institutions/detail/DocumentsPanel";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string; courseId: string }> };

// cache() so generateMetadata and the page share one query. The course must belong to
// the institution in the URL, otherwise it is a 404 (no mixing a course with another school).
const getCourse = cache(async (slug: string, courseId: string) =>
  db.institutionCourse.findFirst({
    where: { id: courseId, institution: { slug, isActive: true } },
    include: {
      institution: {
        include: {
          documents: { orderBy: [{ studyLevel: "asc" }, { order: "asc" }] },
          faqs: { orderBy: { order: "asc" } },
          _count: { select: { courses: true } },
        },
      },
    },
  })
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, courseId } = await params;
  const course = await getCourse(slug, courseId);
  if (!course) return {};

  const inst = course.institution;
  const title = `${course.name} at ${inst.name}`;
  const description = course.description
    ? truncate(course.description, 160)
    : truncate(
        [
          `Study ${course.name} at ${inst.name}${inst.country ? `, ${inst.country}` : ""}.`,
          course.duration ? `Duration: ${course.duration}.` : null,
          course.nextIntake ? `Next intake: ${course.nextIntake}.` : null,
        ]
          .filter(Boolean)
          .join(" "),
        160
      );
  const image = inst.imageUrl || inst.logoUrl;

  return {
    title,
    description,
    alternates: { canonical: `/institutions/${inst.slug}/courses/${course.id}` },
    openGraph: { title, description, images: image ? [image] : undefined },
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug, courseId } = await params;
  const course = await getCourse(slug, courseId);
  if (!course) notFound();

  const inst = course.institution;
  const place = [inst.city, inst.country].filter(Boolean).join(", ");
  const logo = safeUrl(inst.logoUrl);
  const photo = safeUrl(inst.imageUrl);
  const website = safeUrl(inst.website);
  const institutionHref = `/institutions/${inst.slug}`;

  // ---- fees: this course's own fee, with the institution's range as a clearly labelled fallback
  const fee = courseFee(course, inst.tuitionCurrency);
  const institutionTuition = tuitionLabel(inst);

  // ---- entry requirements: English (institution-wide) + documents for this course's study level
  const english = englishRequirement(inst);
  const level = course.level?.trim().toLowerCase();
  const allDocGroups = groupDocuments(inst.documents);
  const matchingDocs = level ? allDocGroups.filter((g) => g.level.trim().toLowerCase() === level) : [];
  const docGroups = matchingDocs.length > 0 ? matchingDocs : allDocGroups;

  // ---- other courses at this institution: same subject first
  const others = await db.institutionCourse.findMany({
    where: { institutionId: inst.id, id: { not: course.id } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    take: 24,
  });
  const sameSubject = (c: { subject: string | null }) => Boolean(course.subject) && c.subject === course.subject;
  const related = [...others.filter(sameSubject), ...others.filter((c) => !sameSubject(c))]
    .slice(0, 6)
    .map((c) => ({
      id: c.id,
      name: c.name,
      degree: c.degree,
      subject: c.subject,
      duration: c.duration,
      nextIntake: c.nextIntake,
      fee: courseFee(c, inst.tuitionCurrency),
    }));

  const nextIntake = course.nextIntake ?? inst.upcomingIntake;

  const stats = [
    course.level && { icon: GraduationCap, label: "Study level", value: course.level },
    course.duration && { icon: Clock, label: "Duration", value: course.duration },
    nextIntake && { icon: CalendarDays, label: "Next intake", value: nextIntake },
    fee && { icon: Banknote, label: "Tuition fee", value: fee },
  ].filter((s): s is Stat => !!s);

  const hasFees = Boolean(fee || institutionTuition || inst.tuitionNote || course.intakes || course.nextIntake);
  const hasRequirements = english.lines.length > 0 || docGroups.length > 0;

  // a tab only exists when its section has something to show
  const tabs = [
    { id: "overview", label: "Overview" },
    hasFees && { id: "fees", label: "Fees & intakes" },
    hasRequirements && { id: "requirements", label: "Entry requirements" },
    related.length > 0 && { id: "more-courses", label: "More courses" },
    inst.faqs.length > 0 && { id: "faqs", label: "FAQs" },
  ].filter((t): t is SchoolTab => !!t);

  const socials = {
    facebookUrl: inst.facebookUrl,
    twitterUrl: inst.twitterUrl,
    instagramUrl: inst.instagramUrl,
    linkedinUrl: inst.linkedinUrl,
    youtubeUrl: inst.youtubeUrl,
  };

  const currency = course.tuitionCurrency ?? inst.tuitionCurrency;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: truncate(course.description ?? `${course.name} at ${inst.name}`, 300),
    provider: { "@type": "CollegeOrUniversity", name: inst.name, sameAs: website ?? undefined },
    offers:
      course.tuitionAmount && currency
        ? { "@type": "Offer", price: course.tuitionAmount, priceCurrency: currency.toUpperCase() }
        : undefined,
  };

  return (
    <div className="bg-cloud pb-10 text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* HERO: same size and padding as the school and institution pages */}
      <header className="relative isolate overflow-hidden bg-ink text-white">
        {photo && (
          <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-full lg:w-3/5">
            {/* plain img on purpose: the photo can come from a host next/image is not configured for */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" className="h-full w-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-y-1 text-sm text-white/70">
            <Link href="/search" className="hover:text-white">
              Institutions
            </Link>
            <span className="mx-2">/</span>
            <Link href={institutionHref} className="hover:text-white">
              {inst.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{course.name}</span>
          </nav>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
            {logo && (
              <Link
                href={institutionHref}
                aria-label={`${inst.name} profile`}
                className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-white p-4 sm:size-32"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={`${inst.name} logo`} className="max-h-full max-w-full object-contain" />
              </Link>
            )}

            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{course.name}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
                <Link href={institutionHref} className="underline underline-offset-4 hover:text-gold">
                  {inst.name}
                </Link>
                {place && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={18} className="text-gold" />
                    {place}
                  </span>
                )}
                {[course.degree, course.level, course.subject].filter(Boolean).map((chip) => (
                  <span key={chip} className="rounded border border-white/30 px-2.5 py-0.5 text-xs">
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href={applyHref(inst.slug, course.id)} className={cn(btn("primary", "lg"), "w-full sm:w-auto")}>
                  Apply for this course
                  <ArrowRight size={18} />
                </Link>
                <Link href={institutionHref} className={cn(btn("secondary", "lg"), "w-full sm:w-auto")}>
                  View institution
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {tabs.length > 1 && <SchoolTabs tabs={tabs} ariaLabel="Course sections" />}

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:px-12">
        <div className="min-w-0 space-y-6">
          <div id="overview" className="scroll-mt-16 space-y-6">
            {stats.length > 0 && <StatStrip items={stats} />}

            <Card title="About this course">
              {course.description ? (
                <Prose text={course.description} />
              ) : (
                <p className="text-base leading-7 text-ink/75">
                  The full course outline for {course.name} is shared by your counsellor. Talk to us to get the modules,
                  entry grades and the latest fee for your intake.
                </p>
              )}
            </Card>
          </div>

          {hasFees && (
            <Card id="fees" title="Fees & intakes">
              <div className="space-y-5">
                {fee ? (
                  <div>
                    <p className="font-display text-3xl font-semibold text-ink">{fee}</p>
                    <p className="mt-1 text-sm text-ink/55">Tuition fee for this course</p>
                  </div>
                ) : (
                  institutionTuition && (
                    <div>
                      <p className="font-display text-3xl font-semibold text-ink">{institutionTuition}</p>
                      <p className="mt-1 text-sm text-ink/55">
                        Tuition range across {inst.name}. Your counsellor will confirm the exact fee for this course.
                      </p>
                    </div>
                  )
                )}

                {inst.tuitionNote && <p className="text-sm leading-6 text-ink/70">{inst.tuitionNote}</p>}

                <IntakeChips next={course.nextIntake} intakes={course.intakes} />
              </div>
            </Card>
          )}

          {hasRequirements && (
            <Card id="requirements" title="Entry requirements">
              <div className="space-y-6">
                {english.lines.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">
                      English language
                    </h3>
                    <ul className="space-y-1.5">
                      {english.lines.map((line) => (
                        <li key={line} className="flex gap-2.5 text-base leading-6 text-ink/80">
                          <Check size={18} className="mt-0.5 shrink-0 text-ruby" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                    {english.note && <p className="mt-2 text-sm text-ink/60">{english.note}</p>}
                    <p className="mt-2 text-xs text-ink/50">English requirements are set by {inst.name} for all of its courses.</p>
                  </div>
                )}

                {docGroups.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/60">
                      {matchingDocs.length > 0 ? `Documents for ${course.level} applicants` : "Documents"}
                    </h3>
                    <DocumentsPanel groups={docGroups} />
                  </div>
                )}
              </div>
            </Card>
          )}

          {related.length > 0 && (
            <Card id="more-courses" title={`More courses at ${inst.name}`}>
              <RelatedCourses courses={related} institutionSlug={inst.slug} institutionName={inst.name} />
            </Card>
          )}

          {inst.faqs.length > 0 && (
            <Card id="faqs" title="Frequently asked questions" bodyClassName="p-0">
              <FaqList faqs={inst.faqs} />
            </Card>
          )}
        </div>

        <QuickFacts
          nextIntake={nextIntake}
          tuition={fee ?? institutionTuition}
          tuitionNote={inst.tuitionNote}
          english={english}
          applyUrl={applyHref(inst.slug, course.id)}
          contactUrl={`/contact?school=${encodeURIComponent(inst.name)}`}
          socials={socials}
        />
      </div>
    </div>
  );
}