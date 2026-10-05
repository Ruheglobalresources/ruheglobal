// prisma/seedInstitutions.ts
//
// One engine that seeds a whole batch of institutions (5 to 10 per run) with
// their full profile: facts, highlights tabs, courses, campuses, required
// documents and FAQs. It only touches the Institution tables. The School
// tables are never read or written here.
//
// The data lives in prisma/institutionBatches/batch01.ts. Paste the next batch
// over that file and run:
//
//   npm run seed:institutions
//
// That is all. It reads batch01.ts, checks every entry, and writes them.
//
// Optional extras, you never need them:
//   npm run seed:institutions -- --dry         check only, writes nothing
//   npm run seed:institutions -- --no-images   skip the Wikipedia image lookup
//   npm run seed:institutions -- 02            read batch02.ts instead of batch01.ts
//
// How it treats existing rows:
//   An institution is found by slug. If it exists it is updated, if not it is
//   created. A field left out (undefined) is never touched, a field set to
//   null is cleared. Courses, campuses, documents and FAQs are replaced as a
//   set each run, and left alone when the list is undefined.
//   Running the same batch twice is safe, nothing is duplicated.
//
// Every batch is validated BEFORE anything is written. One bad entry stops the
// run with a clear list of what to fix. During the write, one failing
// institution does not stop the others, and the summary at the end lists it.
//
// package.json scripts:
//   "seed:institutions": "tsx prisma/seedInstitutions.ts",
//   "clear:institutions": "tsx prisma/clearInstitutions.ts"

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { InstitutionInput, Nullable } from "./institutionBatches/types";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry");
const SKIP_IMAGES = args.includes("--no-images");
const BATCH_ID = args.find((a) => !a.startsWith("--")) ?? "01";

// Keys that belong to the engine or to child tables, never to the Institution row itself.
const NON_COLUMN_KEYS = new Set([
  "slug",
  "wikipediaTitle",
  "skipImageLookup",
  "courses",
  "campuses",
  "documents",
  "faqs",
]);

const BAD_COUNTRY_NAMES: Record<string, string> = {
  UK: "United Kingdom",
  USA: "United States",
  US: "United States",
  "New Zeland": "New Zealand",
};

// ── Helpers ──────────────────────────────────────────────────────────────

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function slugOf(inst: InstitutionInput) {
  return inst.slug ?? slugify(inst.name);
}

function hostnameOf(website?: Nullable<string>) {
  if (!website) return null;
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function faviconFor(website?: Nullable<string>) {
  const host = hostnameOf(website);
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=128` : null;
}

// ── Validation (runs for the whole batch before any write) ───────────────

function validate(inst: InstitutionInput): string[] {
  const problems: string[] = [];
  const label = inst.name || "(no name)";
  const add = (message: string) => problems.push(`${label}: ${message}`);

  // A text field must be ONE paragraph: no line breaks, and short.
  const onePara = (field: string, value: Nullable<string> | undefined, limit: number) => {
    if (!value) return;
    if (/[\r\n]/.test(value)) add(`${field} must be one paragraph with no line breaks`);
    if (value.length > limit) add(`${field} is ${value.length} characters, limit is ${limit}`);
  };

  if (!inst.name?.trim()) add("name is required");
  if (!inst.summary?.trim()) add("summary is required");

  const slug = slugOf(inst);
  if (!/^[a-z0-9-]+$/.test(slug)) add("slug must use lowercase letters, numbers and hyphens only");

  if (inst.country && BAD_COUNTRY_NAMES[inst.country]) {
    add(`country "${inst.country}" must be written as "${BAD_COUNTRY_NAMES[inst.country]}"`);
  }
  if (inst.tuitionCurrency && inst.tuitionCurrency.length !== 3) add("tuitionCurrency must be a 3 letter ISO code");

  onePara("summary", inst.summary, 320);
  onePara("ranking", inst.ranking, 60);
  onePara("ieltsNote", inst.ieltsNote, 160);
  onePara("tuitionNote", inst.tuitionNote, 160);
  onePara("metaTitle", inst.metaTitle, 70);
  onePara("metaDescription", inst.metaDescription, 170);
  onePara("overview", inst.overview, 450);
  onePara("studentLife", inst.studentLife, 450);
  onePara("accommodation", inst.accommodation, 450);
  onePara("library", inst.library, 450);
  onePara("sports", inst.sports, 450);

  for (const [field, url] of Object.entries({
    website: inst.website,
    facebookUrl: inst.facebookUrl,
    instagramUrl: inst.instagramUrl,
    twitterUrl: inst.twitterUrl,
    linkedinUrl: inst.linkedinUrl,
    youtubeUrl: inst.youtubeUrl,
  })) {
    if (url && !/^https?:\/\//i.test(url)) add(`${field} must start with http:// or https://`);
  }

  for (const [i, c] of (inst.courses ?? []).entries()) {
    if (!c.name.trim()) add(`course ${i + 1} has no name`);
    onePara(`course "${c.name}" description`, c.description, 300);
    if (c.tuitionAmount !== undefined && (!Number.isInteger(c.tuitionAmount) || c.tuitionAmount < 0)) {
      add(`course "${c.name}": tuitionAmount must be a whole number`);
    }
    if (c.tuitionCurrency && c.tuitionCurrency.length !== 3) add(`course "${c.name}": tuitionCurrency must be 3 letters`);
  }

  for (const [i, c] of (inst.campuses ?? []).entries()) {
    if (!c.name.trim()) add(`campus ${i + 1} has no name`);
    onePara(`campus "${c.name}" description`, c.description, 300);
  }

  for (const [i, f] of (inst.faqs ?? []).entries()) {
    if (!f.question.trim() || !f.answer.trim()) add(`FAQ ${i + 1} needs a question and an answer`);
    onePara(`FAQ ${i + 1} answer`, f.answer, 400);
  }

  for (const level of Object.keys(inst.documents ?? {})) {
    if (level !== "Undergraduate" && level !== "Postgraduate") {
      add(`document level "${level}" must be Undergraduate or Postgraduate`);
    }
  }

  return problems;
}

