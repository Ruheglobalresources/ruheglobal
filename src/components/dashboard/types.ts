// src/components/dashboard/types.ts
// Shapes returned by GET /api/v1/courses, /institutions and /catalog/summary.
// The Expo app can copy this file as it is.

export type CourseCardData = {
  id: string;
  kind: "course" | "programme"; // programme = a subject area of an institution with no course rows yet
  name: string;
  degree: string | null;
  level: string | null;
  subject: string | null;
  duration: string | null;
  nextIntake: string | null;
  tuition: string | null; // ready to show, e.g. "CA$16,808 / yr"
  institution: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
    city: string | null;
    country: string | null;
    countryFlag: string | null;
    url: string;
  };
};

export type InstitutionCardData = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  country: string | null;
  countryFlag: string | null;
  institutionType: string | null;
  imageUrl: string | null;
  logoUrl: string | null;
  ranking: string | null;
  tuition: string | null;
  courseCount: number;
  url: string;
};

export type CatalogSummary = { courses: number; institutions: number };
