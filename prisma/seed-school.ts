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
// Currently: University of South Wales (USW), United Kingdom
// ═════════════════════════════════════════════════════════════════════════

const SLUG = "university-of-south-wales";
const WEBSITE = "https://www.southwales.ac.uk";

// Wikipedia article title used to find a placeholder campus photo.
const WIKI_QUERY = "University of South Wales";

// Set this to a real image URL or path if you already have the cover uploaded.
// Left null, the script looks up a campus photo on Wikipedia as a placeholder.
const COVER_IMAGE_OVERRIDE: string | null = null;

// Paragraphs are separated by a blank line, the same as the admin form.
const overview = [
  "The University of South Wales was formed in 2013 when the University of Glamorgan and the University of Wales, Newport came together. Between them the two institutions trace their roots back more than 170 years. Today USW is a public university with campuses in Cardiff, Newport and Pontypridd, welcoming students from more than 100 countries.",
  "It has three faculties: Computing, Engineering and Science; Business and Creative Industries; and Life Sciences and Education. Together they offer over 200 undergraduate and postgraduate courses, from cyber security, engineering and computing to business, law, film, animation, fashion, sport and health. USW is home to the National Cyber Security Academy, launched in 2016 with industry partners and the Welsh Government.",
  "In the Guardian University Guide 2027 USW is ranked 24th in the UK out of 123 universities and is the top university in Wales, its highest ever position.",
].join("\n\n");

const services = [
  "Applications are made directly to USW, or through UCAS for some undergraduate courses. Most courses accept IELTS 6.0 overall with no component below 5.5, and a small number of courses ask for a higher score, for example IELTS 6.5 overall with 6.0 in each component for Primary Initial Teacher Education. USW also accepts TOEFL iBT, Duolingo English Test, Password Skills Plus and LanguageCert. Students from Nigeria can also use a WAEC or NECO English credit at grade C6 or better for undergraduate entry, and those with a second class degree or better are considered for direct postgraduate entry.",
  "Applicants who need extra English support can take pre sessional English courses before their degree, and in sessional English classes are available once they have started. USW keeps a network of education agents in Nigeria, including two in country representatives who help with applications.",
  "Once on campus, international students have access to the Advice Zone, disability, mental health and counselling teams, student money advice, and careers and employability support. Scholarships are applied automatically when an application is received, so there is no separate scholarship form for most awards. Applicants pay the deposit stated in their offer letter to secure the scholarship.",
].join("\n\n");

// The paragraph for accommodation was not included in the upload, so this is
// written from USW's published accommodation pages and cost table. Please
// review it, and replace it with your own paragraph if you prefer.
const accommodation = [
  "USW offers guaranteed accommodation for new students and describes its university owned halls as some of the most competitively priced in Wales and the South West. The university owns halls only at Pontypridd (Treforest), where there are over 1,200 rooms right on campus. In Cardiff and Newport students live in partner private halls close to campus.",
  "Treforest halls: Glamorgan Court standard room (single bed, ensuite) £117 per week, Glamorgan Court upgraded room £140 per week, Mountain Halls room £152 per week and Mountain Halls studio flat £193 per week. Halls contracts run for 40 weeks, so £117 per week comes to £4,680 for the contract. International students pay in full rather than by instalments.",
  "Cardiff: Ty Pont Haearn (Unite) is £161 to £163 per week, and Zenith (CRM Students) is £210 to £230 per week depending on the room type. Newport: Newport Student Village overlooks the River Usk, five minutes' walk from campus, with rates set by its operator. Contract lengths differ by provider, so check each provider's contract before booking.",
].join("\n\n");

// Written from USW's own pages and student living cost surveys. Please review before publishing.
const locationInfo = [
  "USW is spread across three locations in South Wales. The Cardiff campus sits in the city centre, the Newport campus is on the River Usk in the middle of the city, and the Pontypridd campus at Treforest is set among green hills with student halls on site. A free shuttle bus links the Treforest, Sports Park and Glyntaff sites.",
  "The campuses are a short train ride apart: Newport is about 11 minutes from Cardiff and Pontypridd about 22 minutes. Cardiff is one of the UK's fastest growing cities with a lively, multicultural feel, and Wales has the lowest average student rent of any UK region according to Save the Student's 2026 survey. Bristol is also within easy reach.",
].join("\n\n");

