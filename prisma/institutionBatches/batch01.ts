// prisma/institutionBatches/batch41.ts
//
// Batch 41: rows 255 to 259 of RGR University List (all Canada).
//   255  Cape Breton University                           (public university, Sydney, Nova Scotia)
//   256  Cégep de la Gaspésie et des Îles                 (public Cegep, Gaspé, Quebec, French language)
//   257  Cégep Marie-Victorin                             (public Cegep, Montreal, Quebec, French language)
//   258  Columbia College                                 (private college, Vancouver, British Columbia)
//   259  Conestoga College                                (public college, Kitchener, Ontario)
//
// That gives 5 institutions from 5 PDF rows, nothing skipped. Batch 40 ended at row 254. The next batch starts at row 260.
//
// HEADS UP FOR THE NEXT BATCH (rows 260 onward): row 260 is Crandall University (Moncton, New Brunswick), row 261 is
// DEA Canadian College, row 262 is Georgian College (Barrie, Ontario), row 263 is Justice Institute of British Columbia
// and row 264 is Kwantlen Polytechnic University. Copy the Canada helpers from this file, because each batch file
// is self contained. Trinity Western University is row 312 (Canada, the PDF also lists it as row 178 under USA, so
// check the slug before writing) and Saint Louis University (Madrid) is row 340, and needs its own slug because
// Saint Louis University (row 170) is the Missouri university. Use "Canada" as the country value.
//
// QUEBEC CEGEPS (rows 256 and 257): both are public Cegeps and teach mainly in French. Study in Quebec needs a CAQ
// before the study permit, and a French test (TEF or TCF) is the usual language proof, so these two rows use their own
// document pack (CA_DOCUMENTS_QC_FR_UG_ONLY). The engine needs an English score value, so ieltsOverall is filled in
// with a typical figure, but the English score note says that French is the main requirement and the English
// score may not apply. Confirm the real rule with each Cegep. Programmes are stored at the Undergraduate level with
// the degree "DEC" (pre university DEC is 2 years, technical DEC is 3 years).
//
// CEGEP DE LA GASPESIE ET DES ILES (row 256): it has campuses in Gaspe, Carleton sur Mer, Grande Riviere and the
// Magdalen Islands. It is in a small, remote region, so check what is open to international students before you
// promote it. The campus list uses the best known locations. Confirm each address.
//
// COLUMBIA COLLEGE (row 258): written as the Vancouver private college known for university transfer programmes.
// Confirm the transfer partners, the programme names and the wikipediaTitle.
//
// COURSES: no course fee is stored in this batch. No fee figure was checked for any of these five, so every course
// leaves the amount out and says to confirm the fee. Course names are typical programmes for each college or
// university and should be checked against its current programme list.
//
// TEXT LIMITS: every text field is one paragraph and stays inside the engine limits (summary 320, ieltsNote 160,
// tuitionNote 160, metaTitle 70, metaDescription 170, overview/studentLife/accommodation/library/sports 450,
// course and campus description 300, FAQ answer 400). Run with --dry first to confirm the batch passes.
//
// IMPORTANT, HOW SURE EACH ENTRY IS: no web searches were done for this batch. Everything is from general
// knowledge, so treat all of it as "confirm before it reaches students". The least certain items are:
//   - Every English or French score (IELTS, TOEFL, Duolingo, TEF, TCF). These change often, so confirm each on
//     the school pages. They are written as typical minimums, not verified figures.
//   - Cape Breton University: confirm the programme names, the graduate programmes, the intakes, the athletics
//     details and the housing position.
//   - Both Cegeps: confirm the programme names, the language of teaching for international students, the
//     intakes, the campus addresses and the website pages.
//   - Columbia College: confirm the programme names, the partner universities, the intakes and the housing help.
//   - Conestoga College: confirm the programme names, the graduate certificates, which campus teaches each
//     programme, the intakes and the athletics details.
//   - Founding years and street addresses come from general knowledge. Confirm each.
//   Left out on purpose: tuition figures, acceptance rate, ranking, social links and anything unconfirmed.
//   Library, sports and student life paragraphs are kept general on purpose, and each one says to check
//   the school pages for current details.
//
// Before running: the engine in seedInstitutions.ts runs each institution's child writes in one array
// $transaction. If slow database calls fail, move to the interactive $transaction with timeout 60000.
//
// Run:  npm run seed:institutions -- 41

