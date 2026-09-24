// prisma/seed-institutions-batch-08.ts
//
// Batch 8: positions 621-720 of src/data/institutions.ts's RAW_INSTITUTIONS
// list (1-20 => seed-institutions.ts, 21-120 minus the featured Coventry
// entry => seed-institutions-batch-02.ts, 12 partner schools =>
// seed-featured-institutions.ts, 121-220 => seed-institutions-batch-03.ts,
// 221-320 => seed-institutions-batch-04.ts, 321-420 =>
// seed-institutions-batch-05.ts, 421-520 => seed-institutions-batch-06.ts,
// 521-620 => seed-institutions-batch-07.ts). Matches the current
// Institution model.
//
// NOTE ON BATCH 7: three School District 43 Coquitlam entries were
// accidentally dropped from seed-institutions-batch-07.ts (Heritage Woods
// Secondary, Hillcrest Middle, and Kwayhquitlum Middle — 97 institutions
// were seeded there instead of 100). Not included in this file since it
// covers 621-720; flag if you'd like a small patch file for those three.
//
// ── Image resolution (upgraded this batch) ──
//
// Batches 1-7 looked up exactly one Wikipedia query per institution
// (usually its own name) and used whatever thumbnail came back — for a
// generic or ambiguous name (e.g. a placeholder like "Excelsior School"
// with no confirmed real-world match) that search can just as easily
// land on an unrelated person's Wikipedia page and grab a portrait
// instead of a campus photo. This batch tightens that up:
//   1. The primary query still leans on `wikipediaTitle`, but the
//      fallback query now appends city + country (e.g. "Foxcroft
//      Academy Dover-Foxcroft, Maine United States") instead of retrying
//      the bare name, which disambiguates same-named subjects better.
//   2. Institutions marked `skipImageLookup: true` — the handful in this
//      batch identified only as "could not confirm with confidence"
//      (AHA International School, Excelsior School, Elite Preparatory
//      Academy) — never call the image API at all, since any hit for an
//      unconfirmed name is as likely to be wrong as right. They're
//      seeded with imageUrl left null rather than guessed.
// This still can't guarantee every photo is the right campus (Wikipedia
// coverage of small private schools is thin), but it should meaningfully
// cut down on people-photos-for-schools.
//
// ── A note on data confidence (read this before trusting a number) ──
//
// Same caveat as batches 4-7: nothing here was checked against a live
// source in this pass. Every field is either general knowledge of the
// institution or a reasoned typical-band estimate. Re-verify before this
// reaches a prospective student.
//
// This batch is dominated by private K-12 US boarding/day schools —
// roughly two-thirds of the 100 entries — mostly real, identifiable
// schools (Cushing Academy, Fork Union Military Academy, Cranbrook
// Schools, etc.), each assigned a tuition band by category (elite New
// England boarding prep, military academy, Christian day school, girls'
// school, etc.) rather than an individually verified figure. Several
// appear twice under different placement-network names for the same
// physical school — same pattern as batches 6-7: Annie Wright Schools,
// Archbishop Riordan High School, Besant Hill School, Erie First
// Christian Academy, Fountain Valley School (Colorado), Fryeburg
// Academy, and Houghton Academy are each seeded once per network name
// here, sharing identical data. Worth de-duplicating at the product
// layer if a single school shouldn't appear twice in results.
//
// Run with:  npx tsx prisma/seed-institutions-batch-08.ts

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set.");
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
  /** Used only to resolve a real campus photo — never stored as-is. */
  wikipediaTitle: string;
  /** Skip the Wikipedia image lookup entirely for unconfirmed names. */
  skipImageLookup?: boolean;
};

