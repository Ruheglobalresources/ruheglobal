"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  MessagesSquare,
  Plane,
  Quote,
  Star,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Blob } from "@/components/Blob";
import { STUDY_ABROAD_REVIEWS } from "@/constants/reviews";
import Image from "next/image";
import MergedBlob from "@/lib/Mergedblob";

/* -------------------------------------------------------------------------- */
/*  data                                                                       */
/* -------------------------------------------------------------------------- */

type Tone = "ruby" | "ink";

type Step = {
  n: string;
  title: string;
  copy: string;
  Icon: typeof MessagesSquare;
  tone: Tone;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Consultation",
    copy: "We map your profile, your goals and the fastest realistic route to approval.",
    Icon: MessagesSquare,
    tone: "ruby",
  },
  {
    n: "02",
    title: "Documentation",
    copy: "We prepare, translate and verify every document to embassy standard.",
    Icon: FileCheck2,
    tone: "ink",
  },
  {
    n: "03",
    title: "Application",
    copy: "We file with precision and track every stage of the decision for you.",
    Icon: ClipboardCheck,
    tone: "ruby",
  },
  {
    n: "04",
    title: "Visa Approval",
    copy: "You collect your visa and board the flight to your next chapter.",
    Icon: Plane,
    tone: "ink",
  },
];

/** A short, curated rotation for the "What our clients say" card. Swap in
 *  more of STUDY_ABROAD_REVIEWS, or COMPANY_REVIEWS, as you like. */
const FEATURED_REVIEWS = STUDY_ABROAD_REVIEWS.slice(0, 6);

/* -------------------------------------------------------------------------- */
/*  reveal-on-scroll helper                                                    */
/* -------------------------------------------------------------------------- */

function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] will-change-transform",
        shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  heading flourish                                                           */
/* -------------------------------------------------------------------------- */

