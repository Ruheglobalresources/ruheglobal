import { FieldTypeValues, SubmissionStatusValues } from "@/schemas";

export type PortalFieldType = (typeof FieldTypeValues)[number];
export type ApplicationStatus = (typeof SubmissionStatusValues)[number];
export type AutosaveState = "idle" | "saving" | "saved" | "error";

export interface WizardFieldDefinition {
  id: string;
  key: string;
  label: string;
  type: PortalFieldType;
  category: string;
  placeholder: string | null;
  helpText: string | null;
  options: string[];
  minLength: number | null;
  maxLength: number | null;
  pattern: string | null;
}

export interface WizardField {
  id: string; // ApplicationField id — every SubmissionValue keys off this
  isRequired: boolean;
  stepNumber: number;
  order: number;
  definition: WizardFieldDefinition;
}

export interface WizardStep {
  stepNumber: number;
  title: string;
  fields: WizardField[];
}

export interface WizardAnswer {
  applicationFieldId: string;
  value: string | null;
  fileUrl: string | null;
}

// Minimal shape of a Prisma `ApplicationField` row with `fieldDefinition`
// included — matches every portal page's `include` without tying this file
// to a specific generated Prisma payload type.
interface ApplicationFieldRow {
  id: string;
  isRequired: boolean;
  stepNumber: number;
  order: number;
  fieldDefinition: {
    id: string;
    key: string;
    label: string;
    type: PortalFieldType;
    category: string;
    placeholder: string | null;
    helpText: string | null;
    options: unknown;
    minLength: number | null;
    maxLength: number | null;
    pattern: string | null;
  };
}

export function mapApplicationFields(rows: ApplicationFieldRow[]): WizardField[] {
  return rows.map((row) => ({
    id: row.id,
    isRequired: row.isRequired,
    stepNumber: row.stepNumber,
    order: row.order,
    definition: {
      id: row.fieldDefinition.id,
      key: row.fieldDefinition.key,
      label: row.fieldDefinition.label,
      type: row.fieldDefinition.type,
      category: row.fieldDefinition.category,
      placeholder: row.fieldDefinition.placeholder,
      helpText: row.fieldDefinition.helpText,
      options: Array.isArray(row.fieldDefinition.options) ? (row.fieldDefinition.options as string[]) : [],
      minLength: row.fieldDefinition.minLength,
      maxLength: row.fieldDefinition.maxLength,
      pattern: row.fieldDefinition.pattern,
    },
  }));
}

// Groups fields by step and sorts both steps and fields within a step. A
// step's title borrows the FieldDefinition `category` of its first field —
// the admin already organizes the field library into categories ("Personal
// Details", "Passport & Travel"...), so this reuses that instead of asking
// for a separate per-step label.
export function groupFieldsByStep(fields: WizardField[]): WizardStep[] {
  const byStep = new Map<number, WizardField[]>();
  for (const field of fields) {
    const list = byStep.get(field.stepNumber) ?? [];
    list.push(field);
    byStep.set(field.stepNumber, list);
  }

  return Array.from(byStep.entries())
    .sort(([a], [b]) => a - b)
    .map(([stepNumber, stepFields]) => {
      const sorted = [...stepFields].sort((a, b) => a.order - b.order);
      return {
        stepNumber,
        title: sorted[0]?.definition.category || `Step ${stepNumber}`,
        fields: sorted,
      };
    });
}

function isAnswered(answer: WizardAnswer | undefined) {
  return !!(answer?.value?.trim() || answer?.fileUrl);
}

export function computeOverallProgress(steps: WizardStep[], answers: WizardAnswer[]) {
  const allRequired = steps.flatMap((s) => s.fields).filter((f) => f.isRequired);
  if (allRequired.length === 0) return steps.length > 0 ? 100 : 0;
  const answeredMap = new Map(answers.map((a) => [a.applicationFieldId, a]));
  const done = allRequired.filter((f) => isAnswered(answeredMap.get(f.id))).length;
  return Math.round((done / allRequired.length) * 100);
}