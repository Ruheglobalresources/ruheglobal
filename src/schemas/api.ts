// src/schemas/api.ts
// Response schemas for the public /api/v1 API. They drive validation and the
// OpenAPI document that ChatGPT and the docs page read.
//
// Kept apart from src/schemas/index.ts on purpose: that file holds the form
// and admin schemas (plain zod), while these use z from @hono/zod-openapi so
// they can carry OpenAPI metadata. The Api prefix stops an editor auto import
// from mixing them up with SchoolCourseSchema and SchoolImageSchema in index.ts.
import { z } from "@hono/zod-openapi";

export const ApiErrorSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: "NOT_FOUND" }),
      message: z.string().openapi({ example: "School not found" }),
    }),
  })
  .openapi("Error");

export const ApiPageMetaSchema = z
  .object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  })
  .openapi("PageMeta");

// ─────────────────────────────────────────────────────────────────────────
// SCHOOLS
// ─────────────────────────────────────────────────────────────────────────

export const ApiSchoolCardSchema = z
  .object({
    id: z.string(),
    slug: z.string().openapi({ example: "coventry-university" }),
    name: z.string().openapi({ example: "Coventry University" }),
    city: z.string().openapi({ example: "Coventry" }),
    country: z.string().openapi({ example: "United Kingdom" }),
    countryFlag: z.string().nullable().openapi({ example: "🇬🇧" }),
    coverImage: z.string(),
    coverImageAlt: z.string().nullable(),
    logoUrl: z.string().nullable(),
    founded: z.number().int().nullable(),
    ranking: z.string().nullable(),
    famousFor: z
      .string()
      .nullable()
      .openapi({ example: "Business, Engineering, Physics", description: "Subjects the school is best known for" }),
    tuitionFrom: z
      .number()
      .nullable()
      .openapi({ description: "Yearly tuition in whole units of tuitionCurrency" }),
    tuitionTo: z
      .number()
      .nullable()
      .openapi({ description: "Top of the yearly tuition range. Null when only tuitionFrom is known" }),
    tuitionCurrency: z.string().openapi({ example: "GBP" }),
    acceptanceRate: z.string().nullable(),
    description: z.string(),
    courseCount: z.number().int(),
    url: z.string().openapi({ description: "Public web page for this school" }),
  })
  .openapi("SchoolCard");

export const ApiSchoolCourseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    degree: z.string().nullable().openapi({ example: "MSc" }),
    level: z.string().nullable(),
    duration: z.string().nullable(),
    tuition: z.string().nullable(),
    intakes: z.string().nullable(),
    description: z.string().nullable(),
    imageUrl: z.string().nullable(),
  })
  .openapi("SchoolCourse");

export const ApiSchoolImageSchema = z
  .object({
    id: z.string(),
    url: z.string(),
    altText: z.string().nullable(),
    caption: z.string().nullable(),
  })
  .openapi("SchoolImage");

export const ApiSchoolScholarshipSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    academicYear: z.string().nullable().openapi({ example: "2026/27" }),
    description: z.string().nullable(),
    url: z.string().nullable().openapi({ description: "Link to learn more" }),
  })
  .openapi("SchoolScholarship");

export const ApiSchoolSectionsSchema = z
  .object({
    overview: z.string().nullable().openapi({ description: "Who the school is and what it is known for. Paragraphs are separated by a blank line" }),
    services: z.string().nullable().openapi({ description: "Services for international students" }),
    highlights: z.array(z.string()).openapi({ description: "Rankings and highlights, one bullet per entry" }),
    accommodation: z.string().nullable(),
    location: z.string().nullable().openapi({ description: "The city and campus location" }),
  })
  .openapi("SchoolSections");

export const ApiSchoolDetailSchema = ApiSchoolCardSchema.extend({
  website: z.string().nullable(),
  sections: ApiSchoolSectionsSchema,
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  courses: z.array(ApiSchoolCourseSchema),
  scholarships: z.array(ApiSchoolScholarshipSchema),
  images: z.array(ApiSchoolImageSchema),
  updatedAt: z.string().openapi({ description: "ISO 8601" }),
}).openapi("SchoolDetail");

export const ApiCountrySchema = z
  .object({
    name: z.string().openapi({ example: "United Kingdom" }),
    flag: z.string().nullable(),
    schoolCount: z.number().int(),
  })
  .openapi("Country");