// ── Image lookup (two tier, same idea as the older batch seeds) ──────────

const WIKI_ENDPOINT = "https://en.wikipedia.org/w/api.php";
const UA = "RuheGlobalInstitutionSeed/2.0 (https://www.ruhegr.com; institution catalog seed)";

async function fetchWikipediaImage(query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "1000",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "1",
    gsrnamespace: "0",
    redirects: "1",
    origin: "*",
  });

  try {
    const res = await fetch(`${WIKI_ENDPOINT}?${params.toString()}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const source = data?.query?.pages?.[0]?.thumbnail?.source;
    return typeof source === "string" ? source : null;
  } catch {
    return null;
  }
}

async function resolveImage(inst: InstitutionInput): Promise<string | null> {
  const location = [inst.city, inst.country].filter(Boolean).join(" ");
  const primary = inst.wikipediaTitle?.trim();
  const primaryQuery = primary && primary.length > 2 ? primary : `${inst.name} ${location}`.trim();

  let imageUrl = await fetchWikipediaImage(primaryQuery);
  if (!imageUrl) {
    const fallbackQuery = `${inst.name} ${location}`.trim();
    if (fallbackQuery !== primaryQuery) imageUrl = await fetchWikipediaImage(fallbackQuery);
  }
  return imageUrl;
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  let list: InstitutionInput[];
  try {
    const mod = await import(`./institutionBatches/batch${BATCH_ID}`);
    list = mod.INSTITUTIONS;
  } catch (err) {
    throw new Error(
      `Could not load prisma/institutionBatches/batch${BATCH_ID}.ts. Check the file exists and exports INSTITUTIONS.\n${
        err instanceof Error ? err.message : err
      }`
    );
  }

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(`batch${BATCH_ID}.ts must export a non empty INSTITUTIONS array.`);
  }

  // Validate everything first, so a typo in entry 9 never leaves entries 1 to 8 half written.
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const inst of list) {
    const slug = slugOf(inst);
    if (seen.has(slug)) problems.push(`${inst.name}: slug "${slug}" appears twice in this batch, merge them into one entry`);
    seen.add(slug);
    problems.push(...validate(inst));
  }
  if (problems.length > 0) {
    throw new Error(`Fix these before seeding:\n - ${problems.join("\n - ")}`);
  }

  console.log(`${DRY_RUN ? "[dry run] " : ""}Batch ${BATCH_ID}: ${list.length} institutions`);

  if (DRY_RUN) {
    for (const inst of list) {
      const columns = Object.keys(inst).filter((k) => !NON_COLUMN_KEYS.has(k));
      console.log(
        `  ${inst.name} (${slugOf(inst)}) | fields: ${columns.length} | courses: ${inst.courses ? inst.courses.length : "unchanged"} | campuses: ${
          inst.campuses ? inst.campuses.length : "unchanged"
        } | faqs: ${inst.faqs ? inst.faqs.length : "unchanged"}`
      );
    }
    console.log("Dry run only. Nothing was written.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
  }
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  let created = 0;
  let updated = 0;
  const failed: string[] = [];

  try {
    for (const inst of list) {
      const slug = slugOf(inst);

      try {
        const existing = await db.institution.findUnique({
          where: { slug },
          select: { id: true, imageUrl: true },
        });

        // Only the fields this entry actually set. undefined means leave it alone.
        const fields = Object.fromEntries(
          Object.entries(inst).filter(([key, value]) => !NON_COLUMN_KEYS.has(key) && value !== undefined)
        );

        // Look up a campus photo only when none is stored and none was given.
        let imageNote = "";
        if (inst.imageUrl === undefined && !existing?.imageUrl && !SKIP_IMAGES && !inst.skipImageLookup) {
          const imageUrl = await resolveImage(inst);
          if (imageUrl) fields.imageUrl = imageUrl;
          else imageNote = " (no Wikipedia image found)";
        }

        let institutionId: string;
        if (existing) {
          await db.institution.update({ where: { slug }, data: fields });
          institutionId = existing.id;
          updated++;
        } else {
          const row = await db.institution.create({
            data: {
              ...fields,
              name: inst.name,
              summary: inst.summary,
              slug,
              logoUrl: inst.logoUrl ?? faviconFor(inst.website),
            },
            select: { id: true },
          });
          institutionId = row.id;
          created++;
        }

        const documentRows = inst.documents
          ? Object.entries(inst.documents).flatMap(([studyLevel, rows]) =>
              rows.map(([category, name], order) => ({ studyLevel, category, name, order }))
            )
          : undefined;

        await db.$transaction([
          ...(inst.courses
            ? [
                db.institutionCourse.deleteMany({ where: { institutionId } }),
                db.institutionCourse.createMany({
                  data: inst.courses.map((c, order) => ({
                    institutionId,
                    order,
                    name: c.name,
                    level: c.level ?? null,
                    degree: c.degree ?? null,
                    subject: c.subject ?? null,
                    duration: c.duration ?? null,
                    nextIntake: c.nextIntake ?? null,
                    intakes: c.intakes ?? null,
                    tuitionAmount: c.tuitionAmount ?? null,
                    tuitionCurrency: c.tuitionCurrency ?? null,
                    tuitionPeriod: c.tuitionPeriod ?? null,
                    description: c.description ?? null,
                  })),
                }),
              ]
            : []),
          ...(inst.campuses
            ? [
                db.institutionCampus.deleteMany({ where: { institutionId } }),
                db.institutionCampus.createMany({
                  data: inst.campuses.map((c, order) => ({
                    institutionId,
                    order,
                    name: c.name,
                    city: c.city ?? null,
                    address: c.address ?? null,
                    description: c.description ?? null,
                  })),
                }),
              ]
            : []),
          ...(documentRows
            ? [
                db.institutionDocument.deleteMany({ where: { institutionId } }),
                db.institutionDocument.createMany({ data: documentRows.map((d) => ({ institutionId, ...d })) }),
              ]
            : []),
          ...(inst.faqs
            ? [
                db.institutionFaq.deleteMany({ where: { institutionId } }),
                db.institutionFaq.createMany({
                  data: inst.faqs.map((f, order) => ({ institutionId, order, question: f.question, answer: f.answer })),
                }),
              ]
            : []),
        ]);

        console.log(`  ✓ ${inst.name}${imageNote}`);
      } catch (err) {
        failed.push(inst.name);
        console.error(`  ✗ ${inst.name}: ${err instanceof Error ? err.message : err}`);
      }
    }
  } finally {
    await db.$disconnect();
  }

  console.log(`Done. Created ${created}, updated ${updated}, failed ${failed.length}.`);
  if (failed.length > 0) {
    console.log(`Failed: ${failed.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});