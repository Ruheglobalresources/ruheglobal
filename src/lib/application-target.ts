// src/lib/application-target.ts
// Everything about WHO a school application is for.
//
// All schools and institutions share ONE application (the application of the SCHOOL
// terminal). What makes each submission different is its target: the school or institution
// the student picked, and optionally the course. The target is stored on the submission, so
// a student can apply to many schools with the same form and every one is its own submission.
import { z } from "zod";
import { db } from "@/lib/db";

export const ApplyTargetTypeValues = ["institution", "school"] as const;
export type ApplyTargetType = (typeof ApplyTargetTypeValues)[number];

// What travels in the address bar and from the wizard to the save action.
export const ApplyTargetInputSchema = z.object({
  type: z.enum(ApplyTargetTypeValues),
  slug: z.string().trim().min(1).max(200),
  courseId: z.string().trim().min(1).max(100).nullable().optional(),
});
export type ApplyTargetInput = z.infer<typeof ApplyTargetInputSchema>;

// The same target after it was checked against the database.
export type ResolvedApplyTarget = {
  type: ApplyTargetType;
  id: string;
  slug: string;
  name: string;
  country: string | null;
  courseId: string | null;
  courseName: string | null;
  courseLevel: string | null;
  courseIntake: string | null; // institution courses only, e.g. "Jan 2027"
};

// Returns null when the school or institution does not exist or is switched off.
// A course that does not belong to it is ignored (the application is then for the
// school or institution in general).
export async function resolveApplyTarget(input: ApplyTargetInput): Promise<ResolvedApplyTarget | null> {
  const courseId = input.courseId || null;

  if (input.type === "institution") {
    const inst = await db.institution.findFirst({
      where: { slug: input.slug, isActive: true },
      select: { id: true, slug: true, name: true, country: true },
    });
    if (!inst) return null;

    const course = courseId
      ? await db.institutionCourse.findFirst({
          where: { id: courseId, institutionId: inst.id },
          select: { id: true, name: true, level: true, nextIntake: true },
        })
      : null;

    return {
      type: "institution",
      id: inst.id,
      slug: inst.slug,
      name: inst.name,
      country: inst.country,
      courseId: course?.id ?? null,
      courseName: course?.name ?? null,
      courseLevel: course?.level ?? null,
      courseIntake: course?.nextIntake ?? null,
    };
  }

  const school = await db.school.findFirst({
    where: { slug: input.slug, isActive: true },
    select: { id: true, slug: true, name: true, country: true },
  });
  if (!school) return null;

  const course = courseId
    ? await db.schoolCourse.findFirst({
        where: { id: courseId, schoolId: school.id },
        select: { id: true, name: true, level: true },
      })
    : null;

  return {
    type: "school",
    id: school.id,
    slug: school.slug,
    name: school.name,
    country: school.country,
    courseId: course?.id ?? null,
    courseName: course?.name ?? null,
    courseLevel: course?.level ?? null,
    courseIntake: null,
  };
}

// The columns written on a NEW submission.
export function targetColumns(t: ResolvedApplyTarget) {
  return {
    institutionId: t.type === "institution" ? t.id : null,
    institutionCourseId: t.type === "institution" ? t.courseId : null,
    schoolId: t.type === "school" ? t.id : null,
    schoolCourseId: t.type === "school" ? t.courseId : null,
    // names kept as they were when the student applied
    targetName: t.name,
    targetCourseName: t.courseName,
  };
}

// Finds the submission a student already has for this exact target.
export function targetWhere(t: ResolvedApplyTarget) {
  return {
    institutionId: t.type === "institution" ? t.id : null,
    institutionCourseId: t.type === "institution" ? t.courseId : null,
    schoolId: t.type === "school" ? t.id : null,
    schoolCourseId: t.type === "school" ? t.courseId : null,
  };
}

