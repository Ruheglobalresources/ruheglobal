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
import { db } from "@/lib/db";
import { COUNTRIES } from "@/constants/schools";
import {
  ApiCountrySchema,
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