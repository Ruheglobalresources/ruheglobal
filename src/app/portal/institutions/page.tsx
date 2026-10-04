import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TerminalCard } from "@/components/portal/terminal-card";
import { ContinueList } from "@/components/portal/continue-list";
import { computeOverallProgress, groupFieldsByStep, mapApplicationFields } from "@/components/portal/types";
import { CoursesPreview, InstitutionsPreview } from "@/components/dashboard/catalog-lists";
import { elevation1, filledButton } from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const firstName = session!.user.name?.trim().split(/\s+/)[0] ?? null;

  const [terminals, inProgressSubmissions, counsellorSubmission] = await Promise.all([
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
    // The counsellor assigned to the applicant's most recent submission, if any.
    db.applicationSubmission.findFirst({
      where: { userId, counselorId: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: { counselor: { select: { name: true, image: true } } },
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

  const counsellor = counsellorSubmission?.counselor ?? null;

  return (
    <div className="space-y-12">
      {/* Greeting */}
      <section>
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          We&apos;ve personalised your space{firstName ? "," : ""}{" "}
          {firstName && <span className="text-ruby-600">{firstName}</span>}
        </h1>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Matches banner */}
          <div
            className={cn(
              "flex flex-col justify-between rounded-3xl border border-ruby-100 bg-ruby-50 p-6 lg:col-span-2",
              elevation1
            )}
          >
            <div>
              <h2 className="text-xl font-semibold text-ink">Not sure what you qualify for?</h2>
              <p className="mt-1 text-neutral-600">Get your best-fit options in 30 seconds.</p>
            </div>
            <div className="mt-6">
              <Link href="/portal/courses" className={filledButton}>
                Show my matches <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Counsellor */}
          <div className={cn("rounded-3xl border border-neutral-200 bg-white p-6", elevation1)}>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Your counsellor</p>
            {counsellor ? (
              <div className="mt-3 flex items-center gap-3">
                {counsellor.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={counsellor.image} alt="" className="size-12 rounded-full object-cover" />
                ) : (
                  <span className="grid size-12 place-items-center rounded-full bg-ruby-50 text-base font-semibold text-ruby-700">
                    {(counsellor.name ?? "C").charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{counsellor.name ?? "Your counsellor"}</p>
                  <p className="text-sm text-neutral-500">Counsellor</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">
                A counsellor is assigned to you once you start an application. You can also talk to us any time.
              </p>
            )}
            <Link href="/contact" className={cn(filledButton, "mt-5 w-full")}>
              <CalendarCheck size={18} /> Book a session
            </Link>
          </div>
        </div>
      </section>

      <CoursesPreview />
      <InstitutionsPreview />

      {/* Applications: everything the old portal home showed */}
      <section id="applications" className="scroll-mt-24">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-ink">Your applications</h2>
          <p className="text-sm text-neutral-500">Pick up where you left off, or start something new below.</p>
        </div>

        <ContinueList items={continueItems} />

        <h3 className="mb-3 text-sm font-semibold text-ink">All terminals</h3>
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
          {terminals.length === 0 && (
            <p className="text-sm text-neutral-400">No terminals are open yet, check back soon.</p>
          )}
        </div>
      </section>
    </div>
  );
}