const highlights = [
  "Ranked 24th of 123 UK universities in the Guardian University Guide 2027, up 19 places and the highest position in USW's history",
  "Ranked the top university in Wales in the Guardian University Guide 2027",
  "Top in Wales for Aerospace engineering, Animation and game design, Education, Law, Marketing and public relations, Midwifery and Nursing (Guardian 2027 subject tables)",
  "Ranked 77th in the UK in the Complete University Guide 2026, the biggest rise of any Welsh university that year",
  "Home of the National Cyber Security Academy, launched in 2016 with industry partners and the Welsh Government",
];

// Static fields. Every limit here matches SchoolSchema in src/schemas/index.ts,
// and the engine below checks them before writing anything.
const SCHOOL = {
  name: "University of South Wales",
  country: "United Kingdom", // must match a name in COUNTRIES
  city: "Cardiff",
  founded: 2013,
  ranking: "Guardian #24 UK (2027)",
  famousFor: "Cyber Security, Engineering, Creative Industries, Business and Law",
  acceptanceRate: null as string | null,
  tuitionFrom: 16800,
  tuitionTo: 18970,
  tuitionCurrency: "GBP",
  description:
    "A Welsh university with campuses in Cardiff, Newport and Pontypridd, offering over 200 courses across business, creative industries, computing, engineering, science, law and health, and ranked 24th in the UK by the Guardian University Guide 2027.",
  coverImageAlt: "University of South Wales campus",
  metaTitle: "Study at University of South Wales, UK | Ruhe Global Resources",
  metaDescription:
    "Explore the University of South Wales in Cardiff, Newport and Pontypridd. Compare courses, tuition fees, scholarships and accommodation, then apply with RGR.",
  isActive: true,
  order: 1,
};

// ─────────────────────────────────────────────────────────────────────────
// COURSES
// The course list comes from the WEF programs template for this school
// (spelling mistakes in the sheet were corrected). Each row: [name, degree].
// The annual fee is set per group below, using the 2026/27 international
// tuition fees on USW's fees page (September 2026 and February 2027 intakes).
//
// Left out on purpose:
//   BSc (Hons) Nursing (Adult): USW's course page says it is not currently
//   open to international applicants.
//   Applied Cyber Security appeared twice in the sheet with the same degree,
//   so it is listed once.
//
// Fee groups follow USW's own headings, "Business or Creative Industries"
// and "Computing, Engineering, Sciences or Education". Please check these
// courses against USW's fees page if the exact fee matters:
//   Computer Games Design and Development (placed under Sciences)
//   Sound, Lighting and Live Event Technology (placed under Creative)
//   Sports Journalism (placed under Creative)
// ─────────────────────────────────────────────────────────────────────────

type Row = [name: string, degree: string];

