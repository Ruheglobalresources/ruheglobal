// src/components/portal/chat-utils.tsx
// Small helpers shared by the staff chat panel.
import type { ChatMessage } from "@/lib/chat-service";
import { cn } from "@/lib/utils";

// Union by id, oldest first. Fresh copies win so read receipts update.
export function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const byId = new Map<string, ChatMessage>();
  for (const m of current) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

export function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

// "12:40" today, "Yesterday", or "3 Oct" for the inbox list
export function listTimeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return timeLabel(iso);
  return dayLabel(iso);
}

export const isImage = (url: string) => /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(url);

export function Avatar({ name, image, className }: { name: string | null; image: string | null; className?: string }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-ruby-50 font-semibold text-ruby-700", className)}>
      {(name ?? "R").charAt(0).toUpperCase()}
    </span>
  );
}

export const ROLE_LABELS = { USER: "Applicant", COUNSELOR: "Counselor", ADMIN: "Admin" } as const;