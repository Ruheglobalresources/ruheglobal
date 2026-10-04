// src/app/api/v1/[[...route]]/route.ts
//
// The whole Ruhe Global Resources API lives in this one file, mounted at
// /api/v1/*. The Next.js site, the Expo app and the ChatGPT Action all call it.
// It never clashes with /api/auth or /api/schools/search.
//
// DATA FLOW (read only, nothing here writes to the database):
//   request -> Hono route below -> db.school.* (Prisma, @/lib/db) -> Postgres
//   -> row -> serializer -> JSON response
//
// ChatGPT reads /api/v1/openapi.json (OpenAPI 3.1). Admin stays on the web app
// and server actions and is intentionally not exposed here.
//
// To add an area (courses, blog, contact): add its schemas to src/schemas/api.ts,
// then its queries and routes in a new section below, and mount it with
// app.route("/<area>", <area>Route).
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { COUNTRIES } from "@/constants/schools";
import {
  ApiCatalogQuerySchema,
  ApiCatalogSummarySchema,
  ApiCountrySchema,
  ApiCourseCardSchema,
  ApiInstitutionCardSchema,
  ApiInstitutionDetailSchema,
  ApiInstitutionSlugParamSchema,
  ApiErrorSchema,
  ApiListSchoolsQuerySchema,
  ApiPageMetaSchema,
  ApiSchoolCardSchema,
  ApiSchoolDetailSchema,
  ApiSchoolSlugParamSchema,
} from "@/schemas/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────

const API_BASE = "/api/v1";

// Public origin of the site. Used for the OpenAPI "servers" entry (what a
// ChatGPT Action calls) and for building public page links in responses.
// SITE_URL is optional: set it only to point a preview deployment at itself.
const SITE_URL = (process.env.SITE_URL ?? "https://www.ruhegr.com").replace(/\/+$/, "");

// Public read only data: cache at the edge for a minute, serve stale for five
// while it refreshes.
const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=300";

// ─────────────────────────────────────────────────────────────────────────
// SCHOOLS: DATABASE QUERIES (this is where the API reads from your database)
// Only schools with isActive = true are ever returned.
// ─────────────────────────────────────────────────────────────────────────

const schoolCardSelect = {
  id: true,
  slug: true,
  name: true,
  city: true,
  country: true,
  coverImage: true,
  coverImageAlt: true,
  logoUrl: true,
  founded: true,
  ranking: true,
  famousFor: true,
  tuitionFrom: true,
  tuitionTo: true,
  tuitionCurrency: true,
  acceptanceRate: true,
  description: true,
  _count: { select: { courses: true } },
} as const;

async function querySchools(params: { country?: string; q?: string; page: number; limit: number }) {
  const { country, q, page, limit } = params;

  const where = {
    isActive: true,
    ...(country ? { country: { equals: country, mode: "insensitive" as const } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.school.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: schoolCardSelect,
    }),
    db.school.count({ where }),
  ]);

  return { rows, total };
}

async function querySchoolBySlug(slug: string) {
  return db.school.findFirst({
    where: { slug, isActive: true },
    include: {
      courses: { orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" } },
      scholarships: { orderBy: { order: "asc" } },
    },
  });
}

async function querySchoolCountryCounts() {
  const groups = await db.school.groupBy({
    by: ["country"],
    where: { isActive: true },
    _count: { _all: true },
  });
  return groups.map((g: { country: string; _count: { _all: number } }) => ({
    country: g.country,
    count: g._count._all,
  }));
}

// ─────────────────────────────────────────────────────────────────────────
// SCHOOLS: SERIALIZERS (database row to public API shape)
// ─────────────────────────────────────────────────────────────────────────

type Nullable<T> = T | null;

type SchoolCardRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  coverImage: string;
  coverImageAlt: Nullable<string>;
  logoUrl: Nullable<string>;
  founded: Nullable<number>;
  ranking: Nullable<string>;
  famousFor: Nullable<string>;
  tuitionFrom: Nullable<number>;
  tuitionTo: Nullable<number>;
  tuitionCurrency: string;
  acceptanceRate: Nullable<string>;
  description: string;
  _count: { courses: number };
};

