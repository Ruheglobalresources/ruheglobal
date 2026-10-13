// src/lib/eligibility-data.ts
// Server-only: reads the eligibility questions and a user's answers from the database.
//   - the pills of "What would you like to do today?": every active application of an ELIGIBILITY terminal
//   - one flow: its steps (with headings), questions, choices and the answers already saved
import { db } from "@/lib/db";
import {
  parseShowWhen,
  type AnswerMap,
  type FlowDisplay,
  type FlowField,
  type FlowFieldType,
  type FlowOptionsSource,
  type FlowStep,
} from "@/lib/eligibility";

export type EligibilityPill = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  icon: string | null;
};

export type EligibilityFlowData = {
  applicationId: string;
  name: string;
  steps: FlowStep[];
  submissionId: string | null;
  answers: AnswerMap;
};

const asStrings = (json: unknown): string[] =>
  Array.isArray(json) ? json.filter((v): v is string => typeof v === "string") : [];

export async function getEligibilityPills(): Promise<EligibilityPill[]> {
  return db.application.findMany({
    where: { kind: "ELIGIBILITY", isActive: true, terminal: { isActive: true } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, subtitle: true, icon: true },
  });
}

export async function getEligibilityFlow(userId: string, applicationId: string): Promise<EligibilityFlowData | null> {
  const application = await db.application.findFirst({
    where: { id: applicationId, kind: "ELIGIBILITY", isActive: true },
    include: {
      steps: true,
      fields: {
        orderBy: [{ stepNumber: "asc" }, { order: "asc" }],
        include: { fieldDefinition: true },
      },
    },
  });
  if (!application) return null;

  // Countries are a short list, so they ship with the questions. Universities depend on the chosen
  // country and are loaded when it is picked (see loadUniversities in actions/eligibility.ts).
  const needsCountries = application.fields.some((f) => f.fieldDefinition.optionsSource === "COUNTRIES");
  const countryNames = needsCountries
    ? (
        await db.country.findMany({
          where: { isActive: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: { name: true },
        })
      ).map((c) => c.name)
    : [];

  const stepMeta = new Map(application.steps.map((s) => [s.stepNumber, s]));
  const byStep = new Map<number, FlowField[]>();

  for (const row of application.fields) {
    const def = row.fieldDefinition;
    const field: FlowField = {
      id: row.id,
      key: def.key,
      label: def.label,
      type: def.type as FlowFieldType,
      display: def.display as FlowDisplay,
      optionsSource: def.optionsSource as FlowOptionsSource,
      dependsOnKey: def.dependsOnKey,
      maxSelections: def.maxSelections,
      options: def.optionsSource === "COUNTRIES" ? countryNames : def.optionsSource === "STATIC" ? asStrings(def.options) : [],
      suggestions: asStrings(def.suggestions),
      placeholder: def.placeholder,
      helpText: def.helpText,
      pattern: def.pattern,
      isRequired: row.isRequired,
      showWhen: parseShowWhen(row.showWhen),
    };
    byStep.set(row.stepNumber, [...(byStep.get(row.stepNumber) ?? []), field]);
  }

  const steps: FlowStep[] = [...byStep.entries()]
    .sort(([a], [b]) => a - b)
    .map(([stepNumber, fields]) => {
      const meta = stepMeta.get(stepNumber);
      const first = application.fields.find((f) => f.stepNumber === stepNumber);
      return {
        stepNumber,
        title: meta?.title ?? first?.fieldDefinition.category ?? `Step ${stepNumber}`,
        emoji: meta?.emoji ?? null,
        fields,
      };
    });

  // The answers saved by an earlier run, so a returning person sees them filled in.
  const submission = await db.applicationSubmission.findFirst({
    where: { userId, applicationId },
    orderBy: { updatedAt: "desc" },
    include: { values: true },
  });

  const keyByFieldId = new Map(application.fields.map((f) => [f.id, f.fieldDefinition.key]));
  const answers: AnswerMap = {};
  for (const v of submission?.values ?? []) {
    const key = keyByFieldId.get(v.applicationFieldId);
    if (key && v.value?.trim()) answers[key] = v.value;
  }

  return { applicationId: application.id, name: application.name, steps, submissionId: submission?.id ?? null, answers };
}