// src/components/journey/journey-timeline.tsx
// The timeline across the top of an application: one numbered circle per stage, joined by a line.
// Done stages are ticked, the open stage is filled, locked stages are grey. Each stage is a link
// (?stage=N) so the page stays a plain server page; the stage being looked at is outlined.
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { journeyHref, type JourneyPathContext } from "@/lib/journey/paths";
import type { StageView } from "@/lib/journey/types";

type Props = {
  stages: StageView[];
  selectedStageNumber: number;
  /** Address pieces of the application, so each stage can link to itself. */
  path: JourneyPathContext;
};

function caption(stage: StageView) {
  if (stage.status === "COMPLETE") return "Completed";
  if (stage.status === "IN_REVIEW") return "In review";
  if (stage.status === "LOCKED") return "Locked";
  return stage.requiredTotal > 0 ? `${stage.requiredDone} of ${stage.requiredTotal} done` : "In progress";
}

export function JourneyTimeline({ stages, selectedStageNumber, path }: Props) {
  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-[600px] items-start">
        {stages.map((stage, index) => {
          const number = stage.def.stageNumber;
          const isLast = index === stages.length - 1;
          const selected = number === selectedStageNumber;
          const reached = stage.status !== "LOCKED";

          return (
            <li key={stage.def.id} className="flex-1" aria-current={selected ? "step" : undefined}>
              <Link
                href={journeyHref(path, number)}
                scroll={false}
                className="group block rounded-lg pr-2 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-teal)]/40"
              >
                <div className="flex items-center">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition",
                      stage.status === "COMPLETE" && "bg-[color:var(--color-teal)] text-white",
                      (stage.status === "ACTIVE" || stage.status === "IN_REVIEW") && "bg-[color:var(--color-teal)] text-white",
                      stage.status === "LOCKED" && "bg-neutral-300 text-white",
                      selected && "ring-2 ring-[color:var(--color-teal)]/30 ring-offset-2"
                    )}
                  >
                    {stage.status === "COMPLETE" ? <Check size={14} /> : stage.status === "LOCKED" ? <Lock size={12} /> : number}
                  </span>
                  {!isLast && (
                    <span
                      className={cn(
                        "mx-2 h-0.5 flex-1 rounded-full",
                        stage.status === "COMPLETE" ? "bg-[color:var(--color-teal)]" : "bg-neutral-200"
                      )}
                    />
                  )}
                </div>
                <p className={cn("mt-2 text-sm font-medium leading-snug", reached ? "text-[color:var(--color-ink)]" : "text-neutral-400")}>
                  {stage.def.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">{caption(stage)}</p>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}