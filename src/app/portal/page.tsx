import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TerminalCard } from "@/components/portal/terminal-card";
import { ContinueList } from "@/components/portal/continue-list";
import { computeOverallProgress, groupFieldsByStep, mapApplicationFields } from "@/components/portal/types";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [terminals, inProgressSubmissions] = await Promise.all([
    db.portalTerminal.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: { _count: { select: { applications: { where: { isActive: true } } } } },
    }),
    db.applicationSubmission.findMany({
      where: { userId, status: { in: ["DRAFT", "IN_PROGRESS"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        values: true,
        application: {
          include: {
            terminal: { select: { slug: true, name: true } },
            fields: { include: { fieldDefinition: true } },
          },
        },
      },
    }),
  ]);

  const continueItems = inProgressSubmissions.map((submission) => {
    const steps = groupFieldsByStep(mapApplicationFields(submission.application.fields));
    const percent = computeOverallProgress(
      steps,
      submission.values.map((v) => ({ applicationFieldId: v.applicationFieldId, value: v.value, fileUrl: v.fileUrl }))
    );

    return {
      submissionId: submission.id,
      applicationName: submission.application.name,
      applicationSlug: submission.application.slug,
      terminalSlug: submission.application.terminal.slug,
      terminalName: submission.application.terminal.name,
      percent,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[color:var(--color-ink)]">Your applications</h1>
        <p className="text-sm text-neutral-500">Pick up where you left off, or start something new below.</p>
      </div>

      <ContinueList items={continueItems} />

      <h2 className="mb-3 text-sm font-semibold text-[color:var(--color-ink)]">All terminals</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {terminals.map((terminal) => (
          <TerminalCard
            key={terminal.id}
            slug={terminal.slug}
            name={terminal.name}
            icon={terminal.icon}
            applicationCount={terminal._count.applications}
          />
        ))}
        {terminals.length === 0 && <p className="text-sm text-neutral-400">No terminals are open yet — check back soon.</p>}
      </div>
    </div>
  );
}