function Flourish({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 8"
      className={cn(
        "hidden h-2 w-14 shrink-0 text-ruby-400 sm:block lg:w-20",
        flip && "rotate-180"
      )}
      fill="none"
    >
      <path
        d="M0 4h54"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
      <path
        d="M52 1l6 3-6 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  step card                                                                  */
/* -------------------------------------------------------------------------- */

function StepCard({ step, index }: { step: Step; index: number }) {
  const { Icon, tone } = step;

  return (
    <article className="group relative flex items-start gap-5 lg:block lg:text-center">
      <div className="relative shrink-0 lg:mx-auto lg:w-fit">
         <MergedBlob
    size={112}
    className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-1.5"
  >
    <Icon className="h-7 w-7 text-white lg:h-8 lg:w-8" strokeWidth={1.7} aria-hidden="true" />
  </MergedBlob>

        {/* step number */}
        <span
          className={cn(
            "absolute -bottom-1 -right-2 grid h-9 w-9 place-items-center rounded-full bg-white font-display text-[0.72rem] font-bold tracking-[0.1em] text-ink ring-1 ring-black/[0.07]",
            "shadow-[0_6px_14px_-6px_rgba(16,27,45,.45)] lg:h-10 lg:w-10 lg:text-[0.75rem]"
          )}
        >
          {step.n}
        </span>
      </div>

      <div className="pt-2 lg:mt-5 lg:pt-0">
        <h3 className="font-display text-[0.9rem] font-extrabold uppercase tracking-[0.17em] text-ink">
          {step.title}
        </h3>
        <p className="mt-2.5 max-w-[22rem] text-[0.94rem] leading-relaxed text-ink/55 lg:mx-auto lg:max-w-[15.5rem]">
          {step.copy}
        </p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  "what our clients say" card                                               */
/* -------------------------------------------------------------------------- */

function StarRow({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-ruby-600 text-ruby-600" : "fill-ink/10 text-ink/10"}
        />
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

const AVATAR_TONES = ["#C62828", "#16233D", "#7E0000", "#22345A"];

function ClientReviewsCard() {
  const [index, setIndex] = useState(0);
  const review = FEATURED_REVIEWS[index];

  const go = (dir: 1 | -1) =>
    setIndex((current) => (current + dir + FEATURED_REVIEWS.length) % FEATURED_REVIEWS.length);

  return (
    <div className="reveal relative">
      <button
        type="button"
        aria-label="Previous review"
        onClick={() => go(-1)}
        className="absolute -left-4 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-ink/50 shadow-[0_10px_24px_-12px_rgba(16,27,45,.5)] ring-1 ring-ink/10 transition hover:text-ruby-600"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        aria-label="Next review"
        onClick={() => go(1)}
        className="absolute -right-4 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white text-ink/50 shadow-[0_10px_24px_-12px_rgba(16,27,45,.5)] ring-1 ring-ink/10 transition hover:text-ruby-600"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
      </button>

      <div className="relative h-full overflow-hidden rounded-[22px] bg-white p-7 ring-1 ring-ink/[0.07] shadow-[0_24px_50px_-40px_rgba(16,27,45,.55)] sm:p-8">
        <h3 className="font-display text-[1.15rem] font-extrabold uppercase tracking-[0.06em] text-ink sm:text-[1.3rem]">
          What our clients say
        </h3>

        <div className="mt-6 flex items-start gap-3">
          <Quote className="mt-1 h-8 w-8 shrink-0 fill-ruby-100 text-ruby-600" strokeWidth={0} />
          <div className="min-h-[132px] flex-1">
            <p className="text-[0.94rem] leading-relaxed text-ink/65">{review.text}</p>
            <div className="mt-5 flex items-center gap-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-[0.8rem] font-bold text-white ring-2 ring-white shadow-[0_8px_18px_-8px_rgba(16,27,45,.7)]"
                style={{ background: AVATAR_TONES[index % AVATAR_TONES.length] }}
              >
                {initials(review.name)}
              </div>
              <div>
                <p className="font-display text-[0.88rem] font-bold text-ink">{review.name}</p>
                <p className="text-[0.78rem] text-ink/50">{review.tag}</p>
                <StarRow rating={review.rating} className="mt-1" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-1.5">
          {FEATURED_REVIEWS.map((r, i) => (
            <span
              key={r.id}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-5 bg-ruby-600" : "w-1.5 bg-ink/15"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  "success stories" card                                                    */
/* -------------------------------------------------------------------------- */

function SuccessStoriesCard() {
  return (
    <div className="reveal relative h-full overflow-hidden rounded-[22px] bg-[#F4F5F7] p-7 ring-1 ring-ink/[0.05] sm:p-8">
      <style>{`
        @keyframes success-flight-dash { to { stroke-dashoffset: -112; } }
        @keyframes success-flight-bob { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(4px, -6px); } }
      `}</style>

      {/* faint globe wireframe + an animated dashed flight path, entirely
          self-contained (no dependency on global keyframes) */}
      <svg
        viewBox="0 0 320 220"
        className="pointer-events-none absolute inset-0 h-full w-full text-ink/10"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="currentColor" strokeWidth="1">
          <circle cx="205" cy="120" r="78" />
          <ellipse cx="205" cy="120" rx="78" ry="28" />
          <ellipse cx="205" cy="120" rx="78" ry="56" />
          <ellipse cx="205" cy="120" rx="28" ry="78" />
          <ellipse cx="205" cy="120" rx="56" ry="78" />
          <path d="M127 120h156" />
        </g>
      </svg>
      <svg
        viewBox="0 0 320 220"
        className="pointer-events-none absolute inset-0 h-full w-full text-ink/25"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M40 176C96 160 152 116 214 46"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="5 9"
          strokeLinecap="round"
          style={{ animation: "success-flight-dash 5.5s linear infinite" }}
        />
        <path
          d="M212 34l20 16-22 8 5-12-3-12z"
          fill="currentColor"
          style={{ animation: "success-flight-bob 4.5s ease-in-out infinite" }}
        />
      </svg>

      <div className="relative">
        <h3 className="font-display text-[1.15rem] font-extrabold uppercase tracking-[0.06em] text-ink sm:text-[1.3rem]">
          Success Stories
        </h3>
        <p className="mt-4 max-w-[19rem] text-[0.94rem] leading-relaxed text-ink/60">
          Thousands of Nigerian students have already made the move, admission, visa and landing, all handled by one team.
        </p>

        <dl className="mt-6 flex gap-7">
          <div>
            <dt className="font-display text-[1.5rem] font-extrabold text-ink">90%</dt>
            <dd className="text-[0.72rem] uppercase tracking-[0.14em] text-ink/45">visa success</dd>
          </div>
          <div>
            <dt className="font-display text-[1.5rem] font-extrabold text-ink">12</dt>
            <dd className="text-[0.72rem] uppercase tracking-[0.14em] text-ink/45">countries</dd>
          </div>
        </dl>

        <a
          href="/blog"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 font-display text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white transition-transform duration-300 hover:-translate-y-0.5"
        >
          View Success Stories
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  "free consultation" card                                                  */
/* -------------------------------------------------------------------------- */

/** A solid, filled date-picker glyph (a calendar body with two binder rings
 *  and one highlighted date) rather than a thin outline icon. */
function SolidCalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="5.5" width="18" height="15.5" rx="3" fill="currentColor" />
      <path d="M3 8.5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v1.8H3Z" fill="currentColor" fillOpacity="0.55" />
      <rect x="6.6" y="2" width="2.2" height="5.4" rx="1.1" fill="currentColor" />
      <rect x="15.2" y="2" width="2.2" height="5.4" rx="1.1" fill="currentColor" />
      <circle cx="12" cy="15.3" r="2.7" fill="white" />
    </svg>
  );
}

/** Drop a real cut-out photo at this path (or pass a different `src` prop).
 *  Until then the card shows a plain placeholder frame so nothing looks
 *  broken and the layout — including the head clearing the top edge — is
 *  easy to check before the real photo is wired in. */


function FreeConsultationCard() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="reveal relative h-full min-h-[172px] rounded-2xl bg-[linear-gradient(100deg,theme(colors.ruby.400)_0%,theme(colors.ruby.600)_40%,white_55%)] text-white border  sm:min-h-[196px] lg:min-h-[212px]" >
      {/* copy: reserves the right-hand third for the photo */}
      <div className="relative z-10 flex h-full flex-col justify-center gap-2 px-2 py-5 pr-[40%] sm:gap-2.5 sm:px-7 sm:py-6 sm:pr-[36%] lg:pr-[34%]">
        <h3 className="font-display text-[0.86rem] font-extrabold uppercase leading-tight tracking-[0.03em] sm:text-[0.98rem]">
          Free Consultation
        </h3>
        <p className="text-[0.72rem] leading-snug text-ruby-50/90 sm:text-[0.78rem]">
          Not sure where to start? Book a free one-to-one consultation with our visa experts today!
        </p>
        
         <a href="/contact"
          className="mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-md bg-white px-3.5 py-2 font-display text-[0.56rem] font-bold uppercase tracking-[0.13em] text-ink shadow-[0_12px_24px_-14px_rgba(0,0,0,.55)] transition-transform duration-300 hover:-translate-y-0.5 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[0.6rem]"
        >
          Book Appointment
          <SolidCalendarIcon className="h-4 w-4 text-ruby-600 sm:h-[1.1rem] sm:w-[1.1rem]" />
        </a>
      </div>

      {/* photo: left edge is masked to transparent so it dissolves into
          the gradient behind it instead of ending in a hard rectangle */}
     <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[55%] overflow-hidden rounded-tr-2xl rounded-br-2xl">
  <Image
    src="/consultant.jpg"
    alt="Ruhe visa consultant, ready to guide your application"
    onError={() => setFailed(true)}
    fill
    className="object-cover object-top [mask-image:linear-gradient(to_right,transparent_0%,black_35%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_35%)]"
  />
</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  section                                                                    */
/* -------------------------------------------------------------------------- */

export interface ProcessConsultationSectionProps {
  /** Path or URL to the consultant photo shown on the free-consultation card. */
  consultantSrc?: string;
}

export function ProcessConsultationSection({ consultantSrc }: ProcessConsultationSectionProps) {
  return (
    <section
      id="process"
      className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,#FFC2C2,transparent)]" />
        <div className="absolute -top-44 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-ruby-50 blur-3xl" />
      </div>

      <div className="container relative mx-auto">
        {/* ------------------------------ header ---------------------------- */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-4 lg:gap-6">
            <Flourish />
            <h2 className="font-display text-[1.65rem] font-extrabold uppercase leading-none tracking-[0.02em] text-ink sm:text-[2.1rem] lg:text-[2.5rem]">
              Our Simple Process
            </h2>
            <Flourish flip />
          </div>
          <p className="mx-auto mt-5 max-w-xl text-[1rem] leading-relaxed text-ink/55">
            Four steps, zero guesswork. A visa journey engineered to remove every avoidable delay between you and
            your boarding pass.
          </p>
        </Reveal>

        {/* ------------------------------- steps ---------------------------- */}
        <div className="relative mt-14 lg:mt-20">
          <div aria-hidden="true" className="absolute bottom-14 left-10 top-14 border-l border-dashed border-ruby-200 lg:hidden" />

          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 110}>
                <StepCard step={step} index={i} />
              </Reveal>
            ))}
          </div>

          {/* desktop arrows between steps */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
            {[25, 50, 75].map((pos) => (
              <span
                key={pos}
                style={{ left: `${pos}%` } as CSSProperties}
                className="absolute top-11 -translate-x-1/2 -translate-y-1/2 text-ink/25"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </span>
            ))}
          </div>
        </div>

        {/* --------------------------- three-card row ------------------------ */}
        <div className="mt-16 px-5 grid gap-6 lg:mt-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <ClientReviewsCard />
          </div>
          <Reveal className="lg:col-span-4">
            <SuccessStoriesCard />
          </Reveal>
          <Reveal delay={100} className="lg:col-span-4">
            <FreeConsultationCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default ProcessConsultationSection;