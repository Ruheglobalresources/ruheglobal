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
    tuitionFrom: z
      .number()
      .nullable()
      .openapi({ description: "Yearly tuition in whole units of tuitionCurrency" }),
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

export const ApiSchoolDetailSchema = ApiSchoolCardSchema.extend({
  website: z.string().nullable(),
  paragraphs: z
    .array(z.string())
    .openapi({ description: "The written article in order, with empty paragraphs removed" }),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  courses: z.array(ApiSchoolCourseSchema),
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