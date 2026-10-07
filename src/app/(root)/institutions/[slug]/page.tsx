// src/app/(root)/institutions/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Globe, Landmark, MapPin, Percent, Trophy } from "lucide-react";
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
  CampusList,
  FaqList,
  Prose,
  QuickFacts,
  StatStrip,
  SubjectChips,
  type Stat,
} from "@/components/institutions/detail/InstitutionSections";
import { HighlightsTabs, type HighlightItem } from "@/components/institutions/detail/HighlightsTabs";
import { DocumentsPanel } from "@/components/institutions/detail/DocumentsPanel";
import { InstitutionCourses } from "@/components/institutions/detail/InstitutionCourses";

export const revalidate = 60;

// How many courses the detail page carries. The full list lives on the courses page.
const COURSE_PREVIEW = 48;

type PageProps = { params: Promise<{ slug: string }> };

// cache() so generateMetadata and the page share one query
const getInstitution = cache(async (slug: string) =>
  db.institution.findFirst({
    where: { slug, isActive: true },
    include: {
      courses: { orderBy: [{ order: "asc" }, { name: "asc" }], take: COURSE_PREVIEW },
      campuses: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      documents: { orderBy: [{ studyLevel: "asc" }, { order: "asc" }] },
      _count: { select: { courses: true } },
    },
  })
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) return {};

  const title = inst.metaTitle || inst.name;
  const description = inst.metaDescription || truncate(inst.summary, 160);
  const image = inst.imageUrl || inst.logoUrl;
  return {
    title,
    description,
    alternates: { canonical: `/institutions/${inst.slug}` },
    openGraph: { title, description, images: image ? [image] : undefined },
  };
}