// Query strings (kept here too so a mobile or MCP layer can reuse them)
export const ApiListSchoolsQuerySchema = z.object({
  country: z
    .string()
    .trim()
    .min(1)
    .optional()
    .openapi({ description: "Exact country name, for example Canada", example: "Canada" }),
  q: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .optional()
    .openapi({ description: "Matches school name or city" }),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const ApiSchoolSlugParamSchema = z.object({
  slug: z.string().openapi({ example: "coventry-university" }),
});

// ─────────────────────────────────────────────────────────────────────────
// CATALOG: institutions and courses (Institution table)
// ─────────────────────────────────────────────────────────────────────────

export const ApiCourseInstitutionSchema = z
  .object({
    id: z.string(),
    slug: z.string().openapi({ example: "conestoga-college" }),
    name: z.string().openapi({ example: "Conestoga College" }),
    logoUrl: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable().openapi({ example: "Canada" }),
    countryFlag: z.string().nullable().openapi({ example: "🇨🇦" }),
    url: z.string().openapi({ description: "Public web page for this institution" }),
  })
  .openapi("CourseInstitution");

export const ApiCourseCardSchema = z
  .object({
    id: z.string(),
    kind: z.enum(["course", "programme"]).openapi({
      description:
        "course is a real course entered for the institution. programme is a subject area listed on an institution that has no course rows yet",
    }),
    name: z.string().openapi({ example: "Ontario College Graduate Certificate, Cybersecurity Response Planning" }),
    degree: z.string().nullable(),
    level: z.string().nullable().openapi({ example: "Postgraduate" }),
    subject: z.string().nullable().openapi({ example: "Cyber Security" }),
    duration: z.string().nullable().openapi({ example: "1 Year" }),
    nextIntake: z.string().nullable().openapi({ example: "Jan 2027" }),
    tuition: z.string().nullable().openapi({
      description: "Ready to show price label. Starts with From when it is the institution's starting fee",
      example: "CA$16,808 / yr",
    }),
    institution: ApiCourseInstitutionSchema,
  })
  .openapi("CourseCard");

export const ApiInstitutionCardSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    countryFlag: z.string().nullable(),
    institutionType: z.string().nullable().openapi({ example: "Public college" }),
    imageUrl: z.string().nullable().openapi({ description: "Campus photo" }),
    logoUrl: z.string().nullable(),
    ranking: z.string().nullable(),
    tuition: z.string().nullable().openapi({ example: "From CA$20,978 / yr" }),
    courseCount: z.number().int(),
    url: z.string(),
  })
  .openapi("InstitutionCard");

export const ApiInstitutionDetailSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    countryFlag: z.string().nullable(),
    institutionType: z.string().nullable(),
    summary: z.string(),
    website: z.string().nullable(),
    imageUrl: z.string().nullable(),
    logoUrl: z.string().nullable(),
    ranking: z.string().nullable(),
    founded: z.number().int().nullable(),
    acceptanceRate: z.string().nullable(),
    upcomingIntake: z.string().nullable(),
    tuition: z.object({
      min: z.number().nullable(),
      max: z.number().nullable(),
      currency: z.string().nullable(),
      period: z.string().nullable(),
      note: z.string().nullable(),
      label: z.string().nullable(),
    }),
    english: z.object({
      ieltsOverall: z.number().nullable(),
      ieltsMinBand: z.number().nullable(),
      alternatives: z.array(z.string()),
      note: z.string().nullable(),
    }),
    subjects: z.array(z.string()),
    highlights: z.object({
      overview: z.string().nullable(),
      studentLife: z.string().nullable(),
      accommodation: z.string().nullable(),
      library: z.string().nullable(),
      sports: z.string().nullable(),
    }),
    social: z.object({
      facebook: z.string().nullable(),
      instagram: z.string().nullable(),
      twitter: z.string().nullable(),
      linkedin: z.string().nullable(),
      youtube: z.string().nullable(),
    }),
    courses: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        level: z.string().nullable(),
        degree: z.string().nullable(),
        subject: z.string().nullable(),
        duration: z.string().nullable(),
        nextIntake: z.string().nullable(),
        intakes: z.string().nullable(),
        tuition: z.string().nullable(),
        description: z.string().nullable(),
      })
    ),
    campuses: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        city: z.string().nullable(),
        address: z.string().nullable(),
        description: z.string().nullable(),
      })
    ),
    documents: z.array(
      z.object({
        id: z.string(),
        studyLevel: z.string().openapi({ example: "Undergraduate" }),
        category: z.string().openapi({ example: "Visa" }),
        name: z.string().openapi({ example: "Passport" }),
      })
    ),
    faqs: z.array(z.object({ id: z.string(), question: z.string(), answer: z.string() })),
    metaTitle: z.string().nullable(),
    metaDescription: z.string().nullable(),
    url: z.string(),
    updatedAt: z.string().openapi({ description: "ISO 8601" }),
  })
  .openapi("InstitutionDetail");

export const ApiCatalogSummarySchema = z
  .object({
    courses: z.number().int().openapi({ description: "All courses, including subject areas of institutions with no course rows yet" }),
    institutions: z.number().int(),
  })
  .openapi("CatalogSummary");

export const ApiCatalogQuerySchema = z.object({
  country: z
    .string()
    .trim()
    .min(1)
    .optional()
    .openapi({ description: "Exact country name, for example Canada", example: "Canada" }),
  q: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .optional()
    .openapi({ description: "Matches the course or subject and the institution name (city too for institutions)" }),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// Same filters as the catalog list, plus an optional institution slug that limits the
// result to the courses of that one institution (used by the institution courses page).
export const ApiCourseQuerySchema = ApiCatalogQuerySchema.extend({
  institution: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .openapi({
      description:
        "Institution slug. Returns only the courses of that institution, in the order set in the admin. q then matches the course name, subject or degree",
      example: "conestoga-college",
    }),
});

export const ApiInstitutionSlugParamSchema = z.object({
  slug: z.string().openapi({ example: "conestoga-college" }),
});