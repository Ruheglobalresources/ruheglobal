// src/components/journey/journey-page.tsx
// The application page: header, the timeline, and the stage being looked at with its tasks
// grouped under their headings (Identity, Academic Certificates, Professional Records...).
// It is a body of the portal page (next to the sidebar), not a modal. A stage that is locked
// shows why instead of its tasks, which is how "consultation first" is enforced for the applicant.
import Link from "next/link";
import { ArrowLeft, GraduationCap, Lock, Clock, CheckCircle2 } from "lucide-react";
import { groupTasks } from "@/lib/journey/engine";
import type { JourneyHeader } from "@/lib/journey/route-data";
import type { JourneyView, StageView } from "@/lib/journey/types";
import type { JourneyPathContext } from "@/lib/journey/paths";
import { JourneyTimeline } from "./journey-timeline";
import { TaskCard } from "./task-card";

type Props = {
  header: JourneyHeader;
  view: JourneyView;
  selectedStageNumber: number;
  path: JourneyPathContext;
};

function StageNotice({ stage, previous }: { stage: StageView; previous: StageView | null }) {
  if (stage.status === "LOCKED") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
        <Lock size={18} className="mt-0.5 shrink-0 text-neutral-400" />
        <p>
          This stage opens when{" "}
          <span className="font-medium text-[color:var(--color-ink)]">{previous?.def.title ?? "the stage before it"}</span> is
          complete. Your counsellor will guide you through it.
        </p>
      </div>
    );
  }
  if (stage.status === "IN_REVIEW") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[color:var(--color-teal)]/30 bg-[color:var(--color-teal)]/5 p-4 text-sm text-[color:var(--color-teal)]">
        <Clock size={18} className="mt-0.5 shrink-0" />
        <p>
          You have sent everything for this stage. Your counsellor is checking it and will open the next stage when it is
          approved. You can still update a document if they ask you to.
        </p>
      </div>
    );
  }
  if (stage.status === "COMPLETE") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
        <p>{stage.signedOff ? "Your counsellor has approved this stage." : "This stage is complete."}</p>
      </div>
    );
  }
  return null;
}

export function JourneyPage({ header, view, selectedStageNumber, path }: Props) {
  const selected = view.stages.find((s) => s.def.stageNumber === selectedStageNumber) ?? view.stages[0];
  const previous = view.stages.find((s) => s.def.stageNumber === selected.def.stageNumber - 1) ?? null;
  const open = selected.status !== "LOCKED";
  const groups = open ? groupTasks(selected.tasks) : [];

  return (
    <div className="space-y-5">
      <Link
        href={header.backHref}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[color:var(--color-teal)]"
      >
        <ArrowLeft size={13} /> {header.backLabel}
      </Link>

      <div className="rounded-xl border bg-white p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[color:var(--color-teal)]/10 text-[color:var(--color-teal)]">
            <GraduationCap size={22} />
          </span>
          <div className="min-w-0 flex-1">
            {header.eyebrow && <p className="text-xs font-medium text-neutral-400">{header.eyebrow}</p>}
            <h1 className="truncate text-lg font-semibold text-[color:var(--color-ink)]">{header.title}</h1>
            {header.subtitle && <p className="truncate text-sm text-neutral-500">{header.subtitle}</p>}
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-xl font-semibold text-[color:var(--color-ink)]">{view.percent}%</p>
            <p className="text-xs text-neutral-400">of your journey</p>
          </div>
        </div>

        <div className="mt-6">
          <JourneyTimeline stages={view.stages} selectedStageNumber={selected.def.stageNumber} path={path} />
        </div>
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--color-ink)]">{selected.def.title}</h2>
          {selected.def.description && <p className="mt-1 text-sm text-neutral-500">{selected.def.description}</p>}
        </div>

        <StageNotice stage={selected} previous={previous} />

        {groups.map((group, groupIndex) => (
          <div key={group.title ?? `group-${groupIndex}`} className="space-y-3">
            {group.title && <h3 className="text-base font-semibold text-[color:var(--color-ink)]">{group.title}</h3>}
            {group.blocks.map((block, blockIndex) => (
              <div key={block.title ?? `block-${blockIndex}`} className="space-y-2">
                {block.title && (
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{block.title}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {block.tasks.map((task) => (
                    <TaskCard key={task.def.id} task={task} open={open} path={path} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}