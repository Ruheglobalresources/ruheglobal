import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ContinueListItem {
  submissionId: string;
  applicationName: string;
  applicationSlug: string;
  terminalSlug: string;
  terminalName: string;
  targetLabel?: string | null; // school applications: which school and course
  percent: number;
}

export function ContinueList({ items }: { items: ContinueListItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-sm font-semibold text-[color:var(--color-ink)]">Continue where you left off</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.submissionId}
            href={`/portal/${item.terminalSlug}/${item.applicationSlug}?submission=${item.submissionId}`}
            className="flex items-center gap-4 rounded-xl border bg-white p-3.5 transition-colors hover:border-[color:var(--color-teal)] hover:bg-[color:var(--color-cloud)]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--color-ink)]">{item.applicationName}</p>
              <p className="truncate text-xs text-neutral-500">{item.targetLabel ?? item.terminalName}</p>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-[color:var(--color-teal)]" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium text-neutral-400">{item.percent}%</span>
            <ArrowRight size={16} className="shrink-0 text-neutral-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}