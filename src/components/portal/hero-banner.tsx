"use client";

// src/components/portal/hero-banner.tsx

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, GraduationCap } from "lucide-react";
import {
  elevation1,
  filledButton,
  outlinedButton,
} from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";
import { ELIGIBILITY_PAGE } from "@/lib/portal-paths";
import Image from "next/image";

const HERO_IMAGE = "/hero-banner.jpeg";

// Quick links in a row ABOVE the banner, right aligned.
const quickLinkClass =
  "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-semibold text-neutral-600 transition hover:text-ruby-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/50 sm:text-sm";

function WavingHand() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className="inline-block origin-[70%_70%]"
      animate={
        reduceMotion
          ? undefined
          : { rotate: [0, 14, -8, 14, -4, 10, 0] }
      }
      transition={{
        duration: 1.6,
        ease: "easeInOut",
        delay: 0.35,
      }}
    >
      👋
    </motion.span>
  );
}

export function HeroBanner({
  firstName,
}: {
  firstName: string | null;
}) {
  return (
    <div>
      {/* Quick links: above the banner, top right. Phones and tablets only: on desktop they live in the navbar. */}
      <nav aria-label="Quick links" className="mb-1.5 flex items-center justify-end gap-3 sm:gap-4 lg:hidden">
        <Link href="/courses" className={quickLinkClass}>
          <GraduationCap size={15} className="text-ruby-600" />
          Courses
        </Link>
        <Link href="/institutions" className={quickLinkClass}>
          <Building2 size={15} className="text-ruby-600" />
          Institutions
        </Link>
      </nav>

    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-ruby-100 bg-ruby-50",
        elevation1
      )}
    >
      {/* Banner image */}
      <Image
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 80vw"
        className="pointer-events-none select-none object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[190px] items-start px-5 pt-4 sm:min-h-[210px] sm:px-6 sm:pt-5 md:min-h-[230px] md:px-7 md:pt-5 lg:min-h-[240px] lg:px-8 lg:pt-5">
        <div className="max-w-[58%] min-w-0">

          {/* Greeting */}
          <p className="flex items-center gap-2 text-sm font-semibold text-ink sm:text-base">
            Hi, {firstName ?? "there"} <WavingHand />
          </p>

          {/* Mobile heading */}
          <h1 className="mt-4 font-display text-xl font-semibold leading-tight text-ruby-600 md:hidden">
            Not sure what to study?
           
          </h1>

          {/* Tablet + desktop heading */}
          <h1 className="mt-1.5 hidden font-display text-2xl font-semibold leading-tight text-ruby-600 md:block lg:text-3xl">
            Not sure what you can
            <span className="block">study abroad?</span>
          </h1>

          

          {/* Tablet + desktop description */}
          <p className="mt-3 hidden max-w-md text-xs leading-5 text-neutral-600 md:block sm:text-sm sm:leading-5">
            Let&apos;s help you find courses and institutions that fit your
            background.
          </p>

          {/* Buttons: always one horizontal line; compact at md, normal at lg */}
          <div className="mt-4 flex flex-nowrap items-center gap-2 md:gap-1.5 lg:gap-2">
            <Link
              href={ELIGIBILITY_PAGE}
              className={cn(
                filledButton,
                "shrink-0 whitespace-nowrap text-xs sm:text-sm",
                "md:gap-1 md:px-2.5 md:py-1.5 md:text-[11px]",
                "lg:gap-2 lg:px-4 lg:py-2 lg:text-sm"
              )}
            >
              Show my matches
              <ArrowRight
                size={15}
                className="md:h-3 md:w-3 lg:h-[15px] lg:w-[15px]"
              />
            </Link>

            <Link
              href="#applications"
              className={cn(
                outlinedButton,
                "hidden shrink-0 whitespace-nowrap text-xs sm:inline-flex sm:text-sm",
                "md:px-2.5 md:py-1.5 md:text-[11px]",
                "lg:px-4 lg:py-2 lg:text-sm"
              )}
            >
              Book Your Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}