// src/components/dashboard/styles.ts
// Material Design 3 flavoured building blocks for the dashboard, in Tailwind
// classes. Primary colour is ruby-500, surfaces are white with a hairline border
// and a soft elevation instead of a grey page background.
export const elevation1 = "shadow-[0_1px_2px_rgba(16,27,45,0.08),0_1px_3px_1px_rgba(16,27,45,0.05)]";
// Written out in full (with the hover: prefix) so Tailwind can see the class.
export const elevation2Hover =
  "hover:shadow-[0_1px_2px_rgba(16,27,45,0.10),0_2px_6px_2px_rgba(16,27,45,0.08)]";

// Filled button (Material "filled"): ruby pill, white label.
export const filledButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ruby-500 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-ruby-600 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/50 focus-visible:ring-offset-2";

// Text button (Material "text"): ruby label, tonal hover.
export const textButton =
  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-ruby-600 transition hover:bg-ruby-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/40";

// Outlined button (Material "outlined").
export const outlinedButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-ruby-200 bg-white px-5 text-sm font-semibold text-ruby-600 transition hover:bg-ruby-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/40";
