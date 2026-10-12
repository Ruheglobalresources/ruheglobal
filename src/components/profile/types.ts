// src/components/profile/types.ts
// What the server page hands to the client components. Everything is a plain string so
// it can cross the server/client boundary and sit in a form input without conversion.
// An empty string means "not set".
import type { TestKind } from "@/schemas/profile";

export type ProfileData = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  phone: string;
  nationality: string;
  residenceCountry: string;
  residenceCity: string;
  dateOfBirth: string; // YYYY-MM-DD
  preferredDestination: string;
  preferredStudyLevel: string;
  preferredStartYear: string;
  preferredStartMonth: string; // "1" to "12"
  subjects: string[];
};

export type QualificationItem = {
  id: string;
  level: string;
  institution: string;
  programme: string;
  country: string;
  startYear: string;
  endYear: string;
  grade: string;
};

export type TestItem = {
  id: string;
  kind: TestKind;
  name: string;
  score: string;
  testDate: string; // YYYY-MM-DD
};

export type ProfileTab = "basic" | "qualifications" | "preferences";