"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import {
  SERVICE_CATEGORIES,
  type ServiceCategory,
  type ServiceLogo,
} from "@/data/services";
import { Button } from "../ui/button";
import Link from "next/link";
import { JourneyChainIcon } from "../icons/journey-chain-icon";
import { MiniSectionBreaker } from "./MinisectionBreaker";

/* -------------------------------------------------------------------------- */
/*  Ruhe Global Resources — "Your Global Journey Starts Here"                  */
/*                                                                            */
/*  Desktop 4 cols · tablet 2 cols · mobile 1 col.                            */
/*  White surface, dark headings, muted grey copy, Ruby only as an accent.    */
/*  Content lives in /data/services.ts — this file is presentation only.      */
/* -------------------------------------------------------------------------- */

const RUBY = "#AF0E13";

/* Logo cap height is 2.25rem (2.75rem from `sm`), multiplied by each logo's
   optical `scale`. See the max-h-[calc(...)] classes in LogoMark. */

/* -------------------------------------------------------------------------- */

/**
 * One logo, capped by height and never stretched. `scale` nudges individual
 * marks so a compact emblem and a long wordmark read at the same weight.
 *
 * If a file is missing the cell falls back to the brand name in muted grey so
 * the grid never collapses mid-build. That is a placeholder, not a substitute
 * logo — replace the asset before going live.
 */
function LogoMark({ logo }: { logo: ServiceLogo }) {
  const [failed, setFailed] = useState(false);

  const style = {
    "--logo-scale": logo.scale ?? 1,
  } as CSSProperties;

  return (
    <div className="flex h-12 items-center justify-center sm:h-14" style={style}>
      {failed ? (
        <span className="px-1 text-center text-[11px] font-medium leading-tight text-neutral-400">
          {logo.name}
        </span>
      ) : (
        <Image
          src={logo.src}
          alt={logo.name}
          width={logo.width}
          height={logo.height}
          onError={() => setFailed(true)}
          /* Literal classes: Tailwind's scanner only sees complete strings in
             the source, so these can't be assembled from variables. */
          className="w-auto max-w-full object-contain max-h-[calc(2.25rem*var(--logo-scale))]  grayscale transition duration-300 ease-out group-hover/card:opacity-100 motion-reduce:transition-none sm:max-h-[calc(2.75rem*var(--logo-scale))]"
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function CategoryCard({ category }: { category: ServiceCategory }) {
  const headingId = `${category.id}-heading`;
  const captionId = `${category.id}-caption`;
  const servicesId = `${category.id}-services`;

  return (
    <article
      aria-labelledby={headingId}
      className="group/card flex h-full flex-col rounded-3xl border border-[#AF0E13]/15 bg-white p- text-center shadow-[0_1px_2px_rgba(16,16,16,0.03)] transition-colors duration-300 hover:border-[#AF0E13]/40 focus-within:border-[#AF0E13]/40 motion-reduce:transition-none sm:p-4"
    >
     

      <h3
        id={headingId}
        className="mt-2 text-xl font-semibold tracking-tight text-neutral-900 sm:text-[22px]"
      >
        {category.title}
      </h3>

      

      <p className="mx-auto mt-2 max-w-[46ch] text-[13px] leading-relaxed text-neutral-500">
        {category.description}
      </p>

      {/* Full service list — exposed to assistive tech and crawlers.
          Remove `sr-only` to surface it visually. */}
      <h4 id={servicesId} className="sr-only">
        {category.title} services
      </h4>
      <ul aria-labelledby={servicesId} className="sr-only">
        {category.services.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>

      <div className="mt-7 flex flex-1 flex-col">
       

        <ul
          aria-labelledby={captionId}
          className="mt-5 grid grid-cols-3 content-start items-center gap-x-4 gap-y-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {category.logos.map((logo) => (
            <li key={logo.src}>
              <LogoMark logo={logo} />
            </li>
          ))}
        </ul>
      </div>

      
    </article>
  );
}

/* -------------------------------------------------------------------------- */

export default function GlobalJourneySection({
  categories = SERVICE_CATEGORIES,
  title = "Your Global Journey Starts Here",
  subtitle = "From choosing the right institution to travelling and settling into your new destination, we support every step of your journey.",
}: {
  categories?: ServiceCategory[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <>
    <section
      aria-labelledby="global-journey-heading"
      className="w-full bg-white  pt-16 pb-5  "
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <header className="mx-auto max-w-3xl text-center">
          <h2
            id="global-journey-heading"
            className="text-[28px] font-semibold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-[44px]"
          >
            {title}
          </h2>
          <span
            aria-hidden="true"
            className="mx-auto mt-5 block h-[3px] w-12 rounded-full"
            style={{ backgroundColor: RUBY }}
          />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-500 sm:text-[17px]">
            {subtitle}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 sm:mt-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

     
      </div>

      <div className="mt-6 flex justify-center sm:mt-10">
  <Button variant="ruby" size="lg" asChild>
    <Link href="/auth/login">
      Start Your Journey Today <JourneyChainIcon className="size-5" />
    </Link>
  </Button>
</div>

    </section>

    <MiniSectionBreaker />
    </>
  );
}