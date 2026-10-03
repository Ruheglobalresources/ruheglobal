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
// Currently: Trinity Western University, Langley, British Columbia, Canada
// ═════════════════════════════════════════════════════════════════════════

const SLUG = "trinity-western-university";
const WEBSITE = "https://www.twu.ca";

// Wikipedia article title used to find a placeholder campus photo.
const WIKI_QUERY = "Trinity Western University";

// Set this to a real image URL or path if you already have the cover uploaded.
// Left null, the script looks up a campus photo on Wikipedia as a placeholder.
const COVER_IMAGE_OVERRIDE: string | null = null;

// Paragraphs are separated by a blank line, the same as the admin form.
const overview = [
  "Trinity Western University (TWU) is a private Christian liberal arts university in Langley, British Columbia, in the Metro Vancouver region of western Canada. It was founded in 1962 as Trinity Junior College, became Trinity Western College in 1972 and received university status in 1985. It is Canada's largest Christian university, with more than 6,000 students, and about 35% of its undergraduates come from the United States and other countries, representing over 70 nationalities.",
  "Teaching is organised into the Faculty of Humanities and Social Sciences, the Faculty of Natural and Applied Sciences, and the Schools of Business, Nursing, Education, Human Kinetics, the Arts, Media and Culture, and Graduate Studies, together with the Trinity Evangelical Divinity School. TWU offers 48 undergraduate and 20 graduate degree programs, the average first-year class has about 25 students, and it is recognised under the British Columbia government's Education Quality Assurance designation. Maclean's reports that TWU is consistently ranked among the top two universities in Canada for Educational Experience in the National Survey of Student Engagement.",
  "Beyond the Langley campus, TWU has a Richmond location and the Laurentian Leadership Centre in Ottawa, where students can complete internships. Students can also earn credit on travel studies in places such as France, Spain, East Africa, Italy, Hawaii, China and Vietnam, and the Spartans varsity teams compete in U Sports. Christian faith is part of campus life, including chapel, discipleship and mentoring programs.",
].join("\n\n");

const services = [
  "International undergraduate applicants send official supporting documents, and documents that cannot be replaced should be sent by registered mail. Applicants from GCE based systems need standing in five subjects with at least two at the Advanced level, and TWU may award three semester hours of credit for each Advanced level course passed with a C or better, up to 12 semester hours. Applicants from other systems, including Nigeria's WAEC and NECO, should confirm with the admissions office how their results are assessed. Transfer credit from schools outside Canada must be assessed by an external credential evaluation agency such as ICES (through BCIT), WES or IQAS.",
  "All applicants must show English proficiency. For undergraduate entry the minimums are TOEFL iBT 88 with 20 in each band for tests taken before January 21, 2026, or 4.5 overall (with 3.5 in Reading, Listening and Speaking and 4.0 in Writing) for tests taken on or after that date; IELTS Academic 6.5 with 6.0 in each band; PTE Academic 65 with 60 in each band; Duolingo English Test 120 (110 in Writing and Reading, 95 in Speaking and Listening); or Cambridge 176 and CAEL 70. Students from Nigeria, Ghana, Kenya, Uganda, Zambia, Zimbabwe and South Africa can meet the requirement without a test if they completed three consecutive years of full-time high school or post-secondary education in an internationally recognised English curriculum immediately before enrolling, and they should have the school issue a letter confirming English as the medium of instruction. Students who fall short can enter through the U1 University Transition year or the Trinity Language Centre, and completing those programs meets the requirement.",
  "Graduate applicants whose degrees were completed outside Canada and the US need a Canadian equivalency assessment from TWU Degree Evaluation Services or another recognised agency. English requirements are higher than for undergraduates, for example IELTS 7.5 in most programs and 7.0 for the MBA and MA in Leadership, or Duolingo 140 and 130 respectively. The MA in Leadership asks for a four year degree with a GPA of at least 3.0 in the final two years and prefers three to five years of work experience, and the MBA does not require the GMAT. International MBA applicants pay a $150 application fee and may be given conditional admission with English language training first.",
  "For 2026/27, incoming international undergraduates pay $855 per credit hour, about $25,650 a year at a full 30 credit load, and returning international students pay $815. Fees add $50 per credit hour for infrastructure, technology and activities and a $75 per semester student association fee, so a full year comes to about $27,300 before housing. Graduate tuition for incoming international students ranges from $663 per credit hour for the MA in Linguistics to $1,235 for the Executive MBA, plus the $50 per credit hour fee. New international students are enrolled in Guard.Me interim medical insurance for three months, a one-time charge of $160 unless they hold valid BC MSP coverage.",
  "TWU requires proof of an approved study permit before classes begin, and most applicants need a provincial attestation letter (PAL). After admission, students use the BorderPass service to prepare the study permit application, and TWU pays the BorderPass membership and initial questionnaire fee. Students then pay the non-refundable international enrolment deposit, which is applied to tuition and is refunded only if a study permit is refused, after which TWU issues the letter of admission and PAL. The Government of Canada application fee is paid by the student.",
].join("\n\n");

