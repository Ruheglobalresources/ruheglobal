import type { SearchFilters } from "./types";

export const COUNTRIES = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Ireland",
  "New Zealand",
  "Germany",
  "Netherlands",
  "France",
  "Spain",
  "Italy",
  "Sweden",
  "Finland",
  "Switzerland",
  "Poland",
  "Portugal",
  "United Arab Emirates",
  "Malaysia",
  "Singapore",
  "Japan",
  "South Korea",
  "China",
  "South Africa",
  "Ghana",
  "Nigeria",
  "Kenya",
  "Rwanda",
  "Egypt",
  "Turkey",
  "Cyprus",
  "Malta",
  "Hungary",
  "Czech Republic",
  "Norway",
  "Denmark",
  "Belgium",
  "Austria",
  "Brazil",
  "Mexico",
  "India",
] as const;

export const INSTITUTION_TYPES = [
  "University",
  "College",
  "Polytechnic",
  "Business school",
  "Art & design school",
  "Medical school",
  "Language school",
  "Boarding / high school",
  "Community college",
  "Online institution",
] as const;

export const LEVELS = [
  "Foundation / Pathway",
  "Diploma",
  "Undergraduate (Bachelor's)",
  "Postgraduate (Master's)",
  "MBA",
  "PhD / Doctorate",
  "Short course / Certificate",
] as const;

export const FIELDS = [
  "Any field",
  "Business & Management",
  "Computer Science & IT",
  "Engineering",
  "Data Science & AI",
  "Medicine & Health",
  "Nursing",
  "Law",
  "Economics & Finance",
  "Architecture",
  "Education",
  "Psychology",
  "Media & Communications",
  "Art & Design",
  "Agriculture & Environment",
  "Hospitality & Tourism",
] as const;

export const BUDGETS = [
  { value: "any", label: "Any budget" },
  { value: "under-10000-usd", label: "Under $10,000 / year" },
  { value: "10000-20000-usd", label: "$10,000 – $20,000 / year" },
  { value: "20000-35000-usd", label: "$20,000 – $35,000 / year" },
  { value: "35000-plus-usd", label: "Over $35,000 / year" },
] as const;

export const RESULT_COUNTS = [3, 4, 5, 6, 8] as const;

export const DEFAULT_FILTERS: SearchFilters = {
  country: "United Kingdom",
  institutionType: "University",
  level: "Postgraduate (Master's)",
  field: "Computer Science & IT",
  budget: "any",
  count: 4,
};
