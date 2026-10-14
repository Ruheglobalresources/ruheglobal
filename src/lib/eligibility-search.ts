// src/lib/eligibility-search.ts
// Turns what a person answered in the Study Abroad eligibility check into a search on the school
// search page (/search), and reads that search back from the page address.
// Pure functions (no database, no React), so the web app, the server action and later the mobile
// app can all use the same file.
//
//   answers  ->  studySearchUrl()           ->  /search?from=eligibility&country=...&level=...
//   address  ->  searchFiltersFromParams()  ->  the filters the search page runs with
//
// The search page only knows the lists in src/lib/school-search/constants.ts (levels, fields,
// countries), so every answer is translated to one of those and anything else is left out.

import { KEY_STUDY_LEVEL, KEY_STUDY_SUBJECTS } from "@/lib/eligibility";
import { COUNTRIES, FIELDS, LEVELS } from "@/lib/school-search/constants";
import type { SearchFilters } from "@/lib/school-search/types";

// The Study Abroad pill of the eligibility check (prisma/data/eligibility-questions.ts).
export const STUDY_ABROAD_SLUG = "study-abroad";

// Question keys the search reads, besides study_level and study_subjects.
export const KEY_DESTINATION = "destination_country";
export const KEY_ENGLISH_TEST = "english_test";
export const KEY_IELTS_OVERALL = "ielts_overall";

// Added to the address so the search page knows the person came from the eligibility check.
export const FROM_ELIGIBILITY = "eligibility";

// The answer of "Study level" -> the level of the search page.
const LEVEL_BY_ANSWER: Record<string, (typeof LEVELS)[number]> = {
  Foundation: "Foundation / Pathway",
  Undergraduate: "Undergraduate (Bachelor's)",
  Postgraduate: "Postgraduate (Master's)",
  Doctorate: "PhD / Doctorate",
};

// Every subject of the "Subjects" question -> the field of study of the search page.
// null: no field fits. The subject's own name is still matched against the programmes.
// The keys of this object are also the only subjects the search accepts.
const FIELD_BY_SUBJECT: Record<string, (typeof FIELDS)[number] | null> = {
  Accounting: "Economics & Finance",
  "Aerospace Engineering": "Engineering",
  Agriculture: "Agriculture & Environment",
  Animation: "Art & Design",
  Anthropology: null,
  Architecture: "Architecture",
  "Artificial Intelligence": "Data Science & AI",
  Biochemistry: null,
  Biology: null,
  "Biomedical Science": "Medicine & Health",
  Biotechnology: null,
  Business: "Business & Management",
  "Business Administration": "Business & Management",
  "Chemical Engineering": "Engineering",
  Chemistry: null,
  "Civil Engineering": "Engineering",
  Communications: "Media & Communications",
  "Computer Science": "Computer Science & IT",
  "Construction Management": "Engineering",
  "Creative Writing": "Media & Communications",
  Criminology: "Law",
  "Cyber Security": "Computer Science & IT",
  "Data Science and Big Data": "Data Science & AI",
  Dentistry: "Medicine & Health",
  Design: "Art & Design",
  "Early Childhood Education": "Education",
  Economics: "Economics & Finance",
  Education: "Education",
  "Electrical Engineering": "Engineering",
  "Electronic Engineering": "Engineering",
  "Emergency Medicine": "Medicine & Health",
  "Energy Engineering": "Engineering",
  "Engineering and Technology": "Engineering",
  "English Literature": null,
  Entrepreneurship: "Business & Management",
  "Environmental Science": "Agriculture & Environment",
  "Event Management": "Hospitality & Tourism",
  Fashion: "Art & Design",
  "Film and Media": "Media & Communications",
  Finance: "Economics & Finance",
  "Fine Arts": "Art & Design",
  "Food Science": "Agriculture & Environment",
  "Forensic Science": null,
  "Game Design": "Art & Design",
  Geography: null,
  Geology: "Agriculture & Environment",
  "Graphic Design": "Art & Design",
  Healthcare: "Medicine & Health",
  History: null,
  "Hospitality Management": "Hospitality & Tourism",
  "Human Resource Management": "Business & Management",
  "Information Systems": "Computer Science & IT",
  "Information Technology": "Computer Science & IT",
  "International Business": "Business & Management",
  "International Relations": null,
  Journalism: "Media & Communications",
  Law: "Law",
  Linguistics: null,
  "Logistics and Supply Chain": "Business & Management",
  Management: "Business & Management",
  Marketing: "Business & Management",
  "Materials Science": "Engineering",
  Mathematics: null,
  "Mechanical Engineering": "Engineering",
  "Media and Communication": "Media & Communications",
  Medicine: "Medicine & Health",
  "Mental Health": "Medicine & Health",
  Microbiology: "Medicine & Health",
  Music: "Art & Design",
  Nursing: "Nursing",
  Nutrition: "Medicine & Health",
  "Oil and Gas Engineering": "Engineering",
  Pharmacy: "Medicine & Health",
  Philosophy: null,
  Physics: null,
  Physiotherapy: "Medicine & Health",
  "Political Science": null,
  "Project Management": "Business & Management",
  Psychology: "Psychology",
  "Public Administration": "Business & Management",
  "Public Health": "Medicine & Health",
  "Real Estate": "Business & Management",
  Robotics: "Engineering",
  "Social Work": null,
  Sociology: null,
  "Software Engineering": "Computer Science & IT",
  "Sports Science": "Medicine & Health",
  Statistics: "Data Science & AI",
  Telecommunications: "Engineering",
  "Tourism Management": "Hospitality & Tourism",
  "Urban Planning": "Architecture",
  "Veterinary Science": "Medicine & Health",
  "Web Development": "Computer Science & IT",
};

