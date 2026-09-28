import Image from "next/image";
import type { ReactNode } from "react";
import { Award, ExternalLink } from "lucide-react";
import { BLOB_SHAPES } from "@/lib/blob-shapes";

/** Brand colours used behind photos, one per photo so they do not look cloned. */
const TONES = ["#AF0E13", "#42057f", "#f87509"];

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-ink/10 py-12 first:border-t-0">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
        <span className="mt-3 block h-1 w-12 rounded-full bg-ruby" />
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

/** Paragraphs are separated by a blank line in the admin form. */
export function Prose({ text }: { text: string }) {
  return (
    <div className="space-y-4">
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line text-base leading-7 text-ink/75">
            {p}
          </p>
        ))}
    </div>
  );
}

/** Photo with a brand coloured blob tilted behind it so only a rim shows. */
function ImageFrame({ src, alt, tone }: { src: string; alt: string; tone: number }) {
  const shape = BLOB_SHAPES.organic;
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg
        viewBox={shape.viewBox}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] rotate-3"
      >
        <path d={shape.d} fill={TONES[tone % TONES.length]} />
      </svg>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink/5">
        <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 90vw, 420px" />
      </div>
    </div>
  );
}

/** Text with an optional photo beside it. Without a photo the text uses the full width. */
export function TextWithImage({
  text,
  image,
  tone,
}: {
  text: string;
  image?: { url: string; altText: string | null };
  tone: number;
}) {
  if (!image) {
    return (
      <div className="max-w-3xl">
        <Prose text={text} />
      </div>
    );
  }
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
      <Prose text={text} />
      <ImageFrame src={image.url} alt={image.altText || ""} tone={tone} />
    </div>
  );
}

export function RankingsList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 rounded-2xl bg-white p-5 ring-1 ring-ink/10">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ruby/10 text-ruby">
            <Award size={16} />
          </span>
          <span className="text-sm leading-6 text-ink/80">{item}</span>
        </li>
      ))}
    </ul>
  );
}

type Scholarship = { id: string; name: string; academicYear: string | null; description: string | null; url: string | null };

export function ScholarshipGrid({ items }: { items: Scholarship[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s) => (
        <article key={s.id} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-ink/10">
          {s.academicYear && (
            <span className="w-fit rounded-full bg-violet/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet">
              {s.academicYear}
            </span>
          )}
          <h3 className="mt-3 font-display text-lg leading-snug text-ink">{s.name}</h3>
          {s.description && <p className="mt-2 text-sm leading-6 text-ink/65">{s.description}</p>}
          {s.url && /^https?:\/\//i.test(s.url) && (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-ruby hover:underline"
            >
              Learn more <ExternalLink size={14} />
            </a>
          )}
        </article>
      ))}
    </div>
  );
}