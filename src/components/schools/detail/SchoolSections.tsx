import Image from "next/image";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { ShapeFrame, type FrameShape } from "@/components/curiositysection/Shapeframes";
import { ShapeOutline } from "@/components/schools/detail/ShapeOutline";

type GalleryImage = { url: string; altText: string | null };

/** One frame style per photo so neighbouring sections do not look cloned.
 *  These are the site's own shapes from ShapeFrames.tsx. */
const FRAMES: { shape: FrameShape; accent: string }[] = [
  { shape: "circle", accent: "#AF0E13" },
  { shape: "squares", accent: "#42057f" },
  { shape: "cluster", accent: "#f87509" },
];

const H2 = "font-display text-4xl font-semibold leading-tight sm:text-5xl";

/** Paragraphs are separated by a blank line in the admin form. */
export function Prose({ text, tone = "light" }: { text: string; tone?: "light" | "dark" }) {
  return (
    <div className="space-y-4">
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p
            key={i}
            className={`whitespace-pre-line text-base leading-7 ${tone === "dark" ? "text-cloud/85" : "text-ink/75"}`}
          >
            {p}
          </p>
        ))}
    </div>
  );
}

/** Plain light section with a big heading, used by Overview, Location, Courses and Scholarships. */
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <h2 className={`${H2} text-ink`}>{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

/** Text with an optional photo beside it. Without a photo the text uses the full width. */
export function TextWithImage({ text, image, tone }: { text: string; image?: GalleryImage; tone: number }) {
  if (!image) {
    return (
      <div className="max-w-3xl">
        <Prose text={text} />
      </div>
    );
  }

  const frame = FRAMES[tone % FRAMES.length];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
      <Prose text={text} />
      <ShapeFrame
        shape={frame.shape}
        src={image.url}
        alt={image.altText || "School photo"}
        accent={frame.accent}
        className="mx-auto w-full max-w-sm"
      />
    </div>
  );
}

/* ------------------------------ SERVICES ------------------------------ */
/* Dark band, text on the left, rounded photo on the right, outlined shapes
   from the site's own loop drifting behind the photo. */

export function ServicesSection({ text, image }: { text: string; image?: GalleryImage }) {
  return (
    <section id="services" className="relative isolate scroll-mt-16 overflow-hidden bg-ink py-16 text-cloud">
      <ShapeOutline
        shape="squareBurstHold"
        color="#ffd212"
        className="pointer-events-none absolute -right-24 -top-16 -z-10 w-[26rem] rotate-12 opacity-40"
      />
      <ShapeOutline
        shape="triangleBurstHold"
        color="#f87509"
        offset={2}
        className="pointer-events-none absolute -bottom-24 -right-10 -z-10 w-[24rem] -rotate-6 opacity-40"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className={image ? "grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16" : "max-w-3xl"}>
          <div>
            <h2 className={`${H2} text-cloud`}>Services</h2>
            <div className="mt-8">
              <Prose text={text} tone="dark" />
            </div>
          </div>

          {image && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cloud/10">
              <Image
                src={image.url}
                alt={image.altText || ""}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 520px"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ RANKINGS ------------------------------ */
/* White band. Big ruby shape with the photo on the left, bullet list on the
   right. Uses the triangle tiling from the site's shape loop. */

export function RankingsSection({ items, image }: { items: string[]; image?: GalleryImage }) {
  return (
    <section id="rankings" className="relative scroll-mt-16 overflow-hidden bg-white py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-[minmax(0,360px)_1fr] lg:gap-20 lg:px-12">
        <div className="flex justify-center">
          <ShapeFrame
            shape="triangles"
            src={image?.url}
            alt={image?.altText || "Rankings"}
            accent="#AF0E13"
            className="w-full max-w-xs md:max-w-sm"
          />
        </div>

        <div className="max-w-2xl">
          <h2 className={`${H2} text-ink`}>Rankings</h2>
          <ul className="mt-8 space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex gap-3 text-base leading-7 text-ink/80">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ruby" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- ACCOMMODATION ---------------------------- */
/* Dark teal card with the text, photo in its own rounded card beside it. */

export function AccommodationSection({ text, image }: { text: string; image?: GalleryImage }) {
  return (
    <section id="accommodation" className="scroll-mt-16 py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className={image ? "grid gap-6 lg:grid-cols-[1.35fr_1fr]" : ""}>
          <div className="rounded-3xl bg-[#22393f] p-8 text-cloud sm:p-10">
            <h2 className={`${H2} text-cloud`}>Accommodation</h2>
            <div className="mt-8">
              <Prose text={text} tone="dark" />
            </div>
          </div>

          {image && (
            <div className="relative min-h-72 overflow-hidden rounded-3xl bg-ink/5">
              <Image
                src={image.url}
                alt={image.altText || ""}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 440px"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- SCHOLARSHIPS ----------------------------- */

type Scholarship = {
  id: string;
  name: string;
  academicYear: string | null;
  description: string | null;
  url: string | null;
};

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