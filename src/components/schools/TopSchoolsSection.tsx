"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SchoolCard, type TopSchool } from "./SchoolCard";
import { COUNTRIES } from "@/constants/schools";
import { SectionBreaker } from "../Sectionbreaker";

export type TopSchoolsSectionProps = {
  // Active schools read from the database by the homepage.
  schools: TopSchool[];
  onApply?: (school: TopSchool) => void;
  onSave?: (school: TopSchool) => void;
};

// How far (px) the mouse must move before a press counts as a drag, not a click.
const DRAG_THRESHOLD = 5;

export function TopSchoolsSection({ schools: allSchools, onApply = () => {}, onSave }: TopSchoolsSectionProps) {
  // Only show a tab for countries that actually have a school in the database,
  // keeping the order (and flags) defined in COUNTRIES.
  const countries = useMemo(() => {
    const present = new Set(allSchools.map((s) => s.country));
    return COUNTRIES.filter((c) => present.has(c.name));
  }, [allSchools]);

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Falls back to the first available country if nothing is picked yet, or if
  // the picked country no longer has any schools after a refresh.
  const activeCountry =
    selectedCountry && countries.some((c) => c.name === selectedCountry)
      ? selectedCountry
      : (countries[0]?.name ?? "");

  const trackRef = useRef<HTMLDivElement>(null);

  // Drag bookkeeping lives in refs so pointer events never wait on a re-render.
  // `captured` flips to true only once the mouse has moved past the threshold,
  // which is what lets a plain click reach the card link underneath.
  const dragState = useRef({
    isDown: false,
    captured: false,
    pointerId: 0,
    startX: 0,
    startScroll: 0,
  });
  // True from the moment a real drag starts until just after the click that
  // follows the mouse-up, so that click can be swallowed.
  const suppressClick = useRef(false);
  // Only used for styling (cursor, snap behaviour) while dragging.
  const [isDragging, setIsDragging] = useState(false);

  // whether there are more schools hidden to the left or right of the track
  // (drives the lg only hover arrows)
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isFirstRender = useRef(true);

  const schools = useMemo(
    () => allSchools.filter((s) => s.country === activeCountry),
    [allSchools, activeCountry]
  );

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  // slide the active country tab into view when it's off-screen on mobile
  // (skips on initial mount, and only scrolls the tabs strip itself,
  // never the page)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const tab = tabRefs.current[activeCountry];
    const container = tabsRef.current;
    if (!tab || !container) return;

    const tabLeft = tab.offsetLeft;
    const tabRight = tabLeft + tab.offsetWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;

    if (tabLeft < viewLeft || tabRight > viewRight) {
      container.scrollTo({
        left: tabLeft - container.clientWidth / 2 + tab.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeCountry]);

  // reset the horizontal schools track to the start whenever the
  // active country changes, so you always land on the first card
  // instead of wherever the previous country's scroll position was
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: 0, behavior: "smooth" });
  }, [activeCountry]);

  // keep the arrows in sync when the schools change or the window is resized
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [schools, updateArrows]);

  // scroll the track by exactly one card (card width plus the gap between cards)
  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.firstElementChild as HTMLElement | null;
    if (!firstCard) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const track = trackRef.current;
    // Touch and pen already scroll the track natively, so drag-to-scroll is
    // mouse only. Also ignore anything other than the primary button.
    if (!track || e.pointerType !== "mouse" || e.button !== 0) return;

    // NOTE: we deliberately do NOT call setPointerCapture here. Capturing on
    // mouse-down redirects the click to the track and the card link never
    // receives it. Capture starts later, in onPointerMove, once it's a drag.
    dragState.current = {
      isDown: true,
      captured: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: track.scrollLeft,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const track = trackRef.current;
    const state = dragState.current;
    if (!state.isDown || !track) return;

    const dx = e.clientX - state.startX;

    // Only treat it as a drag once the mouse has clearly moved.
    if (!state.captured && Math.abs(dx) > DRAG_THRESHOLD) {
      track.setPointerCapture(state.pointerId);
      state.captured = true;
      suppressClick.current = true;
      setIsDragging(true);
    }

    if (state.captured) track.scrollLeft = state.startScroll - dx;
  };

  const endDrag = () => {
    const track = trackRef.current;
    const state = dragState.current;

    if (state.captured && track?.hasPointerCapture(state.pointerId)) {
      track.releasePointerCapture(state.pointerId);
    }

    const wasDrag = state.captured;
    state.isDown = false;
    state.captured = false;

    if (wasDrag) {
      // The click event fires right after pointerup. Keep suppressing until
      // that has happened, then allow normal clicks again.
      setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
    setIsDragging(false);
  };

  // No active schools in the database yet, so hide the whole section
  // (all hooks above run first, which keeps the hook order stable).
  if (countries.length === 0) return null;

  return (
    <>
      <section className="bg-ink py-16 text-cloud sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-8 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cloud/40">
              Where we get people in
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
              Top schools our students
              <br className="hidden sm:block" />
              <span className="italic text-ruby-500"> are studying at right now.</span>
            </h2>
          </div>

          {/* country tabs */}
          <div
            ref={tabsRef}
            className="flex items-center gap-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {countries.map((country, i) => {
              const active = country.name === activeCountry;
              return (
                <Fragment key={country.name}>
                  {i > 0 && <span className="h-5 w-px shrink-0 bg-cloud/15" />}
                  <button
                    ref={(el) => {
                      tabRefs.current[country.name] = el;
                    }}
                    type="button"
                    onClick={() => setSelectedCountry(country.name)}
                    className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active ? "text-ink" : "text-cloud/60 hover:text-cloud"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeCountryPill"
                        className="absolute inset-0 rounded-full bg-cloud"
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{country.flag}</span>
                    <span className="relative z-10">{country.name}</span>
                  </button>
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* schools track with lg only hover arrows */}
        <div className="group relative mt-8">
          {/*
            Arrows are invisible until the track is hovered. While invisible they
            must not catch pointer events, otherwise they sit on top of the first
            and last cards and swallow clicks meant for them.
          */}
          <button
            type="button"
            aria-label="Show previous school"
            disabled={!canScrollLeft}
            onClick={() => scrollByCard(-1)}
            className={`pointer-events-none absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center bg-transparent p-2 text-ruby-500 opacity-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition duration-200 hover:scale-110 hover:text-ruby-400 focus-visible:opacity-100 lg:flex ${
              canScrollLeft ? "lg:group-hover:pointer-events-auto lg:group-hover:opacity-100" : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12"
              aria-hidden
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Show next school"
            disabled={!canScrollRight}
            onClick={() => scrollByCard(1)}
            className={`pointer-events-none absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center bg-transparent p-2 text-ruby-500 opacity-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition duration-200 hover:scale-110 hover:text-ruby-400 focus-visible:opacity-100 lg:flex ${
              canScrollRight ? "lg:group-hover:pointer-events-auto lg:group-hover:opacity-100" : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12"
              aria-hidden
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            ref={trackRef}
            onScroll={updateArrows}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            // Stops the browser's native "drag this link/image" ghost, which
            // would otherwise cancel our pointer events mid-drag.
            onDragStart={(e) => e.preventDefault()}
            // Swallow the click that follows a real drag (runs in the capture
            // phase, before the card link sees it). Plain clicks pass through.
            onClickCapture={(e) => {
              if (suppressClick.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className={`flex gap-5 overflow-x-auto px-6 pb-4 sm:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
              // While dragging, turn snapping and smooth scrolling off so the
              // track follows the mouse 1:1. On release, snapping settles it.
              isDragging
                ? "cursor-grabbing select-none snap-none scroll-auto"
                : "cursor-grab snap-x snap-mandatory scroll-smooth"
            }`}
          >
            {schools.map((school, i) => (
              <div key={school.id}>
                <SchoolCard school={school} index={i} onApply={onApply} />
              </div>
            ))}
            <div className="w-1 shrink-0" aria-hidden />
          </div>
        </div>
      </section>

      <SectionBreaker topColor="var(--color-ink)" bottomColor="white" />
    </>
  );
}