"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";
import {
  PortalTerminalSchema,
  FieldDefinitionSchema,
  ApplicationSchema,
  ApplicationTagSchema,
  ApplicationFieldAssignSchema,
  SubmissionStatusSchema,
  AssignCounselorSchema,
} from "@/schemas"

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function parseOptions(options: string | undefined) {
  if (!options || !options.trim()) return undefined;
  return options.split(",").map((o) => o.trim()).filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────
// TERMINALS
// ─────────────────────────────────────────────────────────────────────────

export async function createTerminal(values: z.infer<typeof PortalTerminalSchema>) {
  await requireAdmin();
  const validated = PortalTerminalSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { name, icon, isActive, order } = validated.data;
  const slug = slugify(name);

  const existing = await db.portalTerminal.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (existing) return { error: "A terminal with that name already exists" };

  await db.portalTerminal.create({ data: { name, slug, icon: icon || null, isActive, order } });
  revalidatePath("/admin/terminals");
  revalidatePath("/portal");
  return { success: "Terminal created" };
}

export async function updateTerminal(id: string, values: z.infer<typeof PortalTerminalSchema>) {
  await requireAdmin();
  const validated = PortalTerminalSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { name, icon, isActive, order } = validated.data;
  // slug is intentionally left untouched after creation — applications reference it via terminalId, not the slug text
  await db.portalTerminal.update({ where: { id }, data: { name, icon: icon || null, isActive, order } });
  revalidatePath("/admin/terminals");
  revalidatePath("/portal");
  return { success: "Terminal updated" };
}

export async function deleteTerminal(id: string) {
  await requireAdmin();
  const count = await db.application.count({ where: { terminalId: id } });
  if (count > 0) return { error: `Can't delete — ${count} application(s) still live under this terminal` };

  await db.portalTerminal.delete({ where: { id } });
  revalidatePath("/admin/terminals");
  revalidatePath("/portal");
  return { success: "Terminal deleted" };
}

export async function toggleTerminalActive(id: string, isActive: boolean) {
  await requireAdmin();
  await db.portalTerminal.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/terminals");
  revalidatePath("/portal");
}

// ─────────────────────────────────────────────────────────────────────────
// FIELD LIBRARY
// ─────────────────────────────────────────────────────────────────────────

export async function createField(values: z.infer<typeof FieldDefinitionSchema>) {
  await requireAdmin();
  const validated = FieldDefinitionSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { key, label, type, category, placeholder, helpText, options, minLength, maxLength, pattern } = validated.data;

  const existing = await db.fieldDefinition.findUnique({ where: { key } });
  if (existing) return { error: "A field with that key already exists" };

  await db.fieldDefinition.create({
    data: {
      key,
      label,
      type,
      category: category?.trim() || "General",
      placeholder: placeholder || null,
      helpText: helpText || null,
      options: parseOptions(options) ?? undefined,
      minLength: minLength ?? null,
      maxLength: maxLength ?? null,
      pattern: pattern || null,
    },
  });
  revalidatePath("/admin/fields");
  return { success: "Field created" };
}

export async function updateField(id: string, values: z.infer<typeof FieldDefinitionSchema>) {
  await requireAdmin();
  const validated = FieldDefinitionSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { key, label, type, category, placeholder, helpText, options, minLength, maxLength, pattern } = validated.data;

  const existing = await db.fieldDefinition.findUnique({ where: { key } });
  if (existing && existing.id !== id) return { error: "A field with that key already exists" };

  await db.fieldDefinition.update({
    where: { id },
    data: {
      key,
      label,
      type,
      category: category?.trim() || "General",
      placeholder: placeholder || null,
      helpText: helpText || null,
      options: parseOptions(options) ?? undefined,
      minLength: minLength ?? null,
      maxLength: maxLength ?? null,
      pattern: pattern || null,
    },
  });
  revalidatePath("/admin/fields");
  return { success: "Field updated" };
}

export async function deleteField(id: string) {
  await requireAdmin();
  const count = await db.applicationField.count({ where: { fieldDefinitionId: id } });
  if (count > 0) return { error: `Can't delete — this field is attached to ${count} application(s)` };

  await db.fieldDefinition.delete({ where: { id } });
  revalidatePath("/admin/fields");
  return { success: "Field deleted" };
}

// ─────────────────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────

export async function createApplication(values: z.infer<typeof ApplicationSchema>) {
  await requireAdmin();
  const validated = ApplicationSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { terminalId, name, subtitle, icon, badge, isLive, isActive, order } = validated.data;
  const slug = slugify(name);

  const existing = await db.application.findFirst({ where: { terminalId, slug } });
  if (existing) return { error: "An application with that name already exists under this terminal" };

  const application = await db.application.create({
    data: { terminalId, name, subtitle: subtitle || null, slug, icon: icon || null, badge: badge || null, isLive, isActive, order },
  });
  revalidatePath("/admin/applications");
  revalidatePath("/portal");
  return { success: "Application created", id: application.id };
}

export async function updateApplication(id: string, values: z.infer<typeof ApplicationSchema>) {
  await requireAdmin();
  const validated = ApplicationSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { terminalId, name, subtitle, icon, badge, isLive, isActive, order } = validated.data;
  // slug is intentionally left untouched after creation — it's the scroll/route anchor
  await db.application.update({
    where: { id },
    data: { terminalId, name, subtitle: subtitle || null, icon: icon || null, badge: badge || null, isLive, isActive, order },
  });
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/portal");
  return { success: "Application updated" };
}

export async function deleteApplication(id: string) {
  await requireAdmin();
  const count = await db.applicationSubmission.count({ where: { applicationId: id } });
  if (count > 0) return { error: `Can't delete — ${count} submission(s) already exist for this application` };

  await db.application.delete({ where: { id } });
  revalidatePath("/admin/applications");
  revalidatePath("/portal");
  return { success: "Application deleted" };
}

export async function toggleApplicationActive(id: string, isActive: boolean) {
  await requireAdmin();
  await db.application.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/applications");
  revalidatePath("/portal");
}

export async function toggleApplicationLive(id: string, isLive: boolean) {
  await requireAdmin();
  await db.application.update({ where: { id }, data: { isLive } });
  revalidatePath("/admin/applications");
  revalidatePath("/portal");
}

// ─────────────────────────────────────────────────────────────────────────
// APPLICATION TAGS
// ─────────────────────────────────────────────────────────────────────────

export async function createTag(applicationId: string, values: z.infer<typeof ApplicationTagSchema>) {
  await requireAdmin();
  const validated = ApplicationTagSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  await db.applicationTag.create({ data: { applicationId, ...validated.data, icon: validated.data.icon || null } });
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/portal");
  return { success: "Tag added" };
}

export async function updateTag(id: string, applicationId: string, values: z.infer<typeof ApplicationTagSchema>) {
  await requireAdmin();
  const validated = ApplicationTagSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  await db.applicationTag.update({ where: { id }, data: { ...validated.data, icon: validated.data.icon || null } });
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/portal");
  return { success: "Tag updated" };
}

export async function deleteTag(id: string, applicationId: string) {
  await requireAdmin();
  await db.applicationTag.delete({ where: { id } });
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/portal");
  return { success: "Tag removed" };
}

// ─────────────────────────────────────────────────────────────────────────
// APPLICATION ↔ FIELD ASSIGNMENT
// ─────────────────────────────────────────────────────────────────────────

export async function attachField(applicationId: string, values: z.infer<typeof ApplicationFieldAssignSchema>) {
  await requireAdmin();
  const validated = ApplicationFieldAssignSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const existing = await db.applicationField.findUnique({
    where: { applicationId_fieldDefinitionId: { applicationId, fieldDefinitionId: validated.data.fieldDefinitionId } },
  });
  if (existing) return { error: "That field is already attached to this application" };

  await db.applicationField.create({ data: { applicationId, ...validated.data } });
  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: "Field attached" };
}

