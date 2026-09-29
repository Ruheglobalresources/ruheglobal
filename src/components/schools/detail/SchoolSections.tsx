import Image from "next/image";
import type { ReactNode } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { ShapeFrame, type FrameShape } from "@/components/curiositysection/Shapeframes";
import { ShapeOutline } from "@/components/schools/detail/ShapeOutline";
import { MorphFrame } from "@/components/MorphFrame";
import { BLOB_SHAPES } from "@/lib/blob-shapes";

type GalleryImage = { url: string; altText: string | null };

/** One frame style per photo so neighbouring sections do not look cloned.
 *  These are the site's own shapes from ShapeFrames.tsx. */
const FRAMES: { shape: FrameShape; accent: string }[] = [
  { shape: "circle", accent: "#AF0E13" },
  { shape: "squares", accent: "#42057f" },
  { shape: "cluster", accent: "#f87509" },
];

const H2 = "font-display text-4xl font-semibold leading-tight sm:text-5xl";

/** Smaller heading used only in Rankings, which is meant to read as a
 *  compact strip rather than a full section like the others. */
const H2_COMPACT = "font-display text-xl font-semibold leading-tight sm:text-2xl";

/** Coordinate space MorphFrame computes its blob path in. This is NOT the
 *  rendered size — that's controlled by the className below, so the frame
 *  can be small on mobile and large on desktop without redrawing the path. */
const MORPH_SIZE = 360;

/** Paragraphs are separated by a blank line in the admin form. */
export function Prose({ text, tone = "light", leading = "leading-7" }: { text: string; tone?: "light" | "dark"; leading?: string }) {
  return (
    <div className="space-y-4">
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p
            key={i}
            className={`whitespace-pre-line text-base ${leading} ${tone === "dark" ? "text-cloud/85" : "text-ink/75"}`}
          >
            {p}
          </p>
        ))}
    </div>
  );
}

/** Plain light section with a big heading, used by Overview, Courses and Scholarships. */
export function Section({ id, title, children, titleClassName }: { id: string; title: string; children: ReactNode; titleClassName?: string }) {
  return (
    <section id={id} className="scroll-mt-16 py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <h2 className={`${H2} text-center text-ink ${titleClassName}`}>{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

/** Text with an optional photo beside it. Without a photo the text is
 *  centered on its own, at a comfortable max width — not split into
 *  columns. This branch is what Overview currently renders through. */
export function TextWithImage({ text, image, tone }: { text: string; image?: GalleryImage; tone: number }) {
  if (!image) {
    return (
      <div className="mx-auto max-w-4xl text-center">
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

/** A photo clipped into the site's lagoon blob shape. Used in Location. */
function LagoonImage({
  src,
  alt,
  clipId,
  className,
}: {
  src: string;
  alt: string;
  clipId: string;
  className?: string;
}) {
  const lagoon = BLOB_SHAPES.lagoon;
  const [, , vbW, vbH] = lagoon.viewBox.split(/\s+/).map(Number);

  return (
    <svg viewBox={lagoon.viewBox} role="img" aria-label={alt} className={className}>
      <clipPath id={clipId}>
        <path d={lagoon.d} />
      </clipPath>
      <image
        href={src}
        x={0}
        y={0}
        width={vbW}
        height={vbH}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}

/* ------------------------------ SERVICES ------------------------------ */
/* Dark band, text on the left, plain rounded photo on the right, one
   outlined shape from the site's own loop drifting behind the photo. */

export function ServicesSection({ text, image }: { text: string; image?: GalleryImage }) {
  return (
    <section id="services" className="relative isolate scroll-mt-16 overflow-hidden bg-ink py-16 text-cloud">
      <ShapeOutline
        shape="squareBurstHold"
        color="#ffd212"
        className="pointer-events-none absolute -right-24 -top-16 -z-10 w-[26rem] rotate-12 opacity-40"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className={image ? "grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16" : "max-w-3xl"}>
          <div>
            <h2 className={`${H2} text-center text-cloud`}>Services</h2>
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
/* White band, kept compact: small heading, small vertical padding, and the
   MorphFrame beside the bullet list, side-by-side even on mobile. */

export function RankingsSection({ items, images }: { items: string[]; images: GalleryImage[] }) {
  return (
    <section id="rankings" className="relative scroll-mt-16 overflow-hidden bg-white py-6">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-5 sm:gap-8 sm:px-8 md:gap-16 lg:gap-20 lg:px-12">
        <div className="shrink-0">
          <MorphFrame
            size={MORPH_SIZE}
            images={images.map((img) => img.url)}
            alt={images.map((img) => img.altText || "School photo")}
            fit="cover"
            transitionDuration={0.5}
            className="h-30 w-30 sm:h-36 sm:w-36 md:h-[250px] md:w-[250px] lg:h-[250px] lg:w-[250px]"
          />
        </div>

        <div className="min-w-0 max-w-2xl">
          <h2 className={`${H2_COMPACT} text-center text-ink`}>Rankings</h2>
          <ul className="mt-4 space-y-3 md:mt-5">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2 text-[13px] md:text-base leading-4 text-ink/80">
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
/* Dark ink card with the text, a plain rounded photo close beside it,
   both roughly equal width. */

export function AccommodationSection({ text, image }: { text: string; image?: GalleryImage }) {
  return (
    <section id="accommodation" className="scroll-mt-16 py-8 bg-white">
      <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-20">
        <div className={image ? "grid gap-6 lg:grid-cols-[2fr_1fr]" : ""}>
          <div className="rounded-xl bg-ink px-4 py-4 text-white sm:px-8">
            <h2 className="font-display text-4xl font-semibold leading-tight text-center sm:text-5xl">
              Accommodation
            </h2>
            <div className="mt-3">
              <Prose text={text} tone="dark" leading="leading-6" />
            </div>
          </div>

          {image && (
            <div className="relative min-h-72 overflow-hidden rounded-xl bg-ink/5 lg:min-h-0">
              <Image
                src={image.url}
                alt={image.altText || "Student accommodation"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 480px"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ LOCATION ------------------------------- */
/* Light section: heading up top, then the photo on the left — clipped into
   the lagoon shape with the "city, country" pin badge — and the text on
   the right (a mirror of Overview/Services, which run text-left). */

export function LocationSection({
  text,
  image,
  city,
  country,
}: {
  text: string;
  image?: GalleryImage;
  city: string;
  country: string;
}) {
  return (
    <section id="location" className="scroll-mt-16 py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {!image ? (
          <div className="max-w-3xl">
            <h2 className={`${H2} text-center text-ink`}>Location</h2>
            <div className="mt-4">
              <Prose text={text} />
            </div>
          </div>
        ) : (
          <div className="grid items-center gap-10 lg:grid-cols-[380px_1fr] lg:gap-14">
            <div className="relative mx-auto w-full max-w-sm pb-6">
              <LagoonImage
                src={image.url}
                alt={image.altText || "School location"}
                clipId="location-lagoon-clip"
                className="w-full"
              />
              <span className="absolute bottom-0 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg ring-1 ring-ink/10">
                <MapPin size={16} className="text-ruby" />
                {city}, {country}
              </span>
            </div>

            <div>
              <h2 className={`${H2} text-center text-ink`}>Location</h2>
              <div className="mt-4">
                <Prose text={text} />
              </div>
            </div>
          </div>
        )}
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
             <a href={s.url}
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