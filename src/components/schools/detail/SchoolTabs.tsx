"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SchoolTab = { id: string; label: string };

/**
 * Sticky section nav. Clicking a tab scrolls to that section, and the active
 * tab follows the reader as they scroll. On small screens the strip scrolls
 * sideways and keeps the active tab centred, like a breadcrumb trail.
 * The site navbar is absolutely positioned (it scrolls away), so this bar
 * sticks to the very top of the viewport.
 */
export function SchoolTabs({ tabs }: { tabs: SchoolTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const stripRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const locked = useRef(false);

  // scroll spy: a section is active while it crosses a band near the top
  useEffect(() => {
    const els = tabs
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);

    const io = new IntersectionObserver(
      (entries) => {
        if (locked.current) return;
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));

    // the last section is often too short to reach the band, so catch the page bottom
    const onScroll = () => {
      if (locked.current) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && tabs.length) setActive(tabs[tabs.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [tabs]);

  // keep the active tab in view inside the strip (only scrolls the strip, never the page)
  useEffect(() => {
    const tab = tabRefs.current[active];
    const strip = stripRef.current;
    if (!tab || !strip) return;
    strip.scrollTo({
      left: tab.offsetLeft - strip.clientWidth / 2 + tab.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [active]);

  const go = (e: React.MouseEvent, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    setActive(id);
    locked.current = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => (locked.current = false), 900);
  };

  return (
    <nav
      aria-label="School sections"
      className="sticky top-0 z-20 border-b border-ink/10 bg-white/95 backdrop-blur"
    >
      <div
        ref={stripRef}
        className="relative mx-auto flex max-w-7xl overflow-x-auto px-2 [scrollbar-width:none] sm:px-8 lg:justify-center [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) => (
          <a
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            href={`#${t.id}`}
            onClick={(e) => go(e, t.id)}
            aria-current={active === t.id ? "true" : undefined}
            className={cn(
              "flex h-14 shrink-0 items-center whitespace-nowrap border-b-2 px-4 text-sm font-medium transition-colors lg:px-6",
              active === t.id
                ? "border-ruby text-ruby"
                : "border-transparent text-ink/60 hover:text-ink"
            )}
          >
            {t.label}
          </a>
        ))}
      </div>
    </nav>
  );
}