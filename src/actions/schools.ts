"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { SchoolSchema } from "@/schemas";

type SchoolInput = z.infer<typeof SchoolSchema>;

// Appends "-2", "-3"... until the slug is free (same approach as blog.ts).
async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  while (
    await db.school.findFirst({
      where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
      select: { id: true },
    })
  ) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

// Only ever trust http(s) URLs before they end up in an <img src> or <a href>.
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

const clean = (v?: string) => v?.trim() || null;
const positiveOrNull = (n?: number) => (typeof n === "number" && n > 0 ? n : null);

function toData(v: SchoolInput) {
  return {
    name: v.name.trim(),
    country: v.country.trim(),
    city: v.city.trim(),
    founded: positiveOrNull(v.founded),
    ranking: clean(v.ranking),
    acceptanceRate: clean(v.acceptanceRate),
    tuitionFrom: positiveOrNull(v.tuitionFrom),
    tuitionCurrency: v.tuitionCurrency.trim().toUpperCase(),
    website: safeUrl(v.website),
    description: v.description.trim(),
    paragraph1: clean(v.paragraph1),
    paragraph2: clean(v.paragraph2),
    paragraph3: clean(v.paragraph3),
    paragraph4: clean(v.paragraph4),
    coverImage: safeUrl(v.coverImage) ?? v.coverImage,
    coverImageAlt: clean(v.coverImageAlt),
    logoUrl: safeUrl(v.logoUrl),
    metaTitle: clean(v.metaTitle),
    metaDescription: clean(v.metaDescription),
    isActive: v.isActive,
    order: v.order,
  };
}

const courseRows = (v: SchoolInput) =>
  v.courses.map((c, i) => ({
    name: c.name.trim(),
    level: clean(c.level),
    duration: clean(c.duration),
    tuition: clean(c.tuition),
    intakes: clean(c.intakes),
    description: clean(c.description),
    imageUrl: safeUrl(c.imageUrl),
    order: i,
  }));

const imageRows = (v: SchoolInput) =>
  v.images
    .filter((img) => safeUrl(img.url))
    .map((img, i) => ({
      url: safeUrl(img.url)!,
      altText: clean(img.altText),
      caption: clean(img.caption),
      order: i,
    }));

function revalidateSchool(slug: string) {
  revalidatePath("/");
  revalidatePath("/schools");
  revalidatePath(`/schools/${slug}`);
  revalidatePath("/admin/schools");
}

export async function createSchool(values: SchoolInput) {
  await requireAdmin();

  const validated = SchoolSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid school data" };

  const slug = await uniqueSlug(validated.data.slug);

  const school = await db.school.create({
    data: {
      ...toData(validated.data),
      slug,
      courses: { create: courseRows(validated.data) },
      images: { create: imageRows(validated.data) },
    },
  });

  revalidateSchool(school.slug);
  return { success: "School created", id: school.id, slug: school.slug };
}

export async function updateSchool(id: string, values: SchoolInput) {
  await requireAdmin();

  const existing = await db.school.findUnique({ where: { id } });
  if (!existing) return { error: "School not found" };

  const validated = SchoolSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid school data" };

  const slug =
    validated.data.slug === existing.slug ? existing.slug : await uniqueSlug(validated.data.slug, id);

  // Courses and gallery images are edited as whole lists on the form, so
  // they're replaced in one transaction together with the school itself.
  await db.$transaction([
    db.schoolCourse.deleteMany({ where: { schoolId: id } }),
    db.schoolImage.deleteMany({ where: { schoolId: id } }),
    db.school.update({
      where: { id },
      data: {
        ...toData(validated.data),
        slug,
        courses: { create: courseRows(validated.data) },
        images: { create: imageRows(validated.data) },
      },
    }),
  ]);

  revalidateSchool(slug);
  if (slug !== existing.slug) revalidatePath(`/schools/${existing.slug}`);
  return { success: "School updated", slug };
}

export async function deleteSchool(id: string) {
  await requireAdmin();

  const school = await db.school.delete({ where: { id } });

  revalidateSchool(school.slug);
  return { success: "School deleted" };
}

export async function toggleSchoolActive(id: string, isActive: boolean) {
  await requireAdmin();

  const school = await db.school.update({ where: { id }, data: { isActive } });

  revalidateSchool(school.slug);
}