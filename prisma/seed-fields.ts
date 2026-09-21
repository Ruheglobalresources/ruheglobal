// Seeds the Field Library with a comprehensive starter set covering
// everything a study-abroad, work & migration, exam-prep, or scholarship
// application typically asks for — grouped by category so the admin
// checklist reads cleanly. Upserted by `key`, so this is safe to re-run
// any time (e.g. after adding a new field to this list).
//
// Run with:  npm run seed:fields

// This script runs standalone via tsx, outside Next.js, so Next's automatic
// .env loading doesn't apply here — load it the same way prisma.config.ts
// does, before anything reads process.env.DATABASE_URL.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Make sure it's in your .env file (or .env.local — see note below) at the project root."
  );
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

type Seed = {
  key: string;
  label: string;
  type:
    | "TEXT"
    | "TEXTAREA"
    | "EMAIL"
    | "PHONE"
    | "NUMBER"
    | "DATE"
    | "SELECT"
    | "MULTI_SELECT"
    | "CHECKBOX"
    | "IMAGE"
    | "FILE";
  category: string;
  placeholder?: string;
  helpText?: string;
  options?: string[];
};

const FIELDS: Seed[] = [
  // ── Personal Details ─────────────────────────────────────────────
  { key: "title", label: "Title", type: "SELECT", category: "Personal Details", options: ["Mr", "Mrs", "Ms", "Dr", "Prof"] },
  { key: "first_name", label: "First name", type: "TEXT", category: "Personal Details", placeholder: "As it appears on your passport" },
  { key: "middle_name", label: "Middle name", type: "TEXT", category: "Personal Details" },
  { key: "family_name", label: "Family name / surname", type: "TEXT", category: "Personal Details", helpText: "Exactly as printed in your passport" },
  { key: "date_of_birth", label: "Date of birth", type: "DATE", category: "Personal Details" },
  { key: "gender", label: "Gender", type: "SELECT", category: "Personal Details", options: ["Male", "Female", "Prefer not to say"] },
  { key: "nationality", label: "Nationality", type: "TEXT", category: "Personal Details" },
  { key: "country_of_residence", label: "Country of residence", type: "TEXT", category: "Personal Details" },
  { key: "marital_status", label: "Marital status", type: "SELECT", category: "Personal Details", options: ["Single", "Married", "Divorced", "Widowed"] },
  { key: "passport_photo", label: "Passport photograph", type: "IMAGE", category: "Personal Details", helpText: "Recent passport-style photo, white background" },

  // ── Passport & Travel ────────────────────────────────────────────
  { key: "passport_number", label: "Passport number", type: "TEXT", category: "Passport & Travel" },
  { key: "passport_issue_date", label: "Passport issue date", type: "DATE", category: "Passport & Travel" },
  { key: "passport_expiry_date", label: "Passport expiry date", type: "DATE", category: "Passport & Travel" },
  { key: "passport_issuing_country", label: "Passport issuing country", type: "TEXT", category: "Passport & Travel" },
  { key: "passport_bio_page", label: "Passport bio-data page (scan)", type: "FILE", category: "Passport & Travel" },
  { key: "has_previous_visa_refusal", label: "Have you ever been refused a visa?", type: "CHECKBOX", category: "Passport & Travel" },
  { key: "travel_history", label: "Travel history (countries visited, last 5 years)", type: "TEXTAREA", category: "Passport & Travel" },

  // ── Academic Background ──────────────────────────────────────────
  { key: "highest_qualification", label: "Highest qualification", type: "SELECT", category: "Academic Background", options: ["Secondary School", "Diploma", "Bachelor's Degree", "Master's Degree", "Doctorate"] },
  { key: "institution_name", label: "Most recent institution attended", type: "TEXT", category: "Academic Background" },
  { key: "field_of_study", label: "Field of study", type: "TEXT", category: "Academic Background" },
  { key: "graduation_year", label: "Graduation year", type: "NUMBER", category: "Academic Background" },
  { key: "gpa_or_grade", label: "GPA / final grade", type: "TEXT", category: "Academic Background", placeholder: "e.g. 3.7/4.0 or Second Class Upper" },
  { key: "academic_transcript", label: "Academic transcript", type: "FILE", category: "Academic Background", helpText: "Official, sealed/stamped where possible" },
  { key: "degree_certificate", label: "Degree certificate / diploma", type: "FILE", category: "Academic Background" },
  { key: "provisional_certificate", label: "Provisional certificate (if final year)", type: "FILE", category: "Academic Background" },

  // ── English Proficiency ──────────────────────────────────────────
  { key: "english_test_type", label: "English test taken", type: "SELECT", category: "English Proficiency", options: ["IELTS", "TOEFL", "PTE Academic", "Duolingo English Test", "Cambridge English", "Not yet taken"] },
  { key: "english_test_score", label: "English test overall score", type: "TEXT", category: "English Proficiency" },
  { key: "english_test_certificate", label: "English test certificate", type: "FILE", category: "English Proficiency" },

  // ── Standardized Tests ───────────────────────────────────────────
  { key: "standardized_test_type", label: "Standardized test taken", type: "SELECT", category: "Standardized Tests", options: ["SAT", "ACT", "GRE", "GMAT", "None"] },
  { key: "standardized_test_score", label: "Standardized test score", type: "TEXT", category: "Standardized Tests" },

  // ── Study Preferences ────────────────────────────────────────────
  { key: "preferred_countries", label: "Preferred study destination(s)", type: "MULTI_SELECT", category: "Study Preferences", options: ["UK", "USA", "Canada", "Australia", "Germany", "Ireland", "New Zealand", "Other"] },
  { key: "preferred_university", label: "Preferred university", type: "TEXT", category: "Study Preferences" },
  { key: "preferred_program", label: "Preferred program / course", type: "TEXT", category: "Study Preferences" },
  { key: "study_level", label: "Study level", type: "SELECT", category: "Study Preferences", options: ["Foundation", "Undergraduate", "Postgraduate", "PhD", "Diploma / Certificate"] },
  { key: "intended_intake", label: "Intended intake", type: "SELECT", category: "Study Preferences", options: ["January", "May", "September", "Other"] },
  { key: "intended_year", label: "Intended year of entry", type: "NUMBER", category: "Study Preferences" },

  // ── Essays & Documents ───────────────────────────────────────────
  { key: "statement_of_purpose", label: "Statement of purpose", type: "TEXTAREA", category: "Essays & Documents", helpText: "Why this program, why this university, why now" },
  { key: "personal_essay", label: "Personal essay", type: "TEXTAREA", category: "Essays & Documents" },
  { key: "research_proposal", label: "Research proposal (graduate applicants)", type: "FILE", category: "Essays & Documents" },
  { key: "cv_resume", label: "CV / resume", type: "FILE", category: "Essays & Documents" },
  { key: "portfolio", label: "Portfolio (art, design, architecture programs)", type: "FILE", category: "Essays & Documents" },

  // ── Financial ─────────────────────────────────────────────────────
  { key: "proof_of_funds", label: "Proof of funds / bank statement", type: "FILE", category: "Financial" },
  { key: "sponsor_name", label: "Sponsor's name", type: "TEXT", category: "Financial" },
  { key: "sponsor_relationship", label: "Relationship to sponsor", type: "SELECT", category: "Financial", options: ["Self", "Parent", "Guardian", "Employer", "Scholarship", "Other"] },
  { key: "interested_in_scholarship", label: "Interested in scholarship options?", type: "CHECKBOX", category: "Financial" },
  { key: "estimated_budget", label: "Estimated annual budget (USD)", type: "NUMBER", category: "Financial" },

  // ── References ────────────────────────────────────────────────────
  { key: "referee_one_name", label: "Referee 1 — full name", type: "TEXT", category: "References" },
  { key: "referee_one_email", label: "Referee 1 — email", type: "EMAIL", category: "References" },
  { key: "letter_of_recommendation_one", label: "Letter of recommendation 1", type: "FILE", category: "References" },
  { key: "referee_two_name", label: "Referee 2 — full name", type: "TEXT", category: "References" },
  { key: "referee_two_email", label: "Referee 2 — email", type: "EMAIL", category: "References" },
  { key: "letter_of_recommendation_two", label: "Letter of recommendation 2", type: "FILE", category: "References" },

  // ── Visa & Compliance ────────────────────────────────────────────
  { key: "visa_type", label: "Visa type applying for", type: "TEXT", category: "Visa & Compliance" },
  { key: "medical_exam_required", label: "Medical exam completed (if required)", type: "CHECKBOX", category: "Visa & Compliance" },
  { key: "police_clearance_certificate", label: "Police clearance certificate", type: "FILE", category: "Visa & Compliance" },

  // ── Contact & Other ──────────────────────────────────────────────
  { key: "phone_number", label: "Phone number", type: "PHONE", category: "Contact & Other" },
  { key: "whatsapp_number", label: "WhatsApp number", type: "PHONE", category: "Contact & Other" },
  { key: "residential_address", label: "Residential address", type: "TEXTAREA", category: "Contact & Other" },
  { key: "city", label: "City", type: "TEXT", category: "Contact & Other" },
  { key: "state_or_province", label: "State / province", type: "TEXT", category: "Contact & Other" },
  { key: "postal_code", label: "Postal code", type: "TEXT", category: "Contact & Other" },
  { key: "emergency_contact_name", label: "Emergency contact — name", type: "TEXT", category: "Contact & Other" },
  { key: "emergency_contact_phone", label: "Emergency contact — phone", type: "PHONE", category: "Contact & Other" },
  { key: "how_did_you_hear_about_us", label: "How did you hear about us?", type: "SELECT", category: "Contact & Other", options: ["Social Media", "Friend / Family Referral", "Google Search", "Education Fair", "Agent / Consultant", "Other"] },
  { key: "additional_notes", label: "Additional notes", type: "TEXTAREA", category: "Contact & Other" },
];

async function main() {
  console.log(`Seeding ${FIELDS.length} field definitions...`);
  for (const f of FIELDS) {
    await db.fieldDefinition.upsert({
      where: { key: f.key },
      update: {
        label: f.label,
        type: f.type,
        category: f.category,
        placeholder: f.placeholder ?? null,
        helpText: f.helpText ?? null,
        options: f.options ?? undefined,
      },
      create: {
        key: f.key,
        label: f.label,
        type: f.type,
        category: f.category,
        placeholder: f.placeholder ?? null,
        helpText: f.helpText ?? null,
        options: f.options ?? undefined,
      },
    });
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });