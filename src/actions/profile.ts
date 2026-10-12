"use server";
// src/actions/profile.ts
// Everything the profile page and the onboarding modal write to the database.
// Every action works out who is calling from the session (never from the request body),
// validates with the shared zod schemas, and only ever touches that user's own rows.
import * as z from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  BasicInfoSchema,
  OnboardingStepSchema,
  PreferencesSchema,
  QualificationSchema,
  TestSchema,
  type BasicInfoValues,
  type OnboardingStepInput,
  type PreferencesValues,
  type QualificationValues,
  type TestValues,
} from "@/schemas/profile";

type Result = { success: true } | { error: string };

const firstIssue = (error: z.ZodError) => error.issues[0]?.message ?? "Some details are not valid";

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// The name and photo show in the portal layout, so the whole portal is refreshed.
const refreshPortal = () => revalidatePath("/portal", "layout");

const blankToNull = (v: string | undefined) => (v && v.trim() !== "" ? v.trim() : null);
const toInt = (v: string | undefined) => (v && v !== "" ? Number(v) : null);
const toDate = (v: string | undefined) => (v && v !== "" ? new Date(`${v}T00:00:00.000Z`) : null);

// ─── Photo ───────────────────────────────────────────────────────────────
// The browser uploads straight to Firebase Storage (same as every other image in the
// app) and then tells us the URL. We only accept a URL that points at THIS user's
// folder in OUR bucket, so nobody can set someone else's photo or an arbitrary link.

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "dase-hotel.firebasestorage.app";

function isOwnPhotoUrl(raw: string, userId: string): boolean {
  try {
    const url = new URL(raw);
    return (
      url.protocol === "https:" &&
      url.hostname === "firebasestorage.googleapis.com" &&
      url.pathname.startsWith(`/v0/b/${BUCKET}/o/profile%2F${userId}%2F`)
    );
  } catch {
    return false;
  }
}

export async function updateProfilePhoto(imageUrl: string): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };
  if (!isOwnPhotoUrl(imageUrl, userId)) return { error: "That photo could not be verified. Please try again" };

  await db.user.update({ where: { id: userId }, data: { image: imageUrl } });
  refreshPortal();
  return { success: true };
}

export async function removeProfilePhoto(): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };

  await db.user.update({ where: { id: userId }, data: { image: null } });
  refreshPortal();
  return { success: true };
}

// ─── Basic info (includes the name change) ───────────────────────────────

export async function saveBasicInfo(values: BasicInfoValues): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };

  const parsed = BasicInfoSchema.safeParse(values);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const v = parsed.data;

  const data = {
    phone: blankToNull(v.phone),
    nationality: blankToNull(v.nationality),
    residenceCountry: blankToNull(v.residenceCountry),
    residenceCity: blankToNull(v.residenceCity),
    dateOfBirth: toDate(v.dateOfBirth),
  };

  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { name: v.name } }),
    db.userProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data }),
  ]);

  refreshPortal();
  return { success: true };
}

// ─── Preferences ─────────────────────────────────────────────────────────

export async function savePreferences(values: PreferencesValues): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };

  const parsed = PreferencesSchema.safeParse(values);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const v = parsed.data;

  const data = {
    preferredDestination: blankToNull(v.preferredDestination),
    preferredStudyLevel: blankToNull(v.preferredStudyLevel),
    preferredStartYear: toInt(v.preferredStartYear),
    preferredStartMonth: toInt(v.preferredStartMonth),
    subjects: [...new Set(v.subjects.map((s) => s.trim()))],
  };

  await db.userProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  refreshPortal();
  return { success: true };
}

// ─── Onboarding ──────────────────────────────────────────────────────────
// One call per step, each saving only that step's fields, so someone who leaves halfway
// keeps what they already entered. Step 4 also marks onboarding as finished.

export async function saveOnboardingStep(input: OnboardingStepInput): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };

  const parsed = OnboardingStepSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const v = parsed.data;

  const upsert = (data: Parameters<typeof db.userProfile.update>[0]["data"]) =>
    db.userProfile.upsert({
      where: { userId },
      create: { userId, ...(data as object) },
      update: data,
    });

  switch (v.step) {
    case 1:
      await db.$transaction([
        db.user.update({ where: { id: userId }, data: { name: v.name } }),
        upsert({ phone: v.phone, dateOfBirth: toDate(v.dateOfBirth) }),
      ]);
      break;
    case 2:
      await upsert({
        nationality: v.nationality,
        residenceCountry: v.residenceCountry,
        residenceCity: blankToNull(v.residenceCity),
      });
      break;
    case 3:
      await upsert({
        preferredDestination: v.preferredDestination,
        preferredStudyLevel: v.preferredStudyLevel,
        preferredStartYear: toInt(v.preferredStartYear),
        preferredStartMonth: toInt(v.preferredStartMonth),
      });
      break;
    case 4:
      await upsert({
        subjects: [...new Set(v.subjects.map((s) => s.trim()))],
        onboardingCompletedAt: new Date(),
      });
      break;
  }

  refreshPortal();
  return { success: true };
}

// ─── Qualifications ──────────────────────────────────────────────────────

export async function saveQualification(id: string | null, values: QualificationValues): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };

  const parsed = QualificationSchema.safeParse(values);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const v = parsed.data;

  const data = {
    level: v.level,
    institution: v.institution,
    programme: blankToNull(v.programme),
    country: blankToNull(v.country),
    startYear: toInt(v.startYear),
    endYear: toInt(v.endYear),
    grade: blankToNull(v.grade),
  };

  if (id) {
    const { count } = await db.academicQualification.updateMany({ where: { id, userId }, data });
    if (count === 0) return { error: "That qualification no longer exists" };
  } else {
    await db.academicQualification.create({ data: { userId, ...data } });
  }

  revalidatePath("/portal/profile");
  return { success: true };
}

export async function deleteQualification(id: string): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };

  await db.academicQualification.deleteMany({ where: { id, userId } });
  revalidatePath("/portal/profile");
  return { success: true };
}

// ─── Tests (English language and standardized) ───────────────────────────

export async function saveTest(id: string | null, values: TestValues): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };

  const parsed = TestSchema.safeParse(values);
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const v = parsed.data;

  const data = { kind: v.kind, name: v.name, score: v.score, testDate: toDate(v.testDate) };

  if (id) {
    const { count } = await db.userTest.updateMany({ where: { id, userId }, data });
    if (count === 0) return { error: "That test no longer exists" };
  } else {
    await db.userTest.create({ data: { userId, ...data } });
  }

  revalidatePath("/portal/profile");
  return { success: true };
}

export async function deleteTest(id: string): Promise<Result> {
  const userId = await currentUserId();
  if (!userId) return { error: "Please sign in again" };

  await db.userTest.deleteMany({ where: { id, userId } });
  revalidatePath("/portal/profile");
  return { success: true };
}