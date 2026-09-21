"use client";

import Image from "next/image";
import { useState } from "react";
import { COUNTRIES, type Country } from "@/data/countries";

/* -------------------------------------------------------------------------- */
/*  "Our Experience Defines Our Identity" — countries strip                    */
/*                                                                            */
/*  A single bordered grid, 6 desktop cols · 3 tablet · 2 mobile, each cell    */
/*  sharing borders with its neighbours (grid-line collapse via border-r/b     */
/*  on cells + border-t/l on the container — no doubled-up borders).          */
/* -------------------------------------------------------------------------- */

const MARIGOLD = "#f87509";

function FlagBadge({ country }: { country: Country }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 ring-1 ring-inset ring-black/5 sm:h-[4.5rem] sm:w-[4.5rem]">
      {failed ? (
        <span className="text-[10px] font-medium uppercase text-neutral-400">
          {country.id}
        </span>
      ) : (
        <Image
          src={country.flagSrc}
          alt={`Flag of ${country.name}`}
          fill
          sizes="72px"
          onError={() => setFailed(true)}
          className="object-cover"
        />
      )}
    </span>
  );
}

function CountryCell({ country }: { country: Country }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-neutral-200 bg-ruby-50 px-4 py-10 transition-colors duration-300 hover:border-neutral-300 sm:px-6 sm:py-12">
      <div className="flex w-full items-center justify-center gap-3 sm:gap-4">
        <span aria-hidden="true" className="h-0 flex-1 border-t border-dashed border-neutral-300" />
        <FlagBadge country={country} />
        <span aria-hidden="true" className="h-0 flex-1 border-t border-dashed border-neutral-300" />
      </div>
      <p className="mt-5 max-w-[9ch] text-center text-lg leading-snug text-neutral-800 sm:text-xl">
        {country.name}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function CountriesSection({
  countries = COUNTRIES,
  eyebrow = "Countries",
  titleLine = "Guided By Experts",
}: {
  countries?: Country[];
  eyebrow?: string;
  titleLine?: string;
}) {
  return (
    <section aria-labelledby="countries-heading" className="w-full bg-white py-10 lg:py-15">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <header className="mx-auto max-w-2xl text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.25em]"
          >
            {eyebrow}
          </p>
          <h2 id="countries-heading"
            className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-[44px]" >
            Guided By Experts
          </h2>
        </header>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-16 lg:grid-cols-6">
          {countries.map((country) => (
            <CountryCell key={country.id} country={country} />
          ))}
        </div>
      </div>
    </section>
  );
}