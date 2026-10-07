// src/components/institutions/detail/InstitutionSections.tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { Banknote, CalendarDays, ChevronDown, Languages, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { paragraphs, safeUrl } from "@/lib/institution-format";
import { btn, card } from "./ui";

/* ------------------------------- basics -------------------------------- */

export function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-2.5">
      {paragraphs(text).map((p, i) => (
        <p key={i} className="whitespace-pre-line text-sm leading-6 text-ink/80">
          {p}
        </p>
      ))}
    </div>
  );
}

/** A white card with a light grey header bar. Compact on purpose: 14px body, 14px padding. */
export function Card({
  id,
  title,
  aside,
  children,
  bodyClassName,
}: {
  id?: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section id={id} className={cn(card, "scroll-mt-14 overflow-hidden")}>
      <header className="flex items-center justify-between gap-3 border-b border-ink/10 bg-neutral-50 px-3.5 py-2">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {aside}
      </header>
      <div className={cn("p-3.5", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ------------------------------ stat strip ------------------------------ */

export type Stat = { icon: LucideIcon; label: string; value: string };

/** Founded / Ranking / Acceptance rate / Courses. Any stat without data is simply not passed in. */
export function StatStrip({ items }: { items: Stat[] }) {
  return (
    <dl
      className={cn(
        card,
        "grid grid-cols-2 gap-px overflow-hidden bg-ink/10 sm:grid-flow-col sm:auto-cols-fr"
      )}
    >
      {items.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 bg-white px-3 py-2.5 [&:last-child:nth-child(odd)]:col-span-2 sm:[&:last-child:nth-child(odd)]:col-span-1"
        >
          <Icon size={18} className="shrink-0 text-ruby" />
          <div className="min-w-0">
            <dd className="truncate text-[15px] font-semibold leading-5 text-ink">{value}</dd>
            <dt className="text-xs text-ink/55">{label}</dt>
          </div>
        </div>
      ))}
    </dl>
  );
}

export function SubjectChips({ items }: { items: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-ink/10 pt-3">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink/55">Subjects</span>
      {items.map((s) => (
        <span
          key={s}
          className="rounded-sm border border-ink/15 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-ink/80"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------- quick facts ------------------------------ */

const SOCIALS = [
  { key: "facebookUrl", label: "Facebook", Icon: FaFacebookF },
  { key: "twitterUrl", label: "X (Twitter)", Icon: FaXTwitter },
  { key: "instagramUrl", label: "Instagram", Icon: FaInstagram },
  { key: "linkedinUrl", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "youtubeUrl", label: "YouTube", Icon: FaYoutube },
] as const;

export type SocialLinks = Partial<Record<(typeof SOCIALS)[number]["key"], string | null>>;

function Fact({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 px-3.5 py-2.5">
      <Icon size={17} className="mt-0.5 shrink-0 text-ruby" />
      <div className="min-w-0">
        <dt className="text-xs text-ink/55">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium leading-5 text-ink">{children}</dd>
      </div>
    </div>
  );
}

/**
 * Right-hand panel (Edvoy's Upcoming Intake / Tuition Fee / English Requirement block)
 * with the two apply buttons. Sticks under the navbar + tab bar on desktop; on mobile it
 * is shown first so the buttons are never buried at the bottom.
 */
export function QuickFacts({
  nextIntake,
  tuition,
  tuitionNote,
  english,
  applyUrl,
  contactUrl,
  socials,
}: {
  nextIntake: string | null;
  tuition: string | null;
  tuitionNote: string | null;
  english: { lines: string[]; note: string | null };
  applyUrl: string;
  contactUrl: string;
  socials: SocialLinks;
}) {
  const hasFacts = Boolean(nextIntake || tuition || english.lines.length > 0);
  const links = SOCIALS.map((s) => ({ ...s, href: safeUrl(socials[s.key]) })).filter((s) => s.href);

  return (
    <aside aria-label="Quick facts" className="order-first lg:order-none">
      <div className="lg:sticky lg:top-[calc(var(--nav-offset,0px)_+_3.25rem)] lg:transition-[top] lg:duration-300 lg:ease-out motion-reduce:transition-none">
        <div className={cn(card, "overflow-hidden")}>
          <h2 className="bg-ink px-3.5 py-2 text-sm font-semibold text-white">Quick facts</h2>

          {hasFacts && (
            <dl className="divide-y divide-ink/10">
              {nextIntake && (
                <Fact icon={CalendarDays} label="Upcoming intake">
                  {nextIntake}
                </Fact>
              )}
              {tuition && (
                <Fact icon={Banknote} label="Tuition fee">
                  {tuition}
                  {tuitionNote && <span className="mt-0.5 block text-xs font-normal text-ink/60">{tuitionNote}</span>}
                </Fact>
              )}
              {english.lines.length > 0 && (
                <Fact icon={Languages} label="English requirement">
                  {english.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                  {english.note && <span className="mt-0.5 block text-xs font-normal text-ink/60">{english.note}</span>}
                </Fact>
              )}
            </dl>
          )}

          <div className={cn("space-y-2 bg-neutral-50 p-3", hasFacts && "border-t border-ink/10")}>
            <Link href={applyUrl} className={cn(btn("primary"), "w-full")}>
              Start your application
            </Link>
            <Link href={contactUrl} className={cn(btn("secondary"), "w-full")}>
              Talk to a counsellor
            </Link>
          </div>

          {links.length > 0 && (
            <div className="flex items-center gap-1.5 border-t border-ink/10 px-3.5 py-2.5">
              <span className="mr-1 text-xs text-ink/55">Follow</span>
              {links.map(({ key, label, href, Icon }) => (
                <a
                  key={key}
                  href={href as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-8 place-items-center rounded-md border border-ink/15 text-ink/70 transition-colors hover:border-ruby hover:bg-ruby hover:text-white"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------- campuses ------------------------------- */

type Campus = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  description: string | null;
};

export function CampusList({
  campuses,
  institutionName,
  country,
}: {
  campuses: Campus[];
  institutionName: string;
  country: string | null;
}) {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2">
      {campuses.map((c) => {
        // plain Google Maps search link, no API key needed
        const query = (
          c.address
            ? [c.address, c.city, country]
            : [institutionName, c.name, c.city, country]
        )
          .filter(Boolean)
          .join(", ");

        return (
          <li key={c.id} className="rounded-md border border-ink/15 p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug text-ink">{c.name}</h3>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-ruby hover:underline"
              >
                <MapPin size={13} />
                Map
              </a>
            </div>
            {(c.city || c.address) && (
              <p className="mt-0.5 text-xs text-ink/55">{[c.city, c.address].filter(Boolean).join(" · ")}</p>
            )}
            {c.description && <p className="mt-1.5 text-[13px] leading-5 text-ink/75">{c.description}</p>}
          </li>
        );
      })}
    </ul>
  );
}

/* --------------------------------- FAQs --------------------------------- */

type Faq = { id: string; question: string; answer: string };

/** Native <details>, so it needs no JavaScript and works with the keyboard out of the box. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-ink/10">
      {faqs.map((f) => (
        <details key={f.id} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
            {f.question}
            <ChevronDown
              size={16}
              className="shrink-0 text-ink/50 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="px-3.5 pb-3">
            <Prose text={f.answer} />
          </div>
        </details>
      ))}
    </div>
  );
}