"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { SaveSubmissionStepSchema } from "@/schemas";
import { isEditableStatus, isUnsubmittedStatus } from "@/constants/submission-status";
import {
  ApplyTargetInputSchema,
  LOCKED_TARGET_KEYS,
  TARGET_FIELD_KEYS,
  resolveApplyTarget,
  targetColumns,
  targetWhere,
} from "@/lib/application-target";

// The wizard also sends WHO the application is for (school applications only). It is only
// used when the submission is created; after that the submission already holds its target.
const SaveStepWithTargetSchema = SaveSubmissionStepSchema.extend({
  target: ApplyTargetInputSchema.nullable().optional(),
});

type SaveSubmissionStepInput = z.infer<typeof SaveStepWithTargetSchema>;

type SaveSubmissionStepResult =
  | { success: true; submissionId: string; currentStep: number }
  | { success: false; error: string };

// One call per wizard step. The submission row is created here, on the
// very first save — never before, so someone who opens a form and leaves
// without entering anything leaves no trace. Every later call (autosave,
// Back, a stepper click, Save & Continue) upserts that step's answers and
// pushes `currentStep` forward if needed. `currentStep` always tracks the
// FURTHEST step reached, not "the step open right now" — that's what lets
// the stepper permanently unlock a step instead of re-locking it on Back.
export async function saveSubmissionStep(values: SaveSubmissionStepInput): Promise<SaveSubmissionStepResult> {
  const user = await requireUser();

  const validated = SaveStepWithTargetSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: "Invalid step data" };
  }

  const { applicationId, submissionId, stepNumber, setCurrentStep, values: answers, target } = validated.data;

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true, isActive: true, slug: true, kind: true, terminal: { select: { slug: true } } },
  });
  if (!application || !application.isActive) {
    return { success: false, error: "Application not found" };
  }

  let submission = submissionId
    ? await db.applicationSubmission.findUnique({ where: { id: submissionId } })
    : null;

  if (submissionId && !submission) {
    return { success: false, error: "Submission not found" };
  }
  if (submission && submission.userId !== user.id) {
    return { success: false, error: "You don't have access to this application" };
  }
  // a submitted application stays editable; only the closed statuses lock it
  if (submission && !isEditableStatus(submission.status)) {
    return { success: false, error: "This application is closed and can no longer be edited" };
  }

  // School application, first save: the submission needs its target. A student who already
  // has a submission for this exact school and course gets THAT one back (second tab, double
  // click) instead of a duplicate.
  let newTargetData: ReturnType<typeof targetColumns> | null = null;
  if (!submission && application.kind === "SCHOOL") {
    if (!target) return { success: false, error: "Choose a school or institution to apply to first" };

    const resolved = await resolveApplyTarget(target);
    if (!resolved) return { success: false, error: "That school or institution is no longer available" };

    const existing = await db.applicationSubmission.findFirst({
      where: { userId: user.id, applicationId, ...targetWhere(resolved) },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      if (!isEditableStatus(existing.status)) {
        return { success: false, error: "This application is closed and can no longer be edited" };
      }
      submission = existing;
    } else {
      newTargetData = targetColumns(resolved);
    }
  }

  const targetStep = Math.max(setCurrentStep ?? stepNumber, submission?.currentStep ?? 1);

  // a new submission starts with the counselor assigned to the account (an admin can still change it)
  const owner = submission
    ? null
    : await db.user.findUnique({ where: { id: user.id }, select: { counselorId: true } });

  submission = submission
    ? await db.applicationSubmission.update({
        where: { id: submission.id },
        data: { currentStep: targetStep },
      })
    : await db.applicationSubmission.create({
        data: {
          userId: user.id,
          applicationId,
          status: "IN_PROGRESS",
          currentStep: targetStep,
          counselorId: owner?.counselorId ?? null,
          ...(newTargetData ?? {}),
        },
      });

  // The school and the course are decided by the target, not by the form. Whatever the
  // browser sends for those two fields is replaced with the names saved on the submission.
  let toSave = answers;
  if (submission.targetName && answers.length > 0) {
    const lockedFields = await db.applicationField.findMany({
      where: { applicationId, fieldDefinition: { key: { in: LOCKED_TARGET_KEYS } } },
      select: { id: true, fieldDefinition: { select: { key: true } } },
    });
    const forced = new Map(
      lockedFields.map((f) => [
        f.id,
        f.fieldDefinition.key === TARGET_FIELD_KEYS.university ? submission!.targetName : submission!.targetCourseName,
      ])
    );
    toSave = answers.map((a) => {
      const value = forced.get(a.applicationFieldId);
      return value ? { ...a, value } : a;
    });
  }

  // Upsert every answer on this step. Empty strings are stored as null so
  // "the applicant cleared this field" and "never touched this field" both
  // read as absent — submitApplication's required-field check relies on that.
  if (toSave.length > 0) {
    await db.$transaction(
      toSave.map((answer) =>
        db.submissionValue.upsert({
          where: {
            submissionId_applicationFieldId: {
              submissionId: submission!.id,
              applicationFieldId: answer.applicationFieldId,
            },
          },
          create: {
            submissionId: submission!.id,
            applicationFieldId: answer.applicationFieldId,
            value: answer.value?.trim() ? answer.value : null,
            fileUrl: answer.fileUrl || null,
          },
          update: {
            value: answer.value?.trim() ? answer.value : null,
            fileUrl: answer.fileUrl || null,
          },
        })
      )
    );
  }

  revalidatePath("/portal");
  revalidatePath(`/portal/${application.terminal.slug}`);
  revalidatePath(`/portal/${application.terminal.slug}/${application.slug}`);

  return { success: true, submissionId: submission.id, currentStep: submission.currentStep };
}