// Written from Trinity Western University's housing pages (Fall 2026 / Spring 2027 rates).
// Please review it, and replace it with your own paragraph if you prefer.
const accommodation = [
  "TWU has on-campus housing for about 1,100 students, including dorms, community-style living in Robson Hall and apartments that are reserved for upper-year students. For Fall 2026 and Spring 2027, rates per semester start at $1,690 for a shared room in Douglas Hall ($3,380 for a single) and $1,940 in DeVries Centre, then rise to $3,180 in the Skidmore dorm suites, $3,325 in Robson Hall, $2,910 to $3,190 per person in Jacobson Hall pods and $3,445 to $3,675 in the McMillan apartments. Furniture is included.",
  "A meal plan is required for all students in residence and is not included in those prices, so students should add it to their budget. Single rooms in the Skidmore Hall four-bedroom pods are $5,620 per semester. Rates are subject to change, and eligibility for TWU housing is set out on the university's housing page, so students should apply as soon as they are admitted. Students who live off campus can use TWU's off-campus housing information and should arrange somewhere to live before they arrive.",
].join("\n\n");

// Written from the university's Langley campus and facts pages. Please review before publishing.
const locationInfo = [
  "TWU's main campus is at 22500 University Drive in Langley, in the Fraser Valley area of British Columbia, about 45 minutes from Vancouver, 40 minutes from the beach and 45 minutes from the mountains. The campus includes a 60-acre ecological study area, and students have access to a fitness centre, an outdoor centre, a bouldering wall and sports fields.",
  "Langley is a quieter suburban setting than downtown Vancouver, and the campus works as a small community with its own library, cafeteria, wellness centre and campus store. Students who want city life, internships or a different setting can also study at the Richmond location or at the Laurentian Leadership Centre in Ottawa.",
].join("\n\n");

const highlights = [
  "Founded in 1962 and described as Canada's largest Christian university, with over 6,000 students",
  "Consistently ranked among the top two universities in Canada for Educational Experience in the NSSE, according to Maclean's",
  "Average first-year class of about 25 students, with 48 undergraduate and 20 graduate degree programs",
  "Academic entrance scholarships of $2,000 to $6,000 a year, awarded automatically on admission with no separate application",
  "Students from Nigeria and other approved English-curriculum countries can meet the English requirement without a test after three consecutive years of English-medium study",
  "About 45 minutes from Vancouver, with on-campus housing for about 1,100 students",
];

// Static fields. Every limit here matches SchoolSchema in src/schemas/index.ts,
// and the engine below checks them before writing anything.
const SCHOOL = {
  name: "Trinity Western University",
  country: "Canada", // must match a name in COUNTRIES
  city: "Langley, British Columbia",
  founded: 1962,
  ranking: "Top two in Canada for Educational Experience (NSSE, Maclean's)",
  famousFor: "Business, Nursing, Computing Science, Psychology, Human Kinetics, Education, Liberal Arts",
  acceptanceRate: null as string | null,
  tuitionFrom: 25650,
  tuitionTo: null as number | null,
  tuitionCurrency: "CAD",
  description:
    "A private Christian liberal arts university in Langley, British Columbia, about 45 minutes from Vancouver, with small first-year classes, 48 undergraduate programs and automatic entrance scholarships worth up to $6,000 a year.",
  coverImageAlt: "Trinity Western University campus in Langley, British Columbia",
  metaTitle: "Study at Trinity Western University, Canada | Ruhe Global Resources",
  metaDescription:
    "Explore Trinity Western University in Langley, BC. Compare popular courses, tuition, entrance scholarships and housing, then apply with RGR.",
  isActive: true,
  order: 10,
};

// ═════════════════════════════════════════════════════════════════════════
// COURSES
// Only a selection of programmes is listed, not the full catalogue.
// Rates are TWU's 2026/27 incoming international rates from the Registrar's
// Tuition & Fees page (all in CAD):
//   Undergraduate: $855 per credit hour, so about $25,650 a year at 30 credits
//   Graduate: per credit hour, set per programme below
// Fees are extra: $50 per credit hour (infrastructure, technology and
// activity), $75 per semester student association fee for undergraduates,
// and $3 per credit hour graduate student association fee for graduates.
//
// The programme names and degree titles come from TWU's undergraduate and
// graduate programme lists. Please check these before publishing, because
// they are NOT confirmed on the tuition page:
//   4 years for every bachelor's, starting in September or January
//   Graduate programme lengths and total credits (so the totals are not shown)
// ═════════════════════════════════════════════════════════════════════════

