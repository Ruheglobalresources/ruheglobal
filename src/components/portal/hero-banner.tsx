"use client";

// src/components/portal/hero-banner.tsx

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  elevation1,
  filledButton,
  outlinedButton,
} from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";
import Image from "next/image";

const HERO_IMAGE = "/hero-banner.jpeg";

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

          {/* Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/portal/courses"
              className={cn(filledButton, "text-xs sm:text-sm")}
            >
              Show my matches
              <ArrowRight size={15} />
            </Link>

            <Link
              href="#applications"
              className={cn(
                outlinedButton,
                "hidden text-xs sm:inline-flex sm:text-sm"
              )}
            >
              Book Your Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
