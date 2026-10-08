// src/components/portal/status-pill.tsx
// Status badge for applicants (the admin has its own in components/admin/status-badge.tsx).
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/constants/submission-status";

const STYLES: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-[color:var(--color-teal)]/15 text-[color:var(--color-teal)]",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[status] ?? "bg-neutral-100 text-neutral-600"
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}