const UG_BUSINESS_CREATIVE: Row[] = [
  ["Accounting & Finance", "BA (Hons)"],
  ["Accounting & Finance (including foundation year)", "BA (Hons)"],
  ["Advertising", "BA (Hons)"],
  ["Animation", "BA (Hons)"],
  ["Animation (2D and Stop Motion)", "BA (Hons)"],
  ["Business and Management", "BA (Hons)"],
  ["Business and Management (Creative Industries)", "BA (Hons)"],
  ["Business and Management (Entrepreneurship)", "BA (Hons)"],
  ["Business and Management (including foundation year)", "BA (Hons)"],
  ["Business Management (Accounting and Finance) (Top-Up)", "BA (Hons)"],
  ["Business Management (Human Resource Management) (Top-Up)", "BA (Hons)"],
  ["Business Management (Marketing) (Top-Up)", "BA (Hons)"],
  ["Business Management (Supply Chain Management) (Top-Up)", "BA (Hons)"],
  ["Business Management (Top-Up)", "BA (Hons)"],
  ["Documentary Photography", "BA (Hons)"],
  ["Fashion Design", "BA (Hons)"],
  ["Fashion Marketing", "BA (Hons)"],
  ["Film", "BA (Hons)"],
  ["Game Art", "BA (Hons)"],
  ["Games Design", "BA (Hons)"],
  ["Graphic Communication", "BA (Hons)"],
  ["History", "BA (Hons)"],
  ["History (including foundation year)", "BA (Hons)"],
  ["Illustration", "BA (Hons)"],
  ["Interior Design", "BA (Hons)"],
  ["International Business (Top-Up)", "BA (Hons)"],
  ["Law", "LLB (Hons)"],
  ["Law (Accelerated Route)", "LLB (Hons)"],
  ["Law and Criminology", "LLB (Hons)"],
  ["Law and Legal Practice (SQE)", "LLB (Hons)"],
  ["Law (including foundation year)", "LLB (Hons)"],
  ["Logistics, Procurement and Supply Chain Management", "BSc (Hons)"],
  ["Marketing", "BSc (Hons)"],
  ["Marketing (including foundation year)", "BSc (Hons)"],
  ["Media Production", "BA (Hons)"],
  ["Media, Culture and Journalism", "BA (Hons)"],
  ["Music Producing", "BA (Hons)"],
  ["Performance and Media", "BA (Hons)"],
  ["Photography", "BA (Hons)"],
  ["Popular and Commercial Music", "BA (Hons)"],
  ["Sound, Lighting and Live Event Technology", "BSc (Hons)"],
  ["Sports Journalism", "BA (Hons)"],
  ["Theatre and Drama", "BA (Hons)"],
  ["TV and Film Set Design", "BA (Hons)"],
  ["Visual Effects and Motion Graphics", "BA (Hons)"],
];

