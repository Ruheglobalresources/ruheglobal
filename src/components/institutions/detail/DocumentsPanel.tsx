"use client";

// src/components/institutions/detail/DocumentsPanel.tsx
// Required documents: a study-level toggle (only when there is more than one level)
// and one checklist box per category (Identity, Academic, Financial, Visa...).
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocGroup } from "@/lib/institution-format";

export function DocumentsPanel({ groups }: { groups: DocGroup[] }) {
  const [active, setActive] = useState(groups[0]?.level ?? "");
  const current = groups.find((g) => g.level === active) ?? groups[0];
  if (!current) return null;

  return (
    <div>
      {groups.length > 1 && (
        <div role="tablist" aria-label="Study level" className="inline-flex overflow-hidden rounded-md border border-ruby">
          {groups.map((g) => (
            <button
              key={g.level}
              type="button"
              role="tab"
              aria-selected={active === g.level}
              onClick={() => setActive(g.level)}
              className={cn(
                "h-10 px-6 text-sm font-semibold transition-colors",
                active === g.level ? "bg-ruby text-white" : "bg-white text-ruby hover:bg-ruby-50"
              )}
            >
              {g.level}
            </button>
          ))}
        </div>
      )}

      <div className={cn("grid gap-4 sm:grid-cols-2", groups.length > 1 && "mt-4")}>
        {current.categories.map((cat) => (
          <div key={cat.name} className="overflow-hidden rounded-md border border-ink/15">
            <h3 className="border-b border-ink/10 bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink/60">
              {cat.name}
            </h3>
            <ul className="space-y-2 p-4">
              {cat.items.map((name, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-6 text-ink/80">
                  <Check size={17} className="mt-0.5 shrink-0 text-ruby" />
                  <span>{name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-ink/55">
        General checklist. Your counsellor will confirm exactly what this institution needs.
      </p>
    </div>
  );
}