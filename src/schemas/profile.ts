// src/schemas/profile.ts
// Validation for everything on the profile page and in the onboarding modal.
// Pure zod (no server code), so the browser checks a form with the very same rules the
// server action applies when it receives it.
import * as z from "zod";
import {
  ACADEMIC_LEVELS,
  COUNTRY_NAMES,
  ENGLISH_TESTS,
  MAX_SUBJECTS,
  STANDARDIZED_TESTS,
  STUDY_DESTINATIONS,
  STUDY_LEVELS,
} from "@/constants/profile-options";

// An optional field arrives from a form as "" when it was left empty. Turning "" into
// undefined first keeps the inner schema's own error message (a union would only say
// "Invalid input").
const orEmpty = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

export const NameSchema = z.string().trim().min(2, "Enter your full name").max(80, "That name is too long");

export const PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s\-()]{6,19}$/, "Enter a valid phone number, e.g. +234 806 012 3454");

export const CountrySchema = z.enum(COUNTRY_NAMES, { error: "Choose a country from the list" });

const todayIso = () => new Date().toISOString().slice(0, 10);

const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }, "Enter a valid date");

export const BirthDateSchema = DateOnlySchema.refine(
  (s) => s >= "1900-01-01" && s < todayIso(),
  "Date of birth must be in the past"
);

// A test can be booked ahead, so its date only has to be a real date in a sensible range.
export const TestDateSchema = DateOnlySchema.refine(
  (s) => s >= "2000-01-01" && s <= `${new Date().getFullYear() + 3}-12-31`,
  "Enter a date between 2000 and three years from now"
);

const YearSchema = (min: number, max: number) =>
  z
    .string()
    .regex(/^\d{4}$/, "Choose a year")
    .refine((y) => Number(y) >= min && Number(y) <= max, "Choose a year from the list");

const thisYear = () => new Date().getFullYear();

// ─── Basic info (profile page) ───────────────────────────────────────────

export const BasicInfoSchema = z.object({
  name: NameSchema,
  phone: orEmpty(PhoneSchema),
  nationality: orEmpty(CountrySchema),
  residenceCountry: orEmpty(CountrySchema),
  residenceCity: z.string().trim().max(80, "That city name is too long"),
  dateOfBirth: orEmpty(BirthDateSchema),
});
// Form state is plain strings (what an <input> holds); the schemas above decide what is valid.
export type BasicInfoValues = {
  name: string;
  phone: string;
  nationality: string;
  residenceCountry: string;
  residenceCity: string;
  dateOfBirth: string;
};

// ─── Preferences (profile page) ──────────────────────────────────────────

export const SubjectsSchema = z
  .array(z.string().trim().min(2, "Subjects need at least 2 letters").max(60, "That subject is too long"))
  .max(MAX_SUBJECTS, `Choose up to ${MAX_SUBJECTS} subjects`);

export const PreferencesSchema = z.object({
  preferredDestination: orEmpty(z.enum(STUDY_DESTINATIONS, { error: "Choose a destination from the list" })),
  preferredStudyLevel: orEmpty(z.enum(STUDY_LEVELS, { error: "Choose a study level from the list" })),
  preferredStartYear: orEmpty(YearSchema(thisYear(), thisYear() + 6)),
  preferredStartMonth: orEmpty(z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"])),
  subjects: SubjectsSchema,
});
export type PreferencesValues = {
  preferredDestination: string;
  preferredStudyLevel: string;
  preferredStartYear: string;
  preferredStartMonth: string;
  subjects: string[];
};

// ─── Onboarding: one schema per step, stricter than the profile page ─────
// The modal asks for the essentials, so the key fields are required here.

export const OnboardingStepSchema = z.discriminatedUnion("step", [
  z.object({
    step: z.literal(1),
    name: NameSchema,
    phone: PhoneSchema,
    dateOfBirth: BirthDateSchema,
  }),
  z.object({
    step: z.literal(2),
    nationality: CountrySchema,
    residenceCountry: CountrySchema,
    residenceCity: z.string().trim().max(80, "That city name is too long"),
  }),
  z.object({
    step: z.literal(3),
    preferredDestination: z.enum(STUDY_DESTINATIONS, { error: "Choose where you want to study" }),
    preferredStudyLevel: z.enum(STUDY_LEVELS, { error: "Choose a study level" }),
    preferredStartYear: orEmpty(YearSchema(thisYear(), thisYear() + 6)),
    preferredStartMonth: orEmpty(z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"])),
  }),
  z.object({
    step: z.literal(4),
    subjects: SubjectsSchema,
  }),
]);
export type OnboardingStepInput =
  | { step: 1; name: string; phone: string; dateOfBirth: string }
  | { step: 2; nationality: string; residenceCountry: string; residenceCity: string }
  | {
      step: 3;
      preferredDestination: string;
      preferredStudyLevel: string;
      preferredStartYear: string;
      preferredStartMonth: string;
    }
  | { step: 4; subjects: string[] };

// ─── Qualifications and tests ────────────────────────────────────────────

export const QualificationSchema = z
  .object({
    level: z.enum(ACADEMIC_LEVELS, { error: "Choose a qualification level" }),
    institution: z.string().trim().min(2, "Enter the school or institution").max(120, "That name is too long"),
    programme: z.string().trim().max(120, "That name is too long"),
    country: orEmpty(CountrySchema),
    startYear: orEmpty(YearSchema(1950, thisYear() + 6)),
    endYear: orEmpty(YearSchema(1950, thisYear() + 6)),
    grade: z.string().trim().max(40, "Keep the grade under 40 characters"),
  })
  .refine((v) => !v.startYear || !v.endYear || Number(v.endYear) >= Number(v.startYear), {
    path: ["endYear"],
    message: "End year cannot be before the start year",
  });
export type QualificationValues = {
  level: string;
  institution: string;
  programme: string;
  country: string;
  startYear: string;
  endYear: string;
  grade: string;
};

export const TestKindSchema = z.enum(["ENGLISH", "STANDARDIZED"]);
export type TestKind = z.infer<typeof TestKindSchema>;

export const TEST_NAMES: Record<TestKind, readonly string[]> = {
  ENGLISH: ENGLISH_TESTS,
  STANDARDIZED: STANDARDIZED_TESTS,
};

export const TestSchema = z
  .object({
    kind: TestKindSchema,
    name: z.string().trim().min(1, "Choose a test"),
    score: z.string().trim().min(1, "Enter your score").max(60, "Keep the score under 60 characters"),
    testDate: orEmpty(TestDateSchema),
  })
  .refine((v) => TEST_NAMES[v.kind].includes(v.name), { path: ["name"], message: "Choose a test from the list" });
export type TestValues = { kind: TestKind; name: string; score: string; testDate: string };