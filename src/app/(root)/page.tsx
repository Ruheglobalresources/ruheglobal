//src/app/page.tsx
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
  const blogPosts = await db.blogPost.findMany({
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
  });

  return (
    <main>
      <HeroSection
        backgroundVideoSrc="/hero.webm"
      />

      <PressTicker />
       <CuriositySection />
      <TopSchoolsSection />
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