const UG_SCIENCE_HEALTH_EDUCATION: Row[] = [
  ["Aeronautical Engineering", "BEng (Hons)"],
  ["Aeronautical Engineering", "MEng (Hons)"],
  ["Aeronautical Engineering (including foundation year)", "BEng (Hons)"],
  ["Aerospace Engineering", "BEng (Hons)"],
  ["Aerospace Engineering", "MEng (Hons)"],
  ["Aerospace Engineering (including foundation year)", "BEng (Hons)"],
  ["Aerospace Systems Engineering", "BEng (Hons)"],
  ["Aircraft Maintenance Engineering", "BSc (Hons)"],
  ["Aircraft Maintenance Engineering (including foundation year)", "BSc (Hons)"],
  ["Applied Biology", "BSc (Hons)"],
  ["Applied Computing (Top-Up)", "BSc (Hons)"],
  ["Applied Cyber Security", "BSc (Hons)"],
  ["Applied Cyber Security (including foundation year)", "BSc (Hons)"],
  ["Biology", "BSc (Hons)"],
  ["Biology (including foundation year)", "BSc (Hons)"],
  ["Biomedical Science", "BSc (Hons)"],
  ["Biomedical Science (including foundation year)", "BSc (Hons)"],
  ["Building Surveying", "BSc (Hons)"],
  ["Building Surveying (including foundation year)", "BSc (Hons)"],
  ["Childhood Development", "BSc (Hons)"],
  ["Childhood Development (including foundation year)", "BSc (Hons)"],
  ["Childhood Studies (Top-Up)", "BSc (Hons)"],
  ["Civil and Construction Engineering", "BEng (Hons)"],
  ["Civil Engineering", "BEng (Hons)"],
  ["Civil Engineering", "MEng (Hons)"],
  ["Civil Engineering (including foundation year)", "BSc (Hons)"],
  ["Community Football Coaching and Administration (Top-Up)", "BSc (Hons)"],
  ["Computer Games Design and Development", "BSc (Hons)"],
  ["Computer Science", "BSc (Hons)"],
  ["Computer Science (including foundation year)", "BSc (Hons)"],
  ["Computer Science Technology", "BSc (Hons)"],
  ["Computing", "BSc (Hons)"],
  ["Computing (including foundation year)", "BSc (Hons)"],
  ["Construction Project Management", "BSc (Hons)"],
  ["Construction Project Management (including foundation year)", "BSc (Hons)"],
  ["Counselling and Therapeutic Practice", "BA (Hons)"],
  ["Creative and Therapeutic Arts", "BA (Hons)"],
  ["Criminology", "BSc (Hons)"],
  ["Criminology (including foundation year)", "BSc (Hons)"],
  ["Criminology with Psychology", "BSc (Hons)"],
  ["Criminology with Youth Justice", "BSc (Hons)"],
  ["Criminology with Youth Justice (including foundation year)", "BSc (Hons)"],
  ["Digital Forensics", "BSc (Hons)"],
  ["Digital Forensics (including foundation year)", "BSc (Hons)"],
  ["Early Years Education (Top-Up)", "BA (Hons)"],
  ["Education", "BA (Hons)"],
  ["Electrical and Electronic Engineering", "BEng (Hons)"],
  ["Electrical and Electronic Engineering", "MEng (Hons)"],
  ["Electrical and Electronic Engineering (Top-Up)", "BSc (Hons)"],
  ["Electrical and Electronic Engineering (including foundation year)", "BEng (Hons)"],
  ["Electronic Engineering Technology", "BEng (Hons)"],
  ["Football Coaching and Performance", "BSc (Hons)"],
  ["Football Coaching, Development and Administration", "BSc (Hons)"],
  ["Forensic Investigation", "BSc (Hons)"],
  ["Forensic Investigation (including foundation year)", "BSc (Hons)"],
  ["Forensic Science", "BSc (Hons)"],
  ["Forensic Science (including foundation year)", "BSc (Hons)"],
  ["Health, Wellbeing and Social Care Management", "BSc (Hons)"],
  ["Health, Wellbeing and Social Care Management (including foundation year)", "BSc (Hons)"],
  ["Mechanical Engineering", "BEng (Hons)"],
  ["Mechanical Engineering", "MEng (Hons)"],
  ["Mechanical Engineering (including foundation year)", "BEng (Hons)"],
  ["Mechanical Systems Engineering", "BEng (Hons)"],
  ["Medical Sciences", "BSc (Hons)"],
  ["Medicinal and Biological Chemistry", "BSc (Hons)"],
  ["Medicinal and Biological Chemistry (including foundation year)", "BSc (Hons)"],
  ["Pharmaceutical Science", "BSc (Hons)"],
  ["Pharmaceutical Science (including foundation year)", "BSc (Hons)"],
  ["Primary Initial Teacher Education with QTS: English Medium", "BA (Hons)"],
  ["Professional Policing", "BSc (Hons)"],
  ["Professional Policing (including foundation year)", "BSc (Hons)"],
  ["Project Management (Construction)", "BSc (Hons)"],
  ["Psychology", "BSc (Hons)"],
  ["Psychology (including foundation year)", "BSc (Hons)"],
  ["Psychology with Counselling", "BSc (Hons)"],
  ["Psychology with Criminology", "BSc (Hons)"],
  ["Psychology with Developmental Disorders", "BSc (Hons)"],
  ["Public Services", "BA (Hons)"],
  ["Public Services (including foundation year)", "BA (Hons)"],
  ["Quantity Surveying and Commercial Management", "BSc (Hons)"],
  ["Quantity Surveying and Commercial Management (including foundation year)", "BSc (Hons)"],
  ["Real Estate", "BSc (Hons)"],
  ["Real Estate (including foundation year)", "BSc (Hons)"],
  ["Sport and Exercise Science", "BSc (Hons)"],
  ["Sport and Exercise Therapy", "BSc (Hons)"],
  ["Sports Coaching and Physical Education", "BSc (Hons)"],
  ["Sport Exercise Rehabilitation", "BSc (Hons)"],
  ["Strength and Conditioning", "BSc (Hons)"],
  ["Wildlife Ecology and Conservation", "BSc (Hons)"],
  ["Wildlife Ecology and Conservation (including foundation year)", "BSc (Hons)"],
  ["Working with Children and Families", "BA (Hons)"],
];

// Integrated masters in Chiropractic. No fee is published in the international fee table.
const UG_NO_PUBLISHED_FEE: Row[] = [
  ["Master of Chiropractic", "MChiro"],
  ["Master of Chiropractic (including foundation year)", "MChiro"],
];

