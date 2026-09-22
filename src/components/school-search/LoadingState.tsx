"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Finding schools that match your search…",
  "Checking IELTS requirements…",
  "Looking up tuition fees…",
  "Putting your list together…",
];

export function LoadingState({ onCancel }: { onCancel: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5"
    >
      <span
        aria-hidden="true"
        className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-ruby/25 border-t-ruby motion-reduce:animate-none"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{STEPS[step]}</p>
        <p className="text-sm text-ink/60">This can take up to a minute.</p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 transition-colors hover:border-ink/30 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby/40"
      >
        Cancel
      </button>
    </div>
  );
}
