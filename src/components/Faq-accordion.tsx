"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

/**
 * Simple single-open accordion for FAQ sections. No accordion package is
 * installed in this project, so this is a small self-contained client
 * component (CSS grid-rows trick for the height transition — no JS height
 * measurement needed).
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-ink/10 overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-base font-semibold text-ink sm:text-lg">
                {item.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-ember transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5 text-[0.95rem] leading-relaxed text-ink/70 sm:text-base">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FaqAccordion;