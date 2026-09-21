"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BLOB_SHAPES, type BlobShape } from "@/lib/blob-shapes";

/* -------------------------------------------------------------------------- */
/*  Blob                                                                       */
/*                                                                             */
/*  Renders one shape from the registry as a two-stop gradient disc. On       */
/*  first scroll into view: the outline strokes itself around the perimeter,  */
/*  then the fill floods in underneath, then the whole shape spins slowly     */
/*  and continuously around its own centre. Anything passed as `children`     */
/*  (an icon, for example) is laid on top and does NOT spin with the shape.   */
/* -------------------------------------------------------------------------- */

export interface BlobProps {
  shape?: BlobShape;
  size?: number;
  /** Gradient stops, outer -> inner. Defaults to a mid-tone ruby wash. */
  colors?: [string, string, string];
  /** Seconds for one full rotation. */
  spinDuration?: number;
  /** Clockwise (1) or counter-clockwise (-1). */
  spinDirection?: 1 | -1;
  /** Starting rotation in degrees, so sibling blobs don't move in lockstep. */
  startAngle?: number;
  className?: string;
  children?: React.ReactNode;
}

export function Blob({
  shape = "lagoon",
  size = 88,
  colors = ["#E8433D", "#C62828", "#7E0000"],
  spinDuration = 40,
  spinDirection = 1,
  startAngle = 0,
  className = "",
  children,
}: BlobProps) {
  const def = BLOB_SHAPES[shape];
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const gradId = `blob-grad-${uid}`;
  const animName = `blob-spin-${uid}`;

  const lineRef = useRef<SVGPathElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const len = lineRef.current?.getTotalLength();
    if (len) lineRef.current?.style.setProperty("--len", String(Math.ceil(len)));
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`} style={{ width: size, height: size }}>
      <style>{`
        @keyframes ${animName} {
          from { transform: rotate(${startAngle}deg); }
          to   { transform: rotate(${startAngle + spinDirection * 360}deg); }
        }
      `}</style>

      <svg
        viewBox={def.viewBox}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={gradId} cx="32%" cy="20%" r="90%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="60%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </radialGradient>
        </defs>

        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animation: drawn ? `${animName} ${spinDuration}s linear infinite` : "none",
          }}
        >
          <path
            d={def.d}
            fill={`url(#${gradId})`}
            style={{
              opacity: drawn ? 1 : 0,
              transition: "opacity 800ms ease-out 900ms",
            }}
          />
          <path
            ref={lineRef}
            d={def.d}
            fill="none"
            stroke={colors[1]}
            strokeWidth={3}
            strokeLinejoin="round"
            style={{
              strokeDasharray: "var(--len)",
              strokeDashoffset: drawn ? 0 : "var(--len)",
              opacity: drawn ? 0 : 1,
              transition:
                "stroke-dashoffset 1300ms cubic-bezier(.65,0,.35,1), opacity 500ms ease-out 1200ms",
            }}
          />
        </g>
      </svg>

      {children && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center">
          {children}
        </span>
      )}
    </div>
  );
}

export default Blob;