// src/lib/user-profile.ts
// Server-side reads for the profile page and the onboarding gate.
// React.cache means the portal layout and the page share one query per request.
import { cache } from "react";
import { db } from "@/lib/db";
import type { ProfileData, QualificationItem, TestItem } from "@/components/profile/types";
import type { TestKind } from "@/schemas/profile";

const isoDay = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");
const str = (v: string | number | null | undefined) => (v === null || v === undefined ? "" : String(v));

export const getProfilePageData = cache(async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      profile: true,
      qualifications: { orderBy: [{ endYear: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }] },
      tests: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) return null;

  const p = user.profile;

  const profile: ProfileData = {
    userId,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? null,
    phone: str(p?.phone),
    nationality: str(p?.nationality),
    residenceCountry: str(p?.residenceCountry),
    residenceCity: str(p?.residenceCity),
    dateOfBirth: isoDay(p?.dateOfBirth),
    preferredDestination: str(p?.preferredDestination),
    preferredStudyLevel: str(p?.preferredStudyLevel),
    preferredStartYear: str(p?.preferredStartYear),
    preferredStartMonth: str(p?.preferredStartMonth),
    subjects: p?.subjects ?? [],
  };

  const qualifications: QualificationItem[] = user.qualifications.map((q) => ({
    id: q.id,
    level: q.level,
    institution: q.institution,
    programme: str(q.programme),
    country: str(q.country),
    startYear: str(q.startYear),
    endYear: str(q.endYear),
    grade: str(q.grade),
  }));

  const tests: TestItem[] = user.tests.map((t) => ({
    id: t.id,
    kind: t.kind as TestKind,
    name: t.name,
    score: t.score,
    testDate: isoDay(t.testDate),
  }));

  return { profile, qualifications, tests };
});

// How much of the profile is filled in, for the progress bar on the profile page.
export function profileCompleteness(profile: ProfileData, qualificationCount: number): number {
  const checks = [
    profile.name,
    profile.phone,
    profile.nationality,
    profile.residenceCountry,
    profile.dateOfBirth,
    profile.preferredDestination,
    profile.preferredStudyLevel,
    profile.subjects.length > 0,
    qualificationCount > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// Whether to show the onboarding modal, and what to prefill it with.
export const getOnboardingState = cache(async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, profile: true },
  });
  const p = user?.profile;

  return {
    completed: !!p?.onboardingCompletedAt,
    initial: {
      name: user?.name ?? "",
      phone: str(p?.phone),
      dateOfBirth: isoDay(p?.dateOfBirth),
      nationality: str(p?.nationality),
      residenceCountry: str(p?.residenceCountry),
      residenceCity: str(p?.residenceCity),
      preferredDestination: str(p?.preferredDestination),
      preferredStudyLevel: str(p?.preferredStudyLevel),
      preferredStartYear: str(p?.preferredStartYear),
      preferredStartMonth: str(p?.preferredStartMonth),
      subjects: p?.subjects ?? [],
    },
  };
});

export type OnboardingInitial = Awaited<ReturnType<typeof getOnboardingState>>["initial"];