"use client";

// src/components/dashboard/swipe-section.tsx
// A titled, swipeable strip of cards for the dashboard home (Swiper, the same
// library the reviews and school cards already use). Phones swipe with a finger,
// desktop drags with the mouse or uses the arrows. The last slide is a "See all"
// card, and "Show all" in the header goes to the full page.
import Link from "next/link";
import { useState } from "react";
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

// Slide width. Swiper's "auto" mode reads it from CSS, and ! beats Swiper's own width.
const slideWidth = "!h-auto !w-[78%] min-[480px]:!w-[17rem] lg:!w-[18.5rem]";

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

  const sync = (s: SwiperType) =>
    setEdges((prev) => (prev.start === s.isBeginning && prev.end === s.isEnd ? prev : { start: s.isBeginning, end: s.isEnd }));

  const { items, status, error, retry } = list;

  return (
    <section>
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
            onClick={() => swiper?.slidePrev()}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next"
            className={arrowButton}
            disabled={!swiper || edges.end}
            onClick={() => swiper?.slideNext()}
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
            <div key={i} className={cn("shrink-0", "w-[78%] min-[480px]:w-[17rem] lg:w-[18.5rem]")}>
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
          modules={[FreeMode]}
          freeMode={{ enabled: true, momentumRatio: 0.6 }}
          slidesPerView="auto"
          spaceBetween={16}
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
            <SwiperSlide key={item.id} className={slideWidth}>
              {renderItem(item)}
            </SwiperSlide>
          ))}

          <SwiperSlide className={slideWidth}>
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