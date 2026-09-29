//src/app/(root)/page.tsx
import { HeroSection } from "@/components/layout/hero";
import { PressTicker } from "@/components/PressTicker";
import { CuriositySection } from "@/components/curiositysection/CuriositySection";
import { TopSchoolsSection } from "@/components/schools/TopSchoolsSection";
import { TeamSection } from "@/components/teams/TeamSection";
import { CompanyReviewsSection } from "@/components/reviews/CompanyReviewsSection";
import { StudyAbroadReviewsSection } from "@/components/reviews/StudyAbroadReviewsSection";
import { ReviewsSeparator } from "@/components/ReviewsSeparator";
import GlobalJourneySection from "@/components/sections/Globaljourneysection";
import CountriesSection from "@/components/sections/Countriessection";
import { BlogSection } from "@/components/sections/BlogSection";
import { db } from "@/lib/db";
import CourseSearchSection from "@/components/sections/CourseSearchSection";
import { ProcessConsultationSection } from "@/components/sections/ProcessConsultationSection";

export const revalidate = 60;

export default async function HomePage() {
  const [blogPosts, schoolRows] = await Promise.all([
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        coverImageAlt: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    // Same visibility and ordering rules as the public schools API:
    // only active schools, in the admin defined order, then by name.
    db.school.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        city: true,
        country: true,
        coverImage: true,
        coverImageAlt: true,
        founded: true,
        ranking: true,
        tuitionFrom: true,
        tuitionTo: true,
        tuitionCurrency: true,
        acceptanceRate: true,
        description: true,
        _count: { select: { courses: true } },
      },
    }),
  ]);

  const topSchools = schoolRows.map(({ _count, ...school }) => ({
    ...school,
    courseCount: _count.courses,
  }));

  return (
    <main>
      <HeroSection
        backgroundVideoSrc="/hero.webm"
      />

      <PressTicker />
       <CuriositySection />
      <TopSchoolsSection schools={topSchools} />
      <GlobalJourneySection />
      
      <ProcessConsultationSection />
      <CountriesSection/>  
      <CourseSearchSection />
      <BlogSection posts={blogPosts} />
      <CompanyReviewsSection />
      <ReviewsSeparator />
      <StudyAbroadReviewsSection />
      
    </main>
  );
}