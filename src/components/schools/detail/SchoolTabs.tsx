"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type SchoolTab = { id: string; label: string };

/**
 * Sticky section nav. Clicking a tab scrolls to that section, and the active
 * tab follows the reader as they scroll. On small screens the strip scrolls
 * sideways and keeps the active tab centred, like a breadcrumb trail.
 * The site navbar is fixed and hides on scroll down / shows on scroll up.
 * It publishes --nav-offset (its height while showing, 0px while hidden), so
 * this bar sits directly under the navbar when it is showing and moves up to
 * the top of the viewport when the navbar hides.
 *
 * Used by the school page (defaults) and the institution page
 * (ariaLabel="Institution sections" + compact).
 */
export function SchoolTabs({
  tabs,
  ariaLabel = "School sections",
  compact = false,
}: {
  tabs: SchoolTab[];
  ariaLabel?: string;
  compact?: boolean;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const barRef = useRef<HTMLElement>(null);
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

    // Land the section heading just below whatever bars will be on screen when
    // the scroll finishes. Going down hides the navbar (only the tabs bar
    // remains); going up shows it (navbar + tabs bar). scrollIntoView can't be
    // used here: it works out its landing spot before the navbar has moved.
    const navHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) || 0;
    const barHeight = barRef.current?.offsetHeight ?? 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    const goingUp = targetTop < window.scrollY;
    const offset = barHeight + (goingUp ? navHeight : 0) + 8;

    window.scrollTo({ top: Math.max(targetTop - offset, 0), behavior: "smooth" });
    window.setTimeout(() => (locked.current = false), 900);
  };

  return (
    <nav
      ref={barRef}
      aria-label={ariaLabel}
      className="sticky top-[var(--nav-offset,0px)] z-20 border-b border-ink/10 bg-white/95 backdrop-blur transition-[top] duration-300 ease-out motion-reduce:transition-none"
    >
      <div
        ref={stripRef}
        className={cn(
          "relative mx-auto flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          compact ? "max-w-6xl px-1 sm:px-4 lg:px-6" : "max-w-7xl px-2 sm:px-8 lg:justify-center"
        )}
      >
        {tabs.map((t) => (
          <a key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            href={`#${t.id}`}
            onClick={(e) => go(e, t.id)}
            aria-current={active === t.id ? "true" : undefined}
            className={cn(
              "flex shrink-0 items-center whitespace-nowrap border-b-2 text-sm font-medium transition-colors",
              compact ? "h-10 px-3.5 lg:px-5" : "h-14 px-4 lg:px-6",
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