// prisma/seed-institutions-batch-07.ts
//
// Batch 7: positions 521-620 of src/data/institutions.ts's RAW_INSTITUTIONS
// list (1-20 => seed-institutions.ts, 21-120 minus the featured Coventry
// entry => seed-institutions-batch-02.ts, 12 partner schools =>
// seed-featured-institutions.ts, 121-220 => seed-institutions-batch-03.ts,
// 221-320 => seed-institutions-batch-04.ts, 321-420 =>
// seed-institutions-batch-05.ts, 421-520 => seed-institutions-batch-06.ts).
// Same live-image-lookup approach as all of those, matching the current
// Institution model.
//
// ── A note on data confidence (read this before trusting a number) ──
//
// Same caveat as batches 4-6: nothing here was checked against a live
// source in this pass. Every field is either general knowledge of the
// institution or a reasoned typical-band estimate. Re-verify before this
// reaches a prospective student.
//
// This batch's School District 43 Coquitlam entries (21 of them) are
// middle and secondary schools rather than the elementary schools seen
// in batch 5 — same templating rationale (a district sets one
// international-student fee across its schools, not per-school
// variation), split here into a coquitlamMiddle() helper (Grades 6-8)
// and a coquitlamSecondary() helper (Grades 8-12, leading to the BC
// Dogwood Diploma), both with a slightly higher tuition band than the
// elementary template since BC districts typically charge more for
// older international students.
//
// Five names carry real uncertainty and got minimal, cautious entries
// rather than invented detail: CASA College, The North Land Institute
// of Training, Global Higher Education, Oxford International Education
// Group - Universal Higher Education, and (partially) Notre Dame High
// School via GE International Schools — several California/US schools
// share that name, so the specific campus could not be pinned down.
//
// Four entries ("... via EIT InnoEnergy": Grenoble INP, Eindhoven
// University of Technology, Institut Polytechnique de Paris / École
// Polytechnique, and Katholieke Universiteit Leuven) again use EIT
// InnoEnergy's flat joint-master's programme fee rather than the host
// institution's own tuition schedule — same convention as batch 6's
// three EIT InnoEnergy entries, flagged in tuitionNote each time.
//
// Run with:  npx tsx prisma/seed-institutions-batch-07.ts

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
};

// Shared fields for School District 43 Coquitlam middle and secondary
// schools — see the note above on why these are templated.
function coquitlamMiddle(name: string): SeedInstitution {
  return {
    name,
    city: "Coquitlam, British Columbia",
    country: "Canada",
    institutionType: "Public middle school (Coquitlam School District International Student Program)",
    summary: "One of School District 43 Coquitlam's middle schools in Metro Vancouver, hosting international students on a homestay or guardianship basis through the district's International Student Program alongside the standard BC curriculum.",
    programs: ["BC Middle School Curriculum (Grades 6-8)"],
    ieltsNote: "No IELTS requirement; the district assesses English-language support needs after arrival.",
    tuitionMin: 16000, tuitionMax: 18500, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "District-set international student tuition; homestay/guardianship and medical insurance are additional and not included.",
    website: "https://www.sd43.bc.ca",
    wikipediaTitle: "School District 43 Coquitlam",
  };
}

function coquitlamSecondary(name: string): SeedInstitution {
  return {
    name,
    city: "Coquitlam, British Columbia",
    country: "Canada",
    institutionType: "Public secondary school (Coquitlam School District International Student Program)",
    summary: "One of School District 43 Coquitlam's secondary schools in Metro Vancouver, hosting international students on a homestay or guardianship basis, leading to the BC Dogwood Diploma.",
    programs: ["BC Dogwood Diploma (Grades 8-12)"],
    ieltsNote: "No IELTS requirement; the district assesses English-language support needs after arrival.",
    tuitionMin: 16000, tuitionMax: 18500, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "District-set international student tuition; homestay/guardianship and medical insurance are additional and not included.",
    website: "https://www.sd43.bc.ca",
    wikipediaTitle: "School District 43 Coquitlam",
  };
}

