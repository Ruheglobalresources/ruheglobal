"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COUNTRIES, SCHOOLS } from "@/constants/schools";
import { AiCourseSearchBox } from "./AiCourseSearchBox";

const SCHOOLS_PER_COUNTRY = 3;

export function SchoolsMegaPanel({ onNavigate }: { onNavigate: () => void }) {
  const [activeCountry, setActiveCountry] = useState(COUNTRIES[0].name);

  const schools = useMemo(
    () =>
      SCHOOLS.filter((school) => school.country === activeCountry).slice(
        0,
        SCHOOLS_PER_COUNTRY
      ),
    [activeCountry]
  );

  return (
    <div className="w-full py-1">
      <div className="border-b border-ink/12 px-6 py-5">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
          <span className="block h-3 w-3 bg-violet" />
          Search by course or institution
        </p>
        <div className="max-w-md">
          <AiCourseSearchBox id="schools-mega" />
        </div>
      </div>

      <div className="flex divide-x divide-ink/12 border-b border-ink/12">
        {COUNTRIES.map((country) => {
          const active = country.name === activeCountry;
          return (
            <button
              key={country.name}
              type="button"
              onMouseEnter={() => setActiveCountry(country.name)}
              onClick={() => setActiveCountry(country.name)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold transition-colors focus:outline-none ${
                active ? "bg-ink text-cloud" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <span>{country.flag}</span>
              {country.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 divide-x divide-ink/12">
        {schools.map((school) => (
          <Link
            key={school.id}
            href={`/school-search?school=${school.id}`}
            onClick={onNavigate}
            className="group flex flex-col transition-colors hover:bg-ink/5"
          >
            <div className="relative h-32 w-full overflow-hidden border-b border-ink/12">
              <Image
                src={school.image}
                alt={`${school.name} campus, ${school.city}`}
                fill
                draggable={false}
                sizes="300px"
                className="object-cover"
              />
              {school.ranking && (
                <span className="absolute left-0 top-0 max-w-[90%] truncate bg-ember px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                  {school.ranking}
                </span>
              )}
            </div>
            <div className="px-3 py-3">
              <p className="line-clamp-1 text-sm font-semibold text-ink">{school.name}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-ink/55">{school.city}</p>
            </div>
          </Link>
        ))}

        <Link
          href="/search"
          onClick={onNavigate}
          className="flex flex-col items-center justify-center gap-1.5 bg-ink px-2 py-4 text-cloud transition-colors hover:bg-ink/90"
        >
          <ArrowRight size={18} />
          <span className="text-center text-[11px] font-semibold leading-tight">
            View all schools
          </span>
        </Link>
      </div>
    </div>
  );
}