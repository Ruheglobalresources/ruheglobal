// src/lib/flow-fields.ts
// Turns rows of the field library into questions ready to draw, with their choices filled in:
// the typed list, the countries, the destinations and the "what do you want to do abroad" goals.
// Lists that depend on an earlier answer (universities of a country, cities, visa types) are left
// empty here and loaded in the browser when that answer is given (loadDependentOptions in
// actions/eligibility.ts), exactly as the eligibility check does.
// Used by the application engine for the details beside a document; any flow built from
// FieldDefinition rows can use it.
import type { FieldDefinition } from "@prisma/client";
import { db } from "@/lib/db";
import {
  parseShowWhen,
  type FlowDisplay,
  type FlowField,
  type FlowFieldType,
  type FlowOptionsSource,
  type OptionNotes,
} from "@/lib/eligibility";

export type FieldRow = {
  id: string; // id of the placement (ApplicationField or ApplicationTaskField): answers are keyed by it
  isRequired: boolean;
  showWhen: unknown;
  fieldDefinition: FieldDefinition;
};

const asStrings = (json: unknown): string[] =>
  Array.isArray(json) ? json.filter((v): v is string => typeof v === "string") : [];

export async function resolveFlowFields(rows: FieldRow[]): Promise<FlowField[]> {
  if (rows.length === 0) return [];
  const sources = new Set(rows.map((r) => r.fieldDefinition.optionsSource));

  const countryNames = sources.has("COUNTRIES")
    ? (
        await db.country.findMany({
          where: { isActive: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: { name: true },
        })
      ).map((c) => c.name)
    : [];

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
  const purposeNotes: OptionNotes = {};
  for (const p of purposes) {
    purposeNotes[p.name] = { title: p.goalLabel, description: p.description ?? undefined, emoji: p.emoji ?? undefined };
  }

  return rows.map((row) => {
    const def = row.fieldDefinition;
    const source = def.optionsSource as FlowOptionsSource;
    const options =
      source === "COUNTRIES"
        ? countryNames
        : source === "STATIC"
          ? asStrings(def.options)
          : source === "DESTINATIONS"
            ? destinationNames
            : source === "VISA_PURPOSES"
              ? purposes.map((p) => p.name)
              : [];

    return {
      id: row.id,
      key: def.key,
      label: def.label,
      type: def.type as FlowFieldType,
      display: def.display as FlowDisplay,
      optionsSource: source,
      dependsOnKey: def.dependsOnKey,
      alsoDependsOnKey: def.alsoDependsOnKey,
      allowOther: def.allowOther,
      otherLabel: def.otherLabel,
      maxSelections: def.maxSelections,
      options,
      notes: source === "VISA_PURPOSES" ? purposeNotes : {},
      suggestions: asStrings(def.suggestions),
      placeholder: def.placeholder,
      helpText: def.helpText,
      pattern: def.pattern,
      isRequired: row.isRequired,
      showWhen: parseShowWhen(row.showWhen),
    };
  });
}