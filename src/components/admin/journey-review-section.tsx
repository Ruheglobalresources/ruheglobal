// src/components/admin/journey-review-section.tsx
// Loads the timeline of one submission and hands it to the review panel. Renders nothing for a
// submission of a classic application (no stages), so the admin page can always include it.
import { db } from "@/lib/db";
import { getJourney } from "@/lib/journey/data";
import { visibleTaskFields } from "@/lib/journey/engine";
import { JourneyReview, type ReviewStage } from "./journey-review";

export async function JourneyReviewSection({ submissionId }: { submissionId: string }) {
  const submission = await db.applicationSubmission.findUnique({
    where: { id: submissionId },
    select: {
      userId: true,
      applicationId: true,
      institutionCourse: { select: { level: true } },
      schoolCourse: { select: { level: true } },
    },
  });
  if (!submission) return null;

  const { view } = await getJourney({
    userId: submission.userId,
    applicationId: submission.applicationId,
    submissionId,
    courseLevel: submission.institutionCourse?.level ?? submission.schoolCourse?.level ?? null,
  });
  if (view.stages.length === 0) return null;

  const stages: ReviewStage[] = view.stages.map((stage) => ({
    id: stage.def.id,
    number: stage.def.stageNumber,
    title: stage.def.title,
    status: stage.status,
    completion: stage.def.completion,
    signedOff: stage.signedOff,
    completedAt: stage.completedAt,
    note: stage.note,
    requiredDone: stage.requiredDone,
    requiredTotal: stage.requiredTotal,
    tasks: stage.tasks.map((task) => {
      const answers = task.entry?.answers ?? {};
      return {
        id: task.def.id,
        title: task.def.title,
        heading: [task.def.groupTitle, task.def.subgroupTitle].filter(Boolean).join(" / "),
        kind: task.def.kind,
        isRequired: task.def.isRequired,
        state: task.state,
        files: (task.entry?.files ?? []).map((f) => ({ url: f.url, name: f.name, mimeType: f.mimeType })),
        details: visibleTaskFields(task.def, answers)
          .map((field) => ({ label: field.label, value: answers[field.key] ?? "" }))
          .filter((d) => d.value),
        reviewNote: task.entry?.reviewNote ?? null,
        badge: task.entry?.badge ?? null,
      };
    }),
  }));

  return <JourneyReview submissionId={submissionId} stages={stages} />;
}