const PG_STANDARD: Row[] = [
  ["Advanced Computer Science", "MSc"],
  ["Advanced Performance Football Coaching", "MSc"],
  ["Aeronautical Engineering", "MSc"],
  ["Animation", "MA"],
  ["Artificial Intelligence", "MSc"],
  ["Aviation Engineering and Management", "MSc"],
  ["Behaviour Analysis and Therapy", "MSc"],
  ["CAMH (Child and Adolescent Mental Health)", "MA"],
  ["Civil Engineering", "MSc"],
  ["Clinical Psychology", "MSc"],
  ["Computer and Information Systems", "MSc"],
  ["Construction Project Management", "MSc"],
  ["Crime and Justice", "MSc"],
  ["Cyber Security, Risk and Resilience", "MSc"],
  ["Data Science", "MSc"],
  ["Digital Forensics", "MSc"],
  ["Education (Innovation in Learning and Teaching)", "MA"],
  ["Electronics and Information Technology", "MSc"],
  ["Engineering Management", "MSc"],
  ["Film (Cinematography)", "MA"],
  ["Film (Directing)", "MA"],
  ["Film (Documentary)", "MA"],
  ["Film (Editing)", "MA"],
  ["Film (Production Management)", "MA"],
  ["Film (Screenwriting)", "MA"],
  ["Finance and Investment", "MSc"],
  ["Forensic Audit and Accounting", "MSc"],
  ["Forensic Investigation", "MSc"],
  ["Games", "MA"],
  ["Graphic Communication", "MA"],
  ["Health and Public Service Management", "MSc"],
  ["Human Resource Management", "MSc"],
  ["International Logistics and Supply Chain Management", "MSc"],
  ["International Security and Risk Management", "MSc"],
  ["International Security and Risk Management (Counter Terrorism)", "MSc"],
  ["Laws", "LLM"],
  ["Laws (International Commercial Law)", "LLM"],
  ["Leadership and Management (Education)", "MA"],
  ["Management", "MSc"],
  ["Master of Business Administration", "MBA"],
  ["Mechanical Engineering", "MSc"],
  ["Music Engineering and Production", "MSc"],
  ["Music Production and Songwriting", "MA"],
  ["Pharmaceutical Chemistry", "MSc"],
  ["Professional Accounting (with ACCA Tuition)", "MSc"],
  ["Professional Accounting (with ACCA Tuition) (Fast Track)", "MSc"],
  ["Professional Practice", "MSc"],
  ["Project Management", "MSc"],
  ["Public Health", "MSc"],
  ["Renewable and Sustainable Energy Technologies", "MSc"],
  ["Renewable Energy and Sustainable Technology", "MSc"],
  ["Safety, Health and Environmental Management", "MSc"],
  ["SEN/ALN (Additional Learning Needs)", "MA"],
  ["SEN/ALN (Autism)", "MA"],
  ["Sport, Health and Exercise Science", "MSc"],
  ["Sports Coaching and Performance", "MSc"],
  ["Strategic and Digital Marketing", "MSc"],
  ["TESOL (Teaching English to Speakers of Other Languages)", "MA"],
  ["Theatre and Performance", "MA"],
  ["Wildlife and Conservation Management", "MSc"],
  ["Working for Children and Young People (Youth Work Initial Qualifying)", "MA"],
  ["Working with Adult and Young People who Offend", "MSc"],
];

// MBA Global and the LLM Legal Practice are priced higher than other taught masters.
const PG_PREMIUM: Row[] = [
  ["Legal Practice", "LLM"],
  ["Master of Business Administration Global", "MBA"],
  ["Master of Business Administration Global (Financial Services)", "MBA"],
  ["Master of Business Administration Global (Hospitality Management)", "MBA"],
  ["Master of Business Administration Global (Human Resource Management)", "MBA"],
  ["Master of Business Administration Global (Operation and Supply Chain Management)", "MBA"],
  ["Master of Business Administration Global (Sales and Marketing)", "MBA"],
];

// No fee is published for the PGDip.
const PG_NO_PUBLISHED_FEE: Row[] = [
  ["Behaviour Analysis Supervised Practice", "PGDip"],
];

const RESEARCH_DEGREES: Row[] = [
  ["Doctor of Philosophy", "PhD"],
  ["Master of Philosophy", "MPhil"],
  ["Masters by Research", "MA/MSc"],
];

