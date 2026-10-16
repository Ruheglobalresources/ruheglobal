// src/lib/journey/sync.ts
// Keeps the submission row in step with the timeline after anything changes on it (the applicant
// saves a task, a counsellor verifies one or signs a stage off):
//   - currentStep follows the open stage, so lists and the admin show where the applicant is
//   - the first time the first stage is fully sent the submission becomes SUBMITTED (once) and the
//     applicant is pushed to the CRM, the same moment the classic wizard does it
//   - when every stage is complete the submission becomes COMPLETED
// The admin's own status choices (APPROVED, REJECTED) are never overwritten except by COMPLETED.
import { after } from "next/server";
import { db } from "@/lib/db";
import { syncSubmissionToCrm } from "@/lib/zoho/sync-submission";
import { isUnsubmittedStatus } from "@/constants/submission-status";
import { getJourney } from "./data";
import type { JourneyView } from "./types";

export async function refreshSubmissionProgress(submissionId: string): Promise<JourneyView | null> {
  const submission = await db.applicationSubmission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      userId: true,
      applicationId: true,
      status: true,
      submittedAt: true,
      currentStep: true,
      institutionCourse: { select: { level: true } },
      schoolCourse: { select: { level: true } },
    },
  });
  if (!submission) return null;

  const { view } = await getJourney({
    userId: submission.userId,
    applicationId: submission.applicationId,
    submissionId: submission.id,
    courseLevel: submission.institutionCourse?.level ?? submission.schoolCourse?.level ?? null,
  });
  if (view.stages.length === 0) return view;

  const first = view.stages[0];
  const firstStageSent = first.status === "IN_REVIEW" || first.status === "COMPLETE";
  const firstSend = firstStageSent && !submission.submittedAt && isUnsubmittedStatus(submission.status);

  const data: { currentStep?: number; status?: "SUBMITTED" | "COMPLETED"; submittedAt?: Date } = {};

  const step = view.currentStageNumber ?? view.stages[view.stages.length - 1].def.stageNumber;
  if (step !== submission.currentStep) data.currentStep = step;

  if (firstSend) {
    data.status = "SUBMITTED";
    data.submittedAt = new Date();
  }
  if (view.complete && submission.status !== "REJECTED" && submission.status !== "COMPLETED") {
    data.status = "COMPLETED";
  }

  if (Object.keys(data).length > 0) {
    await db.applicationSubmission.update({ where: { id: submission.id }, data });
  }
  if (firstSend) after(() => syncSubmissionToCrm(submission.id));

  return view;
}