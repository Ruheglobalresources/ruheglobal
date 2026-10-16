// src/lib/journey/prefill.ts
// "Fill in your details" starts filled with what the applicant already told us, so nobody types
// their nationality twice. Pure: the page loads the sources, this decides which input gets what.
// Order of trust for one input: what the applicant saved on this task (handled by the caller),
// then the same question answered in the eligibility check, then their profile and qualifications.
import type { AnswerMap, FlowField } from "@/lib/eligibility";
import { flattenAnswers, type EligibilityAnswers } from "./context";

export type PrefillQualification = {
  level: string;
  institution: string;
  programme: string | null;
  country: string | null;
  endYear: number | null;
  grade: string | null;
};

export type PrefillSource = {
  name: string | null;
  email: string | null;
  profile: {
    phone: string | null;
    nationality: string | null;
    residenceCountry: string | null;
    residenceCity: string | null;
    dateOfBirth: string | null; // yyyy-mm-dd
  } | null;
  qualifications: PrefillQualification[];
  eligibility: EligibilityAnswers;
};

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// "Ada Grace Okoro" -> first "Ada", middle "Grace", family "Okoro". A prefill only: the applicant
// still checks it against the passport.
function splitName(name: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", middle: "", family: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", family: "" };
  return { first: parts[0], middle: parts.slice(1, -1).join(" "), family: parts[parts.length - 1] };
}

function pickQualification(list: PrefillQualification[], level: string | null) {
  if (list.length === 0) return null;
  if (level) {
    const match = list.find((q) => same(q.level, level));
    if (match) return match;
  }
  // no level named on the task: the most recent one
  return [...list].sort((a, b) => (b.endYear ?? 0) - (a.endYear ?? 0))[0];
}

export function buildTaskPrefill(
  task: { qualificationLevel: string | null; fields: FlowField[] },
  source: PrefillSource
): AnswerMap {
  const eligibility = flattenAnswers(source.eligibility);
  const name = splitName(source.name);
  const profile = source.profile;
  const qualification = pickQualification(source.qualifications, task.qualificationLevel);

  // input key -> what the profile knows. Only keys of the field library that mean the same thing.
  const known: Record<string, string | null | undefined> = {
    first_name: name.first,
    middle_name: name.middle,
    family_name: name.family,
    date_of_birth: profile?.dateOfBirth,
    nationality: profile?.nationality,
    country_of_residence: profile?.residenceCountry,
    city: profile?.residenceCity,
    phone_number: profile?.phone,
    email: source.email,
    // the previous degree
    education_country: qualification?.country,
    education_university: qualification?.institution,
    institution_name: qualification?.institution,
    studied_major: qualification?.programme,
    field_of_study: qualification?.programme,
    graduation_year: qualification?.endYear ? String(qualification.endYear) : null,
    gpa_or_grade: qualification?.grade,
  };

  const out: AnswerMap = {};
  for (const field of task.fields) {
    const candidate = eligibility[field.key] ?? known[field.key];
    const value = candidate?.trim();
    if (!value) continue;

    // an input with a fixed list only takes a value that is on the list
    if ((field.type === "SELECT" || field.type === "MULTI_SELECT") && field.optionsSource === "STATIC" && !field.allowOther) {
      const option = field.options.find((o) => same(o, value));
      if (option) out[field.key] = option;
      continue;
    }
    out[field.key] = value;
  }
  return out;
}