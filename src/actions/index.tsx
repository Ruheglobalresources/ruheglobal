"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { isCodeLockedKey } from "@/lib/application-inputs";
import { revalidatePath } from "next/cache";
import {
  PortalTerminalSchema,
  FieldDefinitionSchema,
  ApplicationSchema,
  ApplicationTagSchema,
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

  const { name, icon, isVisible, order } = validated.data;
  const slug = slugify(name);

  const existing = await db.portalTerminal.findFirst({ where: { OR: [{ name }, { slug }] } });
  if (existing) return { error: "A terminal with that name already exists" };

  await db.portalTerminal.create({ data: { name, slug, icon: icon || null, isVisible, order } });
  revalidatePath("/admin/terminals");
  revalidatePath("/portal");
  return { success: "Terminal created" };
}

export async function updateTerminal(id: string, values: z.infer<typeof PortalTerminalSchema>) {
  await requireAdmin();
  const validated = PortalTerminalSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const { name, icon, isVisible, order } = validated.data;
  // slug is intentionally left untouched after creation — applications reference it via terminalId, not the slug text
  await db.portalTerminal.update({ where: { id }, data: { name, icon: icon || null, isVisible, order } });
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
// Shows/hides the terminal's card on the /portal home page only. The terminal itself stays
// active, so its own page and applications keep working (isActive is the full on/off switch).
export async function toggleTerminalVisible(id: string, isVisible: boolean) {
  await requireAdmin();
  await db.portalTerminal.update({ where: { id }, data: { isVisible } });
  revalidatePath("/admin/terminals");
  revalidatePath("/portal");
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

  // An input that an application requires (see src/lib/application-inputs.ts) is never edited here:
  // its key, type and choices are read by the code, so a change would break the check or the search.
  const current = await db.fieldDefinition.findUnique({ where: { id }, select: { key: true } });
  if (!current) return { error: "Field not found" };
  if (isCodeLockedKey(current.key)) {
    return { error: `"${current.key}" is required by an application and cannot be edited` };
  }

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
  const current = await db.fieldDefinition.findUnique({ where: { id }, select: { key: true } });
  if (current && isCodeLockedKey(current.key)) {
    return { error: `"${current.key}" is required by an application and cannot be deleted` };
  }
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

  // the application takes the kind of the terminal it is created under
  const terminal = await db.portalTerminal.findUnique({ where: { id: terminalId }, select: { kind: true } });
  if (!terminal) return { error: "Terminal not found" };

  const existing = await db.application.findFirst({ where: { terminalId, slug } });
  if (existing) return { error: "An application with that name already exists under this terminal" };

  const application = await db.application.create({
    data: { terminalId, kind: terminal.kind, name, subtitle: subtitle || null, slug, icon: icon || null, badge: badge || null, isLive, isActive, order },
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

  // moving an application to another terminal also moves it to that terminal's kind
  const terminal = await db.portalTerminal.findUnique({ where: { id: terminalId }, select: { kind: true } });
  if (!terminal) return { error: "Terminal not found" };

  // slug is intentionally left untouched after creation — it's the scroll/route anchor
  await db.application.update({
    where: { id },
    data: { terminalId, kind: terminal.kind, name, subtitle: subtitle || null, icon: icon || null, badge: badge || null, isLive, isActive, order },
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