import type { CourseInput, DocumentRow, FaqInput, InstitutionInput } from "./types";

// ── Shared Canada helpers ────────────────────────────────────────────────

// General study permit pack for Canada. Confirm anything specific with the
// international office of each college or university.
const CA_DOCUMENTS: Record<string, DocumentRow[]> = {
  Undergraduate: [
    ["Identity", "Passport"],
    ["Academic", "High school transcripts and certificates"],
    ["Academic", "English language test result"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Proof of tuition payment"],
    ["Visa", "Letter of acceptance from the school"],
    ["Visa", "Provincial attestation letter, if required"],
    ["Visa", "Study permit application and police certificate"],
  ],
  Postgraduate: [
    ["Identity", "Passport"],
    ["Academic", "Degree certificate and transcripts"],
    ["Academic", "CV or resume"],
    ["Academic", "Statement of purpose"],
    ["Academic", "English language test result"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Proof of tuition payment"],
    ["Visa", "Letter of acceptance from the school"],
    ["Visa", "Provincial attestation letter, if required"],
    ["Visa", "Study permit application and police certificate"],
  ],
};

// Schools that teach undergraduate level programmes only.
const CA_DOCUMENTS_UG_ONLY: Record<string, DocumentRow[]> = {
  Undergraduate: CA_DOCUMENTS.Undergraduate,
};

// Quebec French language Cegeps need a CAQ (Quebec acceptance certificate) before the study permit.
const CA_DOCUMENTS_QC_FR_UG_ONLY: Record<string, DocumentRow[]> = {
  Undergraduate: [
    ["Identity", "Passport"],
    ["Academic", "High school transcripts and certificates"],
    ["Academic", "French language test result (TEF or TCF)"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Proof of tuition payment"],
    ["Visa", "Letter of acceptance from the Cegep"],
    ["Visa", "Quebec Acceptance Certificate (CAQ)"],
    ["Visa", "Study permit application and police certificate"],
  ],
};

function caFaqs(o: {
  name: string;
  sector: "public" | "private";
  place: string;
  known: string;
  ielts: string;
  fees: string;
  intakes: string;
}): FaqInput[] {
  return [
    {
      question: `Is ${o.name} a public or private institution?`,
      answer: `It is a ${o.sector} institution in ${o.place}.`,
    },
    { question: `What is ${o.name} known for?`, answer: o.known },
    { question: `What English score do I need for ${o.name}?`, answer: o.ielts },
    { question: `How much are tuition fees for international students at ${o.name}?`, answer: o.fees },
    { question: `When can I start at ${o.name}?`, answer: o.intakes },
  ];
}

function seo(name: string, place: string) {
  return {
    metaTitle: `Study at ${name} | RGR`,
    metaDescription: `Explore ${name} in ${place}. Compare courses, fees and entry requirements, then apply with RGR.`,
  };
}

function ug(
  name: string,
  degree: string,
  subject: string,
  duration: string | undefined,
  nextIntake: string | undefined,
  intakes: string | undefined,
  tuitionAmount?: number,
  description?: string,
  period: string = "per year (2026/27)"
): CourseInput {
  return {
    name,
    level: "Undergraduate",
    degree,
    subject,
    duration,
    nextIntake,
    intakes,
    tuitionAmount,
    tuitionCurrency: "CAD",
    tuitionPeriod: period,
    description,
  };
}

function pg(
  name: string,
  degree: string,
  subject: string,
  duration: string | undefined,
  nextIntake: string | undefined,
  intakes: string | undefined,
  tuitionAmount?: number,
  description?: string,
  period: string = "per year (2026/27)"
): CourseInput {
  return {
    name,
    level: "Postgraduate",
    degree,
    subject,
    duration,
    nextIntake,
    intakes,
    tuitionAmount,
    tuitionCurrency: "CAD",
    tuitionPeriod: period,
    description,
  };
}

// Short repeated sentence for courses where no fee was found.
const CONFIRM_FEE = "Confirm the fee with admissions before you apply.";

export const INSTITUTIONS: InstitutionInput[] = [
  // ── PDF row 255 ────────────────────────────────────────────────────────
  {
    name: "Cape Breton University",
    slug: "cape-breton-university",
    city: "Sydney",
    country: "Canada",
    institutionType: "Public university",
    website: "https://www.cbu.ca",
    founded: 1974,
    upcomingIntake: "Jan 2027",
    programs: ["Business", "Computer Science", "Community Studies"],
    summary:
      "A public university in Sydney, Nova Scotia, on Cape Breton Island, founded in 1974, known for business, science, community studies and a large, welcoming international student community in a smaller, calmer Atlantic setting.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 78", "Duolingo 105"],
    ieltsNote:
      "Typical minimums: IELTS 6.0, TOEFL iBT 78 or Duolingo 105, and graduate programmes ask more. Not verified. Confirm on the CBU website.",
    tuitionCurrency: "CAD",
    tuitionNote: "No tuition figure was confirmed. CBU publishes international tuition by programme. Confirm on its website.",
    overview:
      "Cape Breton University is a public university in Sydney, Nova Scotia, on Cape Breton Island, founded in 1974. It offers bachelor's and master's degrees in business, science, community studies and more, with small classes, a large international student community and a calmer, lower cost setting than a big city.",
    studentLife:
      "The international office supports new students with arrival, study and work questions, and the campus has clubs, cultural groups and events. Sydney is a small city with ocean and hiking nearby, and part time work is more limited than in a big city. Check the CBU pages for current events and support.",
    accommodation:
      "CBU has residence halls on campus, and many students also rent rooms or shared homes in Sydney. Check the housing pages for current options and booking dates, and apply early.",
    library:
      "The university library offers study spaces, computers and online collections, and tutoring and writing support help with coursework. Check the library pages for opening hours and services.",
    sports:
      "CBU competes in college athletics as the Capers, and students can also join intramural and club sports. Check the athletics and recreation pages for current teams and memberships.",
    wikipediaTitle: "Cape Breton University",
    ...seo("Cape Breton University", "Sydney, Nova Scotia"),
    courses: [
      ug("Bachelor of Business Administration (BBA)", "BBA", "Business", "4 Years", "Jan 2027", "January, May and September", undefined, "A business degree in management, marketing, finance and accounting. Confirm the programme name. " + CONFIRM_FEE),
      ug("Bachelor of Science in Computer Science", "BSc", "Computer Science", "4 Years", "Jan 2027", "January, May and September", undefined, "A computing degree in programming, data and software. Confirm the programme name. " + CONFIRM_FEE),
      ug("Bachelor of Arts in Psychology", "BA", "Psychology", "4 Years", "Jan 2027", "January, May and September", undefined, "A degree in human behaviour and research methods. Confirm the programme name. " + CONFIRM_FEE),
      ug("Bachelor of Science in Biology", "BSc", "Biology", "4 Years", "Jan 2027", "January, May and September", undefined, "A science degree for health careers and research. Confirm the programme name. " + CONFIRM_FEE),
      pg("Master of Business Administration in Community Economic Development", "MBA", "Business", "2 Years", "Jan 2027", "January, May and September", undefined, "A graduate business degree with a community and economic development focus. Confirm the programme name and intake. " + CONFIRM_FEE),
      pg("Master of Education", "MEd", "Education", "2 Years", "Jan 2027", "January, May and September", undefined, "A graduate degree for teachers and school leaders. Confirm the programme name and whether international students can apply. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "Sydney Campus",
        city: "Sydney",
        address: "1250 Grand Lake Road, Sydney, NS B1P 6L2",
        description: "The main campus in Sydney, Nova Scotia, with teaching buildings, the library, residence halls, athletics facilities and the international office.",
      },
    ],
    documents: CA_DOCUMENTS,
    faqs: caFaqs({
      name: "Cape Breton University",
      sector: "public",
      place: "Sydney, Nova Scotia",
      known:
        "CBU is known for business, science and community studies, a large international student community, and a calm Atlantic island setting with a lower cost of living than big cities.",
      ielts:
        "Typical minimums are IELTS 6.0, TOEFL iBT 78 or Duolingo 105, and graduate programmes ask for more. These were not verified, so confirm the exact score for your programme with admissions.",
      fees:
        "No tuition figure was confirmed for this listing. CBU publishes international tuition by programme, and housing and living costs are extra. Confirm the current figures on its website.",
      intakes:
        "You can usually start in September, January or May, and some programmes start only once a year. Check the international admissions page for current deadlines and apply early to leave time for your study permit.",
    }),
  },

  // ── PDF row 256 ────────────────────────────────────────────────────────
  {
    name: "Cégep de la Gaspésie et des Îles",
    slug: "cegep-de-la-gaspesie-et-des-iles",
    city: "Gaspé",
    country: "Canada",
    institutionType: "Public college (Cegep)",
    website: "https://www.cegepgim.ca",
    upcomingIntake: "Jan 2027",
    programs: ["Technical Programmes", "Pre University Studies", "Marine and Fisheries"],
    summary:
      "A public Cegep in the Gaspé region of Quebec, with campuses in Gaspé, Carleton sur Mer, Grande Rivière and the Magdalen Islands, known for French language technical and pre university programmes and a quiet coastal setting.",
    ieltsOverall: 5.5,
    ieltsAlternatives: ["TOEFL iBT 60"],
    ieltsNote:
      "Teaching is mainly in French, so a French test (TEF or TCF) is the main requirement and an English score may not apply. Not verified. Confirm with the Cegep.",
    tuitionCurrency: "CAD",
    tuitionNote: "No tuition figure was confirmed. International students pay set fees per year. Confirm the current fee with the Cegep.",
    overview:
      "Cégep de la Gaspésie et des Îles is a public college in Quebec's Gaspé region, with campuses in Gaspé, Carleton sur Mer, Grande Rivière and the Magdalen Islands. It offers pre university and technical programmes taught mainly in French, in small classes and a quiet coastal setting far from the big cities.",
    studentLife:
      "Classes are small and teachers know their students, and the Cegep runs activities, clubs and support for new students. The region offers sea, forest and mountains, with a slow pace and fewer part time jobs than in Montreal. Check the Cegep pages for current events and support.",
    accommodation:
      "Students usually rent rooms or shared homes near their campus, and the Cegep may help with housing. Check with the Cegep for current options, and apply early, since the towns are small.",
    library:
      "Each campus has a library and learning centre, with study spaces, computers and help with coursework. Check the Cegep pages for opening hours and services.",
    sports:
      "The Cegep runs sports and outdoor activities for students, and the region is good for hiking, skiing and sea sports. Check the Cegep pages for current teams and clubs.",
    wikipediaTitle: "Cégep de la Gaspésie et des Îles",
    ...seo("Cégep de la Gaspésie et des Îles", "Gaspé, Quebec"),
    courses: [
      ug("DEC Pre University Social Science", "DEC", "Social Science", "2 Years", "Jan 2027", "August and January", undefined, "A two year pre university programme that prepares you for university. Confirm the programme name, language and offer for international students. " + CONFIRM_FEE),
      ug("DEC Computer Science Technology", "DEC", "Computer Science", "3 Years", "Jan 2027", "August and January", undefined, "A three year technical programme in software and computing. Confirm the programme name, language and offer for international students. " + CONFIRM_FEE),
      ug("DEC Nursing", "DEC", "Nursing", "3 Years", "Jan 2027", "August and January", undefined, "A three year technical programme in nursing care with clinical placements. Confirm the programme name and whether international students can apply. " + CONFIRM_FEE),
      ug("DEC Fisheries and Aquaculture Technology", "DEC", "Marine Studies", "3 Years", "Jan 2027", "August and January", undefined, "A three year technical programme in fisheries, aquaculture and marine work. Confirm the programme name, campus and offer for international students. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "Gaspé Campus",
        city: "Gaspé",
        address: "94 Rue Jacques Cartier, Gaspé, QC G4X 2S8",
        description: "The main campus in Gaspé, with classrooms, the library and student services. Confirm the address with the Cegep.",
      },
      {
        name: "Carleton sur Mer Campus",
        city: "Carleton sur Mer",
        address: "Carleton sur Mer, Quebec. Confirm the street address with the Cegep.",
        description: "A campus on the Baie des Chaleurs with classrooms and student services.",
      },
      {
        name: "Grande Rivière Campus",
        city: "Grande Rivière",
        address: "Grande Rivière, Quebec. Confirm the street address with the Cegep.",
        description: "A campus with workshops and training for marine and fisheries programmes.",
      },
      {
        name: "Magdalen Islands Campus",
        city: "Îles de la Madeleine",
        address: "Îles de la Madeleine, Quebec. Confirm the street address with the Cegep.",
        description: "A campus on the Magdalen Islands with classrooms and student services.",
      },
    ],
    documents: CA_DOCUMENTS_QC_FR_UG_ONLY,
    faqs: caFaqs({
      name: "Cégep de la Gaspésie et des Îles",
      sector: "public",
      place: "the Gaspé region of Quebec",
      known:
        "The Cegep is known for French language technical and pre university programmes, small classes and a quiet coastal setting with several campuses in the Gaspé region.",
      ielts:
        "Teaching is mainly in French, so a French test (TEF or TCF) is the main requirement and an English score may not apply. These details were not verified, so confirm the rule with admissions.",
      fees:
        "No tuition figure was confirmed for this listing. International students pay set fees per year, and housing and living costs are extra. Confirm the current figures with the Cegep.",
      intakes:
        "Programmes usually start in August, with some starts in January. Quebec study needs a CAQ before the study permit, so apply early and confirm the deadlines with the Cegep.",
    }),
  },

  // ── PDF row 257 ────────────────────────────────────────────────────────
  {
    name: "Cégep Marie-Victorin",
    slug: "cegep-marie-victorin",
    city: "Montreal",
    country: "Canada",
    institutionType: "Public college (Cegep)",
    website: "https://www.collegemv.qc.ca",
    founded: 1968,
    upcomingIntake: "Jan 2027",
    programs: ["Accounting", "Computer Science", "Health Sciences"],
    summary:
      "A public Cegep in Montreal, Quebec, founded in 1968, known for French language pre university and technical programmes in business, computing and health, in a large and lively student city with an international community.",
    ieltsOverall: 5.5,
    ieltsAlternatives: ["TOEFL iBT 60"],
    ieltsNote:
      "Teaching is mainly in French, so a French test (TEF or TCF) is the main requirement and an English score may not apply. Not verified. Confirm with the Cegep.",
    tuitionCurrency: "CAD",
    tuitionNote: "No tuition figure was confirmed. International students pay set fees per year. Confirm the current fee with the Cegep.",
    overview:
      "Cégep Marie-Victorin is a public college in Montreal, Quebec, founded in 1968. It offers pre university and technical programmes in business, computing, health and science, taught mainly in French, with student services, an international community and the opportunities of a large city.",
    studentLife:
      "The Cegep has clubs, student groups and events, and staff help international students settle in and plan their studies. Montreal offers transit, part time work and a mix of French and English life. Check the Cegep pages for current events and support.",
    accommodation:
      "The Cegep has no residence halls, so students rent rooms or shared apartments in Montreal, and many choose homes close to the metro. Check with the Cegep for current housing help, and apply early.",
    library:
      "The Cegep library offers study spaces, computers and online collections, and learning support helps with coursework and French. Check the library pages for opening hours and services.",
    sports:
      "The Cegep has sports teams and recreation activities for students. Check the Cegep pages for current teams, facilities and memberships.",
    wikipediaTitle: "Cégep Marie-Victorin",
    ...seo("Cégep Marie-Victorin", "Montreal, Quebec"),
    courses: [
      ug("DEC Pre University Social Science", "DEC", "Social Science", "2 Years", "Jan 2027", "August and January", undefined, "A two year pre university programme that prepares you for university. Confirm the programme name, language and offer for international students. " + CONFIRM_FEE),
      ug("DEC Accounting and Management Technology", "DEC", "Accounting", "3 Years", "Jan 2027", "August and January", undefined, "A three year technical programme in accounting and business management. Confirm the programme name, language and offer for international students. " + CONFIRM_FEE),
      ug("DEC Computer Science Technology", "DEC", "Computer Science", "3 Years", "Jan 2027", "August and January", undefined, "A three year technical programme in software and computing. Confirm the programme name, language and offer for international students. " + CONFIRM_FEE),
      ug("DEC Nursing", "DEC", "Nursing", "3 Years", "Jan 2027", "August and January", undefined, "A three year technical programme in nursing care with clinical placements. Confirm the programme name and whether international students can apply. " + CONFIRM_FEE),
      ug("DEC Pre University Health Sciences", "DEC", "Health Sciences", "2 Years", "Jan 2027", "August and January", undefined, "A two year pre university programme in science for health careers. Confirm the programme name, language and offer for international students. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "Montreal Campus",
        city: "Montreal",
        address: "7000 Rue Marie-Victorin, Montreal, QC H1G 2J6",
        description: "The main campus in Montreal, with classrooms, the library, sports facilities and student services. Confirm the address with the Cegep.",
      },
    ],
    documents: CA_DOCUMENTS_QC_FR_UG_ONLY,
    faqs: caFaqs({
      name: "Cégep Marie-Victorin",
      sector: "public",
      place: "Montreal, Quebec",
      known:
        "The Cegep is known for French language pre university and technical programmes in business, computing and health, in the large student city of Montreal.",
      ielts:
        "Teaching is mainly in French, so a French test (TEF or TCF) is the main requirement and an English score may not apply. These details were not verified, so confirm the rule with admissions.",
      fees:
        "No tuition figure was confirmed for this listing. International students pay set fees per year, and housing and Montreal living costs are extra. Confirm the current figures with the Cegep.",
      intakes:
        "Programmes usually start in August, with some starts in January. Quebec study needs a CAQ before the study permit, so apply early and confirm the deadlines with the Cegep.",
    }),
  },

  // ── PDF row 258 ────────────────────────────────────────────────────────
  {
    name: "Columbia College",
    slug: "columbia-college-vancouver",
    city: "Vancouver",
    country: "Canada",
    institutionType: "Private college",
    website: "https://www.columbiacollege.ca",
    founded: 1936,
    upcomingIntake: "Jan 2027",
    programs: ["University Transfer", "Business", "Sciences"],
    summary:
      "A private college in downtown Vancouver, British Columbia, founded in 1936, known for university transfer programmes, small classes and English language support that lead into the second or third year of degrees at British Columbia universities.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 80", "Duolingo 105"],
    ieltsNote:
      "Typical minimums: IELTS 6.0, TOEFL iBT 80 or Duolingo 105, and some programmes ask more. Not verified. Confirm on the Columbia College website.",
    tuitionCurrency: "CAD",
    tuitionNote: "No tuition figure was confirmed. Columbia publishes fees by programme and course load. Confirm on its website.",
    overview:
      "Columbia College is a private college in downtown Vancouver, British Columbia, founded in 1936. It is known for university transfer programmes that let students complete the first years of a degree in small classes, then move on to partner universities in British Columbia, with English language support for new students.",
    studentLife:
      "The college has an international student team, clubs and events, and advisors who help students plan their transfer. Vancouver offers transit, part time work, mountains and the sea. Check the college pages for current events and support.",
    accommodation:
      "Columbia offers homestay and housing help, and many students also rent rooms or shared apartments in Vancouver. Rents are high, so check the housing pages for current options and apply early.",
    library:
      "The college library offers study spaces, computers and online collections, and tutoring and writing support help with coursework. Check the library pages for opening hours and services.",
    sports:
      "Columbia is a downtown college, so student activity centres on clubs, events and recreation rather than varsity teams. Vancouver offers many sports and outdoor options nearby.",
    wikipediaTitle: "Columbia College (Vancouver)",
    ...seo("Columbia College", "Vancouver, British Columbia"),
    courses: [
      ug("University Transfer Arts", "Transfer", "Arts", "2 Years", "Jan 2027", "January, May and September", undefined, "A two year transfer programme in arts subjects for a bachelor's degree at a university. Confirm the programme name and transfer partners. " + CONFIRM_FEE),
      ug("University Transfer Business", "Transfer", "Business", "2 Years", "Jan 2027", "January, May and September", undefined, "A two year transfer programme in business for a bachelor's degree at a university. Confirm the programme name and transfer partners. " + CONFIRM_FEE),
      ug("University Transfer Science", "Transfer", "Science", "2 Years", "Jan 2027", "January, May and September", undefined, "A two year transfer programme in science for a bachelor's degree at a university. Confirm the programme name and transfer partners. " + CONFIRM_FEE),
      ug("University Transfer Computer Science", "Transfer", "Computer Science", "2 Years", "Jan 2027", "January, May and September", undefined, "A two year transfer programme in computing for a bachelor's degree at a university. Confirm the programme name and transfer partners. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "Vancouver Campus",
        city: "Vancouver",
        address: "438 Terminal Avenue, Vancouver, BC V6A 0C1",
        description: "The main campus in downtown Vancouver, with classrooms, the library and student services. Confirm the address with the college.",
      },
    ],
    documents: CA_DOCUMENTS_UG_ONLY,
    faqs: caFaqs({
      name: "Columbia College",
      sector: "private",
      place: "Vancouver, British Columbia",
      known:
        "Columbia College is known for university transfer programmes, small classes, English language support and a downtown Vancouver campus that leads into British Columbia universities.",
      ielts:
        "Typical minimums are IELTS 6.0, TOEFL iBT 80 or Duolingo 105, and some programmes ask for more. These were not verified, so confirm the exact score for your programme with admissions.",
      fees:
        "No tuition figure was confirmed for this listing. Columbia publishes fees by programme and course load, and housing and Vancouver living costs are extra. Confirm the current figures on its website.",
      intakes:
        "Programmes usually start in January, May and September. Check the admissions page for current deadlines and apply early to leave time for your study permit.",
    }),
  },

  // ── PDF row 259 ────────────────────────────────────────────────────────
  {
    name: "Conestoga College",
    slug: "conestoga-college",
    city: "Kitchener",
    country: "Canada",
    institutionType: "Public college",
    website: "https://www.conestogac.on.ca",
    founded: 1967,
    upcomingIntake: "Jan 2027",
    programs: ["Business", "Engineering Technology", "Information Technology"],
    summary:
      "A public college in Kitchener, Ontario, in the Waterloo region, founded in 1967, known for hands on diplomas, degrees and graduate certificates in business, technology, engineering, health and trades, with co op and strong employer links.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 80", "Duolingo 105"],
    ieltsNote:
      "Typical minimums: IELTS 6.0 for diplomas, higher for some degrees and graduate certificates, or TOEFL iBT 80 or Duolingo 105. Not verified. Confirm on the Conestoga website.",
    tuitionCurrency: "CAD",
    tuitionNote: "No tuition figure was confirmed. Conestoga publishes international fees by programme. Confirm on its website.",
    overview:
      "Conestoga College is a public college in Kitchener, Ontario, in the Waterloo region, founded in 1967. It offers diplomas, degrees and graduate certificates in business, technology, engineering, health and trades, with hands on learning, co op placements, employer links and campuses across southwestern Ontario.",
    studentLife:
      "The college has an international centre that supports new students, and the campuses have clubs, events and career services. Kitchener and Waterloo have a strong technology scene, with transit and part time work, and Toronto is within driving distance. Check the college pages for current events.",
    accommodation:
      "Conestoga has residence at the Doon campus, and many students also rent rooms or shared homes in Kitchener, Waterloo and nearby cities. Check the housing pages for current options and booking dates, and apply early.",
    library:
      "The college libraries offer study spaces, computers and online collections, and learning support helps with coursework and writing. Check the library pages for opening hours and services.",
    sports:
      "Conestoga competes in college athletics as the Condors, and students can also join intramural and recreation activities. Check the athletics and recreation pages for current teams and memberships.",
    wikipediaTitle: "Conestoga College",
    ...seo("Conestoga College", "Kitchener, Ontario"),
    courses: [
      ug("Business Diploma", "Diploma", "Business", "2 Years", "Jan 2027", "January, May and September", undefined, "A two year diploma in management, marketing and finance. Confirm the programme name and campus. " + CONFIRM_FEE),
      ug("Computer Programmer Diploma", "Diploma", "Information Technology", "2 Years", "Jan 2027", "January, May and September", undefined, "A two year diploma in programming, databases and software. Confirm the programme name and campus. " + CONFIRM_FEE),
      ug("Mechanical Engineering Technology Advanced Diploma", "Advanced Diploma", "Engineering", "3 Years", "Jan 2027", "January, May and September", undefined, "A three year advanced diploma in design, machines and manufacturing. Confirm the programme name and campus. " + CONFIRM_FEE),
      ug("Early Childhood Education Diploma", "Diploma", "Education", "2 Years", "Jan 2027", "January, May and September", undefined, "A two year diploma in child development and early learning with placements. Confirm the programme name and campus. " + CONFIRM_FEE),
      pg("Project Management Graduate Certificate", "Graduate Certificate", "Project Management", "1 Year", "Jan 2027", "January, May and September", undefined, "A one year graduate certificate in planning, leading and delivering projects. Confirm the programme name and campus. " + CONFIRM_FEE),
      pg("Supply Chain Management Graduate Certificate", "Graduate Certificate", "Supply Chain", "1 Year", "Jan 2027", "January, May and September", undefined, "A one year graduate certificate in logistics, purchasing and operations. Confirm the programme name and campus. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "Doon Campus",
        city: "Kitchener",
        address: "299 Doon Valley Drive, Kitchener, ON N2G 4M4",
        description: "The main campus in Kitchener, with teaching buildings, labs, the library, residence and the international centre. Confirm the address with the college.",
      },
    ],
    documents: CA_DOCUMENTS,
    faqs: caFaqs({
      name: "Conestoga College",
      sector: "public",
      place: "Kitchener, Ontario",
      known:
        "Conestoga is known for hands on diplomas, degrees and graduate certificates in business, technology, engineering, health and trades, with co op placements and strong employer links in the Waterloo region.",
      ielts:
        "Typical minimums are IELTS 6.0 for diplomas, higher for some degrees and graduate certificates, or TOEFL iBT 80 or Duolingo 105. These were not verified, so confirm the exact score for your programme with admissions.",
      fees:
        "No tuition figure was confirmed for this listing. Conestoga publishes international fees by programme, and housing and living costs are extra. Confirm the current figures on its website.",
      intakes:
        "Programmes usually start in January, May and September, and some start only once a year. Check the international admissions page for current deadlines and apply early to leave time for your study permit.",
    }),
  },
];