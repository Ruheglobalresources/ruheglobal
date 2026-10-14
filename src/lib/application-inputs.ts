// src/lib/application-inputs.ts
// The rules of what an admin may do with the inputs of an application. Plain functions with no
// database and no React, so the admin page, the server actions and any later tool all follow the
// same rules. This file is the single place that says which inputs an application REQUIRES.
//
// Three kinds of input on an application:
//   locked      the code needs it (listed below). The admin can see it but never edit or remove it.
//   needed      not in the list, but another input of the same application depends on it (a showWhen
//               rule or a "depends on" list). Same treatment, so nothing is left hanging.
//   adjustable  everything else. The admin can change Required, its position, or remove it.
//
// When you add a new eligibility pill, or a new question that the code reads, add its keys here.
import { LOCKED_TARGET_KEYS } from "@/lib/application-target";

// Eligibility applications, by Application.slug. These match prisma/data/eligibility-questions.ts.
export const ELIGIBILITY_LOCKED_KEYS: Record<string, string[]> = {
  "study-abroad": [
    "study_level",
    "study_subjects",
    "education_country",
    "education_university",
    "grading_system",
    "grade_score",
    "studied_major",
    "english_test",
    "ielts_overall",
    "ielts_listening",
    "ielts_reading",
    "ielts_writing",
    "ielts_speaking",
    "english_overall_score",
    "study_start",
    "destination_country",
  ],
  "visa-application": ["destination_country", "visa_type", "visa_refused_before"],
  accommodation: ["destination_country", "accommodation_city", "accommodation_type", "accommodation_move_in"],
  "work-abroad": ["destination_country", "work_field", "work_experience"],
};

// The school application: the chosen school and course fill these two, the student cannot change them.
const SCHOOL_LOCKED_KEYS: string[] = [...LOCKED_TARGET_KEYS];

export type InputDef = {
  id: string;
  key: string;
  label: string;
  type: string;
  category: string;
  options: unknown;
  optionsSource: string;
  dependsOnKey: string | null;
  alsoDependsOnKey: string | null;
  allowOther: boolean;
};

export type InputRow = {
  id: string; // ApplicationField id
  fieldDefinitionId: string;
  isRequired: boolean;
  stepNumber: number;
  order: number;
  showWhen: unknown;
  def: InputDef;
};

export type AppIdentity = { kind: string; slug: string };

export type InputState = "locked" | "needed" | "adjustable";

export type InputCard = {
  id: string;
  label: string;
  key: string;
  type: string;
  isRequired: boolean;
  stepNumber: number;
  order: number;
  state: InputState;
  reason: string | null;
  when: string | null;
};

export type InputStepGroup = { stepNumber: number; title: string; emoji: string | null; cards: InputCard[] };
export type AvailableInput = { id: string; label: string; key: string; type: string; blocked: string | null };
export type AvailableGroup = { category: string; items: AvailableInput[] };

export type InputsView = {
  applicationId: string;
  isEligibility: boolean;
  canEditStep: boolean;
  groups: InputStepGroup[];
  available: AvailableGroup[];
  hiddenCount: number;
  problems: string[];
  lockedCount: number;
  adjustableCount: number;
};

export const EXTRA_STEP_TITLE = "Extra details";

const ALL_LOCKED = new Set<string>([...Object.values(ELIGIBILITY_LOCKED_KEYS).flat(), ...SCHOOL_LOCKED_KEYS]);

// True when ANY application needs this key. The field library refuses to edit or delete these.
export const isCodeLockedKey = (key: string) => ALL_LOCKED.has(key);

export function lockedKeysFor(app: AppIdentity): Set<string> {
  if (app.kind === "ELIGIBILITY") return new Set(ELIGIBILITY_LOCKED_KEYS[app.slug] ?? []);
  if (app.kind === "SCHOOL") return new Set(SCHOOL_LOCKED_KEYS);
  return new Set();
}

function lockedReason(app: AppIdentity): string {
  if (app.kind === "ELIGIBILITY") return "Required by the eligibility check";
  if (app.kind === "SCHOOL") return "Filled in from the school or course the applicant chose";
  return "Required by this application";
}

// Prisma rows -> the plain shape the rules work on.
export function toInputRow(f: {
  id: string;
  fieldDefinitionId: string;
  isRequired: boolean;
  stepNumber: number;
  order: number;
  showWhen: unknown;
  fieldDefinition: InputDef;
}): InputRow {
  const d = f.fieldDefinition;
  return {
    id: f.id,
    fieldDefinitionId: f.fieldDefinitionId,
    isRequired: f.isRequired,
    stepNumber: f.stepNumber,
    order: f.order,
    showWhen: f.showWhen,
    def: {
      id: d.id,
      key: d.key,
      label: d.label,
      type: d.type,
      category: d.category,
      options: d.options,
      optionsSource: d.optionsSource,
      dependsOnKey: d.dependsOnKey,
      alsoDependsOnKey: d.alsoDependsOnKey,
      allowOther: d.allowOther,
    },
  };
}

// ── showWhen ────────────────────────────────────────────────────────────

