"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Geometry                                                                   */
/* -------------------------------------------------------------------------- */

const VB_W = 1240;
const VB_H = 166;

/** How many sample points per curve. 18 is plenty for a smooth catmull-rom. */
const SEGMENTS = 18;

/** Bleed past the left/right edge so scaling never shows a hairline seam. */
const BLEED = 8;

const TAU = Math.PI * 2;

/* -------------------------------------------------------------------------- */
/*  Streams                                                                    */
/* -------------------------------------------------------------------------- */

type Stream = {
  color: string;
  /** Resting y position inside the 166-unit viewBox. */
  base: number;
  /** Primary swell amplitude. */
  amp: number;
  /** Radians per second of the primary swell. */
  speed: number;
  /** Static offset so no two streams ever line up. */
  phase: number;
  /** Amplitude of the slow, long-wavelength drift. */
  drift: number;
  /** Wavelengths across the full width for the primary swell. */
  freq: number;
};

/**
 * The surface the colours ride under — a gentle, low-amplitude curve.
 * Everything below this line is "solid ground" (the next section's colour),
 * everything above it is transparent.
 */
const SURFACE: Stream = {
  color: "",
  base: 88,
  amp: 15,
  speed: 0.17,
  phase: 0.0,
  drift: 11,
  freq: 1.1,
};

/**
 * Four ribbons, same layout/timing as the original, but all sharing the one
 * cloud colour. Different amplitude / phase / speed per ribbon means they
 * still cross and layer over each other — where they overlap the fill just
 * gets a touch denser, which reads as depth in the cloud bank rather than
 * as extra colours.
 */
const CLOUD_COLOR = "#eef2f6";

const STREAMS: Stream[] = [
  {
    color: CLOUD_COLOR,
    base: 98,
    amp: 40,
    speed: 0.205,
    phase: 1.9,
    drift: 15,
    freq: 1.35,
  },
  {
    color: CLOUD_COLOR,
    base: 92,
    amp: 35,
    speed: 0.163,
    phase: 3.75,
    drift: 18,
    freq: 1.75,
  },
  {
    color: CLOUD_COLOR,
    base: 101,
    amp: 43,
    speed: 0.238,
    phase: 5.42,
    drift: 12,
    freq: 1.05,
  },
  {
    color: CLOUD_COLOR,
    base: 95,
    amp: 37,
    speed: 0.184,
    phase: 4.6,
    drift: 14,
    freq: 1.58,
  },
];

/* -------------------------------------------------------------------------- */
/*  Curve maths                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Three sines of different wavelength / speed / direction stacked on top of
 * each other. Because the periods are irrational multiples of one another the
 * result never visibly repeats, which is what makes it read as water rather
 * than as a looping animation.
 */
function waveY(x: number, t: number, s: Stream) {
  const u = x / VB_W;

  const swell = Math.sin(u * TAU * s.freq + s.phase + t * s.speed) * s.amp;

  const chop =
    Math.sin(u * TAU * (s.freq * 2.17) - t * s.speed * 0.81 + s.phase * 1.63) *
    s.amp *
    0.38;

  const slow =
    Math.sin(u * TAU * 0.47 + t * s.speed * 0.39 + s.phase * 0.55) * s.drift;

  return s.base + swell + chop + slow;
}

/**
 * Catmull-rom through the sample points, emitted as cubic beziers.
 * Sampling one extra point either side keeps the tangents correct at the
 * edges so the curve doesn't flatten out where it leaves the viewBox.
 */
function curveSegments(t: number, s: Stream) {
  const step = (VB_W + BLEED * 2) / SEGMENTS;
  const pts: { x: number; y: number }[] = [];

  for (let i = -1; i <= SEGMENTS + 1; i++) {
    const x = -BLEED + i * step;
    pts.push({ x, y: waveY(x, t, s) });
  }

  let d = "";

  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(
      2,
    )} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return {
    d,
    startX: pts[1].x,
    startY: pts[1].y,
    endX: pts[pts.length - 2].x,
  };
}

/** Filled from the curve DOWN to the bottom edge. This is the surface. */
function surfacePath(t: number, s: Stream) {
  const { d, startX, startY, endX } = curveSegments(t, s);
  return `M${startX.toFixed(2)},${(VB_H + BLEED).toFixed(2)}L${startX.toFixed(
    2,
  )},${startY.toFixed(2)}${d}L${endX.toFixed(2)},${(VB_H + BLEED).toFixed(2)}Z`;
}

