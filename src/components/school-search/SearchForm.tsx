"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import {
  BUDGETS,
  COUNTRIES,
  FIELDS,
  INSTITUTION_TYPES,
  LEVELS,
  RESULT_COUNTS,
} from "@/lib/school-search/constants";
import type { SearchFilters } from "@/lib/school-search/types";

type Option = { value: string; label: string };

const fromList = (list: readonly string[]): Option[] =>
  list.map((v) => ({ value: v, label: v }));

const COUNTRY_OPTIONS = fromList(COUNTRIES);
const TYPE_OPTIONS = fromList(INSTITUTION_TYPES);
const LEVEL_OPTIONS = fromList(LEVELS);
const FIELD_OPTIONS = fromList(FIELDS);
const BUDGET_OPTIONS: Option[] = BUDGETS.map((b) => ({ value: b.value, label: b.label }));
const COUNT_OPTIONS: Option[] = RESULT_COUNTS.map((n) => ({
  value: String(n),
  label: `${n} schools`,
}));

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-ink focus:border-ruby focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby/25"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type Props = {
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function SearchForm({ value, onChange, onSubmit, loading }: Props) {
  const set = <K extends keyof SearchFilters>(key: K, next: SearchFilters[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5"
    >
      <Select label="Country" value={value.country} options={COUNTRY_OPTIONS} onChange={(v) => set("country", v)} />
      <Select label="Institution type" value={value.institutionType} options={TYPE_OPTIONS} onChange={(v) => set("institutionType", v)} />
      <Select label="Study level" value={value.level} options={LEVEL_OPTIONS} onChange={(v) => set("level", v)} />
      <Select label="Field of study" value={value.field} options={FIELD_OPTIONS} onChange={(v) => set("field", v)} />
      <Select label="Yearly budget" value={value.budget} options={BUDGET_OPTIONS} onChange={(v) => set("budget", v)} />
      <Select label="Number of schools" value={String(value.count)} options={COUNT_OPTIONS} onChange={(v) => set("count", Number(v))} />

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ruby px-6 text-sm font-semibold text-white transition-colors hover:bg-ruby-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
            />
            Searching…
          </>
        ) : (
          <>
            <Search className="h-4 w-4" aria-hidden="true" />
            Search schools
          </>
        )}
      </button>
    </form>
  );
}
