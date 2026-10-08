// src/app/(root)/institutions/[slug]/courses/page.tsx
// The page the big "View courses" buttons on the institution page point to.
// The server only loads the institution header (name, place, logo) and answers 404 for an
// unknown or unpublished slug. The courses themselves are read by the client list from
// GET /api/v1/courses?institution=<slug>, with search and infinite scroll.
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { safeUrl, truncate } from "@/lib/institution-format";
import { InstitutionCoursesExplorer } from "@/components/institutions/detail/InstitutionCoursesExplorer";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
};

// cache() so generateMetadata and the page share one query
const getInstitution = cache(async (slug: string) =>
  db.institution.findFirst({
    where: { slug, isActive: true },
    select: {
      slug: true,
      name: true,
      city: true,
      country: true,
      logoUrl: true,
      imageUrl: true,
      summary: true,
      programs: true,
      _count: { select: { courses: true } },
    },
  })
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) return {};

  const title = `Courses at ${inst.name}`;
  const place = [inst.city, inst.country].filter(Boolean).join(", ");
  const description = truncate(
    `Browse every course at ${inst.name}${place ? ` in ${place}` : ""}. See fees, duration and intakes, then apply with Ruhe Global Resources.`,
    160
  );
  const image = inst.imageUrl || inst.logoUrl;

  return {
    title,
    description,
    alternates: { canonical: `/institutions/${inst.slug}/courses` },
    openGraph: { title, description, images: image ? [image] : undefined },
  };
}

export default async function InstitutionCoursesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { q } = await searchParams;

  const inst = await getInstitution(slug);
  if (!inst) notFound();

  const query = q?.trim().slice(0, 80) || undefined;

  // real course rows when there are any, otherwise the subject areas listed (same rule as the catalog API)
  const courseCount = inst._count.courses > 0 ? inst._count.courses : inst.programs.length;

  return (
    <InstitutionCoursesExplorer
      institution={{
        slug: inst.slug,
        name: inst.name,
        city: inst.city,
        country: inst.country,
        logoUrl: safeUrl(inst.logoUrl),
      }}
      courseCount={courseCount}
      initialQuery={query}
    />
  );
}