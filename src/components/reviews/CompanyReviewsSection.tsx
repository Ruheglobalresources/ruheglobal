// src/components/reviews/CompanyReviewsSection.tsx
"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { COMPANY_REVIEWS } from "@/constants/reviews";

const avgRating = (
  COMPANY_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / COMPANY_REVIEWS.length
).toFixed(1);

function StarRow({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-ember text-ember" : "fill-ink/10 text-ink/10"}
        />
      ))}
    </div>
  );
}

export function CompanyReviewsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
    <section className="bg-sand py-16 text-ink sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink/40">
            Client stories
          </p>
          <h2 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">
            What People Are <span className="italic">Saying About Us</span>
          </h2>
          <p className="mt-6 text-ink/60 sm:text-lg">
            From first consultation to arrival day, here&apos;s what our
            clients have to say about working with Ruhe Global Resources.
          </p>
        </motion.div>
      </div>

      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className={`mt-12 flex gap-5 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scroll-smooth sm:px-10 lg:mt-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {COMPANY_REVIEWS.map((review, i) => {
          const isExpanded = expanded[review.id];
          return (
            <div
              key={review.id}
              onClickCapture={(e) => {
                if (isDragging) e.stopPropagation();
              }}
              className="w-[280px] shrink-0 snap-start rounded-2xl bg-cloud p-6 shadow-sm ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-lg sm:w-[320px]"
            >
              <Quote className="h-6 w-6 text-teal/40" />
              <StarRow rating={review.rating} className="mt-3" />
              <p
                className={`mt-3 text-sm leading-relaxed text-ink/70 ${
                  isExpanded ? "" : "line-clamp-4"
                }`}
              >
                {review.text}
              </p>
              {review.text.length > 140 && (
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => ({ ...prev, [review.id]: !prev[review.id] }))}
                  className="mt-1 text-xs font-medium text-teal hover:underline"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
              <div className="mt-4 border-t border-ink/10 pt-3">
                <p className="font-semibold text-ink">{review.name}</p>
                <p className="text-xs text-ink/50">{review.location}</p>
              </div>
            </div>
          );
        })}
        <div className="w-1 shrink-0" aria-hidden />
      </div>

      <div className="mt-10 flex flex-col items-center gap-2 lg:mt-14">
        <StarRow rating={5} />
        <p className="text-sm text-ink/60">
          <span className="font-semibold text-ink">{avgRating} out of 5</span>{" "}
          · Based on {COMPANY_REVIEWS.length}+ Reviews
        </p>
      </div>
    </section>
  );
}