function showWhenKey(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const key = (raw as { fieldKey?: unknown }).fieldKey;
  return typeof key === "string" && key ? key : null;
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export function describeShowWhen(raw: unknown): string | null {
  const key = showWhenKey(raw);
  if (!key) return null;
  const rule = raw as { in?: unknown; notIn?: unknown };
  const include = strings(rule.in);
  const exclude = strings(rule.notIn);
  if (include.length > 0) return `Shown when ${key} is ${include.join(" or ")}`;
  if (exclude.length > 0) return `Shown when ${key} is not ${exclude.join(" or ")}`;
  return `Shown when ${key} is answered`;
}

// ── can the eligibility check actually show and collect this input? ─────

const DEPENDENT_SOURCES = new Set(["UNIVERSITIES", "CITIES", "VISA_TYPES"]);

// null = fine. Otherwise the reason the eligibility check could not collect an answer. A required input
// like this is what leaves the Continue button disabled for ever, so it is refused up front.
export function wizardProblem(def: InputDef, isRequired: boolean): string | null {
  if (def.type === "FILE" || def.type === "IMAGE") {
    return "The eligibility check cannot show file or image uploads, so nobody could answer it.";
  }
  if (def.type === "SELECT" || def.type === "MULTI_SELECT") {
    if (def.optionsSource === "STATIC") {
      const count = strings(def.options).filter((o) => o.trim()).length;
      if (count === 0) return "Its list has no choices yet.";
    }
    if (DEPENDENT_SOURCES.has(def.optionsSource) && !def.dependsOnKey) {
      return "Its list depends on an earlier question, but none is set on the input.";
    }
    if (isRequired && (def.optionsSource === "UNIVERSITIES" || def.optionsSource === "CITIES") && !def.allowOther) {
      return "Its list can be empty for some answers and it has no Other choice, so it cannot be required.";
    }
  }
  return null;
}

// ── order and dependencies ──────────────────────────────────────────────

function dependenciesOf(row: InputRow): { key: string; soft: boolean }[] {
  const out: { key: string; soft: boolean }[] = [];
  if (row.def.dependsOnKey) out.push({ key: row.def.dependsOnKey, soft: false });
  // the second list (visa purpose) is optional: without it the visa types fall back to "Not sure yet"
  if (row.def.alsoDependsOnKey) out.push({ key: row.def.alsoDependsOnKey, soft: true });
  const rule = showWhenKey(row.showWhen);
  if (rule) out.push({ key: rule, soft: false });
  return out;
}

// The wizard reads inputs in step then order, and an input only sees answers given before it.
const isEarlier = (a: InputRow, b: InputRow) =>
  a.stepNumber < b.stepNumber || (a.stepNumber === b.stepNumber && a.order <= b.order);

export function layoutProblems(rows: InputRow[]): string[] {
  const byKey = new Map(rows.map((r) => [r.def.key, r]));
  const out: string[] = [];
  for (const row of rows) {
    for (const dep of dependenciesOf(row)) {
      const found = byKey.get(dep.key);
      if (!found) {
        if (!dep.soft) out.push(`"${row.def.label}" needs "${dep.key}" in this application, and it is missing.`);
        continue;
      }
      if (!isEarlier(found, row)) out.push(`"${found.def.label}" must come before "${row.def.label}".`);
    }
  }
  return out;
}

// Problems that a change would ADD (problems that were already there do not block an unrelated change).
export function layoutRegressions(before: InputRow[], after: InputRow[]): string[] {
  const existing = new Set(layoutProblems(before));
  return layoutProblems(after).filter((p) => !existing.has(p));
}

// ── what the admin may do with each input ───────────────────────────────

export function classifyRows(app: AppIdentity, rows: InputRow[]): (InputRow & { state: InputState; reason: string | null })[] {
  const locked = lockedKeysFor(app);
  return rows.map((row) => {
    if (locked.has(row.def.key)) return { ...row, state: "locked" as const, reason: lockedReason(app) };
    const dependents = rows
      .filter((o) => o.id !== row.id && dependenciesOf(o).some((d) => d.key === row.def.key))
      .map((o) => o.def.label);
    if (dependents.length > 0) return { ...row, state: "needed" as const, reason: `Needed by ${dependents.join(", ")}` };
    return { ...row, state: "adjustable" as const, reason: null };
  });
}

// Locked inputs the eligibility seed should have put on the application but are not there.
export function missingLockedKeys(app: AppIdentity, rows: InputRow[]): string[] {
  if (app.kind !== "ELIGIBILITY") return [];
  const have = new Set(rows.map((r) => r.def.key));
  return [...lockedKeysFor(app)].filter((k) => !have.has(k));
}

export type AddCheck = { kind: "ok" } | { kind: "hidden"; message: string } | { kind: "blocked"; message: string };

// hidden: never offered (the eligibility check could not show it). blocked: offered but disabled.
export function addCheck(app: AppIdentity, rows: InputRow[], def: InputDef): AddCheck {
  if (app.kind === "ELIGIBILITY") {
    const problem = wizardProblem(def, false);
    if (problem) return { kind: "hidden", message: problem };
  }
  if (def.dependsOnKey && !rows.some((r) => r.def.key === def.dependsOnKey)) {
    return { kind: "blocked", message: `Add "${def.dependsOnKey}" first, this input depends on it.` };
  }
  return { kind: "ok" };
}

// Where a newly added input goes. Eligibility: always its own last step, so it can never sit between
// the questions the code reads. Other applications: the end of the last step (the admin can move it).
export function placementForNew(app: AppIdentity, rows: InputRow[]): { stepNumber: number; order: number } {
  const nextOrder = (step: number) => Math.max(-1, ...rows.filter((r) => r.stepNumber === step).map((r) => r.order)) + 1;
  if (app.kind === "ELIGIBILITY") {
    const locked = lockedKeysFor(app);
    const lastCoreStep = Math.max(0, ...rows.filter((r) => locked.has(r.def.key)).map((r) => r.stepNumber));
    const stepNumber = lastCoreStep + 1;
    return { stepNumber, order: nextOrder(stepNumber) };
  }
  const stepNumber = Math.max(1, ...rows.map((r) => r.stepNumber));
  return { stepNumber, order: nextOrder(stepNumber) };
}