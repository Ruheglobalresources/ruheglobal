"use server";

// src/actions/application-inputs.ts
// The only way an admin changes the inputs of an application. Every rule is checked here on the server
// (src/lib/application-inputs.ts), so a locked input cannot be changed even if the screen is bypassed.
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import {
  addCheck,
  classifyRows,
  EXTRA_STEP_TITLE,
  layoutRegressions,
  placementForNew,
  toInputRow,
  wizardProblem,
} from "@/lib/application-inputs";

async function load(applicationId: string) {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      kind: true,
      slug: true,
      terminalId: true,
      fields: { include: { fieldDefinition: true } },
    },
  });
  if (!application) return null;
  return { application, rows: application.fields.map(toInputRow) };
}

function refresh(applicationId: string, terminalId: string) {
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath(`/admin/terminals/${terminalId}/fields`);
  revalidatePath("/portal");
}

export async function addApplicationInput(applicationId: string, fieldDefinitionId: string) {
  await requireAdmin();
  const data = await load(applicationId);
  if (!data) return { error: "Application not found" };
  const { application, rows } = data;

  const def = await db.fieldDefinition.findUnique({ where: { id: fieldDefinitionId } });
  if (!def) return { error: "That input is not in the library" };
  if (rows.some((r) => r.fieldDefinitionId === def.id)) return { error: "That input is already in this application" };

  const check = addCheck(application, rows, def);
  if (check.kind !== "ok") return { error: check.message };

  const place = placementForNew(application, rows);
  const draft = toInputRow({
    id: "new",
    fieldDefinitionId: def.id,
    isRequired: false,
    stepNumber: place.stepNumber,
    order: place.order,
    showWhen: null,
    fieldDefinition: def,
  });
  const regressions = layoutRegressions(rows, [...rows, draft]);
  if (regressions.length > 0) return { error: regressions.join(" ") };

  await db.$transaction(async (tx) => {
    await tx.applicationField.create({
      data: {
        applicationId,
        fieldDefinitionId: def.id,
        isRequired: false,
        stepNumber: place.stepNumber,
        order: place.order,
      },
    });
    // the eligibility check titles each step from this row, so the extra step gets a heading
    if (application.kind === "ELIGIBILITY") {
      await tx.applicationStep.upsert({
        where: { applicationId_stepNumber: { applicationId, stepNumber: place.stepNumber } },
        update: {},
        create: { applicationId, stepNumber: place.stepNumber, title: EXTRA_STEP_TITLE },
      });
    }
  });

  refresh(applicationId, application.terminalId);
  return { success: `"${def.label}" added` };
}

export async function removeApplicationInput(applicationId: string, applicationFieldId: string) {
  await requireAdmin();
  const data = await load(applicationId);
  if (!data) return { error: "Application not found" };
  const { application, rows } = data;

  const row = classifyRows(application, rows).find((r) => r.id === applicationFieldId);
  if (!row) return { error: "That input is not in this application" };
  if (row.state !== "adjustable") return { error: `"${row.def.label}" cannot be removed. ${row.reason}.` };

  const answers = await db.submissionValue.count({ where: { applicationFieldId } });
  if (answers > 0) {
    return { error: `Can't remove, ${answers} applicant answer(s) already use this input. Make it optional instead.` };
  }

  await db.applicationField.delete({ where: { id: applicationFieldId } });
  refresh(applicationId, application.terminalId);
  return { success: `"${row.def.label}" removed` };
}

export async function updateApplicationInput(
  applicationId: string,
  applicationFieldId: string,
  values: { isRequired: boolean; stepNumber: number; order: number }
) {
  await requireAdmin();
  const data = await load(applicationId);
  if (!data) return { error: "Application not found" };
  const { application, rows } = data;

  const row = classifyRows(application, rows).find((r) => r.id === applicationFieldId);
  if (!row) return { error: "That input is not in this application" };
  if (row.state !== "adjustable") return { error: `"${row.def.label}" cannot be changed. ${row.reason}.` };

  if (!Number.isInteger(values.stepNumber) || values.stepNumber < 1) return { error: "The step must be a whole number from 1" };
  if (!Number.isInteger(values.order)) return { error: "The order must be a whole number" };

  const isRequired = Boolean(values.isRequired);
  // eligibility inputs stay in their own step, only their order inside it can change
  const stepNumber = application.kind === "ELIGIBILITY" ? row.stepNumber : values.stepNumber;
  const order = values.order;

  if (application.kind === "ELIGIBILITY" && isRequired) {
    const problem = wizardProblem(row.def, true);
    if (problem) return { error: `"${row.def.label}" cannot be required. ${problem}` };
  }

  const after = rows.map((r) => (r.id === row.id ? { ...r, isRequired, stepNumber, order } : r));
  const regressions = layoutRegressions(rows, after);
  if (regressions.length > 0) return { error: regressions.join(" ") };

  await db.applicationField.update({ where: { id: applicationFieldId }, data: { isRequired, stepNumber, order } });
  refresh(applicationId, application.terminalId);
  return { success: `"${row.def.label}" updated` };
}