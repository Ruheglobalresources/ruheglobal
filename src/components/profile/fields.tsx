"use client";

// src/components/profile/fields.tsx
// The form controls of the profile page and the onboarding modal, in the RGR look: a
// white rounded box with a small label on top and the value underneath.
// Selects are the browser's native <select>: they open the phone's own picker, work
// inside the Vaul drawer without focus fights, and handle ~200 countries without lag.
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FieldShell({
  label,
  htmlFor,
  hint,
  error,
  readOnly,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  readOnly?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className={cn(
          "relative block rounded-xl border px-3.5 pb-1.5 pt-2 transition",
          "focus-within:border-ruby-500 focus-within:ring-2 focus-within:ring-ruby-500/20",
          error ? "border-ruby-500" : "border-ink/15",
          readOnly ? "bg-neutral-50" : "bg-white"
        )}
      >
        <span className="block text-[11px] font-medium text-ink/50">{label}</span>
        {children}
      </label>
      {error ? (
        <p role="alert" className="mt-1 px-1 text-xs text-ruby-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 px-1 text-xs text-ink/50">{hint}</p>
      ) : null}
    </div>
  );
}

const control =
  "block w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink/30 disabled:cursor-not-allowed disabled:text-ink/60";

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "tel" | "date" | "email";
  placeholder?: string;
  hint?: string;
  error?: string | null;
  readOnly?: boolean;
  max?: string;
  min?: string;
  autoComplete?: string;
  className?: string;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  error,
  readOnly,
  max,
  min,
  autoComplete,
  className,
}: TextFieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} readOnly={readOnly} className={className}>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        max={max}
        min={min}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        // 16px on phones stops iOS from zooming the page when the field gets focus
        className={cn(control, "h-7")}
      />
    </FieldShell>
  );
}

export type SelectOption = string | { value: string; label: string };

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  hint,
  error,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string | null;
  className?: string;
}) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} className={className}>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(control, "h-7 cursor-pointer appearance-none pr-6", !value && "text-ink/40")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return (
            <option key={v} value={v} className="text-ink">
              {l}
            </option>
          );
        })}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
    </FieldShell>
  );
}