// Rebuilds the target of a saved submission (used when it is opened from the dashboard list).
export function targetInputFromSubmission(sub: {
  institutionId: string | null;
  institutionCourseId: string | null;
  schoolId: string | null;
  schoolCourseId: string | null;
  institution: { slug: string } | null;
  school: { slug: string } | null;
}): ApplyTargetInput | null {
  if (sub.institution) return { type: "institution", slug: sub.institution.slug, courseId: sub.institutionCourseId };
  if (sub.school) return { type: "school", slug: sub.school.slug, courseId: sub.schoolCourseId };
  return null;
}

/* ------------------------------------------------------------------------ */
/* Prefill: the target fills fields that already exist in the field library  */
/* ------------------------------------------------------------------------ */

// FieldDefinition keys from the "Study Preferences" group of the field library. An admin
// only has to add these fields to the school application; nothing else needs setting up.
export const TARGET_FIELD_KEYS = {
  university: "preferred_university",
  program: "preferred_program",
  countries: "preferred_countries",
  level: "study_level",
  intake: "intended_intake",
  year: "intended_year",
} as const;

// The student cannot change these two, they ARE the target. The save action enforces it.
export const LOCKED_TARGET_KEYS: string[] = [TARGET_FIELD_KEYS.university, TARGET_FIELD_KEYS.program];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const COUNTRY_ALIASES: Record<string, string> = {
  "united kingdom": "UK",
  england: "UK",
  scotland: "UK",
  wales: "UK",
  "northern ireland": "UK",
  "united states": "USA",
  "united states of america": "USA",
  us: "USA",
};

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// "Jan 2027" -> { month: "January", year: "2027" }; "September, January" -> { month: "September", year: null }
export function parseIntake(raw: string | null | undefined): { month: string | null; year: string | null } {
  if (!raw) return { month: null, year: null };
  const monthMatch = raw.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i);
  const yearMatch = raw.match(/\b(20\d{2})\b/);
  const month = monthMatch ? MONTHS.find((m) => m.toLowerCase().startsWith(monthMatch[1].toLowerCase())) ?? null : null;
  return { month, year: yearMatch ? yearMatch[1] : null };
}

// Picks the dropdown option that stands for the value, or null when none does.
function matchOption(value: string | null, options: string[]): string | null {
  if (!value) return null;
  const direct = options.find((o) => sameText(o, value));
  if (direct) return direct;
  const alias = COUNTRY_ALIASES[value.trim().toLowerCase()];
  if (alias) return options.find((o) => sameText(o, alias)) ?? null;
  return null;
}

type PrefillField = { id: string; definition: { key: string; options: string[] } };

export function buildPrefill(
  target: ResolvedApplyTarget,
  fields: PrefillField[]
): { answers: { applicationFieldId: string; value: string; fileUrl: null }[]; lockedFieldIds: string[] } {
  const byKey = new Map(fields.map((f) => [f.definition.key, f]));
  const answers: { applicationFieldId: string; value: string; fileUrl: null }[] = [];
  const lockedFieldIds: string[] = [];

  const put = (key: string, value: string | null, locked = false) => {
    const field = byKey.get(key);
    if (!field || !value) return;
    answers.push({ applicationFieldId: field.id, value, fileUrl: null });
    if (locked) lockedFieldIds.push(field.id);
  };

  put(TARGET_FIELD_KEYS.university, target.name, true);
  put(TARGET_FIELD_KEYS.program, target.courseName, true);

  const countriesField = byKey.get(TARGET_FIELD_KEYS.countries);
  if (countriesField && target.country) {
    const opts = countriesField.definition.options;
    put(TARGET_FIELD_KEYS.countries, matchOption(target.country, opts) ?? opts.find((o) => sameText(o, "Other")) ?? null);
  }

  const levelField = byKey.get(TARGET_FIELD_KEYS.level);
  if (levelField) put(TARGET_FIELD_KEYS.level, matchOption(target.courseLevel, levelField.definition.options));

  const { month, year } = parseIntake(target.courseIntake);
  const intakeField = byKey.get(TARGET_FIELD_KEYS.intake);
  if (intakeField) put(TARGET_FIELD_KEYS.intake, matchOption(month, intakeField.definition.options));
  put(TARGET_FIELD_KEYS.year, year);

  return { answers, lockedFieldIds };
}