"use client";

// src/components/admin/journey-review.tsx
// What a counsellor sees on a submission that runs on the timeline: every stage with its documents,
// the details the applicant filled in, and the buttons that move the applicant forward:
//   verify a document, send it back with a note, tick a milestone,
//   and sign a stage off (which opens the next stage for the applicant) or reopen it.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeJourneyStage, reopenJourneyStage, reviewJourneyTask } from "@/actions/journey-review";
import { cn } from "@/lib/utils";
import { TaskStatusBadge } from "@/components/journey/task-status";
import type { StageStatusValue, TaskKindValue, TaskStateValue } from "@/lib/journey/types";

export type ReviewTask = {
  id: string;
  title: string;
  heading: string;
  kind: TaskKindValue;
  isRequired: boolean;
  state: TaskStateValue;
  files: { url: string; name: string; mimeType: string | null }[];
  details: { label: string; value: string }[];
  reviewNote: string | null;
  badge: string | null;
};

export type ReviewStage = {
  id: string;
  number: number;
  title: string;
  status: StageStatusValue;
  completion: "AUTO" | "STAFF";
  signedOff: boolean;
  completedAt: string | null;
  note: string | null;
  requiredDone: number;
  requiredTotal: number;
  tasks: ReviewTask[];
};

const STAGE_STYLE: Record<StageStatusValue, string> = {
  LOCKED: "bg-neutral-100 text-neutral-500",
  ACTIVE: "bg-amber-100 text-amber-700",
  IN_REVIEW: "bg-purple-100 text-purple-700",
  COMPLETE: "bg-emerald-100 text-emerald-700",
};
const STAGE_LABEL: Record<StageStatusValue, string> = {
  LOCKED: "Locked",
  ACTIVE: "In progress",
  IN_REVIEW: "Waiting for you",
  COMPLETE: "Complete",
};

const isImage = (f: { name: string; mimeType: string | null }) =>
  !!f.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif)$/i.test(f.name);

