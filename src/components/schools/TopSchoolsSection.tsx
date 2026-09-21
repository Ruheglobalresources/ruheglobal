"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SchoolCard } from "./SchoolCard";
import { COUNTRIES, SCHOOLS, type School } from "@/constants/schools";
import { SectionBreaker } from "../Sectionbreaker";

export type TopSchoolsSectionProps = {
  onApply?: (school: School) => void;
  onSave?: (school: School) => void;
};

export function TopSchoolsSection({ onApply = () => {}, onSave }: TopSchoolsSectionProps) {
  const [activeCountry, setActiveCountry] = useState(COUNTRIES[0].name);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isFirstRender = useRef(true);

  const schools = useMemo(
    () => SCHOOLS.filter((s) => s.country === activeCountry),
    [activeCountry]
  );

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
            {COUNTRIES.map((country, i) => {
              const active = country.name === activeCountry;
              return (
                <Fragment key={country.name}>
                  {i > 0 && <span className="h-5 w-px shrink-0 bg-cloud/15" />}
                  <button
                    ref={(el) => {
                      tabRefs.current[country.name] = el;
                    }}
                    type="button"
                    onClick={() => setActiveCountry(country.name)}
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

        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          className={`mt-8 flex gap-5 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scroll-smooth sm:px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
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
              <SchoolCard school={school} index={i} onApply={onApply} onSave={onSave} />
            </div>
          ))}
          <div className="w-1 shrink-0" aria-hidden />
        </div>
      </section>

      <SectionBreaker topColor="var(--color-ink)" bottomColor="white" />
    </>
  );
}