// No fee is published for the ACCA route.
const PROFESSIONAL: Row[] = [
  ["Association of Chartered Certified Accountants", "ACCA"],
];

const FEE = {
  ugBusinessCreative: 16800,
  ugScienceHealthEducation: 17200,
  pgStandard: 17900,
  pgPremium: 18970,
  research: 18970,
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

const money = (fee: number) => `£${fee.toLocaleString("en-GB")} / year`;

function courseDescription(name: string): string | null {
  if (name.includes("(including foundation year)")) {
    return "Includes an integrated foundation year before the degree years begin.";
  }
  if (name.includes("(Top-Up)")) {
    return "A top up degree for students who already hold a relevant qualification such as an HND or foundation degree.";
  }
  return null;
}

function buildCourses(): CourseRow[] {
  const out: CourseRow[] = [];

  const add = (level: string, fee: number | null, rows: Row[]) => {
    for (const [name, degree] of rows) {
      out.push({
        name,
        degree,
        level,
        duration: null,
        tuition: fee === null ? null : money(fee),
        intakes: null,
        description: courseDescription(name),
        order: out.length,
      });
    }
  };

  add("Undergraduate", FEE.ugBusinessCreative, UG_BUSINESS_CREATIVE);
  add("Undergraduate", FEE.ugScienceHealthEducation, UG_SCIENCE_HEALTH_EDUCATION);
  add("Undergraduate", null, UG_NO_PUBLISHED_FEE);
  add("Postgraduate", FEE.pgStandard, PG_STANDARD);
  add("Postgraduate", FEE.pgPremium, PG_PREMIUM);
  add("Postgraduate", null, PG_NO_PUBLISHED_FEE);
  add("Research", FEE.research, RESEARCH_DEGREES);
  add("Professional", null, PROFESSIONAL);

  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// SCHOLARSHIPS
// ─────────────────────────────────────────────────────────────────────────

const SCHOLARSHIP_PAGE = "https://www.southwales.ac.uk/international/fees-scholarships/international-scholarships/";

const scholarships = [
  {
    name: "Chancellor's International Development Scholarship",
    academicYear: "2026/27",
    description:
      "£2,500 per year for self funding undergraduate and postgraduate students from eligible regions, which include Africa, so Nigerian applicants qualify. It replaces the standard International Office Scholarship, is considered automatically when the application is received and is confirmed in the offer letter. Not available to HND or Foundation Degree students, sponsored students, or those on a placement year or English language programme.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "International Office Scholarship",
    academicYear: "2026/27",
    description:
      "Up to £1,500 for undergraduate students (including top ups) and up to £2,000 for postgraduate students who are self funding. Considered automatically with no separate application, and awarded for every year of study.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Early CAS Scholarship",
    academicYear: "2026/27",
    description:
      "An extra £500 on top of an existing USW scholarship for students who are CAS ready by 31 May for the September 2026 intake, or by 31 October for the January and February 2027 intake. CAS ready means the CAS Shield record is complete with all documents and the deposit has cleared.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Early Payment Discount",
    academicYear: null,
    description:
      "£300 off for self funding full time students who pay the balance of the year's course fee within 14 calendar days of the course start date shown in the offer letter.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Progression Fee Discount",
    academicYear: null,
    description:
      "£3,500 for self funding USW international graduates who completed a top up degree, or another undergraduate degree with at least one academic year of on campus study, and move on to a postgraduate course.",
    url: SCHOLARSHIP_PAGE,
  },
  {
    name: "Chevening Scholarships",
    academicYear: null,
    description:
      "The UK government's global scholarship programme. Awards cover tuition fees and living costs for a one year postgraduate course at USW, for applicants with leadership potential from more than 150 countries. Applications are made through Chevening, not USW.",
    url: "https://www.chevening.org",
  },
  {
    name: "Commonwealth Scholarships",
    academicYear: null,
    description:
      "For citizens of developing Commonwealth countries, which includes Nigeria. Covers airfare, full tuition fees and living costs, a thesis grant and a warm clothing allowance. Applications are made through the Commonwealth Scholarship Commission, not USW.",
    url: "https://cscuk.fcdo.gov.uk",
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