function TaskRow({ submissionId, task }: { submissionId: string; task: ReviewTask }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const [badge, setBadge] = useState("");

  const isMilestone = task.kind === "MILESTONE";
  const sent = task.state === "SUBMITTED" || task.state === "VERIFIED" || task.state === "CHANGES_REQUESTED";

  function run(decision: "VERIFIED" | "CHANGES_REQUESTED" | "RESET") {
    startTransition(async () => {
      const result = await reviewJourneyTask({
        submissionId,
        taskId: task.id,
        decision,
        note: decision === "CHANGES_REQUESTED" ? note : undefined,
        badge: decision === "VERIFIED" ? badge : undefined,
      });
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(result.success);
        setAsking(false);
        setNote("");
        setBadge("");
        router.refresh();
      }
    });
  }

  const button = "rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50";

  return (
    <li className="border-b p-4 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-800">
            {task.title}
            {!task.isRequired && <span className="ml-2 text-xs font-normal text-neutral-400">optional</span>}
            {isMilestone && <span className="ml-2 text-xs font-normal text-neutral-400">staff step</span>}
          </p>
          {task.heading && <p className="text-xs text-neutral-400">{task.heading}</p>}
        </div>
        <div className="flex items-center gap-2">
          {task.badge && <span className="text-xs font-medium text-amber-600">{task.badge}</span>}
          <TaskStatusBadge
            state={task.state}
            label={isMilestone ? (task.state === "VERIFIED" ? "Done" : "Not done") : undefined}
          />
        </div>
      </div>

      {task.files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {task.files.map((file, index) => (
            <a
              key={file.url}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border bg-neutral-50 p-1.5 pr-3 text-xs text-neutral-600 hover:border-neutral-400"
            >
              {isImage(file) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt="" className="size-10 rounded object-cover" />
              ) : (
                <span className="grid size-10 place-items-center rounded bg-neutral-200 text-[10px] font-semibold text-neutral-500">
                  {/\.pdf$/i.test(file.name) || file.mimeType === "application/pdf" ? "PDF" : "FILE"}
                </span>
              )}
              <span className="max-w-[10rem] truncate">
                Page {index + 1}: {file.name}
              </span>
            </a>
          ))}
        </div>
      )}

      {task.details.length > 0 && (
        <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
          {task.details.map((d) => (
            <div key={d.label} className="flex gap-2">
              <dt className="shrink-0 text-neutral-400">{d.label}</dt>
              <dd className="min-w-0 break-words font-medium text-neutral-700">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {task.state === "CHANGES_REQUESTED" && task.reviewNote && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">Sent back: {task.reviewNote}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isMilestone ? (
          task.state === "VERIFIED" ? (
            <button disabled={pending} onClick={() => run("RESET")} className={cn(button, "border text-neutral-600 hover:bg-neutral-50")}>
              Undo
            </button>
          ) : (
            <button disabled={pending} onClick={() => run("VERIFIED")} className={cn(button, "bg-[color:var(--color-teal)] text-white")}>
              Mark done
            </button>
          )
        ) : (
          <>
            {task.state !== "VERIFIED" && sent && (
              <>
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Note on the card (optional)"
                  maxLength={80}
                  className="h-8 w-48 rounded-lg border px-2 text-xs outline-none focus:border-neutral-400"
                />
                <button disabled={pending} onClick={() => run("VERIFIED")} className={cn(button, "bg-[color:var(--color-teal)] text-white")}>
                  Verify
                </button>
              </>
            )}
            {sent && task.state !== "CHANGES_REQUESTED" && !asking && (
              <button disabled={pending} onClick={() => setAsking(true)} className={cn(button, "border text-neutral-600 hover:bg-neutral-50")}>
                Request changes
              </button>
            )}
            {(task.state === "VERIFIED" || task.state === "CHANGES_REQUESTED") && (
              <button disabled={pending} onClick={() => run("RESET")} className={cn(button, "border text-neutral-600 hover:bg-neutral-50")}>
                Reset
              </button>
            )}
            {!sent && <span className="text-xs text-neutral-400">Waiting for the applicant to send this.</span>}
          </>
        )}
      </div>

      {asking && (
        <div className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What does the applicant need to change?"
            className="w-full rounded-lg border p-2 text-sm outline-none focus:border-neutral-400"
          />
          <div className="flex gap-2">
            <button disabled={pending || !note.trim()} onClick={() => run("CHANGES_REQUESTED")} className={cn(button, "bg-red-600 text-white")}>
              Send back
            </button>
            <button disabled={pending} onClick={() => setAsking(false)} className={cn(button, "border text-neutral-600")}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function StageCard({ submissionId, stage }: { submissionId: string; stage: ReviewStage }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  function run(kind: "complete" | "reopen") {
    startTransition(async () => {
      const input = { submissionId, stageId: stage.id, note: note || undefined };
      const result = kind === "complete" ? await completeJourneyStage(input) : await reopenJourneyStage(input);
      if ("error" in result) toast.error(result.error);
      else {
        toast.success(result.success);
        setNote("");
        router.refresh();
      }
    });
  }

  const allSent = stage.requiredDone === stage.requiredTotal;

  return (
    <section className="overflow-hidden rounded-xl border bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-neutral-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-7 place-items-center rounded-full bg-neutral-800 text-xs font-semibold text-white">{stage.number}</span>
          <div>
            <p className="text-sm font-semibold text-neutral-800">{stage.title}</p>
            <p className="text-xs text-neutral-400">
              {stage.requiredDone} of {stage.requiredTotal} required done · {stage.completion === "STAFF" ? "needs your sign off" : "opens the next stage by itself"}
            </p>
          </div>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STAGE_STYLE[stage.status])}>{STAGE_LABEL[stage.status]}</span>
        </div>

        {stage.status !== "LOCKED" && (
          <div className="flex flex-wrap items-center gap-2">
            {stage.signedOff ? (
              <button
                disabled={pending}
                onClick={() => run("reopen")}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-white disabled:opacity-50"
              >
                Reopen stage
              </button>
            ) : (
              <>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Sign off note (optional)"
                  maxLength={200}
                  className="h-8 w-48 rounded-lg border bg-white px-2 text-xs outline-none focus:border-neutral-400"
                />
                <button
                  disabled={pending}
                  onClick={() => {
                    if (!allSent && !window.confirm("The applicant has not sent every required item. Complete this stage anyway?")) return;
                    run("complete");
                  }}
                  className="rounded-lg bg-[color:var(--color-teal)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  Complete stage
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {stage.note && <p className="border-b px-4 py-2 text-xs text-neutral-500">Sign off note: {stage.note}</p>}

      {stage.status === "LOCKED" ? (
        <p className="px-4 py-4 text-xs text-neutral-400">Locked until the stage before it is complete.</p>
      ) : stage.tasks.length === 0 ? (
        <p className="px-4 py-4 text-xs text-neutral-400">No tasks in this stage for this applicant.</p>
      ) : (
        <ul>
          {stage.tasks.map((task) => (
            <TaskRow key={task.id} submissionId={submissionId} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function JourneyReview({ submissionId, stages }: { submissionId: string; stages: ReviewStage[] }) {
  return (
    <section className="mb-8 space-y-3">
      <h2 className="text-sm font-semibold text-neutral-700">Application timeline</h2>
      {stages.map((stage) => (
        <StageCard key={stage.id} submissionId={submissionId} stage={stage} />
      ))}
    </section>
  );
}