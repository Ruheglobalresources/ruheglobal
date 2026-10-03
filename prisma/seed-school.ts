// prisma/seed-school.ts
// One reusable seed file for the School table. It is not named after any school.
//
// HOW TO SEED A DIFFERENT SCHOOL
//   1. Keep everything under "PART 2: SEED ENGINE" exactly as it is.
//   2. In "PART 1: SCHOOL DATA", delete the current school's details and replace
//      them with the new school's: SLUG, WEBSITE, WIKI_QUERY, SCHOOL, the text
//      sections, the course groups and the scholarships.
//   3. Run:  npm run seed:school
//
// Safe to run more than once:
//   the school is upserted by slug, so different schools never overwrite each other
//   courses and scholarships for that school are deleted and recreated each run
//   gallery images are never touched, so anything uploaded in the admin stays
//   an existing coverImage or logoUrl is kept, so an uploaded cover survives
//
// package.json script (add it next to the other seed scripts):
//   "seed:school": "tsx prisma/seed-school.ts"

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });
// ═════════════════════════════════════════════════════════════════════════
// PART 1: SCHOOL DATA (replace this whole part for each new school)
// Currently: Trent University (Peterborough and Durham GTA, Ontario), Canada
// ═════════════════════════════════════════════════════════════════════════

const SLUG = "trent-university";
const WEBSITE = "https://www.trentu.ca";

// Wikipedia article title used to find a placeholder campus photo.
const WIKI_QUERY = "Trent University";

// Set this to a real image URL or path if you already have the cover uploaded.
const COVER_IMAGE_OVERRIDE: string | null =
  "https://my.trentu.ca/portalv2/modules/api/news.php?f=display&id=357659";

// Paragraphs are separated by a blank line, the same as the admin form.
const overview = [
  "Trent University is a public university in Ontario, Canada, with its main campus on the Otonabee River in Peterborough, about 125 km northeast of Toronto, and a second campus, Trent Durham GTA, in Oshawa. It was founded in 1964 and is known for small classes, a collegiate system, and close contact between students and professors.",
  "Trent teaches mostly at the undergraduate level, with popular programs in business administration, computer science and software engineering, psychology, nursing, forensic science, biology, environmental studies, international development and education. Its graduate school offers research master's and PhD programs, and course-based programs such as the Master of Management at the Durham campus.",
  "Trent describes itself as the number one undergraduate university in Ontario and number one in Ontario for student services in Maclean's primarily undergraduate category. International students are automatically considered for renewable entrance scholarships.",
].join("\n\n");

const services = [
  "To enter an undergraduate program, applicants need a high school diploma that meets Trent's general and program-specific requirements, plus proof of English. Undergraduate applications are made through the Ontario Universities' Application Centre (OUAC). Accepted English tests are IELTS 6.5 with no band below 6.0, TOEFL iBT 4.5 on the new scale with at least 4.0 in writing (86 with writing 20 for tests taken before 2026), PTE Academic 59, CAEL 60, Cambridge B2 First or C1 Advanced 176 with no part below 169, and Duolingo 115 (undergraduate only; the School of Graduate Studies does not accept Duolingo).",
  "Trent will waive the English test for applicants with an IB Diploma where English Language A was taught, a British curriculum O-Level English grade C or better, or at least three years of full-time study in a secondary school where all teaching was in English with no ESL courses. Nigerian applicants who qualify under the English-medium school rule should confirm with Trent International before applying. Proof of English is due by 1 July for September entry, 1 November for January entry and 1 March for May entry. For graduate programs, applicants normally need a bachelor's degree with a strong average and a statement of purpose.",
  "International students pay tuition and ancillary fees each term, and the tuition quoted does not include housing and meals if they live in residence. Trent International (international@trentu.ca) supports international students with immigration advice, orientation and career experience, and the university offers an Academic Skills Centre, wellness services, Careerspace and ESL Academic English courses. Students on study permits can usually work part time on or off campus.",
].join("\n\n");

