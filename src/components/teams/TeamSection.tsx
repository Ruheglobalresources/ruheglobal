// src/components/team/TeamSection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEAM } from "@/constants/team";

export function TeamSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, TEAM.length - 1));
    const slide = track.children[clamped] as HTMLElement | undefined;
    if (!slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    setActiveIndex(clamped);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    if (!track) return;
    dragState.current = { isDown: true, startX: e.clientX, startScroll: track.scrollLeft };
    track.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const track = trackRef.current;
    const state = dragState.current;
    if (!state.isDown || !track) return;
    const dx = e.clientX - state.startX;
    if (Math.abs(dx) > 4) setIsDragging(true);
    track.scrollLeft = state.startScroll - dx;
  };

  const endDrag = () => {
    dragState.current.isDown = false;
    requestAnimationFrame(() => setIsDragging(false));

    // snap activeIndex to whichever slide is closest after a manual drag,
    // so the prev/next buttons stay in sync with where the user landed
    const track = trackRef.current;
    if (!track) return;
    let closest = 0;
    let closestDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const dist = Math.abs(el.offsetLeft - track.scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  return (
    <section className="bg-sand py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink/40">
              The people behind Ruhe
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
              Expertly Guided,
              <br className="hidden sm:block" />
              <span className="italic"> Personally Delivered</span>
            </h2>
          </div>

          <Link
            href="/team"
            className="hidden shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cloud transition-colors hover:bg-ink/90 sm:inline-block"
          >
            Meet our experts
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className={`flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:px-10 ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {TEAM.map((member) => (
          <div
            key={member.id}
            className="w-full shrink-0 snap-center px-0 sm:w-[420px] sm:px-3"
            onClickCapture={(e) => {
              if (isDragging) e.stopPropagation();
            }}
          >
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(min-width: 640px) 420px, 100vw"
                  className="object-cover"
                  draggable={false}
                />
              </div>

              <div className="flex flex-col gap-6 p-8">
                <Link
                  href="/team"
                  className="inline-block w-fit rounded-full bg-ink px-6 py-3 text-sm font-medium text-cloud transition-colors hover:bg-ink/90 sm:hidden"
                >
                  Meet our experts
                </Link>

                <p className="font-display text-xl leading-relaxed text-ink">
                  &ldquo;{member.quote}&rdquo;
                </p>

                <div>
                  <p className="font-display text-2xl italic text-ink">{member.name}</p>
                  <p className="mt-1 text-sm text-ink/50">
                    {member.role} &middot; {member.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between px-6 sm:px-10">
        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous expert"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/10 text-ink transition-colors hover:bg-ink/20 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-4">
          {TEAM.map((member, i) => (
            <button
              key={member.id}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to ${member.name}`}
              className={`h-1.5 rounded-full gap-3 transition-all ${
                i === activeIndex ? "w-6 bg-ink" : "w-1.5 bg-ink/20"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === TEAM.length - 1}
          aria-label="Next expert"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cloud transition-colors hover:bg-ink/90 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}