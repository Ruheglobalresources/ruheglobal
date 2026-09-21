"use client";

import { Check, Loader2, CloudOff, RefreshCw } from "lucide-react";
import type { AutosaveState } from "./types";

interface AutosaveStatusProps {
  state: AutosaveState;
  savedAt: Date | null;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function AutosaveStatus({ state, savedAt }: AutosaveStatusProps) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        <Loader2 size={12} className="animate-spin" /> Saving...
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-ruby)]">
        <CloudOff size={12} /> Couldn't save — try again
      </span>
    );
  }

  if (state === "saved" && savedAt) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--color-teal)]">
        <Check size={12} /> Saved at {formatTime(savedAt)}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
      <RefreshCw size={12} /> Autosave on
    </span>
  );
}