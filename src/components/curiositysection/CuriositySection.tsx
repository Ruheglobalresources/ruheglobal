// src/components/curiositysection/CuriositySection.tsx
"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { MorphFrame } from "@/components/MorphFrame";
import { ChainLink, ShapeFrame, type ChainShape, type FrameShape, } from "./Shapeframes";

/* -------------------------------------------------------------------------- */
/*  One chain, four stops                                                      */
/*                                                                             */
/*  Each stop's photo is cut into one of the shapes the blob loop assembles,   */
/*  and the beads running into that stop are made of the same shape — little   */
/*  squares run into the square frame, little circles into the cluster, little */
/*  triangles into the triangle tiling. The first stop is the plain circle the */
/*  whole loop rests on, so the chain reads as starting open and gathering     */
/*  structure as it goes.                                                      */
/*                                                                             */
/*  Below lg, each stop is a row — photo left, copy right — with the chain     */
/*  dropping straight down under the photo column into the next row, same     */
/*  vocabulary as the mockup. At lg and up it switches to the photo-on-top,    */
/*  side-by-side column layout, chained horizontally between columns. Both    */
/*  trees read off the same STOPS data and the same reveal state; only the    */
/*  Tailwind display classes decide which one is in the DOM's rendered flow   */
/*  at a given width, so there's no layout thrash on resize across the        */
/*  breakpoint — one tree is always `hidden`, not mounted/unmounted.          */
/*                                                                             */
/*  An IntersectionObserver starts the reveal sequence once; each stop and    */
/*  each run of beads arrives in order from there.                            */
/* -------------------------------------------------------------------------- */

type Stop = {
  shape: FrameShape;
  /** Drop four photos in /public/curiosity. Until then each frame falls back
   *  to a brand wash, so nothing breaks in the meantime. */
  image?: string;
  alt: string;
  lead: string;
  trail: string;
  body: string;
  href: string;
  accent: string;
};

const STOPS: Stop[] = [
  {
    shape: "circle",
    image: "/curiosity/test.jpg",
    alt: "Two students working through practice questions together",
    lead: "Test prep",
    trail: "and tutorials",
    body: "Live, mock-heavy coaching for IELTS, TOEFL, GRE, GMAT, PTE and CELPIP, with free lectures and lab access until you hit your target band.",
    href: "/contact",
    accent: "#C62828",
  },
  {
    shape: "squares",
    image: "/curiosity/institution.jpg",
    alt: "A red-brick university building framed by trees",
    lead: "Partner",
    trail: "institutions",
    body: "Over 200 partner universities across twelve countries, and close enough relationships to know how each one really reads an application.",
    href: "/contact",
    accent: "#AF0E13",
  },
  {
    shape: "cluster",
    image: "/curiosity/visa.jpg",
    alt: "Hands signing an application form",
    lead: "Visa application",
    trail: "assistance",
    body: "Filing, interview drills and the documents nobody warns you about, taken through to approval across all six destinations we place into.",
    href: "/contact",
    accent: "#AF0E13",
  },
  {
    shape: "triangles",
    image: "/curiosity/travel.jpg",
    alt: "A traveller arriving at an airport terminal",
    lead: "Work and",
    trail: "relocation",
    body: "Job-offer sourcing, permanent-residency pathways and skilled-migration support across Europe, Canada and Australia, from application to landing.",
    href: "/contact",
    accent: "#AF0E13",
  },
];

/** Stop i arrives at slot 2i, the link running out of it toward i+1 at 2i+1. */
const SLOTS = STOPS.length * 2 - 1;
const STEP_MS = 340;

/** MorphFrame takes a fixed pixel size rather than scaling fluidly, so we
 *  compute a breakpoint-appropriate size on the client, same pattern the
 *  original hero-adjacent version used. Sized as a side element next to the
 *  intro copy, so it's larger from lg up than its original small-topper size. */

function useMorphSize() {
  const [size, setSize] = useState(200);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1280) return 380;
      if (w >= 1024) return 320;
      if (w >= 640) return 240;
      return 200;
    };

    const update = () => setSize(compute());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
}


