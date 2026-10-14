// src/lib/school-search/db-search.ts
//
// Our own vetted institutions (managed at /admin/institutions) are checked
// before the AI web-search runs. This is what lets us show a curated set of
// partner institutions by default, and skip the AI entirely for anything we
// already have verified in-house.
import type { Institution as DbInstitution } from "@prisma/client";
import { db } from "@/lib/db";
import type { School, SearchFilters } from "./types";

/** How many institutions the "before you search" default view shows. */
export const FEATURED_LIMIT = 12;

/**
 * The Institution table already stores everything ResultCard needs
 * (including a real imageUrl/logoUrl, since an admin — not a model —
 * supplied them), so this is a plain field-for-field mapping.
 */
export function institutionToSchool(row: DbInstitution): School {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    country: row.country,
    institutionType: row.institutionType,
    summary: row.summary,
    programs: row.programs,
    ielts: {
      overall: row.ieltsOverall,
      minBand: row.ieltsMinBand,
      alternatives: row.ieltsAlternatives,
      note: row.ieltsNote,
    },
    tuition: {
      min: row.tuitionMin,
      max: row.tuitionMax,
      currency: row.tuitionCurrency,
      period: row.tuitionPeriod,
      note: row.tuitionNote,
    },
    ranking: row.ranking,
    website: row.website,
    imageUrl: row.imageUrl,
    logoUrl: row.logoUrl,
  };
}

/**
 * Marks each school with whether the student's IELTS overall meets its requirement. A school whose
 * requirement is unknown is left unmarked. Without a score nothing changes.
 */
export function markIeltsFit(schools: School[], score?: number): School[] {
  if (score === undefined) return schools;
  return schools.map((school): School => {
    const required = school.ielts.overall;
    if (required === null) return school;
    return { ...school, ieltsFit: required <= score ? "meets" : "below" };
  });
}

/** The institutions shown before the student searches at all. */
export async function listFeaturedInstitutions(
  limit = FEATURED_LIMIT,
): Promise<DbInstitution[]> {
  return db.institution.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    take: limit,
  });
}

/**
 * A specific institution was named. Try an exact (case-insensitive) name
 * match first, then fall back to a "contains" match for near-misses like a
 * campus suffix ("University of Portsmouth" vs "... - Main Campus").
 */
export async function findInstitutionByName(
  name: string,
): Promise<DbInstitution | null> {
  const exact = await db.institution.findFirst({
    where: { isActive: true, name: { equals: name, mode: "insensitive" } },
  });
  if (exact) return exact;

  const candidates = await db.institution.findMany({
    where: { isActive: true, name: { contains: name, mode: "insensitive" } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    take: 5,
  });
  if (candidates.length === 0) return null;

  // Prefer the shortest matching name — closest to the plain institution
  // the student asked for, rather than a specific campus/pathway variant.
  return [...candidates].sort((a, b) => a.name.length - b.name.length)[0];
}

// ─────────────────────────────────────────────
// Loose keyword matching against free-text columns
// ─────────────────────────────────────────────
// The Institution table doesn't have separate "level" or "field" columns —
// that information lives inside `programs` and `summary`. So for a broad
// (no named institution) search we match on country precisely, then filter
// by keyword against that free text. It's a heuristic, not exact — if it
// ever needs to be precise, the right fix is adding structured level/field
// columns to the Institution model.

const FIELD_KEYWORDS: Record<string, string[]> = {
  "Business & Management": ["business", "management"],
  "Computer Science & IT": ["computer science", "software", "information technology", "computing"],
  Engineering: ["engineering"],
  "Data Science & AI": ["data science", "artificial intelligence", "machine learning", " ai "],
  "Medicine & Health": ["medicine", "medical", "health"],
  Nursing: ["nursing"],
  Law: ["law", "llm", "llb"],
  "Economics & Finance": ["economics", "finance", "financial"],
  Architecture: ["architecture"],
  Education: ["education", "teaching"],
  Psychology: ["psychology"],
  "Media & Communications": ["media", "communications", "journalism"],
  "Art & Design": ["art", "design"],
  "Agriculture & Environment": ["agriculture", "environment"],
  "Hospitality & Tourism": ["hospitality", "tourism"],
};

const LEVEL_KEYWORDS: Record<string, string[]> = {
  "Foundation / Pathway": ["foundation", "pathway", "pre-masters", "pre-university"],
  Diploma: ["diploma"],
  "Undergraduate (Bachelor's)": ["bachelor", "bsc", "beng", "ba ", "undergraduate"],
  "Postgraduate (Master's)": ["master", "msc", "meng", "ma ", "postgraduate", "pgdip", "pgcert"],
  MBA: ["mba"],
  "PhD / Doctorate": ["phd", "doctorate", "doctoral"],
  "Short course / Certificate": ["certificate", "short course"],
};

const TYPE_KEYWORDS: Record<string, string[]> = {
  College: ["college"],
  Polytechnic: ["polytechnic"],
  "Business school": ["business school"],
  "Art & design school": ["art", "design"],
  "Medical school": ["medical school", "medicine"],
  "Language school": ["language school", "english language"],
  "Boarding / high school": ["boarding", "high school", "secondary"],
  "Community college": ["community college"],
  "Online institution": ["online"],
};

function matchesAny(haystack: string, keywords: string[]): boolean {
  return keywords.some((k) => haystack.includes(k));
}

/** Best-effort match of one DB institution against the broad filters. */
function matchesFilters(row: DbInstitution, f: SearchFilters): boolean {
  const text = `${row.summary} ${row.programs.join(" ")}`.toLowerCase();

  // The field of study and the subjects the student picked in the eligibility check both count:
  // a school matches when its programmes mention any of them.
  const fieldKeywords = f.field !== "Any field" ? (FIELD_KEYWORDS[f.field] ?? []) : [];
  const subjectKeywords = (f.subjects ?? []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const keywords = [...fieldKeywords, ...subjectKeywords];
  if (keywords.length > 0 && !matchesAny(text, keywords)) return false;

  const levelKeywords = LEVEL_KEYWORDS[f.level];
  if (levelKeywords && !matchesAny(text, levelKeywords)) return false;

  // "University" is the default/most common choice, and our own
  // institutionType strings are all more descriptive variants of it
  // ("Public research university", etc.), so don't filter on it.
  if (f.institutionType !== "University") {
    const typeKeywords = TYPE_KEYWORDS[f.institutionType];
    const typeText = (row.institutionType ?? "").toLowerCase();
    if (typeKeywords && !matchesAny(typeText, typeKeywords)) return false;
  }

  return true;
}

/**
 * Broad ("Any institution") search against our own catalog. Country is
 * matched exactly at the database level; level/field/type are then
 * filtered in JS with the keyword heuristics above. When the student's IELTS
 * is known, the schools they qualify for come first, then the ones with no
 * known requirement, then the ones above their score (kept, not hidden).
 */
export async function searchInstitutionsInDb(
  filters: SearchFilters,
): Promise<DbInstitution[]> {
  const inCountry = await db.institution.findMany({
    where: { isActive: true, country: { equals: filters.country, mode: "insensitive" } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  const matching = inCountry.filter((row) => matchesFilters(row, filters));

  const score = filters.ieltsScore;
  if (score !== undefined) {
    const rank = (row: DbInstitution) => (row.ieltsOverall === null ? 1 : row.ieltsOverall <= score ? 0 : 2);
    // Array.sort is stable, so the admin's own order is kept inside each group.
    matching.sort((a, b) => rank(a) - rank(b));
  }

  return matching.slice(0, filters.count);
}