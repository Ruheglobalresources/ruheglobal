// prisma/seed-heriot-watt-school.ts
// Seeds Heriot-Watt University into the School table, with its courses and
// scholarship, using the details from the university's International Student
// Guide (PDF).
//
// Safe to run more than once:
//   the school is upserted by slug
//   courses and scholarships are deleted and recreated each run
//   gallery images are never touched, so anything uploaded in the admin stays
//   an existing coverImage or logoUrl is kept, so an uploaded cover survives
//
// Run with:  npm run seed:heriot-watt-school
// (add the script to package.json the same way seed:featured-institutions is)

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const SLUG = "heriot-watt-university";
const WEBSITE = "https://www.hw.ac.uk";

// Set this to a real image URL or path if you already have the cover uploaded.
// Left null, the script looks up a campus photo on Wikipedia as a placeholder.
const COVER_IMAGE_OVERRIDE: string | null = null;

// ─────────────────────────────────────────────────────────────────────────
// SCHOOL CONTENT
// Paragraphs are separated by a blank line, the same as the admin form.
// ─────────────────────────────────────────────────────────────────────────

const overview = [
  "Heriot-Watt University has been shaping futures since 1821. Its pioneering research and education has made a positive impact on the global stage, and it continues to push new frontiers in science, technology, engineering, business and design.",
  "The university has campuses in the UK, Dubai and Malaysia. In Scotland, students can study in Edinburgh, the Scottish Borders and Orkney. It is ranked 256th in the world, 32nd in the UK and 5th in Scotland (QS World University Rankings 2025), and is ranked 1st in the UK for producing CEOs, managing directors and entrepreneurs (Novuna 2023).",
].join("\n\n");

const services = [
  "Applications are made online, and the university aims to review and decide on all applications within 2 to 4 working days. Applicants must show English language proficiency, and most internationally recognised tests are accepted, including IELTS, PTE and TOEFL iBT.",
  "Global College offers full time Foundation, Bachelors Accelerator and Pre Masters programmes that prepare international students for progression to their chosen Heriot-Watt degree. Foundation entry starts at IELTS 5.0 overall with no score below 4.5 (SELT only) for the standard route, and IELTS 5.5 overall with no score below 5.5 for the accelerated route.",
  "Through Go Global, students can study for a semester, a year or longer at the Dubai or Malaysia campus. The university also has a dedicated regional team supporting applicants from Africa, Central Asia, MENA and Pakistan, Europe, China and India.",
].join("\n\n");

const accommodation = [
  "Heriot-Watt offers modern accommodation built to high standards in sustainable design and energy use. All on campus accommodation in Edinburgh and the Scottish Borders is ensuite, single occupancy and self catered. There is no on campus accommodation in Orkney, but staff will provide information to help students find somewhere suitable in the area.",
  "New full time students at the Edinburgh campus are guaranteed an offer of accommodation, on or off campus, in their first year if they join in September and apply before the deadline.",
  "Edinburgh campus: traditional ensuite room £182 per week and contemporary ensuite room in a flat £217 per week, both on 40 week contracts. Scottish Borders campus: standard bedroom £155 per week (40 or 50 weeks), deluxe room £166 per week (40 weeks) and studio £185 per week (40 or 50 weeks).",
].join("\n\n");

// Not in the guide. General description, please review before publishing.
const locationInfo = [
  "The main Scottish campus is in Edinburgh, the capital of Scotland. It is a compact, historic city known for its festivals, museums, castle and Old Town, with hills, parks and coastline close by.",
  "Students can also study at the Scottish Borders campus or in Orkney, and the university has further campuses in Dubai and Malaysia for those who want to study abroad within the Heriot-Watt network.",
].join("\n\n");

const highlights = [
  "Ranked 256th in the world, 32nd in the UK and 5th in Scotland (QS World University Rankings 2025)",
  "Top 18% of European universities (QS Europe Rankings 2025)",
  "Ranked 1st in the UK for producing CEOs, MDs and entrepreneurs (Novuna 2023)",
  "1st in Scotland and 2nd in the UK for undergraduate employability (Graduate Outcomes Survey 2024)",
];

