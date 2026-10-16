// prisma/data/journeys/school.ts
// The timeline of the school application (the one application of kind SCHOOL, "Course Application
// Form"), the same for every school and institution:
//
//   1 Submit Documents  signed off by a counsellor: this is the consultation gate, so nothing is
//                       applied to a school before a counsellor has checked the documents
//   2 Apply             staff tick it off when the application has gone to the school
//   3 Offer             ... when the offer arrives
//   4 Confirm enrolment ... when the deposit and the confirmation are done
//   5 Visa              ... when the visa is applied for and decided
//   6 Enroll            ... when the student has arrived and enrolled
//
// Undergraduate documents are only asked of people applying for a Postgraduate or Doctorate
// course (the level of the chosen course decides, see lib/journey/context.ts).
// Details inputs use the keys of the question library (prisma/seed-fields.ts and
// prisma/data/eligibility-questions.ts), so the education questions are the same ones the
// eligibility check asks and arrive prefilled from it.
import type { JourneySeed } from "./types";

const POSTGRAD = { fieldKey: "study_level", in: ["Postgraduate", "Doctorate"] };
const DOCUMENT_FILES = "application/pdf,.doc,.docx,image/*";

export const SCHOOL_JOURNEY: JourneySeed = {
  name: "School application",
  application: { kind: "SCHOOL" },

  extraFields: [
    {
      key: "secondary_school_name",
      label: "School attended",
      type: "TEXT",
      category: "Academic Background",
      placeholder: "Name of your senior high school",
    },
    {
      key: "secondary_exam_type",
      label: "Examination taken",
      type: "SELECT",
      category: "Academic Background",
      options: ["WAEC (WASSCE)", "NECO (SSCE)", "GCE", "IGCSE", "A-levels", "IB Diploma", "Other"],
    },
  ],

  stages: [
    {
      number: 1,
      slug: "submit-documents",
      title: "Submit Documents",
      description:
        "Send the documents we need for your consultation. Your counsellor checks them before we apply to the school for you.",
      completion: "STAFF",
      tasks: [
        // Identity
        {
          slug: "passport",
          title: "Passport",
          group: "Identity",
          description: "Upload the photo page of your passport, then check the details match it exactly.",
          maxFiles: 2,
          fields: [
            { key: "first_name", required: true },
            { key: "middle_name" },
            { key: "family_name", required: true },
            { key: "date_of_birth", required: true },
            { key: "nationality", required: true },
            { key: "passport_number", required: true },
            { key: "passport_issue_date", required: true },
            { key: "passport_expiry_date", required: true },
            { key: "passport_issuing_country" },
          ],
        },

        // Academic Certificates
        {
          slug: "senior-high-school-marksheets",
          title: "Marksheets",
          group: "Academic Certificates",
          subgroup: "Senior high school",
          description: "Your senior high school results (WAEC, NECO, GCE or equivalent).",
          maxFiles: 6,
          fields: [
            { key: "education_country", required: true },
            { key: "secondary_school_name", required: true },
            { key: "secondary_exam_type", required: true },
            { key: "graduation_year", required: true },
          ],
        },
        {
          slug: "undergraduate-graduation-certificate",
          title: "Undergraduate Graduation Certificate",
          group: "Academic Certificates",
          subgroup: "Undergraduate",
          description: "Your degree certificate. Provisional certificates are accepted if you have not collected the original.",
          showWhen: POSTGRAD,
          qualificationLevel: "Bachelor's degree",
          maxFiles: 3,
          fields: [
            { key: "education_country", required: true },
            { key: "education_university" },
            { key: "graduation_year", required: true },
            { key: "studied_major" },
          ],
        },
        {
          slug: "undergraduate-semester-marksheets",
          title: "Undergraduate Semester Marksheets",
          group: "Academic Certificates",
          subgroup: "Undergraduate",
          description: "Every semester result from your degree, or your final transcript.",
          showWhen: POSTGRAD,
          qualificationLevel: "Bachelor's degree",
          maxFiles: 12,
          fields: [
            { key: "education_country", required: true },
            { key: "education_university" },
            { key: "grading_system", required: true },
            { key: "grade_score", required: true },
          ],
        },

        // Professional Records
        {
          slug: "cv-resume",
          title: "CV/Resume",
          group: "Professional Records",
          accept: DOCUMENT_FILES,
          maxFiles: 3,
        },
        {
          slug: "experience-letter",
          title: "Experience Letter",
          group: "Professional Records",
          required: false,
          accept: DOCUMENT_FILES,
          maxFiles: 3,
        },
        {
          slug: "personal-statement",
          title: "Personal Statement",
          group: "Professional Records",
          accept: DOCUMENT_FILES,
          maxFiles: 3,
        },
        {
          slug: "letter-of-reference",
          title: "Letter of Reference",
          group: "Professional Records",
          required: false,
          accept: DOCUMENT_FILES,
          maxFiles: 3,
          fields: [{ key: "referee_one_name" }, { key: "referee_one_email" }],
        },
      ],
    },

    {
      number: 2,
      slug: "apply",
      title: "Apply",
      description: "We submit your application to the school. You will see each step here as your counsellor completes it.",
      completion: "AUTO",
      tasks: [
        { slug: "application-submitted", title: "Application submitted to the school", kind: "MILESTONE" },
      ],
    },
    {
      number: 3,
      slug: "offer",
      title: "Offer",
      description: "The school reviews your application and sends its decision.",
      completion: "AUTO",
      tasks: [{ slug: "offer-received", title: "Offer received", kind: "MILESTONE" }],
    },
    {
      number: 4,
      slug: "confirm-enrolment",
      title: "Confirm enrolment",
      description: "Accept the offer, pay the deposit and receive your confirmation of enrolment.",
      completion: "AUTO",
      tasks: [
        { slug: "deposit-paid", title: "Deposit paid", kind: "MILESTONE" },
        { slug: "enrolment-confirmed", title: "Enrolment confirmed", kind: "MILESTONE" },
      ],
    },
    {
      number: 5,
      slug: "visa",
      title: "Visa",
      description: "Your student visa application and its decision.",
      completion: "AUTO",
      tasks: [
        { slug: "visa-submitted", title: "Visa application submitted", kind: "MILESTONE" },
        { slug: "visa-granted", title: "Visa granted", kind: "MILESTONE" },
      ],
    },
    {
      number: 6,
      slug: "enroll",
      title: "Enroll",
      description: "Travel, arrive and complete your enrolment at the school.",
      completion: "AUTO",
      tasks: [{ slug: "enrolled", title: "Enrolled at the school", kind: "MILESTONE" }],
    },
  ],
};