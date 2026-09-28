"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { blobPathAt, PHASES, type BlobConfig } from "@/lib/blob-architectural";

const TAU = Math.PI * 2;

/** Which assembled shape from the blob loop to draw. */
export type OutlineShape = "squareBurstHold" | "circleBurstHold" | "triangleBurstHold";

const VB = 240;
const CONFIG: BlobConfig = { size: VB, radius: 115 };

/** Centre and length of a phase in the loop, read from PHASES so retiming
 *  the loop can never desync this file. */
function holdWindow(id: string) {
  let acc = 0;
  for (const phase of PHASES) {
    if (phase.id === id) return { center: acc + phase.dur / 2, span: phase.dur };
    acc += phase.dur;
  }
  return { center: 0, span: 1 };
}

/**
 * Outline-only version of one of the site's assembled shapes, used as a quiet
 * decorative backdrop. It rocks slowly inside the shape's hold phase, exactly
 * like ShapeFrame does, so the pieces never come apart.
 */
export function ShapeOutline({
  shape,
  color,
  className = "",
  strokeWidth = 1.5,
  period = 18,
  offset = 0,
}: {
  shape: OutlineShape;
  color: string;
  className?: string;
  strokeWidth?: number;
  /** Seconds for one slow rock. */
  period?: number;
  /** Starting point of the rock in radians, so two outlines do not move in step. */
  offset?: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const win = useMemo(() => holdWindow(shape), [shape]);
  const initial = useMemo(() => blobPathAt(win.center, CONFIG), [win]);
  useId();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frameId = 0;
    let last = performance.now();
    let theta = offset;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      theta = (theta + (dt * TAU) / period) % TAU;
      const u = 0.5 - 0.5 * Math.cos(theta);
      pathRef.current?.setAttribute("d", blobPathAt(win.center + (u - 0.5) * win.span, CONFIG));
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [win, period, offset]);

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`overflow-visible ${className}`}
    >
      <path
        ref={pathRef}
        d={initial}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}