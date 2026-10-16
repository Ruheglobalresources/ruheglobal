// src/lib/journey/data.ts
// Server only: reads the application engine from the database.
//   loadJourneyDefinition   the stages and tasks of an application, with the details inputs resolved
//   loadJourneyEntries      what one submission has saved on them
//   loadApplicantSource     what we already know about the applicant (profile, qualifications,
//                           eligibility answers), for the task rules and for prefilling
//   getJourney              all of it combined and run through the engine
import { db } from "@/lib/db";
import { parseShowWhen, type AnswerMap } from "@/lib/eligibility";
import { resolveFlowFields } from "@/lib/flow-fields";
import { computeJourney } from "./engine";
import { buildJourneyContext, type EligibilityAnswers } from "./context";
import type { PrefillSource } from "./prefill";
import type {
  JourneyStageDef,
  JourneyStageEntry,
  JourneyTaskDef,
  JourneyTaskEntry,
  JourneyView,
  StageCompletionValue,
  TaskKindValue,
  TaskStatusValue,
} from "./types";

const isoDay = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

export function asAnswerMap(json: unknown): AnswerMap {
  const out: AnswerMap = {};
  if (json && typeof json === "object" && !Array.isArray(json)) {
    for (const [key, value] of Object.entries(json as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) out[key] = value;
    }
  }
  return out;
}

export async function loadJourneyDefinition(applicationId: string): Promise<JourneyStageDef[]> {
  const stages = await db.applicationStage.findMany({
    where: { applicationId },
    orderBy: { stageNumber: "asc" },
    include: {
      tasks: {
        orderBy: [{ order: "asc" }, { title: "asc" }],
        include: { fields: { orderBy: { order: "asc" }, include: { fieldDefinition: true } } },
      },
    },
  });

  // every details input of the whole journey is resolved in one go, so the choice lists load once
  const rows = stages.flatMap((s) => s.tasks.flatMap((t) => t.fields));
  const resolved = await resolveFlowFields(rows);
  const byId = new Map(resolved.map((f) => [f.id, f]));

  return stages.map((stage) => ({
    id: stage.id,
    stageNumber: stage.stageNumber,
    slug: stage.slug,
    title: stage.title,
    description: stage.description,
    completion: stage.completion as StageCompletionValue,
    tasks: stage.tasks.map<JourneyTaskDef>((task) => ({
      id: task.id,
      slug: task.slug,
      stageId: task.stageId,
      groupTitle: task.groupTitle,
      subgroupTitle: task.subgroupTitle,
      title: task.title,
      description: task.description,
      kind: task.kind as TaskKindValue,
      isRequired: task.isRequired,
      order: task.order,
      maxFiles: task.maxFiles,
      accept: task.accept,
      showWhen: parseShowWhen(task.showWhen),
      qualificationLevel: task.qualificationLevel,
      fields: task.fields.map((row) => byId.get(row.id)).filter((f): f is NonNullable<typeof f> => !!f),
    })),
  }));
}

export async function loadJourneyEntries(
  submissionId: string | null
): Promise<{ taskEntries: JourneyTaskEntry[]; stageEntries: JourneyStageEntry[] }> {
  if (!submissionId) return { taskEntries: [], stageEntries: [] };

  const [tasks, stages] = await Promise.all([
    db.submissionTask.findMany({
      where: { submissionId },
      include: { files: { orderBy: { order: "asc" } } },
    }),
    db.submissionStage.findMany({ where: { submissionId } }),
  ]);

  return {
    taskEntries: tasks.map((t) => ({
      taskId: t.taskId,
      status: t.status as TaskStatusValue,
      answers: asAnswerMap(t.answers),
      files: t.files.map((f) => ({
        id: f.id,
        url: f.url,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size,
        order: f.order,
      })),
      reviewNote: t.reviewNote,
      badge: t.badge,
      submittedAt: t.submittedAt?.toISOString() ?? null,
    })),
    stageEntries: stages.map((s) => ({
      stageId: s.stageId,
      completedAt: s.completedAt?.toISOString() ?? null,
      note: s.note,
    })),
  };
}

export async function loadApplicantSource(userId: string): Promise<PrefillSource> {
  const [user, checks] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        profile: true,
        qualifications: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.eligibilityProfile.findMany({ where: { userId }, orderBy: { updatedAt: "asc" }, select: { answers: true } }),
  ]);

  // every check the person took, the most recent answer of a question wins
  const eligibility: EligibilityAnswers = {};
  for (const check of checks) {
    if (check.answers && typeof check.answers === "object" && !Array.isArray(check.answers)) {
      for (const [key, value] of Object.entries(check.answers as Record<string, unknown>)) {
        if (typeof value === "string" || (Array.isArray(value) && value.every((v) => typeof v === "string"))) {
          eligibility[key] = value as string | string[];
        }
      }
    }
  }

  const p = user?.profile;
  return {
    name: user?.name ?? null,
    email: user?.email ?? null,
    profile: p
      ? {
          phone: p.phone,
          nationality: p.nationality,
          residenceCountry: p.residenceCountry,
          residenceCity: p.residenceCity,
          dateOfBirth: isoDay(p.dateOfBirth),
        }
      : null,
    qualifications: (user?.qualifications ?? []).map((q) => ({
      level: q.level,
      institution: q.institution,
      programme: q.programme,
      country: q.country,
      endYear: q.endYear,
      grade: q.grade,
    })),
    eligibility,
  };
}

export type LoadedJourney = {
  stages: JourneyStageDef[];
  view: JourneyView;
  context: AnswerMap;
  source: PrefillSource;
};

export async function getJourney(opts: {
  userId: string;
  applicationId: string;
  submissionId: string | null;
  /** The level of the course being applied for, when there is one. */
  courseLevel: string | null;
}): Promise<LoadedJourney> {
  const [stages, entries, source] = await Promise.all([
    loadJourneyDefinition(opts.applicationId),
    loadJourneyEntries(opts.submissionId),
    loadApplicantSource(opts.userId),
  ]);
  const context = buildJourneyContext({ eligibility: source.eligibility, courseLevel: opts.courseLevel });
  const view = computeJourney({ stages, ...entries, context });
  return { stages, view, context, source };
}