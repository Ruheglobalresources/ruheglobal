"use client";
import React, { useEffect, useId, useState } from "react";
import { blobPathAt, phaseAt, PHASES, type BlobConfig } from "@/lib/blob-architectural";

interface MorphFrameProps {
  size?: number;
  radius?: number;
  className?: string;
  /** Images cycled through as the blob's shape phase changes. Falls back to a solid currentColor fill if omitted/empty. */
  images?: string[];
  alt?: string | string[];
  /** "cover" fills & crops the shape, "contain" fits the whole image inside it. */
  fit?: "cover" | "contain";
  /** Crossfade duration (seconds) at each phase change. Set 0 for a hard cut. Default 0.5. */
  transitionDuration?: number;
}

export const MorphFrame: React.FC<MorphFrameProps> = ({
  size = 300,
  radius = 100,
  className = "",
  images = [],
  alt = "",
  fit = "cover",
  transitionDuration = 0.5,
}) => {
  const [time, setTime] = useState(0);
  const clipId = useId();

  useEffect(() => {
    let frameId: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      setTime((now - startTime) / 1000);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, []);

  const config: BlobConfig = { size, radius };
  const path = blobPathAt(time, config);

  const hasImages = images.length > 0;

  // Which design phase are we in right now, and how far into it (seconds)?
  const phase = phaseAt(time);
  const phaseIndex = PHASES.findIndex((ph) => ph.id === phase.id);
  const phaseDef = PHASES[phaseIndex] ?? PHASES[0];
  const elapsedInPhase = phase.p * phaseDef.dur;

  // One image per design phase, cycling through the array as phases advance.
  const currentIndex = hasImages ? phaseIndex % images.length : 0;
  const prevIndex = hasImages
    ? (phaseIndex - 1 + PHASES.length) % images.length
    : 0;

  // Crossfade only for the first `transitionDuration` seconds right after a
  // phase change (i.e. right after a new shape starts appearing).
  const t =
    transitionDuration > 0
      ? Math.min(1, elapsedInPhase / transitionDuration)
      : 1;
  const showPrev = transitionDuration > 0 && t < 1 && images.length > 1;

  const getAlt = (i: number) => (Array.isArray(alt) ? alt[i % alt.length] ?? "" : alt);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden={hasImages ? undefined : "true"}
    >
      <defs>
        <clipPath id={clipId} clipRule="nonzero">
          <path d={path} />
        </clipPath>
      </defs>

      {hasImages ? (
        <g clipPath={`url(#${clipId})`}>
          {showPrev && (
            <image
              href={images[prevIndex]}
              x={0}
              y={0}
              width={size}
              height={size}
              preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
              opacity={1 - t}
            >
              {getAlt(prevIndex) ? <title>{getAlt(prevIndex)}</title> : null}
            </image>
          )}
          <image
            href={images[currentIndex]}
            x={0}
            y={0}
            width={size}
            height={size}
            preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
            opacity={showPrev ? t : 1}
          >
            {getAlt(currentIndex) ? <title>{getAlt(currentIndex)}</title> : null}
          </image>
        </g>
      ) : (
        <path d={path} fill="currentColor" />
      )}
    </svg>
  );
};

export default MorphFrame;