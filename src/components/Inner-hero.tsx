"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { SectionBreaker } from "@/components/Sectionbreaker";

/* -------------------------------------------------------------------------- */
/*  InnerHero                                                                  */
/* -------------------------------------------------------------------------- */
/*
 * Hero section for inner pages: full-bleed image, centered heading, and the
 * image's bottom edge dissolves into `bottomColor` along the same animated
 * wave used by SectionBreaker between sections — just with `withAccent`
 * turned off, so no color streams render, only the plain blob motion.
 *
 * SectionBreaker already supports this exact use case: leaving `topColor`
 * unset lets whatever sits behind it (here, the hero image) show through
 * above the wave line, while `bottomColor` fills solid below it.
 */

export interface InnerHeroBreadcrumb {
  label: string;
  href?: string;
}

export interface InnerHeroProps {
  /** Hero heading, shown centered over the image. */
  heading: string;
  /** Optional small label above the heading. */
  eyebrow?: string;
  /** Optional supporting line under the heading. */
  subheading?: string;
  /** The hero image. */
  image: {
    src: string;
    alt: string;
  };
  /** Left-to-right trail — the last entry is treated as the current page. */
  breadcrumbs?: InnerHeroBreadcrumb[];
  /**
   * The color the wave settles into at the very bottom of the hero.
   * Match this to whatever section sits directly beneath it on the
   * page (often the page background). Defaults to white.
   */
  bottomColor?: string;
  /** Tailwind height classes for the hero. */
  heightClassName?: string;
  className?: string;
}

export function InnerHero({
  heading,
  eyebrow,
  subheading,
  image,
  breadcrumbs,
  bottomColor = "#ffffff",
  heightClassName = "h-[65vh] min-h-[460px] sm:h-[72vh] lg:h-[90vh]",
  className,
}: InnerHeroProps) {
  return (
    <section
      className={cn(
        // pt-45 lg:pt-48 clears the fixed navbar — same classes, same
        // placement (on the section, not an inner child) as PageHero.
        // Image/scrim below are `absolute`, so they ignore this padding
        // and stay full-bleed; only the normal-flow text div respects it.
        "relative w-full overflow-hidden pt-45 lg:pt-48",
        heightClassName,
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Subtle scrim so the heading stays legible over any photo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/40" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        {eyebrow && (
          <p className="mb-3 text-sm font-medium text-white/80">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
          {heading}
        </h1>
        {subheading && (
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            {subheading}
          </p>
        )}

        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mt-5 sm:mt-6">
            <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white/80 sm:text-[0.78rem]">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${i}`} className="flex items-center gap-x-2">
                    {i > 0 && <span aria-hidden="true" className="text-white/40">/</span>}
                    {crumb.href && !isLast ? (
                      <a href={crumb.href} className="transition-colors hover:text-white">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className={isLast ? "text-white" : "text-white/70"} aria-current={isLast ? "page" : undefined}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
      </div>

      {/* The blob: plain wave, no color streams, image shows through above it. */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <SectionBreaker bottomColor={bottomColor} withAccent={false} />
      </div>
    </section>
  );
}

export default InnerHero;