/**
 * Filled from the top edge DOWN to the curve — the opposite of the surface.
 * Masked by the surface, only the overlap survives, which is the ribbon.
 */
function streamPath(t: number, s: Stream) {
  const { d, startX, startY, endX } = curveSegments(t, s);
  return `M${startX.toFixed(2)},${(-BLEED).toFixed(2)}L${startX.toFixed(
    2,
  )},${startY.toFixed(2)}${d}L${endX.toFixed(2)},${(-BLEED).toFixed(2)}Z`;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export interface SectionBreakerProps {
  /** Colour above the wave. Leave undefined to let an image show through. */
  topColor?: string;
  /** Colour of the section below — this is the solid part of the wave. */
  bottomColor?: string;
  /** Override the ribbon colour. Defaults to a single cloud-coloured ribbon. */
  colors?: string[];
  /** Extra stream painted last, on top of everything else. */
  accentColor?: string;
  /** Mirror vertically, for a bottom-of-section divider. */
  flip?: boolean;
  /** Hide the colour stream and keep only the plain wave. */
  withAccent?: boolean;
  /** Stream opacity. The original uses 0.8. */
  opacity?: number;
  /** Global animation multiplier. 1 = the original's pace. */
  speed?: number;
  /**
   * Stretch to fill the parent instead of sitting at the fixed divider
   * height (14/20/166px). Use this when the breaker is the decorative
   * background of a whole section rather than a seam between two
   * sections — pair it with a parent that has `relative` positioning.
   */
  fill?: boolean;
  className?: string;
}

export function MiniSectionBreaker({
  topColor,
  bottomColor = "#ffffff",
  colors,
  accentColor,
  flip = false,
  withAccent = true,
  opacity = 0.8,
  speed = 1,
  fill = false,
  className,
}: SectionBreakerProps) {
  const rawId = useId();
  const maskId = `breaker-mask-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const streams = useMemo(() => {
    const palette = colors?.length ? colors : STREAMS.map((s) => s.color);

    const list: Stream[] = palette.map((color, i) => ({
      ...STREAMS[i % STREAMS.length],
      color,
      // keep every extra stream out of phase with the ones before it
      phase: STREAMS[i % STREAMS.length].phase + Math.floor(i / STREAMS.length) * 2.1,
    }));

    if (accentColor) {
      list.push({
        ...STREAMS[list.length % STREAMS.length],
        color: accentColor,
        base: 95,
        amp: 38,
        speed: 0.19,
        phase: 2.7,
        drift: 16,
        freq: 1.55,
      });
    }

    return list;
  }, [colors, accentColor]);

  const surfaceRefs = useRef<(SVGPathElement | null)[]>([]);
  const streamRefs = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = ((now - start) / 1000) * speed;

      const surface = surfacePath(t, SURFACE);
      for (const node of surfaceRefs.current) {
        node?.setAttribute("d", surface);
      }

      for (let i = 0; i < streams.length; i++) {
        streamRefs.current[i]?.setAttribute("d", streamPath(t, streams[i]));
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [streams, speed]);

  // Frame 0 — identical on the server and the client, so hydration is clean.
  const initialSurface = useMemo(() => surfacePath(0, SURFACE), []);
  const initialStreams = useMemo(
    () => streams.map((s) => streamPath(0, s)),
    [streams],
  );

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none w-full select-none",
        fill ? "absolute inset-0 h-full" : "relative h-14 sm:h-20 lg:h-[166px]",
        className,
      )}
      style={{
        backgroundColor: topColor,
        transform: flip ? "scaleY(-1)" : undefined,
      }}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 block h-full w-full"
      >
        <title>Decorative wave</title>

        {/* The solid ground. */}
        <path
          ref={(el) => {
            surfaceRefs.current[0] = el;
          }}
          d={initialSurface}
          fill={bottomColor}
        />

        {/* Same shape again, in white, used as a luminance mask. */}
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={VB_W}
          height={VB_H}
        >
          <path
            ref={(el) => {
              surfaceRefs.current[1] = el;
            }}
            d={initialSurface}
            fill="#fff"
          />
        </mask>

        {/* Colour stream(s), clipped to the ground. */}
        {withAccent && (
          <g mask={`url(#${maskId})`}>
            {streams.map((s, i) => (
              <path
                key={`${s.color}-${i}`}
                ref={(el) => {
                  streamRefs.current[i] = el;
                }}
                d={initialStreams[i]}
                fill={s.color}
                opacity={opacity}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

export default MiniSectionBreaker;