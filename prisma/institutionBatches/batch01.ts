// prisma/institutionBatches/batch22.ts
//
// Batch 22: rows 122 to 128 of RGR University List new.pdf (all USA).
//   122  New York Institute of Technology (University)
//   123  Purdue University Northwest
//   124  Sacred Heart University
//   125  Santa Monica College
//   126  Seattle Colleges - North Seattle College
//   127  Seattle Colleges - Seattle Central College
//   128  Seattle Colleges - South Seattle College
//
// That gives 7 institutions from 7 PDF rows, nothing merged. Batch 21 ended at row 121. Santa Monica College
// also appears at row 228, so skip it later. The next batch starts at row 129 (Southern Illinois University
// Carbondale).
//
// The three Seattle Colleges share one district, one international office, one cost table and one English rule,
// so they use shared constants the same way the Contra Costa colleges did. Each college still has its own entry,
// campus and course list.
//
// New York Institute of Technology here is the New York (USA) university. It is a different school from
// NYIT Vancouver (row 268, Canada), and the slugs do not clash.
//
// Country is written as "United States" for every entry, because the engine rejects "USA".
//
// HEADS UP FOR THE NEXT BATCH (rows 129 to 135): Southern Illinois University Carbondale, Southwest Minnesota
// State University (the PDF spells it "Minnesotta"), State University of New York Plattsburgh, Texas State
// University, Texas Wesleyan University, Trine University and Troy University (Troy has campuses in several
// places, so check which one the PDF means).
//
// OTHER PDF ROWS TO WATCH LATER (nothing to do in this batch): Colorado Mesa University is rows 108 and 154
// (done in an earlier batch). Santa Monica College is rows 125 and 228. Baylor University is rows 177 and 223.
// University of Massachusetts Amherst is rows 175 and 205. UMass Boston is rows 185 and 206. Trinity Western
// University is row 178 (listed as USA) and row 312 (Canada), so check the country. Saint Louis University is
// row 170 (USA) and row 340 (Madrid, Spain). Long Island University is rows 164, 165 and 218.
//
// This file is self contained. Paste it over batch01.ts and run: npm run seed:institutions
// (or save it as batch22.ts and run with 22). The engine only cares that the file exports INSTITUTIONS.
//
// HOW SURE EACH NUMBER IS (confirm the flagged ones before this reaches students):
//   NYIT           : English scores (IELTS 6.0, TOEFL iBT 79 or 4.0 new scale, Duolingo 105, ESL pathway for TOEFL
//                    41 to 78) are from the official nyit.edu international pages. 2026/27 undergraduate tuition of
//                    $24,150 a term, the BS/DO figure of $26,150 a term, graduate tuition of $1,800 per credit and the
//                    F-1 insurance of $1,250 a semester are from the official nyit.edu bursar pages. The $48,300 a year
//                    figure is two terms, worked out here and matched by a course listing. The $52,300 top figure is
//                    the BS/DO rate, so confirm which programmes use it. Architecture and graduate programme totals
//                    depend on credits, so confirm them. The July 1 and December 1 deadlines are from a third party.
//                    Founded 1955, 70 plus countries and 1,000 plus international students are official. The Long
//                    Island street address and course names (not all checked) are from memory, so confirm.
//   Purdue NW      : The $155 international student fee per semester, per credit hour billing, the $25 UG and $75
//                    international graduate application fees, the June 1 and October 15 UG deadlines, the Duolingo
//                    100 to 110 score and the English Language Program Level Four route are from official pnw.edu
//                    pages. NO 2026/27 tuition figure was found, so tuition amounts are not stored. The IELTS and
//                    TOEFL minimums are not stored because they differ by programme. Founded 2016 is from a third
//                    party. The $570 insurance figure is from the English Language Program page. Both street
//                    addresses are from memory, so confirm. Course names are programmes that normally exist.
//   Sacred Heart   : The English scores (IELTS 6.5, TOEFL iBT 80, Duolingo 110 with production 85, PTE 62, iTEP 5), the
//                    MS Healthcare Informatics scores, provisional acceptance and the November 1 and March 1
//                    preferred dates are from the official sacredheart.edu catalog and test page. The $50,084 and
//                    $54,170 undergraduate tuition figures are from an IDP listing, and it is not clear which year
//                    each belongs to, so confirm on sacredheart.edu/educationcost. Founded 1963 and the Luxembourg
//                    campus are general knowledge. Course names are programmes that normally exist, not all checked.
//   Santa Monica   : Official smc.edu pages: $486 per unit non-resident cost, the $34,000 estimate for Fall 2026 to
//                    Spring 2027, the $1,000 a month Intensive English cost, the $84 upper division surcharge, the
//                    $1,541 a month homestay estimate, the 12 unit rule and the out of country deadlines (winter
//                    November 15, 2026, spring January 5, 2027, summer May 15, 2027). The $11,664 figure for 24 units
//                    is worked out here. The accepted English tests and scores are NOT stored because the page seen
//                    did not list them. Founded 1929 and the Bundy and Airport Arts sites are from memory, so confirm.
//   Seattle Colleges: Official intl.seattlecolleges.edu Summer 2026 cost table: tuition $11,283 and fees $663 for nine
//                    months, total $27,966, Intensive English tuition $11,694, BAS years 3 and 4 tuition $21,783. English
//                    proof is not required to apply (official). The TOEFL iBT 64 and IELTS 6.0 scores that skip the
//                    placement test are from an IDP listing, so confirm. Founding years (North 1970, Seattle Central
//                    1966, South 1970), the North and South street addresses and the Georgetown campus are from
//                    memory, so confirm. Course names are programmes that normally exist, not all checked. The
//                    intake months follow the usual quarter system, so confirm the dates.
//   Left out on purpose: acceptance rate, ranking, social links, and anything unconfirmed.
//   Library, sports and student life paragraphs are kept general on purpose, and each one says to check
//   the university pages for current details.
//
// Run:  npm run seed:institutions