// ─────────────────────────────────────────────────────────────────────────
// COURSES
// Each row: [name, degree, annual fee in GBP, duration?, description?]
// Duration is only set where the guide states it (the 2 year versions).
// Intakes are not in the guide for regular degrees, so they are left empty.
// ─────────────────────────────────────────────────────────────────────────

type Row = [name: string, degree: string, fee: number, duration?: string, description?: string];

const UG_STEM: Row[] = [
  ["Actuarial Science", "BSc", 25008],
  ["Actuarial Science and Diploma in Industrial Training", "BSc", 25008],
  ["Aerospace Engineering", "BEng/MEng", 25008],
  ["Architectural Engineering", "BEng/MEng", 19456],
  ["Biological Sciences", "BSc", 25008],
  ["Biology", "MBiol", 25008],
  ["Brewing and Distilling", "BSc", 25008],
  ["Brewing and Distilling and Diploma in Industrial Training", "BSc", 25008],
  ["Chemical Engineering", "BEng/MEng", 25008],
  ["Chemistry", "BSc/MChem", 25008, undefined, "Available with placement."],
  ["Civil Engineering", "BEng/MEng", 25008],
  [
    "Computer Science",
    "BSc",
    25008,
    undefined,
    "Options in Artificial Intelligence, Computer Games Programme, Cyber Security, Data Science and Software Engineering.",
  ],
  ["Computer Science (Data Science) and Diploma in Industrial Training", "BSc", 25008],
  ["Computer Science with Diploma in Industrial Training", "BSc", 25008],
  ["Computer Systems", "BSc", 25008, undefined, "Available with Computer Games Programme."],
  ["Computer Systems and Diploma in Industrial Training", "BSc", 25008],
  ["Construction Project Management", "BSc", 19456],
  ["Data Sciences", "BSc", 19456],
  ["Electrical and Electronic Engineering", "BEng/MEng", 25008],
  ["Engineering", "BEng", 25008],
  ["Financial Mathematics", "BSc", 19456],
  ["Games Development and Production", "BSc", 25008],
  ["Geography", "BSc/MA", 20536],
  ["Geography, Society and Environment", "BSc/MA", 20536],
  ["Master of Mathematics", "MMaths", 19456],
  ["Mathematical Physics", "BSc", 19456],
  ["Mathematical, Statistical and Actuarial Sciences", "BSc", 19456],
  ["Mathematical, Statistical and Actuarial Sciences with Diploma in Industrial Training", "BSc", 19456],
  ["Mathematics", "BSc", 19456, undefined, "Options in European Language, Computer Science and Finance."],
  ["Mathematics with Finance with Diploma in Industrial Training", "BSc", 19456],
  ["Mathematics with Statistics", "BSc", 19456],
  ["Mechanical Engineering", "BEng/MEng", 25008],
  ["Mechanical and Energy Engineering", "BEng/MEng", 25008],
  ["Physics", "BSc/MPhys", 25008],
  ["Quantity Surveying", "BSc", 19456],
  ["Robotics, Autonomous and Interactive Systems", "BEng/MEng", 25008],
  ["Statistical Data Science", "BSc", 19456],
  ["Structural Engineering", "BEng/MEng", 25008],
];

const UG_BUSINESS: Row[] = [
  ["Accountancy", "MA", 19456],
  ["Accountancy and Finance", "MA", 19456],
  ["Applied Modern Languages and Translating", "MA", 19456],
  ["Bachelor of Business Administration", "BBA", 19456],
  ["British Sign Language (Interpreting, Translating and Applied Language Studies)", "MA", 19456],
  ["Business and Finance", "MA", 19456],
  ["Economics", "MA", 20536],
  ["Economics and Business Management", "MA", 20536],
  ["Economics and Finance", "MA", 20536],
  ["Finance", "MA", 19456],
  ["International Business Management", "MA", 20536],
  ["Marketing", "MA", 19456],
  ["Modern Languages", "MA", 19456],
  ["Psychology", "BSc", 19456],
  ["Psychology with Marketing", "BSc", 19456],
  ["Psychology and Economics", "BSc", 19456],
  ["Psychology and Marketing", "BSc", 19456],
];

