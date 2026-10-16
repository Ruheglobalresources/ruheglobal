import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ELIGIBILITY_TERMINAL_SLUGS, terminalHref } from "@/lib/portal-paths";
import { ApplicationCard } from "@/components/portal/application-card";
import { computeOverallProgress, groupFieldsByStep, mapApplicationFields } from "@/components/portal/types";

export const dynamic = "force-dynamic";

export default async function TerminalPage({ params }: { params: Promise<{ terminalSlug: string }> }) {
  const { terminalSlug } = await params;

  // Study Abroad and Visa Application open their eligibility check instead of a list of applications
  if (ELIGIBILITY_TERMINAL_SLUGS.includes(terminalSlug)) redirect(terminalHref(terminalSlug));

  const session = await auth();
  const userId = session!.user.id;

  const terminal = await db.portalTerminal.findUnique({
    where: { slug: terminalSlug },
    include: {
      applications: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          tags: { orderBy: { order: "asc" } },
          fields: { include: { fieldDefinition: true } },
          submissions: {
            where: { userId },
            orderBy: { updatedAt: "desc" },
            take: 1,
            include: { values: true },
          },
        },
      },
    },
  });

  if (!terminal || !terminal.isActive) notFound();

  return (
    <div>
      <Link
        href="/portal"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[color:var(--color-teal)]"
      >
        <ArrowLeft size={13} /> All terminals
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--color-ink)]">{terminal.name}</h1>
        <p className="text-sm text-neutral-500">Choose an application to get started.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {terminal.applications.map((application) => {
          const steps = groupFieldsByStep(mapApplicationFields(application.fields));
          const submission = application.submissions[0];
          const progress = submission
            ? {
                status: submission.status,
                percent: computeOverallProgress(
                  steps,
                  submission.values.map((v) => ({
                    applicationFieldId: v.applicationFieldId,
                    value: v.value,
                    fileUrl: v.fileUrl,
                  }))
                ),
              }
            : null;

          return (
            <ApplicationCard
              key={application.id}
              terminalSlug={terminal.slug}
              slug={application.slug}
              name={application.name}
              subtitle={application.subtitle}
              icon={application.icon}
              badge={application.badge}
              isLive={application.isLive}
              tags={application.tags}
              progress={progress}
            />
          );
        })}
        {terminal.applications.length === 0 && (
          <p className="text-sm text-neutral-400">No applications are open under this terminal yet.</p>
        )}
      </div>
    </div>
  );
}