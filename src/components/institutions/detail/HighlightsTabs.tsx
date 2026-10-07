"use client";

// src/components/institutions/detail/HighlightsTabs.tsx
// Overview / Student life / Accommodation / Library / Sports as small tabs.
// The page only passes tabs that have text, so there is never an empty tab.
import { useState } from "react";
import { cn } from "@/lib/utils";
import { paragraphs } from "@/lib/institution-format";

export type HighlightItem = { id: string; label: string; text: string };

export function HighlightsTabs({ items }: { items: HighlightItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const current = items.find((i) => i.id === active) ?? items[0];
  if (!current) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Highlights"
        className="flex overflow-x-auto border-b border-ink/10 px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            role="tab"
            id={`highlight-tab-${i.id}`}
            aria-selected={active === i.id}
            aria-controls={`highlight-panel-${i.id}`}
            onClick={() => setActive(i.id)}
            className={cn(
              "h-12 shrink-0 whitespace-nowrap border-b-2 px-4 text-sm font-semibold transition-colors",
              active === i.id ? "border-ruby text-ruby" : "border-transparent text-ink/60 hover:text-ink"
            )}
          >
            {i.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`highlight-panel-${current.id}`}
        aria-labelledby={`highlight-tab-${current.id}`}
        className="space-y-4 p-5"
      >
        {paragraphs(current.text).map((p, idx) => (
          <p key={idx} className="whitespace-pre-line text-base leading-7 text-ink/75">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}