const UG_DESIGN: Row[] = [
  ["Communication Design", "BA", 19456],
  ["Design for Textiles", "BA", 19456, undefined, "Fashion, Interior and Art pathways."],
  ["Fashion", "BA", 19456],
  ["Fashion Branding and Promotion", "BA", 19456],
  ["Interior Design", "BA", 19456],
];

const PG_STEM: Row[] = [
  ["Actuarial Management", "MSc", 24176],
  ["Actuarial Management with Data Science", "MSc", 24176],
  ["Actuarial Science", "MSc", 24176],
  ["Actuarial Science and Management (2 years)", "MSc", 24176, "2 years"],
  ["Advanced Mechanical Engineering", "MSc", 28056],
  ["Advanced Mechanical Engineering with Industrial Application (2 years)", "MSc", 28056, "2 years"],
  ["Advanced Structural Engineering", "MSc", 25480],
  ["Analytical Sciences", "MSc", 25480],
  ["Applied Cyber Security", "MSc", 25480],
  ["Applied Mathematical Sciences", "MSc", 19816],
  ["Applied Mathematical Sciences (2 years)", "MSc", 19816, "2 years"],
  ["Applied Mathematical Sciences with Climate and Environmental Modelling", "MSc", 19816],
  ["Architecture", "MArch", 20536],
  ["Artificial Intelligence", "MSc", 25480],
  ["Artificial Intelligence (2 years)", "MSc", 25480, "2 years"],
  ["Brewing and Distilling", "MSc", 28056],
  ["Brewing and Distilling with Entrepreneurship", "MSc", 28056],
  ["Civil Engineering and Construction Management", "MSc", 25480],
  ["Civil Engineering with Industry Placement (2 years)", "MSc", 25480, "2 years"],
  ["Climate Change: Managing the Marine Environment", "MSc", 28056],
  ["Commercial Management and Quantity Surveying", "MSc", 19816],
  ["Commercial Management and Quantity Surveying with Industry Placement (2 years)", "MSc", 19816, "2 years"],
  ["Computational Mathematics and Data Analysis", "MSc", 19816],
  ["Computer Science for Cyber Security", "MSc", 25480],
  ["Construction Project Management", "MSc", 24176],
  ["Construction Project Management with Industry Placement (2 years)", "MSc", 24176, "2 years"],
  ["Data Science", "MSc", 25480],
  ["Data Science (2 years)", "MSc", 25480, "2 years"],
  ["Energy", "MSc", 28056],
  ["Energy with Entrepreneurship", "MSc", 25480],
  ["Food Process Engineering", "MSc", 25480],
  ["Games Design and Development", "MSc", 25480],
  ["Global Environmental Change and Policy", "MSc", 28056],
  ["Global Sustainability Engineering", "MSc", 25480],
  ["Global Sustainability Engineering with Industry Application (2 years)", "MSc", 25480, "2 years"],
  ["Imaging, Vision and High Performance Computing", "MSc", 37300],
  ["Information Technology (Business)", "MSc", 25480],
  ["Information Technology (Software Systems)", "MSc", 25480],
  ["International Marine Science", "MSc", 28056],
  ["Marine Renewable Energy", "MSc", 19816],
  ["Mathematics", "MSc", 19816],
  ["Mathematical Biology, Ecology and Medicine", "MSc", 19816],
  ["Petroleum Engineering", "MSc", 29960],
  ["Quantum Technologies", "MSc", 28056],
  ["Real Estate", "MSc", 19816],
  ["Renewable and Sustainable Energy Transition", "MSc", 19816],
  ["Renewable Energy Engineering", "MSc", 25480],
  ["Reservoir Evaluation and Management", "MSc", 29960],
  ["Robotics", "MSc", 28056],
  ["Robotics with Industrial Application (2 years)", "MSc", 28056, "2 years"],
  ["Software Engineering", "MSc", 25480],
  ["Spatial Planning and Real Estate Development", "MSc", 19816],
  ["Subsurface Energy Systems", "MSc", 29960],
  ["Toxicology", "MSc", 28056],
];

