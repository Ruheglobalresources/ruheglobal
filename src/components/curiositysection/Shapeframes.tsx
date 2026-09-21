// src/components/curiosity/ShapeFrames.tsx
"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { blobPathAt, LOOP, PHASES, type BlobConfig } from "@/lib/blob-architectural";

const TAU = Math.PI * 2;

/* -------------------------------------------------------------------------- */
/*  Four frames, one per assembled shape in the blob loop                      */
/*                                                                             */
/*  MorphFrame plays the whole 28s cycle. These four don't: each one parks on  */
/*  a single shape from the loop and paints it solid as a background — square  */
/*  tiling, circle cluster, triangle tiling, or the plain rest circle. The     */
/*  photo sits on top in a plain, unanimated circle smaller than the shape's   */
/*  own reach, so the shape's fragments show past the photo's rim as a halo    */
/*  rather than being hidden behind it. The clock rocks slowly back and forth  */
/*  inside the shape's hold phase, where join = 1 from end to end — the shape  */
/*  can never come apart, only the spin and scale breathing the lib already    */
/*  builds in survive. That's what keeps the halo gently alive.                */
/*                                                                             */
/*  The chain between frames is drawn from the same shape as the frame it      */
/*  leads into: little squares run into the square frame, little circles into  */
/*  the circle cluster, little triangles into the triangle tiling.             */
/* -------------------------------------------------------------------------- */

export type FrameShape = "circle" | "squares" | "cluster" | "triangles";

/** The phase in PHASES where each shape sits fully assembled. */
const HOLD_PHASE: Record<FrameShape, string> = {
  circle: "circle",
  squares: "squareBurstHold",
  cluster: "circleBurstHold",
  triangles: "triangleBurstHold",
};

/** Read off PHASES at runtime so retiming the loop can't desync this file. */
function holdWindow(shape: FrameShape) {
  const id = HOLD_PHASE[shape];
  let acc = 0;
  for (const phase of PHASES) {
    if (phase.id === id) {
      return { center: acc + phase.dur / 2, span: phase.dur };
    }
    acc += phase.dur;
  }
  return { center: 0, span: LOOP };
}

/** SVG user units. Rendered size is set in CSS, so this is just the grid the
 *  path maths happens on. */
const VB = 240;
const RADIUS = 100;
const CONFIG: BlobConfig = { size: VB, radius: RADIUS };
const CENTER = VB / 2;

/** How far each shape's own points reach isn't equal — a square's grid sits
 *  tighter to the middle than a triangle's outer vertices or the circle
 *  cluster's loose lobes. Boosting the ones that read as timid keeps all
 *  four stops showing roughly the same amount of background around the
 *  photo, rather than squares vanishing behind it. */
const REACH: Record<FrameShape, number> = {
  circle: 1.0,
  squares: 1.18,
  cluster: 1.05,
  triangles: 1.22,
};

/** Radius of the circular photo on top. Smaller than RADIUS * REACH so every
 *  shape's fragments clear its rim and stay visible as a halo. */
const PHOTO_R = 87;

/** Seconds for one slow rock across the hold phase. */
const ROCK_PERIOD = 14;

export type ShapeFrameProps = {
  shape: FrameShape;
  /** Photo shown in the circle on top. Falls back to a brand wash if missing. */
  src?: string;
  alt: string;
  /** Fill for the animated shape sitting behind the photo. */
  accent: string;
  bead?: string;
  className?: string;
};

