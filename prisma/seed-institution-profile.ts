// prisma/seed-institution-profile.ts
//
// Fills in the FULL PROFILE of one institution (the Edvoy style page): facts,
// highlights tabs, courses, campuses, required documents and FAQs.
// One institution per run, same Part 1 / Part 2 idea as seed-school.ts.
//
//   1. Keep everything under "PART 2: SEED ENGINE" exactly as it is.
//   2. In "PART 1: INSTITUTION DATA", replace the current institution's details
//      with the next one's.
//   3. Check what would happen:   npm run seed:institution-profile -- --dry
//      Then write it for real:    npm run seed:institution-profile
//
// How it treats your ~1000 existing institutions:
//   The institution is found by SLUG. If it exists it is UPDATED, if not it is
//   CREATED (name and summary are then required).
//   A field you leave out (undefined) is never touched. A field you set to null
//   is cleared. So the original batch seeds stay safe: imageUrl, logoUrl,
//   programs, isFeatured and order are only changed when Part 1 sets them.
//   Courses, campuses, documents and FAQs are replaced as a set each run. Leave
//   one of those lists as undefined to keep what is already stored.
//
// package.json script (add it next to the other seed scripts):
//   "seed:institution-profile": "tsx prisma/seed-institution-profile.ts"

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// ═════════════════════════════════════════════════════════════════════════
// PART 1: INSTITUTION DATA (replace this whole part for each institution)
// Currently: Conestoga College (Kitchener, Ontario), Canada
//
// Every figure below comes from the Edvoy guide page for Conestoga College and
// was not checked against conestogac.on.ca. That page is also dated in places
// (it still says a Milton campus would open in 2024). Re-verify before this
// reaches a student, and write the text in your own words.
// ═════════════════════════════════════════════════════════════════════════

// slugify(name), the same rule every earlier institution seed used.
const SLUG = "conestoga-college";

const PROFILE: ProfileInput = {
  // Required when the institution does not exist yet, optional afterwards.
  name: "Conestoga College",
  summary:
    "A public college in Kitchener, Ontario, with campuses across Waterloo Region and nearby cities, offering career-focused certificates, diplomas and degrees with a strong co-op focus.",

  // Basics
  city: "Kitchener",
  country: "Canada", // must match a name in COUNTRIES
  institutionType: "Public college",
  website: "https://www.conestogac.on.ca",
  // imageUrl / logoUrl: leave out to keep what the batch seeds already stored.

  // Stat strip and sidebar
  founded: 1967,
  acceptanceRate: "85%",
  upcomingIntake: "Jan 2027",

  // English and tuition (the "starts from" fee and English requirement boxes)
  ieltsOverall: 6.0,
  ieltsMinBand: 5.5,
  ieltsNote: "Diploma and certificate: IELTS 6.0, no band below 5.5. Degree: IELTS 6.5, no band below 6.0.",
  tuitionMin: 20978,
  tuitionCurrency: "CAD",
  tuitionPeriod: "per year",

  // Highlights tabs: one short paragraph each. Leave a tab out (or null) to hide it.
  overview: null,
  studentLife: null,
  accommodation: null,
  library: null,
  sports:
    "Conestoga's teams are known as the Condors. Fitness and getting involved are encouraged, so students can try out for teams across a range of sports or join wellness programs and fitness classes.",

  // Social links (full URLs)
  facebookUrl: null,
  instagramUrl: null,
  twitterUrl: null,
  linkedinUrl: null,
  youtubeUrl: null,

  // SEO for the institution page
  metaTitle: "Study at Conestoga College, Ontario | Ruhe Global Resources",
  metaDescription:
    "Explore Conestoga College in Kitchener, Ontario. Compare courses, fees, intakes and requirements, then apply with RGR.",
};

// Courses tab. Fees are per year, in the institution's currency unless you set
// tuitionCurrency on the row. "subject" feeds the subject chips on the page.
const COURSES: CourseInput[] | undefined = [
  {
    name: "Ontario College Graduate Certificate, Cybersecurity Response Planning (Optional Co-op)",
    level: "Postgraduate",
    degree: "Graduate Certificate",
    subject: "Cyber Security",
    duration: "1 Year",
    nextIntake: "Jan 2027",
    tuitionAmount: 16808,
  },
  {
    name: "Ontario College Graduate Certificate, Healthcare Project Leadership and Management",
    level: "Postgraduate",
    degree: "Graduate Certificate",
    subject: "Health care",
    duration: "1 Year",
    nextIntake: "Jan 2027",
    tuitionAmount: 16319,
  },
  {
    name: "Ontario College Certificate, Pre-Health Sciences Pathway to Certificates and Diplomas",
    level: "Undergraduate",
    degree: "Certificate",
    subject: "Health care",
    duration: "1 Year",
    nextIntake: "Jan 2027",
    tuitionAmount: 30953,
  },
  {
    name: "Ontario College Certificate, Medical Laboratory Assistant/Technician",
    level: "Undergraduate",
    degree: "Certificate",
    subject: "Health care",
    duration: "1 Year",
    nextIntake: "Jan 2027",
    tuitionAmount: 30952,
  },
];

