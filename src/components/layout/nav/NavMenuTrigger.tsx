"use client";

import { ChevronDown } from "lucide-react";

type NavMenuTriggerProps = {
  label: string;
  active: boolean;
  onOpen: () => void;
  onToggle: () => void;
};

// A stateless trigger button. It no longer owns a panel or open/close
// timers itself, that logic now lives once in Navbar.tsx so every trigger
// shares a single full width panel instead of each one floating its own
// card under itself. Replaces the old NavPopover.tsx, delete that file.
export function NavMenuTrigger({ label, active, onOpen, onToggle }: NavMenuTriggerProps) {
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onToggle}
      aria-expanded={active}
      className="flex items-center gap-1 text-sm font-medium text-ink/80 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
    >
      {label}
      <ChevronDown
        size={14}
        className={`transition-transform duration-200 ${active ? "rotate-180" : ""}`}
      />
    </button>
  );
}