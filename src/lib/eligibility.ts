// src/lib/eligibility.ts
// The rules of the eligibility check that need neither a database nor React: what a question looks
// like, when it is shown, whether a step is complete, and how the answers are turned into the
// profile the course search reads. Pure functions, so the web app, the server actions and later the
// mobile app can all use the same file.
//
// The questions themselves are NOT here: they live in the database (a terminal of kind ELIGIBILITY,
// one application per pill, see prisma/seed-eligibility.ts) so they can be edited without a developer.

export type FlowFieldType =
  | "TEXT"
  | "TEXTAREA"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "MULTI_SELECT"
  | "CHECKBOX"
  | "IMAGE"
  | "FILE";

export type FlowDisplay = "DEFAULT" | "PILLS" | "SEARCH";
export type FlowOptionsSource = "STATIC" | "COUNTRIES" | "UNIVERSITIES";

// Show a question only when an earlier answer matches. `in`: the answer is one of these.
// `notIn`: the answer is none of these. Stored as JSON on ApplicationField.showWhen.
export type ShowWhen = { fieldKey: string; in?: string[]; notIn?: string[] };

export type FlowField = {
  id: string; // ApplicationField id: every saved answer is keyed by it
  key: string; // FieldDefinition key: stable, what the course search reads
  label: string;
  type: FlowFieldType;
  display: FlowDisplay;
  optionsSource: FlowOptionsSource;
  dependsOnKey: string | null;
  maxSelections: number | null;
  options: string[];
  suggestions: string[];
  placeholder: string | null;
  helpText: string | null;
  pattern: string | null;
  isRequired: boolean;
  showWhen: ShowWhen | null;
};

export type FlowStep = {
  stepNumber: number;
  title: string;
  emoji: string | null;
  fields: FlowField[];
};

// Answers by field key. A multi-select answer is its choices joined with commas, the same way the
// application wizard stores it, so choices must not contain commas.
export type AnswerMap = Record<string, string>;

// The two answers the course search needs at minimum. Keep these keys in the questions.
export const KEY_STUDY_LEVEL = "study_level";
export const KEY_STUDY_SUBJECTS = "study_subjects";

export const splitMulti = (value?: string | null) =>
  value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

export const joinMulti = (values: string[]) => values.join(",");

export function parseShowWhen(json: unknown): ShowWhen | null {
  if (!json || typeof json !== "object") return null;
  const raw = json as Record<string, unknown>;
  if (typeof raw.fieldKey !== "string") return null;
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined);
  return { fieldKey: raw.fieldKey, in: list(raw.in), notIn: list(raw.notIn) };
}

function ruleMatches(rule: ShowWhen, answers: AnswerMap) {
  const raw = answers[rule.fieldKey]?.trim();
  if (!raw) return false;
  // a single choice may itself contain a comma, so the whole answer counts as one candidate too
  const chosen = [raw, ...splitMulti(raw)];
  if (rule.in && !chosen.some((v) => rule.in!.includes(v))) return false;
  if (rule.notIn && chosen.some((v) => rule.notIn!.includes(v))) return false;
  return true;
}

// The steps the person actually sees, in order, each with only its visible questions. A question is
// visible when it has no rule, or its rule matches AND the question the rule looks at is itself visible.
// A step with no visible question is skipped.
export function getVisibleSteps(steps: FlowStep[], answers: AnswerMap): FlowStep[] {
  const visibleKeys = new Set<string>();
  const out: FlowStep[] = [];

  for (const step of steps) {
    const fields: FlowField[] = [];
    for (const field of step.fields) {
      const rule = field.showWhen;
      const shown = !rule || (visibleKeys.has(rule.fieldKey) && ruleMatches(rule, answers));
      if (shown) {
        visibleKeys.add(field.key);
        fields.push(field);
      }
    }
    if (fields.length > 0) out.push({ ...step, fields });
  }
  return out;
}

// null = fine. Otherwise a short message for the person.
export function fieldError(field: FlowField, value: string | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;
  if (field.type === "NUMBER" && !/^\d+(\.\d+)?$/.test(text)) return "Enter a number";
  if (field.pattern) {
    try {
      if (!new RegExp(field.pattern).test(text)) return "Check this value";
    } catch {
      // a broken pattern in the admin must not block the person
    }
  }
  return null;
}

export function isStepComplete(step: FlowStep, answers: AnswerMap): boolean {
  return step.fields.every((field) => {
    const value = answers[field.key];
    if (field.isRequired && !value?.trim()) return false;
    return fieldError(field, value) === null;
  });
}

export function findMissingRequired(visible: FlowStep[], answers: AnswerMap): { stepNumber: number; label: string } | null {
  for (const step of visible) {
    for (const field of step.fields) {
      if (field.isRequired && !answers[field.key]?.trim()) return { stepNumber: step.stepNumber, label: field.label };
      if (fieldError(field, answers[field.key])) return { stepNumber: step.stepNumber, label: field.label };
    }
  }
  return null;
}

// The saved profile: only the questions that were shown, multi-selects as arrays.
export function toProfileAnswers(visible: FlowStep[], answers: AnswerMap): Record<string, string | string[]> {
  const profile: Record<string, string | string[]> = {};
  for (const step of visible) {
    for (const field of step.fields) {
      const value = answers[field.key]?.trim();
      if (!value) continue;
      profile[field.key] = field.type === "MULTI_SELECT" ? splitMulti(value) : value;
    }
  }
  return profile;
}

// What the course search is opened with for now: the first subject, else the study level.
// The AI search will read the whole profile later; this keeps the hand-off working today.
export function courseSearchQuery(profile: Record<string, string | string[]>): string {
  const subjects = profile[KEY_STUDY_SUBJECTS];
  const first = Array.isArray(subjects) ? subjects[0] : subjects;
  const level = profile[KEY_STUDY_LEVEL];
  return (first || (Array.isArray(level) ? level[0] : level) || "").toString().slice(0, 80);
}