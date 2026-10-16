// src/lib/journey/context.ts
// The answers the task rules (showWhen) read. They come from what the applicant told us before:
// the eligibility check answers (keyed by field key, like study_level) plus what the chosen course
// says about itself. Pure, so it is shared by the page, the actions and the admin review.
import type { AnswerMap } from "@/lib/eligibility";
import { joinMulti } from "@/lib/eligibility";

export const KEY_STUDY_LEVEL = "study_level";

// The levels the eligibility check offers: Foundation, Undergraduate, Postgraduate, Doctorate.
// A course's own wording ("MSc", "Master's", "Bachelor of Science") is mapped onto them.
export function normaliseStudyLevel(raw: string | null | undefined): string | null {
  const text = raw?.trim().toLowerCase();
  if (!text) return null;
  if (/(phd|doctor|dphil)/.test(text)) return "Doctorate";
  if (/(post|master|msc|mba|mres|llm|pgd|pgce)/.test(text)) return "Postgraduate";
  if (/(foundation|pathway|pre-?master|access)/.test(text)) return "Foundation";
  if (/(undergrad|bachelor|bsc|beng|hnd|honours|diploma)/.test(text)) return "Undergraduate";
  return null;
}

export type EligibilityAnswers = Record<string, string | string[]>;

export function flattenAnswers(answers: EligibilityAnswers): AnswerMap {
  const flat: AnswerMap = {};
  for (const [key, value] of Object.entries(answers)) {
    const text = Array.isArray(value) ? joinMulti(value) : value;
    if (typeof text === "string" && text.trim()) flat[key] = text;
  }
  return flat;
}

export function buildJourneyContext(input: { eligibility: EligibilityAnswers; courseLevel?: string | null }): AnswerMap {
  const context = flattenAnswers(input.eligibility);
  // the course the person is applying for is more exact than what they said in the eligibility check
  const fromCourse = normaliseStudyLevel(input.courseLevel);
  if (fromCourse) context[KEY_STUDY_LEVEL] = fromCourse;
  return context;
}