const INSTITUTIONS: SeedInstitution[] = [
  {
    name: "Westcliff University - Orlando Campus",
    city: "Orlando, Florida",
    country: "United States",
    institutionType: "Private university",
    summary: "Westcliff University's Orlando campus, offering relatively affordable business, computer science and education programmes.",
    programs: ["Business Administration", "Computer Science", "Education"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 14000, tuitionMax: 18000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.westcliff.edu",
    wikipediaTitle: "Westcliff University",
  },
  {
    name: "Westcliff University - Santa Monica Campus",
    city: "Santa Monica, California",
    country: "United States",
    institutionType: "Private university",
    summary: "Westcliff University's Santa Monica campus, offering relatively affordable business, computer science and education programmes.",
    programs: ["Business Administration", "Computer Science", "Education"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 14000, tuitionMax: 18000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.westcliff.edu",
    wikipediaTitle: "Westcliff University",
  },
  {
    name: "Western Sydney University, Surabaya",
    city: "Surabaya",
    country: "Indonesia",
    institutionType: "University branch campus (Western Sydney University, Australia)",
    summary: "Western Sydney University's Surabaya branch campus, offering business, IT and nursing degrees at Indonesian-market tuition rates.",
    programs: ["Business", "Information Technology", "Nursing"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 4000, tuitionMax: 6000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.westernsydney.edu.au",
    wikipediaTitle: "Western Sydney University",
  },
  {
    name: "Wilfrid Laurier University - Milton Campus",
    city: "Milton, Ontario",
    country: "Canada",
    institutionType: "Public university campus",
    summary: "Laurier's newer Milton campus, focused on business technology, data science and digital media programmes.",
    programs: ["Business Technology Management", "Data Science", "Digital Media and Journalism"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 83", "PTE 60"],
    tuitionMin: 28000, tuitionMax: 34000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.wlu.ca",
    wikipediaTitle: "Wilfrid Laurier University",
  },
  {
    name: "Windermere Preparatory School via ABC Education Group",
    city: "Windermere, Florida",
    country: "United States",
    institutionType: "Private day school (Nord Anglia Education network, via ABC Education Group)",
    summary: "A Florida private day school offering the IB Diploma, part of the Nord Anglia Education network, hosting international students via ABC Education Group.",
    programs: ["IB Diploma Programme", "College-Preparatory Diploma"],
    tuitionMin: 22000, tuitionMax: 30000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.windermereprep.com",
    wikipediaTitle: "Windermere Preparatory School",
  },
  {
    name: "Windermere Preparatory School via Nord Anglia Education",
    city: "Windermere, Florida",
    country: "United States",
    institutionType: "Private day school (Nord Anglia Education network)",
    summary: "A Florida private day school offering the IB Diploma, part of the Nord Anglia Education network.",
    programs: ["IB Diploma Programme", "College-Preparatory Diploma"],
    tuitionMin: 22000, tuitionMax: 30000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    website: "https://www.windermereprep.com",
    wikipediaTitle: "Windermere Preparatory School",
  },
  {
    name: "Adelaide International School",
    city: "Adelaide",
    country: "Australia",
    institutionType: "Private international/pathway secondary school",
    summary: "An Adelaide school offering the South Australian Certificate of Education alongside English-language preparation for international students.",
    programs: ["South Australian Certificate of Education (SACE)", "English as an Additional Language"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    wikipediaTitle: "Adelaide International School",
  },
  {
    name: "Alexander Academy",
    city: "Vancouver, British Columbia",
    country: "Canada",
    institutionType: "Private international secondary and pathway school",
    summary: "A well-known Vancouver private school offering the BC Dogwood Diploma alongside a university-foundation pathway for international students.",
    programs: ["BC Dogwood Diploma", "University Foundation Pathway"],
    tuitionMin: 20000, tuitionMax: 26000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.alexanderacademy.com",
    wikipediaTitle: "Alexander Academy",
  },
  {
    name: "Australian Performing Arts Conservatory via GEDU",
    city: "Melbourne",
    country: "Australia",
    institutionType: "Private performing arts college (GEDU network)",
    summary: "Melbourne conservatory specialising in performing arts and musical theatre degrees, part of the GEDU network.",
    programs: ["Bachelor of Performing Arts", "Musical Theatre"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 20000, tuitionMax: 26000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.apac.edu.au",
    wikipediaTitle: "Australian Performing Arts Conservatory",
  },
  coquitlamMiddle("Banting Middle via Coquitlam School District"),
  {
    name: "Berlin School of Business and Innovation - Paris Campus Via Global University Systems (GUS)",
    city: "Paris",
    country: "France",
    institutionType: "Private business school (Global University Systems network)",
    summary: "The Paris campus of the Berlin School of Business and Innovation, offering business, marketing and data-analytics degrees.",
    programs: ["International Business", "Marketing", "Data Analytics"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 9000, tuitionMax: 12000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.bsbi.eu",
    wikipediaTitle: "Berlin School of Business and Innovation",
  },
  {
    name: "British Columbia Institute of Technology - Annacis Island Campus",
    city: "Delta, British Columbia",
    country: "Canada",
    institutionType: "Public polytechnic campus (marine and industrial trades)",
    summary: "BCIT's specialised Annacis Island campus, focused on marine engineering, welding and industrial trades training.",
    programs: ["Marine Engineering", "Welding", "Industrial Trades"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 65"],
    tuitionMin: 17000, tuitionMax: 21000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.bcit.ca",
    wikipediaTitle: "British Columbia Institute of Technology",
  },
  {
    name: "CASA College",
    institutionType: "Private college",
    summary: "A private college; specific location and accreditation details could not be confirmed with confidence.",
    tuitionNote: "No reliable tuition figure found for this institution.",
    wikipediaTitle: "CASA College",
  },
  coquitlamSecondary("Centennial Secondary via Coquitlam School District"),
  coquitlamMiddle("Citadel Middle via Coquitlam School District"),
  {
    name: "City University of Seattle",
    city: "Seattle, Washington",
    country: "United States",
    institutionType: "Private nonprofit university",
    summary: "A Seattle-based private nonprofit university known for relatively affordable business, education and psychology programmes, delivered across a network of satellite campuses.",
    programs: ["MBA", "Education", "Psychology"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 71", "PTE 53"],
    tuitionMin: 14000, tuitionMax: 18000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.cityu.edu",
    wikipediaTitle: "City University of Seattle",
  },
  coquitlamMiddle("Como Lake Middle via Coquitlam School District"),
  {
    name: "Conestoga College - Brantford Campus",
    city: "Brantford, Ontario",
    country: "Canada",
    institutionType: "Public college regional campus",
    summary: "Conestoga College's Brantford campus, offering business, nursing and civil engineering technology diplomas.",
    programs: ["Business (Diploma)", "Practical Nursing", "Civil Engineering Technology"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 16000, tuitionMax: 19000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.conestogac.on.ca",
    wikipediaTitle: "Conestoga College",
  },
  {
    name: "Coquitlam College",
    city: "Coquitlam, British Columbia",
    country: "Canada",
    institutionType: "Private pathway college",
    summary: "A private Coquitlam college offering university-transfer and academic-English preparation programmes, distinct from the local public school district.",
    programs: ["University Transfer Program", "English for Academic Purposes"],
    ieltsOverall: 5.5, ieltsMinBand: 5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 14000, tuitionMax: 18000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.coquitlamcollege.com",
    wikipediaTitle: "Coquitlam College",
  },
  coquitlamSecondary("Dr. Charles Best Secondary via Coquitlam School District"),
  {
    name: "ELS Educational Services",
    country: "United States",
    institutionType: "Private English-language school network",
    summary: "A large US-wide network of English-language centres offering general English, academic English and university-pathway preparation across many campuses.",
    programs: ["General English", "Academic English Preparation", "University Pathway Programs"],
    ieltsNote: "This is an English-language course provider; no IELTS entry requirement applies.",
    tuitionMin: 8000, tuitionMax: 12000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.els.edu",
    wikipediaTitle: "ELS Educational Services",
  },
  coquitlamMiddle("Eagle Mountain Middle School via Coquitlam School District"),
  {
    name: "Fachhochschule des Mittelstands (FHM) University of Applied Sciences - Duren Campus",
    city: "Düren",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "FHM's Düren campus, part of the German private university network offering business and management programmes.",
    programs: ["Business Administration", "International Management"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 6000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.fh-mittelstand.de",
    wikipediaTitle: "Fachhochschule des Mittelstands",
  },
  {
    name: "Fachhochschule des Mittelstands (FHM) University of Applied Sciences - Waldshut Campus",
    city: "Waldshut",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "FHM's Waldshut campus, part of the German private university network offering business and management programmes.",
    programs: ["Business Administration", "International Management"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 6000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.fh-mittelstand.de",
    wikipediaTitle: "Fachhochschule des Mittelstands",
  },
  {
    name: "Financia Business School - Paris Campus",
    city: "Paris",
    country: "France",
    institutionType: "Private business school (finance-focused)",
    summary: "Paris private business school specialising in finance, accounting and audit programmes.",
    programs: ["Finance", "Accounting", "Audit and Management Control"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 9000, tuitionMax: 13000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.financia-bs.com",
    wikipediaTitle: "Financia Business School",
  },
  coquitlamSecondary("Gleneagle Secondary via Coquitlam School District"),
  {
    name: "GoElite - Bay Atlantic University",
    city: "Washington, D.C.",
    country: "United States",
    institutionType: "Private university",
    summary: "A Washington, DC private university offering relatively affordable business, international relations and data science programmes, with GoElite recruitment support.",
    programs: ["Business Administration", "International Relations", "Data Science"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.bau.edu",
    wikipediaTitle: "Bay Atlantic University",
  },
  {
    name: "GoElite - California Institute of Advanced Management",
    city: "San Jose, California",
    country: "United States",
    institutionType: "Private business school",
    summary: "A California business school offering the MBA and business administration degrees, with GoElite recruitment support.",
    programs: ["MBA", "Business Administration"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 12000, tuitionMax: 16000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.ciam.edu",
    wikipediaTitle: "California Institute of Advanced Management",
  },
  {
    name: "GoElite - Sofia University - Costa Mesa",
    city: "Costa Mesa, California",
    country: "United States",
    institutionType: "Private university satellite campus",
    summary: "Sofia University's Costa Mesa satellite campus, known for psychology and transpersonal psychology programmes, with GoElite recruitment support.",
    programs: ["Psychology", "Transpersonal Psychology"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.sofia.edu",
    wikipediaTitle: "Sofia University (California)",
  },
  {
    name: "GoElite - Sofia University - Palo Alto",
    city: "Palo Alto, California",
    country: "United States",
    institutionType: "Private university",
    summary: "Sofia University's main Palo Alto campus, known for psychology and transpersonal psychology programmes, with GoElite recruitment support.",
    programs: ["Psychology", "Transpersonal Psychology"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.sofia.edu",
    wikipediaTitle: "Sofia University (California)",
  },
  {
    name: "Grant High School via South Australia Government Schools",
    city: "Mount Gambier, South Australia",
    country: "Australia",
    institutionType: "Public secondary school (South Australia Government Schools International Student Program)",
    summary: "A South Australian public secondary school hosting international students through the state government's international student programme.",
    programs: ["South Australian Certificate of Education (SACE)"],
    tuitionMin: 14000, tuitionMax: 17000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.granths.sa.edu.au",
    wikipediaTitle: "Grant High School (South Australia)",
  },
  {
    name: "Grenoble INP Institute of Technology via EIT InnoEnergy",
    city: "Grenoble",
    country: "France",
    institutionType: "Public engineering institute, delivering EIT InnoEnergy programmes",
    summary: "Grenoble's public engineering institute, delivering an EIT InnoEnergy joint master's in renewable energy alongside its own engineering degrees.",
    programs: ["Renewable Energy (EIT InnoEnergy MSc)", "Electrical Engineering", "Materials Science"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 90", "PTE 62"],
    tuitionMin: 9000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "total programme (2-year MSc)",
    tuitionNote: "EIT InnoEnergy's flat joint-master's programme fee; differs from Grenoble INP's general tuition schedule.",
    website: "https://www.grenoble-inp.fr",
    wikipediaTitle: "Grenoble Institute of Technology",
  },
  {
    name: "LCI Melbourne via LCI Network",
    city: "Melbourne",
    country: "Australia",
    institutionType: "Private creative and design college (LCI Network)",
    summary: "Melbourne campus of the LCI Network, offering diplomas and degrees in fashion, interior design and visual communication.",
    programs: ["Fashion Design", "Interior Design", "Visual Communication"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 44"],
    tuitionMin: 20000, tuitionMax: 25000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.lci.edu.au",
    wikipediaTitle: "LCI Education",
  },
  {
    name: "Le Cordon Bleu - Ottawa",
    city: "Ottawa, Ontario",
    country: "Canada",
    institutionType: "Private culinary arts school (Le Cordon Bleu network)",
    summary: "Ottawa campus of the globally renowned Le Cordon Bleu culinary institute.",
    programs: ["Diploma in Culinary Arts", "Diploma in Pâtisserie"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 44"],
    tuitionMin: 20000, tuitionMax: 25000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.cordonbleu.edu",
    wikipediaTitle: "Le Cordon Bleu",
  },
  {
    name: "Lester B. Pearson School Board - Gordon Robertson Beauty Academy (CI)",
    city: "Montreal (LaSalle), Quebec",
    country: "Canada",
    institutionType: "Public vocational beauty academy",
    summary: "A Lester B. Pearson School Board vocational beauty academy in LaSalle, Montreal, offering cosmetology and hairstyling diplomas.",
    programs: ["Cosmetology", "Esthetics", "Hairstyling"],
    ieltsOverall: 5.5, ieltsMinBand: 5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 10000, tuitionMax: 14000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.lbpsb.qc.ca",
    wikipediaTitle: "Lester B. Pearson School Board",
  },
  {
    name: "Lester B. Pearson School Board - Pearson Electrotechnology Centre (CI)",
    city: "Montreal, Quebec",
    country: "Canada",
    institutionType: "Public vocational electrotechnology centre",
    summary: "A Lester B. Pearson School Board vocational centre in Montreal, offering diplomas in electrical and building-systems trades.",
    programs: ["Electrical Installation", "Industrial Electronics", "Building Systems"],
    ieltsOverall: 5.5, ieltsMinBand: 5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 10000, tuitionMax: 14000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.lbpsb.qc.ca",
    wikipediaTitle: "Lester B. Pearson School Board",
  },
  coquitlamMiddle("Maillard Middle via Coquitlam School District"),
  coquitlamMiddle("Maple Creek Middle via Coquitlam School District"),
  {
    name: "Melbourne Polytechnic - Collingwood Campus",
    city: "Melbourne",
    country: "Australia",
    institutionType: "Public polytechnic regional campus",
    summary: "Melbourne Polytechnic's Collingwood campus, offering diplomas in business, visual arts and community services.",
    programs: ["Diploma of Business", "Visual Arts", "Community Services"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 44"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.melbournepolytechnic.edu.au",
    wikipediaTitle: "Melbourne Polytechnic",
  },
  {
    name: "Melbourne Polytechnic - Northern Lodge at Eden Park Campus",
    city: "Eden Park, Victoria",
    country: "Australia",
    institutionType: "Public polytechnic regional campus (agriculture-focused)",
    summary: "Melbourne Polytechnic's regional Eden Park campus, focused on agriculture and equine-studies programmes.",
    programs: ["Agriculture", "Equine Studies"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 44"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.melbournepolytechnic.edu.au",
    wikipediaTitle: "Melbourne Polytechnic",
  },
  {
    name: "Melbourne Polytechnic - Prahran Campus",
    city: "Melbourne",
    country: "Australia",
    institutionType: "Public polytechnic regional campus (arts-focused)",
    summary: "Melbourne Polytechnic's Prahran campus, offering diplomas in visual arts, photography and fashion design.",
    programs: ["Diploma of Visual Arts", "Photography", "Fashion Design"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 44"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.melbournepolytechnic.edu.au",
    wikipediaTitle: "Melbourne Polytechnic",
  },
  coquitlamMiddle("Minnekhada Middle via Coquitlam School District"),
  {
    name: "Mohawk College - Centre for Aviation Technology at Hamilton International Airport (YHM) (CI)",
    city: "Hamilton, Ontario",
    country: "Canada",
    institutionType: "Public college (dedicated aviation training centre)",
    summary: "Mohawk College's aviation training centre at Hamilton International Airport, offering flight and aircraft-structural diploma programmes.",
    programs: ["Aviation Technology - Flight", "Aircraft Structural Repair Technician"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 80", "PTE 56"],
    tuitionMin: 17000, tuitionMax: 22000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    tuitionNote: "Flight-training programmes run above the general diploma band due to flight-hour costs.",
    website: "https://www.mohawkcollege.ca",
    wikipediaTitle: "Mohawk College",
  },
  coquitlamMiddle("Montgomery Middle School via Coquitlam School District"),
  coquitlamMiddle("Moody Middle School of the Arts via Coquitlam School District"),
  {
    name: "Oxford International College Halifax via Oxford International Education Group",
    city: "Halifax, Nova Scotia",
    country: "Canada",
    institutionType: "Pathway college (Oxford International Education Group)",
    summary: "OIEG pathway college in Halifax, preparing international students for undergraduate entry into a partner Nova Scotia university.",
    programs: ["International Foundation Year", "Pre-Master's Programme"],
    ieltsOverall: 5.5, ieltsMinBand: 5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 15000, tuitionMax: 18000, tuitionCurrency: "CAD", tuitionPeriod: "per year (pathway)",
    website: "https://www.oxfordinternational.com",
    wikipediaTitle: "Oxford International Education Group",
  },
  {
    name: "Oxford International Education Group - Universal Higher Education",
    institutionType: "Pathway/higher-education brand (Oxford International Education Group)",
    summary: "An OIEG-affiliated higher-education brand; specific host institution and location could not be confirmed with confidence.",
    tuitionNote: "No reliable tuition figure found for this institution.",
    wikipediaTitle: "Oxford International Education Group",
  },
  coquitlamMiddle("Pitt River Middle via Coquitlam School District"),
  coquitlamSecondary("Port Moody Secondary via Coquitlam School District"),
  coquitlamSecondary("Riverside Secondary via Coquitlam School District"),
  coquitlamMiddle("Scott Creek Middle via Coquitlam School District"),
  {
    name: "Selkirk College - Tenth Street Campus (Nelson) (CI)",
    city: "Nelson, British Columbia",
    country: "Canada",
    institutionType: "Public college",
    summary: "Selkirk College's main Nelson campus, offering business, fine arts and environmental-planning diplomas.",
    programs: ["Business Administration (Diploma)", "Fine Arts", "Integrated Environmental Planning"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 80", "PTE 56"],
    tuitionMin: 15000, tuitionMax: 18000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.selkirk.ca",
    wikipediaTitle: "Selkirk College",
  },
  {
    name: "Shorelight Group - Heriot-Watt University - Orkney Campus",
    city: "Orkney",
    country: "United Kingdom",
    institutionType: "International student support partner (Shorelight), linked to Heriot-Watt University",
    summary: "Shorelight-supported international pathway at Heriot-Watt's small Orkney campus, focused on renewable energy and sustainable engineering.",
    programs: ["Renewable Energy", "Sustainable Engineering"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 78", "PTE 56"],
    tuitionMin: 19000, tuitionMax: 24000, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://www.hw.ac.uk",
    wikipediaTitle: "Heriot-Watt University",
  },
  {
    name: "Stirling - Scotland Education Centre via INTO",
    city: "Stirling",
    country: "United Kingdom",
    institutionType: "Pathway college (INTO), linked to University of Stirling",
    summary: "INTO pathway centre at the University of Stirling, offering foundation and pre-master's routes on a lochside Scottish campus.",
    programs: ["International Foundation Programme", "Pre-Master's Programme"],
    ieltsOverall: 5.5, ieltsMinBand: 5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 14500, tuitionMax: 17000, tuitionCurrency: "GBP", tuitionPeriod: "per year (pathway)",
    website: "https://www.stir.ac.uk",
    wikipediaTitle: "University of Stirling",
  },
  coquitlamMiddle("Summit Middle via Coquitlam School District"),
  coquitlamSecondary("Terry Fox Secondary via Coquitlam School District"),
  {
    name: "The Chang School Of Continuing Education At Toronto Metropolitan University",
    city: "Toronto, Ontario",
    country: "Canada",
    institutionType: "Public university continuing-education division",
    summary: "Toronto Metropolitan University's continuing-education division, offering certificate and pathway programmes for international students.",
    programs: ["English for Academic Purposes", "Business Certificate Programmes", "Professional Development Certificates"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 15000, tuitionMax: 19000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.torontomu.ca",
    wikipediaTitle: "Toronto Metropolitan University",
  },
  {
    name: "The North Land Institute of Training",
    institutionType: "Private vocational training institute",
    summary: "A private vocational training institute; specific location and accreditation details could not be confirmed with confidence.",
    tuitionNote: "No reliable tuition figure found for this institution.",
    wikipediaTitle: "The North Land Institute of Training",
  },
  {
    name: "University of Wolverhampton - Springfield Campus",
    city: "Wolverhampton",
    country: "United Kingdom",
    institutionType: "Public modern university campus (built environment)",
    summary: "University of Wolverhampton's built-environment campus, offering architecture, construction and real estate degrees.",
    programs: ["Architecture", "Construction Management", "Real Estate"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 14000, tuitionMax: 16000, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://www.wlv.ac.uk",
    wikipediaTitle: "University of Wolverhampton",
  },
  {
    name: "Up Education - New Zealand Management Academies (NZMA) - Wellington Campus",
    city: "Wellington",
    country: "New Zealand",
    institutionType: "Private vocational college (NZMA network, via UP Education)",
    summary: "NZMA's Wellington campus, offering vocational diplomas in business, beauty and cookery.",
    programs: ["Diploma in Business", "Diploma in Beauty Therapy", "New Zealand Certificate in Cookery"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 47"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.nzma.ac.nz",
    wikipediaTitle: "New Zealand Management Academies",
  },
  {
    name: "Whitireia and WelTec - Porirua Campus",
    city: "Porirua",
    country: "New Zealand",
    institutionType: "Public institutes of technology",
    summary: "The merged Whitireia and WelTec institutes' Porirua campus, offering nursing, business and IT programmes.",
    programs: ["Nursing", "Business", "Information Technology"],
    ieltsOverall: 6, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 80", "PTE 58"],
    tuitionMin: 20000, tuitionMax: 25000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.weltec.ac.nz",
    wikipediaTitle: "WelTec",
  },
  {
    name: "York University - Markham Campus",
    city: "Markham, Ontario",
    country: "Canada",
    institutionType: "Public university campus",
    summary: "York University's newer Markham campus, focused on business technology, digital media and software engineering programmes.",
    programs: ["Business Technology Management", "Digital Media", "Software Engineering"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 86", "PTE 60"],
    tuitionMin: 28000, tuitionMax: 36000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.yorku.ca",
    wikipediaTitle: "York University",
  },
  {
    name: "Alternis Business School",
    city: "Paris",
    country: "France",
    institutionType: "Private business school (apprenticeship-based)",
    summary: "Paris private business school specialising in apprenticeship-based (alternance) management, marketing and HR programmes.",
    programs: ["Management", "Marketing", "Human Resources"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 8000, tuitionMax: 11000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.alternis.fr",
    wikipediaTitle: "Alternis Business School",
  },
  {
    name: "American Collegiate - LA via Shorelight",
    city: "Los Angeles, California",
    country: "United States",
    institutionType: "Shorelight-supported pathway programme (American Collegiate)",
    summary: "A Shorelight-supported American Collegiate pathway programme in Los Angeles, preparing international students to transfer into partner US universities.",
    programs: ["Pathway to Business", "Pathway to Film and Media"],
    ieltsOverall: 5.5, ieltsMinBand: 5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 24000, tuitionMax: 28000, tuitionCurrency: "USD", tuitionPeriod: "per year (pathway + host tuition)",
    website: "https://shorelight.com",
    wikipediaTitle: "Shorelight Education",
  },
  {
    name: "Ascencia Valencia",
    city: "Valencia",
    country: "Spain",
    institutionType: "Private business school",
    summary: "Valencia campus of the Ascencia business school network, offering international business, marketing and management degrees.",
    programs: ["International Business", "Marketing", "Management"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 8000, tuitionMax: 11000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.ascencia-bs.com",
    wikipediaTitle: "Ascencia Business School",
  },
  {
    name: "Australia Institute of Business and Technology - International",
    city: "Sydney",
    country: "Australia",
    institutionType: "Private vocational college",
    summary: "AIBT's international-student division, offering vocational diplomas in business, IT and leadership.",
    programs: ["Diploma of Business", "Information Technology", "Leadership and Management"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 44"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.aibt.edu.au",
    wikipediaTitle: "Australia Institute of Business and Technology",
  },
  {
    name: "Centennial College - Performing Arts Centre (CI)",
    city: "Toronto, Ontario",
    country: "Canada",
    institutionType: "Public college (specialist performing-arts campus)",
    summary: "Centennial College's dedicated performing-arts campus in Toronto, offering diplomas in acting, theatre production and music industry arts.",
    programs: ["Acting for Media", "Theatre Production", "Music Industry Arts and Performance"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 16000, tuitionMax: 19000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.centennialcollege.ca",
    wikipediaTitle: "Centennial College",
  },
  {
    name: "City University in Canada - Calgary Campus (CI)",
    city: "Calgary, Alberta",
    country: "Canada",
    institutionType: "Private university satellite campus (City University of Seattle)",
    summary: "The Canadian Calgary campus of City University of Seattle, offering the MBA and counselling psychology programmes.",
    programs: ["MBA", "Business Administration", "Counselling Psychology"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 71", "PTE 53"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.cityu.edu",
    wikipediaTitle: "City University of Seattle",
  },
  {
    name: "City University in Canada - Edmonton Campus (CI)",
    city: "Edmonton, Alberta",
    country: "Canada",
    institutionType: "Private university satellite campus (City University of Seattle)",
    summary: "The Canadian Edmonton campus of City University of Seattle, offering the MBA and counselling psychology programmes.",
    programs: ["MBA", "Business Administration", "Counselling Psychology"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 71", "PTE 53"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.cityu.edu",
    wikipediaTitle: "City University of Seattle",
  },
  {
    name: "Conestoga College - Stratford Campus",
    city: "Stratford, Ontario",
    country: "Canada",
    institutionType: "Public college regional campus (digital media focus)",
    summary: "Conestoga College's Stratford campus, known for game development, digital media and UX design diplomas.",
    programs: ["Game Development", "Digital Media", "User Experience Design"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 60"],
    tuitionMin: 16000, tuitionMax: 19000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.conestogac.on.ca",
    wikipediaTitle: "Conestoga College",
  },
  {
    name: "Cégep Marie-Victorin",
    city: "Montreal, Quebec",
    country: "Canada",
    institutionType: "Public CEGEP",
    summary: "Montreal public CEGEP offering pre-university and technical diplomas in business and computer science.",
    programs: ["Pre-University Studies", "Business Administration (DEC)", "Computer Science Technology (DEC)"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 14000, tuitionMax: 17000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.collegemv.qc.ca",
    wikipediaTitle: "Cégep Marie-Victorin",
  },
  {
    name: "EF Academy New York via GE International",
    city: "Thornwood, New York",
    country: "United States",
    institutionType: "Private international boarding school (EF Academy network)",
    summary: "A private international boarding school near New York City offering the IB Diploma, hosting students via GE International.",
    programs: ["IB Diploma Programme", "College-Preparatory Diploma"],
    tuitionMin: 55000, tuitionMax: 62000, tuitionCurrency: "USD", tuitionPeriod: "per year (boarding, 2025/26)",
    website: "https://www.efacademy.org",
    wikipediaTitle: "EF Academy",
  },
  {
    name: "Eindhoven University of Technology (TU/e) via EIT InnoEnergy",
    city: "Eindhoven",
    country: "Netherlands",
    institutionType: "Public technical university, delivering EIT InnoEnergy programmes",
    summary: "A leading Dutch technical university, delivering an EIT InnoEnergy joint master's in sustainable energy technology alongside its own engineering degrees.",
    programs: ["Sustainable Energy Technology (EIT InnoEnergy MSc)", "Electrical Engineering"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 90", "PTE 62"],
    tuitionMin: 9000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "total programme (2-year MSc)",
    tuitionNote: "EIT InnoEnergy's flat joint-master's programme fee; differs from TU/e's general tuition schedule.",
    website: "https://www.tue.nl",
    wikipediaTitle: "Eindhoven University of Technology",
  },
  {
    name: "FOM University of Applied Sciences - Berlin Campus",
    city: "Berlin",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "FOM's Berlin campus, part of a large German private university network known for part-time and career-integrated study.",
    programs: ["Business Administration", "International Management", "Marketing"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 5000, tuitionMax: 7000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.fom.de",
    wikipediaTitle: "FOM University of Applied Sciences",
  },
  {
    name: "Fachhochschule des Mittelstands (FHM) University of Applied Sciences - Bielefeld Campus",
    city: "Bielefeld",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "FHM's Bielefeld campus, part of the German private university network offering business and management programmes.",
    programs: ["Business Administration", "International Management"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 6000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.fh-mittelstand.de",
    wikipediaTitle: "Fachhochschule des Mittelstands",
  },
  {
    name: "Fanshawe College - Woodstock-Oxford (Regional Campus) (GE)",
    city: "Woodstock, Ontario",
    country: "Canada",
    institutionType: "Public college regional campus",
    summary: "Fanshawe College's Woodstock-Oxford regional campus, offering business and health-support diplomas.",
    programs: ["Business Fundamentals", "Personal Support Worker", "Office Administration"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 80", "PTE 56"],
    tuitionMin: 15000, tuitionMax: 17500, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.fanshawec.ca",
    wikipediaTitle: "Fanshawe College",
  },
  {
    name: "Fresenius University of Applied Sciences - Duesseldorf Campus",
    city: "Düsseldorf",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "Fresenius's Düsseldorf campus, offering business, design and media programmes.",
    programs: ["Business Administration", "Design", "Media"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 9000, tuitionMax: 12000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.hs-fresenius.de",
    wikipediaTitle: "Hochschule Fresenius",
  },
  {
    name: "Fresenius University of Applied Sciences - Hamburg Campus",
    city: "Hamburg",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "Fresenius's Hamburg campus, offering business, design and health-science programmes.",
    programs: ["Business Administration", "Design", "Health Sciences"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 9000, tuitionMax: 12000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.hs-fresenius.de",
    wikipediaTitle: "Hochschule Fresenius",
  },
  {
    name: "Fresenius University of Applied Sciences - Heidelberg Campus",
    city: "Heidelberg",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "Fresenius's Heidelberg campus, offering business, psychology and media programmes.",
    programs: ["Business Administration", "Psychology", "Media"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 9000, tuitionMax: 12000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.hs-fresenius.de",
    wikipediaTitle: "Hochschule Fresenius",
  },
  {
    name: "Fresenius University of Applied Sciences - Munich Campus",
    city: "Munich",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "Fresenius's Munich campus, offering business, design and international management programmes.",
    programs: ["Business Administration", "Design", "International Management"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 9000, tuitionMax: 12000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    website: "https://www.hs-fresenius.de",
    wikipediaTitle: "Hochschule Fresenius",
  },
  {
    name: "GUS - The University of Law - Chester Campus",
    city: "Chester",
    country: "United Kingdom",
    institutionType: "Private law school (Global University Systems network)",
    summary: "The University of Law's Chester campus, offering the LLB, GDL and LPC to aspiring legal professionals.",
    programs: ["LLB Law", "Graduate Diploma in Law (GDL)", "Legal Practice Course (LPC)"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 79", "PTE 58"],
    tuitionMin: 15000, tuitionMax: 18000, tuitionCurrency: "GBP", tuitionPeriod: "per year (2025/26)",
    website: "https://www.law.ac.uk",
    wikipediaTitle: "University of Law",
  },
  {
    name: "Global Higher Education",
    institutionType: "Higher-education brand/provider",
    summary: "A higher-education provider or placement brand; specific institution, location and accreditation details could not be confirmed with confidence.",
    tuitionNote: "No reliable tuition figure found for this institution.",
    wikipediaTitle: "Global Higher Education",
  },
  {
    name: "Global School for Entrepreneurship University of Applied Sciences",
    city: "Berlin",
    country: "Germany",
    institutionType: "Private university of applied sciences",
    summary: "A German private university of applied sciences focused on entrepreneurship, innovation management and digital business.",
    programs: ["Entrepreneurship", "Innovation Management", "Digital Business"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 9000, tuitionMax: 12000, tuitionCurrency: "EUR", tuitionPeriod: "per year (2025/26)",
    wikipediaTitle: "Global School for Entrepreneurship",
  },
  {
    name: "GlobalU - Global Business Studies (GBS) - Dubai Online",
    city: "Dubai (online)",
    country: "United Arab Emirates",
    institutionType: "Private online business school",
    summary: "The online delivery arm of Global Business Studies' Dubai campus, offering business and marketing degrees remotely.",
    programs: ["Online Business Administration", "Marketing"],
    ieltsOverall: 5.5, ieltsAlternatives: ["TOEFL iBT 60", "PTE 44"],
    tuitionMin: 6000, tuitionMax: 9000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    wikipediaTitle: "Global Business Studies",
  },
  {
    name: "GoElite - Indiana Wesleyan University",
    city: "Marion, Indiana",
    country: "United States",
    institutionType: "Private Christian university",
    summary: "Indiana private Christian university offering business, nursing and education programmes, with GoElite recruitment support.",
    programs: ["Business Administration", "Nursing", "Education"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 24000, tuitionMax: 28000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.indwes.edu",
    wikipediaTitle: "Indiana Wesleyan University",
  },
  {
    name: "Hub - Baptist University of Florida",
    city: "Graceville, Florida",
    country: "United States",
    institutionType: "Private Baptist university",
    summary: "A small private Baptist university in Florida offering business, ministry and education programmes, with Hub International Education recruitment support.",
    programs: ["Business Administration", "Christian Ministry", "Education"],
    ieltsOverall: 6, ieltsAlternatives: ["TOEFL iBT 61", "PTE 44"],
    tuitionMin: 16000, tuitionMax: 20000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.baptistuniversity.edu",
    wikipediaTitle: "Baptist University of Florida",
  },
  {
    name: "Institut Polytechnique de Paris / École Polytechnique via EIT InnoEnergy",
    city: "Palaiseau",
    country: "France",
    institutionType: "Public engineering institute, delivering EIT InnoEnergy programmes",
    summary: "France's prestigious École Polytechnique, part of the Institut Polytechnique de Paris, delivering an EIT InnoEnergy joint master's in energy alongside its own elite engineering degrees.",
    programs: ["Energy Management and Innovation (EIT InnoEnergy MSc)", "Applied Physics"],
    ieltsOverall: 7, ieltsMinBand: 6.5, ieltsAlternatives: ["TOEFL iBT 100", "PTE 65"],
    tuitionMin: 9000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "total programme (2-year MSc)",
    tuitionNote: "EIT InnoEnergy's flat joint-master's programme fee; École Polytechnique's own tuition schedule differs by programme.",
    website: "https://www.polytechnique.edu",
    wikipediaTitle: "École Polytechnique",
  },
  {
    name: "Katholieke Universiteit Leuven (KU Leuven) via EIT InnoEnergy",
    city: "Leuven",
    country: "Belgium",
    institutionType: "Public research university, delivering EIT InnoEnergy programmes",
    summary: "Belgium's leading research university, delivering an EIT InnoEnergy joint master's in sustainable energy technology alongside its own engineering degrees.",
    programs: ["Sustainable Energy Technology (EIT InnoEnergy MSc)", "Electrical Engineering"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 90", "PTE 62"],
    tuitionMin: 9000, tuitionMax: 9000, tuitionCurrency: "EUR", tuitionPeriod: "total programme (2-year MSc)",
    tuitionNote: "EIT InnoEnergy's flat joint-master's programme fee; differs from KU Leuven's general tuition schedule.",
    website: "https://www.kuleuven.be",
    wikipediaTitle: "KU Leuven",
  },
  {
    name: "Lester B. Pearson School Board - John Killingbeck Pavillon Campus (CI)",
    city: "Lachine, Quebec",
    country: "Canada",
    institutionType: "Public adult and vocational education pavilion",
    summary: "A Lester B. Pearson School Board adult and vocational education pavilion in Lachine, Montreal, offering vocational diplomas and adult general education.",
    programs: ["Vocational Diploma Programmes (DEP)", "Adult General Education"],
    ieltsOverall: 5.5, ieltsMinBand: 5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 10000, tuitionMax: 14000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.lbpsb.qc.ca",
    wikipediaTitle: "Lester B. Pearson School Board",
  },
  {
    name: "Liston College via LightPath New Zealand Schools",
    city: "Auckland",
    country: "New Zealand",
    institutionType: "Public/Catholic secondary school (LightPath New Zealand Schools consortium)",
    summary: "An Auckland Catholic secondary school hosting international students through the LightPath New Zealand Schools consortium.",
    programs: ["National Certificate of Educational Achievement (NCEA)"],
    tuitionMin: 16000, tuitionMax: 19000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.liston.school.nz",
    wikipediaTitle: "Liston College",
  },
  {
    name: "London Metropolitan University via Education Centre of Australia (ECA)",
    city: "Sydney",
    country: "Australia",
    institutionType: "University branch delivery (London Metropolitan University, via Education Centre of Australia)",
    summary: "London Metropolitan University's business and computing degrees delivered in Sydney through the Education Centre of Australia.",
    programs: ["Business", "Computing"],
    ieltsOverall: 6, ieltsMinBand: 5.5, ieltsAlternatives: ["TOEFL iBT 72", "PTE 51"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.londonmet.ac.uk",
    wikipediaTitle: "London Metropolitan University",
  },
  {
    name: "Navitas Group - ACAP University College - Perth Campus",
    city: "Perth",
    country: "Australia",
    institutionType: "Private university college (Navitas network)",
    summary: "The Australian College of Applied Psychology's Perth campus, part of the Navitas network, offering psychology and counselling degrees.",
    programs: ["Psychology", "Counselling", "Community Services"],
    ieltsOverall: 6, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 79", "PTE 58"],
    tuitionMin: 24000, tuitionMax: 28000, tuitionCurrency: "AUD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.acap.edu.au",
    wikipediaTitle: "Australian College of Applied Psychology",
  },
  {
    name: "North Island College - Campbell River Campus (GE)",
    city: "Campbell River, British Columbia",
    country: "Canada",
    institutionType: "Public college",
    summary: "North Island College's Campbell River campus, offering business, health care assistant and university-transfer programmes.",
    programs: ["Business Administration", "Health Care Assistant", "University Transfer"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 88", "PTE 65"],
    tuitionMin: 15000, tuitionMax: 18000, tuitionCurrency: "CAD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.nic.bc.ca",
    wikipediaTitle: "North Island College",
  },
  {
    name: "NorthTec - Whangarei Campus",
    city: "Whangarei",
    country: "New Zealand",
    institutionType: "Public institute of technology (Te Pūkenga)",
    summary: "NorthTec's main Whangarei campus, offering business, maritime studies and nursing programmes.",
    programs: ["Business", "Maritime Studies", "Nursing"],
    ieltsOverall: 6, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 80", "PTE 58"],
    tuitionMin: 19000, tuitionMax: 24000, tuitionCurrency: "NZD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.northtec.ac.nz",
    wikipediaTitle: "NorthTec",
  },
  {
    name: "Notre Dame High School via GE International Schools",
    country: "United States",
    institutionType: "Private Catholic secondary school (via GE International Schools)",
    summary: "A private Catholic secondary school hosting international students via the GE International Schools placement network; several California schools share this name, so the specific campus could not be confirmed with confidence.",
    programs: ["College-Preparatory Diploma"],
    tuitionMin: 18000, tuitionMax: 22000, tuitionCurrency: "USD", tuitionPeriod: "per year (day, 2025/26)",
    wikipediaTitle: "Notre Dame High School",
  },
  {
    name: "Oxford International Pathway College - Oxford via Oxford International Education Group",
    city: "Oxford",
    country: "United Kingdom",
    institutionType: "Pathway college (Oxford International Education Group), linked to Oxford Brookes University",
    summary: "OIEG's Oxford pathway college, preparing international students for undergraduate and pre-master's entry into Oxford Brookes University.",
    programs: ["International Foundation Programme", "Pre-Master's Programme"],
    ieltsOverall: 5.5, ieltsMinBand: 5, ieltsAlternatives: ["TOEFL iBT 65", "PTE 47"],
    tuitionMin: 15000, tuitionMax: 17500, tuitionCurrency: "GBP", tuitionPeriod: "per year (pathway)",
    website: "https://www.brookes.ac.uk",
    wikipediaTitle: "Oxford Brookes University",
  },
  {
    name: "Shorelight Group - University of California - Berkeley",
    city: "Berkeley, California",
    country: "United States",
    institutionType: "International student support partner (Shorelight), linked to UC Berkeley Extension",
    summary: "Shorelight-supported extension and pathway programmes linked to UC Berkeley, one of the world's leading public research universities.",
    programs: ["Global Access Program", "Extension Pathway Programmes"],
    ieltsOverall: 6.5, ieltsMinBand: 6, ieltsAlternatives: ["TOEFL iBT 90", "PTE 62"],
    tuitionMin: 45000, tuitionMax: 50000, tuitionCurrency: "USD", tuitionPeriod: "per year (2025/26)",
    website: "https://www.berkeley.edu",
    wikipediaTitle: "University of California, Berkeley",
  },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

// ── Image resolution — same approach as batches 1-6 ──

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
  console.log(`Seeding ${INSTITUTIONS.length} institutions (batch 7)...`);

  for (const [i, inst] of INSTITUTIONS.entries()) {
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