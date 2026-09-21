// HeroSection.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { MorphFrame } from "../MorphFrame";
import { TravelSearchWidget } from "../TravelSearchWidget";
import { Navbar } from "./Navbar";
import SectionBreaker from "../Sectionbreaker";

export type HeroSectionProps = {
  backgroundImageSrc?: string;
  backgroundVideoSrc?: string;
  /** Photos shown inside the morphing frame. Omit for the frame's fallback gradient state. */
  frameImages?: string[];
  /** Caption per frame image, e.g. destination names — cycles in sync with the images. */
  frameLabels?: string[];
};

export function HeroSection({
  backgroundImageSrc = "/hero.jpg",
  backgroundVideoSrc,
  frameImages,
  frameLabels,
}: HeroSectionProps) {
  // Desktop and mobile show the widget in very different spots (right under
  // the navbar vs. below the headline copy), so each needs its own trigger —
  // a single shared sentinel fired the morph too early for whichever layout
  // wasn't currently visible. Only one of the two wrappers is ever actually
  // on screen at a given breakpoint (the other is `display: none`, which
  // IntersectionObserver reports as "not in view"), so ANDing them together
  // means the inactive one always contributes `true` and the active one's
  // real in-view state is what actually decides `pinned`.
  const { ref: desktopWidgetRef, inView: desktopWidgetInView } = useInView({ threshold: 0 });
  const { ref: mobileWidgetRef, inView: mobileWidgetInView } = useInView({ threshold: 0 });
  const pinned = !desktopWidgetInView && !mobileWidgetInView;

  return (
    <section className="relative min-h-[100svh] bg-ink text-cloud lg:min-h-0">
      {/* background video / image / fallback — overflow-hidden lives here, not on
          the section, so the widget can still become position:fixed later without
          getting clipped once the section itself scrolls out of the viewport */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundVideoSrc ? (
          <video
            src={backgroundVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : backgroundImageSrc ? (
          <Image
            src={backgroundImageSrc}
            alt=""
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-ink via-teal/30 to-ink" />
        )}
        <div className="absolute inset-0 bg-ink/45" />
      </div>

      {/* desktop search widget — its own floating card below the navbar, matching the
          reference photo's opaque white search bar. Once `pinned` flips true it morphs
          in place into the fixed top navbar strip. */}
      <div ref={desktopWidgetRef} className="relative z-20 mx-auto hidden w-full max-w-7xl justify-center px-10 pb-4 pt-28 lg:flex">
        <TravelSearchWidget pinned={pinned} />
      </div>

      <div className="relative z-30 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col px-6 pb-10 pt-40 sm:px-10 lg:min-h-0 lg:flex-row lg:items-start lg:gap-12 lg:py-16 lg:pt-16">
        {/* copy column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 flex flex-1 flex-col gap-6"
        >
          <p className="font-display font-black text-4xl leading-[1.05] text-center sm:text-5xl  lg:text-6xl ">
            Admission led by experts.
            <br />
            <span className="mt-3 inline-block italic text-ruby-500">
              Shaped by you.
            </span>
          </p>
          <p className="mx-auto max-w-md text-center text-lg font-light leading-relaxed text-cloud/75 pb-10">
  From offer letters to visa interviews, we plan every leg of the
  journey with you, so your move abroad is a plan,{" "}
  <span className="font-semibold italic text-cloud">not a gamble.</span>
</p>

          {/* mobile: plain stacked widget, sits above the faded frame — lower down
              than the desktop widget since it's below the headline copy, so it gets
              its own scroll trigger rather than sharing the desktop one. */}
         <div ref={mobileWidgetRef} className="relative z-30 min-h-[240px] pt-6 lg:hidden">
  <TravelSearchWidget pinned={pinned} />
</div>
        </motion.div>

        
      </div>

      {/* transition into the next section */}
      <SectionBreaker
        bottomColor="#faf8f4"
        className="absolute inset-x-0 bottom-0 z-10"
      />
    </section>
  );
}