type SubmitApplicationResult =
  | { success: true }
  | { success: false; error: string; missingStep?: number };

// Called by "Save & Submit" on the wizard's last step. Walks every field the
// admin marked required, across ALL steps (not just the last one), and
// refuses to submit until each has an answer — pointing the client at the
// first step that still needs attention instead of a vague error.
export async function submitApplication(applicationId: string, submissionId: string): Promise<SubmitApplicationResult> {
  const user = await requireUser();

  const submission = await db.applicationSubmission.findUnique({
    where: { id: submissionId },
    include: { values: true },
  });
  if (!submission || submission.applicationId !== applicationId) {
    return { success: false, error: "Submission not found" };
  }
  if (submission.userId !== user.id) {
    return { success: false, error: "You don't have access to this application" };
  }
  if (!isEditableStatus(submission.status)) {
    return { success: false, error: "This application is closed and can no longer be updated" };
  }

  const requiredFields = await db.applicationField.findMany({
    where: { applicationId, isRequired: true },
    orderBy: [{ stepNumber: "asc" }, { order: "asc" }],
    select: { id: true, stepNumber: true, fieldDefinition: { select: { label: true } } },
  });

  const answered = new Map(submission.values.map((v) => [v.applicationFieldId, v]));

  const missing = requiredFields.find((field) => {
    const value = answered.get(field.id);
    return !value || (!value.value?.trim() && !value.fileUrl);
  });

  if (missing) {
    return {
      success: false,
      error: `"${missing.fieldDefinition.label}" is required before you can submit.`,
      missingStep: missing.stepNumber,
    };
  }

  const totalSteps = await db.applicationField.aggregate({
    where: { applicationId },
    _max: { stepNumber: true },
  });

  // Every submit is kept as a version: a frozen copy of ALL answers at this moment. The
  // student can keep editing afterwards, and the admin can still see what was sent each time.
  const allFields = await db.applicationField.findMany({
    where: { applicationId },
    orderBy: [{ stepNumber: "asc" }, { order: "asc" }],
    select: { id: true, stepNumber: true, order: true, fieldDefinition: { select: { label: true, type: true } } },
  });

  const snapshot = allFields.flatMap((field) => {
    const answer = answered.get(field.id);
    if (!answer || (!answer.value?.trim() && !answer.fileUrl)) return [];
    return [
      {
        applicationFieldId: field.id,
        label: field.fieldDefinition.label,
        type: field.fieldDefinition.type,
        stepNumber: field.stepNumber,
        order: field.order,
        value: answer.value,
        fileUrl: answer.fileUrl,
      },
    ];
  });

  const lastVersion = await db.submissionVersion.aggregate({
    where: { submissionId: submission.id },
    _max: { version: true },
  });

  await db.$transaction([
    db.submissionVersion.create({
      data: {
        submissionId: submission.id,
        version: (lastVersion._max.version ?? 0) + 1,
        answers: snapshot as Prisma.InputJsonValue,
      },
    }),
    db.applicationSubmission.update({
      where: { id: submission.id },
      data: {
        // first submit moves it to SUBMITTED; a resubmit keeps whatever status the admin has set
        status: isUnsubmittedStatus(submission.status) ? "SUBMITTED" : submission.status,
        submittedAt: submission.submittedAt ?? new Date(),
        currentStep: totalSteps._max.stepNumber ?? submission.currentStep,
      },
    }),
  ]);

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { slug: true, terminal: { select: { slug: true } } },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/applications");
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${submissionId}`);
  if (application) {
    revalidatePath(`/portal/${application.terminal.slug}`);
    revalidatePath(`/portal/${application.terminal.slug}/${application.slug}`);
  }

  return { success: true };
}