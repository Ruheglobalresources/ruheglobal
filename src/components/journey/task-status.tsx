// src/components/journey/task-status.tsx
// The small status badge of a task, used by the task card, the task page and the admin review.
import { cn } from "@/lib/utils";
import type { TaskStateValue } from "@/lib/journey/types";

export const TASK_STATE_LABELS: Record<TaskStateValue, string> = {
  NOT_STARTED: "Not added",
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  VERIFIED: "Verified",
  CHANGES_REQUESTED: "Changes needed",
};

const STYLES: Record<TaskStateValue, string> = {
  NOT_STARTED: "bg-neutral-100 text-neutral-500",
  DRAFT: "bg-amber-100 text-amber-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  VERIFIED: "bg-emerald-100 text-emerald-700",
  CHANGES_REQUESTED: "bg-red-100 text-red-700",
};

export function TaskStatusBadge({ state, label }: { state: TaskStateValue; label?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium", STYLES[state])}>
      {label ?? TASK_STATE_LABELS[state]}
    </span>
  );
}