"use client";

import type { ComponentProps } from "react";
import { ChevronRight } from "lucide-react";
import WorldMap from "@/components/ui/world-map";
import { cn } from "@/lib/utils";

export interface PageHeroBreadcrumb {
  label: string;
  href?: string;
}

export interface PageHeroProps {
  /** The large page title, e.g. "Study Abroad" */
  title: string;
  /** Left-to-right trail — the last entry is treated as the current page and is never rendered as a link, even if it has an href. */
  breadcrumbs: PageHeroBreadcrumb[];
  /** Override the animated arc routes drawn behind the heading. */
  dots?: ComponentProps<typeof WorldMap>["dots"];
  /** Override the arc/line color (defaults to the brand ruby). */
  lineColor?: ComponentProps<typeof WorldMap>["lineColor"];
  /** Color of the world-map dot silhouette itself (the "earth"). Include an
   *  alpha suffix, e.g. "CC" for ~80% opacity, so it stays a backdrop and
   *  doesn't compete with the heading. */
  dotColor?: ComponentProps<typeof WorldMap>["dotColor"];
  className?: string;
}

const DEFAULT_DOTS: ComponentProps<typeof WorldMap>["dots"] = [
  { start: { lat: 6.5244, lng: 3.3792 }, end: { lat: 51.5074, lng: -0.1278 } },   // Lagos -> London
  { start: { lat: 6.5244, lng: 3.3792 }, end: { lat: 43.6532, lng: -79.3832 } },  // Lagos -> Toronto
  { start: { lat: 6.5244, lng: 3.3792 }, end: { lat: 38.9072, lng: -77.0369 } },  // Lagos -> Washington DC
  { start: { lat: 6.5244, lng: 3.3792 }, end: { lat: 40.7128, lng: -74.006 } },   // Lagos -> New York, US
  { start: { lat: 6.5244, lng: 3.3792 }, end: { lat: -33.8688, lng: 151.2093 } }, // Lagos -> Sydney
  { start: { lat: 9.0765, lng: 7.3986 }, end: { lat: 52.52, lng: 13.405 } },      // Abuja -> Berlin
];

export function PageHero({
  title,
  breadcrumbs,
  dots = DEFAULT_DOTS,
  lineColor = "#B0002B",
  dotColor = "#B0002BCC",
  className,
}: PageHeroProps) {
  return (
    <section className={cn(
  "reveal relative isolate overflow-hidden bg-white pt-45 lg:pt-48", // clears the fixed navbar
  className
)}>{/* background: the map is oversized + centered to counteract its own
          fixed aspect ratio, and vignetted so it's most visible at the
          edges and fades to solid white right where the heading sits */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-[0.9] sm:w-[110%] lg:w-[100%]">
          <WorldMap dots={dots} lineColor={lineColor} dotColor={dotColor} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(65%_65%_at_50%_45%,white_0%,rgba(255,255,255,0.5)_35%,rgba(255,255,255,0.05)_75%,rgba(255,255,255,0)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,#FFC2C2,transparent)]" />
      </div>

     <div className="container relative z-10 mx-auto flex min-h-[200px] flex-col items-center justify-center px-5 py-10 text-center -mt-10 sm:mt-0 sm:min-h-[230px] sm:py-12 lg:min-h-[260px] lg:py-14">
       <h1 className="-mt-16 font-display text-[2rem] font-extrabold uppercase leading-none tracking-[0.02em] text-ink sm:mt-0 sm:text-[2.6rem] lg:text-[3.25rem]">
  {title}
</h1>

        <nav aria-label="Breadcrumb" className="mt-5 sm:mt-6">
          <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-[0.72rem] font-bold uppercase tracking-[0.14em] sm:text-[0.78rem]">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-x-2">
                  {i > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-ink/30" strokeWidth={2.4} aria-hidden="true" />
                  )}
                  {crumb.href && !isLast ? (
                    <a href={crumb.href} className="text-ink/45 transition-colors hover:text-ruby-600">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={isLast ? "text-ruby-600" : "text-ink/45"} aria-current={isLast ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </section>
  );
}

export default PageHero;