// Trent's housing page was not read in detail. Please review before publishing.
const accommodation = [
  "Trent's residences on the Peterborough campus are organised around its historic colleges, and first-year students are encouraged to apply for residence, with meal plans available. Residence and meal costs are billed separately from tuition and ancillary fees.",
  "Off-campus housing in Peterborough, usually a shared house or apartment within walking distance or a short bus ride of campus, is generally more affordable than in Toronto. Students at the Durham GTA campus in Oshawa usually rent off campus. Check current residence rates and deadlines on Trent's housing website before applying.",
].join("\n\n");

// Written from Trent's own pages. Please review before publishing.
const locationInfo = [
  "The Peterborough campus is on the banks of the Otonabee River, with riverside trails, woodland and the Trent Nature Areas on its doorstep, about 125 km northeast of Toronto. The Durham GTA campus at 55 Thornton Road South in Oshawa is a smaller, city campus in the eastern Greater Toronto Area.",
  "Peterborough is a mid-sized city in the Kawarthas region of Ontario, known for its arts scene, lakes and outdoor life. Toronto is within reach by bus and road, and living costs are generally lower than in the larger Canadian cities.",
].join("\n\n");

const highlights = [
  "Maclean's: #1 in Ontario, primarily undergraduate category, and #1 for student services (as stated by Trent)",
  "Two campuses: Peterborough, and Durham GTA in Oshawa",
  "Automatic renewable entrance scholarships for international undergraduates, from C$2,500 to C$5,500 a year",
  "Competitive prestigious scholarships worth up to C$15,000 a year and C$60,000 over a four-year degree",
  "Guaranteed funding packages for research master's students (C$18,000 to C$23,000 a year for two years)",
  "International PhD students pay the domestic out-of-province tuition rate",
];

// Static fields. Every limit here matches SchoolSchema in src/schemas/index.ts,
// and the engine below checks them before writing anything.
const SCHOOL = {
  name: "Trent University",
  country: "Canada", // must match a name in COUNTRIES
  city: "Peterborough",
  founded: 1964,
  ranking: "Maclean's: #1 in Ontario, primarily undergraduate category",
  famousFor: "Business, Computer Science, Psychology, Nursing, Forensic Science, Environmental Studies, Education",
  acceptanceRate: null as string | null,
  tuitionFrom: 25616,
  tuitionTo: 38577,
  tuitionCurrency: "CAD",
  description:
    "A public university in Ontario with campuses in Peterborough and Durham GTA, known for small classes, a collegiate system and strong undergraduate teaching in business, computing, psychology, nursing and environmental studies.",
  coverImageAlt: "Trent University campus on the Otonabee River in Peterborough",
  metaTitle: "Study at Trent University, Ontario | Ruhe Global Resources",
  metaDescription:
    "Explore Trent University in Peterborough and Durham, Ontario. Compare programs, tuition fees, scholarships and housing, then apply with RGR.",
  isActive: true,
  order: 8,
};

// ─────────────────────────────────────────────────────────────────────────
// COURSES (popular programs; Peterborough unless noted)
// Fees are Trent's published international fees, in CAD:
//   Undergraduate, new start Fall 2026 / Winter 2027 (Peterborough):
//     tuition $35,631.91, plus about $3,397 in ancillary and levy fees,
//     so about $39,029 in total. Nursing (Collaborative and Compressed) and
//     the Bachelor of Education are billed on the same tuition.
//   Research master's (2025/26, three terms): tuition $25,615.67, plus
//     about $493 in ancillary fees. Trent's limited International Graduate
//     Scholarships bring many research master's students down to about the
//     out-of-province domestic rate.
//   Master of Management, Durham (2025/26, three terms): $38,576.73.
//     The program is 16 months (four terms).
//   2026/27 graduate fees were not posted yet when this was written.
// Program names come from Trent's fee pages, graduate pages and common
// program lists, so confirm each one on trentu.ca before publishing.
// ─────────────────────────────────────────────────────────────────────────

type Row = [name: string, degree: string];

