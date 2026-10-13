// src/components/portal/empty-applications.tsx
// Shown on /portal/applications when the applicant has not started anything yet:
// an illustration and one button that opens the eligibility check.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ELIGIBILITY_PAGE } from "@/lib/portal-paths";

// Two sheets, a magnifier and a paper plane. Colours follow the theme (ruby and neutral).
function EmptyApplicationsArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 180" fill="none" role="img" aria-label="No applications yet" className={className}>
      <ellipse cx="120" cy="164" rx="78" ry="8" className="fill-neutral-200/70" />
      <circle cx="120" cy="86" r="66" className="fill-ruby-50" />

      {/* back sheet */}
      <g transform="rotate(-8 100 90)">
        <rect x="58" y="38" width="86" height="108" rx="8" className="fill-white stroke-neutral-300" strokeWidth="2" />
        <rect x="70" y="56" width="40" height="6" rx="3" className="fill-neutral-200" />
        <rect x="70" y="72" width="62" height="5" rx="2.5" className="fill-neutral-100" />
        <rect x="70" y="86" width="54" height="5" rx="2.5" className="fill-neutral-100" />
      </g>

      {/* front sheet */}
      <g transform="rotate(5 130 92)">
        <rect x="88" y="30" width="92" height="116" rx="8" className="fill-white stroke-ruby-300" strokeWidth="2" />
        <rect x="101" y="48" width="44" height="7" rx="3.5" className="fill-ruby-200" />
        <rect x="101" y="66" width="66" height="5" rx="2.5" className="fill-neutral-200" />
        <rect x="101" y="80" width="58" height="5" rx="2.5" className="fill-neutral-200" />
        <rect x="101" y="94" width="64" height="5" rx="2.5" className="fill-neutral-200" />
        <circle cx="110" cy="124" r="8" className="fill-ruby-100 stroke-ruby-300" strokeWidth="1.5" />
        <path d="M106.5 124.2l2.6 2.6 5-5.2" className="stroke-ruby-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="124" y="121" width="36" height="6" rx="3" className="fill-neutral-200" />
      </g>

      {/* magnifier */}
      <circle cx="68" cy="132" r="17" className="fill-white stroke-ruby-500" strokeWidth="4" />
      <path d="M80.5 144.5l14 14" className="stroke-ruby-500" strokeWidth="6" strokeLinecap="round" />
      <path d="M60 128a9 9 0 0 1 8-6" className="stroke-ruby-200" strokeWidth="3" strokeLinecap="round" />

      {/* paper plane */}
      <path d="M186 38l30-14-12 34-9-11-9-9z" className="fill-ruby-500" />
      <path d="M195 48l21-24" className="stroke-white" strokeWidth="2" strokeLinecap="round" />
      <path d="M170 56c-8 4-14 3-18 8" className="stroke-ruby-300" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 6" />
    </svg>
  );
}

export function EmptyApplications() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10 text-center sm:py-16">
      <EmptyApplicationsArt className="w-56 sm:w-64" />
      <h2 className="mt-6 text-xl font-semibold text-ink">No applications yet</h2>
      <p className="mt-1.5 text-sm text-neutral-500">Answer a few quick questions to get started.</p>
      <Link
        href={ELIGIBILITY_PAGE}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ruby-500 px-7 text-sm font-semibold text-white outline-none transition hover:bg-ruby-600 focus-visible:ring-2 focus-visible:ring-ruby-500/50 focus-visible:ring-offset-2"
      >
        Get started <ArrowRight size={16} />
      </Link>
    </div>
  );
}