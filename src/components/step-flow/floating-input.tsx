"use client";

// src/components/step-flow/floating-input.tsx
// A text box whose label sits inside the border and shrinks to the top once there is something typed.
import { useId } from "react";
import { cn } from "@/lib/utils";

type FloatingInputProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  type?: "text" | "email" | "tel" | "date";
  inputMode?: "text" | "decimal" | "numeric" | "email" | "tel";
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  error?: string | null;
  disabled?: boolean;
};

const box =
  "peer w-full rounded-xl border bg-white px-3 pb-1.5 pt-6 text-[16px] text-ink outline-none transition focus:ring-2 disabled:bg-neutral-50";

export function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  required,
  multiline,
  maxLength,
  error,
  disabled,
}: FloatingInputProps) {
  const id = useId();
  const tone = error
    ? "border-ruby-500 focus:border-ruby-500 focus:ring-ruby-500/20"
    : "border-neutral-300 focus:border-ruby-500 focus:ring-ruby-500/20";

  return (
    <div>
      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            value={value}
            placeholder=" "
            maxLength={maxLength}
            disabled={disabled}
            rows={4}
            onChange={(e) => onChange(e.target.value)}
            className={cn(box, tone, "resize-none")}
          />
        ) : (
          <input
            id={id}
            type={type}
            inputMode={inputMode}
            value={value}
            placeholder=" "
            maxLength={maxLength}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={cn(box, tone, "h-14")}
          />
        )}
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-2 text-[11px] text-neutral-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[15px] peer-focus:top-2 peer-focus:text-[11px]"
        >
          {label}
          {required ? " *" : ""}
        </label>
      </div>
      {error && <p className="mt-1 px-1 text-xs text-ruby-600">{error}</p>}
    </div>
  );
}