const UG: Row[] = [
  ["Business Administration", "BBA"],
  ["Computer Science", "BSc"],
  ["Software Engineering", "BEng"],
  ["Psychology", "BA/BSc"],
  ["Forensic Science", "BSc"],
  ["Biology", "BSc"],
  ["Environmental Science and Studies", "BA/BSc"],
  ["International Development Studies", "BA"],
  ["Economics", "BA"],
  ["Nursing (Collaborative and Compressed)", "BScN"],
  ["Education", "BEd"],
];

const PG_RESEARCH: Row[] = [
  ["Environmental and Life Sciences", "MSc"],
  ["Applied Modelling and Quantitative Methods", "MSc"],
  ["Sustainability Studies", "MA"],
  ["Psychology", "MA/MSc"],
];

const PG_MANAGEMENT: Row[] = [
  ["Management (Durham GTA campus)", "MMgmt"],
];

const FEE = {
  ugTuition: 35632,
  ugWithFees: 39029,
  pgResearch: 25616,
  pgManagement: 38577,
};

type CourseRow = {
  name: string;
  degree: string;
  level: string;
  duration: string | null;
  tuition: string | null;
  intakes: string | null;
  description: string | null;
  order: number;
};

const cad = (n: number) => `C$${n.toLocaleString("en-CA")}`;

