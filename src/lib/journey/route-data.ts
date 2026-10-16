// src/lib/journey/route-data.ts
// Everything the timeline page and the task page need, loaded the same way for both:
// which application, which submission is open, who a school application is FOR, the header of the
// page and the timeline itself. Shared so the two pages can never disagree about it.
// It reuses the target logic of school applications (lib/application-target.ts) and the
// "which submission is open" rule of the classic application page.
import { db } from "@/lib/db";
import {
  ApplyTargetInputSchema,
  resolveApplyTarget,
  targetInputFromSubmission,
  targetWhere,
  type ApplyTargetInput,
  type ResolvedApplyTarget,
} from "@/lib/application-target";
import { getJourney, type LoadedJourney } from "./data";

export type JourneySearchParams = {
  type?: string;
  target?: string;
  course?: string;
  submission?: string;
  stage?: string;
};

export type JourneyHeader = {
  title: string;
  subtitle: string | null;
  /** Small line above the title, "You are applying to" for a school. */
  eyebrow: string | null;
  backHref: string;
  backLabel: string;
  isTarget: boolean;
};

export type JourneyRoute =
  | { state: "missing" }
  | { state: "no-journey" }
  | { state: "redirect"; to: string }
  | {
      state: "ok";
      application: { id: string; name: string; slug: string; kind: string; terminalName: string; terminalSlug: string };
      submission: { id: string; status: string; currentStep: number } | null;
      /** Only set while there is no saved submission yet: the target travels in the address instead. */
      pendingTarget: ApplyTargetInput | null;
      header: JourneyHeader;
      journey: LoadedJourney;
      courseLevel: string | null;
    };

const submissionInclude = {
  institution: { select: { slug: true } },
  school: { select: { slug: true } },
} as const;

export async function loadJourneyRoute(args: {
  userId: string;
  terminalSlug: string;
  applicationSlug: string;
  search: JourneySearchParams;
}): Promise<JourneyRoute> {
  const { userId, terminalSlug, applicationSlug, search } = args;

  const application = await db.application.findFirst({
    where: { slug: applicationSlug, isActive: true, terminal: { slug: terminalSlug, isActive: true } },
    select: {
      id: true,
      name: true,
      slug: true,
      kind: true,
      terminal: { select: { name: true, slug: true } },
      _count: { select: { stages: true } },
    },
  });
  if (!application) return { state: "missing" };
  if (application._count.stages === 0) return { state: "no-journey" };

  const isSchoolFlow = application.kind === "SCHOOL";

  // 1. which submission is open: a link from the dashboard names it
  let submission = search.submission
    ? await db.applicationSubmission.findFirst({
        where: { id: search.submission, userId, applicationId: application.id },
        include: submissionInclude,
      })
    : null;
  if (search.submission && !submission) return { state: "redirect", to: "/portal" };

  // 2. a school application is always FOR a school or institution (and maybe a course)
  let targetInput: ApplyTargetInput | null = null;
  let resolved: ResolvedApplyTarget | null = null;

  if (isSchoolFlow) {
    if (submission) {
      targetInput = targetInputFromSubmission(submission);
    } else {
      const parsed = ApplyTargetInputSchema.safeParse({
        type: search.type === "school" ? "school" : "institution",
        slug: search.target ?? "",
        courseId: search.course || null,
      });
      // opened with no school chosen: send the student to pick one first
      if (!parsed.success) return { state: "redirect", to: "/institutions" };
      targetInput = parsed.data;
    }

    resolved = targetInput ? await resolveApplyTarget(targetInput) : null;

    if (!submission) {
      if (!resolved) return { state: "redirect", to: targetInput?.type === "school" ? "/search" : "/institutions" };
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

  // 3. the page header
  const targetName = submission?.targetName ?? resolved?.name ?? null;
  const courseName = submission?.targetCourseName ?? resolved?.courseName ?? null;
  const header: JourneyHeader =
    isSchoolFlow && targetName
      ? {
          title: targetName,
          subtitle: courseName,
          eyebrow: "You are applying to",
          backHref: resolved ? `/${resolved.type === "school" ? "schools" : "institutions"}/${resolved.slug}` : "/portal",
          backLabel: targetName,
          isTarget: true,
        }
      : {
          title: application.name,
          subtitle: application.terminal.name,
          eyebrow: null,
          backHref: `/portal/${terminalSlug}`,
          backLabel: application.terminal.name,
          isTarget: false,
        };

  // 4. the timeline
  const courseLevel = resolved?.courseLevel ?? null;
  const journey = await getJourney({
    userId,
    applicationId: application.id,
    submissionId: submission?.id ?? null,
    courseLevel,
  });

  return {
    state: "ok",
    application: {
      id: application.id,
      name: application.name,
      slug: application.slug,
      kind: application.kind,
      terminalName: application.terminal.name,
      terminalSlug: application.terminal.slug,
    },
    submission: submission ? { id: submission.id, status: submission.status, currentStep: submission.currentStep } : null,
    pendingTarget: submission ? null : targetInput,
    header,
    journey,
    courseLevel,
  };
}