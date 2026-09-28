import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
  name: z.string().min(1, { message: "Name is required" }),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
});

// ─────────────────────────────────────────────────────────────────────────
// PORTAL ADMIN
// ─────────────────────────────────────────────────────────────────────────

export const FieldTypeValues = [
  "TEXT",
  "TEXTAREA",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "SELECT",
  "MULTI_SELECT",
  "CHECKBOX",
  "IMAGE",
  "FILE",
] as const;

export const SubmissionStatusValues = [
  "DRAFT",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
] as const;

export const PortalTerminalSchema = z.object({
  name: z.string().min(1, "Terminal name is required"),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export const FieldCategoryValues = [
  "Personal Details",
  "Passport & Travel",
  "Academic Background",
  "English Proficiency",
  "Standardized Tests",
  "Study Preferences",
  "Essays & Documents",
  "Financial",
  "References",
  "Visa & Compliance",
  "Contact & Other",
  "General",
] as const;

export const FieldDefinitionSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers and underscores only"),
  label: z.string().min(1, "Label is required"),
  type: z.enum(FieldTypeValues),
  category: z.string().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  // Comma-separated on the form, e.g. "Mr, Mrs, Ms, Dr" — split into an array on save.
  options: z.string().optional(),
  minLength: z.coerce.number().int().optional(),
  maxLength: z.coerce.number().int().optional(),
  pattern: z.string().optional(),
});

export const ApplicationSchema = z.object({
  terminalId: z.string().min(1, "Terminal is required"),
  name: z.string().min(1, "Application name is required"),
  subtitle: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  isLive: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export const ApplicationTagSchema = z.object({
  label: z.string().min(1, "Tag label is required"),
  icon: z.string().optional(),
  order: z.coerce.number().int().default(0),
});

export const ApplicationFieldAssignSchema = z.object({
  fieldDefinitionId: z.string().min(1, "Choose a field"),
  isRequired: z.boolean().default(false),
  stepNumber: z.coerce.number().int().min(1).default(1),
  order: z.coerce.number().int().default(0),
});

export const SubmissionStatusSchema = z.object({
  status: z.enum(SubmissionStatusValues),
});

export const AssignCounselorSchema = z.object({
  counselorId: z.string().nullable(),
});

// =========================================================================
// PORTAL — APPLICANT-FACING WIZARD
// =========================================================================

export const SubmissionValueInputSchema = z.object({
  applicationFieldId: z.string().min(1),
  value: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
});

// One call per step: persists every answer on that step and records which
// step the applicant should land on if they come back later. submissionId
// is null on the very first save of a fresh application (the row gets
// created right here, not before), which is why setCurrentStep is a
// separate field from stepNumber — "save and stay" and "save and continue"
// both go through this action, they just pass a different target step.
export const SaveSubmissionStepSchema = z.object({
  applicationId: z.string().min(1),
  submissionId: z.string().nullable().optional(),
  stepNumber: z.coerce.number().int().min(1),
  setCurrentStep: z.coerce.number().int().min(1).optional(),
  values: z.array(SubmissionValueInputSchema),
});

// ─────────────────────────────────────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────────────────────────────────────

export const BlogPostStatusValues = ["DRAFT", "PUBLISHED"] as const;

export const BlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  excerpt: z.string().max(300, "Keep the excerpt under 300 characters").optional(),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().min(1, "Cover image is required"),
  coverImageAlt: z.string().optional(),
  // Comma-separated on the form, e.g. "study-abroad, uk, scholarships" —
  // split into an array on save, same pattern FieldDefinitionSchema.options uses.
  tags: z.string().optional(),
  status: z.enum(BlogPostStatusValues).default("DRAFT"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(300, "Keep the meta description under 300 characters").optional(),
});

// Append this block to the end of your existing src/schemas/index.ts
// (it needs `import * as z from "zod"`, which that file already has).

export const InstitutionSchema = z.object({
  name: z.string().min(1, "Institution name is required"),
  city: z.string().optional(),
  country: z.string().optional(),
  institutionType: z.string().optional(),
  summary: z.string().min(1, "Summary is required").max(320, "Keep the summary under 320 characters"),
  // Comma-separated on the form, e.g. "MSc Data Science, MSc AI" — split
  // into an array on save, same pattern BlogPostSchema.tags uses.
  programs: z.string().optional(),
  ieltsOverall: z.coerce.number().min(0).max(9).optional(),
  ieltsMinBand: z.coerce.number().min(0).max(9).optional(),
  ieltsAlternatives: z.string().optional(), // comma-separated, e.g. "TOEFL iBT 90, PTE 65"
  ieltsNote: z.string().max(160, "Keep this under 160 characters").optional(),
  tuitionMin: z.coerce.number().min(0).optional(),
  tuitionMax: z.coerce.number().min(0).optional(),
  tuitionCurrency: z.string().max(8, "Use an ISO code, e.g. GBP").optional(),
  tuitionPeriod: z.string().optional(),
  tuitionNote: z.string().max(160, "Keep this under 160 characters").optional(),
  ranking: z.string().max(60).optional(),
  website: z.string().optional(),
  imageUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

// ── Schools ────────────────────────────────────────────────────────────
// Child rows (courses, gallery images) are edited inline on the school form
// and replaced wholesale on save, so they travel inside the same payload.

export const SchoolCourseSchema = z.object({
  name: z.string().min(1, "Course name is required"),
  level: z.string().optional(),
  duration: z.string().optional(),
  tuition: z.string().optional(),
  intakes: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const SchoolImageSchema = z.object({
  url: z.string().min(1, "Image is required"),
  altText: z.string().optional(),
  caption: z.string().optional(),
});

export const SchoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  // Empty input ("") must mean "not set", not 0, because coerce would turn it into 0.
  founded: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(1000, "Enter a 4-digit year").max(2100).optional()
  ),
  ranking: z.string().max(80).optional(),
  acceptanceRate: z.string().max(40).optional(),
  tuitionFrom: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().min(0).optional()
  ),
  tuitionCurrency: z.string().min(3, "Use an ISO code, e.g. GBP").max(3, "Use an ISO code, e.g. GBP"),
  website: z.string().optional(),
  description: z
    .string()
    .min(1, "Short description is required")
    .max(320, "Keep the short description under 320 characters"),
  paragraph1: z.string().optional(),
  paragraph2: z.string().optional(),
  paragraph3: z.string().optional(),
  paragraph4: z.string().optional(),
  coverImage: z.string().min(1, "Cover image is required"),
  coverImageAlt: z.string().optional(),
  logoUrl: z.string().optional(),
  metaTitle: z.string().max(70, "Keep the meta title under 70 characters").optional(),
  metaDescription: z.string().max(170, "Keep the meta description under 170 characters").optional(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
  courses: z.array(SchoolCourseSchema).default([]),
  images: z.array(SchoolImageSchema).default([]),
});