function buildCourses(): CourseRow[] {
  const out: CourseRow[] = [];

  const add = (
    level: string,
    tuition: string,
    duration: string,
    intakes: string,
    description: string | null,
    rows: Row[]
  ) => {
    for (const [name, degree] of rows) {
      out.push({ name, degree, level, duration, tuition, intakes, description, order: out.length });
    }
  };

  add(
    "Undergraduate",
    `${cad(FEE.ugTuition)} / year tuition (about ${cad(FEE.ugWithFees)} with ancillary fees)`,
    "4 years",
    "September, January, May",
    "2026/27 international fee for new students. Entrance scholarships of C$2,500 to C$5,500 a year are assessed automatically.",
    UG
  );
  add(
    "Postgraduate",
    `${cad(FEE.pgResearch)} / year tuition (2025/26)`,
    "1 to 2 years",
    "September",
    "Research-based master's program. Eligible students receive a funding package, and limited International Graduate Scholarships reduce tuition.",
    PG_RESEARCH
  );
  add(
    "Postgraduate",
    `${cad(FEE.pgManagement)} for a three-term year (2025/26)`,
    "16 months",
    "September, January, May",
    "Course-based professional master's with streams including Strategic Change Management. Professional programs do not offer funding packages.",
    PG_MANAGEMENT
  );

  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// SCHOLARSHIPS (from trentu.ca international scholarships pages)
// ─────────────────────────────────────────────────────────────────────────

const SCHOLARSHIP_PAGE = "https://www.trentu.ca/international/discover-trent/tuition-scholarships/scholarships";
const GRAD_FUNDING_PAGE = "https://www.trentu.ca/graduatestudies/funding-tuition/funding";

const scholarships = [
  {
    name: "International Entrance Scholarships",
    academicYear: "2026/27",
    description:
      "Assessed automatically for international undergraduate applicants with a Canadian-equivalent high school average of 80% or higher, studying on a study permit. Worth C$5,500 a year for 95 to 100%, C$4,500 for 90 to 94.9%, C$3,500 for 85 to 89.9% and C$2,500 for 80 to 84.9%. Renewable each year if the student keeps an 80% average on a full course load.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Renewable Prestigious Scholarships and Awards",
    academicYear: "2026/27",
    description:
      "Competitive awards for entering international undergraduates with outstanding academic achievement, community service, leadership potential and some financial need. They fund tuition and ancillary fees up to C$15,000 per year and C$60,000 over a four-year degree, and can be combined with the entrance scholarship. Apply in the Trent Applicant Portal between 1 November and 15 February. January starters are not eligible.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Moore Family International Scholarship",
    academicYear: "2026/27",
    description:
      "Up to C$12,000 a year, renewable up to C$48,000 over four years, for three entering students from outside North America with outstanding academic achievement, community service, leadership potential and some financial need. Applications go through the prestigious scholarships form.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Graduate Funding Packages and International Graduate Scholarships",
    academicYear: "2026/27",
    description:
      "Eligible research-based master's students receive guaranteed funding of at least C$18,000 to C$23,000 a year for two years, and limited International Graduate Scholarships offset tuition so recipients pay about the same as out-of-province domestic students. Professional and course-based programs, such as the Master of Management, do not offer funding packages.",
    url: GRAD_FUNDING_PAGE,
  },
];


// ═════════════════════════════════════════════════════════════════════════
// PART 2: SEED ENGINE (do not edit when swapping schools)
// ═════════════════════════════════════════════════════════════════════════

// Same limits as SchoolSchema and the Prisma models, so a bad value fails
// here with a clear message instead of failing later in the admin form.
function assertLimits() {
  const problems: string[] = [];
  const max = (label: string, value: string | null | undefined, limit: number) => {
    if (value && value.length > limit) problems.push(`${label} is ${value.length} characters, limit is ${limit}`);
  };

  if (!/^[a-z0-9-]+$/.test(SLUG)) problems.push("SLUG must use lowercase letters, numbers and hyphens only");
  if (SCHOOL.tuitionCurrency.length !== 3) problems.push("tuitionCurrency must be a 3 letter ISO code");
  max("description", SCHOOL.description, 320);
  max("metaTitle", SCHOOL.metaTitle, 70);
  max("metaDescription", SCHOOL.metaDescription, 170);
  max("ranking", SCHOOL.ranking, 80);
  max("famousFor", SCHOOL.famousFor, 120);
  max("acceptanceRate", SCHOOL.acceptanceRate, 40);
  for (const s of scholarships) max(`scholarship "${s.name}" academicYear`, s.academicYear, 20);

  if (problems.length) throw new Error("Seed data problems:\n  " + problems.join("\n  "));
}

// Same lookup approach as seed-featured-institutions.ts. These are only
// placeholders: replace the cover and logo from the admin edit page with
// the official files.
const WIKI_ENDPOINT = "https://en.wikipedia.org/w/api.php";
const UA = "RuheGlobalSchoolSeed/1.0 (https://www.ruhegr.com; school catalog seed)";

async function fetchWikipediaImage(query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "1600",
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

function faviconFor(website: string): string | null {
  try {
    const host = new URL(website).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return null;
  }
}

async function main() {
  assertLimits();
  console.log(`Seeding ${SCHOOL.name}...`);

  const existing = await db.school.findUnique({ where: { slug: SLUG } });

  const coverImage = COVER_IMAGE_OVERRIDE ?? existing?.coverImage ?? (await fetchWikipediaImage(WIKI_QUERY));

  if (!coverImage) {
    throw new Error(
      "No cover image found. Set COVER_IMAGE_OVERRIDE at the top of this file to an image URL or path, then run again."
    );
  }

  const logoUrl = existing?.logoUrl ?? faviconFor(WEBSITE);

  const data = {
    ...SCHOOL,
    website: WEBSITE,
    overview,
    services,
    accommodation,
    locationInfo,
    highlights,
    coverImage,
    logoUrl,
  };

  const school = await db.school.upsert({
    where: { slug: SLUG },
    create: { ...data, slug: SLUG },
    update: data,
  });

  const courses = buildCourses();

  await db.$transaction([
    db.schoolCourse.deleteMany({ where: { schoolId: school.id } }),
    db.schoolCourse.createMany({
      data: courses.map((c) => ({ ...c, schoolId: school.id })),
    }),
    db.schoolScholarship.deleteMany({ where: { schoolId: school.id } }),
    db.schoolScholarship.createMany({
      data: scholarships.map((s, i) => ({ ...s, schoolId: school.id, order: i })),
    }),
  ]);

  console.log(`  Done: ${school.name}`);
  console.log(`  ${courses.length} courses, ${scholarships.length} scholarships`);
  console.log(`  Page: /schools/${SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());