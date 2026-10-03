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
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0 });
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
          <button
            type="button"
            aria-label="Show previous school"
            disabled={!canScrollLeft}
            onClick={() => scrollByCard(-1)}
            className={`absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center bg-transparent p-2 text-ruby-500 opacity-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition duration-200 hover:scale-110 hover:text-ruby-400 focus-visible:opacity-100 lg:flex ${
              canScrollLeft ? "lg:group-hover:opacity-100" : "pointer-events-none"
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
            className={`absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center bg-transparent p-2 text-ruby-500 opacity-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition duration-200 hover:scale-110 hover:text-ruby-400 focus-visible:opacity-100 lg:flex ${
              canScrollRight ? "lg:group-hover:opacity-100" : "pointer-events-none"
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
            onPointerLeave={endDrag}
            className={`flex gap-5 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scroll-smooth sm:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
              isDragging ? "cursor-grabbing select-none" : "cursor-grab"
            }`}
          >
            {schools.map((school, i) => (
              <div
                key={school.id}
                onClickCapture={(e) => {
                  if (isDragging) e.stopPropagation();
                }}
              >
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