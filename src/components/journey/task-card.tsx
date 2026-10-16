// src/components/journey/task-card.tsx
// One row of a stage: the document or step, what state it is in, and a plus (add it) or a status
// icon. Opens the task page. A step done by staff (milestone) is shown but never opened.
import Link from "next/link";
import { AlertCircle, CheckCircle2, CircleDot, Clock, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { taskHref, type JourneyPathContext } from "@/lib/journey/paths";
import type { TaskView } from "@/lib/journey/types";
import { TASK_STATE_LABELS } from "./task-status";

type Props = {
  task: TaskView;
  /** The stage is open (not locked). */
  open: boolean;
  path: JourneyPathContext;
};

const STATE_TEXT: Record<string, string> = {
  NOT_STARTED: "text-neutral-400",
  DRAFT: "text-amber-600",
  SUBMITTED: "text-[color:var(--color-teal)]",
  VERIFIED: "text-emerald-600",
  CHANGES_REQUESTED: "text-red-600",
};

export function TaskCard({ task, open, path }: Props) {
  const { def, state, entry } = task;
  const isMilestone = def.kind === "MILESTONE";
  const linked = open && !isMilestone && (task.editable || !!entry);

  const stateText = isMilestone
    ? state === "VERIFIED"
      ? "Done"
      : "Handled by your counsellor"
    : task.def.isRequired || state !== "NOT_STARTED"
      ? TASK_STATE_LABELS[state]
      : "Optional";

  const body = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-400">
        {isMilestone ? <CircleDot size={20} /> : <FileText size={20} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug text-[color:var(--color-ink)]">{def.title}</span>
        <span className="mt-0.5 block text-xs">
          {entry?.badge && (
            <>
              <span className="font-medium text-amber-600">{entry.badge}</span>
              <span className="mx-1.5 text-neutral-300">•</span>
            </>
          )}
          <span className={cn("font-medium", STATE_TEXT[isMilestone && state === "VERIFIED" ? "VERIFIED" : state])}>{stateText}</span>
        </span>
        {state === "CHANGES_REQUESTED" && entry?.reviewNote && (
          <span className="mt-1 line-clamp-2 block text-xs text-red-600">{entry.reviewNote}</span>
        )}
      </span>

      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          state === "NOT_STARTED" || state === "DRAFT" ? "bg-neutral-100 text-[color:var(--color-teal)]" : "text-neutral-400"
        )}
        aria-hidden="true"
      >
        {state === "VERIFIED" ? (
          <CheckCircle2 size={20} className="text-emerald-600" />
        ) : state === "SUBMITTED" ? (
          <Clock size={20} className="text-[color:var(--color-teal)]" />
        ) : state === "CHANGES_REQUESTED" ? (
          <AlertCircle size={20} className="text-red-600" />
        ) : isMilestone ? (
          <Clock size={20} />
        ) : (
          <Plus size={20} />
        )}
      </span>
    </>
  );

  const base = "flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition";

  if (!linked) {
    return <div className={cn(base, !open && "opacity-60")}>{body}</div>;
  }
  return (
    <Link
      href={taskHref(path, def.slug)}
      className={cn(base, "outline-none hover:border-[color:var(--color-teal)]/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[color:var(--color-teal)]/40")}
    >
      {body}
    </Link>
  );
}