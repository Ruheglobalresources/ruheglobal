import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionBreaker } from "../Sectionbreaker";
import MiniSectionBreaker from "./MinisectionBreaker";

/* -------------------------------------------------------------------------- */
/*  Ruhe Global Resources — ruby CTA banner                                    */
/*                                                                             */
/*  Glassmorphism panel over the animated SectionBreaker: deep-ruby ribbons   */
/*  keep running full-bleed behind everything (z-0). A thin, lightly-blurred  */
/*  light-ruby glass layer sits above it (z-10) — sheer enough that the       */
/*  ribbon motion stays clearly visible underneath, same two-tone read as     */
/*  the footer's purple waves. Heading + CTA sit on top (z-20).               */
/* -------------------------------------------------------------------------- */

export type CourseSearchSectionProps = {
  heading?: string;
  ctaLabel?: string;
  href?: string;
};

export default function CourseSearchSection({
  heading = "Your study abroad journey starts with the right course",
  ctaLabel = "Search course",
  href = "/courses",
}: CourseSearchSectionProps) {
  return (
    <section
      aria-labelledby="course-search-heading"
      className="relative isolate overflow-hidden lg:px-20"
    >
      {/* Animated ribbons — deep ruby, stay in the back, keep animating */}
      <MiniSectionBreaker
        fill
        topColor="var(--color-ruby)"
        bottomColor="var(--color-ruby)"
        className="z-0"
      />

      {/* Glass layer — sheer light-ruby tint, barely blurred so the ribbons read through */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 border-y border-white/20 bg-ruby-100/40 backdrop-blur-[1px] backdrop-saturate-200"
      />

      <div className="relative z-20 mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-16 py-14 sm:px-16 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <h2
          id="course-search-heading"
          className="max-w-lg  text-2xl md:text-3xl text-center font-bold leading-[1.15] text-ink/90 sm:text-3xl lg:text-4xl"
        >
          {heading}
        </h2>

        <Link
          href={href}
          aria-label={ctaLabel}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border-2 border-[#AF0E13] bg-white px-10 py-4 text-sm font-medium text-[#AF0E13] transition-colors hover:bg-[#AF0E13] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby lg:px-14 lg:text-base lg:font-bold"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 shrink-0 lg:h-5 lg:w-5" />
        </Link>
      </div>
    </section>
  );
}