export async function updateApplicationField(
  id: string,
  applicationId: string,
  values: Pick<z.infer<typeof ApplicationFieldAssignSchema>, "isRequired" | "stepNumber" | "order">
) {
  await requireAdmin();
  await db.applicationField.update({ where: { id }, data: values });
  revalidatePath(`/admin/applications/${applicationId}`);
  const application = await db.application.findUnique({ where: { id: applicationId }, select: { terminalId: true } });
  if (application) revalidatePath(`/admin/terminals/${application.terminalId}/fields`);
  return { success: "Field updated" };
}

export async function detachField(id: string, applicationId: string) {
  await requireAdmin();
  const count = await db.submissionValue.count({ where: { applicationFieldId: id } });
  if (count > 0) return { error: `Can't remove — ${count} applicant answer(s) already reference this field` };

  await db.applicationField.delete({ where: { id } });
  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: "Field removed" };
}

// One toggle per row in the "Field library" checklist — flips a field on
// (attach, with sane defaults) or off (detach, respecting the same
// answers-already-exist guard as detachField) in a single call, so the
// admin can just flick switches instead of opening a picker dialog per field.
export async function setApplicationField(applicationId: string, fieldDefinitionId: string, attach: boolean) {
  await requireAdmin();

  const application = await db.application.findUnique({ where: { id: applicationId }, select: { terminalId: true } });
  const revalidateBoth = () => {
    revalidatePath(`/admin/applications/${applicationId}`);
    if (application) revalidatePath(`/admin/terminals/${application.terminalId}/fields`);
  };

  const existing = await db.applicationField.findUnique({
    where: { applicationId_fieldDefinitionId: { applicationId, fieldDefinitionId } },
  });

  if (attach) {
    if (existing) return { success: "Already attached" };
    const last = await db.applicationField.findFirst({ where: { applicationId }, orderBy: { order: "desc" } });
    await db.applicationField.create({
      data: { applicationId, fieldDefinitionId, isRequired: false, stepNumber: 1, order: (last?.order ?? -1) + 1 },
    });
    revalidateBoth();
    return { success: "Field attached" };
  }

  if (!existing) return { success: "Already removed" };
  const count = await db.submissionValue.count({ where: { applicationFieldId: existing.id } });
  if (count > 0) return { error: `Can't remove — ${count} applicant answer(s) already reference this field` };

  await db.applicationField.delete({ where: { id: existing.id } });
  revalidateBoth();
  return { success: "Field removed" };
}

// ─────────────────────────────────────────────────────────────────────────
// SUBMISSIONS
// ─────────────────────────────────────────────────────────────────────────

export async function updateSubmissionStatus(id: string, values: z.infer<typeof SubmissionStatusSchema>) {
  await requireAdmin();
  const validated = SubmissionStatusSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid status" };

  await db.applicationSubmission.update({ where: { id }, data: { status: validated.data.status } });
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  return { success: "Status updated" };
}

export async function assignCounselor(id: string, values: z.infer<typeof AssignCounselorSchema>) {
  await requireAdmin();
  const validated = AssignCounselorSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid counselor" };

  await db.applicationSubmission.update({ where: { id }, data: { counselorId: validated.data.counselorId } });
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
  return { success: "Counselor assigned" };
}

// ─────────────────────────────────────────────────────────────────────────
// COUNSELORS
// ─────────────────────────────────────────────────────────────────────────

export async function setUserRole(id: string, role: "ADMIN" | "COUNSELOR" | "USER") {
  const admin = await requireAdmin();
  if (id === admin.id && role !== "ADMIN") {
    return { error: "You can't remove your own admin access" };
  }

  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/counselors");
  return { success: "Role updated" };
}