const INSTITUTIONS: SeedInstitution[] = [
  {
    name: "South East Technological University - Dublin Campus",
    city: "Dublin",
    country: "Ireland",
    institutionType: "Public technological university",
    summary: "A Dublin-area presence of South East Technological University, offering business, engineering and applied social studies programmes.",
    programs: ["Business", "Engineering", "Applied Social Studies"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 80", "PTE 59"],
    tuitionMin: 12500, tuitionMax: 16000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.setu.ie",
    wikipediaTitle: "South East Technological University",
  },
  {
    name: "South University - Austin Campus",
    city: "Austin, Texas",
    country: "United States",
    institutionType: "Private university (health-sciences focused)",
    summary: "South University's Austin campus, offering nursing, physician assistant and business programmes.",
    programs: ["Nursing", "Physician Assistant Studies", "Business Administration"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.southuniversity.edu",
    wikipediaTitle: "South University",
  },
  {
    name: "South University - Tampa Campus",
    city: "Tampa, Florida",
    country: "United States",
    institutionType: "Private university (health-sciences focused)",
    summary: "South University's Tampa campus, offering nursing, physician assistant and business programmes.",
    programs: ["Nursing", "Physician Assistant Studies", "Business Administration"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.southuniversity.edu",
    wikipediaTitle: "South University",
  },
  {
    name: "Southern Institute of Technology - Telford Campus",
    city: "Balclutha",
    country: "New Zealand",
    institutionType: "Public institute of technology (agriculture-focused)",
    summary: "SIT's Telford campus, New Zealand's specialist agricultural training campus, offering agriculture and veterinary nursing programmes.",
    programs: ["Agriculture", "Veterinary Nursing"],
    ieltsOverall: 6, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 80", "PTE 58"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.sit.ac.nz",
    wikipediaTitle: "Southern Institute of Technology",
  },
  {
    name: "The Newman School via ABC Education Group",
    city: "Boston, Massachusetts",
    country: "United States",
    institutionType: "Private Catholic day and boarding school (via ABC Education Group)",
    summary: "A small private Catholic day and boarding school in Boston, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 22000, tuitionMax: 42000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.thenewmanschool.org",
    wikipediaTitle: "The Newman School",
  },
  {
    name: "Thompson Rivers University - Williams Lake",
    city: "Williams Lake, British Columbia",
    country: "Canada",
    institutionType: "Public university regional campus",
    summary: "TRU's Williams Lake regional campus, offering business, trades and university-transfer programmes.",
    programs: ["Business", "Trades Foundation", "University Transfer"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 20000, tuitionMax: 25000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.tru.ca",
    wikipediaTitle: "Thompson Rivers University",
  },
  {
    name: "University for the Creative Arts - Rochester Campus",
    city: "Rochester",
    country: "United Kingdom",
    institutionType: "Public specialist creative-arts university",
    summary: "UCA's Rochester campus, offering degrees in animation, photography and architecture.",
    programs: ["Animation", "Photography", "Architecture"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 16500, tuitionMax: 18500, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://www.uca.ac.uk",
    wikipediaTitle: "University for the Creative Arts",
  },
  {
    name: "University of Canberra - Sydney Hills Campus Via Education Centre of Australia (ECA) Group",
    city: "Sydney",
    country: "Australia",
    institutionType: "University branch delivery (via Education Centre of Australia)",
    summary: "University of Canberra business and nursing programmes delivered in Sydney's Hills district through the Education Centre of Australia.",
    programs: ["Business", "Nursing"],
    ieltsOverall: 5.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 22000, tuitionMax: 27000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.canberra.edu.au",
    wikipediaTitle: "University of Canberra",
  },
  {
    name: "University of Chester - University Centre Birkenhead",
    city: "Birkenhead",
    country: "United Kingdom",
    institutionType: "Public university satellite campus",
    summary: "University of Chester's Birkenhead campus, offering business, health and social care, and computing degrees.",
    programs: ["Business", "Health and Social Care", "Computing"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 14000, tuitionMax: 16000, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://www.chester.ac.uk",
    wikipediaTitle: "University of Chester",
  },
  {
    name: "University of Leicester",
    city: "Leicester",
    country: "United Kingdom",
    institutionType: "Public research university",
    summary: "A well-established English research university known for medicine, law and genetics (site of the discovery of genetic fingerprinting).",
    programs: ["Medicine", "Law", "Genetics"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 90", "PTE 62"],
    tuitionMin: 20000, tuitionMax: 25000, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://le.ac.uk",
    wikipediaTitle: "University of Leicester",
  },
  {
    name: "University of New Hampshire via University Study - Concord Campus",
    city: "Concord, New Hampshire",
    country: "United States",
    institutionType: "Public university regional campus",
    summary: "UNH's smaller Concord regional campus, offering business, nursing and liberal arts programmes.",
    programs: ["Business Administration", "Nursing", "Liberal Arts"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 71", "PTE 53"],
    tuitionMin: 22000, tuitionMax: 26000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.unh.edu",
    wikipediaTitle: "University of New Hampshire",
  },
  {
    name: "University of New Hampshire via University Study - Manchester Campus",
    city: "Manchester, New Hampshire",
    country: "United States",
    institutionType: "Public university regional campus",
    summary: "UNH's Manchester regional campus, offering business, nursing and liberal arts programmes.",
    programs: ["Business Administration", "Nursing", "Liberal Arts"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 71", "PTE 53"],
    tuitionMin: 22000, tuitionMax: 26000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.unh.edu",
    wikipediaTitle: "University of New Hampshire",
  },
  {
    name: "University of Wolverhampton - Telford Campus",
    city: "Telford",
    country: "United Kingdom",
    institutionType: "Public modern university satellite campus",
    summary: "University of Wolverhampton's Telford campus, offering nursing, construction and business degrees.",
    programs: ["Nursing", "Construction", "Business"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 14000, tuitionMax: 16000, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://www.wlv.ac.uk",
    wikipediaTitle: "University of Wolverhampton",
  },
  {
    name: "Université Paris Sciences et Lettres (PSL) via EIT InnoEnergy",
    city: "Paris",
    country: "France",
    institutionType: "Public research university consortium, delivering EIT InnoEnergy programmes",
    summary: "An elite Paris research university consortium (PSL), delivering an EIT InnoEnergy joint master's in energy innovation alongside its own physics and engineering degrees.",
    programs: ["Energy Innovation (EIT InnoEnergy MSc)", "Physics"],
    ieltsOverall: 7, ieltsMinBand: 6.5, ieltsAlternatives: ["TOEFL iBT 100", "PTE 65"],
    tuitionMin: 9000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "total programme (2-year MSc)",
    tuitionNote: "EIT InnoEnergy's flat joint-master's programme fee; differs from PSL's general tuition schedule.",
    website: "https://www.psl.eu",
    wikipediaTitle: "Université PSL",
  },
  {
    name: "Villanova Preparatory School via ABC Education Group",
    city: "Ojai, California",
    country: "United States",
    institutionType: "Private Catholic day and boarding school (via ABC Education Group)",
    summary: "A private Catholic day and boarding school in California's Ojai Valley, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 22000, tuitionMax: 45000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.villanovaprep.org",
    wikipediaTitle: "Villanova Preparatory School",
  },
  {
    name: "Whitireia and WelTec - Te Kahui Auaha Campus",
    city: "Wellington",
    country: "New Zealand",
    institutionType: "Public institutes of technology (creative-arts campus)",
    summary: "The merged Whitireia and WelTec institutes' central-Wellington creative campus, offering design, screen production and fashion programmes.",
    programs: ["Design", "Screen Production", "Fashion"],
    ieltsOverall: 6, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 80", "PTE 58"],
    tuitionMin: 20000, tuitionMax: 25000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.weltec.ac.nz",
    wikipediaTitle: "WelTec",
  },
  {
    name: "Wilbraham and Monson Academy via ABC Education Group",
    city: "Wilbraham, Massachusetts",
    country: "United States",
    institutionType: "Private day and boarding school (via ABC Education Group)",
    summary: "A private Massachusetts day and boarding school, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 24000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.wma.us",
    wikipediaTitle: "Wilbraham & Monson Academy",
  },
  {
    name: "AGH University of Science and Technology via EIT InnoEnergy",
    city: "Kraków",
    country: "Poland",
    institutionType: "Public technical university, delivering EIT InnoEnergy programmes",
    summary: "A leading Polish technical university, delivering an EIT InnoEnergy joint master's in sustainable energy alongside its own mining and engineering degrees.",
    programs: ["Sustainable Energy (EIT InnoEnergy MSc)", "Mining and Geology"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 90", "PTE 62"],
    tuitionMin: 9000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "total programme (2-year MSc)",
    tuitionNote: "EIT InnoEnergy's flat joint-master's programme fee; differs from AGH's general tuition schedule.",
    website: "https://www.agh.edu.pl",
    wikipediaTitle: "AGH University of Science and Technology",
  },
  {
    name: "AHA International School via GE International",
    institutionType: "Private international school",
    summary: "A private international school hosting students via the GE International placement network; specific location could not be confirmed with confidence.",
    tuitionNote: "No reliable tuition figure found for this institution.",
    wikipediaTitle: "AHA International School",
    skipImageLookup: true,
  },
  {
    name: "Admiral Farragut Academy via GE International Schools",
    city: "St. Petersburg, Florida",
    country: "United States",
    institutionType: "Private military-style day and boarding academy (via GE International Schools)",
    summary: "A Florida private military-style academy hosting international students, offering a college-preparatory curriculum alongside naval science training.",
    programs: ["College-Preparatory Diploma", "Naval Science / JROTC"],
    tuitionMin: 35000, tuitionMax: 42000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.farragut.org",
    wikipediaTitle: "Admiral Farragut Academy",
  },
  {
    name: "Allendale Columbia School via GE International Schools",
    city: "Rochester, New York",
    country: "United States",
    institutionType: "Private day school (via GE International Schools)",
    summary: "A private Rochester day school offering a college-preparatory curriculum, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 24000, tuitionMax: 30000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.allendalecolumbia.org",
    wikipediaTitle: "Allendale Columbia School",
  },
  {
    name: "American Heritage School via GE International Schools",
    city: "Plantation, Florida",
    country: "United States",
    institutionType: "Private day school (via GE International Schools)",
    summary: "A well-known South Florida private day school offering the IB Diploma alongside a college-preparatory curriculum.",
    programs: ["College-Preparatory Diploma", "IB Diploma Programme"],
    tuitionMin: 20000, tuitionMax: 26000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.ahschool.com",
    wikipediaTitle: "American Heritage School (Florida)",
  },
  {
    name: "Andrews Osborne Academy via GE International",
    city: "Willoughby, Ohio",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International)",
    summary: "An Ohio private day and boarding school hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 25000, tuitionMax: 48000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.andrewsosborne.org",
    wikipediaTitle: "Andrews Osborne Academy",
  },
  {
    name: "Annie Wright Schools via ABC Education Group",
    city: "Tacoma, Washington",
    country: "United States",
    institutionType: "Private day and boarding school (via ABC Education Group)",
    summary: "A well-known Tacoma IB day and boarding school, hosting international students through ABC Education Group.",
    programs: ["IB Diploma Programme"],
    tuitionMin: 20000, tuitionMax: 55000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.aw.org",
    wikipediaTitle: "Annie Wright Schools",
  },
  {
    name: "Annie Wright Schools via GE International Schools",
    city: "Tacoma, Washington",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International Schools)",
    summary: "A well-known Tacoma IB day and boarding school, hosting international students through GE International Schools.",
    programs: ["IB Diploma Programme"],
    tuitionMin: 20000, tuitionMax: 55000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.aw.org",
    wikipediaTitle: "Annie Wright Schools",
  },
  {
    name: "Ara Institute of Canterbury - Timaru Campus",
    city: "Timaru",
    country: "New Zealand",
    institutionType: "Public institute of technology",
    summary: "Ara's Timaru campus, offering business and trades diplomas in South Canterbury.",
    programs: ["Business", "Trades Foundation"],
    ieltsOverall: 6, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 80", "PTE 58"],
    tuitionMin: 20000, tuitionMax: 24000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.ara.ac.nz",
    wikipediaTitle: "Ara Institute of Canterbury",
  },
  {
    name: "Archbishop Riordan High School via ABC Education Group",
    city: "San Francisco, California",
    country: "United States",
    institutionType: "Private Catholic day school (via ABC Education Group)",
    summary: "A private Catholic all-boys day school in San Francisco, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 20000, tuitionMax: 24000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.riordanhs.org",
    wikipediaTitle: "Archbishop Riordan High School",
  },
  {
    name: "Archbishop Riordan High School via GE International Schools",
    city: "San Francisco, California",
    country: "United States",
    institutionType: "Private Catholic day school (via GE International Schools)",
    summary: "A private Catholic all-boys day school in San Francisco, hosting international students through GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 20000, tuitionMax: 24000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.riordanhs.org",
    wikipediaTitle: "Archbishop Riordan High School",
  },
  {
    name: "Army and Navy Academy via GE International Schools",
    city: "Carlsbad, California",
    country: "United States",
    institutionType: "Private military boarding academy (via GE International Schools)",
    summary: "A private military boarding academy on the California coast, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma", "Military Leadership / JROTC"],
    tuitionMin: 38000, tuitionMax: 45000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.armyandnavyacademy.org",
    wikipediaTitle: "Army and Navy Academy",
  },
  {
    name: "Ashley Hall via GE International Schools",
    city: "Charleston, South Carolina",
    country: "United States",
    institutionType: "Private girls' day and boarding school (via GE International Schools)",
    summary: "A private Charleston girls' day and boarding school, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 22000, tuitionMax: 45000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.ashleyhall.org",
    wikipediaTitle: "Ashley Hall",
  },
  {
    name: "Assiniboine Community College - Winnipeg Campus (CI)",
    city: "Winnipeg, Manitoba",
    country: "Canada",
    institutionType: "Public college satellite campus",
    summary: "Assiniboine Community College's Winnipeg satellite campus, offering business and health-care aide diplomas.",
    programs: ["Business Administration", "Health Care Aide", "Continuing Education"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 80", "PTE 56"],
    tuitionMin: 14000, tuitionMax: 17000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.assiniboine.net",
    wikipediaTitle: "Assiniboine Community College",
  },
  {
    name: "Bakersfield Christian High School via GE International",
    city: "Bakersfield, California",
    country: "United States",
    institutionType: "Private Christian day school (via GE International)",
    summary: "A private Christian day school in Bakersfield, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 12000, tuitionMax: 16000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.bchsonline.org",
    wikipediaTitle: "Bakersfield Christian High School",
  },
  {
    name: "Bath Spa University - London Campus",
    city: "London",
    country: "United Kingdom",
    institutionType: "Public university satellite campus",
    summary: "Bath Spa University's London campus, offering creative writing, fine art and fashion degrees.",
    programs: ["Creative Writing", "Fine Art", "Fashion"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 14500, tuitionMax: 16500, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://www.bathspa.ac.uk",
    wikipediaTitle: "Bath Spa University",
  },
  {
    name: "Belleview Christian School via GE International Schools",
    city: "Bellevue, Washington",
    country: "United States",
    institutionType: "Private Christian day school (via GE International Schools)",
    summary: "A private Christian day school in the Seattle area, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 14000, tuitionMax: 18000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.bellevuechristian.org",
    wikipediaTitle: "Bellevue Christian School",
  },
  {
    name: "Ben Lippen School via GE International Schools",
    city: "Columbia, South Carolina",
    country: "United States",
    institutionType: "Private Christian day and boarding school (via GE International Schools)",
    summary: "A private Christian day and boarding school in Columbia, South Carolina, well known for hosting international students.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 16000, tuitionMax: 38000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.benlippen.com",
    wikipediaTitle: "Ben Lippen School",
  },
  {
    name: "Berwick Academy via GE International Schools",
    city: "Berwick, Maine",
    country: "United States",
    institutionType: "Private day school (via GE International Schools)",
    summary: "The oldest independent school in Maine, offering a college-preparatory day-school curriculum.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 28000, tuitionMax: 34000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.berwickacademy.org",
    wikipediaTitle: "Berwick Academy",
  },
  {
    name: "Besant Hill School via ABC Education Group",
    city: "Ojai, California",
    country: "United States",
    institutionType: "Private day and boarding school (via ABC Education Group)",
    summary: "A private day and boarding school in California's Ojai Valley, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 30000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.besanthill.org",
    wikipediaTitle: "Besant Hill School",
  },
  {
    name: "Besant Hill School via GE International Schools",
    city: "Ojai, California",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International Schools)",
    summary: "A private day and boarding school in California's Ojai Valley, hosting international students through GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 30000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.besanthill.org",
    wikipediaTitle: "Besant Hill School",
  },
  {
    name: "Bethlehem College via LightPath New Zealand Schools",
    city: "Tauranga",
    country: "New Zealand",
    institutionType: "Public/Christian secondary school (LightPath New Zealand Schools consortium)",
    summary: "A Tauranga secondary school hosting international students through the LightPath New Zealand Schools consortium.",
    programs: ["National Certificate of Educational Achievement (NCEA)"],
    tuitionMin: 16000, tuitionMax: 19000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.bethlehem.school.nz",
    wikipediaTitle: "Bethlehem College, New Zealand",
  },
  {
    name: "Blue Ridge School via GE International Schools",
    city: "St. George, Virginia",
    country: "United States",
    institutionType: "Private all-boys boarding school (via GE International Schools)",
    summary: "A private all-boys boarding school in rural Virginia, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 48000, tuitionMax: 55000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.blueridgeschool.com",
    wikipediaTitle: "Blue Ridge School (Virginia)",
  },
  {
    name: "Bolles Academy via ABC Education Group",
    city: "Jacksonville, Florida",
    country: "United States",
    institutionType: "Private day and boarding school (via ABC Education Group)",
    summary: "The Bolles School in Jacksonville, a private day and boarding school hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 20000, tuitionMax: 55000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.bolles.org",
    wikipediaTitle: "Bolles School",
  },
  {
    name: "Botany Downs Secondary College via LightPath New Zealand Schools",
    city: "Auckland",
    country: "New Zealand",
    institutionType: "Public secondary school (LightPath New Zealand Schools consortium)",
    summary: "An Auckland public secondary school hosting international students through the LightPath New Zealand Schools consortium.",
    programs: ["National Certificate of Educational Achievement (NCEA)"],
    tuitionMin: 16000, tuitionMax: 19000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.botanydowns.school.nz",
    wikipediaTitle: "Botany Downs Secondary College",
  },
  {
    name: "Buffalo Seminary (SEM) via GE International Schools",
    city: "Buffalo, New York",
    country: "United States",
    institutionType: "Private all-girls day school (via GE International Schools)",
    summary: "A private all-girls day school in Buffalo, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 24000, tuitionMax: 28000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.buffaloseminary.org",
    wikipediaTitle: "Buffalo Seminary",
  },
  {
    name: "Burr and Burton Academy via GE International Schools",
    city: "Manchester, Vermont",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International Schools)",
    summary: "A private Vermont day and boarding academy, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 22000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.burrburton.org",
    wikipediaTitle: "Burr and Burton Academy",
  },
  {
    name: "California Crosspoint Academy via GE International Schools",
    city: "Union City, California",
    country: "United States",
    institutionType: "Private Christian day school (via GE International Schools)",
    summary: "A private Christian day school in the San Francisco Bay Area, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 14000, tuitionMax: 18000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.crosspointacademy.org",
    wikipediaTitle: "California Crosspoint Academy",
  },
  {
    name: "Camden Military Academy via GE International Schools",
    city: "Camden, South Carolina",
    country: "United States",
    institutionType: "Private military boarding academy (via GE International Schools)",
    summary: "A private military boarding academy in South Carolina, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma", "Military Leadership"],
    tuitionMin: 32000, tuitionMax: 38000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.camdenmilitary.com",
    wikipediaTitle: "Camden Military Academy",
  },
  {
    name: "Canyonville Academy via GE International Schools",
    city: "Canyonville, Oregon",
    country: "United States",
    institutionType: "Private Christian day and boarding school (via GE International Schools)",
    summary: "A private Oregon Christian boarding school well known for hosting international students, via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 30000, tuitionMax: 38000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.canyonville.net",
    wikipediaTitle: "Canyonville Academy",
  },
  {
    name: "Capilano University - Squamish Campus",
    city: "Squamish, British Columbia",
    country: "Canada",
    institutionType: "Public university satellite campus",
    summary: "Capilano University's Squamish campus, offering business, outdoor recreation management and tourism programmes.",
    programs: ["Business", "Outdoor Recreation Management", "Tourism"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.capilanou.ca",
    wikipediaTitle: "Capilano University",
  },
  {
    name: "Carlisle School via GE International",
    city: "Martinsville, Virginia",
    country: "United States",
    institutionType: "Private day school (via GE International)",
    summary: "A private Virginia day school hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 12000, tuitionMax: 16000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.carlisleschool.org",
    wikipediaTitle: "Carlisle School",
  },
  {
    name: "Caucasus International University",
    city: "Tbilisi",
    country: "Georgia",
    institutionType: "Private university",
    summary: "A private Tbilisi university offering business, law and medicine programmes at relatively affordable tuition.",
    programs: ["Business Administration", "Law", "Medicine"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 44"],
    tuitionMin: 3000, tuitionMax: 5000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.ciu.edu.ge",
    wikipediaTitle: "Caucasus International University",
  },
  {
    name: "Centennial College - Toronto Airways Inc - Canadian Flight Academy (CI)",
    city: "Toronto, Ontario",
    country: "Canada",
    institutionType: "Public college (flight-training partnership)",
    summary: "Centennial College's aviation partnership with the Canadian Flight Academy, offering flight and commercial pilot training.",
    programs: ["Aviation Technology - Flight", "Commercial Pilot Training"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 20000, tuitionMax: 28000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Flight-training programmes run above the general diploma band due to flight-hour costs.",
    website: "https://www.centennialcollege.ca",
    wikipediaTitle: "Centennial College",
  },
  {
    name: "Chaminade College Preparatory School via GE International Schools",
    city: "West Hills, California",
    country: "United States",
    institutionType: "Private Catholic day school (via GE International Schools)",
    summary: "A private Catholic Marianist day school in the Los Angeles area, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.chaminade.org",
    wikipediaTitle: "Chaminade College Preparatory School",
  },
  {
    name: "Cheshire Academy via GE International Schools",
    city: "Cheshire, Connecticut",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International Schools)",
    summary: "A private Connecticut day and boarding school with a large international student population, via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 30000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.cheshireacademy.org",
    wikipediaTitle: "Cheshire Academy",
  },
  {
    name: "Christchurch School via ABC Education Group",
    city: "Christchurch, Virginia",
    country: "United States",
    institutionType: "Private Episcopal boarding and day school (via ABC Education Group)",
    summary: "A private Episcopal boarding school on Virginia's Rappahannock River, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 48000, tuitionMax: 54000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.christchurchschool.org",
    wikipediaTitle: "Christchurch School",
  },
  {
    name: "College of Health Sciences - Brisbane Campus Via Education Centre of Australia (ECA)",
    city: "Brisbane",
    country: "Australia",
    institutionType: "Private vocational health-sciences college (via Education Centre of Australia)",
    summary: "A Brisbane vocational health-sciences college offering nursing and allied-health diplomas, part of the Education Centre of Australia network.",
    programs: ["Diploma of Nursing", "Allied Health Assistance"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 47"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    wikipediaTitle: "College of Health Sciences (Australia)",
    skipImageLookup: true,
  },
  {
    name: "College of Health Sciences - Sydney Campus (Parramatta) Via Education Centre of Australia (ECA)",
    city: "Sydney (Parramatta)",
    country: "Australia",
    institutionType: "Private vocational health-sciences college (via Education Centre of Australia)",
    summary: "A Parramatta vocational health-sciences college offering nursing and allied-health diplomas, part of the Education Centre of Australia network.",
    programs: ["Diploma of Nursing", "Allied Health Assistance"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 47"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    wikipediaTitle: "College of Health Sciences (Australia)",
    skipImageLookup: true,
  },
  {
    name: "Colorado Rocky Mountain School via GE International",
    city: "Carbondale, Colorado",
    country: "United States",
    institutionType: "Private boarding school (outdoor-education focus, via GE International)",
    summary: "A private Colorado boarding school with an outdoor-education focus, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma", "Outdoor Education"],
    tuitionMin: 55000, tuitionMax: 62000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.crms.org",
    wikipediaTitle: "Colorado Rocky Mountain School",
  },
  {
    name: "Community School of Naples via GE International",
    city: "Naples, Florida",
    country: "United States",
    institutionType: "Private IB day school (via GE International)",
    summary: "A private Naples day school offering the IB Diploma, hosting international students via GE International.",
    programs: ["IB Diploma Programme"],
    tuitionMin: 24000, tuitionMax: 30000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.csnaples.org",
    wikipediaTitle: "Community School of Naples",
  },
  {
    name: "Concord Christian School via GE International Schools",
    city: "Knoxville, Tennessee",
    country: "United States",
    institutionType: "Private Christian day school (via GE International Schools)",
    summary: "A private Christian day school in the Knoxville area, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 12000, tuitionMax: 16000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.concordchristian.com",
    wikipediaTitle: "Concord Christian School",
  },
  {
    name: "Conestoga College - Milton - Steeles Avenue Campus",
    city: "Milton, Ontario",
    country: "Canada",
    institutionType: "Public college regional campus",
    summary: "Conestoga College's Milton campus on Steeles Avenue, offering business, skilled-trades and health-sciences foundation programmes.",
    programs: ["Business Fundamentals", "Skilled Trades", "Health Sciences Foundations"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 16000, tuitionMax: 19000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.conestogac.on.ca",
    wikipediaTitle: "Conestoga College",
  },
  {
    name: "Cranbrook Schools via ABC Education Group",
    city: "Bloomfield Hills, Michigan",
    country: "United States",
    institutionType: "Private day and boarding school (via ABC Education Group)",
    summary: "A prestigious Michigan day and boarding school, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 30000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.cranbrook.edu",
    wikipediaTitle: "Cranbrook Schools",
  },
  {
    name: "Cushing Academy via GE International Schools",
    city: "Ashburnham, Massachusetts",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International Schools)",
    summary: "A Massachusetts boarding school known for a large international student population, via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 62000, tuitionMax: 68000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.cushing.org",
    wikipediaTitle: "Cushing Academy",
  },
  {
    name: "Darlington School via GE International",
    city: "Rome, Georgia",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International)",
    summary: "A private Georgia day and boarding school, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 25000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.darlingtonschool.org",
    wikipediaTitle: "Darlington School",
  },
  {
    name: "Dunn School via GE International",
    city: "Los Olivos, California",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International)",
    summary: "A private California boarding school in the Santa Ynez Valley, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 48000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.dunnschool.org",
    wikipediaTitle: "Dunn School",
  },
  {
    name: "ECA Professional Year via Education Centre of Australia (ECA)",
    city: "Sydney",
    country: "Australia",
    institutionType: "Professional-year bridging programme (Education Centre of Australia)",
    summary: "A professional-year bridging programme for IT, accounting and engineering graduates seeking Australian work experience.",
    programs: ["Professional Year Program (IT / Accounting / Engineering)"],
    ieltsOverall: 6.5, ieltsAlternatives: ["TOEFL iBT 79", "PTE 58"],
    tuitionMin: 9000, tuitionMax: 12000, tuitionCurrency: "AUD", tuitionPeriod: "total programme (~44 weeks)",
    website: "https://www.eca.edu.au",
    wikipediaTitle: "Professional Year Program (Australia)",
    skipImageLookup: true,
  },
  {
    name: "Elite Preparatory Academy via ABC Education Group",
    country: "United States",
    institutionType: "Private day school (via ABC Education Group)",
    summary: "A private day school hosting international students via ABC Education Group; specific city could not be confirmed with confidence.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    wikipediaTitle: "Elite Preparatory Academy",
    skipImageLookup: true,
  },
  {
    name: "English Language Institute - The University of Utah",
    city: "Salt Lake City, Utah",
    country: "United States",
    institutionType: "University-affiliated English-language institute",
    summary: "The University of Utah's English Language Institute, offering general and academic English preparation.",
    programs: ["General English", "Academic English Preparation"],
    ieltsNote: "This is an English-language course provider; no IELTS entry requirement applies.",
    tuitionMin: 6000, tuitionMax: 9000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://continue.utah.edu/eli",
    wikipediaTitle: "University of Utah",
  },
  {
    name: "Erie First Christian Academy via ABC Education Group",
    city: "Erie, Pennsylvania",
    country: "United States",
    institutionType: "Private Christian day school (via ABC Education Group)",
    summary: "A private Christian day school in Erie, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 12000, tuitionMax: 16000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.eriefirst.org",
    wikipediaTitle: "Erie First Assembly Christian Academy",
  },
  {
    name: "Erie First Christian Academy via GE International",
    city: "Erie, Pennsylvania",
    country: "United States",
    institutionType: "Private Christian day school (via GE International)",
    summary: "A private Christian day school in Erie, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 12000, tuitionMax: 16000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.eriefirst.org",
    wikipediaTitle: "Erie First Assembly Christian Academy",
  },
  {
    name: "Excelsior School via GE International",
    country: "United States",
    institutionType: "Private school",
    summary: "A private school hosting international students via GE International; specific location could not be confirmed with confidence.",
    tuitionNote: "No reliable tuition figure found for this institution.",
    wikipediaTitle: "Excelsior School",
    skipImageLookup: true,
  },
  {
    name: "Fairfax Christian School via GE International",
    city: "Fairfax, Virginia",
    country: "United States",
    institutionType: "Private Christian day school (via GE International)",
    summary: "A private Christian day school in the Washington, DC area, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 12000, tuitionMax: 16000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.fairfaxchristianschool.org",
    wikipediaTitle: "Fairfax Christian School",
  },
  {
    name: "Fairleigh Dickinson University - Vancouver Campus (CI)",
    city: "Vancouver, British Columbia",
    country: "Canada",
    institutionType: "Private university satellite campus",
    summary: "Fairleigh Dickinson University's Vancouver campus, offering business, hospitality and global studies programmes.",
    programs: ["Business Administration", "Hospitality Management", "Global Studies"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 24000, tuitionMax: 28000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.fdu.edu",
    wikipediaTitle: "Fairleigh Dickinson University",
  },
  {
    name: "Fleming College - Haliburton Campus",
    city: "Haliburton, Ontario",
    country: "Canada",
    institutionType: "Public college regional campus",
    summary: "Fleming College's Haliburton campus, known for fish and wildlife and ecosystem-management diplomas.",
    programs: ["Fish and Wildlife Technology", "Ecosystem Management Technology", "Environmental Technician"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 80", "PTE 56"],
    tuitionMin: 15000, tuitionMax: 18000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.flemingcollege.ca",
    wikipediaTitle: "Fleming College",
  },
  {
    name: "Florida Prep via GE International",
    city: "Melbourne, Florida",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International)",
    summary: "A private Florida day and boarding school, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 20000, tuitionMax: 40000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.florida-prep.org",
    wikipediaTitle: "Florida Preparatory Academy",
  },
  {
    name: "Forest Ridge School of the Sacred Heart via GE International Schools",
    city: "Bellevue, Washington",
    country: "United States",
    institutionType: "Private Catholic all-girls day school (via GE International Schools)",
    summary: "A private Catholic all-girls day school near Seattle, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 24000, tuitionMax: 30000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.forestridge.org",
    wikipediaTitle: "Forest Ridge School of the Sacred Heart",
  },
  {
    name: "Fork Union Military Academy via GE International Schools",
    city: "Fork Union, Virginia",
    country: "United States",
    institutionType: "Private military boarding academy (via GE International Schools)",
    summary: "A private Virginia military boarding academy, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma", "Military Leadership"],
    tuitionMin: 38000, tuitionMax: 45000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.forkunion.com",
    wikipediaTitle: "Fork Union Military Academy",
  },
  {
    name: "Fountain Valley School of Colorado via GE International Schools",
    city: "Colorado Springs, Colorado",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International Schools)",
    summary: "A private Colorado day and boarding school, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 55000, tuitionMax: 62000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.fvs.edu",
    wikipediaTitle: "Fountain Valley School of Colorado",
  },
  {
    name: "Fountain Valley School via ABC Education Group",
    city: "Colorado Springs, Colorado",
    country: "United States",
    institutionType: "Private day and boarding school (via ABC Education Group)",
    summary: "A private Colorado day and boarding school, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 55000, tuitionMax: 62000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.fvs.edu",
    wikipediaTitle: "Fountain Valley School of Colorado",
  },
  {
    name: "Foxcroft Academy via GE International Schools",
    city: "Dover-Foxcroft, Maine",
    country: "United States",
    institutionType: "Private/public town academy (boarding programme via GE International Schools)",
    summary: "A Maine town academy serving as the local public high school while also hosting fee-paying international boarding students.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 32000, tuitionMax: 38000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.foxcroftacademy.org",
    wikipediaTitle: "Foxcroft Academy",
  },
  {
    name: "Fresenius University of Applied Sciences - Wiesbaden Campus",
    city: "Wiesbaden",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "Fresenius's Wiesbaden campus, offering business and design programmes.",
    programs: ["Business Administration", "Design"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 9000, tuitionMax: 12000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.hs-fresenius.de",
    wikipediaTitle: "Hochschule Fresenius",
  },
  {
    name: "Fryeburg Academy via ABC Education Group",
    city: "Fryeburg, Maine",
    country: "United States",
    institutionType: "Private/public town academy (via ABC Education Group)",
    summary: "A Maine town academy hosting day and boarding international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 24000, tuitionMax: 52000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.fryeburgacademy.org",
    wikipediaTitle: "Fryeburg Academy",
  },
  {
    name: "Fryeburg Academy via GE International Schools",
    city: "Fryeburg, Maine",
    country: "United States",
    institutionType: "Private/public town academy (via GE International Schools)",
    summary: "A Maine town academy hosting day and boarding international students through GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 24000, tuitionMax: 52000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.fryeburgacademy.org",
    wikipediaTitle: "Fryeburg Academy",
  },
  {
    name: "Future Skills Academy - Manukau campus",
    city: "Auckland",
    country: "New Zealand",
    institutionType: "Private vocational college",
    summary: "A private Auckland vocational college in Manukau, offering business and trades-foundation diplomas.",
    programs: ["Diploma in Business", "Trades Foundation"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 47"],
    tuitionMin: 14000, tuitionMax: 18000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.futureskills.ac.nz",
    wikipediaTitle: "Future Skills Academy",
    skipImageLookup: true,
  },
  {
    name: "GUS - The University of Law - Online",
    country: "United Kingdom",
    institutionType: "Private online law school (Global University Systems network)",
    summary: "The University of Law's online delivery, offering the LLB and GDL remotely at a lower price point than its campus programmes.",
    programs: ["Online LLB", "Online Graduate Diploma in Law (GDL)"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 79", "PTE 58"],
    tuitionMin: 12000, tuitionMax: 15000, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://www.law.ac.uk",
    wikipediaTitle: "University of Law",
  },
  {
    name: "Garrison Forest School via GE International Schools",
    city: "Owings Mills, Maryland",
    country: "United States",
    institutionType: "Private all-girls day and boarding school (via GE International Schools)",
    summary: "A private Maryland all-girls day and boarding school, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 30000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.gfs.org",
    wikipediaTitle: "Garrison Forest School",
  },
  {
    name: "General McLane High School via GE International Schools",
    city: "Edinboro, Pennsylvania",
    country: "United States",
    institutionType: "Public secondary school (via GE International Schools)",
    summary: "A Pennsylvania public secondary school hosting fee-paying international students through GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 12000, tuitionMax: 16000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.generalmclane.org",
    wikipediaTitle: "General McLane School District",
  },
  {
    name: "George Stevens Academy via GE International",
    city: "Blue Hill, Maine",
    country: "United States",
    institutionType: "Private/public town academy (via GE International)",
    summary: "A Maine town academy serving as the local public high school while also hosting fee-paying international boarding students.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 28000, tuitionMax: 34000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.georgestevensacademy.org",
    wikipediaTitle: "George Stevens Academy",
  },
  {
    name: "Georgian College - Arch and Helen Brown Design and Digital Arts Centre",
    city: "Barrie, Ontario",
    country: "Canada",
    institutionType: "Public college (specialist design campus)",
    summary: "Georgian College's dedicated design campus in Barrie, offering interior design, graphic design and game-development diplomas.",
    programs: ["Interior Design", "Graphic Design", "Game Development"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 80", "PTE 56"],
    tuitionMin: 15000, tuitionMax: 18000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.georgiancollege.ca",
    wikipediaTitle: "Georgian College",
  },
  {
    name: "Gilmour Academy via GE International",
    city: "Gates Mills, Ohio",
    country: "United States",
    institutionType: "Private Catholic day and boarding school (via GE International)",
    summary: "A private Catholic Ohio day and boarding school, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 20000, tuitionMax: 48000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.gilmour.org",
    wikipediaTitle: "Gilmour Academy",
  },
  {
    name: "GoElite - Concordia University Texas",
    city: "Austin, Texas",
    country: "United States",
    institutionType: "Private Lutheran university",
    summary: "A Texas private Lutheran university offering business, nursing and education programmes, with GoElite recruitment support.",
    programs: ["Business Administration", "Nursing", "Education"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 26000, tuitionMax: 30000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.concordia.edu",
    wikipediaTitle: "Concordia University Texas",
  },
  {
    name: "Grand River Academy via GE International Schools",
    city: "Austinburg, Ohio",
    country: "United States",
    institutionType: "Private boys' boarding school (via GE International Schools)",
    summary: "A private Ohio boarding school for boys, known for supporting students with learning differences, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 48000, tuitionMax: 55000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.grandriveracademy.com",
    wikipediaTitle: "Grand River Academy",
  },
  {
    name: "Green Bay High School via LightPath New Zealand Schools",
    city: "Auckland",
    country: "New Zealand",
    institutionType: "Public secondary school (LightPath New Zealand Schools consortium)",
    summary: "An Auckland public secondary school hosting international students through the LightPath New Zealand Schools consortium.",
    programs: ["National Certificate of Educational Achievement (NCEA)"],
    tuitionMin: 16000, tuitionMax: 19000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.gbhs.school.nz",
    wikipediaTitle: "Green Bay High School (New Zealand)",
  },
  {
    name: "Grier School via GE International",
    city: "Tyrone, Pennsylvania",
    country: "United States",
    institutionType: "Private all-girls boarding school (via GE International)",
    summary: "A private Pennsylvania all-girls boarding school, hosting international students via GE International.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 55000, tuitionMax: 62000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.grier.org",
    wikipediaTitle: "Grier School",
  },
  {
    name: "Hargrave Military Academy via GE International Schools",
    city: "Chatham, Virginia",
    country: "United States",
    institutionType: "Private military boarding academy (via GE International Schools)",
    summary: "A private Virginia military boarding academy, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma", "Military Leadership"],
    tuitionMin: 38000, tuitionMax: 45000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.hargrave.edu",
    wikipediaTitle: "Hargrave Military Academy",
  },
  {
    name: "Hebron Academy via GE International Schools",
    city: "Hebron, Maine",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International Schools)",
    summary: "A private Maine day and boarding school, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 28000, tuitionMax: 58000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.hebronacademy.org",
    wikipediaTitle: "Hebron Academy",
  },
  {
    name: "Hilton Head Preparatory School via GE International Schools",
    city: "Hilton Head Island, South Carolina",
    country: "United States",
    institutionType: "Private day school (via GE International Schools)",
    summary: "A private day school on Hilton Head Island, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 18000, tuitionMax: 24000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.hhprep.org",
    wikipediaTitle: "Hilton Head Preparatory School",
    skipImageLookup: true,
  },
  {
    name: "Hoosac School via GE International Schools",
    city: "Hoosick, New York",
    country: "United States",
    institutionType: "Private day and boarding school (via GE International Schools)",
    summary: "A private upstate New York day and boarding school, hosting international students via GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 30000, tuitionMax: 52000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.hoosac.com",
    wikipediaTitle: "Hoosac School",
  },
  {
    name: "Houghton Academy via ABC Education Group",
    city: "Houghton, New York",
    country: "United States",
    institutionType: "Private Christian day and boarding school (via ABC Education Group)",
    summary: "A private Christian day and boarding school in upstate New York, hosting international students through ABC Education Group.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 24000, tuitionMax: 38000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.houghtonacademy.org",
    wikipediaTitle: "Houghton Academy",
  },
  {
    name: "Houghton Academy via GE International Schools",
    city: "Houghton, New York",
    country: "United States",
    institutionType: "Private Christian day and boarding school (via GE International Schools)",
    summary: "A private Christian day and boarding school in upstate New York, hosting international students through GE International Schools.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 24000, tuitionMax: 38000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Boarding fees run at the higher end; day fees are lower.",
    website: "https://www.houghtonacademy.org",
    wikipediaTitle: "Houghton Academy",
  },
  {
    name: "Hub - Saginaw Valley State University",
    city: "University Center, Michigan",
    country: "United States",
    institutionType: "Public university",
    summary: "A Michigan public university offering business, nursing and engineering programmes, with Hub International Education recruitment support.",
    programs: ["Business Administration", "Nursing", "Engineering"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.svsu.edu",
    wikipediaTitle: "Saginaw Valley State University",
  },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

// ── Image resolution — upgraded two-tier lookup (see header note) ──

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

/**
 * Two-tier lookup: try the curated wikipediaTitle first, then retry with
 * name + city + country appended (better disambiguation for common names
 * than retrying the bare name alone). Unconfirmed institutions
 * (`skipImageLookup: true`) never call the API — a hit on a made-up name
 * is as likely to be a stranger's portrait as a real campus photo.
 */
async function resolveImage(inst: SeedInstitution): Promise<string | null> {
  if (inst.skipImageLookup) return null;

  const location = [inst.city, inst.country].filter(Boolean).join(" ");
  const primary = inst.wikipediaTitle?.trim();
  const primaryQuery = primary && primary.length > 2 ? primary : `${inst.name} ${location}`.trim();

  let imageUrl = await fetchWikipediaImage(primaryQuery);
  if (!imageUrl) {
    const fallbackQuery = `${inst.name} ${location}`.trim();
    if (fallbackQuery !== primaryQuery) {
      imageUrl = await fetchWikipediaImage(fallbackQuery);
    }
  }
  return imageUrl;
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
  console.log(`Seeding ${INSTITUTIONS.length} institutions (batch 8)...`);

  for (const [i, inst] of INSTITUTIONS.entries()) {
    const slug = slugify(inst.name);
    const imageUrl = await resolveImage(inst);
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
    };

    await db.institution.upsert({
      where: { slug },
      create: { ...data, slug, isActive: true },
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