//src/app/(root)/profile/applications/page.tsx
// "My applications": every application the student has started or sent, with its status
// and progress. Where the student lands after submitting. Part of the profile area.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { card } from "@/components/institutions/detail/ui";
import { StatusPill } from "@/components/portal/status-pill";
import { computeOverallProgress, groupFieldsByStep, mapApplicationFields } from "@/components/portal/types";
import { isUnsubmittedStatus } from "@/constants/submission-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My applications | Ruhe Global Resources",
  robots: { index: false, follow: false },
};

const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function MyApplicationsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/auth/login?callbackUrl=/profile/applications");

  const submissions = await db.applicationSubmission.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      values: true,
      application: {
        include: {
          terminal: { select: { slug: true, name: true } },
          fields: { include: { fieldDefinition: true } },
        },
      },
    },
  });

  const items = submissions.map((s) => {
    const steps = groupFieldsByStep(mapApplicationFields(s.application.fields));
    const percent = computeOverallProgress(
      steps,
      s.values.map((v) => ({ applicationFieldId: v.applicationFieldId, value: v.value, fileUrl: v.fileUrl }))
    );
    return {
      id: s.id,
      status: s.status,
      title: s.targetName ?? s.application.name,
      subtitle: s.targetName
        ? [s.targetCourseName, s.application.name].filter(Boolean).join(", ")
        : s.application.terminal.name,
      href: `/portal/${s.application.terminal.slug}/${s.application.slug}?submission=${s.id}`,
      percent,
      updatedAt: s.updatedAt,
      submittedAt: s.submittedAt,
    };
  });

  const inProgress = items.filter((i) => isUnsubmittedStatus(i.status));
  const sent = items.filter((i) => !isUnsubmittedStatus(i.status));

  const renderList = (list: typeof items) => (
    <ul className="space-y-3">
      {list.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className={cn(
              card,
              "flex items-center gap-4 p-4 transition-colors hover:border-ruby focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby/40"
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold text-ink">{item.title}</h2>
                <StatusPill status={item.status} />
              </div>
              {item.subtitle && <p className="mt-0.5 truncate text-sm text-ink/55">{item.subtitle}</p>}

              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-ruby" style={{ width: `${item.percent}%` }} />
                </div>
                <span className="text-xs font-medium text-ink/50">{item.percent}%</span>
              </div>

              <p className="mt-2 text-xs text-ink/45">
                {item.submittedAt ? `Submitted ${formatDate(item.submittedAt)}, ` : ""}
                updated {formatDate(item.updatedAt)}
              </p>
            </div>

            <span className="hidden shrink-0 text-sm font-medium text-ruby sm:inline">
              {isUnsubmittedStatus(item.status) ? "Continue" : "Open"}
            </span>
            <ArrowRight size={16} className="shrink-0 text-ink/30" />
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-cloud pb-10 text-ink">
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">My applications</span>
          </nav>
          <h1 className="mt-8 font-display text-3xl font-semibold leading-tight sm:text-5xl">My applications</h1>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12">
        {items.length === 0 && (
          <div className={cn(card, "flex flex-col items-center border-dashed px-6 py-14 text-center")}>
            <h2 className="text-lg font-semibold text-ink">No applications yet</h2>
            <Link href="/institutions" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ruby hover:underline">
              Browse institutions <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {inProgress.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold text-ink/70">In progress</h2>
            {renderList(inProgress)}
          </div>
        )}

        {sent.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink/70">Submitted</h2>
            {renderList(sent)}
          </div>
        )}
      </section>
    </div>
  );
}