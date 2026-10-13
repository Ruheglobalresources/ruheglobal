// prisma/data/eligibility-questions.ts
// The starting questions of the eligibility check. This file only fills the database the first time
// (prisma/seed-eligibility.ts); after that the questions are edited in the admin, and a re-run never
// overwrites those edits.
//
// Structure (all of it is database rows, so it can be changed without code):
//   one terminal of kind ELIGIBILITY ("Eligibility check", hidden from the portal home)
//     one application per pill of "What would you like to do today?"
//       steps: a heading (title + emoji) and the questions of that step
//         each question: required or not, and an optional `showWhen` rule
//
// showWhen: { fieldKey, in?: [...], notIn?: [...] } shows the question only when that earlier answer
// matches. A step whose questions are all hidden is skipped.
//
// Question keys are what the course search reads, so keep study_level and study_subjects.
// Choices of a multi-select must not contain commas.

import type { ShowWhen } from "../../src/lib/eligibility";

export type FieldSeed = {
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "MULTI_SELECT" | "CHECKBOX";
  category: string;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  display?: "DEFAULT" | "PILLS" | "SEARCH";
  optionsSource?: "STATIC" | "COUNTRIES" | "UNIVERSITIES";
  dependsOnKey?: string;
  maxSelections?: number;
  suggestions?: string[];
  pattern?: string;
};

export type StepSeed = {
  number: number;
  title: string;
  emoji?: string;
  fields: { key: string; required?: boolean; showWhen?: ShowWhen }[];
};

export type PillSeed = {
  slug: string;
  name: string;
  subtitle: string;
  icon: string; // a lucide icon name the flow knows: GraduationCap, FileCheck2, House, Briefcase
  order: number;
  steps: StepSeed[];
};

export const TERMINAL = { name: "Eligibility check", slug: "eligibility-check", order: 99 };

// ───────────────────────── choices ─────────────────────────

export const POSTGRAD_LEVELS = ["Postgraduate"];

const SUBJECTS = [
  "Accounting", "Aerospace Engineering", "Agriculture", "Animation", "Anthropology", "Architecture",
  "Artificial Intelligence", "Biochemistry", "Biology", "Biomedical Science", "Biotechnology", "Business",
  "Business Administration", "Chemical Engineering", "Chemistry", "Civil Engineering", "Communications",
  "Computer Science", "Construction Management", "Creative Writing", "Criminology", "Cyber Security",
  "Data Science and Big Data", "Dentistry", "Design", "Early Childhood Education", "Economics", "Education",
  "Electrical Engineering", "Electronic Engineering", "Emergency Medicine", "Energy Engineering",
  "Engineering and Technology", "English Literature", "Entrepreneurship", "Environmental Science",
  "Event Management", "Fashion", "Film and Media", "Finance", "Fine Arts", "Food Science", "Forensic Science",
  "Game Design", "Geography", "Geology", "Graphic Design", "Healthcare", "History", "Hospitality Management",
  "Human Resource Management", "Information Systems", "Information Technology", "International Business",
  "International Relations", "Journalism", "Law", "Linguistics", "Logistics and Supply Chain", "Management",
  "Marketing", "Materials Science", "Mathematics", "Mechanical Engineering", "Media and Communication",
  "Medicine", "Mental Health", "Microbiology", "Music", "Nursing", "Nutrition", "Oil and Gas Engineering",
  "Pharmacy", "Philosophy", "Physics", "Physiotherapy", "Political Science", "Project Management", "Psychology",
  "Public Administration", "Public Health", "Real Estate", "Robotics", "Social Work", "Sociology",
  "Software Engineering", "Sports Science", "Statistics", "Telecommunications", "Tourism Management",
  "Urban Planning", "Veterinary Science", "Web Development",
];

const POPULAR_SUBJECTS = [
  "Computer Science", "Artificial Intelligence", "Business", "Cyber Security", "Healthcare",
  "Data Science and Big Data", "Finance", "Emergency Medicine", "Business Administration",
  "Engineering and Technology",
];

