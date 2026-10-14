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
  type OptionNotes,
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

export type DependentOptions = { options: string[]; notes: OptionNotes };

const NONE: DependentOptions = { options: [], notes: {} };

// The choices of a list that depends on an earlier answer:
//   UNIVERSITIES  the universities of a country            (dependsValue = country name)
//   CITIES        the cities of a destination              (dependsValue = destination name)
//   VISA_TYPES    the visas of a destination, filed under the purpose the person picked
//                 (dependsValue = destination name, alsoValue = the purpose, by name, goal wording or slug)
// A destination with no visa for the purpose gets one "Not sure yet" choice, so a required
// question is never a dead end.
export async function getDependentOptions(
  source: FlowOptionsSource,
  dependsValue: string,
  alsoValue: string
): Promise<DependentOptions> {
  if (!dependsValue) return NONE;

  if (source === "UNIVERSITIES") {
    const rows = await db.university.findMany({
      where: { isActive: true, country: { name: dependsValue, isActive: true } },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { name: true },
    });
    return { options: rows.map((r) => r.name), notes: {} };
  }

  if (source === "CITIES") {
    const rows = await db.city.findMany({
      where: { isActive: true, destination: { name: dependsValue, isActive: true } },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { name: true, region: true },
    });
    const notes: OptionNotes = {};
    for (const r of rows) if (r.region) notes[r.name] = { description: r.region };
    return { options: rows.map((r) => r.name), notes };
  }

  if (source === "VISA_TYPES") {
    let purposeId: string | undefined;
    if (alsoValue) {
      const purpose = await db.visaPurpose.findFirst({
        where: {
          isActive: true,
          OR: [
            { name: { equals: alsoValue, mode: "insensitive" } },
            { goalLabel: { equals: alsoValue, mode: "insensitive" } },
            { slug: alsoValue },
          ],
        },
        select: { id: true },
      });
      if (!purpose) return { options: ["Not sure yet"], notes: NOT_SURE_NOTES };
      purposeId = purpose.id;
    }

    const rows = await db.visaType.findMany({
      where: {
        isActive: true,
        destination: { name: dependsValue, isActive: true },
        ...(purposeId ? { purposeId } : {}),
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { name: true, summary: true },
    });
    if (rows.length === 0) return { options: ["Not sure yet"], notes: NOT_SURE_NOTES };

    const notes: OptionNotes = {};
    for (const r of rows) notes[r.name] = { description: r.summary };
    return { options: rows.map((r) => r.name), notes };
  }

  return NONE;
}

const NOT_SURE_NOTES: OptionNotes = {
  "Not sure yet": { description: "We will help you find the right visa for your plans." },
};

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

  // Destinations and the "what do you want to do abroad" goals are short lists that do not depend on
  // an earlier answer, so they ship with the questions too.
  const sources = new Set(application.fields.map((f) => f.fieldDefinition.optionsSource));

  const destinationNames = sources.has("DESTINATIONS")
    ? (
        await db.destination.findMany({
          where: { isActive: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: { name: true },
        })
      ).map((d) => d.name)
    : [];

  const purposes = sources.has("VISA_PURPOSES")
    ? await db.visaPurpose.findMany({
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { name: true, goalLabel: true, description: true, emoji: true },
      })
    : [];
  const purposeNames = purposes.map((p) => p.name);
  const purposeNotes: OptionNotes = {};
  for (const p of purposes) {
    purposeNotes[p.name] = {
      title: p.goalLabel,
      description: p.description ?? undefined,
      emoji: p.emoji ?? undefined,
    };
  }

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
      alsoDependsOnKey: def.alsoDependsOnKey,
      allowOther: def.allowOther,
      otherLabel: def.otherLabel,
      maxSelections: def.maxSelections,
      // a list that depends on an earlier answer starts empty and is loaded in the browser
      options:
        def.optionsSource === "COUNTRIES"
          ? countryNames
          : def.optionsSource === "STATIC"
            ? asStrings(def.options)
            : def.optionsSource === "DESTINATIONS"
              ? destinationNames
              : def.optionsSource === "VISA_PURPOSES"
                ? purposeNames
                : [],
      notes: def.optionsSource === "VISA_PURPOSES" ? purposeNotes : {},
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


// // src/lib/eligibility-data.ts
// // Server-only: reads the eligibility questions and a user's answers from the database.
// //   - the pills of "What would you like to do today?": every active application of an ELIGIBILITY terminal
// //   - one flow: its steps (with headings), questions, choices and the answers already saved
// import { db } from "@/lib/db";
// import {
//   parseShowWhen,
//   type AnswerMap,
//   type FlowDisplay,
//   type FlowField,
//   type FlowFieldType,
//   type FlowOptionsSource,
//   type FlowStep,
// } from "@/lib/eligibility";

// export type EligibilityPill = {
//   id: string;
//   name: string;
//   slug: string;
//   subtitle: string | null;
//   icon: string | null;
// };

// export type EligibilityFlowData = {
//   applicationId: string;
//   name: string;
//   steps: FlowStep[];
//   submissionId: string | null;
//   answers: AnswerMap;
// };

// const asStrings = (json: unknown): string[] =>
//   Array.isArray(json) ? json.filter((v): v is string => typeof v === "string") : [];

// export async function getEligibilityPills(): Promise<EligibilityPill[]> {
//   return db.application.findMany({
//     where: { kind: "ELIGIBILITY", isActive: true, terminal: { isActive: true } },
//     orderBy: [{ order: "asc" }, { name: "asc" }],
//     select: { id: true, name: true, slug: true, subtitle: true, icon: true },
//   });
// }

// export async function getEligibilityFlow(userId: string, applicationId: string): Promise<EligibilityFlowData | null> {
//   const application = await db.application.findFirst({
//     where: { id: applicationId, kind: "ELIGIBILITY", isActive: true },
//     include: {
//       steps: true,
//       fields: {
//         orderBy: [{ stepNumber: "asc" }, { order: "asc" }],
//         include: { fieldDefinition: true },
//       },
//     },
//   });
//   if (!application) return null;

//   // Countries are a short list, so they ship with the questions. Universities depend on the chosen
//   // country and are loaded when it is picked (see loadUniversities in actions/eligibility.ts).
//   const needsCountries = application.fields.some((f) => f.fieldDefinition.optionsSource === "COUNTRIES");
//   const countryNames = needsCountries
//     ? (
//         await db.country.findMany({
//           where: { isActive: true },
//           orderBy: [{ order: "asc" }, { name: "asc" }],
//           select: { name: true },
//         })
//       ).map((c) => c.name)
//     : [];

//   const stepMeta = new Map(application.steps.map((s) => [s.stepNumber, s]));
//   const byStep = new Map<number, FlowField[]>();

//   for (const row of application.fields) {
//     const def = row.fieldDefinition;
//     const field: FlowField = {
//       id: row.id,
//       key: def.key,
//       label: def.label,
//       type: def.type as FlowFieldType,
//       display: def.display as FlowDisplay,
//       optionsSource: def.optionsSource as FlowOptionsSource,
//       dependsOnKey: def.dependsOnKey,
//       maxSelections: def.maxSelections,
//       options: def.optionsSource === "COUNTRIES" ? countryNames : def.optionsSource === "STATIC" ? asStrings(def.options) : [],
//       suggestions: asStrings(def.suggestions),
//       placeholder: def.placeholder,
//       helpText: def.helpText,
//       pattern: def.pattern,
//       isRequired: row.isRequired,
//       showWhen: parseShowWhen(row.showWhen),
//     };
//     byStep.set(row.stepNumber, [...(byStep.get(row.stepNumber) ?? []), field]);
//   }

//   const steps: FlowStep[] = [...byStep.entries()]
//     .sort(([a], [b]) => a - b)
//     .map(([stepNumber, fields]) => {
//       const meta = stepMeta.get(stepNumber);
//       const first = application.fields.find((f) => f.stepNumber === stepNumber);
//       return {
//         stepNumber,
//         title: meta?.title ?? first?.fieldDefinition.category ?? `Step ${stepNumber}`,
//         emoji: meta?.emoji ?? null,
//         fields,
//       };
//     });

//   // The answers saved by an earlier run, so a returning person sees them filled in.
//   const submission = await db.applicationSubmission.findFirst({
//     where: { userId, applicationId },
//     orderBy: { updatedAt: "desc" },
//     include: { values: true },
//   });

//   const keyByFieldId = new Map(application.fields.map((f) => [f.id, f.fieldDefinition.key]));
//   const answers: AnswerMap = {};
//   for (const v of submission?.values ?? []) {
//     const key = keyByFieldId.get(v.applicationFieldId);
//     if (key && v.value?.trim()) answers[key] = v.value;
//   }

//   return { applicationId: application.id, name: application.name, steps, submissionId: submission?.id ?? null, answers };
// }