export function ShapeFrame({
  shape,
  src,
  alt,
  accent,
  bead = "#ffd212",
  className = "",
}: ShapeFrameProps) {
  const bgRef = useRef<SVGPathElement>(null);
  const [failed, setFailed] = useState(false);

  const win = useMemo(() => holdWindow(shape), [shape]);
  const bgConfig = useMemo<BlobConfig>(
    () => ({ size: VB, radius: RADIUS * REACH[shape] }),
    [shape]
  );
  const initialPath = useMemo(
    () => blobPathAt(win.center, bgConfig),
    [win, bgConfig]
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frameId = 0;
    let last = performance.now();
    let theta = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      theta = (theta + (dt * TAU) / ROCK_PERIOD) % TAU;
      const u = 0.5 - 0.5 * Math.cos(theta);

      // straight to the DOM: one attribute write per frame, no React re-render
      bgRef.current?.setAttribute(
        "d",
        blobPathAt(win.center + (u - 0.5) * win.span, bgConfig)
      );

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [win, bgConfig]);

  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const clipId = `frame-clip-${uid}`;
  const washId = `frame-wash-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      className={`overflow-visible ${className}`}
      role="img"
      aria-label={alt}
    >
      <defs>
        {/* the photo's clip is a plain, unanimated circle — the shape doing
            the moving lives behind it, not on the photo itself */}
        <clipPath id={clipId}>
          <circle cx={CENTER} cy={CENTER} r={PHOTO_R} />
        </clipPath>
        <linearGradient id={washId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#101b2d" />
        </linearGradient>
      </defs>

      {/* background: the animated shape itself, solid and visible, so its
          fragments show past the photo's rim as a halo */}
      <path ref={bgRef} d={initialPath} fill={accent} />

      <g clipPath={`url(#${clipId})`}>
        {src && !failed ? (
          <image
            href={src}
            x={CENTER - PHOTO_R}
            y={CENTER - PHOTO_R}
            width={PHOTO_R * 2}
            height={PHOTO_R * 2}
            preserveAspectRatio="xMidYMid slice"
            onError={() => setFailed(true)}
          />
        ) : (
          <rect
            x={CENTER - PHOTO_R}
            y={CENTER - PHOTO_R}
            width={PHOTO_R * 2}
            height={PHOTO_R * 2}
            fill={`url(#${washId})`}
          />
        )}
      </g>

      {/* the bead: drawn as this stop's own shape, not a plain dot, so it
          reads as "this photo belongs to the square family" etc. — the
          same mark the chain beads leading into it are made of */}
      <ShapeMark
        shape={shape}
        cx={CENTER - 9}
        cy={CENTER + PHOTO_R - 6}
        size={17}
        rotate={shape === "squares" ? 38 : 0}
        color={bead}
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  The chain                                                                  */
/* -------------------------------------------------------------------------- */

export type ChainShape = Exclude<FrameShape, "circle">;

/** One small mark drawn as a given shape family — a circle for "circle" and
 *  "cluster" (a cluster IS a pile of circles), a diamond for "squares", a
 *  triangle for "triangles". Used both for the chain's beads and for each
 *  frame's own bead, so a photo's bead always matches the shape it belongs
 *  to and the beads leading into it. */
export function ShapeMark({
  shape,
  cx,
  cy,
  size,
  rotate = 0,
  color,
}: {
  shape: FrameShape;
  cx: number;
  cy: number;
  size: number;
  rotate?: number;
  color: string;
}) {
  if (shape === "circle" || shape === "cluster") {
    return <circle cx={cx} cy={cy} r={size} fill={color} />;
  }

  if (shape === "squares") {
    return (
      <rect
        x={cx - size}
        y={cy - size}
        width={size * 2}
        height={size * 2}
        rx={1.5}
        fill={color}
        transform={`rotate(${rotate} ${cx} ${cy})`}
      />
    );
  }

  // equilateral triangle on the same three directions the tiling uses
  const pts = [-90, 30, 150]
    .map((deg) => {
      const a = ((deg + rotate) * Math.PI) / 180;
      return `${(cx + Math.cos(a) * size * 1.25).toFixed(1)},${(
        cy +
        Math.sin(a) * size * 1.25
      ).toFixed(1)}`;
    })
    .join(" ");

  return <polygon points={pts} fill={color} />;
}

/** Loose wave the beads sit on. u runs along the link, v is lateral drift,
 *  s scales the bead — hand-set rather than computed so it reads as scattered
 *  rather than as a plotted sine. */
const WAVE = [
  { u: 0.0, v: -0.34, s: 1.0 },
  { u: 0.19, v: 0.16, s: 0.82 },
  { u: 0.38, v: 0.5, s: 0.95 },
  { u: 0.57, v: 0.06, s: 0.78 },
  { u: 0.77, v: 0.3, s: 0.9 },
  { u: 1.0, v: -0.44, s: 1.18 },
];

const LONG = 132;
const CROSS = 84;
const BEAD = 7;

export type ChainLinkProps = {
  shape: ChainShape;
  direction: "horizontal" | "vertical";
  /** Beads pop in one after another once this flips true. */
  active: boolean;
  color?: string;
  className?: string;
};

export function ChainLink({
  shape,
  direction,
  active,
  color = "#ffd212",
  className = "",
}: ChainLinkProps) {
  const horizontal = direction === "horizontal";
  const w = horizontal ? LONG : CROSS;
  const h = horizontal ? CROSS : LONG;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {WAVE.map((node, i) => {
        const along = 14 + node.u * (LONG - 28);
        const across = CROSS / 2 + node.v * (CROSS * 0.38);

        return (
          <g
            key={i}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: active ? "scale(1)" : "scale(0)",
              opacity: active ? 1 : 0,
              transition:
                "transform 420ms cubic-bezier(.34,1.56,.64,1), opacity 260ms ease-out",
              transitionDelay: `${i * 85}ms`,
            }}
          >
            <ShapeMark
              shape={shape}
              cx={horizontal ? along : across}
              cy={horizontal ? across : along}
              size={BEAD * node.s}
              rotate={i * 17 - 20}
              color={color}
            />
          </g>
        );
      })}
    </svg>
  );
}