const MAJORS = [
  "Accounting", "Actuarial Science", "Agricultural Economics", "Agricultural Engineering", "Agriculture",
  "Anatomy", "Animal Science", "Architecture", "Banking and Finance", "Biochemistry", "Biology",
  "Biomedical Engineering", "Botany", "Building Technology", "Business Administration", "Chemical Engineering",
  "Chemistry", "Civil Engineering", "Computer Engineering", "Computer Science", "Criminology and Security Studies",
  "Dentistry", "Economics", "Education", "Electrical and Electronic Engineering",
  "Electrical, Electronics, and Communications Engineering", "Electronic Systems Engineering",
  "Electrical Power Engineering", "Electronics and Communications", "Engineering Physics", "English Language",
  "Entrepreneurship", "Environmental Management", "Estate Management", "Fisheries",
  "Food Science and Technology", "Forestry", "French", "Geography", "Geology", "Geophysics",
  "Guidance and Counselling", "Health Information Management", "History and International Studies",
  "Hospitality Management", "Human Resource Management", "Industrial Chemistry", "Industrial Engineering",
  "Information Technology", "Insurance", "International Relations", "Law", "Library and Information Science",
  "Linguistics", "Marketing", "Mass Communication", "Materials and Metallurgical Engineering", "Mathematics",
  "Mechanical Engineering", "Medical Laboratory Science", "Medicine and Surgery", "Microbiology",
  "Mining Engineering", "Nursing", "Nutrition and Dietetics", "Optometry", "Petroleum Engineering", "Pharmacy",
  "Philosophy", "Physics", "Physiology", "Physiotherapy", "Political Science", "Production Engineering",
  "Project Management", "Psychology", "Public Administration", "Public Health", "Quantity Surveying",
  "Radiography", "Religious Studies", "Science Laboratory Technology", "Social Work", "Sociology",
  "Software Engineering", "Statistics", "Surveying and Geoinformatics", "Systems Engineering",
  "Telecommunications Engineering", "Theatre Arts", "Urban and Regional Planning", "Veterinary Medicine", "Zoology",
];

const DESTINATIONS = [
  "United Kingdom", "Canada", "United States", "Australia", "Germany", "Ireland", "France", "Netherlands",
  "New Zealand", "Italy", "Poland", "United Arab Emirates", "South Africa", "Other",
];

// ───────────────────────── questions ─────────────────────────