const PG_BUSINESS: Row[] = [
  ["Accountancy", "MSc", 21192],
  ["Applied Psychology", "MSc", 24176],
  ["Business Analytics and Consultancy", "MSc", 21192],
  ["Business Analytics and Consultancy with Advanced Practice (2 years)", "MSc", 21192, "2 years"],
  ["Business Psychology", "MSc", 21192],
  ["Business Psychology (with Coaching or Human Resource Management)", "MSc", 21192],
  ["Business Psychology with Intercultural Communication", "MSc", 21192],
  ["Business Strategy, Leadership and Change", "MSc", 21192],
  ["Chinese to English Translation and Interpreting", "MSc", 21192],
  ["Digital Marketing", "MSc", 24176],
  ["Digital Marketing with Advanced Practice (2 years)", "MSc", 24176, "2 years"],
  ["Economics, Banking and Finance", "MSc", 21192],
  ["Energy and Economics", "MSc", 21192],
  ["Finance", "MSc", 21192],
  ["Finance and Management", "MSc", 24176],
  ["Human Resource Management", "MSc", 24176],
  ["Intercultural Business Communication", "MSc", 21192],
  ["International Accounting and Finance", "MSc", 21192],
  ["International Banking and Finance", "MSc", 21192],
  ["International Business Management", "MSc", 24176],
  ["International Business Management with Advanced Practice (2 years)", "MSc", 24176, "2 years"],
  ["International Marketing", "MSc", 24176],
  ["International Marketing with Consumer Psychology", "MSc", 24176],
  ["International Sports Management", "MSc", 21192],
  ["Interpreting", "MSc", 21192],
  ["Interpreting and Translating", "MSc", 21192],
  ["Investment Management", "MSc", 21192],
  ["Logistics and Supply Chain Management", "MSc", 28056],
  ["Operations Management", "MSc", 21192],
  ["Social and Behavioural Research Methods", "MSc", 21192],
  ["Sport Psychology", "MSc", 24176],
  ["Strategic Project Management", "MSc", 24176],
  ["Sustainable Finance with FinTech", "MSc", 21192],
];

const PG_DESIGN: Row[] = [
  ["Digital Design and Innovation", "MA", 19816],
  ["Design Management", "MSc", 19816],
  ["Interior Architecture and Design", "MA", 19816],
  ["Fashion and Textiles Design", "MA", 19816],
  ["Fashion and Textiles Design with Industry Placement (2 years)", "MA", 19816, "2 years"],
  ["Fashion and Textiles Management", "MSc", 19816],
];

// Global College pathway programmes. These are the only courses with
// intakes stated in the guide, and no fee is given for them.
const GLOBAL_COLLEGE = [
  {
    name: "Foundation (Standard)",
    degree: "Foundation",
    duration: "1 year, then a 3 year degree",
    intakes: "September, January, May",
    description:
      "One year standalone Foundation followed by three years of degree study. Pathways: Science; Accounting and Finance or Business; Psychology; Computer Science and Mathematics. IELTS 5.0 overall with no score below 4.5 (SELT only).",
  },
  {
    name: "Foundation (Accelerated)",
    degree: "Foundation",
    duration: "4 years combined",
    intakes: "September, January, May",
    description:
      "Combined four year route. Pathways: Accounting and Finance, Business Management; Psychology; Technology (Computer Science); Science (Mathematics, Physics, Chemistry); Engineering. IELTS 5.5 overall with no score below 5.5 (SELT or non SELT accepted).",
  },
  {
    name: "Pre Masters (Standard)",
    degree: "Pre Masters",
    duration: "1 year Pre Masters, then 1 year MSc",
    intakes: "September",
    description:
      "Pathways to MSc Business Analytics and Consultancy, International Business Management, Strategic Project Management and Human Resource Management. IELTS 5.5 overall with no score below 5.5.",
  },
  {
    name: "Pre Masters (Accelerated)",
    degree: "Pre Masters",
    duration: "1 semester, then 1 year",
    intakes: "September, January",
    description:
      "Pathways to MSc Business Analytics and Consultancy, International Business Management, Strategic Project Management, Human Resource Management, Design Management and Fashion and Textiles Management, and to MA Digital Design and Innovation, Fashion and Textiles Design (also with Industry Placement) and Interior Architecture and Design. IELTS 6.0 overall with no score below 5.5.",
  },
];