type SchoolDetailRow = Omit<SchoolCardRow, "_count"> & {
  website: Nullable<string>;
  overview: Nullable<string>;
  services: Nullable<string>;
  accommodation: Nullable<string>;
  locationInfo: Nullable<string>;
  highlights: string[];
  metaTitle: Nullable<string>;
  metaDescription: Nullable<string>;
  updatedAt: Date;
  courses: Array<{
    id: string;
    name: string;
    degree: Nullable<string>;
    level: Nullable<string>;
    duration: Nullable<string>;
    tuition: Nullable<string>;
    intakes: Nullable<string>;
    description: Nullable<string>;
    imageUrl: Nullable<string>;
  }>;
  images: Array<{
    id: string;
    url: string;
    altText: Nullable<string>;
    caption: Nullable<string>;
  }>;
  scholarships: Array<{
    id: string;
    name: string;
    academicYear: Nullable<string>;
    description: Nullable<string>;
    url: Nullable<string>;
  }>;
};

const flagFor = (country: string) => COUNTRIES.find((c) => c.name === country)?.flag ?? null;

const cardFields = (s: Omit<SchoolCardRow, "_count">) => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  city: s.city,
  country: s.country,
  countryFlag: flagFor(s.country),
  coverImage: s.coverImage,
  coverImageAlt: s.coverImageAlt,
  logoUrl: s.logoUrl,
  founded: s.founded,
  ranking: s.ranking,
  famousFor: s.famousFor,
  tuitionFrom: s.tuitionFrom,
  tuitionTo: s.tuitionTo,
  tuitionCurrency: s.tuitionCurrency,
  acceptanceRate: s.acceptanceRate,
  description: s.description,
  url: `${SITE_URL}/schools/${s.slug}`,
});

function toSchoolCard(s: SchoolCardRow) {
  return { ...cardFields(s), courseCount: s._count.courses };
}

function toSchoolDetail(s: SchoolDetailRow) {
  return {
    ...cardFields(s),
    courseCount: s.courses.length,
    website: s.website,
    sections: {
      overview: s.overview,
      services: s.services,
      highlights: s.highlights,
      accommodation: s.accommodation,
      location: s.locationInfo,
    },
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    courses: s.courses.map((x) => ({
      id: x.id,
      name: x.name,
      degree: x.degree,
      level: x.level,
      duration: x.duration,
      tuition: x.tuition,
      intakes: x.intakes,
      description: x.description,
      imageUrl: x.imageUrl,
    })),
    scholarships: s.scholarships.map((x) => ({
      id: x.id,
      name: x.name,
      academicYear: x.academicYear,
      description: x.description,
      url: x.url,
    })),
    images: s.images.map((x) => ({
      id: x.id,
      url: x.url,
      altText: x.altText,
      caption: x.caption,
    })),
    updatedAt: s.updatedAt.toISOString(),
  };
}

// Countries in the order the website shows them (COUNTRIES), then any country
// an admin added that is not in the COUNTRIES constant.
function toCountryList(counts: Array<{ country: string; count: number }>) {
  const byName = new Map(counts.map((x) => [x.country, x.count]));

  const known = COUNTRIES.filter((k) => byName.has(k.name)).map((k) => ({
    name: k.name,
    flag: k.flag as string | null,
    schoolCount: byName.get(k.name) as number,
  }));

  const extra = counts
    .filter((x) => !COUNTRIES.some((k) => k.name === x.country))
    .map((x) => ({ name: x.country, flag: null as string | null, schoolCount: x.count }));

  return [...known, ...extra];
}

const pageMeta = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

// ─────────────────────────────────────────────────────────────────────────
// SCHOOLS: ROUTES
// Descriptions are written for people and for ChatGPT, which reads them to
// decide when to call each operation.
// ─────────────────────────────────────────────────────────────────────────

