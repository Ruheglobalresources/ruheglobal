"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Calendar, Award, Plus, Check, ArrowUpRight } from "lucide-react";
import type { School } from "@/constants/schools";

export function SchoolCard({
  school,
  index,
  onApply,
  onSave,
}: {
  school: School;
  index: number;
  onApply: (school: School) => void;
  onSave?: (school: School) => void;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved((s) => !s);
    onSave?.(school);
  };

  const secondaryStat = school.acceptanceRate
    ? { label: "Acceptance", value: school.acceptanceRate }
    : { label: "Programs", value: String(school.programs.length) };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl bg-cloud shadow-sm ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-lg sm:w-[300px]"
    >
      {/* image */}
      <div className="relative h-44 w-full overflow-hidden sm:h-52">
        <Image
          src={school.image}
          alt={`${school.name} campus, ${school.city}`}
          fill
          draggable={false}
          className="pointer-events-none object-cover"
          sizes="(max-width: 640px) 260px, 300px"
        />

        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium text-cloud backdrop-blur-sm">
          {school.country}
        </span>

        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? "Remove from shortlist" : "Add to shortlist"}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink/50 text-cloud backdrop-blur-sm transition-colors hover:bg-ink/70"
        >
          {saved ? <Check size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {/* body */}
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {school.city}
          </span>
          {school.founded && (
            <span className="flex items-center  gap-1">
              <Calendar size={12} />
              Est. {school.founded}
            </span>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-lg text-ink">{school.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs italic text-ink/60">{school.description}</p>

        <div className="mt-4 border-t border-ink/10 pt-3">
          {school.tuitionFrom && (
            <p className="text-xs text-ink/70">
              <span className="text-ink/50">Tuition</span>{" "}
              <span className="font-semibold text-ink">
                ${school.tuitionFrom.toLocaleString()}/yr
              </span>
              <span className="mx-1.5 text-ink/30">|</span>
              <span className="text-ink/50">{secondaryStat.label}</span>{" "}
              <span className="font-semibold text-ink">{secondaryStat.value}</span>
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