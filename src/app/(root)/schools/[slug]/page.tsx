// src/app/(root)/schools/[slug]/page.tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Globe, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { BLOB_SHAPES } from "@/lib/blob-shapes";
import { applyHref } from "@/lib/apply-link";
import { SchoolTabs, type SchoolTab } from "@/components/schools/detail/SchoolTabs"
import { CourseExplorer } from "@/components/schools/detail/CourseExplorer"
import {
  Section,
  TextWithImage,
  ServicesSection,
  AccommodationSection,
  RankingsSection,
  LocationSection,
  ScholarshipGrid,
} from "@/components/schools/detail/SchoolSections"

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

async function getSchool(slug: string) {
  return db.school.findFirst({
    where: { slug, isActive: true },
    include: {
      courses: { orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" } },
      scholarships: { orderBy: { order: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchool(slug);
  if (!school) return {};

  const title = school.metaTitle || school.name;
  const description = school.metaDescription || school.description;
  return {
    title,
    description,
    alternates: { canonical: `/schools/${school.slug}` },
    openGraph: { title, description, images: [school.coverImage] },
  };
}

const money = (n: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export default async function SchoolPage({ params }: PageProps) {
  const { slug } = await params;
  const school = await getSchool(slug);
  if (!school) notFound();

  const fees = school.tuitionFrom
    ? school.tuitionTo && school.tuitionTo > school.tuitionFrom
      ? `${money(school.tuitionFrom, school.tuitionCurrency)} to ${money(school.tuitionTo, school.tuitionCurrency)}`
      : `From ${money(school.tuitionFrom, school.tuitionCurrency)}`
    : null;

  const stats = [
    { label: "Ranking", value: school.ranking },
    { label: "Established in", value: school.founded ? String(school.founded) : null },
    { label: "Famous for", value: school.famousFor },
    { label: "Fees per year", value: fees },
  ].filter((s): s is { label: string; value: string } => !!s.value);

  // a tab only exists when its section has something to show
  const tabs: SchoolTab[] = [
    school.overview && { id: "overview", label: "Overview" },
    school.services && { id: "services", label: "Services" },
    school.highlights.length > 0 && { id: "rankings", label: "Rankings" },
    school.accommodation && { id: "accommodation", label: "Accommodation" },
    school.locationInfo && { id: "location", label: "Location" },
    school.courses.length > 0 && { id: "courses", label: "Courses" },
    school.scholarships.length > 0 && { id: "scholarships", label: "Scholarships" },
  ].filter((t): t is SchoolTab => !!t);

  // first three gallery images sit beside Services, Accommodation and Location,
  // the rest go to the Rankings MorphFrame
  const [imgServices, imgAccommodation, imgLocation, ...moreImages] = school.images;

  // Rankings needs at least one image, so fall back to all gallery images, then the cover image
  const rankingsImages =
    moreImages.length > 0
      ? moreImages
      : school.images.length > 0
        ? school.images
        : [{ url: school.coverImage, altText: school.name }];

  const lagoon = BLOB_SHAPES.lagoon;
  const organic = BLOB_SHAPES.organic;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: school.name,
    url: school.website ?? undefined,
    logo: school.logoUrl ?? undefined,
    image: school.coverImage,
    foundingDate: school.founded ? String(school.founded) : undefined,
    address: { "@type": "PostalAddress", addressLocality: school.city, addressCountry: school.country },
  };

  return (
    <div className="bg-cloud text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* HERO */}
      <header className="relative isolate overflow-hidden bg-ink text-cloud">
        {/* campus photo, faded into the dark background */}
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-full lg:w-3/5">
          <Image src={school.coverImage} alt="" fill priority className="object-cover opacity-25" sizes="60vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        </div>

        {/* brand blobs, same shapes as the rest of the site */}
        <svg
          aria-hidden="true"
          viewBox={lagoon.viewBox}
          className="absolute -left-16 top-10 -z-10 w-52 rotate-[-18deg] sm:-left-24 sm:w-72"
        >
          <path d={lagoon.d} fill="#AF0E13" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox={organic.viewBox}
          className="absolute -bottom-10 left-24 -z-10 w-32 rotate-12 opacity-90 sm:left-52 sm:w-44"
        >
          <path d={organic.d} fill="#42057f" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox={organic.viewBox}
          className="absolute -right-10 top-4 -z-10 hidden w-40 -rotate-12 lg:block"
        >
          <path d={organic.d} fill="#faea07" opacity="0.9" />
        </svg>

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <nav aria-label="Breadcrumb" className="text-sm text-cloud/70">
            <a href="/search" className="hover:text-cloud">
              Schools
            </a>
            <span className="mx-2">/</span>
            <span className="text-cloud">{school.name}</span>
          </nav>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
            {school.logoUrl && (
              <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded-2xl bg-white p-4 sm:h-32 sm:w-52">
                {/* plain img on purpose: the logo can come from a host that next/image is not configured for */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={school.logoUrl} alt={`${school.name} logo`} className="max-h-full max-w-full object-contain" />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold leading-tight sm:text-5xl">{school.name}</h1>

              {stats.length > 0 && (
                <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-12">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-sm text-cloud/70">{s.label}</dt>
                      <dd className="mt-1 text-base font-semibold text-gold sm:text-lg">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium">
                <span className="inline-flex items-center gap-2 underline underline-offset-4">
                  <MapPin size={18} className="text-gold" />
                  {school.city}, {school.country}
                </span>
                {school.website && /^https?:\/\//i.test(school.website) && (
                  
                  <a  href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-gold"
                  >
                    <Globe size={18} className="text-gold" />
                    Visit website
                  </a>
                )}

                
                 <a href={applyHref(school.slug, undefined, "school")}
                  className="rounded-full bg-ruby px-5 py-2 text-white no-underline transition-colors hover:bg-ruby-600"
                >
                  Start your application
                </a>

                
                 <a href={`/contact?school=${encodeURIComponent(school.name)}`}
                  className="rounded-full bg-white px-5 py-2 text-ruby no-underline transition-colors hover:bg-ruby hover:text-white"
                >
                  Talk to a counsellor
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SchoolTabs tabs={tabs} />

      {school.overview && (
        <Section id="overview" title="Overview">
          <TextWithImage text={school.overview} tone={0} />
        </Section>
      )}

      {school.services && <ServicesSection text={school.services} image={imgServices} />}

      {school.highlights.length > 0 && <RankingsSection items={school.highlights} images={rankingsImages} />}

      {school.accommodation && (
        <AccommodationSection text={school.accommodation} image={imgAccommodation} />
      )}

      {school.locationInfo && (
        <LocationSection
          text={school.locationInfo}
          image={imgLocation}
          city={school.city}
          country={school.country}
        />
      )}

      {school.courses.length > 0 && (
        <Section id="courses" titleClassName="mx-auto max-w-3xl" title={`Courses offered at ${school.name}`}>
          <CourseExplorer
            schoolName={school.name}
            schoolSlug={school.slug}
            courses={school.courses.map((c) => ({
              id: c.id,
              name: c.name,
              degree: c.degree,
              level: c.level,
              duration: c.duration,
              tuition: c.tuition,
              intakes: c.intakes,
              description: c.description,
            }))}
          />
        </Section>
      )}

      {school.scholarships.length > 0 && (
        <Section id="scholarships" titleClassName="mx-auto max-w-3xl" title={`Scholarships offered by ${school.name}`}>
          <ScholarshipGrid items={school.scholarships} />
        </Section>
      )}
    </div>
  );
}