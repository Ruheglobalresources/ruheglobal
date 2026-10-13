//src/app/portal/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getPortalCounsellor } from "@/lib/portal-counsellor";
import { TerminalCard } from "@/components/portal/terminal-card";
import { ContinueList } from "@/components/portal/continue-list";
import { CounsellorCard } from "@/components/portal/counsellor-card";
import { HeroBanner } from "@/components/portal/hero-banner";
import { computeOverallProgress, groupFieldsByStep, mapApplicationFields } from "@/components/portal/types";
import { CoursesPreview, InstitutionsPreview } from "@/components/dashboard/catalog-lists";

export const dynamic = "force-dynamic";

// The portal's first page is the one place that shows everything:
//   hero banner (greeting + find a course) -> applications (continue + terminals)
//   -> courses strip -> institutions strip
// The two strips are swipeable previews. "Show all" opens /courses and
// /institutions, which hold the full lists.
export default async function PortalDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/auth/login?callbackUrl=/portal");

  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? null;

  const [terminals, inProgressSubmissions, counsellor] = await Promise.all([
    db.portalTerminal.findMany({
      where: { isActive: true, isVisible: true },

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
    }).catch((e) => {
  console.error("SUBMISSION QUERY FAILED:", e.code, e.meta, e.message);
  throw e;
}),
    getPortalCounsellor(userId),
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
      // school applications share one form, so the list says which school and course each one is for
      targetLabel: [submission.targetName, submission.targetCourseName].filter(Boolean).join(", ") || null,
      percent,
    };
  });

  return (
    <div className="space-y-12">
      {/* Hero banner: greeting, find a course, start an application */}
      <section>
        <HeroBanner firstName={firstName} />

        {/* On a phone the sidebar is hidden, so the counsellor sits here instead. */}
        <div className="mt-4 lg:hidden">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Your counsellor</p>
          <CounsellorCard counsellor={counsellor} />
        </div>
      </section>

      {/* Applications: where you left off, then every terminal */}
      <section id="applications" className="scroll-mt-24">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-ink">Applications</h2>
            <p className="text-sm text-neutral-500">Pick up where you left off, or choose a terminal to start something new.</p>
          </div>
          <Link href="/portal/applications" className="shrink-0 text-sm font-medium text-[color:var(--color-teal)] hover:underline">
            My applications
          </Link>
        </div>

        <ContinueList items={continueItems} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {terminals.map((terminal) => (
            <TerminalCard
              key={terminal.id}
              slug={terminal.slug}
              name={terminal.name}
              icon={terminal.icon}
              applicationCount={terminal._count.applications}
            />
          ))}
          {terminals.length === 0 && (
            <p className="text-sm text-neutral-400">No terminals are open yet, check back soon.</p>
          )}
        </div>
      </section>

      <CoursesPreview />
      <InstitutionsPreview />
    </div>
  );
}