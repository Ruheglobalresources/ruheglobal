"use client";

// src/components/profile/subject-picker.tsx
// "Profile subjects": search the suggestion list or type your own, chosen subjects show as
// removable chips. Used by the Preferences tab and by the last onboarding step.
import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { MAX_SUBJECTS, SUBJECT_SUGGESTIONS } from "@/constants/profile-options";
import { cn } from "@/lib/utils";

export function SubjectPicker({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  error?: string | null;
}) {
  const [query, setQuery] = useState("");
  const full = value.length >= MAX_SUBJECTS;
  const q = query.trim();

  const has = (s: string) => value.some((v) => v.toLowerCase() === s.toLowerCase());

  const matches = useMemo(() => {
    const needle = q.toLowerCase();
    return SUBJECT_SUGGESTIONS.filter((s) => !has(s) && (!needle || s.toLowerCase().includes(needle))).slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, value]);

  const add = (subject: string) => {
    const s = subject.trim();
    if (s.length < 2 || has(s) || full) return;
    onChange([...value, s]);
    setQuery("");
  };

  const canAddCustom = q.length >= 2 && !has(q) && !SUBJECT_SUGGESTIONS.some((s) => s.toLowerCase() === q.toLowerCase());

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-full border bg-white px-4 transition",
          "focus-within:border-ruby-500 focus-within:ring-2 focus-within:ring-ruby-500/20",
          error ? "border-ruby-500" : "border-ink/15"
        )}
      >
        <Search size={18} className="shrink-0 text-ink/40" />
        <input
          type="text"
          value={query}
          disabled={full}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(matches[0] && !canAddCustom ? matches[0] : q);
            }
          }}
          placeholder={full ? `You can choose up to ${MAX_SUBJECTS} subjects` : "Search subjects"}
          aria-label="Search subjects"
          className="h-12 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/35 disabled:cursor-not-allowed"
        />
      </div>

      {error && (
        <p role="alert" className="mt-1 px-1 text-xs text-ruby-600">
          {error}
        </p>
      )}

      {!full && (matches.length > 0 || canAddCustom) && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Suggested subjects">
          {matches.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => add(s)}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-ink/15 bg-white px-3 text-sm text-ink/80 transition hover:border-ruby-300 hover:bg-ruby-50 hover:text-ruby-700"
              >
                <Plus size={14} /> {s}
              </button>
            </li>
          ))}
          {canAddCustom && (
            <li>
              <button
                type="button"
                onClick={() => add(q)}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed border-ruby-300 bg-ruby-50 px-3 text-sm font-medium text-ruby-700 transition hover:bg-ruby-100"
              >
                <Plus size={14} /> Add &ldquo;{q}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}

      {value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Chosen subjects">
          {value.map((s) => (
            <li
              key={s}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ruby-50 pl-3.5 pr-2 text-sm font-medium text-ruby-700"
            >
              {s}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== s))}
                aria-label={`Remove ${s}`}
                className="grid size-5 place-items-center rounded-full text-ruby-600 transition hover:bg-ruby-200"
              >
                <X size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}