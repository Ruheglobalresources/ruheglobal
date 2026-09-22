// Seeds the Institution catalog with the first 20 partner institutions from
// src/data/institutions.ts. Each record uses the same flat shape as the
// Claude-powered school-search route (src/lib/school-search/schema.ts's
// RawSchool), so this data and a live AI search result render through the
// same ResultCard. Upserted by `slug`, so it's safe to re-run.
//
// Image URLs are never hand-typed — models and admins both hallucinate
// them — they're resolved live at seed time the same way
// src/lib/school-search/enrich.ts does it: a real campus photo from
// Wikipedia's page-image index, plus a favicon logo from Google's favicon
// service. Requires network access when you run this.
//
// Run with:  npm run seed:institutions

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Make sure it's in your .env file (or .env.local) at the project root."
  );
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

type SeedInstitution = {
  name: string;
  city?: string;
  country?: string;
  institutionType?: string;
  summary: string;
  programs?: string[];
  ieltsOverall?: number;
  ieltsMinBand?: number;
  ieltsAlternatives?: string[];
  ieltsNote?: string;
  tuitionMin?: number;
  tuitionMax?: number;
  tuitionCurrency?: string;
  tuitionPeriod?: string;
  tuitionNote?: string;
  ranking?: string;
  website?: string;
  /** Used only to resolve a real campus photo below — never stored as-is. */
  wikipediaTitle: string;
};

