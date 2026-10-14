"use client";

// src/components/step-flow/card-select.tsx
// Choices as cards: the name, a short plain-words line under it and an optional emoji. Used for
// "What do you want to do abroad?" and for the visa types, where a bare name means little.
// Single choice by default; `multiple` lets several be picked, up to `max`.
import type { OptionNotes } from "@/lib/eligibility";
import { cn } from "@/lib/utils";

type CardSelectProps = {
  options: string[];
  notes?: OptionNotes;
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  max?: number | null;
};

export function CardSelect({ options, notes = {}, value, onChange, multiple = false, max }: CardSelectProps) {
  const atMax = multiple && !!max && value.length >= max;

  const toggle = (option: string) => {
    if (!multiple) {
      onChange([option]);
      return;
    }
    if (value.includes(option)) onChange(value.filter((v) => v !== option));
    else if (!atMax) onChange([...value, option]);
  };

  return (
    <div role={multiple ? "group" : "radiogroup"} className="grid gap-3">
      {options.map((option) => {
        const selected = value.includes(option);
        const blocked = atMax && !selected;
        const note = notes[option];
        return (
          <button
            key={option}
            type="button"
            role={multiple ? undefined : "radio"}
            aria-checked={multiple ? undefined : selected}
            aria-pressed={multiple ? selected : undefined}
            disabled={blocked}
            onClick={() => toggle(option)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl px-5 py-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-ruby-500/50",
              selected ? "bg-ruby-50 ring-2 ring-ruby-500" : "bg-neutral-100 hover:bg-neutral-200",
              blocked && "cursor-not-allowed opacity-40 hover:bg-neutral-100"
            )}
          >
            {note?.emoji && (
              <span className="text-2xl leading-none" aria-hidden="true">
                {note.emoji}
              </span>
            )}
            <span className="min-w-0">
              <span className={cn("block text-[15px] font-semibold", selected ? "text-ruby-700" : "text-ink")}>
                {note?.title ?? option}
              </span>
              {note?.description && <span className="mt-0.5 block text-sm text-neutral-500">{note.description}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}