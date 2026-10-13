"use client";

// src/components/step-flow/pill-select.tsx
// Choices as tap-able pills. Single choice by default; `multiple` lets several be picked, up to `max`.
import { cn } from "@/lib/utils";

type PillSelectProps = {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  max?: number | null;
  disabled?: boolean;
  className?: string;
};

export function PillSelect({ options, value, onChange, multiple = false, max, disabled, className }: PillSelectProps) {
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
    <div role={multiple ? "group" : "radiogroup"} className={cn("flex flex-wrap gap-3", className)}>
      {options.map((option) => {
        const selected = value.includes(option);
        const blocked = disabled || (atMax && !selected);
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
              "rounded-full px-5 py-3 text-[15px] font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ruby-500/50",
              selected
                ? "bg-ruby-50 text-ruby-700 ring-2 ring-ruby-500"
                : "bg-neutral-100 text-ink hover:bg-neutral-200",
              blocked && !selected && "cursor-not-allowed opacity-40 hover:bg-neutral-100"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}