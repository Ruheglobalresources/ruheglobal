// src/app/portal/[terminalSlug]/[applicationSlug]/tasks/[taskSlug]/page.tsx
// One document of the timeline (Passport, Graduation Certificate...): the pages, the document and
// "Fill in your details". Opens inside the portal like every other page, not as a modal.
// Only an open stage can be entered: a locked stage and a step done by staff go back to the timeline.
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { isEditableStatus } from "@/constants/submission-status";
import { TaskWorkspace } from "@/components/journey/task-workspace";
import { findTaskView } from "@/lib/journey/engine";
import { journeyHref } from "@/lib/journey/paths";
import { buildTaskPrefill } from "@/lib/journey/prefill";
import { loadJourneyRoute, type JourneySearchParams } from "@/lib/journey/route-data";

export const dynamic = "force-dynamic";

export default async function JourneyTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ terminalSlug: string; applicationSlug: string; taskSlug: string }>;
  searchParams: Promise<JourneySearchParams>;
}) {
  const { terminalSlug, applicationSlug, taskSlug } = await params;
  const sp = await searchParams;
  const session = await auth();
  const userId = session!.user.id;

  const route = await loadJourneyRoute({ userId: userId!, terminalSlug, applicationSlug, search: sp });
  if (route.state === "redirect") redirect(route.to);
  if (route.state !== "ok") notFound();

  const path = {
    terminalSlug,
    applicationSlug,
    submissionId: route.submission?.id ?? null,
    target: route.pendingTarget,
  };

  const found = findTaskView(route.journey.view, taskSlug);
  if (!found) notFound();
  const { stage, task } = found;

  // locked stage, or a step the counsellor does for the applicant: back to the timeline
  if (stage.status === "LOCKED" || task.def.kind === "MILESTONE") {
    redirect(journeyHref(path, stage.def.stageNumber));
  }

  // First visit: the details start with what the applicant told us before (nationality and so on).
  // Once the task has been saved, what they saved is what they see.
  const initialAnswers = task.entry ? task.entry.answers : buildTaskPrefill(task.def, route.journey.source);

  // a closed application (approved, rejected, completed) can no longer be edited, whatever the stage says
  const applicationOpen = !route.submission || isEditableStatus(route.submission.status);
  const editable = task.editable && applicationOpen;

  const lockedReason = editable
    ? null
    : !applicationOpen
      ? "This application is closed"
      : task.state === "VERIFIED"
        ? "Verified by your counsellor"
        : stage.signedOff
          ? "This stage is closed"
          : null;

  return (
    <TaskWorkspace
      applicationId={route.application.id}
      task={task.def}
      stageTitle={stage.def.title}
      stageNumber={stage.def.stageNumber}
      state={task.state}
      editable={editable}
      lockedReason={lockedReason}
      initialFiles={task.entry?.files ?? []}
      initialAnswers={initialAnswers}
      reviewNote={task.entry?.reviewNote ?? null}
      badge={task.entry?.badge ?? null}
      path={path}
      target={route.pendingTarget}
    />
  );
}