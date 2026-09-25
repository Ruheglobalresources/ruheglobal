"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { INSTITUTIONS, FIELDS } from "@/lib/school-search/constants";

// Deliberately violet-bordered — every other accent in the nav (teal
// headings, ember hovers, ruby CTAs) is already spoken for, so violet is
// what visually says "this one's the AI feature" the moment you see it.
export function AiCourseSearchBox({ id }: { id?: string }) {
  const router = useRouter();
  const inputId = useId();
  const listId = `ai-course-search-options-${id ?? inputId}`;
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (!query) {
      router.push("/school-search");
      return;
    }

    const matchedInstitution = INSTITUTIONS.find(
      (name) => name.toLowerCase() === query.toLowerCase()
    );
    const matchedField = FIELDS.find(
      (field) => field.toLowerCase() === query.toLowerCase()
    );

    if (matchedInstitution) {
      router.push(`/school-search?institution=${encodeURIComponent(matchedInstitution)}`);
    } else if (matchedField) {
      router.push(`/school-search?field=${encodeURIComponent(matchedField)}`);
    } else {
      // No exact match yet — still land them on the search page rather
      // than dead-ending on a typo.
      router.push("/school-search");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-full border-2 border-violet bg-white px-4 py-2.5 transition-colors focus-within:border-violet focus-within:ring-2 focus-within:ring-violet/25">
        <Sparkles size={15} className="shrink-0 text-violet" aria-hidden="true" />
        <input
          id={inputId}
          list={listId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search a course or institution…"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
        />
        <datalist id={listId}>
          {INSTITUTIONS.filter((n) => n !== "Any institution").map((name) => (
            <option key={name} value={name} />
          ))}
          {FIELDS.filter((f) => f !== "Any field").map((field) => (
            <option key={field} value={field} />
          ))}
        </datalist>
      </div>
      <button
        type="submit"
        aria-label="Search"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet text-white transition-colors hover:bg-violet/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet/40"
      >
        <Search size={16} />
      </button>
    </form>
  );
}