// First 20 names, in order, from the RAW_INSTITUTIONS partner list.
const INSTITUTIONS: SeedInstitution[] = [
  {
    name: "University of Exeter - Streatham Campus",
    city: "Exeter",
    country: "United Kingdom",
    institutionType: "Public research university (Russell Group)",
    summary:
      "Russell Group university whose main Streatham Campus in Exeter, Devon houses most science, business and social-science departments.",
    programs: ["MSc Finance", "MSc International Business", "BA Politics and International Relations"],
    ieltsOverall: 6.5,
    ieltsMinBand: 6,
    ieltsAlternatives: ["TOEFL iBT 88", "PTE 62"],
    tuitionMin: 24000,
    tuitionMax: 29500,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Varies by programme; laboratory-based courses cost more",
    ranking: "QS World Top 200",
    website: "https://www.exeter.ac.uk",
    wikipediaTitle: "University of Exeter",
  },
  {
    name: "Navitas Group - Western Sydney University International College",
    city: "Parramatta, Sydney",
    country: "Australia",
    institutionType: "Pathway college (Navitas), linked to Western Sydney University",
    summary:
      "Navitas-operated international college on Western Sydney University's Parramatta campus, offering diplomas and foundation programmes that lead directly into WSU bachelor's degrees.",
    programs: [
      "Diploma in Business",
      "Diploma in Information and Communications Technology",
      "Foundation Studies Program in Health Science and Nursing",
    ],
    ieltsOverall: 5.5,
    ieltsMinBand: 5,
    ieltsAlternatives: ["PTE Academic 50"],
    ieltsNote: "Requirements are higher for health-related diplomas leading to bachelor's degrees",
    tuitionNote: "Fees follow WSU's published international pathway fee schedule",
    website: "https://internationalcollege.westernsydney.edu.au",
    wikipediaTitle: "Western Sydney University",
  },
  {
    name: "Colorado State University",
    city: "Fort Collins",
    country: "United States",
    institutionType: "Public research university",
    summary:
      "Land-grant research university in Fort Collins, Colorado with recognised strengths in engineering, veterinary medicine, atmospheric science and business.",
    programs: ["MS Computer Science", "MBA", "MS Civil Engineering"],
    ieltsOverall: 6.5,
    ieltsMinBand: 6,
    ieltsAlternatives: ["TOEFL iBT 79", "Duolingo English Test 105"],
    tuitionMin: 27000,
    tuitionMax: 31000,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year",
    tuitionNote: "Graduate tuition varies by college and programme",
    website: "https://www.colostate.edu",
    wikipediaTitle: "Colorado State University",
  },
  {
    name: "University of Surrey",
    city: "Guildford",
    country: "United Kingdom",
    institutionType: "Public research university",
    summary:
      "Research-intensive university in Guildford known for engineering, computer science and a sandwich-year placement scheme with strong graduate employment outcomes.",
    programs: ["MSc Data Science", "MSc Electronic Engineering", "MSc International Hotel and Tourism Management"],
    ieltsOverall: 6.5,
    ieltsMinBand: 6,
    ieltsAlternatives: ["TOEFL iBT 88", "PTE 62"],
    tuitionMin: 25000,
    tuitionMax: 31000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2025/26)",
    ranking: "QS World Top 300",
    website: "https://www.surrey.ac.uk",
    wikipediaTitle: "University of Surrey",
  },
  {
    name: "Navitas Group - Hertfordshire International College (HIC) at University of Hertfordshire",
    city: "Hatfield",
    country: "United Kingdom",
    institutionType: "Pathway college (Navitas), linked to University of Hertfordshire",
    summary:
      "Navitas college on the University of Hertfordshire's College Lane campus in Hatfield, delivering foundation and pre-master's programmes that progress into UH degrees, 25 minutes from London by train.",
    programs: [
      "University Foundation in Business and Economics",
      "Pre-Masters in Business",
      "University Foundation in Computer Science, Cyber Security and Data Science",
    ],
    ieltsOverall: 5.5,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE Academic 59", "TOEFL 49"],
    tuitionMin: 11025,
    tuitionMax: 15225,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per pathway programme",
    tuitionNote: "1-semester vs 2-semester Pre-Masters in Business, indicative",
    website: "https://www.herts.ac.uk",
    wikipediaTitle: "University of Hertfordshire",
  },
  {
    name: "Navitas Group - International College Portsmouth (ICP) at University of Portsmouth",
    city: "Portsmouth",
    country: "United Kingdom",
    institutionType: "Pathway college (Navitas), linked to University of Portsmouth",
    summary:
      "Navitas pathway college based at the University of Portsmouth, preparing international students for undergraduate and postgraduate entry through foundation and pre-master's routes.",
    programs: ["International Foundation Programme", "Pre-Masters Programme", "International Year One"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 51"],
    website: "https://www.port.ac.uk",
    wikipediaTitle: "University of Portsmouth",
  },
  {
    name: "TAFE NSW",
    city: "Sydney (statewide)",
    country: "Australia",
    institutionType: "Public vocational education (TAFE)",
    summary:
      "New South Wales' public vocational education provider, delivering certificate, diploma and advanced-diploma qualifications across trades, business, IT, hospitality and creative industries at campuses statewide.",
    programs: ["Diploma of Information Technology", "Diploma of Hospitality Management", "Advanced Diploma of Business"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5,
    ieltsAlternatives: ["PTE 42"],
    tuitionMin: 8000,
    tuitionMax: 16000,
    tuitionCurrency: "AUD",
    tuitionPeriod: "per year",
    tuitionNote: "Varies widely by course",
    website: "https://www.tafensw.edu.au",
    wikipediaTitle: "TAFE NSW",
  },
  {
    name: "Navitas Group - Birmingham City University International College (BCUIC)",
    city: "Birmingham",
    country: "United Kingdom",
    institutionType: "Pathway college (Navitas), linked to Birmingham City University",
    summary:
      "Navitas college on Birmingham City University's City Centre campus, offering foundation, international year one and pre-master's pathways, including a foundation route into adult nursing.",
    programs: ["International Foundation Programme", "International Year One Business", "Pre-Masters Programme"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5,
    ieltsAlternatives: ["PTE 42"],
    website: "https://www.bcu.ac.uk",
    wikipediaTitle: "Birmingham City University",
  },
  {
    name: "Navitas Group - Keele University International College",
    city: "Keele, Staffordshire",
    country: "United Kingdom",
    institutionType: "Pathway college (Navitas), linked to Keele University",
    summary:
      "Navitas college on Keele University's single-site campus in Staffordshire, running foundation and first-year pathways into Keele's science, business and health degrees.",
    programs: ["International Foundation Year", "International Year One", "Pre-Masters Programme"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5,
    website: "https://www.keele.ac.uk",
    wikipediaTitle: "Keele University",
  },
  {
    name: "Glasgow Caledonian University (GCU) - Glasgow",
    city: "Glasgow",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "Modern university in central Glasgow with particular strength in nursing, the built environment and business, and a strong focus on graduate employability.",
    programs: ["MSc International Business Management", "MSc Construction Project Management", "BSc Adult Nursing"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["TOEFL iBT 78", "PTE 56"],
    tuitionMin: 16500,
    tuitionMax: 18000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.gcu.ac.uk",
    wikipediaTitle: "Glasgow Caledonian University",
  },
  {
    name: "University of Sunderland - Sunderland Campus",
    city: "Sunderland",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "North-East England university with a compact city campus, known for comparatively lower international tuition alongside strong pathway and foundation provision.",
    programs: ["MSc International Business Management", "MSc Computer Science", "BA Business Studies"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 51", "TOEFL iBT 78"],
    tuitionMin: 15500,
    tuitionMax: 17000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.sunderland.ac.uk",
    wikipediaTitle: "University of Sunderland",
  },
  {
    name: "Navitas Group - Curtin College",
    city: "Bentley, Perth",
    country: "Australia",
    institutionType: "Pathway college (Navitas), linked to Curtin University",
    summary:
      "Navitas college on Curtin University's Bentley campus in Perth, delivering diploma and foundation pathways with guaranteed progression into Curtin bachelor's degrees.",
    programs: ["Diploma of Commerce", "Diploma of Engineering", "Foundation Program"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5,
    ieltsAlternatives: ["PTE 42"],
    website: "https://curtincollege.edu.au",
    wikipediaTitle: "Curtin University",
  },
  {
    name: "Navitas Group - Brunel University London Pathway College",
    city: "Uxbridge, London",
    country: "United Kingdom",
    institutionType: "Pathway college (Navitas), linked to Brunel University London",
    summary:
      "Navitas pathway college on Brunel University London's Uxbridge campus, offering foundation and international year one routes into Brunel's engineering, business and science degrees.",
    programs: ["International Foundation Programme", "International Year One Engineering", "Pre-Masters Programme"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5,
    website: "https://www.brunel.ac.uk",
    wikipediaTitle: "Brunel University London",
  },
  {
    name: "University of Massachusetts Dartmouth",
    city: "North Dartmouth, Massachusetts",
    country: "United States",
    institutionType: "Public university",
    summary:
      "Public research university in southeastern Massachusetts, part of the UMass system, with recognised programmes in marine science, engineering and design.",
    programs: ["MS Computer Science", "MBA", "BFA Textile Design and Fashion"],
    ieltsOverall: 6.5,
    ieltsMinBand: 6,
    ieltsAlternatives: ["TOEFL iBT 79", "Duolingo English Test 105"],
    tuitionMin: 20000,
    tuitionMax: 24000,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year",
    tuitionNote: "Non-resident/international rate, indicative",
    website: "https://www.umassd.edu",
    wikipediaTitle: "University of Massachusetts Dartmouth",
  },
  {
    name: "University of Exeter - Penryn Campus",
    city: "Penryn, Cornwall",
    country: "United Kingdom",
    institutionType: "Public research university (Russell Group)",
    summary:
      "University of Exeter's Cornwall campus, shared with Falmouth University, specialising in environmental science, geography, ecology and renewable energy engineering.",
    programs: ["BSc Environmental Science", "MSc Conservation and Biodiversity", "BEng Renewable Energy Engineering"],
    ieltsOverall: 6.5,
    ieltsMinBand: 6,
    ieltsAlternatives: ["TOEFL iBT 88", "PTE 62"],
    tuitionMin: 23000,
    tuitionMax: 27000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2025/26)",
    ranking: "QS World Top 200",
    website: "https://www.exeter.ac.uk/cornwall",
    wikipediaTitle: "University of Exeter",
  },
  {
    name: "Navitas Group - Queens College, City University of New York",
    city: "Flushing, Queens, New York City",
    country: "United States",
    institutionType: "Pathway college (Navitas), linked to Queens College, CUNY",
    summary:
      "Navitas-supported international pathway based at Queens College, part of the City University of New York system in Flushing, easing entry into CUNY bachelor's degrees.",
    programs: ["Academic English Pathway", "International Year One", "Pre-Undergraduate Pathway"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5,
    website: "https://www.qc.cuny.edu",
    wikipediaTitle: "Queens College, City University of New York",
  },
  {
    name: "California State University San Marcos",
    city: "San Marcos, California",
    country: "United States",
    institutionType: "Public university",
    summary:
      "Public university in northern San Diego County, part of the Cal State system, with a focus on business, education and health sciences within a close-knit undergraduate community.",
    programs: ["MBA", "MS Computer Science", "BS Business Administration"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["TOEFL iBT 61", "Duolingo English Test 95"],
    tuitionMin: 17000,
    tuitionMax: 19500,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year",
    tuitionNote: "Non-resident/international rate, indicative",
    website: "https://www.csusm.edu",
    wikipediaTitle: "California State University San Marcos",
  },
  {
    name: "Navitas Group - International College of Manitoba",
    city: "Winnipeg, Manitoba",
    country: "Canada",
    institutionType: "Pathway college (Navitas), linked to University of Manitoba",
    summary:
      "Navitas college on the University of Manitoba's Fort Garry campus in Winnipeg, offering university-transfer and foundation programmes leading into UM degrees.",
    programs: ["University Transfer Program", "Foundation Program", "Pre-Masters Program"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5.5,
    website: "https://icm.navitas.com",
    wikipediaTitle: "University of Manitoba",
  },
  {
    name: "University of New Brunswick - Fredericton Campus",
    city: "Fredericton",
    country: "Canada",
    institutionType: "Public research university",
    summary:
      "Canada's oldest English-language public university, with its main Fredericton campus known for engineering, forestry and computer science, and a three-year post-graduation work permit pathway.",
    programs: ["MSc Computer Science", "BScE Civil Engineering", "MBA"],
    ieltsOverall: 6.5,
    ieltsMinBand: 6,
    ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 18000,
    tuitionMax: 22000,
    tuitionCurrency: "CAD",
    tuitionPeriod: "per year",
    website: "https://www.unb.ca",
    wikipediaTitle: "University of New Brunswick",
  },
  {
    name: "University of Wollongong - Dubai Campus",
    city: "Dubai",
    country: "United Arab Emirates",
    institutionType: "Private international branch campus (University of Wollongong, Australia)",
    summary:
      "Dubai branch campus of Australia's University of Wollongong, teaching UOW-accredited business, IT, engineering and media degrees to a largely international student body in the UAE.",
    programs: ["Bachelor of Business", "Master of Information Technology", "Bachelor of Engineering (Electronics)"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["TOEFL iBT 65", "PTE 50"],
    tuitionMin: 45000,
    tuitionMax: 55000,
    tuitionCurrency: "AED",
    tuitionPeriod: "per year",
    website: "https://www.uowdubai.ac.ae",
    wikipediaTitle: "University of Wollongong in Dubai",
  },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

// ── Image resolution — same approach as src/lib/school-search/enrich.ts ──

const WIKI_ENDPOINT = "https://en.wikipedia.org/w/api.php";
const UA = "RuheGlobalInstitutionSeed/1.0 (https://www.ruhegr.com; institution catalog seed)";

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

function hostnameOf(website?: string): string | null {
  if (!website) return null;
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function faviconFor(website?: string): string | null {
  const host = hostnameOf(website);
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=128` : null;
}

async function main() {
  console.log(`Seeding ${INSTITUTIONS.length} institutions...`);

  for (const [i, inst] of INSTITUTIONS.entries()) {
    const slug = slugify(inst.name);
    const imageUrl = await fetchWikipediaImage(inst.wikipediaTitle);
    const logoUrl = faviconFor(inst.website);

    await db.institution.upsert({
      where: { slug },
      create: {
        name: inst.name,
        slug,
        city: inst.city ?? null,
        country: inst.country ?? null,
        institutionType: inst.institutionType ?? null,
        summary: inst.summary,
        programs: inst.programs ?? [],
        ieltsOverall: inst.ieltsOverall ?? null,
        ieltsMinBand: inst.ieltsMinBand ?? null,
        ieltsAlternatives: inst.ieltsAlternatives ?? [],
        ieltsNote: inst.ieltsNote ?? null,
        tuitionMin: inst.tuitionMin ?? null,
        tuitionMax: inst.tuitionMax ?? null,
        tuitionCurrency: inst.tuitionCurrency ?? null,
        tuitionPeriod: inst.tuitionPeriod ?? null,
        tuitionNote: inst.tuitionNote ?? null,
        ranking: inst.ranking ?? null,
        website: inst.website ?? null,
        imageUrl,
        logoUrl,
        order: i,
      },
      update: {
        city: inst.city ?? null,
        country: inst.country ?? null,
        institutionType: inst.institutionType ?? null,
        summary: inst.summary,
        programs: inst.programs ?? [],
        ieltsOverall: inst.ieltsOverall ?? null,
        ieltsMinBand: inst.ieltsMinBand ?? null,
        ieltsAlternatives: inst.ieltsAlternatives ?? [],
        ieltsNote: inst.ieltsNote ?? null,
        tuitionMin: inst.tuitionMin ?? null,
        tuitionMax: inst.tuitionMax ?? null,
        tuitionCurrency: inst.tuitionCurrency ?? null,
        tuitionPeriod: inst.tuitionPeriod ?? null,
        tuitionNote: inst.tuitionNote ?? null,
        ranking: inst.ranking ?? null,
        website: inst.website ?? null,
        imageUrl,
        logoUrl,
        order: i,
      },
    });

    console.log(`  ✓ ${inst.name}${imageUrl ? "" : " (no Wikipedia image found)"}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
