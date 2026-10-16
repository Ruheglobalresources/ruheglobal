"use server";

// src/actions/journey.ts
// The applicant's side of the application engine: saving one task (a document with its details).
// Every rule is checked again here on the server, never trusted from the browser: the task must
// belong to the application, its stage must be open, it must not be verified or closed, the files
// must come from our own storage, and what is missing is worked out from what is sent.
import * as z from "zod";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { ApplyTargetInputSchema } from "@/lib/application-target";
import { getOrCreateSubmission } from "@/lib/submission-service";
import { getJourney } from "@/lib/journey/data";
import { refreshSubmissionProgress } from "@/lib/journey/sync";
import { cleanTaskAnswers, taskMissing } from "@/lib/journey/engine";
import type { TaskStatusValue } from "@/lib/journey/types";

// Files are uploaded straight from the browser to our Firebase storage (lib/upload-portal-file.ts),
// so only links to that storage are accepted.
const STORAGE_PREFIXES = ["https://firebasestorage.googleapis.com/", "https://storage.googleapis.com/"];

const SaveJourneyTaskSchema = z.object({
  applicationId: z.string().min(1),
  submissionId: z.string().nullable().optional(),
  // school applications: who it is for, only used when the submission is created
  target: ApplyTargetInputSchema.nullable().optional(),
  taskId: z.string().min(1),
  answers: z.record(z.string(), z.string().max(5000)),
  files: z
    .array(
      z.object({
        url: z.string().max(2000),
        name: z.string().min(1).max(300),
        mimeType: z.string().max(120).nullable().optional(),
        size: z.number().int().nonnegative().nullable().optional(),
      })
    )
    .max(40),
  // true = Save changes: send it if nothing is missing. false = keep as a draft.
  submit: z.boolean(),
});

export type SaveJourneyTaskInput = z.infer<typeof SaveJourneyTaskSchema>;

export type SaveJourneyTaskResult =
  | {
      success: true;
      submissionId: string;
      status: TaskStatusValue;
      /** Set when the applicant pressed Save but something is still missing: it was kept as a draft. */
      missing: string | null;
    }
  | { success: false; error: string };

export async function saveJourneyTask(input: SaveJourneyTaskInput): Promise<SaveJourneyTaskResult> {
  const user = await requireUser();

  const parsed = SaveJourneyTaskSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid data" };
  const { applicationId, submissionId, target, taskId, answers, files, submit } = parsed.data;

  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: { id: true, isActive: true, kind: true, slug: true, terminal: { select: { slug: true } } },
  });
  if (!application || !application.isActive) return { success: false, error: "Application not found" };

  const task = await db.applicationTask.findFirst({ where: { id: taskId, applicationId }, select: { id: true } });
  if (!task) return { success: false, error: "This document is not part of the application" };

  if (files.some((f) => !STORAGE_PREFIXES.some((prefix) => f.url.startsWith(prefix)))) {
    return { success: false, error: "One of the files could not be accepted. Please upload it again." };
  }

  // find or create the submission (created here, on the first save, never before)
  const found = await getOrCreateSubmission({ userId: user.id, application, submissionId, target });
  if (!found.ok) return { success: false, error: found.error };
  const submission = found.submission;

  // run the engine on the saved state to see whether this task can be changed right now
  const course = await db.applicationSubmission.findUnique({
    where: { id: submission.id },
    select: { institutionCourse: { select: { level: true } }, schoolCourse: { select: { level: true } } },
  });
  const { view } = await getJourney({
    userId: user.id,
    applicationId,
    submissionId: submission.id,
    courseLevel: course?.institutionCourse?.level ?? course?.schoolCourse?.level ?? null,
  });

  const taskView = view.stages.flatMap((s) => s.tasks).find((t) => t.def.id === taskId);
  if (!taskView) return { success: false, error: "This document is not needed for your application" };

  if (taskView.def.kind === "MILESTONE") return { success: false, error: "This step is completed by your counsellor" };
  if (!taskView.editable) {
    const stage = view.stages.find((s) => s.tasks.some((t) => t.def.id === taskId));
    if (stage?.status === "LOCKED") return { success: false, error: "Finish the earlier stage first" };
    if (taskView.state === "VERIFIED") return { success: false, error: "This document was already verified" };
    return { success: false, error: "This stage is closed and can no longer be edited" };
  }
  if (files.length > taskView.def.maxFiles) {
    return { success: false, error: `You can add up to ${taskView.def.maxFiles} pages here` };
  }

  const clean = cleanTaskAnswers(taskView.def, answers);
  const missing = submit ? taskMissing(taskView.def, clean, files.length) : null;
  const status: TaskStatusValue = submit && !missing ? "SUBMITTED" : "DRAFT";
  const now = new Date();

  // what the applicant changed replaces any earlier review
  const row = await db.submissionTask.upsert({
    where: { submissionId_taskId: { submissionId: submission.id, taskId } },
    create: {
      submissionId: submission.id,
      taskId,
      status,
      answers: clean as Prisma.InputJsonValue,
      submittedAt: status === "SUBMITTED" ? now : null,
    },
    update: {
      status,
      answers: clean as Prisma.InputJsonValue,
      submittedAt: status === "SUBMITTED" ? now : null,
      reviewNote: null,
      badge: null,
      reviewedAt: null,
      reviewedById: null,
    },
  });

  await db.$transaction([
    db.submissionTaskFile.deleteMany({ where: { submissionTaskId: row.id } }),
    db.submissionTaskFile.createMany({
      data: files.map((f, index) => ({
        submissionTaskId: row.id,
        url: f.url,
        name: f.name,
        mimeType: f.mimeType ?? null,
        size: f.size ?? null,
        order: index,
      })),
    }),
  ]);

  await refreshSubmissionProgress(submission.id);

  revalidatePath("/portal");
  revalidatePath("/portal/applications");
  revalidatePath(`/portal/${application.terminal.slug}/${application.slug}`);
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${submission.id}`);

  return { success: true, submissionId: submission.id, status, missing };
}