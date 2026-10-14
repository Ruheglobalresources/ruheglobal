// src/lib/application-inputs-data.ts
// Server only. Reads one application and the field library, applies the rules of
// src/lib/application-inputs.ts, and returns everything the admin screen draws as plain data.
import { db } from "@/lib/db";
import {
  addCheck,
  classifyRows,
  describeShowWhen,
  layoutProblems,
  missingLockedKeys,
  toInputRow,
  wizardProblem,
  type AvailableGroup,
  type InputCard,
  type InputStepGroup,
  type InputsView,
} from "@/lib/application-inputs";

export async function getApplicationInputsView(applicationId: string): Promise<InputsView | null> {
  const [application, library] = await Promise.all([
    db.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        kind: true,
        slug: true,
        steps: true,
        fields: { orderBy: [{ stepNumber: "asc" }, { order: "asc" }], include: { fieldDefinition: true } },
      },
    }),
    db.fieldDefinition.findMany({ orderBy: [{ category: "asc" }, { label: "asc" }] }),
  ]);
  if (!application) return null;

  const isEligibility = application.kind === "ELIGIBILITY";
  const rows = application.fields.map(toInputRow);
  const classified = classifyRows(application, rows);

  // The inputs of the application, grouped by wizard step.
  const stepMeta = new Map(application.steps.map((s) => [s.stepNumber, s]));
  const byStep = new Map<number, InputCard[]>();
  for (const row of classified) {
    const card: InputCard = {
      id: row.id,
      label: row.def.label,
      key: row.def.key,
      type: row.def.type,
      isRequired: row.isRequired,
      stepNumber: row.stepNumber,
      order: row.order,
      state: row.state,
      reason: row.reason,
      when: describeShowWhen(row.showWhen),
    };
    byStep.set(row.stepNumber, [...(byStep.get(row.stepNumber) ?? []), card]);
  }
  const groups: InputStepGroup[] = [...byStep.entries()]
    .sort(([a], [b]) => a - b)
    .map(([stepNumber, cards]) => ({
      stepNumber,
      title: stepMeta.get(stepNumber)?.title ?? `Step ${stepNumber}`,
      emoji: stepMeta.get(stepNumber)?.emoji ?? null,
      cards: cards.sort((a, b) => a.order - b.order),
    }));

  // The inputs of the library that are not on the application yet.
  const attached = new Set(rows.map((r) => r.fieldDefinitionId));
  const byCategory = new Map<string, AvailableGroup["items"]>();
  let hiddenCount = 0;
  for (const def of library) {
    if (attached.has(def.id)) continue;
    const check = addCheck(application, rows, def);
    if (check.kind === "hidden") {
      hiddenCount += 1;
      continue;
    }
    const category = def.category || "General";
    byCategory.set(category, [
      ...(byCategory.get(category) ?? []),
      { id: def.id, label: def.label, key: def.key, type: def.type, blocked: check.kind === "blocked" ? check.message : null },
    ]);
  }
  const available: AvailableGroup[] = [...byCategory.entries()].map(([category, items]) => ({ category, items }));

  // Things that are already wrong, shown in plain words instead of a silently dead button.
  const problems: string[] = [];
  for (const key of missingLockedKeys(application, rows)) {
    problems.push(`The required input "${key}" is missing from this application. Run the eligibility seed to restore it.`);
  }
  problems.push(...layoutProblems(rows));
  if (isEligibility) {
    for (const row of classified) {
      if (row.state === "locked") continue;
      const problem = wizardProblem(row.def, row.isRequired);
      if (!problem) continue;
      problems.push(
        `"${row.def.label}" cannot be answered in the eligibility check. ${problem}` +
          (row.isRequired ? " It is required, so the Continue button stays disabled. Make it optional or remove it." : " Remove it.")
      );
    }
  }

  return {
    applicationId: application.id,
    isEligibility,
    canEditStep: !isEligibility,
    groups,
    available,
    hiddenCount,
    problems,
    lockedCount: classified.filter((r) => r.state !== "adjustable").length,
    adjustableCount: classified.filter((r) => r.state === "adjustable").length,
  };
}