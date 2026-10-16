"use server";

// src/actions/eligibility.ts
// The server side of the eligibility check. Saving each step reuses saveSubmissionStep (the same
// action the application wizard uses); what is specific to the eligibility check lives here:
// loading a flow, the choices of a list that depends on an earlier answer (the universities of a
// country, the cities of a destination, the visas of a destination and purpose), and finishing
// (which saves the profile and says where the person goes next: the school search for Study abroad,
// stage 1 of the visa application for Visa application, the course list for the others).
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { isEditableStatus, isUnsubmittedStatus } from "@/constants/submission-status";
import {
  getDependentOptions,
  getEligibilityFlow,
  type DependentOptions,
  type EligibilityFlowData,
} from "@/lib/eligibility-data";
import {
  courseSearchQuery,
  findMissingRequired,
  getVisibleSteps,
  isDependentSource,
  toProfileAnswers,
  type FlowOptionsSource,
} from "@/lib/eligibility";
import { STUDY_ABROAD_SLUG, studySearchUrl } from "@/lib/eligibility-search";
import { journeyHref } from "@/lib/journey/paths";
import { VISA_APPLICATION_TERMINAL_SLUG } from "@/lib/portal-paths";

export async function loadEligibilityFlow(applicationId: string): Promise<EligibilityFlowData | null> {
  const user = await requireUser();
  return getEligibilityFlow(user.id, applicationId);
}

// The universities of one country (by the country's name), best known first.
export async function loadUniversities(countryName: string): Promise<string[]> {
  await requireUser();
  const name = countryName.trim();
  if (!name) return [];

  const rows = await db.university.findMany({
    where: { isActive: true, country: { name, isActive: true } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { name: true },
  });
  return rows.map((r) => r.name);
}

// The choices of a question whose list depends on an earlier answer. `dependsValue` is the earlier
// answer (a country or destination name); `alsoValue` is the second one, only used by visa types
// (the purpose the person picked).
export async function loadDependentOptions(
  source: FlowOptionsSource,
  dependsValue: string,
  alsoValue?: string
): Promise<DependentOptions> {
  await requireUser();
  if (!isDependentSource(source)) return { options: [], notes: {} };
  return getDependentOptions(source, dependsValue.trim(), (alsoValue ?? "").trim());
}

// Where "Visa application" goes once the check is done: stage 1 of the visa application, the first
// active application with a timeline under the Visa Application terminal (or of the VISA kind).
// With none set up yet, the person lands on the Visa Application terminal page instead.
async function visaApplicationStageOne(): Promise<string> {
  const application = await db.application.findFirst({
    where: {
      isActive: true,
      terminal: { isActive: true },
      stages: { some: {} },
      OR: [{ terminal: { slug: VISA_APPLICATION_TERMINAL_SLUG } }, { kind: "VISA" }],
    },
    orderBy: [{ terminal: { order: "asc" } }, { order: "asc" }],
    select: { id: true, slug: true, terminal: { select: { slug: true } } },
  });
  if (!application) return `/portal/${VISA_APPLICATION_TERMINAL_SLUG}`;

  const firstStage = await db.applicationStage.findFirst({
    where: { applicationId: application.id },
    orderBy: { stageNumber: "asc" },
    select: { stageNumber: true },
  });
  return journeyHref(
    { terminalSlug: application.terminal.slug, applicationSlug: application.slug },
    firstStage?.stageNumber ?? 1
  );
}

type CompleteResult =
  | { success: true; redirect: string }
  | { success: false; error: string; stepNumber?: number };

// Called on the last step. Everything is checked again here, from what is saved in the database:
// every visible required question must be answered. Then the answers are kept as the user's
// EligibilityProfile (one flat { key: value } object for the course search) and the submission is
// marked as sent. It stays editable, so taking the check again just updates it.
export async function completeEligibility(applicationId: string, submissionId: string): Promise<CompleteResult> {
  const user = await requireUser();

  const submission = await db.applicationSubmission.findUnique({ where: { id: submissionId } });
  if (!submission || submission.applicationId !== applicationId || submission.userId !== user.id) {
    return { success: false, error: "We could not find your answers. Please try again." };
  }
  if (!isEditableStatus(submission.status)) {
    return { success: false, error: "This check is closed and can no longer be changed." };
  }

  const flow = await getEligibilityFlow(user.id, applicationId);
  if (!flow) return { success: false, error: "This check is not available right now." };

  const visible = getVisibleSteps(flow.steps, flow.answers);
  const missing = findMissingRequired(visible, flow.answers);
  if (missing) {
    return { success: false, error: `"${missing.label}" is required.`, stepNumber: missing.stepNumber };
  }

  const profile = toProfileAnswers(visible, flow.answers);
  const answers = profile as Prisma.InputJsonValue;
  const now = new Date();

  await db.$transaction([
    db.applicationSubmission.update({
      where: { id: submission.id },
      data: {
        status: isUnsubmittedStatus(submission.status) ? "SUBMITTED" : submission.status,
        submittedAt: submission.submittedAt ?? now,
      },
    }),
    db.eligibilityProfile.upsert({
      where: { userId_applicationId: { userId: user.id, applicationId } },
      create: { userId: user.id, applicationId, answers, completedAt: now },
      update: { answers, completedAt: now },
    }),
  ]);

  // Study abroad ends on the school search, with the answers filled in. Visa application opens stage 1
  // of the visa application. The other checks keep going to the course list.
  const application = await db.application.findUnique({ where: { id: applicationId }, select: { slug: true } });
  if (application?.slug === STUDY_ABROAD_SLUG) return { success: true, redirect: studySearchUrl(profile) };
  if (application?.slug === VISA_APPLICATION_TERMINAL_SLUG) {
    return { success: true, redirect: await visaApplicationStageOne() };
  }

  const query = courseSearchQuery(profile);
  return { success: true, redirect: query ? `/courses?q=${encodeURIComponent(query)}` : "/courses" };
}