/** The subjects the school search accepts: the ones of the eligibility question. */
export const ELIGIBILITY_SUBJECTS: string[] = Object.keys(FIELD_BY_SUBJECT);

/** How many subjects the search carries (the same limit as the question). */
export const MAX_SEARCH_SUBJECTS = 5;

const isSubject = (name: string) => Object.prototype.hasOwnProperty.call(FIELD_BY_SUBJECT, name);

type Profile = Record<string, string | string[]>;

export type StudySearch = {
  /** null when the person chose "Other" or gave none: they pick the country on the search page. */
  country: string | null;
  /** null when the level is missing. */
  level: string | null;
  /** A field of study of the search page, "Any field" when no subject maps to one. */
  field: string;
  /** The subjects as answered, in the order picked. */
  subjects: string[];
  /** IELTS overall band, only when the person took the IELTS. */
  ielts: number | null;
};

const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

/** What the school search needs, from the saved answers (see toProfileAnswers in lib/eligibility.ts). */
export function studySearchFromProfile(profile: Profile): StudySearch {
  const destination = single(profile[KEY_DESTINATION]);
  const country = (COUNTRIES as readonly string[]).includes(destination) ? destination : null;

  const level = LEVEL_BY_ANSWER[single(profile[KEY_STUDY_LEVEL])] ?? null;

  const rawSubjects = profile[KEY_STUDY_SUBJECTS];
  const answered = Array.isArray(rawSubjects) ? rawSubjects : rawSubjects ? [rawSubjects] : [];
  const subjects = [...new Set(answered.map((s) => s.trim()).filter(isSubject))].slice(0, MAX_SEARCH_SUBJECTS);

  // The search page has one field of study: the first subject that has one.
  const field = subjects.map((s) => FIELD_BY_SUBJECT[s]).find((f): f is NonNullable<typeof f> => !!f) ?? "Any field";

  const score = Number(single(profile[KEY_IELTS_OVERALL]));
  const tookIelts = single(profile[KEY_ENGLISH_TEST]) === "IELTS";
  const ielts = tookIelts && Number.isFinite(score) && score >= 0 && score <= 9 ? score : null;

  return { country, level, field, subjects, ielts };
}

/** Where the person lands when the Study Abroad check is finished. */
export function studySearchUrl(profile: Profile): string {
  const search = studySearchFromProfile(profile);
  const params = new URLSearchParams({ from: FROM_ELIGIBILITY });
  if (search.country) params.set("country", search.country);
  if (search.level) params.set("level", search.level);
  if (search.field !== "Any field") params.set("field", search.field);
  if (search.subjects.length > 0) params.set("subjects", search.subjects.join(","));
  if (search.ielts !== null) params.set("ielts", String(search.ielts));
  return `/search?${params.toString()}`;
}

/**
 * The filters in a search page address. Every value is checked against the lists of the search
 * page, so an address someone typed or edited can never put something else into the search.
 */
export function searchFiltersFromParams(params: URLSearchParams): Partial<SearchFilters> {
  const filters: Partial<SearchFilters> = {};

  const country = params.get("country");
  if (country && (COUNTRIES as readonly string[]).includes(country)) filters.country = country;

  const level = params.get("level");
  if (level && (LEVELS as readonly string[]).includes(level)) filters.level = level;

  const field = params.get("field");
  if (field && (FIELDS as readonly string[]).includes(field)) filters.field = field;

  const subjects = (params.get("subjects") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(isSubject);
  if (subjects.length > 0) filters.subjects = [...new Set(subjects)].slice(0, MAX_SEARCH_SUBJECTS);

  const ielts = params.get("ielts");
  const score = ielts === null || ielts.trim() === "" ? Number.NaN : Number(ielts);
  if (Number.isFinite(score) && score >= 0 && score <= 9) filters.ieltsScore = score;

  return filters;
}