const money = (fee: number) => `£${fee.toLocaleString("en-GB")} / year`;

function buildCourses() {
  const out: {
    name: string;
    degree: string;
    level: string;
    duration: string | null;
    tuition: string | null;
    intakes: string | null;
    description: string | null;
    order: number;
  }[] = [];

  const add = (level: string, rows: Row[]) => {
    for (const [name, degree, fee, duration, description] of rows) {
      out.push({
        name,
        degree,
        level,
        duration: duration ?? null,
        tuition: money(fee),
        intakes: null,
        description: description ?? null,
        order: out.length,
      });
    }
  };

  // Pathway programmes first, then the degrees.
  for (const g of GLOBAL_COLLEGE) {
    out.push({
      name: g.name,
      degree: g.degree,
      level: "Pathway",
      duration: g.duration,
      tuition: null,
      intakes: g.intakes,
      description: g.description,
      order: out.length,
    });
  }

  add("Undergraduate", UG_STEM);
  add("Undergraduate", UG_BUSINESS);
  add("Undergraduate", UG_DESIGN);
  add("Postgraduate", PG_STEM);
  add("Postgraduate", PG_BUSINESS);
  add("Postgraduate", PG_DESIGN);

  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// IMAGES
// Same lookup approach as seed-featured-institutions.ts. These are only
// placeholders: replace the cover and logo from the admin edit page with
// the official files.
// ─────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding Heriot-Watt University...");

  const existing = await db.school.findUnique({ where: { slug: SLUG } });

  const coverImage =
    COVER_IMAGE_OVERRIDE ?? existing?.coverImage ?? (await fetchWikipediaImage("Heriot-Watt University"));

  if (!coverImage) {
    throw new Error(
      "No cover image found. Set COVER_IMAGE_OVERRIDE at the top of this file to an image URL or path, then run again."
    );
  }

  const logoUrl = existing?.logoUrl ?? faviconFor(WEBSITE);

  const data = {
    name: "Heriot-Watt University",
    country: "United Kingdom", // must match a name in COUNTRIES
    city: "Edinburgh",
    founded: 1821,
    ranking: "QS #256 World (2025)",
    famousFor: "Engineering, Actuarial Science, Business, Design",
    acceptanceRate: null,
    tuitionFrom: 19456,
    tuitionTo: 37300,
    tuitionCurrency: "GBP",
    website: WEBSITE,
    description:
      "A Scottish university with campuses in Edinburgh, the Scottish Borders and Orkney, known for engineering, business, actuarial science and design, and ranked 256th in the world by QS 2025.",
    overview,
    services,
    accommodation,
    locationInfo,
    highlights,
    coverImage,
    coverImageAlt: "Heriot-Watt University campus",
    logoUrl,
    metaTitle: "Study at Heriot-Watt University, UK | Ruhe Global Resources",
    metaDescription:
      "Explore Heriot-Watt University in Edinburgh, UK. Compare undergraduate and postgraduate courses, tuition fees, scholarships and accommodation, then apply with RGR.",
    isActive: true,
    order: 0,
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
    db.schoolScholarship.create({
      data: {
        schoolId: school.id,
        name: "International Merit Scholarship",
        academicYear: null,
        description:
          "Funding for undergraduate and postgraduate international students. Awards range from £1,500 up to £5,000.",
        url: "https://www.hw.ac.uk/scholarships",
        order: 0,
      },
    }),
  ]);

  console.log(`  Done: ${school.name}`);
  console.log(`  ${courses.length} courses, 1 scholarship`);
  console.log(`  Page: /schools/${SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());