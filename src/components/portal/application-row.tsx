// src/components/portal/application-row.tsx
// One application in a list: title, status, progress bar and the date. The whole row opens it.
// Used by /portal/applications; reusable anywhere a started application is listed.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isUnsubmittedStatus } from "@/constants/submission-status";
import type { PortalApplicationItem } from "@/lib/portal-applications";
import { StatusPill } from "./status-pill";

const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function ApplicationRow({ item }: { item: PortalApplicationItem }) {
  const unsent = isUnsubmittedStatus(item.status);

  return (
    <Link
      href={item.href}
      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 outline-none transition hover:border-ruby-300 hover:bg-ruby-50/40 focus-visible:ring-2 focus-visible:ring-ruby-500/40"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-ink">{item.title}</h3>
          <StatusPill status={item.status} />
        </div>
        {item.subtitle && <p className="mt-0.5 truncate text-sm text-neutral-500">{item.subtitle}</p>}

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-ruby-500" style={{ width: `${item.percent}%` }} />
          </div>
          <span className="text-xs font-medium text-neutral-500">{item.percent}%</span>
        </div>

        <p className="mt-2 text-xs text-neutral-400">
          {item.submittedAt ? `Submitted ${formatDate(item.submittedAt)}, ` : ""}
          updated {formatDate(item.updatedAt)}
        </p>
      </div>

      <span className="hidden shrink-0 text-sm font-medium text-ruby-600 sm:inline">{unsent ? "Continue" : "Open"}</span>
      <ArrowRight size={16} className="shrink-0 text-neutral-300" />
    </Link>
  );
}