export function CuriositySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const morphSize = useMorphSize();
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(SLOTS);
      return;
    }

    let interval = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        interval = window.setInterval(() => {
          setRevealed((current) => {
            if (current >= SLOTS) {
              window.clearInterval(interval);
              return current;
            }
            return current + 1;
          });
        }, STEP_MS);
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  // shared reveal helpers — a stop sits at slot 2i, the link running out of
  // it toward i+1 sits at 2i+1, regardless of which tree renders it
  const stopOn = (i: number) => revealed > i * 2;
  const linkOn = (i: number) => revealed > i * 2 + 1;

  const stopStyle = (i: number): CSSProperties => ({
    opacity: stopOn(i) ? 1 : 0,
    transform: stopOn(i) ? "translateY(0)" : "translateY(14px)",
    transition: "opacity 600ms ease-out, transform 600ms cubic-bezier(.22,1,.36,1)",
  });

  // shared CTA classes so the mobile and desktop buttons stay in sync —
  // red base, a darker red on hover/active, red focus ring (previously
  // this pointed at `violet`, which made the button flash brand-purple
  // on hover/focus instead of staying in the red family)
  const ctaClass =
    "mt-5 inline-block rounded-full bg-[#AF0E13] px-7 py-3 text-xs font-bold uppercase tracking-[0.1em] text-cloud transition-colors hover:bg-[#8f0b10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AF0E13]";

  return (
    <section className="bg-white py-8 text-ink ">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* intro: MorphFrame beside the "who we are" note. Stacked on mobile,
            side-by-side from lg up, frame growing via useMorphSize. */}
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center">
          <div className="flex shrink-0 justify-center text-violet">
            <MorphFrame
              size={morphSize}
              images={[
                "/curiosity/visa.jpg",
                "/curiosity/institution.jpg",
                "/curiosity/travel.jpg",
                "/curiosity/test.jpg",
              ]}
              alt={["Photo one", "Photo two", "Photo three", "Photo four"]}
              fit="cover"
              transitionDuration={0.5}
            />
          </div>

          <div className="max-w-xl text-center lg:text-left">
            <p className="text-ink/70 sm:text-lg lg:text-xl lg:leading-relaxed">
              <b>Ruhe Global Resource</b> {" "} is a study abroad consultancy, helping
              students move from application to arrival, test prep,
              university placement, visa filing and relocation support, in
              one continuous process instead of four separate vendors.
              Since/founded in 2010, we&apos;ve placed students into more than 100
              partner institutions across 12 countries, with a 90% visa
              success rate. Every student works with the same team from
              their first consultation through to landing.
            </p>
          </div>
        </div>

        <div ref={trackRef} className="mt-6 lg:mt-8">
          {/* ---------------------------------------------------------------- */}
          {/*  Below lg: row per stop, chain drops straight down under photo    */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex flex-col gap-10 lg:hidden">
            {STOPS.map((stop, i) => (
              <div key={stop.lead} style={stopStyle(i)}>
                <div className="flex items-start gap-4 mt-5 text-left sm:gap-6">
                  <ShapeFrame
                    shape={stop.shape}
                    src={stop.image}
                    alt={stop.alt}
                    accent={stop.accent}
                    className="h-[128px] w-[128px] shrink-0 sm:h-[160px] sm:w-[160px]"
                  />

                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="text-lg uppercase leading-tight tracking-[0.02em] sm:text-xl">
                      <span className="block font-bold">{stop.lead}</span>
                      <span className="block font-light">{stop.trail}</span>
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-ink/70">
                      {stop.body}
                    </p>

                    <a href={stop.href} className={ctaClass}>
                      Find out more
                    </a>
                  </div>
                </div>

                {i < STOPS.length - 1 && (
                  <div className="flex h-24 w-[128px] justify-center sm:h-28 sm:w-[160px]">
                    <ChainLink
                      shape={STOPS[i + 1].shape as ChainShape}
                      direction="vertical"
                      active={linkOn(i)}
                      className="h-full w-auto"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/*  lg and up: photo-on-top columns, chained horizontally between    */}
          {/*  them. Sizes are deliberately smaller here than the mobile sm:    */}
          {/*  step, then grow again at xl — four columns plus three links      */}
          {/*  have to fit inside max-w-7xl's own content width (as little as   */}
          {/*  944px right at the lg breakpoint), which is what the previous    */}
          {/*  version overflowed on by carrying its sm: size straight through. */}
          {/* ---------------------------------------------------------------- */}
          <div className="hidden lg:flex lg:items-start">
            {STOPS.map((stop, i) => (
              <Fragment key={stop.lead}>
                {i > 0 && (
                  <ChainLink
                    shape={stop.shape as ChainShape}
                    direction="horizontal"
                    active={linkOn(i - 1)}
                    className="mt-[70px] h-14 w-16 shrink-0 xl:mt-[94px] xl:h-16 xl:w-24"
                  />
                )}

                <div
                  className="flex min-w-0 flex-1 flex-col items-center text-center"
                  style={stopStyle(i)}
                >
                  <ShapeFrame
                    shape={stop.shape}
                    src={stop.image}
                    alt={stop.alt}
                    accent={stop.accent}
                    className="h-[140px] w-[140px] shrink-0 xl:h-[190px] xl:w-[190px]"
                  />

                  <h3 className="mt-6 text-lg uppercase leading-tight tracking-[0.02em] xl:mt-7 xl:text-xl">
                    <span className="block font-bold">{stop.lead}</span>
                    <span className="block font-light">{stop.trail}</span>
                  </h3>

                  <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-ink/70 xl:mt-4 xl:max-w-[32ch]">
                    {stop.body}
                  </p>

                  
                   <a href={stop.href}
                    className={`${ctaClass} xl:mt-7 xl:px-8 xl:py-3.5`}
                  >
                    Find out more
                  </a>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CuriositySection;