//src/app/portal/[terminalSlug]/[applicationSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ApplicationWizard } from "@/components/portal/application-wizard";
import { groupFieldsByStep, mapApplicationFields } from "@/components/portal/types";
import {
  ApplyTargetInputSchema,
  buildPrefill,
  resolveApplyTarget,
  targetInputFromSubmission,
  targetWhere,
  type ApplyTargetInput,
} from "@/lib/application-target";
import { isEditableStatus } from "@/constants/submission-status";

export const dynamic = "force-dynamic";

type SearchParams = { type?: string; target?: string; course?: string; submission?: string };

// A submission together with what is needed to rebuild its school or institution
const submissionInclude = {
  values: true,
  institution: { select: { slug: true } },
  school: { select: { slug: true } },
} as const;

export default async function ApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ terminalSlug: string; applicationSlug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { terminalSlug, applicationSlug } = await params;
  const sp = await searchParams;
  const session = await auth();
  const userId = session!.user.id;

  const application = await db.application.findFirst({
    where: { slug: applicationSlug, isActive: true, terminal: { slug: terminalSlug, isActive: true } },
    include: {
      terminal: { select: { name: true, slug: true } },
      fields: { include: { fieldDefinition: true } },
    },
  });

  if (!application) notFound();

  const steps = groupFieldsByStep(mapApplicationFields(application.fields));
  const isSchoolFlow = application.kind === "SCHOOL";

  // 1. Which submission is open. A link from the dashboard names it (?submission=).
  let submission = sp.submission
    ? await db.applicationSubmission.findFirst({
        where: { id: sp.submission, userId, applicationId: application.id },
        include: submissionInclude,
      })
    : null;
  if (sp.submission && !submission) redirect("/portal");

  // 2. School application: it is always FOR a school or institution (and maybe a course).
  let targetInput: ApplyTargetInput | null = null;
  let resolved = null as Awaited<ReturnType<typeof resolveApplyTarget>>;

  if (isSchoolFlow) {
    if (submission) {
      targetInput = targetInputFromSubmission(submission);
    } else {
      const parsed = ApplyTargetInputSchema.safeParse({
        type: sp.type === "school" ? "school" : "institution",
        slug: sp.target ?? "",
        courseId: sp.course || null,
      });
      // opened with no school chosen: send the student to pick one first
      if (!parsed.success) redirect("/institutions");
      targetInput = parsed.data;
    }

    resolved = targetInput ? await resolveApplyTarget(targetInput) : null;

    if (!submission) {
      if (!resolved) redirect(targetInput?.type === "school" ? "/search" : "/institutions");
      submission = await db.applicationSubmission.findFirst({
        where: { userId, applicationId: application.id, ...targetWhere(resolved) },
        orderBy: { updatedAt: "desc" },
        include: submissionInclude,
      });
    }
  } else if (!submission) {
    // every other kind keeps one submission per application: the latest one
    submission = await db.applicationSubmission.findFirst({
      where: { userId, applicationId: application.id },
      orderBy: { updatedAt: "desc" },
      include: submissionInclude,
    });
  }

  // 3. Answers: what the student saved, plus the target filled into the matching fields.
  const answers = new Map(
    (submission?.values ?? []).map((v) => [
      v.applicationFieldId,
      { applicationFieldId: v.applicationFieldId, value: v.value, fileUrl: v.fileUrl },
    ])
  );

  const editable = !submission || isEditableStatus(submission.status);
  let lockedFieldIds: string[] = [];

  if (isSchoolFlow && resolved && editable) {
    const prefill = buildPrefill(resolved, steps.flatMap((s) => s.fields));
    const locked = new Set(prefill.lockedFieldIds);
    for (const a of prefill.answers) {
      // the school and the course always follow the target, the rest only fills empty fields
      if (locked.has(a.applicationFieldId) || !answers.get(a.applicationFieldId)?.value?.trim()) {
        answers.set(a.applicationFieldId, a);
      }
    }
    lockedFieldIds = prefill.lockedFieldIds;
  }

  const targetName = submission?.targetName ?? resolved?.name ?? null;
  const courseName = submission?.targetCourseName ?? resolved?.courseName ?? null;
  const backHref = isSchoolFlow
    ? resolved
      ? `/${resolved.type === "school" ? "schools" : "institutions"}/${resolved.slug}`
      : "/portal"
    : `/portal/${terminalSlug}`;
  const backLabel = isSchoolFlow ? (targetName ?? "Portal") : application.terminal.name;

  return (
    <div>
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-[color:var(--color-teal)]"
      >
        <ArrowLeft size={13} /> {backLabel}
      </Link>

      {isSchoolFlow && targetName && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border bg-white p-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[color:var(--color-teal)]/10 text-[color:var(--color-teal)]">
            <GraduationCap size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-400">You are applying to</p>
            <p className="truncate text-sm font-semibold text-[color:var(--color-ink)]">{targetName}</p>
            {courseName && <p className="truncate text-xs text-neutral-500">{courseName}</p>}
          </div>
        </div>
      )}

      <ApplicationWizard
        applicationId={application.id}
        applicationName={application.name}
        terminalName={application.terminal.name}
        steps={steps}
        initialSubmissionId={submission?.id ?? null}
        initialStatus={submission?.status ?? "DRAFT"}
        initialCurrentStep={submission?.currentStep ?? 1}
        initialAnswers={Array.from(answers.values())}
        target={isSchoolFlow ? targetInput : null}
        lockedFieldIds={lockedFieldIds}
      />
    </div>
  );
}