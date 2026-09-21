"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { SaveSubmissionStepSchema } from "@/schemas";

type SaveSubmissionStepInput = z.infer<typeof SaveSubmissionStepSchema>;

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

  const validated = SaveSubmissionStepSchema.safeParse(values);
  if (!validated.success) {
    return { success: false, error: "Invalid step data" };
  }

  const { applicationId, submissionId, stepNumber, setCurrentStep, values: answers } = validated.data;

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true, isActive: true, slug: true, terminal: { select: { slug: true } } },
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
  if (submission && submission.status !== "DRAFT" && submission.status !== "IN_PROGRESS") {
    return { success: false, error: "This application has already been submitted and can no longer be edited" };
  }

  const targetStep = Math.max(setCurrentStep ?? stepNumber, submission?.currentStep ?? 1);

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
        },
      });

  // Upsert every answer on this step. Empty strings are stored as null so
  // "the applicant cleared this field" and "never touched this field" both
  // read as absent — submitApplication's required-field check relies on that.
  if (answers.length > 0) {
    await db.$transaction(
      answers.map((answer) =>
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
  if (submission.status !== "DRAFT" && submission.status !== "IN_PROGRESS") {
    return { success: false, error: "This application has already been submitted" };
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

  await db.applicationSubmission.update({
    where: { id: submission.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      currentStep: totalSteps._max.stepNumber ?? submission.currentStep,
    },
  });

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { slug: true, terminal: { select: { slug: true } } },
  });

  revalidatePath("/portal");
  revalidatePath("/admin/submissions");
  if (application) {
    revalidatePath(`/portal/${application.terminal.slug}`);
    revalidatePath(`/portal/${application.terminal.slug}/${application.slug}`);
  }

  return { success: true };
}