const schoolsRoute = new OpenAPIHono();

// GET /api/v1/schools
schoolsRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    operationId: "listSchools",
    tags: ["Schools"],
    summary: "List partner schools",
    description:
      "Browse the partner schools Ruhe Global Resources works with. Filter by country name, or search by school name or city. Results are paginated. Call listSchoolCountries first if you are unsure which countries are available.",
    request: {
      query: ApiListSchoolsQuerySchema,
    },
    responses: {
      200: {
        description: "A page of schools",
        content: {
          "application/json": {
            schema: z.object({ data: z.array(ApiSchoolCardSchema), meta: ApiPageMetaSchema }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { country, q, page, limit } = c.req.valid("query");
    const { rows, total } = await querySchools({ country, q, page, limit });

    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json(
      { data: rows.map((r: SchoolCardRow) => toSchoolCard(r)), meta: pageMeta(total, page, limit) },
      200
    );
  }
);

// GET /api/v1/schools/countries
// Registered before /{slug} so the slug route does not swallow it.
schoolsRoute.openapi(
  createRoute({
    method: "get",
    path: "/countries",
    operationId: "listSchoolCountries",
    tags: ["Schools"],
    summary: "Countries that have published schools",
    description:
      "Lists the study destinations that currently have schools, in display order, with how many schools each has. Use the returned names as the country filter for listSchools.",
    responses: {
      200: {
        description: "Countries",
        content: { "application/json": { schema: z.object({ data: z.array(ApiCountrySchema) }) } },
      },
    },
  }),
  async (c) => {
    const counts = await querySchoolCountryCounts();

    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json({ data: toCountryList(counts) }, 200);
  }
);

// GET /api/v1/schools/{slug}
schoolsRoute.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    operationId: "getSchool",
    tags: ["Schools"],
    summary: "Get one school",
    description:
      "Full details for one school by slug: overview, international student services, rankings and highlights, accommodation, location, courses with degree, tuition and intakes, scholarships, and gallery images. Get the slug from listSchools.",
    request: {
      params: ApiSchoolSlugParamSchema,
    },
    responses: {
      200: {
        description: "The school",
        content: { "application/json": { schema: z.object({ data: ApiSchoolDetailSchema }) } },
      },
      404: {
        description: "No published school with that slug",
        content: { "application/json": { schema: ApiErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("param");
    const school = await querySchoolBySlug(slug);

    if (!school) {
      return c.json({ error: { code: "NOT_FOUND", message: "School not found" } }, 404);
    }

    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json({ data: toSchoolDetail(school as SchoolDetailRow) }, 200);
  }
);

// ─────────────────────────────────────────────────────────────────────────
// CATALOG: INSTITUTIONS AND COURSES (Institution table only)
//
//   /institutions         every active institution, featured partners first
//   /institutions/{slug}  one institution with its full profile (the page)
//   /courses              every InstitutionCourse row, plus the subject areas
//                         listed in Institution.programs for institutions that
//                         have no course rows yet, so the list is never empty
//                         while courses are still being entered
//   /catalog/summary      the two totals for the dashboard
//
// School and SchoolCourse are not read here.
//
// /courses is raw SQL because it unions two sources (InstitutionCourse rows and
// the unnested programs array) and Prisma cannot union. Everything a visitor
// types goes in as a bound parameter.
// ─────────────────────────────────────────────────────────────────────────

type CatalogFilters = { country?: string; q?: string };

// Escape LIKE wildcards so "100%" or "a_b" search for what was typed.
const likeEscape = (s: string) => s.replace(/[\\%_]/g, "\\$&");

const sqlAnd = (parts: Prisma.Sql[]) => (parts.length ? Prisma.join(parts, " AND ") : Prisma.sql`TRUE`);

// All courses as one row each. "kind" says whether it is a real course row or a
// subject area taken from Institution.programs.
//   rank  featured partners (0) before the rest (1)
//   turn  position inside its own institution, so ordering by turn hands out one
//         course per institution per round and a page shows many institutions
//         instead of 12 courses from one
function coursesUnion({ country, q }: CatalogFilters) {
  const pattern = q ? `%${likeEscape(q)}%` : null;

  const courseWhere = sqlAnd([
    Prisma.sql`i."isActive" = true`,
    ...(country ? [Prisma.sql`lower(i.country) = lower(${country})`] : []),
    ...(pattern ? [Prisma.sql`(c.name ILIKE ${pattern} OR c.subject ILIKE ${pattern} OR i.name ILIKE ${pattern})`] : []),
  ]);

  const programmeWhere = sqlAnd([
    Prisma.sql`i."isActive" = true`,
    Prisma.sql`btrim(p.name) <> ''`,
    Prisma.sql`NOT EXISTS (SELECT 1 FROM "InstitutionCourse" ic WHERE ic."institutionId" = i.id)`,
    ...(country ? [Prisma.sql`lower(i.country) = lower(${country})`] : []),
    ...(pattern ? [Prisma.sql`(p.name ILIKE ${pattern} OR i.name ILIKE ${pattern})`] : []),
  ]);

  return Prisma.sql`
    SELECT
      u.*,
      ROW_NUMBER() OVER (PARTITION BY u."ownerId" ORDER BY u."itemOrder", u.name) AS turn
    FROM (
      SELECT
        c.id AS id,
        'course'::text AS kind,
        c.name AS name,
        c.degree AS degree,
        c.level AS level,
        c.subject AS subject,
        c.duration AS duration,
        c."nextIntake" AS "nextIntake",
        i.id AS "ownerId",
        i.slug AS "ownerSlug",
        i.name AS "ownerName",
        i."logoUrl" AS "ownerLogoUrl",
        i.city AS "ownerCity",
        i.country AS "ownerCountry",
        COALESCE(c."tuitionAmount", i."tuitionMin") AS amount,
        COALESCE(c."tuitionCurrency", i."tuitionCurrency") AS currency,
        CASE WHEN c."tuitionAmount" IS NOT NULL THEN c."tuitionPeriod" ELSE i."tuitionPeriod" END AS period,
        (c."tuitionAmount" IS NULL) AS "feeIsFrom",
        CASE WHEN i."isFeatured" THEN 0 ELSE 1 END AS rank,
        i."order" AS "ownerOrder",
        c."order" AS "itemOrder"
      FROM "InstitutionCourse" c
      JOIN "Institution" i ON i.id = c."institutionId"
      WHERE ${courseWhere}

      UNION ALL

      SELECT
        (i.id || ':' || p.ord::text) AS id,
        'programme'::text AS kind,
        p.name AS name,
        NULL::text AS degree,
        NULL::text AS level,
        NULL::text AS subject,
        NULL::text AS duration,
        NULL::text AS "nextIntake",
        i.id AS "ownerId",
        i.slug AS "ownerSlug",
        i.name AS "ownerName",
        i."logoUrl" AS "ownerLogoUrl",
        i.city AS "ownerCity",
        i.country AS "ownerCountry",
        i."tuitionMin" AS amount,
        i."tuitionCurrency" AS currency,
        i."tuitionPeriod" AS period,
        true AS "feeIsFrom",
        CASE WHEN i."isFeatured" THEN 0 ELSE 1 END AS rank,
        i."order" AS "ownerOrder",
        p.ord::int AS "itemOrder"
      FROM "Institution" i
      CROSS JOIN LATERAL unnest(i.programs) WITH ORDINALITY AS p(name, ord)
      WHERE ${programmeWhere}
    ) u
  `;
}

type CatalogCourseRow = {
  id: string;
  kind: string;
  name: string;
  degree: Nullable<string>;
  level: Nullable<string>;
  subject: Nullable<string>;
  duration: Nullable<string>;
  nextIntake: Nullable<string>;
  ownerId: string;
  ownerSlug: string;
  ownerName: string;
  ownerLogoUrl: Nullable<string>;
  ownerCity: Nullable<string>;
  ownerCountry: Nullable<string>;
  amount: Nullable<number>;
  currency: Nullable<string>;
  period: Nullable<string>;
  feeIsFrom: boolean;
};

async function queryCatalogCourses(f: CatalogFilters & { page: number; limit: number }) {
  const union = coursesUnion(f);
  const offset = (f.page - 1) * f.limit;

  const [rows, counted] = await Promise.all([
    db.$queryRaw<CatalogCourseRow[]>(Prisma.sql`
      SELECT * FROM (${union}) t
      ORDER BY t.rank, t.turn, t."ownerOrder", t."ownerName", t.id
      LIMIT ${f.limit} OFFSET ${offset}
    `),
    db.$queryRaw<{ total: bigint }[]>(Prisma.sql`SELECT count(*) AS total FROM (${union}) t`),
  ]);

  return { rows, total: Number(counted[0]?.total ?? 0) };
}

const institutionCardSelect = {
  id: true,
  slug: true,
  name: true,
  city: true,
  country: true,
  imageUrl: true,
  logoUrl: true,
  ranking: true,
  institutionType: true,
  tuitionMin: true,
  tuitionCurrency: true,
  tuitionPeriod: true,
  programs: true,
  _count: { select: { courses: true } },
} as const;

async function queryCatalogInstitutions(params: { country?: string; q?: string; page: number; limit: number }) {
  const { country, q, page, limit } = params;

  const where = {
    isActive: true,
    ...(country ? { country: { equals: country, mode: "insensitive" as const } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.institution.findMany({
      where,
      // Featured partners first, then the order set in the admin, then A to Z.
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: institutionCardSelect,
    }),
    db.institution.count({ where }),
  ]);

  return { rows, total };
}

async function queryInstitutionBySlug(slug: string) {
  return db.institution.findFirst({
    where: { slug, isActive: true },
    include: {
      courses: { orderBy: [{ order: "asc" }, { name: "asc" }] },
      campuses: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      documents: { orderBy: [{ studyLevel: "asc" }, { order: "asc" }] },
    },
  });
}

async function queryCatalogSummary() {
  const [courses, institutions] = await Promise.all([
    db.$queryRaw<{ total: bigint }[]>(Prisma.sql`SELECT count(*) AS total FROM (${coursesUnion({})}) t`),
    db.institution.count({ where: { isActive: true } }),
  ]);
  return { courses: Number(courses[0]?.total ?? 0), institutions };
}

// ─────────────────────────────────────────────────────────────────────────
// CATALOG: SERIALIZERS
// ─────────────────────────────────────────────────────────────────────────

// Ready-to-show price, e.g. "CA$16,808 / yr" or "From CA$17,848 / yr". The
// "/ yr" suffix is dropped when the period text does not mention a year.
function moneyLabel(
  amount: Nullable<number>,
  currency: Nullable<string>,
  period: Nullable<string>,
  isFrom: boolean
) {
  if (amount == null || amount <= 0) return null;

  const code = (currency ?? "").trim().toUpperCase();
  let money: string;
  try {
    money = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    money = `${code} ${amount.toLocaleString("en-US")}`.trim();
  }

  const perYear = period ? /year|annum|yr/i.test(period) : true;
  return `${isFrom ? "From " : ""}${money}${perYear ? " / yr" : ""}`;
}

const institutionUrl = (slug: string) => `${SITE_URL}/institutions/${slug}`;

function toCatalogCourse(r: CatalogCourseRow) {
  return {
    id: r.id,
    kind: r.kind as "course" | "programme",
    name: r.name,
    degree: r.degree,
    level: r.level,
    subject: r.subject,
    duration: r.duration,
    nextIntake: r.nextIntake,
    tuition: moneyLabel(r.amount, r.currency, r.period, r.feeIsFrom),
    institution: {
      id: r.ownerId,
      slug: r.ownerSlug,
      name: r.ownerName,
      logoUrl: r.ownerLogoUrl,
      city: r.ownerCity,
      country: r.ownerCountry,
      countryFlag: r.ownerCountry ? flagFor(r.ownerCountry) : null,
      url: institutionUrl(r.ownerSlug),
    },
  };
}

type InstitutionCardRow = {
  id: string;
  slug: string;
  name: string;
  city: Nullable<string>;
  country: Nullable<string>;
  imageUrl: Nullable<string>;
  logoUrl: Nullable<string>;
  ranking: Nullable<string>;
  institutionType: Nullable<string>;
  tuitionMin: Nullable<number>;
  tuitionCurrency: Nullable<string>;
  tuitionPeriod: Nullable<string>;
  programs: string[];
  _count: { courses: number };
};

function toCatalogInstitution(r: InstitutionCardRow) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    city: r.city,
    country: r.country,
    countryFlag: r.country ? flagFor(r.country) : null,
    institutionType: r.institutionType,
    imageUrl: r.imageUrl,
    logoUrl: r.logoUrl,
    ranking: r.ranking,
    tuition: moneyLabel(r.tuitionMin, r.tuitionCurrency, r.tuitionPeriod, true),
    // Real course rows when there are any, otherwise the subject areas listed.
    courseCount: r._count.courses > 0 ? r._count.courses : r.programs.length,
    url: institutionUrl(r.slug),
  };
}

type InstitutionDetailRow = Omit<InstitutionCardRow, "_count"> & {
  summary: string;
  website: Nullable<string>;
  ieltsOverall: Nullable<number>;
  ieltsMinBand: Nullable<number>;
  ieltsAlternatives: string[];
  ieltsNote: Nullable<string>;
  tuitionMax: Nullable<number>;
  tuitionNote: Nullable<string>;
  founded: Nullable<number>;
  acceptanceRate: Nullable<string>;
  upcomingIntake: Nullable<string>;
  overview: Nullable<string>;
  studentLife: Nullable<string>;
  accommodation: Nullable<string>;
  library: Nullable<string>;
  sports: Nullable<string>;
  facebookUrl: Nullable<string>;
  instagramUrl: Nullable<string>;
  twitterUrl: Nullable<string>;
  linkedinUrl: Nullable<string>;
  youtubeUrl: Nullable<string>;
  metaTitle: Nullable<string>;
  metaDescription: Nullable<string>;
  updatedAt: Date;
  courses: Array<{
    id: string;
    name: string;
    level: Nullable<string>;
    degree: Nullable<string>;
    subject: Nullable<string>;
    duration: Nullable<string>;
    nextIntake: Nullable<string>;
    intakes: Nullable<string>;
    tuitionAmount: Nullable<number>;
    tuitionCurrency: Nullable<string>;
    tuitionPeriod: Nullable<string>;
    description: Nullable<string>;
  }>;
  campuses: Array<{
    id: string;
    name: string;
    city: Nullable<string>;
    address: Nullable<string>;
    description: Nullable<string>;
  }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
  documents: Array<{ id: string; studyLevel: string; category: string; name: string }>;
};

function toInstitutionDetail(r: InstitutionDetailRow) {
  // Subject chips: the distinct subjects of the course rows, else the subject
  // areas listed on the institution.
  const courseSubjects = [...new Set(r.courses.map((c) => c.subject).filter((s): s is string => Boolean(s)))];
  const subjects = courseSubjects.length > 0 ? courseSubjects : r.programs;

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    city: r.city,
    country: r.country,
    countryFlag: r.country ? flagFor(r.country) : null,
    institutionType: r.institutionType,
    summary: r.summary,
    website: r.website,
    imageUrl: r.imageUrl,
    logoUrl: r.logoUrl,
    ranking: r.ranking,
    founded: r.founded,
    acceptanceRate: r.acceptanceRate,
    upcomingIntake: r.upcomingIntake,
    tuition: {
      min: r.tuitionMin,
      max: r.tuitionMax,
      currency: r.tuitionCurrency,
      period: r.tuitionPeriod,
      note: r.tuitionNote,
      label: moneyLabel(r.tuitionMin, r.tuitionCurrency, r.tuitionPeriod, true),
    },
    english: {
      ieltsOverall: r.ieltsOverall,
      ieltsMinBand: r.ieltsMinBand,
      alternatives: r.ieltsAlternatives,
      note: r.ieltsNote,
    },
    subjects,
    highlights: {
      overview: r.overview,
      studentLife: r.studentLife,
      accommodation: r.accommodation,
      library: r.library,
      sports: r.sports,
    },
    social: {
      facebook: r.facebookUrl,
      instagram: r.instagramUrl,
      twitter: r.twitterUrl,
      linkedin: r.linkedinUrl,
      youtube: r.youtubeUrl,
    },
    courses: r.courses.map((c) => ({
      id: c.id,
      name: c.name,
      level: c.level,
      degree: c.degree,
      subject: c.subject,
      duration: c.duration,
      nextIntake: c.nextIntake,
      intakes: c.intakes,
      tuition: moneyLabel(c.tuitionAmount, c.tuitionCurrency ?? r.tuitionCurrency, c.tuitionPeriod, false),
      description: c.description,
    })),
    campuses: r.campuses.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      address: c.address,
      description: c.description,
    })),
    documents: r.documents.map((d) => ({
      id: d.id,
      studyLevel: d.studyLevel,
      category: d.category,
      name: d.name,
    })),
    faqs: r.faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
    url: institutionUrl(r.slug),
    updatedAt: r.updatedAt.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// CATALOG: ROUTES
// ─────────────────────────────────────────────────────────────────────────

const institutionsRoute = new OpenAPIHono();

// GET /api/v1/institutions
institutionsRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    operationId: "listInstitutions",
    tags: ["Institutions"],
    summary: "List institutions",
    description:
      "Every school, college and university Ruhe Global Resources works with. Featured partners come first. Filter by country name, or search by name or city. Results are paginated and meta.total is the number of matches.",
    request: { query: ApiCatalogQuerySchema },
    responses: {
      200: {
        description: "A page of institutions",
        content: {
          "application/json": {
            schema: z.object({ data: z.array(ApiInstitutionCardSchema), meta: ApiPageMetaSchema }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { country, q, page, limit } = c.req.valid("query");
    const { rows, total } = await queryCatalogInstitutions({ country, q, page, limit });

    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json(
      { data: rows.map((r: InstitutionCardRow) => toCatalogInstitution(r)), meta: pageMeta(total, page, limit) },
      200
    );
  }
);

// GET /api/v1/institutions/{slug}
institutionsRoute.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    operationId: "getInstitution",
    tags: ["Institutions"],
    summary: "Get one institution",
    description:
      "Full profile for one institution by slug: facts, tuition and English requirements, highlights (overview, student life, accommodation, library, sports), courses with fee, duration and intake, campuses, required documents by study level, FAQs and social links. Get the slug from listInstitutions.",
    request: { params: ApiInstitutionSlugParamSchema },
    responses: {
      200: {
        description: "The institution",
        content: { "application/json": { schema: z.object({ data: ApiInstitutionDetailSchema }) } },
      },
      404: {
        description: "No published institution with that slug",
        content: { "application/json": { schema: ApiErrorSchema } },
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("param");
    const institution = await queryInstitutionBySlug(slug);

    if (!institution) {
      return c.json({ error: { code: "NOT_FOUND", message: "Institution not found" } }, 404);
    }

    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json({ data: toInstitutionDetail(institution as InstitutionDetailRow) }, 200);
  }
);

const coursesRoute = new OpenAPIHono();

// GET /api/v1/courses
coursesRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    operationId: "listCourses",
    tags: ["Courses"],
    summary: "List courses",
    description:
      "Courses across all institutions, one per institution in turn so a page shows many institutions. Institutions that have no course rows yet contribute their listed subject areas (kind programme). Filter by country name, or search by course, subject or institution name. Results are paginated and meta.total is the number of matches.",
    request: { query: ApiCatalogQuerySchema },
    responses: {
      200: {
        description: "A page of courses",
        content: {
          "application/json": {
            schema: z.object({ data: z.array(ApiCourseCardSchema), meta: ApiPageMetaSchema }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { country, q, page, limit } = c.req.valid("query");
    const { rows, total } = await queryCatalogCourses({ country, q, page, limit });

    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json({ data: rows.map((r) => toCatalogCourse(r)), meta: pageMeta(total, page, limit) }, 200);
  }
);

const catalogRoute = new OpenAPIHono();

// GET /api/v1/catalog/summary
catalogRoute.openapi(
  createRoute({
    method: "get",
    path: "/summary",
    operationId: "getCatalogSummary",
    tags: ["Courses"],
    summary: "Totals for courses and institutions",
    description: "How many courses and institutions are available in total. Useful for headline numbers.",
    responses: {
      200: {
        description: "Totals",
        content: { "application/json": { schema: z.object({ data: ApiCatalogSummarySchema }) } },
      },
    },
  }),
  async (c) => {
    c.header("Cache-Control", PUBLIC_CACHE);
    return c.json({ data: await queryCatalogSummary() }, 200);
  }
);

// ─────────────────────────────────────────────────────────────────────────
// APP: CORS, error shape, health, OpenAPI, docs
// ─────────────────────────────────────────────────────────────────────────

const app = new OpenAPIHono({
  // One error shape everywhere: { error: { code, message } }
  defaultHook: (result, c) => {
    if (!result.success) {
      const first = result.error.issues[0];
      const where = first?.path?.length ? `${first.path.join(".")}: ` : "";
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: `${where}${first?.message ?? "Invalid request"}`,
          },
        },
        400
      );
    }
  },
}).basePath(API_BASE);

// Public read API: any origin may GET. Expo and ChatGPT calls are not browser
// calls, so CORS only matters for websites. When authenticated routes arrive,
// restrict origins and credentials on those routers only.
app.use("*", cors({ origin: "*", allowMethods: ["GET", "HEAD", "OPTIONS"] }));

app.get("/health", (c) => c.json({ ok: true, service: "ruhe-api", version: "v1" }));

app.route("/schools", schoolsRoute);
app.route("/institutions", institutionsRoute);
app.route("/courses", coursesRoute);
app.route("/catalog", catalogRoute);

// OpenAPI 3.1 document. Point a ChatGPT Action at this URL.
app.doc31("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Ruhe Global Resources API",
    version: "1.0.0",
    description:
      "Study abroad schools, courses and destinations from Ruhe Global Resources, a study abroad consultancy.",
  },
  // Paths in this document already include /api/v1, so the server is the bare origin.
  servers: [{ url: SITE_URL }],
});

// Human readable docs (Scalar, loaded from a CDN, nothing to install).
app.get("/docs", (c) =>
  c.html(`<!doctype html>
<html><head><meta charset="utf-8"/><title>Ruhe API docs</title>
<meta name="viewport" content="width=device-width, initial-scale=1"/></head>
<body>
<script id="api-reference" data-url="${API_BASE}/openapi.json"></script>
<script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body></html>`)
);

app.notFound((c) => c.json({ error: { code: "NOT_FOUND", message: "Route not found" } }, 404));

app.onError((err, c) => {
  console.error("[api]", err);
  return c.json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, 500);
});

// ─────────────────────────────────────────────────────────────────────────
// NEXT.JS HANDLERS
// Every method is exported so adding a POST or PATCH route later needs no
// change here. Until a route exists, Hono answers with the JSON 404 above.
// ─────────────────────────────────────────────────────────────────────────

export const GET = handle(app);
export const HEAD = handle(app);
export const OPTIONS = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);