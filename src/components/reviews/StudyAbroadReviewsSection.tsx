// src/components/reviews/StudyAbroadReviewsSection.tsx
"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { STUDY_ABROAD_REVIEWS } from "@/constants/reviews";
import { GoogleIcon } from "./GoogleIcon";

const TINTS = ["bg-teal/20 text-teal", "bg-ruby-500/20 text-ruby-600", "bg-ember/20 text-ember"];

const avgRating = (
  STUDY_ABROAD_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / STUDY_ABROAD_REVIEWS.length
).toFixed(1);

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StarRow({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "fill-ember text-ember" : "fill-ink/10 text-ink/10"}
        />
      ))}
    </div>
  );
}

export function StudyAbroadReviewsSection() {
  return (
    <section className="overflow-hidden bg-ink py-16 text-cloud sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:items-center lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cloud/40">
              Study abroad clients
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
              What Our Students
              <br className="hidden sm:block" />
              <span className="italic text-ruby-200"> Are Saying</span>
            </h2>

            <div className="mt-6 inline-flex flex-col gap-2 rounded-2xl bg-cloud/5 p-5 ring-1 ring-cloud/10">
              <span className="text-xs font-semibold uppercase tracking-wide text-cloud/50">
                Excellent
              </span>
              <StarRow rating={5} />
              <p className="text-sm text-cloud/70">
                <span className="font-semibold text-cloud">{avgRating}</span> based on{" "}
                {STUDY_ABROAD_REVIEWS.length}+ reviews
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <GoogleIcon className="h-4 w-4" />
                <span className="text-xs text-cloud/50">Google Reviews</span>
              </div>
            </div>
          </motion.div>

          {/* min-w-0 is the fix: without it, this grid item refuses to shrink
              below the swiper's un-clipped content width on mobile */}
          <div className="min-w-0 lg:-mr-10">
            <Swiper
              modules={[Autoplay, FreeMode]}
              slidesPerView="auto"
              spaceBetween={20}
              loop
              freeMode={{ enabled: true, momentum: false }}
              speed={9000}
              autoplay={{
                delay: 1,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
              }}
              grabCursor
              className="min-w-0"
            >
              {STUDY_ABROAD_REVIEWS.map((review, i) => (
                <SwiperSlide
                  key={review.id}
                  className="aspect-square w-[300px] sm:w-[360px]"
                >
                  <div className="flex h-full flex-col rounded-2xl bg-cloud p-6 text-ink shadow-sm ring-1 ring-cloud/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ${
                            TINTS[i % TINTS.length]
                          }`}
                        >
                          {initials(review.name)}
                        </div>
                        <div>
                          <p className="text-base font-semibold text-ink">{review.name}</p>
                          <p className="text-sm text-ink/50">{review.date}</p>
                        </div>
                      </div>
                      <GoogleIcon className="h-5 w-5 shrink-0" />
                    </div>

                    <StarRow rating={review.rating} className="mt-4" />
                    <p className="mt-3 flex-1 line-clamp-6 text-sm leading-relaxed text-ink/70 sm:text-[15px]">
                      {review.text}
                    </p>
                    <span className="mt-4 inline-block w-fit rounded-full bg-ink/5 px-3 py-1.5 text-xs font-medium text-ink/60">
                      {review.tag}
                    </span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}