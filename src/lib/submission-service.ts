// src/lib/submission-service.ts
// Finds or creates the submission an applicant works in. Used by every engine that saves into a
// submission without going through the classic wizard (the timeline). The rules are the wizard's:
//   - nothing is created until the applicant saves something, so opening a page leaves no trace
//   - a school application is always FOR a school or institution (and maybe a course), and an
//     applicant who already has a submission for that exact target gets THAT one back
//   - a new submission starts with the counsellor assigned to the account
//   - closed statuses can no longer be edited
import type { ApplicationSubmission, PortalKind } from "@prisma/client";
import { db } from "@/lib/db";
import { isEditableStatus } from "@/constants/submission-status";
import {
  resolveApplyTarget,
  targetColumns,
  targetWhere,
  type ApplyTargetInput,
} from "@/lib/application-target";

type Args = {
  userId: string;
  application: { id: string; kind: PortalKind };
  submissionId?: string | null;
  target?: ApplyTargetInput | null;
};

export type SubmissionResult =
  | { ok: true; submission: ApplicationSubmission; created: boolean }
  | { ok: false; error: string };

const CLOSED = "This application is closed and can no longer be edited";

export async function getOrCreateSubmission({ userId, application, submissionId, target }: Args): Promise<SubmissionResult> {
  if (submissionId) {
    const found = await db.applicationSubmission.findUnique({ where: { id: submissionId } });
    if (!found || found.applicationId !== application.id) return { ok: false, error: "Submission not found" };
    if (found.userId !== userId) return { ok: false, error: "You don't have access to this application" };
    if (!isEditableStatus(found.status)) return { ok: false, error: CLOSED };
    return { ok: true, submission: found, created: false };
  }

  let targetData: ReturnType<typeof targetColumns> | null = null;

  if (application.kind === "SCHOOL") {
    if (!target) return { ok: false, error: "Choose a school or institution to apply to first" };
    const resolved = await resolveApplyTarget(target);
    if (!resolved) return { ok: false, error: "That school or institution is no longer available" };

    const existing = await db.applicationSubmission.findFirst({
      where: { userId, applicationId: application.id, ...targetWhere(resolved) },
      orderBy: { updatedAt: "desc" },
    });
    if (existing) {
      if (!isEditableStatus(existing.status)) return { ok: false, error: CLOSED };
      return { ok: true, submission: existing, created: false };
    }
    targetData = targetColumns(resolved);
  } else {
    // every other kind keeps one submission per application: the latest one
    const latest = await db.applicationSubmission.findFirst({
      where: { userId, applicationId: application.id },
      orderBy: { updatedAt: "desc" },
    });
    if (latest) {
      if (!isEditableStatus(latest.status)) return { ok: false, error: CLOSED };
      return { ok: true, submission: latest, created: false };
    }
  }

  const owner = await db.user.findUnique({ where: { id: userId }, select: { counselorId: true } });
  const submission = await db.applicationSubmission.create({
    data: {
      userId,
      applicationId: application.id,
      status: "IN_PROGRESS",
      currentStep: 1,
      counselorId: owner?.counselorId ?? null,
      ...(targetData ?? {}),
    },
  });
  return { ok: true, submission, created: true };
}