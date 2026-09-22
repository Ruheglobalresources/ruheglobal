"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Award, ExternalLink, GraduationCap, MapPin } from "lucide-react";
import type { School } from "@/lib/school-search/types";

function formatMoney(value: number, currency: string | null): string {
  if (!currency) return value.toLocaleString("en");
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Model returned something that isn't a valid ISO currency code.
    return `${currency} ${value.toLocaleString("en")}`;
  }
}

function tuitionAmount(t: School["tuition"]): string | null {
  const { min, max, currency } = t;
  if (min && max && min !== max) {
    return `${formatMoney(Math.min(min, max), currency)} – ${formatMoney(Math.max(min, max), currency)}`;
  }
  const single = min ?? max;
  return single ? formatMoney(single, currency) : null;
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-cloud p-4">
      <dt className="text-sm text-ink/60">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

export function ResultCard({ school }: { school: School }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const { ielts, tuition } = school;
  const location = [school.city, school.country].filter(Boolean).join(", ");
  const amount = tuitionAmount(tuition);
  const hasIelts = ielts.overall !== null || ielts.minBand !== null || ielts.alternatives.length > 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm md:grid md:grid-cols-[240px_minmax(0,1fr)]">
      {/* photo */}
      <div className="relative h-48 bg-ink md:h-full md:min-h-[16rem]">
        {school.imageUrl && !imageFailed ? (
          <Image
            src={school.imageUrl}
            alt={`${school.name}${location ? `, ${location}` : ""}`}
            fill
            unoptimized
            sizes="(min-width: 768px) 240px, 100vw"
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-cloud/60">
            <GraduationCap className="h-10 w-10" aria-hidden="true" />
            <span className="sr-only">No photo available</span>
          </div>
        )}
      </div>

      {/* details */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          {school.logoUrl && !logoFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={school.logoUrl}
              alt=""
              width={28}
              height={28}
              loading="lazy"
              onError={() => setLogoFailed(true)}
              className="mt-1 h-7 w-7 shrink-0 rounded"
            />
          )}
          <div className="min-w-0">
            <h3 className="text-xl font-semibold leading-snug text-ink">
              {school.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/60">
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {location}
                </span>
              )}
              {school.institutionType && <span>{school.institutionType}</span>}
              {school.ranking && (
                <span className="inline-flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" aria-hidden="true" />
                  {school.ranking}
                </span>
              )}
            </div>
          </div>
        </div>

        {school.summary && (
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink/75">{school.summary}</p>
        )}

        {school.programs.length > 0 && (
          <ul aria-label="Programmes" className="mt-3 flex flex-wrap gap-2">
            {school.programs.map((p) => (
              <li key={p} className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/80">
                {p}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Fact label="IELTS required">
            {hasIelts ? (
              <>
                {ielts.overall !== null && (
                  <p className="text-2xl font-semibold text-ink">
                    {ielts.overall.toFixed(1)}
                    <span className="ml-1.5 text-sm font-normal text-ink/60">overall</span>
                  </p>
                )}
                {ielts.minBand !== null && (
                  <p className="text-sm text-ink/75">No band below {ielts.minBand.toFixed(1)}</p>
                )}
                {ielts.alternatives.length > 0 && (
                  <p className="mt-1 text-xs text-ink/60">
                    Also accepted: {ielts.alternatives.join(", ")}
                  </p>
                )}
                {ielts.note && <p className="mt-1 text-xs text-ink/60">{ielts.note}</p>}
              </>
            ) : (
              <p className="text-sm text-ink/60">
                Not found. Check the school&apos;s admissions page.
              </p>
            )}
          </Fact>

          <Fact label="International tuition">
            {amount ? (
              <>
                <p className="text-2xl font-semibold text-ink">{amount}</p>
                {tuition.period && <p className="text-sm text-ink/75">{tuition.period}</p>}
                {tuition.note && <p className="mt-1 text-xs text-ink/60">{tuition.note}</p>}
              </>
            ) : (
              <p className="text-sm text-ink/60">
                Not found. Check the school&apos;s fees page.
              </p>
            )}
          </Fact>
        </dl>

        {school.website && (
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ruby-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby/40"
          >
            Visit official website
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