// Campuses tab: a name plus, optionally, one paragraph.
const CAMPUSES: CampusInput[] | undefined = [
  {
    name: "Brantford",
    city: "Brantford",
    description:
      "The Brantford campus teaches diplomas in Business and in Health Office Administration, a graduate certificate in Human Resources Management and a certificate in Medical Office Practice. Students can ride Brantford Transit with their Wilfrid Laurier University OneCard.",
  },
  { name: "Kitchener", city: "Kitchener" },
  { name: "Guelph", city: "Guelph" },
  { name: "Cambridge", city: "Cambridge" },
  { name: "Waterloo", city: "Waterloo" },
  { name: "Stratford", city: "Stratford" },
  { name: "Ingersoll", city: "Ingersoll" },
];

// Required Documents tab. One list per study level, grouped by category.
const DOCUMENTS_BY_LEVEL: Record<string, Array<[category: string, name: string]>> | undefined = {
  Undergraduate: [
    ["Visa", "Conduct Clearance (PCC)"],
    ["Visa", "Provincial Attestation Letter (PAL)"],
    ["Financial", "Bank Statement"],
    ["Identity", "Passport"],
  ],
  Postgraduate: [
    ["Visa", "Conduct Clearance (PCC)"],
    ["Visa", "Provincial Attestation Letter (PAL)"],
    ["Financial", "Bank Statement"],
    ["Identity", "Passport"],
  ],
};

// FAQs tab, in the order shown.
const FAQS: FaqInput[] | undefined = [
  {
    question: "Is Conestoga College public or private?",
    answer: "Conestoga is a public college based in Kitchener, Ontario, Canada.",
  },
  {
    question: "Where are Conestoga College's campuses?",
    answer:
      "Conestoga teaches in Brantford, Cambridge, Guelph, Ingersoll, Kitchener, Stratford and Waterloo. Check the college's website for the campus that offers your program.",
  },
  {
    question: "What IELTS score do I need for Conestoga College?",
    answer:
      "Certificate and diploma programs ask for IELTS Academic 6.0 with no band below 5.5. Degrees ask for 6.5 with no band below 6.0. Graduate certificates also ask for 6.5, so confirm the minimum band for your program with the college.",
  },
  {
    question: "How much are tuition fees for international students?",
    answer:
      "Conestoga charges international students per course hour: about C$22.92 for most programs, C$24.89 for graduate certificates and C$25.32 for degrees, plus student fees. Fees change each year, so check the current fee schedule before you apply.",
  },
];

// ═════════════════════════════════════════════════════════════════════════
// PART 2: SEED ENGINE (do not edit when swapping institutions)
// ═════════════════════════════════════════════════════════════════════════

type Nullable<T> = T | null;

// undefined = leave the stored value alone, null = clear it.
type ProfileInput = {
  name?: string;
  summary?: string;
  city?: Nullable<string>;
  country?: Nullable<string>;
  institutionType?: Nullable<string>;
  website?: Nullable<string>;
  imageUrl?: Nullable<string>;
  logoUrl?: Nullable<string>;
  ranking?: Nullable<string>;
  programs?: string[];
  founded?: Nullable<number>;
  acceptanceRate?: Nullable<string>;
  upcomingIntake?: Nullable<string>;
  ieltsOverall?: Nullable<number>;
  ieltsMinBand?: Nullable<number>;
  ieltsAlternatives?: string[];
  ieltsNote?: Nullable<string>;
  tuitionMin?: Nullable<number>;
  tuitionMax?: Nullable<number>;
  tuitionCurrency?: Nullable<string>;
  tuitionPeriod?: Nullable<string>;
  tuitionNote?: Nullable<string>;
  overview?: Nullable<string>;
  studentLife?: Nullable<string>;
  accommodation?: Nullable<string>;
  library?: Nullable<string>;
  sports?: Nullable<string>;
  facebookUrl?: Nullable<string>;
  instagramUrl?: Nullable<string>;
  twitterUrl?: Nullable<string>;
  linkedinUrl?: Nullable<string>;
  youtubeUrl?: Nullable<string>;
  metaTitle?: Nullable<string>;
  metaDescription?: Nullable<string>;
  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;
};

type CourseInput = {
  name: string;
  level?: "Undergraduate" | "Postgraduate";
  degree?: string;
  subject?: string;
  duration?: string;
  nextIntake?: string;
  intakes?: string;
  tuitionAmount?: number;
  tuitionCurrency?: string;
  tuitionPeriod?: string;
  description?: string;
};

type CampusInput = { name: string; city?: string; address?: string; description?: string };
type FaqInput = { question: string; answer: string };

const DRY_RUN = process.argv.includes("--dry");