export const FIELDS: FieldSeed[] = [
  // Study abroad: what to study
  {
    key: "study_level",
    label: "Study level",
    type: "SELECT",
    category: "What do you wish to study?",
    display: "PILLS",
    options: ["Foundation", "Undergraduate", "Postgraduate", "Doctorate"],
  },
  {
    key: "study_subjects",
    label: "Subjects",
    type: "MULTI_SELECT",
    category: "What do you wish to study?",
    display: "SEARCH",
    placeholder: "Search here to select subjects",
    helpText: "You can pick up to 5 subjects",
    maxSelections: 5,
    options: SUBJECTS,
    suggestions: POPULAR_SUBJECTS,
  },
  // Study abroad: the previous degree
  {
    key: "education_country",
    label: "Country of Education",
    type: "SELECT",
    category: "Your education",
    display: "SEARCH",
    optionsSource: "COUNTRIES",
  },
  {
    key: "education_university",
    label: "University (optional)",
    type: "SELECT",
    category: "Your education",
    display: "SEARCH",
    optionsSource: "UNIVERSITIES",
    dependsOnKey: "education_country",
  },
  {
    key: "grading_system",
    label: "Grading System",
    type: "SELECT",
    category: "Your education",
    display: "SEARCH",
    options: [
      "CGPA 4 (1-4)", "CGPA 5 (1-5)", "CGPA 7 (1-7)", "CGPA 10 (1-10)", "CGPA 20 (1-20)", "Percentage (1-100)",
    ],
  },
  {
    key: "grade_score",
    label: "Enter Score",
    type: "NUMBER",
    category: "Your education",
    helpText: "Use the scale you picked above",
  },
  {
    key: "studied_major",
    label: "Studied Major",
    type: "SELECT",
    category: "Your education",
    display: "SEARCH",
    options: MAJORS,
  },
  // Study abroad: English test
  {
    key: "english_test",
    label: "English test",
    type: "SELECT",
    category: "English test",
    display: "PILLS",
    options: [
      "Duolingo", "OET", "TOEFL (old)", "IELTS", "PTE Academic", "LanguageCert International ESOL",
      "C1 Advanced (CAE)", "CAEL", "Goethe-Zertifikat", "TestDaF", "TOEFL 2026", "I haven't taken any yet",
    ],
  },
  // IELTS bands: 0 to 9 in steps of 0.5
  ...(
    [
      ["ielts_overall", "Overall Band Score (1-9)"],
      ["ielts_listening", "Listening (1-9)"],
      ["ielts_reading", "Reading (1-9)"],
      ["ielts_writing", "Writing (1-9)"],
      ["ielts_speaking", "Speaking (1-9)"],
    ] as const
  ).map(
    ([key, label]): FieldSeed => ({
      key,
      label,
      type: "NUMBER",
      category: "IELTS results",
      pattern: "^([0-8](\\.[05])?|9(\\.0)?)$",
    })
  ),
  {
    key: "english_overall_score",
    label: "Overall score",
    type: "NUMBER",
    category: "English test results",
  },
  // Study abroad: dates
  {
    key: "study_start",
    label: "Start date",
    type: "SELECT",
    category: "Study dates",
    display: "PILLS",
    options: ["Within 3 months", "In 3 to 6 months", "In 6 to 12 months", "Next year or later", "Not sure yet"],
  },

  // Shared by visa, accommodation and work abroad
  {
    key: "destination_country",
    label: "Destination country",
    type: "SELECT",
    category: "Destination",
    display: "SEARCH",
    options: DESTINATIONS,
  },

  // Visa application
  {
    key: "visa_type",
    label: "Visa type",
    type: "SELECT",
    category: "Visa",
    display: "PILLS",
    options: ["Study visa", "Work visa", "Visit visa", "Dependant visa", "Not sure yet"],
  },
  {
    key: "visa_refused_before",
    label: "Has a visa application of yours been refused before?",
    type: "SELECT",
    category: "Visa history",
    display: "PILLS",
    options: ["Yes", "No"],
  },

  // Accommodation
  {
    key: "accommodation_city",
    label: "City",
    type: "TEXT",
    category: "Location",
  },
  {
    key: "accommodation_type",
    label: "Type of accommodation",
    type: "SELECT",
    category: "Accommodation",
    display: "PILLS",
    options: ["Student residence", "Private apartment", "Shared house", "Homestay", "Not sure yet"],
  },
  {
    key: "accommodation_move_in",
    label: "When do you need it?",
    type: "SELECT",
    category: "Accommodation",
    display: "PILLS",
    options: ["Within 3 months", "In 3 to 6 months", "In 6 to 12 months", "Not sure yet"],
  },

  // Work abroad
  {
    key: "work_field",
    label: "Field of work",
    type: "SELECT",
    category: "Work",
    display: "SEARCH",
    options: [
      "Healthcare and Nursing", "Engineering", "Information Technology", "Construction and Trades", "Hospitality",
      "Agriculture", "Education and Teaching", "Logistics and Transport", "Finance and Accounting",
      "Sales and Marketing", "Care Work", "Other",
    ],
  },
  {
    key: "work_experience",
    label: "Years of work experience",
    type: "SELECT",
    category: "Work",
    display: "PILLS",
    options: ["No experience yet", "Less than 2 years", "2 to 5 years", "More than 5 years"],
  },
];

