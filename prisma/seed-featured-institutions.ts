//prisma/seed-featured-institutions.ts
// Seeds the 12 main partner institutions that should appear on the
// course-search page by default — before a visitor has run any search —
// as a fixed "our partners" set. Marked isFeatured: true with order 0-11
// so they sort first wherever the Institution table is queried, and
// separately queryable as `where: { isFeatured: true }`.
//
// Same upsert-by-slug / live-image-lookup approach as seed-institutions.ts
// — see that file for the fuller explanation of the image resolution.
//
// Run with:  npm run seed:featured-institutions

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

// The 12 main partner schools, in the order given, shown first by default.
const FEATURED_INSTITUTIONS: SeedInstitution[] = [
  {
    name: "University of Northampton",
    city: "Northampton",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "Public university based at the award-winning Waterside Campus in Northampton, known for social enterprise, healthcare and business programmes with strong employer links.",
    programs: ["MSc International Business Management", "MSc Cyber Security", "BA Business and Human Resource Management"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 51", "TOEFL iBT 72"],
    tuitionMin: 15000,
    tuitionMax: 16500,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.northampton.ac.uk",
    wikipediaTitle: "University of Northampton",
  },
  {
    name: "University of South Wales",
    city: "Pontypridd / Cardiff / Newport",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "Wales' largest modern university, formed from the merger of the University of Glamorgan and University of Wales, Newport, with campuses across South Wales and strong computing, business and policing programmes.",
    programs: ["MSc Computing", "MBA", "BA Business Management"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 55"],
    tuitionMin: 14500,
    tuitionMax: 16000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.southwales.ac.uk",
    wikipediaTitle: "University of South Wales",
  },
  {
    name: "Coventry University",
    city: "Coventry",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "Large modern university in the West Midlands known for engineering, health sciences and one of the UK's most international student populations, with a wider network of UK campuses.",
    programs: ["MSc Cyber Security", "MSc International Business", "BEng Automotive Engineering"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 53", "TOEFL iBT 72"],
    tuitionMin: 16800,
    tuitionMax: 18500,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.coventry.ac.uk",
    wikipediaTitle: "Coventry University",
  },
  {
    name: "Edge Hill University",
    city: "Ormskirk, Lancashire",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "Public university in Lancashire particularly well regarded for teacher training, nursing and health sciences, on a compact single campus.",
    programs: ["MSc Computer Science", "MA Education", "BSc Adult Nursing"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 51"],
    tuitionMin: 14500,
    tuitionMax: 16000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.edgehill.ac.uk",
    wikipediaTitle: "Edge Hill University",
  },
  {
    name: "University of Bradford",
    city: "Bradford, West Yorkshire",
    country: "United Kingdom",
    institutionType: "Public research university",
    summary:
      "Research university in West Yorkshire known for engineering, pharmacy, peace studies and management, with a triple-accredited management school.",
    programs: ["MSc Data Science", "MBA", "MEng Mechanical Engineering"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 55", "TOEFL iBT 78"],
    tuitionMin: 17500,
    tuitionMax: 20000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.bradford.ac.uk",
    wikipediaTitle: "University of Bradford",
  },
  {
    name: "Anglia Ruskin University",
    city: "Cambridge / Chelmsford",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "Public university with main campuses in Cambridge and Chelmsford, known for nursing, allied health and business programmes and a large international student community.",
    programs: ["MSc International Business and Management", "MA Marketing", "BSc Computing"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 55"],
    tuitionMin: 15000,
    tuitionMax: 16500,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://aru.ac.uk",
    wikipediaTitle: "Anglia Ruskin University",
  },
  {
    name: "Nottingham Trent University",
    city: "Nottingham",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "One of the UK's largest modern universities, consistently rated highly for teaching quality and student experience across business, law, art and design and the sciences.",
    programs: ["MSc International Business", "LLM International Commercial Law", "BA Fashion Design"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 56", "TOEFL iBT 78"],
    tuitionMin: 16750,
    tuitionMax: 18500,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.ntu.ac.uk",
    wikipediaTitle: "Nottingham Trent University",
  },
  {
    name: "Arden University",
    city: "Coventry",
    country: "United Kingdom",
    institutionType: "Private university (Global University Systems)",
    summary:
      "Private UK university offering flexible on-campus, blended and fully online degrees, popular for accelerated business, law and health and social care programmes at UK study centres including Birmingham, Manchester and London.",
    programs: ["MBA (Online)", "BA (Hons) Business Studies", "LLB (Hons) Law"],
    ieltsOverall: 5.5,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 51"],
    tuitionMin: 7500,
    tuitionMax: 9500,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    tuitionNote: "Online/blended programmes are typically cheaper than on-campus equivalents",
    website: "https://arden.ac.uk",
    wikipediaTitle: "Arden University",
  },
  {
    name: "Heriot-Watt University",
    city: "Edinburgh",
    country: "United Kingdom",
    institutionType: "Public research university",
    summary:
      "Scottish research university strong in engineering, science, business and design, with its main campus in Edinburgh and additional campuses in Dubai and Malaysia.",
    programs: ["MSc Data Science", "MSc Actuarial Science", "MBA"],
    ieltsOverall: 6.5,
    ieltsMinBand: 6,
    ieltsAlternatives: ["PTE 59", "TOEFL iBT 92"],
    tuitionMin: 20500,
    tuitionMax: 24000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    ranking: "QS World Top 300",
    website: "https://www.hw.ac.uk",
    wikipediaTitle: "Heriot-Watt University",
  },
  {
    name: "BPP University",
    city: "London",
    country: "United Kingdom",
    institutionType: "Private university",
    summary:
      "Private UK university specialising in law, business, accounting and healthcare, closely linked to professional qualifications such as the SQE, ACCA and CIMA, with centres across the UK.",
    programs: ["LLM", "MSc Data Analytics", "MBA"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 55"],
    tuitionMin: 13000,
    tuitionMax: 16000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.bpp.com",
    wikipediaTitle: "BPP University",
  },
  {
    name: "University of East London",
    city: "London",
    country: "United Kingdom",
    institutionType: "Public modern university",
    summary:
      "Public university with campuses in Docklands and Stratford in East London, known for its diverse student body and programmes in business, computing, architecture and health sciences.",
    programs: ["MSc Cyber Security", "MA International Business Management", "BSc Computer Science"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 51"],
    tuitionMin: 15000,
    tuitionMax: 16500,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.uel.ac.uk",
    wikipediaTitle: "University of East London",
  },
  {
    name: "University of Portsmouth",
    city: "Portsmouth",
    country: "United Kingdom",
    institutionType: "Public research university",
    summary:
      "Public university on England's south coast known for pharmacy, criminology, computer science and marine and maritime studies, with strong graduate employment outcomes.",
    programs: ["MSc Computer Science", "LLM International Law", "BSc Criminology and Criminal Justice"],
    ieltsOverall: 6,
    ieltsMinBand: 5.5,
    ieltsAlternatives: ["PTE 59", "TOEFL iBT 78"],
    tuitionMin: 17200,
    tuitionMax: 18700,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year",
    website: "https://www.port.ac.uk",
    wikipediaTitle: "University of Portsmouth",
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
  console.log(`Seeding ${FEATURED_INSTITUTIONS.length} featured partner institutions...`);

  for (const [i, inst] of FEATURED_INSTITUTIONS.entries()) {
    const slug = slugify(inst.name);
    const imageUrl = await fetchWikipediaImage(inst.wikipediaTitle);
    const logoUrl = faviconFor(inst.website);

    const data = {
      name: inst.name,
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
      isActive: true,
      isFeatured: true,
      order: i, // 0-11, keeps them first and in the given order
    };

    await db.institution.upsert({
      where: { slug },
      create: { ...data, slug },
      update: data,
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
