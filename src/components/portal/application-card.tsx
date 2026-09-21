import Link from "next/link";
import { ArrowRight, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolvePortalIcon } from "./terminal-card";
import type { ApplicationStatus } from "./types";

interface ApplicationCardProps {
  terminalSlug: string;
  slug: string;
  name: string;
  subtitle: string | null;
  icon: string | null;
  badge: string | null;
  isLive: boolean;
  tags: { id: string; label: string }[];
  progress?: { percent: number; status: ApplicationStatus } | null;
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Not started",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export function ApplicationCard({
  terminalSlug,
  slug,
  name,
  subtitle,
  icon,
  badge,
  isLive,
  tags,
  progress,
}: ApplicationCardProps) {
  const Icon = resolvePortalIcon(icon);
  const isSubmitted = !!progress && progress.status !== "DRAFT" && progress.status !== "IN_PROGRESS";

  return (
    <Link
      href={`/portal/${terminalSlug}/${slug}`}
      className="flex flex-col gap-3 rounded-xl border bg-white p-4 transition-colors hover:border-[color:var(--color-teal)] hover:bg-[color:var(--color-cloud)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-ember)]/10 text-[color:var(--color-ember)]">
            <Icon size={18} />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[color:var(--color-ink)]">{name}</span>
              {isLive && <CircleDot size={10} className="fill-[color:var(--color-teal)] text-[color:var(--color-teal)]" />}
            </div>
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
        </div>
        <ArrowRight size={16} className="mt-1 shrink-0 text-neutral-300" />
      </div>

      {(badge || tags.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {badge && (
            <span className="rounded-full bg-[color:var(--color-ember)]/10 px-2 py-0.5 text-[10px] font-medium text-[color:var(--color-ember)]">
              {badge}
            </span>
          )}
          {tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {progress && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className={cn(isSubmitted ? "text-[color:var(--color-teal)]" : "text-neutral-500")}>
              {STATUS_LABEL[progress.status]}
            </span>
            {!isSubmitted && <span className="text-neutral-400">{progress.percent}%</span>}
          </div>
          {!isSubmitted && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-[color:var(--color-teal)]" style={{ width: `${progress.percent}%` }} />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}