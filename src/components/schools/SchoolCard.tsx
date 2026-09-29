"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { MapPin, Calendar, Award, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

// Same shape the detail page feeds into MorphFrame (url + altText).
export type SchoolGalleryImage = { url: string; altText: string | null };

// The shape the homepage passes down after reading the School table.
export type TopSchool = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string; // matches a name in COUNTRIES
  coverImage: string;
  coverImageAlt: string | null;
  gallery: SchoolGalleryImage[]; // the same gallery rows the detail page uses
  founded: number | null;
  ranking: string | null;
  tuitionFrom: number | null;
  tuitionTo: number | null;
  tuitionCurrency: string; // ISO 4217, e.g. GBP
  acceptanceRate: string | null;
  courseCount: number;
  description: string;
};

// Keeps the homepage light: a card never loads more than this many photos.
const MAX_SLIDES = 6;

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

export function SchoolCard({
  school,
  index,
  onApply,
}: {
  school: TopSchool;
  index: number;
  onApply: (school: TopSchool) => void;
}) {
  const router = useRouter();
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  const href = `/schools/${school.slug}`;

  // Cover first, then the gallery, with duplicates removed.
  // The guard keeps the card working if a school arrives without a gallery.
  const gallery = school.gallery ?? [];

  const slides = [{ url: school.coverImage, altText: school.coverImageAlt }, ...gallery]
    .filter((img, i, arr) => arr.findIndex((x) => x.url === img.url) === i)
    .slice(0, MAX_SLIDES);

  const hasMultipleSlides = slides.length > 1;

  const hasRange =
    school.tuitionFrom !== null && school.tuitionTo !== null && school.tuitionTo > school.tuitionFrom;

  const secondaryStat = school.acceptanceRate
    ? { label: "Acceptance", value: school.acceptanceRate }
    : school.courseCount > 0
      ? { label: "Programs", value: String(school.courseCount) }
      : null;

  const hasStats = school.tuitionFrom !== null || secondaryStat !== null;

  // Ignore clicks on the arrows, the dots and the apply button.
  const goToSchool = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-nav], .swiper-pagination")) return;
    router.push(href);
  };

  return (
    <motion.div
      role="link"
      tabIndex={0}
      aria-label={`View ${school.name}`}
      onClick={goToSchool}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target === e.currentTarget) router.push(href);
      }}
      onMouseEnter={() => router.prefetch(href)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group w-[260px] shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl bg-cloud shadow-sm ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-lg sm:w-[300px]"
    >
      {/* image gallery */}
      <div
        className="relative h-44 w-full overflow-hidden sm:h-52"
        // Stops the parent track from starting its own drag while you swipe photos.
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Swiper
          modules={[Pagination, Autoplay]}
          onSwiper={setSwiper}
          slidesPerView={1}
          spaceBetween={0}
          loop={hasMultipleSlides}
          autoplay={
            hasMultipleSlides ? { delay: 3500, disableOnInteraction: false } : false
          }
          pagination={{ clickable: true }}
          className="h-full w-full [--swiper-pagination-bullet-inactive-color:#fff] [--swiper-pagination-bullet-inactive-opacity:0.6] [--swiper-pagination-bullet-size:6px] [--swiper-pagination-color:#fff]"
        >
          {slides.map((img) => (
            <SwiperSlide key={img.url} className="relative">
              <Image
                src={img.url}
                alt={img.altText || `${school.name} campus, ${school.city}`}
                fill
                draggable={false}
                className="object-cover"
                sizes="(max-width: 640px) 260px, 300px"
                priority={false}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-cloud backdrop-blur-sm">
          {school.country}
        </span>

        {hasMultipleSlides && (
          <>
            <button
              type="button"
              data-no-nav
              aria-label="Previous photo"
              onClick={() => swiper?.slidePrev()}
              className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-cloud opacity-0 backdrop-blur-sm transition-opacity hover:bg-ink/70 group-hover:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              data-no-nav
              aria-label="Next photo"
              onClick={() => swiper?.slideNext()}
              className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-cloud opacity-0 backdrop-blur-sm transition-opacity hover:bg-ink/70 group-hover:opacity-100"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* body */}
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {school.city}
          </span>
          {school.founded && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Est. {school.founded}
            </span>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-lg text-ink">{school.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs italic text-ink/60">{school.description}</p>

        <div className="mt-4 border-t border-ink/10 pt-3">
          {hasStats && (
            <p className="text-xs text-ink/70">
              {school.tuitionFrom !== null && (
                <>
                  <span className="text-ink/50">{hasRange ? "Tuition from" : "Tuition"}</span>{" "}
                  <span className="font-semibold text-ink">
                    {formatMoney(school.tuitionFrom, school.tuitionCurrency)}/yr
                  </span>
                </>
              )}
              {school.tuitionFrom !== null && secondaryStat && (
                <span className="mx-1.5 text-ink/30">|</span>
              )}
              {secondaryStat && (
                <>
                  <span className="text-ink/50">{secondaryStat.label}</span>{" "}
                  <span className="font-semibold text-ink">{secondaryStat.value}</span>
                </>
              )}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            {school.ranking && (
              <span className="flex items-center gap-1 text-[11px] text-ink/60">
                <Award size={12} className="text-ruby/40" />
                {school.ranking}
              </span>
            )}
            <button
              type="button"
              data-no-nav
              onClick={() => onApply(school)}
              aria-label={`Get guidance for ${school.name}`}
              className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-ruby-500 text-cloud transition-colors hover:bg-ruby-600"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}