// ───────────────────────── the pills ─────────────────────────

export const PILLS: PillSeed[] = [
  {
    slug: "study-abroad",
    name: "Study Abroad",
    subtitle: "Find courses and schools that fit your background",
    icon: "GraduationCap",
    order: 1,
    steps: [
      {
        number: 1,
        title: "What do you wish to study?",
        emoji: "📚",
        fields: [
          { key: "study_level", required: true },
          { key: "study_subjects", required: true },
        ],
      },
      {
        number: 2,
        title: "Tell us your Undergraduate story",
        emoji: "🔍",
        fields: [
          { key: "education_country", required: true, showWhen: { fieldKey: "study_level", in: POSTGRAD_LEVELS } },
          { key: "education_university", showWhen: { fieldKey: "study_level", in: POSTGRAD_LEVELS } },
          { key: "grading_system", required: true, showWhen: { fieldKey: "study_level", in: POSTGRAD_LEVELS } },
          { key: "grade_score", required: true, showWhen: { fieldKey: "study_level", in: POSTGRAD_LEVELS } },
          { key: "studied_major", required: true, showWhen: { fieldKey: "study_level", in: POSTGRAD_LEVELS } },
        ],
      },
      {
        number: 3,
        title: "Which English language test have you taken so far?",
        emoji: "✍️",
        fields: [{ key: "english_test", required: true }],
      },
      {
        number: 4,
        title: "Enter your IELTS results",
        emoji: "📝",
        fields: ["ielts_overall", "ielts_listening", "ielts_reading", "ielts_writing", "ielts_speaking"].map((key) => ({
          key,
          required: true,
          showWhen: { fieldKey: "english_test", in: ["IELTS"] },
        })),
      },
      {
        number: 5,
        title: "Enter your test results",
        emoji: "📝",
        fields: [
          {
            key: "english_overall_score",
            required: true,
            showWhen: { fieldKey: "english_test", notIn: ["IELTS", "I haven't taken any yet"] },
          },
        ],
      },
      {
        number: 6,
        title: "When would you like to start?",
        emoji: "📅",
        fields: [{ key: "study_start", required: true }],
      },
    ],
  },
  {
    slug: "visa-application",
    name: "Visa Application",
    subtitle: "Check what you need for your visa",
    icon: "FileCheck2",
    order: 2,
    steps: [
      {
        number: 1,
        title: "Which visa do you need?",
        emoji: "🛂",
        fields: [
          { key: "destination_country", required: true },
          { key: "visa_type", required: true },
        ],
      },
      {
        number: 2,
        title: "Tell us about your visa history",
        emoji: "🗂️",
        fields: [{ key: "visa_refused_before", required: true }],
      },
    ],
  },
  {
    slug: "accommodation",
    name: "Accommodation",
    subtitle: "Find a place to stay before you arrive",
    icon: "House",
    order: 3,
    steps: [
      {
        number: 1,
        title: "Where will you be staying?",
        emoji: "🏠",
        fields: [
          { key: "destination_country", required: true },
          { key: "accommodation_city" },
        ],
      },
      {
        number: 2,
        title: "What are you looking for?",
        emoji: "🔑",
        fields: [
          { key: "accommodation_type", required: true },
          { key: "accommodation_move_in", required: true },
        ],
      },
    ],
  },
  {
    slug: "work-abroad",
    name: "Work Abroad",
    subtitle: "See where your skills are needed",
    icon: "Briefcase",
    order: 4,
    steps: [
      {
        number: 1,
        title: "Where do you want to work?",
        emoji: "💼",
        fields: [
          { key: "destination_country", required: true },
          { key: "work_field", required: true },
        ],
      },
      {
        number: 2,
        title: "Tell us about your experience",
        emoji: "⏳",
        fields: [{ key: "work_experience", required: true }],
      },
    ],
  },
];