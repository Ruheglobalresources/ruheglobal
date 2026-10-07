// src/components/institutions/detail/ui.ts
// The page's "solid" look in one place: flat white cards with a hairline border and a
// 1dp Material shadow, a small corner radius, and two button styles
// (primary = ruby fill, secondary = white with a ruby outline).
// Change the radius or shadow here and the whole institution page follows.
import { cn } from "@/lib/utils";

export const card =
  "rounded-md border border-ink/15 bg-white shadow-[0_1px_3px_rgba(16,27,45,0.10),0_1px_2px_rgba(16,27,45,0.06)]";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby/40 focus-visible:ring-offset-1";

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base", // the big "View courses" buttons
} as const;

const kinds = {
  primary: "bg-ruby text-white shadow-sm hover:bg-ruby-800",
  secondary: "border border-ruby bg-white text-ruby hover:bg-ruby-50",
} as const;

export function btn(kind: keyof typeof kinds, size: keyof typeof sizes = "md") {
  return cn(base, sizes[size], kinds[kind]);
}