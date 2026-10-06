"use client";

// src/components/dashboard/swipe-section.tsx
// A titled, swipeable strip of cards for the dashboard home (Swiper, the same
// library the reviews and school cards already use). Phones swipe with a finger,
// desktop drags with the mouse or uses the arrows. The last slide is a "See all"
// card, and "Show all" in the header goes to the full page.
//
// Card width follows the space the strip actually has (the page grows and shrinks
// when the sidebars collapse), so on wider screens the cards are sized to fit a
// whole number across, with no half-cut card at the edge. Phones keep the
// peek-and-swipe layout, where the next card showing is the hint to swipe.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/free-mode";
import type { InfiniteList } from "@/hooks/use-infinite-list";
import { cn } from "@/lib/utils";
import { DiscoverCardSkeleton } from "./discover-card";
import { outlinedButton, textButton } from "./styles";

const GAP = 16; // px between cards
const MIN_CARD = 272; // px (17rem): no card is ever narrower than this on a wide strip
const FIT_FROM = 640; // px: below this strip width, keep the phone layout

// Phone layout. Swiper's "auto" mode reads the width from CSS, and ! beats Swiper's own width.
const peekSlide = "!h-auto !w-[78%] min-[480px]:!w-[17rem]";

const arrowButton =
  "hidden size-10 place-items-center rounded-full border border-neutral-200 bg-white text-ink transition hover:bg-ruby-50 disabled:pointer-events-none disabled:opacity-35 md:grid";

type SwipeSectionProps<T extends { id: string }> = {
  title: React.ReactNode;
  description?: string;
  showAllHref: string;
  seeAllLabel: string; // text on the last card, e.g. "See all 1,203 courses"
  list: InfiniteList<T>;
  renderItem: (item: T) => React.ReactNode;
  emptyText: string;
};

export function SwipeSection<T extends { id: string }>({
  title,
  description,
  showAllHref,
  seeAllLabel,
  list,
  renderItem,
  emptyText,
}: SwipeSectionProps<T>) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // How wide is the strip right now? Re-measured whenever the page area changes size.
  const sectionRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Wide strip: as many cards as fit at MIN_CARD or more, stretched to share the width exactly.
  const fit = width >= FIT_FROM;
  const perView = fit ? Math.max(2, Math.floor((width + GAP) / (MIN_CARD + GAP))) : 1;
  const cardWidth = fit ? Math.floor((width - GAP * (perView - 1)) / perView) : null;
  const slideClass = fit ? "!h-auto" : peekSlide;
  const slideStyle = cardWidth ? { width: cardWidth } : undefined;

  // The cards changed size, so Swiper has to measure its slides again.
  useEffect(() => {
    swiper?.update();
  }, [swiper, cardWidth]);

  const sync = (s: SwiperType) =>
    setEdges((prev) => (prev.start === s.isBeginning && prev.end === s.isEnd ? prev : { start: s.isBeginning, end: s.isEnd }));

  const { items, status, error, retry } = list;

  return (
    <section ref={sectionRef} className="min-w-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">{title}</div>
          {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous"
            className={arrowButton}
            disabled={!swiper || edges.start}
            // Wide strips move a full page of cards at a time, phones one card.
            onClick={() => (fit && swiper ? swiper.slideTo(Math.max(0, swiper.activeIndex - perView)) : swiper?.slidePrev())}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next"
            className={arrowButton}
            disabled={!swiper || edges.end}
            onClick={() => (fit && swiper ? swiper.slideTo(swiper.activeIndex + perView) : swiper?.slideNext())}
          >
            <ChevronRight size={20} />
          </button>
          <Link href={showAllHref} className={cn(textButton, "ml-1")}>
            Show all <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {status === "loading" && (
        <div className="flex gap-4 overflow-hidden pb-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={cn("shrink-0", !fit && "w-[78%] min-[480px]:w-[17rem]")}
              style={slideStyle}
            >
              <DiscoverCardSkeleton />
            </div>
          ))}
        </div>
      )}

      {status === "error" && items.length === 0 && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">
          <p>{error ?? "We couldn't load this."}</p>
          <button type="button" onClick={retry} className={outlinedButton}>
            <RotateCw size={16} /> Try again
          </button>
        </div>
      )}

      {status === "ready" && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-neutral-200 p-6 text-sm text-neutral-500">{emptyText}</p>
      )}

      {items.length > 0 && (
        <Swiper
          // Remount when the strip switches between phone and wide layout, because
          // free-scroll (phone) and card-by-card snapping (wide) are set up once.
          key={fit ? "fit" : "peek"}
          modules={[FreeMode]}
          freeMode={fit ? false : { enabled: true, momentumRatio: 0.6 }}
          slidesPerView="auto"
          spaceBetween={GAP}
          grabCursor
          onSwiper={(s) => {
            setSwiper(s);
            sync(s);
          }}
          onProgress={sync}
          onUpdate={sync}
          onResize={sync}
          // Room for the card shadow, which Swiper would otherwise clip.
          className="!-mx-1 !px-1 !pb-3 !pt-1"
        >
          {items.map((item) => (
            <SwiperSlide key={item.id} className={slideClass} style={slideStyle}>
              {renderItem(item)}
            </SwiperSlide>
          ))}

          <SwiperSlide className={slideClass} style={slideStyle}>
            <Link
              href={showAllHref}
              className="flex h-full min-h-[176px] flex-col items-center justify-center gap-3 rounded-2xl border border-ruby-100 bg-ruby-50 p-5 text-center text-ruby-700 transition hover:bg-ruby-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/50"
            >
              <span className="grid size-11 place-items-center rounded-full bg-ruby-500 text-white">
                <ArrowRight size={20} />
              </span>
              <span className="text-sm font-semibold">{seeAllLabel}</span>
            </Link>
          </SwiperSlide>
        </Swiper>
      )}
    </section>
  );
}