"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { InstitutionSchema } from "@/schemas";

type InstitutionInput = z.infer<typeof InstitutionSchema>;

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  while (
    await db.institution.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
      select: { id: true },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

function parseList(input?: string, max = 3): string[] {
  if (!input) return [];
  return Array.from(new Set(input.split(",").map((v) => v.trim()).filter(Boolean))).slice(0, max);
}

/**
 * Institutions come from a form (an admin typing a URL) or a seed script
 * (a Wikipedia/favicon fetch) — either way we only ever trust http(s) URLs
 * before they end up in an <img src> or <a href>.
 */
function safeUrl(value?: string): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function toData(values: InstitutionInput) {
  return {
    name: values.name,
    city: values.city?.trim() || null,
    country: values.country?.trim() || null,
    institutionType: values.institutionType?.trim() || null,
    summary: values.summary,
    programs: parseList(values.programs, 3),
    ieltsOverall: values.ieltsOverall ?? null,
    ieltsMinBand: values.ieltsMinBand ?? null,
    ieltsAlternatives: parseList(values.ieltsAlternatives, 4),
    ieltsNote: values.ieltsNote?.trim() || null,
    tuitionMin: values.tuitionMin ?? null,
    tuitionMax: values.tuitionMax ?? null,
    tuitionCurrency: values.tuitionCurrency?.trim().toUpperCase() || null,
    tuitionPeriod: values.tuitionPeriod?.trim() || null,
    tuitionNote: values.tuitionNote?.trim() || null,
    ranking: values.ranking?.trim() || null,
    website: safeUrl(values.website),
    imageUrl: safeUrl(values.imageUrl),
    logoUrl: safeUrl(values.logoUrl),
    isActive: values.isActive,
    order: values.order,
  };
}

export async function createInstitution(values: InstitutionInput) {
  await requireAdmin();

  const validated = InstitutionSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const slug = await uniqueSlug(slugify(validated.data.name));

  const institution = await db.institution.create({
    data: { ...toData(validated.data), slug },
  });

  revalidatePath("/admin/institutions");
  revalidatePath("/school-search");
  return { success: "Institution created", id: institution.id };
}

export async function updateInstitution(id: string, values: InstitutionInput) {
  await requireAdmin();

  const existing = await db.institution.findUnique({ where: { id } });
  if (!existing) return { error: "Institution not found" };

  const validated = InstitutionSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const newBase = slugify(validated.data.name);
  const slug = newBase === slugify(existing.name) ? existing.slug : await uniqueSlug(newBase, id);

  await db.institution.update({
    where: { id },
    data: { ...toData(validated.data), slug },
  });

  revalidatePath("/admin/institutions");
  revalidatePath("/school-search");
  return { success: "Institution updated" };
}

export async function deleteInstitution(id: string) {
  await requireAdmin();

  await db.institution.delete({ where: { id } });

  revalidatePath("/admin/institutions");
  revalidatePath("/school-search");
  return { success: "Institution deleted" };
}

export async function toggleInstitutionActive(id: string, isActive: boolean) {
  await requireAdmin();

  await db.institution.update({ where: { id }, data: { isActive } });

  revalidatePath("/admin/institutions");
  revalidatePath("/school-search");
}