function assertLimits() {
  const problems: string[] = [];
  const max = (label: string, value: Nullable<string> | undefined, limit: number) => {
    if (value && value.length > limit) problems.push(`${label} is ${value.length} characters, limit is ${limit}`);
  };

  if (!/^[a-z0-9-]+$/.test(SLUG)) problems.push("SLUG must use lowercase letters, numbers and hyphens only");
  if (PROFILE.tuitionCurrency && PROFILE.tuitionCurrency.length !== 3) problems.push("tuitionCurrency must be a 3 letter ISO code");
  max("summary", PROFILE.summary, 320);
  max("ranking", PROFILE.ranking, 60);
  max("ieltsNote", PROFILE.ieltsNote, 160);
  max("tuitionNote", PROFILE.tuitionNote, 160);
  max("metaTitle", PROFILE.metaTitle, 70);
  max("metaDescription", PROFILE.metaDescription, 170);

  for (const [label, url] of Object.entries({
    website: PROFILE.website,
    facebookUrl: PROFILE.facebookUrl,
    instagramUrl: PROFILE.instagramUrl,
    twitterUrl: PROFILE.twitterUrl,
    linkedinUrl: PROFILE.linkedinUrl,
    youtubeUrl: PROFILE.youtubeUrl,
  })) {
    if (url && !/^https?:\/\//i.test(url)) problems.push(`${label} must start with http:// or https://`);
  }

  for (const [i, c] of (COURSES ?? []).entries()) {
    if (!c.name.trim()) problems.push(`course ${i + 1} has no name`);
    if (c.tuitionAmount !== undefined && (!Number.isInteger(c.tuitionAmount) || c.tuitionAmount < 0))
      problems.push(`course "${c.name}": tuitionAmount must be a whole number`);
    if (c.tuitionCurrency && c.tuitionCurrency.length !== 3) problems.push(`course "${c.name}": tuitionCurrency must be 3 letters`);
  }
  for (const [i, c] of (CAMPUSES ?? []).entries()) if (!c.name.trim()) problems.push(`campus ${i + 1} has no name`);
  for (const [i, f] of (FAQS ?? []).entries())
    if (!f.question.trim() || !f.answer.trim()) problems.push(`FAQ ${i + 1} needs a question and an answer`);

  for (const level of Object.keys(DOCUMENTS_BY_LEVEL ?? {})) {
    if (level !== "Undergraduate" && level !== "Postgraduate") problems.push(`document level "${level}" must be Undergraduate or Postgraduate`);
  }

  if (problems.length > 0) {
    throw new Error(`Fix these before seeding:\n - ${problems.join("\n - ")}`);
  }
}

function hostnameOf(website?: Nullable<string>) {
  if (!website) return null;
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function main() {
  assertLimits();

  // Only the fields Part 1 actually set. undefined means "leave it alone".
  const profileData = Object.fromEntries(Object.entries(PROFILE).filter(([, value]) => value !== undefined));

  const documentRows = DOCUMENTS_BY_LEVEL
    ? Object.entries(DOCUMENTS_BY_LEVEL).flatMap(([studyLevel, rows]) =>
        rows.map(([category, name], order) => ({ studyLevel, category, name, order }))
      )
    : undefined;

  console.log(`${DRY_RUN ? "[dry run] " : ""}Institution: ${PROFILE.name ?? SLUG} (${SLUG})`);
  console.log(`  profile fields set : ${Object.keys(profileData).join(", ")}`);
  console.log(`  courses            : ${COURSES ? COURSES.length : "unchanged"}`);
  console.log(`  campuses           : ${CAMPUSES ? CAMPUSES.length : "unchanged"}`);
  console.log(`  documents          : ${documentRows ? documentRows.length : "unchanged"}`);
  console.log(`  faqs               : ${FAQS ? FAQS.length : "unchanged"}`);

  if (DRY_RUN) {
    console.log("Dry run only. Nothing was written.");
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
  }
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  try {
    const existing = await db.institution.findUnique({ where: { slug: SLUG }, select: { id: true } });

    let institutionId: string;
    if (existing) {
      await db.institution.update({ where: { slug: SLUG }, data: profileData });
      institutionId = existing.id;
      console.log("  -> updated the existing institution");
    } else {
      if (!PROFILE.name || !PROFILE.summary) {
        throw new Error(`No institution with slug "${SLUG}" exists, so name and summary are required to create it.`);
      }
      const host = hostnameOf(PROFILE.website);
      const created = await db.institution.create({
        data: {
          ...profileData,
          name: PROFILE.name,
          summary: PROFILE.summary,
          slug: SLUG,
          logoUrl: PROFILE.logoUrl ?? (host ? `https://www.google.com/s2/favicons?domain=${host}&sz=128` : null),
        },
        select: { id: true },
      });
      institutionId = created.id;
      console.log("  -> created a new institution");
    }

    await db.$transaction([
      ...(COURSES
        ? [
            db.institutionCourse.deleteMany({ where: { institutionId } }),
            db.institutionCourse.createMany({
              data: COURSES.map((c, order) => ({
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
      ...(CAMPUSES
        ? [
            db.institutionCampus.deleteMany({ where: { institutionId } }),
            db.institutionCampus.createMany({
              data: CAMPUSES.map((c, order) => ({
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
      ...(FAQS
        ? [
            db.institutionFaq.deleteMany({ where: { institutionId } }),
            db.institutionFaq.createMany({
              data: FAQS.map((f, order) => ({ institutionId, order, question: f.question, answer: f.answer })),
            }),
          ]
        : []),
    ]);

    console.log("Done.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