import type { CourseInput, DocumentRow, FaqInput, InstitutionInput } from "./types";

// ── Shared USA helpers ───────────────────────────────────────────────────

// General F-1 student visa pack for the USA. Confirm anything specific with the
// international office of each university.
const US_DOCUMENTS: Record<string, DocumentRow[]> = {
  Undergraduate: [
    ["Identity", "Passport"],
    ["Academic", "High school transcripts and certificates"],
    ["Academic", "English language test result"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Affidavit of financial support"],
    ["Visa", "Form I-20 issued by the university"],
    ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
  ],
  Postgraduate: [
    ["Identity", "Passport"],
    ["Academic", "Degree certificate and transcripts"],
    ["Academic", "Statement of purpose"],
    ["Academic", "CV or resume"],
    ["Academic", "Reference letters"],
    ["Academic", "English language test result"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Visa", "Form I-20 issued by the university"],
    ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
  ],
};

function usFaqs(o: {
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
      question: `Is ${o.name} a public or private university?`,
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
    tuitionCurrency: "USD",
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
    tuitionCurrency: "USD",
    tuitionPeriod: period,
    description,
  };
}

// Seattle Colleges (North Seattle College, Seattle Central College and South Seattle College) share one
// international office, one cost table and one English rule.
const SEATTLE_ENGLISH_NOTE =
  "No English proof needed to apply. TOEFL iBT 64 or IELTS 6.0 skips the placement test. College Bridge supports lower levels. Confirm on seattlecolleges.edu.";
const SEATTLE_TUITION_NOTE =
  "Tuition $11,283 for 9 months (15 credits a quarter), fees $663. Total estimate $27,966 with housing, books and insurance. Confirm on seattlecolleges.edu.";
const SEATTLE_ENGLISH_ANSWER =
  "Proof of English is not required to apply. A TOEFL iBT 64 with writing 17 or IELTS 6.0 with writing 5.0 skips the placement test, and the Seattle Colleges Institute of English offers College Bridge and Intensive English for lower levels.";
const SEATTLE_FEES_ANSWER =
  "For 2026/27, tuition is about $11,283 for nine months at 15 credits a quarter, with about $663 in fees. The total estimate is $27,966 including housing and food, books, insurance and transport. Bachelor of applied science years 3 and 4 cost more, at $21,783 tuition.";
const SEATTLE_INTAKES_ANSWER =
  "You can start in the fall (September), winter (January), spring (April) or summer quarter. Application deadlines differ by quarter, so check the Seattle Colleges international office and apply early for your I-20 and visa.";
const SEATTLE_DOCUMENTS: Record<string, DocumentRow[]> = {
  Undergraduate: [
    ["Identity", "Passport"],
    ["Academic", "High school transcripts (required if under 18, recommended for everyone)"],
    ["Academic", "English language test result (optional, skips the placement test)"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Financial sponsor form (if you have a sponsor)"],
    ["Visa", "Form I-20 issued by the college"],
    ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
  ],
};

export const INSTITUTIONS: InstitutionInput[] = [
  // ── PDF row 122 ────────────────────────────────────────────────────────
  {
    name: "New York Institute of Technology",
    city: "New York",
    country: "United States",
    institutionType: "Private research university",
    website: "https://www.nyit.edu",
    founded: 1955,
    upcomingIntake: "Jan 2027",
    programs: ["Computer Science", "Architecture", "Engineering"],
    summary:
      "A private technology focused university with campuses in New York City and Old Westbury on Long Island, offering about 90 degree programmes, more than 1,000 international students from over 70 countries and an International Leadership Scholarship that can cover full undergraduate tuition.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 79", "Duolingo 105"],
    ieltsNote:
      "UG: IELTS 6.0, TOEFL iBT 79 or Duolingo 105. ESL pathway for TOEFL 41 to 78. Graduate programmes may differ. Confirm on nyit.edu.",
    tuitionMin: 48300,
    tuitionMax: 52300,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, undergraduate)",
    tuitionNote:
      "UG tuition $24,150 a term (about $48,300 a year), BS/DO $52,300. Graduate $1,800 per credit. F-1 insurance $1,250 a semester. Confirm on nyit.edu.",
    overview:
      "New York Institute of Technology, also called New York Tech, is a private research university founded in 1955, with campuses in Manhattan and Old Westbury on Long Island. It offers about 90 degree programmes in fields such as architecture, engineering and computing, management, health professions and arts and sciences. More than 1,000 international students from over 70 countries study there.",
    studentLife:
      "The international admissions team supports applicants from many countries, and every international student on an F-1 or J-1 visa takes the mandatory university health insurance plan. New York Tech has clubs, career services and a technology focused community across both campuses. Check the student life pages for current clubs and events.",
    accommodation:
      "New York Tech runs residence halls, where students share rooms on designated floors and single rooms are limited. Many older and graduate students rent apartments in Manhattan or on Long Island. Check the housing pages for current prices and booking dates, and apply early.",
    library:
      "The libraries on each campus offer study spaces, computers and online collections, and tutoring and writing support help with coursework. Check the library pages for opening hours and services.",
    sports:
      "New York Tech competes in NCAA Division II athletics as the Bears, and students can also join recreation and club activities. Check the athletics and recreation pages for current teams and memberships.",
    wikipediaTitle: "New York Institute of Technology",
    ...seo("New York Institute of Technology", "New York and Old Westbury"),
    courses: [
      ug("BS Computer Science", "BS", "Computer Science", "4 Years", "Jan 2027", "January and September", 48300),
      ug("BS Information Technology", "BS", "Information Technology", "4 Years", "Jan 2027", "January and September", 48300, "An eight semester degree in New York City with hands on work in programming, databases and web development."),
      ug("Bachelor of Architecture (B.Arch)", "B.Arch", "Architecture", "5 Years", "Jan 2027", "January and September", undefined, "A five year professional architecture degree, so confirm the fee and studio costs with admissions."),
      pg("MS Computer Science", "MS", "Computer Science", "2 Years", "Jan 2027", "January and September", 1800, "A STEM graduate degree. Tuition is $1,800 per credit, so the yearly cost depends on the credits taken.", "per credit (2026/27)"),
      pg("MS Data Science", "MS", "Data Science", "2 Years", "Jan 2027", "January and September", 1800, "Tuition is $1,800 per credit, so confirm the credits and total cost with admissions.", "per credit (2026/27)"),
      pg("Master of Business Administration (MBA)", "MBA", "Business", undefined, "Jan 2027", "January and September", 1800, "Tuition is $1,800 per credit, so confirm the credits and total cost with admissions.", "per credit (2026/27)"),
    ],
    campuses: [
      {
        name: "Manhattan Campus",
        city: "New York",
        address: "1855 Broadway, New York, NY 10023",
        description: "The New York City campus near Columbus Circle, with teaching spaces for many programmes, so check which courses run there.",
      },
      {
        name: "Long Island Campus",
        city: "Old Westbury",
        address: "Northern Boulevard, Old Westbury, NY 11568",
        description: "The larger suburban campus on Long Island, with teaching buildings, labs, athletics and residence halls, so check which courses run there.",
      },
    ],
    documents: {
      Undergraduate: US_DOCUMENTS.Undergraduate,
      Postgraduate: [
        ["Identity", "Passport"],
        ["Academic", "Degree certificate and transcripts with English translation"],
        ["Academic", "CV or resume"],
        ["Academic", "Statement of purpose and reference letters"],
        ["Academic", "GRE or GMAT scores, if the programme asks for them"],
        ["Academic", "English language test result"],
        ["Financial", "Bank statement showing proof of funds"],
        ["Visa", "Form I-20 issued by the university"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
      ],
    },
    faqs: usFaqs({
      name: "New York Institute of Technology",
      sector: "private",
      place: "New York City and Old Westbury",
      known:
        "New York Tech is known for technology focused, career oriented degrees in computing, engineering, architecture and design, health professions and management, with campuses in New York City and on Long Island.",
      ielts:
        "Undergraduates need IELTS 6.0, TOEFL iBT 79 (4.0 on the new scale) or Duolingo 105. Students with TOEFL 41 to 78 can join an ESL pathway, and graduate programmes may set their own scores, so confirm with admissions.",
      fees:
        "For 2026/27, undergraduate tuition is $24,150 a term, about $48,300 a year, and graduate tuition is $1,800 per credit. Mandatory F-1 health insurance is $1,250 a semester. Fees, housing and living costs are extra, and the International Leadership Scholarship can cover full undergraduate tuition.",
      intakes:
        "You can start in fall (September) or spring (January). Agent listings show July 1 for fall and December 1 for spring, so confirm the dates with admissions and apply early to leave time for your I-20 and visa.",
    }),
  },

  // ── PDF row 123 ────────────────────────────────────────────────────────
  {
    name: "Purdue University Northwest",
    city: "Hammond",
    country: "United States",
    institutionType: "Public university",
    website: "https://www.pnw.edu",
    founded: 2016,
    upcomingIntake: "Jan 2027",
    programs: ["Computer Science", "Business", "Engineering Technology"],
    summary:
      "A public university in northwest Indiana, formed in 2016 from Purdue Calumet and Purdue North Central, with campuses in Hammond and Westville, more than 70 areas of study, students from about 50 countries and an English Language Program for those who need more English.",
    ieltsAlternatives: ["Duolingo 100 to 110"],
    ieltsNote:
      "PNW accepts Duolingo 100 to 110. Other test scores differ by programme, and the English Language Program offers a pathway. Confirm on pnw.edu.",
    tuitionCurrency: "USD",
    tuitionNote:
      "Charged per credit hour with a $155 international student fee each semester (2025/26 page). The 2026/27 rate is not stored, so confirm on pnw.edu/bursar.",
    overview:
      "Purdue University Northwest is a public university in northwest Indiana, formed in 2016 when Purdue Calumet and Purdue North Central merged. It has campuses in Hammond and Westville and offers more than 70 areas of study, from accounting and computer information technology to engineering technology, nursing and graduate degrees such as the MBA. Students come from about 50 countries.",
    studentLife:
      "International Student Services runs orientation and support, and students come from about 50 countries. Health insurance is mandatory for international students. Check the International Student Services pages for current clubs, events and advising.",
    accommodation:
      "PNW has residence halls with live in staff, and many students also rent rooms or apartments near the Hammond and Westville campuses. Contact the International Office for housing advice. Check the housing pages for current prices and booking dates.",
    library:
      "Each campus library offers study spaces, computers and online collections, and tutoring and writing help support coursework. Check the library pages for opening hours and services.",
    sports:
      "PNW runs varsity athletics and recreation programmes, and students can also join clubs and campus activities. Check the athletics and recreation pages for current teams and memberships.",
    wikipediaTitle: "Purdue University Northwest",
    ...seo("Purdue University Northwest", "Hammond, Indiana"),
    courses: [
      ug("BS Computer Science, Artificial Intelligence concentration", "BS", "Computer Science", "4 Years", "Jan 2027", "August and January", undefined, "A computing degree with an artificial intelligence concentration. Tuition is charged per credit hour, so confirm the yearly cost with admissions."),
      ug("BS Computer Information Technology", "BS", "Information Technology", "4 Years", "Jan 2027", "August and January"),
      ug("BS Accounting", "BS", "Accounting", "4 Years", "Jan 2027", "August and January"),
      ug("English Language Program", "Pathway", "English Language", undefined, "Jan 2027", "August and January", undefined, "A CEA accredited intensive English programme. Finishing Level Four lets undergraduates start without a TOEFL or IELTS score, and it is charged at its own rates."),
      pg("Master of Business Administration (MBA)", "MBA", "Business", undefined, "Aug 2027", "August and January", undefined, "Graduate tuition is charged per credit hour, so confirm the fee with graduate admissions."),
      pg("MS Applied Artificial Intelligence", "MS", "Computer Science", undefined, "Aug 2027", "August and January", undefined, "Graduate tuition is charged per credit hour, so confirm the fee with graduate admissions."),
    ],
    campuses: [
      {
        name: "Hammond Campus",
        city: "Hammond",
        address: "2200 169th Street, Hammond, IN 46323",
        description: "The larger campus near Chicago, with teaching buildings, labs, the library, residence halls and the International Student Services office.",
      },
      {
        name: "Westville Campus",
        city: "Westville",
        address: "1401 South US Highway 421, Westville, IN 46391",
        description: "A smaller, quieter campus in LaPorte County, so check which programmes run there before you apply.",
      },
    ],
    documents: US_DOCUMENTS,
    faqs: usFaqs({
      name: "Purdue University Northwest",
      sector: "public",
      place: "Hammond, Indiana",
      known:
        "PNW is known for hands on engineering technology, nursing, business and computing programmes on two campuses in northwest Indiana, and for carrying the Purdue name.",
      ielts:
        "PNW accepts a Duolingo score of 100 to 110 for undergraduates, and other accepted tests have programme specific scores, so confirm with admissions. Students who finish Level Four of the English Language Program can start undergraduate study without a TOEFL or IELTS.",
      fees:
        "Tuition is charged per credit hour, with a $155 international student fee each semester and mandatory health insurance of about $570 a semester. The application fee is $25 for first time undergraduates and $75 for international graduate applicants. Confirm the 2026/27 rates on the bursar page.",
      intakes:
        "You can start in fall or spring, and undergraduate deadlines are June 1 for fall and October 15 for spring. PNW allows deferral between fall and spring, so check the dates for your term and apply early.",
    }),
  },

  // ── PDF row 124 ────────────────────────────────────────────────────────
  {
    name: "Sacred Heart University",
    city: "Fairfield",
    country: "United States",
    institutionType: "Private Catholic university",
    website: "https://www.sacredheart.edu",
    founded: 1963,
    upcomingIntake: "Jan 2027",
    programs: ["Finance", "Computer Science", "Health Informatics"],
    summary:
      "A private Catholic university in Fairfield, Connecticut, with an AACSB accredited business school, more than 80 undergraduate, graduate and doctoral programmes, accelerated 4+1 master's options, an English Language Institute and a campus in Luxembourg.",
    ieltsOverall: 6.5,
    ieltsAlternatives: ["TOEFL iBT 80", "Duolingo 110", "PTE 62", "iTEP 5"],
    ieltsNote:
      "UG: IELTS 6.5, TOEFL iBT 80, Duolingo 110 (production 85), PTE 62 or iTEP 5. Provisional entry via English Language Institute. Confirm on sacredheart.edu.",
    tuitionMin: 50084,
    tuitionMax: 54170,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (undergraduate, agent listing)",
    tuitionNote:
      "UG tuition $50,084 to $54,170 a year from agent listings, so the year is unclear. Graduate fees differ. Confirm on sacredheart.edu/educationcost.",
    overview:
      "Sacred Heart University is a private Catholic university in Fairfield, Connecticut, founded in 1963. It offers more than 80 undergraduate, graduate and doctoral programmes, and many majors have an accelerated 4+1 master's option. Its business school holds AACSB accreditation, and the university also runs a campus in Luxembourg and an English Language Institute for students who need more English.",
    studentLife:
      "The international admissions team supports new students, and there are clubs and activities on a residential campus on the Connecticut coast, within reach of New York City. Provisional acceptance and the English Language Institute help students who need more English. Check the student life pages for current clubs and events.",
    accommodation:
      "Sacred Heart runs residence halls on the Fairfield campus, and some older and graduate students rent apartments nearby. Check the housing pages for current prices and booking dates, and apply early.",
    library:
      "The Ryan Matura Library offers study spaces, computers and online collections, and tutoring and writing support help with coursework. Check the library pages for opening hours and services.",
    sports:
      "Sacred Heart competes in NCAA Division I athletics as the Pioneers, and students can also use recreation programmes and club sports. Check the athletics and recreation pages for current teams and memberships.",
    wikipediaTitle: "Sacred Heart University",
    ...seo("Sacred Heart University", "Fairfield, Connecticut"),
    courses: [
      ug("BS Finance", "BS", "Finance", "4 Years", "Jan 2027", "January and August", 50084, "A business degree in Fairfield from the AACSB accredited Jack Welch College of Business."),
      ug("BS Computer Science", "BS", "Computer Science", "4 Years", "Jan 2027", "January and August", 50084),
      ug("BA Global Affairs", "BA", "Global Affairs", "4 Years", "Jan 2027", "January and August", 50084, "An eight semester arts degree on world affairs, culture and global challenges."),
      pg("Master of Business Administration (MBA)", "MBA", "Business", undefined, "Jan 2027", "January and August", undefined, "Graduate fees differ from undergraduate fees, so confirm the fee with graduate admissions."),
      pg("MS Healthcare Informatics", "MS", "Health Informatics", undefined, "Jan 2027", "January and August", undefined, "Needs IELTS 6.5 with no band below 6.5 or an equal score. Graduate fees differ, so confirm the fee with admissions."),
      pg("MS Cybersecurity", "MS", "Cyber Security", undefined, "Jan 2027", "January and August", undefined, "Graduate fees differ from undergraduate fees, so confirm the fee with graduate admissions."),
    ],
    campuses: [
      {
        name: "Fairfield Campus",
        city: "Fairfield",
        address: "5151 Park Avenue, Fairfield, CT 06825",
        description: "The main campus in Connecticut, with most teaching, the Ryan Matura Library, residence halls, athletics facilities and the international admissions office.",
      },
      {
        name: "Luxembourg Campus",
        city: "Luxembourg",
        description: "Sacred Heart's campus in Luxembourg offers study abroad and selected programmes, so check which courses run there.",
      },
    ],
    documents: US_DOCUMENTS,
    faqs: usFaqs({
      name: "Sacred Heart University",
      sector: "private",
      place: "Fairfield, Connecticut",
      known:
        "Sacred Heart is known for business, health and nursing programmes, accelerated 4+1 master's options, Division I athletics and a residential campus in Connecticut within reach of New York City.",
      ielts:
        "Undergraduates need IELTS 6.5, TOEFL iBT 80 (4 on the new scale), Duolingo 110 with a production score of 85, PTE 62 or iTEP 5. MS Healthcare Informatics asks for IELTS 6.5 with no band below 6.5. Provisional acceptance is possible through the English Language Institute.",
      fees:
        "Agent listings show undergraduate tuition of about $50,084 to $54,170 a year, and it is not clear which year each figure belongs to. Graduate fees differ by programme, and room, board and insurance are extra, so confirm on sacredheart.edu/educationcost.",
      intakes:
        "You can start in fall (August or September) or spring (January). Sacred Heart prefers international applications by November 1 for January and March 1 for September, so check the dates for your term and apply early.",
    }),
  },

  // ── PDF row 125 ────────────────────────────────────────────────────────
  {
    name: "Santa Monica College",
    city: "Santa Monica",
    country: "United States",
    institutionType: "Public community college",
    website: "https://www.smc.edu",
    founded: 1929,
    upcomingIntake: "Spring 2027",
    programs: ["Business", "Computer Science", "Interaction Design"],
    summary:
      "A public community college in Santa Monica, California, close to Los Angeles, known as a leading California transfer college, with an Intensive English Program, a dedicated International Education Center and non-resident costs of about $486 per unit.",
    ieltsNote:
      "SMC asks for proof of English unless your first language is English or you join its Intensive English Program. Check accepted tests on smc.edu.",
    tuitionMin: 11664,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, 24 units)",
    tuitionNote:
      "$486 per unit all in, about $11,664 for 24 units, plus small fees. Fall 2026 to Spring 2027 estimate is $34,000. Confirm on smc.edu.",
    overview:
      "Santa Monica College is a public community college in Santa Monica, California, founded in 1929 and widely known as a leading transfer college in the state. International F-1 students must take at least 12 units a semester, and the college also offers an Intensive English Program and a bachelor's degree in Interaction Design. Students can apply for fall, winter, spring and summer terms.",
    studentLife:
      "The International Education Center gives dedicated counselling and support, and the Intensive English Program prepares students for credit classes. SMC presents itself as California's number one transfer college, and students can join clubs and activities on campus. Check the international pages for current events.",
    accommodation:
      "The SMC cost estimate assumes a homestay with two meals a day at about $1,541 a month, and students can also share apartments in and around Santa Monica. Check the International Education Center pages for current housing help and prices.",
    library:
      "The SMC library offers study spaces, computers and online resources, and tutoring and counselling support coursework and transfer plans. Check the library pages for opening hours and services.",
    sports:
      "SMC competes in athletics as the Corsairs, and students can also join clubs and recreation on campus. Check the athletics pages for current teams.",
    wikipediaTitle: "Santa Monica College",
    ...seo("Santa Monica College", "Santa Monica, California"),
    courses: [
      ug("Associate in Science for Transfer, Business Administration", "Associate", "Business", "2 Years", "Spring 2027", "Fall, winter, spring and summer", 11664, "The main pathway to a business administration degree at a California State University."),
      ug("Associate in Science for Transfer, Computer Science", "Associate", "Computer Science", "2 Years", "Spring 2027", "Fall, winter, spring and summer", 11664),
      ug("Bachelor of Science, Interaction Design", "BS", "Design", "2 Years", "Spring 2027", "Fall and spring", undefined, "An upper division degree with an extra $84 per unit surcharge on top of the normal per unit cost, so confirm the total with admissions."),
      ug("Intensive English Program", "Pathway", "English Language", undefined, "Spring 2027", "Fall, winter, spring and summer", 1000, "A full time English programme with 20 contact hours a week that prepares students for credit classes.", "per month (2026/27)"),
    ],
    campuses: [
      {
        name: "Main Campus",
        city: "Santa Monica",
        address: "1900 Pico Boulevard, Santa Monica, CA 90405",
        description: "The main campus, with teaching buildings, the library, the International Education Center, counselling and athletics facilities.",
      },
      {
        name: "Other Santa Monica Sites",
        city: "Santa Monica",
        description: "SMC also teaches at the Bundy Campus, the Airport Arts Campus and other sites, so check where your classes are held.",
      },
    ],
    documents: {
      Undergraduate: US_DOCUMENTS.Undergraduate,
    },
    faqs: usFaqs({
      name: "Santa Monica College",
      sector: "public",
      place: "Santa Monica, California",
      known:
        "SMC is known for its transfer pathways to University of California and California State University campuses, a large choice of programmes, an Intensive English Program and a location close to Los Angeles.",
      ielts:
        "SMC asks for proof of English unless your first language is English or you join its Intensive English Program, and the accepted tests and scores are listed by the International Education Center. Confirm the current scores before you apply.",
      fees:
        "For 2026/27, non-resident tuition and fees are $486 per unit, about $11,664 for 24 units, and F-1 students must take at least 12 units a semester. SMC estimates about $34,000 in total expenses for Fall 2026 to Spring 2027, including homestay costs of about $1,541 a month and insurance.",
      intakes:
        "You can start in fall, winter, spring or summer. For applicants outside the USA the deadlines are November 15, 2026 for winter 2027, January 5, 2027 for spring 2027 and May 15, 2027 for summer 2027. Apply early to leave time for your I-20 and visa.",
    }),
  },

  // ── PDF row 126 ────────────────────────────────────────────────────────
  {
    name: "North Seattle College",
    city: "Seattle",
    country: "United States",
    institutionType: "Public community college",
    website: "https://www.northseattle.edu",
    founded: 1970,
    upcomingIntake: "Jan 2027",
    programs: ["University Transfer", "Business", "Computer Science"],
    summary:
      "A public community college in the north end of Seattle, Washington, part of the three college Seattle Colleges district, with university transfer degrees, applied bachelor's degrees, the Institute of English and no English test needed to apply.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 64"],
    ieltsNote: SEATTLE_ENGLISH_NOTE,
    tuitionMin: 11283,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, 9 months)",
    tuitionNote: SEATTLE_TUITION_NOTE,
    overview:
      "North Seattle College is a public community college in Seattle, Washington, and part of the Seattle Colleges district with Seattle Central and South Seattle. International students follow university transfer, career training and bachelor of applied science pathways, and the district Institute of English offers College Bridge and Intensive English for students who need more English.",
    studentLife:
      "The Seattle Colleges international office runs orientation and support, and students can join clubs and activities on campus. International students can also apply for district scholarships and tuition support awards. Check the North Seattle College and international pages for current clubs and events.",
    accommodation:
      "The colleges are commuter campuses, and the cost estimate budgets $13,338 for housing and food for nine months. Students usually rent rooms or apartments in Seattle, so ask the international office about current housing help and prices.",
    library:
      "The college library offers study spaces, computers and online resources, and tutoring and writing help support coursework. Check the library pages for opening hours and services.",
    sports:
      "The college offers student clubs and recreation, and athletics options differ between the three Seattle Colleges. Check the North Seattle College pages for current teams and clubs.",
    wikipediaTitle: "North Seattle College",
    ...seo("North Seattle College", "Seattle, Washington"),
    courses: [
      ug("Associate in Arts, Direct Transfer Agreement (AA-DTA)", "Associate", "University Transfer", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 11283, "A two year transfer degree that prepares students to move on to a four year university in Washington."),
      ug("Associate in Business, transfer pathway", "Associate", "Business", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 11283),
      ug("Bachelor of Applied Science (BAS), years 3 and 4", "BAS", "Applied Studies", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 21783, "An applied bachelor's degree in selected fields, so confirm which BAS programmes are open to international students."),
      ug("College Bridge", "Pathway", "English Language", undefined, "Jan 2027", "Fall, winter, spring and summer", 11283, "A pathway for students who plan to take full time college classes but still need to improve their English."),
      ug("Intensive English", "Pathway", "English Language", undefined, "Jan 2027", "Fall, winter, spring and summer", 11694, "An English programme for beginner and high beginner students, run by the Seattle Colleges Institute of English."),
    ],
    campuses: [
      {
        name: "North Seattle Campus",
        city: "Seattle",
        address: "9600 College Way North, Seattle, WA 98103",
        description: "The main campus in north Seattle, with teaching buildings, labs, the library and student services.",
      },
    ],
    documents: SEATTLE_DOCUMENTS,
    faqs: usFaqs({
      name: "North Seattle College",
      sector: "public",
      place: "Seattle, Washington",
      known:
        "North Seattle College is known for university transfer pathways, applied bachelor's degrees, small classes and the Institute of English that supports international students across the Seattle Colleges district.",
      ielts: SEATTLE_ENGLISH_ANSWER,
      fees: SEATTLE_FEES_ANSWER,
      intakes: SEATTLE_INTAKES_ANSWER,
    }),
  },

  // ── PDF row 127 ────────────────────────────────────────────────────────
  {
    name: "Seattle Central College",
    city: "Seattle",
    country: "United States",
    institutionType: "Public community college",
    website: "https://www.seattlecentral.edu",
    founded: 1966,
    upcomingIntake: "Jan 2027",
    programs: ["University Transfer", "Allied Health", "Culinary Arts"],
    summary:
      "A public community college on Capitol Hill near downtown Seattle, part of the Seattle Colleges district, home to the Institute of English, with university transfer degrees, allied health and culinary pathways and no English test needed to apply.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 64"],
    ieltsNote: SEATTLE_ENGLISH_NOTE,
    tuitionMin: 11283,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, 9 months)",
    tuitionNote: SEATTLE_TUITION_NOTE,
    overview:
      "Seattle Central College is a public community college on Capitol Hill, close to downtown Seattle, and part of the Seattle Colleges district with North Seattle and South Seattle. It hosts the Seattle Colleges Institute of English, which serves students from all three colleges, and international students follow university transfer, career training and applied bachelor's pathways.",
    studentLife:
      "The Seattle Colleges international office runs orientation and support, and the Institute of English on this campus helps students build their English. International students can apply for district scholarships and tuition support awards. Check the Seattle Central and international pages for current clubs and events.",
    accommodation:
      "The colleges are commuter campuses, and the cost estimate budgets $13,338 for housing and food for nine months. Students usually rent rooms or apartments in Seattle, so ask the international office about current housing help and prices.",
    library:
      "The college library offers study spaces, computers and online resources, and tutoring and writing help support coursework. Check the library pages for opening hours and services.",
    sports:
      "The college offers student clubs and recreation, and athletics options differ between the three Seattle Colleges. Check the Seattle Central pages for current teams and clubs.",
    wikipediaTitle: "Seattle Central College",
    ...seo("Seattle Central College", "Seattle, Washington"),
    courses: [
      ug("Associate in Arts, Direct Transfer Agreement (AA-DTA)", "Associate", "University Transfer", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 11283, "A two year transfer degree that prepares students to move on to a four year university in Washington."),
      ug("Associate in Applied Science Transfer, Allied Health", "Associate", "Allied Health", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 11283),
      ug("Bachelor of Applied Science (BAS), years 3 and 4", "BAS", "Applied Studies", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 21783, "An applied bachelor's degree in selected fields, so confirm which BAS programmes are open to international students."),
      ug("College Bridge", "Pathway", "English Language", undefined, "Jan 2027", "Fall, winter, spring and summer", 11283, "A pathway for students who plan to take full time college classes but still need to improve their English."),
      ug("Intensive English", "Pathway", "English Language", undefined, "Jan 2027", "Fall, winter, spring and summer", 11694, "An English programme for beginner and high beginner students, taught at Seattle Central by the Institute of English."),
    ],
    campuses: [
      {
        name: "Seattle Central Campus",
        city: "Seattle",
        address: "1701 Broadway, Seattle, WA 98122",
        description: "The main campus on Capitol Hill near downtown, with teaching buildings, the library, student services and the Institute of English.",
      },
    ],
    documents: SEATTLE_DOCUMENTS,
    faqs: usFaqs({
      name: "Seattle Central College",
      sector: "public",
      place: "Seattle, Washington",
      known:
        "Seattle Central College is known for university transfer pathways, allied health and culinary programmes, a city centre location on Capitol Hill and the Institute of English for international students.",
      ielts: SEATTLE_ENGLISH_ANSWER,
      fees: SEATTLE_FEES_ANSWER,
      intakes: SEATTLE_INTAKES_ANSWER,
    }),
  },

  // ── PDF row 128 ────────────────────────────────────────────────────────
  {
    name: "South Seattle College",
    city: "Seattle",
    country: "United States",
    institutionType: "Public community college",
    website: "https://southseattle.edu",
    founded: 1970,
    upcomingIntake: "Jan 2027",
    programs: ["University Transfer", "Business", "Information Technology"],
    summary:
      "A public community college in southwest Seattle, part of the three college Seattle Colleges district, with university transfer degrees, career training, applied bachelor's degrees and the Institute of English, and no English test needed to apply.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 64"],
    ieltsNote: SEATTLE_ENGLISH_NOTE,
    tuitionMin: 11283,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, 9 months)",
    tuitionNote: SEATTLE_TUITION_NOTE,
    overview:
      "South Seattle College is a public community college in southwest Seattle, and part of the Seattle Colleges district with North Seattle and Seattle Central. International students follow university transfer, career training and bachelor of applied science pathways, and the district Institute of English offers College Bridge and Intensive English for students who need more English.",
    studentLife:
      "The Seattle Colleges international office runs orientation and support, and students can join clubs and activities on campus. International students can also apply for district scholarships and tuition support awards. Check the South Seattle College and international pages for current clubs and events.",
    accommodation:
      "The colleges are commuter campuses, and the cost estimate budgets $13,338 for housing and food for nine months. Students usually rent rooms or apartments in Seattle, so ask the international office about current housing help and prices.",
    library:
      "The college library offers study spaces, computers and online resources, and tutoring and writing help support coursework. Check the library pages for opening hours and services.",
    sports:
      "The college offers student clubs and recreation, and athletics options differ between the three Seattle Colleges. Check the South Seattle College pages for current teams and clubs.",
    wikipediaTitle: "South Seattle College",
    ...seo("South Seattle College", "Seattle, Washington"),
    courses: [
      ug("Associate in Arts, Direct Transfer Agreement (AA-DTA)", "Associate", "University Transfer", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 11283, "A two year transfer degree that prepares students to move on to a four year university in Washington."),
      ug("Associate in Business, transfer pathway", "Associate", "Business", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 11283),
      ug("Bachelor of Applied Science (BAS), years 3 and 4", "BAS", "Applied Studies", "2 Years", "Jan 2027", "Fall, winter, spring and summer", 21783, "An applied bachelor's degree in selected fields, so confirm which BAS programmes are open to international students."),
      ug("College Bridge", "Pathway", "English Language", undefined, "Jan 2027", "Fall, winter, spring and summer", 11283, "A pathway for students who plan to take full time college classes but still need to improve their English."),
      ug("Intensive English", "Pathway", "English Language", undefined, "Jan 2027", "Fall, winter, spring and summer", 11694, "An English programme for beginner and high beginner students, run by the Seattle Colleges Institute of English."),
    ],
    campuses: [
      {
        name: "South Seattle Campus",
        city: "Seattle",
        address: "6000 16th Avenue SW, Seattle, WA 98106",
        description: "The main campus in southwest Seattle, with teaching buildings, labs, the library and student services.",
      },
      {
        name: "Georgetown Campus",
        city: "Seattle",
        description: "A second South Seattle College site that is used for trades and apprenticeship training, so check which courses run there.",
      },
    ],
    documents: SEATTLE_DOCUMENTS,
    faqs: usFaqs({
      name: "South Seattle College",
      sector: "public",
      place: "Seattle, Washington",
      known:
        "South Seattle College is known for university transfer pathways, hands on career training, applied bachelor's degrees and the Institute of English that supports international students across the Seattle Colleges district.",
      ielts: SEATTLE_ENGLISH_ANSWER,
      fees: SEATTLE_FEES_ANSWER,
      intakes: SEATTLE_INTAKES_ANSWER,
    }),
  },
];