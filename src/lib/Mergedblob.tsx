//src/lib/Mergedblob.tsx
"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
// adjust this path to wherever your BLOB_SHAPES registry lives
import { BLOB_SHAPES, type BlobShape } from "@/lib/blob-shapes";

/**
 * MergedBlob
 *
 * One dominant lagoon (the "face") sitting on top of three more shapes that
 * are almost completely submerged beneath it. Only thin slivers of the
 * hidden shapes show past the edge, exactly like the reference: a red
 * lagoon (Ruhe Global's primary colour) with yellow / cyan / purple rims
 * peeking out.
 *
 * Every layer is a solid fill in one colour from the ribbon palette. The
 * lagoon is always the LAST layer, so it is always on top and it carries
 * the icon. The hidden shapes sway gently (a small back-and-forth rotation,
 * not a full spin), so the slivers drift around the rim without ever
 * uncovering much.
 */

/* ------------------------------ palette ---------------------------------- */

/** Ribbon colours (the same ones SectionBreaker streams use). */
export const RIBBON = {
  yellow: "#ffd212",
  cyan: "#3df5e9",
  red: "#f50202",
  purple: "#42057f",
} as const;

/** Ruhe Global's primary colour is red, so red is the face of the blob and
 *  the other three ribbon colours are the ones peeking out underneath. */
const DEFAULT_BACK = [RIBBON.yellow, RIBBON.cyan, RIBBON.purple];

/* ------------------------------ geometry --------------------------------- */

const CANVAS = 120; // shared coordinate space for all four layers

type Layer = {
  shape: BlobShape;
  /** centre of the layer inside the 120 x 120 canvas */
  cx: number;
  cy: number;
  w: number;
  h: number;
  /** resting rotation (deg) and how far it sways either side of it */
  rot: number;
  sway: number;
  /** 1 or -1: which way this layer starts swaying */
  dir: 1 | -1;
  /** duration multiplier so the layers never move in lockstep */
  speed: number;
};

/**
 * Back layers, each only slightly smaller than the top lagoon and nudged
 * off-centre, so just a rim of colour escapes. Order = paint order.
 * The top lagoon comes after these and is never re-ordered.
 */
const BACK_LAYERS: Layer[] = [
  { shape: "lagoon", cx: 63.5, cy: 63, w: 90, h: 74, rot: 20, sway: 12, dir: 1, speed: 1.0 },
  { shape: "organic", cx: 56.5, cy: 56, w: 90, h: 69, rot: -22, sway: 12, dir: -1, speed: 1.25 },
  { shape: "organic", cx: 58, cy: 64, w: 84, h: 64, rot: 160, sway: 12, dir: 1, speed: 0.85 },
];

const TOP_LAYER: Layer = {
  shape: "lagoon",
  cx: 60,
  cy: 60,
  w: 92,
  h: 76,
  rot: 0,
  sway: 3,
  dir: 1,
  speed: 1.6,
};

function parseViewBox(vb: string) {
  const [, , w, h] = vb.split(/\s+/).map(Number);
  return { w, h };
}

/* ------------------------------ component -------------------------------- */

export type MergedBlobProps = {
  /** Colour of the dominant lagoon on top. Default: ribbon red. */
  topColor?: string;
  /** Lighter tint blended into the top lagoon for a little depth. Set to the
   *  same value as `topColor` for a perfectly flat fill. */
  topHighlight?: string;
  /** Colours of the three submerged shapes, back to front. */
  backColors?: [string, string, string] | string[];
  /** Shifts which back colour lands on which shape, so siblings differ. */
  variant?: number;
  size?: number;
  /** Seconds for one sway cycle of the slowest layer. Default 9. */
  duration?: number;
  className?: string;
  children?: ReactNode;
};

export function MergedBlob({
  topColor = RIBBON.red,
  topHighlight = "#ff4a3f",
  backColors = DEFAULT_BACK,
  variant = 0,
  size = 112,
  duration = 9,
  className,
  children,
}: MergedBlobProps) {
  const gid = `mb-${useId().replace(/:/g, "")}`;

  // rotate the colour order per variant so four cards don't look cloned
  const shift = ((variant % backColors.length) + backColors.length) % backColors.length;
  const back = backColors.map((_, i) => backColors[(i + shift) % backColors.length]);

  const layers = [
    ...BACK_LAYERS.map((layer, i) => ({ layer, fill: back[i % back.length] })),
    { layer: TOP_LAYER, fill: `url(#${gid})` },
  ];

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <style>{`
        @keyframes merged-blob-sway {
          from { transform: rotate(var(--mb-a)); }
          to   { transform: rotate(var(--mb-b)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .merged-blob-layer { animation: none !important; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${CANVAS} ${CANVAS}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="20" y1="20" x2="100" y2="100">
            <stop offset="0" stopColor={topHighlight} />
            <stop offset="1" stopColor={topColor} />
          </linearGradient>
        </defs>

        {layers.map(({ layer, fill }, i) => {
          const def = BLOB_SHAPES[layer.shape];
          const vb = parseViewBox(def.viewBox);
          const sx = layer.w / vb.w;
          const sy = layer.h / vb.h;
          const x = layer.cx - layer.w / 2;
          const y = layer.cy - layer.h / 2;

          const from = layer.rot - layer.sway * layer.dir;
          const to = layer.rot + layer.sway * layer.dir;

          const style: CSSProperties & Record<string, string | number> = {
            transformBox: "fill-box",
            transformOrigin: "center",
            // reduced-motion fallback: rest at the base angle
            transform: `rotate(${layer.rot}deg)`,
            "--mb-a": `${from}deg`,
            "--mb-b": `${to}deg`,
            animation: `merged-blob-sway ${duration * layer.speed}s ease-in-out ${-(variant * 1.7 + i * 2.3)}s infinite alternate`,
          };

          return (
            <g key={i} className="merged-blob-layer" style={style}>
              <path d={def.d} fill={fill} transform={`translate(${x} ${y}) scale(${sx} ${sy})`} />
            </g>
          );
        })}
      </svg>

      {/* icon sits dead-centre over the top lagoon */}
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export default MergedBlob;