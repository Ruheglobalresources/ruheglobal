"use server";

// src/actions/journey-review.ts
// The staff side of the application engine. A counsellor checks each document (verify it, or send
// it back with a note), ticks off milestones (application sent, offer received), and signs a stage
// off, which is what opens the next stage for the applicant. Admin only, like the other review
// actions in this app (updateSubmissionStatus).
import * as z from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { getJourney } from "@/lib/journey/data";
import { refreshSubmissionProgress } from "@/lib/journey/sync";

type Result = { success: string } | { error: string };

const ReviewTaskSchema = z.object({
  submissionId: z.string().min(1),
  taskId: z.string().min(1),
  // RESET takes a verified or sent-back task to "sent" again, and a milestone back to not done
  decision: z.enum(["VERIFIED", "CHANGES_REQUESTED", "RESET"]),
  note: z.string().trim().max(2000).optional(),
  badge: z.string().trim().max(80).optional(),
});

const StageSchema = z.object({
  submissionId: z.string().min(1),
  stageId: z.string().min(1),
  note: z.string().trim().max(2000).optional(),
});

function refresh(submissionId: string) {
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath("/portal");
  revalidatePath("/portal/applications");
  // the applicant's timeline and task pages live under /portal/<terminal>/<application>
  revalidatePath("/portal/[terminalSlug]/[applicationSlug]", "layout");
}

export async function reviewJourneyTask(input: z.infer<typeof ReviewTaskSchema>): Promise<Result> {
  const staff = await requireAdmin();
  const parsed = ReviewTaskSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid review" };
  const { submissionId, taskId, decision, note, badge } = parsed.data;

  const submission = await db.applicationSubmission.findUnique({
    where: { id: submissionId },
    select: { applicationId: true },
  });
  if (!submission) return { error: "Submission not found" };

  const task = await db.applicationTask.findFirst({
    where: { id: taskId, applicationId: submission.applicationId },
    select: { kind: true },
  });
  if (!task) return { error: "That task is not part of this application" };

  const existing = await db.submissionTask.findUnique({
    where: { submissionId_taskId: { submissionId, taskId } },
    include: { _count: { select: { files: true } } },
  });
  const isMilestone = task.kind === "MILESTONE";

  if (decision === "CHANGES_REQUESTED" && !note) return { error: "Write what the applicant needs to change" };

  if (decision === "RESET") {
    if (!existing) return { success: "Nothing to reset" };
    if (isMilestone) {
      await db.submissionTask.delete({ where: { id: existing.id } });
    } else {
      await db.submissionTask.update({
        where: { id: existing.id },
        data: {
          status: existing._count.files > 0 || task.kind === "FORM" ? "SUBMITTED" : "DRAFT",
          reviewNote: null,
          badge: null,
          reviewedAt: null,
          reviewedById: null,
        },
      });
    }
  } else {
    // a document can only be checked once the applicant has sent it; a milestone is staff work
    if (!existing && !isMilestone) return { error: "The applicant has not sent this yet" };
    if (existing && !isMilestone && existing.status === "DRAFT") return { error: "The applicant has not sent this yet" };

    const data = {
      status: decision,
      reviewNote: decision === "CHANGES_REQUESTED" ? (note ?? null) : null,
      badge: decision === "VERIFIED" ? (badge || null) : null,
      reviewedAt: new Date(),
      reviewedById: staff.id!,
    };
    await db.submissionTask.upsert({
      where: { submissionId_taskId: { submissionId, taskId } },
      create: { submissionId, taskId, answers: {}, submittedAt: new Date(), ...data },
      update: data,
    });
  }

  await refreshSubmissionProgress(submissionId);
  refresh(submissionId);
  return { success: decision === "VERIFIED" ? "Verified" : decision === "RESET" ? "Reset" : "Sent back to the applicant" };
}

// Sign a stage off. Only an open stage can be signed off: signing off a locked one would open
// everything after it by surprise.
export async function completeJourneyStage(input: z.infer<typeof StageSchema>): Promise<Result> {
  const staff = await requireAdmin();
  const parsed = StageSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request" };
  const { submissionId, stageId, note } = parsed.data;

  const submission = await db.applicationSubmission.findUnique({
    where: { id: submissionId },
    select: {
      userId: true,
      applicationId: true,
      institutionCourse: { select: { level: true } },
      schoolCourse: { select: { level: true } },
    },
  });
  if (!submission) return { error: "Submission not found" };

  const { view } = await getJourney({
    userId: submission.userId,
    applicationId: submission.applicationId,
    submissionId,
    courseLevel: submission.institutionCourse?.level ?? submission.schoolCourse?.level ?? null,
  });
  const stage = view.stages.find((s) => s.def.id === stageId);
  if (!stage) return { error: "That stage is not part of this application" };
  if (stage.status === "LOCKED") return { error: "Complete the earlier stage first" };

  await db.submissionStage.upsert({
    where: { submissionId_stageId: { submissionId, stageId } },
    create: { submissionId, stageId, completedAt: new Date(), completedById: staff.id!, note: note || null },
    update: { completedAt: new Date(), completedById: staff.id!, note: note || null },
  });

  await refreshSubmissionProgress(submissionId);
  refresh(submissionId);
  return { success: "Stage completed. The next stage is open." };
}

// Reopen a stage that was signed off (the applicant can edit it again and the stages after it lock).
export async function reopenJourneyStage(input: z.infer<typeof StageSchema>): Promise<Result> {
  await requireAdmin();
  const parsed = StageSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid request" };
  const { submissionId, stageId } = parsed.data;

  const entry = await db.submissionStage.findUnique({ where: { submissionId_stageId: { submissionId, stageId } } });
  if (!entry) return { success: "Nothing to reopen" };

  await db.submissionStage.update({
    where: { id: entry.id },
    data: { completedAt: null, completedById: null },
  });

  await refreshSubmissionProgress(submissionId);
  refresh(submissionId);
  return { success: "Stage reopened" };
}