export default async function InstitutionPage({ params }: PageProps) {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) notFound();

  const place = [inst.city, inst.country].filter(Boolean).join(", ");
  const website = safeUrl(inst.website);
  const logo = safeUrl(inst.logoUrl);
  const photo = safeUrl(inst.imageUrl);

  // real course rows when there are any, otherwise the subject areas listed (same rule as the catalog API)
  const courseTotal = inst._count.courses;
  const courseCount = courseTotal > 0 ? courseTotal : inst.programs.length;
  const coursesHref = `/institutions/${inst.slug}/courses`;

  const courseRows = inst.courses.map((c) => ({
    id: c.id,
    name: c.name,
    degree: c.degree,
    level: c.level,
    subject: c.subject,
    duration: c.duration,
    nextIntake: c.nextIntake,
    intakes: c.intakes,
    description: c.description,
    fee: courseFee(c, inst.tuitionCurrency),
  }));

  const highlights = [
    { id: "overview", label: "Overview", text: inst.overview },
    { id: "student-life", label: "Student life", text: inst.studentLife },
    { id: "accommodation", label: "Accommodation", text: inst.accommodation },
    { id: "library", label: "Library", text: inst.library },
    { id: "sports", label: "Sports", text: inst.sports },
  ].filter((h): h is HighlightItem => !!h.text?.trim());

  const docGroups = groupDocuments(inst.documents);

  const stats = [
    inst.founded && { icon: Landmark, label: "Founded", value: String(inst.founded) },
    inst.ranking && { icon: Trophy, label: "Ranking", value: inst.ranking },
    inst.acceptanceRate && { icon: Percent, label: "Acceptance rate", value: inst.acceptanceRate },
    courseCount > 0 && { icon: BookOpen, label: "Courses", value: String(courseCount) },
  ].filter((s): s is Stat => !!s);

  // a tab only exists when its section has something to show
  const tabs = [
    { id: "overview", label: "Overview" },
    courseRows.length > 0 && { id: "courses", label: "Courses" },
    highlights.length > 0 && { id: "highlights", label: "Highlights" },
    inst.campuses.length > 0 && { id: "campuses", label: "Campuses" },
    docGroups.length > 0 && { id: "documents", label: "Required Documents" },
    inst.faqs.length > 0 && { id: "faqs", label: "FAQs" },
  ].filter((t): t is SchoolTab => !!t);

  const socials = {
    facebookUrl: inst.facebookUrl,
    twitterUrl: inst.twitterUrl,
    instagramUrl: inst.instagramUrl,
    linkedinUrl: inst.linkedinUrl,
    youtubeUrl: inst.youtubeUrl,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollegeOrUniversity",
        name: inst.name,
        url: website ?? undefined,
        logo: logo ?? undefined,
        image: photo ?? undefined,
        description: truncate(inst.summary, 300),
        foundingDate: inst.founded ? String(inst.founded) : undefined,
        address: { "@type": "PostalAddress", addressLocality: inst.city ?? undefined, addressCountry: inst.country ?? undefined },
        sameAs: Object.values(socials).map(safeUrl).filter(Boolean),
      },
      inst.faqs.length > 0
        ? {
            "@type": "FAQPage",
            mainEntity: inst.faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }
        : null,
    ].filter(Boolean),
  };

  return (
    <div className="bg-cloud pb-10 text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* HERO: same size and padding as the school page */}
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
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/search" className="hover:text-white">
              Institutions
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{inst.name}</span>
          </nav>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
            {logo && (
              <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-white p-4 sm:size-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt={`${inst.name} logo`} className="max-h-full max-w-full object-contain" />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-5xl">{inst.name}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
                {place && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={18} className="text-gold" />
                    {place}
                  </span>
                )}
                {inst.institutionType && (
                  <span className="rounded border border-white/30 px-2.5 py-0.5 text-xs">{inst.institutionType}</span>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-gold"
                  >
                    <Globe size={18} className="text-gold" />
                    Visit website
                  </a>
                )}
              </div>

              {courseCount > 0 && (
                <div className="mt-7">
                  <Link href={coursesHref} className={cn(btn("primary", "lg"), "w-full sm:w-auto")}>
                    View courses
                    <ArrowRight size={18} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {tabs.length > 1 && <SchoolTabs tabs={tabs} ariaLabel="Institution sections" />}

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:px-12">
        <div className="min-w-0 space-y-6">
          <div id="overview" className="scroll-mt-16 space-y-6">
            {stats.length > 0 && <StatStrip items={stats} />}
            <Card title={`About ${inst.name}`}>
              <Prose text={inst.summary} />
              {inst.programs.length > 0 && <SubjectChips items={inst.programs} />}
            </Card>
          </div>

          {courseRows.length > 0 && (
            <Card
              id="courses"
              title="Courses"
              aside={
                <Link href={coursesHref} className="text-sm font-semibold text-ruby hover:underline">
                  View all {courseCount}
                </Link>
              }
            >
              <InstitutionCourses
                courses={courseRows}
                institutionSlug={inst.slug}
                coursesHref={coursesHref}
                total={courseCount}
              />
            </Card>
          )}

          {highlights.length > 0 && (
            <Card id="highlights" title="Highlights" bodyClassName="p-0">
              <HighlightsTabs items={highlights} />
            </Card>
          )}

          {inst.campuses.length > 0 && (
            <Card id="campuses" title="Campuses">
              <CampusList campuses={inst.campuses} institutionName={inst.name} country={inst.country} />
            </Card>
          )}

          {docGroups.length > 0 && (
            <Card id="documents" title="Required documents">
              <DocumentsPanel groups={docGroups} />
            </Card>
          )}

          {inst.faqs.length > 0 && (
            <Card id="faqs" title="Frequently asked questions" bodyClassName="p-0">
              <FaqList faqs={inst.faqs} />
            </Card>
          )}
        </div>

        <QuickFacts
          nextIntake={inst.upcomingIntake}
          tuition={tuitionLabel(inst)}
          tuitionNote={inst.tuitionNote}
          english={englishRequirement(inst)}
          applyUrl={applyHref(inst.slug)}
          contactUrl={`/contact?school=${encodeURIComponent(inst.name)}`}
          socials={socials}
        />
      </div>
    </div>
  );
}