type Row = [name: string, degree: string];
type GradRow = [name: string, degree: string, perCredit: number, intakes: string | null];

const UG: Row[] = [
  ["Business", "BBA"],
  ["Computing Science", "BSc"],
  ["Biology", "BSc"],
  ["Chemistry", "BSc"],
  ["Mathematics", "BSc"],
  ["Psychology", "BA"],
  ["International Studies", "BA"],
  ["Media + Communication", "BA"],
  ["Game Development", "BA"],
  ["Human Kinetics", "BHK"],
  ["Sport Management", "BSM"],
  ["Political Studies", "BA"],
];

const PG: GradRow[] = [
  ["Leadership", "MA", 982, "September, January, May"],
  ["Counselling Psychology", "MA", 837, null],
  ["Educational Studies", "MA", 837, null],
  ["Linguistics", "MA", 663, null],
  ["Non-Profit and Charitable Organizations", "MBA", 940, null],
  ["International Business", "MBA", 994, null],
];

const RATE = {
  ugPerCredit: 855,
  ugCreditsPerYear: 30,
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

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

function buildCourses(): CourseRow[] {
  const out: CourseRow[] = [];

  const ugYear = RATE.ugPerCredit * RATE.ugCreditsPerYear;

  for (const [name, degree] of UG) {
    out.push({
      name,
      degree,
      level: "Undergraduate",
      duration: "4 years",
      tuition: `${money(RATE.ugPerCredit)} / credit hour (about ${money(ugYear)} / year at 30 credits)`,
      intakes: "September, January",
      description:
        "International students pay the incoming international rate of $855 per credit hour, plus a $50 per credit hour fee and a $75 per semester student association fee. Courses are at the Langley campus.",
      order: out.length,
    });
  }

  for (const [name, degree, perCredit, intakes] of PG) {
    out.push({
      name,
      degree,
      level: "Postgraduate",
      duration: null,
      tuition: `${money(perCredit)} / credit hour`,
      intakes,
      description:
        "Charged per credit hour at the incoming international rate, plus a $50 per credit hour fee and a $3 per credit hour graduate student association fee. Total cost depends on the programme's credit requirement.",
      order: out.length,
    });
  }

  return out;
}

// ═════════════════════════════════════════════════════════════════════════
// SCHOLARSHIPS
// From TWU's undergraduate scholarships page. Academic scholarships are made
// automatically on admission, based on the average grade of the courses used
// in the admission evaluation. The need-based TWU Grant is for Canadian and
// US citizens and permanent residents only, so it is not listed here.
// ═════════════════════════════════════════════════════════════════════════

const SCHOLARSHIP_PAGE =
  "https://www.twu.ca/admissions-aid/scholarships-financial-aid/undergraduate-students/twu-scholarships-aid";

const scholarships = [
  {
    name: "President's Scholarship",
    academicYear: null as string | null,
    description:
      "$6,000 a year at a full course load ($4,800 at 80%) for incoming students with a high school average of 90% or higher, a 3.73 to 4.00 GPA on a 4.00 scale, or 31 or more IB points. Considered automatically on admission, with no separate application. Returning students must meet the renewal GPA each year.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Provost's Scholarship",
    academicYear: null as string | null,
    description:
      "$4,000 a year at a full course load ($3,200 at 80%) for incoming students with a high school average of 85.0% to 89.9%, a 3.50 to 3.72 GPA on a 4.00 scale, or 29 to 30 IB points. Considered automatically on admission, with no separate application.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Dean's Scholarship",
    academicYear: null as string | null,
    description:
      "$2,000 a year at a full course load ($1,600 at 80%) for incoming students with a high school average of 73.0% to 84.9%, a 2.80 to 3.49 GPA on a 4.00 scale, or 26 to 28 IB points. Considered automatically on admission, with no separate application.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Equipped for Life Scholarship",
    academicYear: "2027/28",
    description:
      "$1,000 for 25 incoming new and transfer students who show leadership potential and a commitment to building a Christ-centred community. Recipients join a leadership retreat in September. Apply through the admissions application by March 15, with recipients chosen in mid-May.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Alumni Legacy Scholarship",
    academicYear: "2027/28",
    description:
      "$1,000 for incoming students whose parent or grandparent graduated with a degree from TWU. Non-renewable and awarded in the first year of study. Apply through the admissions application by March 15.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Endowment Awards",
    academicYear: null as string | null,
    description:
      "Donor-funded awards of up to $10,000, offered on criteria such as financial need and academic program. Most are for returning students, but several are open to new students. Submit the Financial Need Assessment and endowment application by March 15 for priority.",
    url: SCHOLARSHIP_PAGE,
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