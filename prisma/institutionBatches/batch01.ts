// prisma/institutionBatches/batch21.ts
//
// Batch 21: rows 115 to 121 of RGR University List new.pdf (all USA).
//   115  Hult International Business School
//   116  Kent State University
//   117  Los Medanos College (CCCCD)
//   118  Miami University Ohio (Oxford)
//   119  Miami University Ohio Regionals (Middletown and Hamilton)
//   120  Mt. San Antonio College
//   121  New York Film Academy
//
// That gives 7 institutions from 7 PDF rows, nothing merged. Batch 20 ended at row 114 and Colorado Mesa
// University (row 154) is already done, so skip it later. The next batch starts at row 122 (New York
// Institute of Technology).
//
// Country is written as "United States" for every entry, because the engine rejects "USA".
//
// HEADS UP FOR THE NEXT BATCH (rows 122 to 128): New York Institute of Technology (University) (a different
// school from NYIT Vancouver, row 268, Canada), Purdue University Northwest, Sacred Heart University, Santa
// Monica College (also row 228), North Seattle College, Seattle Central College and South Seattle College (the
// three Seattle Colleges share one district, so check whether they share one cost and English table the way
// the Contra Costa colleges do).
//
// OTHER PDF ROWS TO WATCH LATER (repeats or odd rows, nothing to do in this batch):
//   Baylor University is rows 177 and 223. University of Massachusetts Amherst is rows 175 and 205. UMass
//   Boston is rows 185 and 206. Trinity Western University is row 178 (listed as USA) and row 312 (Canada), and
//   it is a Canadian university, so check the country. Saint Louis University is row 170 (USA) and row 340
//   (Madrid, Spain). Long Island University is rows 164, 165 and 218 (Brooklyn, Post and the main entry).
//
// This file is self contained. Paste it over batch01.ts and run: npm run seed:institutions
// (or save it as batch21.ts and run with 21). The engine only cares that the file exports INSTITUTIONS.
//
// HOW SURE EACH NUMBER IS (confirm the flagged ones before this reaches students):
//   Hult           : Master's fees of $60,500 (finance, business analytics, marketing) and $63,000
//                    (management) for Boston in 2026/27 are from the official hult.edu fees page. The $59,600 BBA
//                    figure is an IDP listing, so confirm. The English scores (IELTS 6.0, TOEFL iBT 80, Duolingo 110)
//                    come from Hult's own exchange programme fact sheet, and the master's scores (IELTS 6.5 with
//                    5.5 in each part, TOEFL iBT 90, Duolingo 120) from a partner university's page, so confirm
//                    both with admissions. Agent sites list TOEFL 74 for the BBA. Founded 1964 is the year the
//                    Boston school began, per Hult's fact sheet (some sites say 2003 for the Hult name). The master's
//                    start months (January, April, September) are from an agent listing. The MBA fee is not stored.
//   Kent State     : Official kent.edu international tuition page for 2026/27: UG tuition and fees $24,298, graduate
//                    $21,169, aeronautics with professional pilot $44,298, living costs $14,360, insurance and
//                    books $3,935, I-20 total $42,593. English table (TOEFL iBT 71, IELTS 6.0, ESL Level 8 with a
//                    3.75 GPA) is official, and graduate programmes set their own scores. Fall 2027 classes start
//                    August 23, 2027 and spring 2027 classes start January 19, 2027 (official). The June 1 and
//                    October 1 international deadlines and the $70 fee are from a third party, so confirm. The
//                    October 1 spring date has already passed for Jan 2027, so the entry is set to Aug 2027.
//                    Founded 1910 is general knowledge. Course names are programmes that normally exist.
//   Los Medanos    : Same Contra Costa district figures as batch 20 (official intl.4cd.edu, checked October 2026).
//                    The 16 international students from 12 countries (Spring 2026), 33 clubs, UC Berkeley concurrent
//                    enrollment and honors programme facts are from the official district page. The four degrees
//                    are confirmed on the official losmedanos.edu degree list. Founded 1974 and both addresses
//                    are official.
//   Miami Oxford   : 2026/27 non-Ohio resident tuition and fees of $42,882 are from the official 2026/27 international
//                    viewbook. The English scores (IELTS 6.5, TOEFL iBT 80, PTE 53, Duolingo 110) are from the official
//                    graduate page and a college guide for undergraduates, so confirm. Founded 1809 and the "Public
//                    Ivy" wording are official. Course names are programmes that normally exist, not all checked.
//   Miami Regionals: The official 2027 cohort page (entered 2026/27) gives per credit hour tuition $300.17, fees
//                    $30.67 and a non-resident surcharge of $534.97. For 24 credits that is about $20,779, worked out
//                    here, so confirm. The English minimum for the regional campuses is not published separately,
//                    so the Oxford undergraduate scores are used, and conditional admission through the Middletown
//                    English Language Center is official. The 135 international students and 18 to 1 ratio are
//                    official. Middletown opened in 1966 (official). Degree names are from the official bulletin.
//   Mt. SAC        : Official mtsac.edu pages: $434 per unit non-resident tuition and $46 per unit enrollment fee for 24
//                    units, the $27,942 I-20 total, the $50 fee, the English table and the spring 2027 dates
//                    (deadline November 15, 2026, classes February 22, 2027). The application page asks for proof of
//                    $26,926 while the tuition page shows $27,942, so confirm which one the I-20 uses. Founded 1945
//                    is general knowledge. Course names are programmes that normally exist, not all checked.
//   NYFA           : Official nyfa.edu pages: the English table, the $75 fee, and 2026/27 Los Angeles and New York
//                    filmmaking tuition of $19,500 per semester (MFA $20,500) plus a $2,000 departmental fee. The
//                    fee is per semester and there are three semesters a year, so the entry says per semester.
//                    Founded 1992 is from a college guide. The BFA January start is not on the programme page, so
//                    confirm it. The street addresses are from memory, so confirm. Acting and photography fees
//                    are not stored because the pages seen were out of date.
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

// Contra Costa Community College District (Contra Costa College, Diablo Valley College and Los Medanos
// College) shares one international office, one cost table and one English table.
const CCCCD_ENGLISH_NOTE =
  "IELTS Academic 5.5 with no band below 4.5, TOEFL iBT 61, Duolingo 95, PTE 45 or iTEP 3.5. Partner English programmes can give conditional admission.";
const CCCCD_TUITION_NOTE =
  "Tuition and fees $10,728 at $447 per unit for 24 units. The I-20 funds estimate is $30,495 with homestay, books and insurance. Confirm on intl.4cd.edu.";
const CCCCD_ENGLISH_ANSWER =
  "You need IELTS Academic 5.5 with no band below 4.5, TOEFL iBT 61, Duolingo 95, PTE 45 or iTEP 3.5. Students who finish a partner English programme such as ELS Level 109 can get conditional admission.";
const CCCCD_FEES_ANSWER =
  "For 2026/27, tuition and fees are about $10,728 for 24 units at $447 per unit. The I-20 total is $30,495, which includes homestay, books, transport, personal costs and mandatory insurance. There is no application fee.";
const CCCCD_INTAKES_ANSWER =
  "You can start in fall (August) or spring (January). Overseas applicants apply by July 1 for fall and December 1 for spring, and spring 2027 classes begin on January 25, 2027.";

// Per credit hour tuition for Miami University Ohio Regionals, 2026/27, non-Ohio resident, 24 credits a year:
// (300.17 + 30.67 + 534.97) x 24 = 20,779.44
const MIAMI_REGIONALS_YEARLY = 20779;

export const INSTITUTIONS: InstitutionInput[] = [
  // ── PDF row 115 ────────────────────────────────────────────────────────
  {
    name: "Hult International Business School",
    city: "Cambridge",
    country: "United States",
    institutionType: "Private business school",
    website: "https://www.hult.edu",
    founded: 1964,
    upcomingIntake: "Jan 2027",
    programs: ["Business Administration", "Finance", "Marketing"],
    summary:
      "A private business school with US campuses in Boston, San Francisco and New York, offering a four year BBA, one year master's degrees and MBAs, with AACSB, AMBA and EQUIS accreditation and optional dual degrees.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 80", "Duolingo 110"],
    ieltsNote:
      "UG: IELTS 6.0, TOEFL iBT 80 or Duolingo 110. Master's: IELTS 6.5, TOEFL iBT 90 or Duolingo 120. Some programmes ask for more. Confirm on hult.edu.",
    tuitionMin: 59600,
    tuitionMax: 63000,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, Boston)",
    tuitionNote:
      "BBA about $59,600 (IDP listing). Boston master's $60,500 to $63,000 (official hult.edu, 2026/27). Dual degree and MBA fees differ. Confirm on hult.edu.",
    overview:
      "Hult International Business School is a private, non profit business school with its main US campus in Cambridge, Massachusetts, and further campuses in San Francisco and New York. It is part of the EF Education First group and holds AACSB, AMBA and EQUIS accreditation. It teaches a four year BBA, one year master's degrees in management, finance, marketing and business analytics, and a global one year MBA.",
    studentLife:
      "Hult teaches through team projects and live business challenges, and students work with classmates from many countries. Students can spend time on other Hult campuses, including London and Dubai, and the school gives career support and international admissions help. Check the Hult student life pages for current clubs and events.",
    accommodation:
      "Hult House is student housing run by the school near the Boston campus, and many graduate students also rent apartments or share housing in Cambridge and Boston. Check the Hult housing pages for current prices and booking dates, and apply early.",
    library:
      "The Boston campus offers study spaces, group rooms and online business collections, with academic and career support for coursework. Check the Hult pages for opening hours and services.",
    sports:
      "Hult is a specialist business school rather than a varsity sports university, so students usually join student clubs and activities or use gyms and facilities around Cambridge and Boston. Check the Hult pages for current options.",
    wikipediaTitle: "Hult International Business School",
    ...seo("Hult International Business School", "Cambridge, Massachusetts"),
    courses: [
      ug("Bachelor of Business Administration (BBA)", "BBA", "Business", "4 Years", "Jan 2027", "January and September", 59600, "A four year business degree taught in Boston with specialisations such as marketing, finance and business analytics.", "per year (2026)"),
      pg("Master's in Management", "Master's", "Business", "1 Year", "Jan 2027", "January, April and September", 63000, "A one year management degree for graduates, taught in Boston at the 2026/27 fee."),
      pg("Master's in Finance", "Master's", "Finance", "1 Year", "Jan 2027", "January, April and September", 60500),
      pg("Master's in Business Analytics", "Master's", "Business Analytics", "1 Year", "Jan 2027", "January, April and September", 60500),
      pg("Master's in Marketing", "Master's", "Marketing", "1 Year", "Jan 2027", "January, April and September", 60500),
      pg("Global One Year MBA", "MBA", "Business", "1 Year", "Jan 2027", "January and September", undefined, "A one year MBA with scholarships linked to GMAT or GRE results, so confirm the fee with admissions."),
    ],
    campuses: [
      {
        name: "Boston Campus",
        city: "Cambridge",
        address: "1 Education Street, Cambridge, MA 02141",
        description: "The main US campus, on the Charles River in Cambridge, with classrooms, the admissions team and nearby Hult House housing.",
      },
      {
        name: "San Francisco Campus",
        city: "San Francisco",
        description: "A Hult campus in the San Francisco Bay Area for selected master's and MBA programmes, so check which courses run there.",
      },
      {
        name: "New York Campus",
        city: "New York",
        description: "A Hult campus in New York City that supports graduate study, including finance pathways with Boston, so check which programmes run there.",
      },
    ],
    documents: {
      Undergraduate: [
        ["Identity", "Passport"],
        ["Academic", "High school transcript and diploma"],
        ["Academic", "English language test result"],
        ["Financial", "Bank statement showing proof of funds"],
        ["Visa", "Form I-20 issued by the school"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
      ],
      Postgraduate: [
        ["Identity", "Passport"],
        ["Academic", "Bachelor's degree certificate and transcripts in English"],
        ["Academic", "CV or resume"],
        ["Academic", "English language test result"],
        ["Financial", "Bank statement showing proof of funds"],
        ["Visa", "Form I-20 issued by the school"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
      ],
    },
    faqs: usFaqs({
      name: "Hult International Business School",
      sector: "private",
      place: "Cambridge, Massachusetts",
      known:
        "Hult is known for one year master's degrees and MBAs, hands on team projects, AACSB, AMBA and EQUIS accreditation, and campuses in several global cities.",
      ielts:
        "Undergraduates need about IELTS 6.0, TOEFL iBT 80 or Duolingo 110. Master's applicants need IELTS 6.5 with 5.5 in each part, TOEFL iBT 90 or Duolingo 120. Some programmes ask for more, so confirm with admissions.",
      fees:
        "For 2026/27, Boston master's tuition is $60,500 for finance, business analytics and marketing, and $63,000 for management. BBA tuition is about $59,600. Scholarships are available, and living costs and fees are extra.",
      intakes:
        "Master's programmes start in January, April and September, and the BBA starts in September and January. Hult runs several admission rounds before each start, so check the dates for your term and apply early.",
    }),
  },

  // ── PDF row 116 ────────────────────────────────────────────────────────
  {
    name: "Kent State University",
    city: "Kent",
    country: "United States",
    institutionType: "Public research university",
    website: "https://www.kent.edu",
    founded: 1910,
    upcomingIntake: "Aug 2027",
    programs: ["Aeronautics", "Business", "Computer Science"],
    summary:
      "A public research university in Kent, Ohio, with international students from about 100 countries, more than 375 programmes, a professional pilot programme and scholarships worth up to $68,000 over four years for international undergraduates.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 71", "ESL Center Level 8 (3.75 GPA)"],
    ieltsNote:
      "UG: IELTS 6.0, TOEFL iBT 71 or ESL Level 8 (3.75 GPA). Graduate programmes set their own scores. UG conditional admission possible. Confirm on kent.edu.",
    tuitionMin: 24298,
    tuitionMax: 44298,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote:
      "UG tuition and fees $24,298 ($44,298 professional pilot), graduate $21,169. The UG I-20 total is $42,593 with living costs and insurance. Confirm on kent.edu.",
    overview:
      "Kent State University is a public research university in Kent, Ohio, founded in 1910, with 375 or more programmes at certificate, undergraduate, master's and PhD level. It also runs regional campuses across northeast Ohio, and international students come from about 100 countries. Most scholarships are open to international students, and a strong academic record can lead to awards of up to $68,000 over four years.",
    studentLife:
      "International Admissions and the international student services team run orientation and support, and every international student takes the university health insurance plan unless a waiver applies. Kent has many student organizations and a lively campus around the town of Kent. Check the student life pages for current clubs and events.",
    accommodation:
      "Housing and dining on campus are run by the university, and the 2026/27 I-20 budget assumes $14,360 a year for living costs. Many older students and graduates rent apartments in and around Kent. Check the housing pages for current prices and booking dates.",
    library:
      "The University Libraries offer study spaces, computers and online collections, and tutoring, writing help and peer mentoring support coursework. Check the library pages for opening hours and services.",
    sports:
      "Kent State competes in NCAA Division I athletics as the Golden Flashes, and students can also join recreation and club sports. Check the athletics and recreation pages for current teams and memberships.",
    wikipediaTitle: "Kent State University",
    ...seo("Kent State University", "Kent, Ohio"),
    courses: [
      ug("BS Computer Science", "BS", "Computer Science", "4 Years", "Aug 2027", "August and January", 24298),
      ug("BBA Business Management", "BBA", "Business", "4 Years", "Aug 2027", "August and January", 24298),
      ug("BS Aeronautics, Professional Pilot concentration", "BS", "Aeronautics", "4 Years", "Aug 2027", "August and January", 44298, "A flight programme with a higher fee that covers flight training, so confirm the fee and entry rules with admissions."),
      pg("Master of Business Administration (MBA)", "MBA", "Business", undefined, "Aug 2027", "August and January", 21169),
      pg("MS Computer Science", "MS", "Computer Science", undefined, "Aug 2027", "August and January", 21169),
    ],
    campuses: [
      {
        name: "Kent Campus",
        city: "Kent",
        address: "1025 Risman Drive, Kent, OH 44242",
        description: "The main campus in northeast Ohio, with most teaching, the University Libraries, residence halls and the international admissions office.",
      },
      {
        name: "Regional Campuses",
        description: "Kent State also runs regional campuses in Ashtabula, East Liverpool, Geauga, Salem, Stark, Trumbull and Tuscarawas, so confirm where your course is taught.",
      },
    ],
    documents: {
      Undergraduate: [
        ["Identity", "Passport"],
        ["Academic", "High school transcripts and certificates"],
        ["Academic", "English language test result"],
        ["Financial", "Bank statement showing proof of funds"],
        ["Financial", "Kent State Affidavit of Financial Support, if you have a sponsor"],
        ["Visa", "Form I-20 issued by the university"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
      ],
      Postgraduate: [
        ["Identity", "Passport"],
        ["Academic", "Degree certificate and transcripts"],
        ["Academic", "English language test result"],
        ["Financial", "Kent State Financial Information Worksheet"],
        ["Financial", "Bank statement showing proof of funds"],
        ["Visa", "Form I-20 issued by the university"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
      ],
    },
    faqs: usFaqs({
      name: "Kent State University",
      sector: "public",
      place: "Kent, Ohio",
      known:
        "Kent State is known for aeronautics and flight, fashion, architecture, journalism and health programmes, wide scholarships for international students and a large public university campus in northeast Ohio.",
      ielts:
        "Undergraduates need IELTS 6.0, TOEFL iBT 71 or Level 8 of the Kent State ESL Center with a 3.75 GPA, and conditional admission is possible. Graduate programmes set their own English scores, so check the programme page.",
      fees:
        "For 2026/27, undergraduate tuition and fees are $24,298 and graduate tuition and fees are $21,169, with the professional pilot programme at $44,298. The UG I-20 total is $42,593 including $14,360 living costs and $3,935 for insurance and books.",
      intakes:
        "You can start in fall (August) or spring (January). Fall 2027 classes begin on August 23, 2027, and spring 2027 classes begin on January 19, 2027. Third party sources list June 1 for fall and October 1 for spring, so confirm the dates.",
    }),
  },

  // ── PDF row 117 ────────────────────────────────────────────────────────
  {
    name: "Los Medanos College",
    city: "Pittsburg",
    country: "United States",
    institutionType: "Public community college",
    website: "https://www.losmedanos.edu",
    founded: 1974,
    upcomingIntake: "Jan 2027",
    programs: ["Business", "Computer Science", "Engineering"],
    summary:
      "A public community college in Pittsburg, California, about 70 km from San Francisco, with 16 international students from 12 countries, an honors programme with ten transfer partners including UCLA and no application fee.",
    ieltsOverall: 5.5,
    ieltsMinBand: 4.5,
    ieltsAlternatives: ["TOEFL iBT 61", "Duolingo 95", "PTE 45", "iTEP 3.5"],
    ieltsNote: CCCCD_ENGLISH_NOTE,
    tuitionMin: 10728,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, 24 units)",
    tuitionNote: CCCCD_TUITION_NOTE,
    overview:
      "Los Medanos College is a public community college in Pittsburg, California, founded in 1974 and part of the Colleges of Contra Costa. International students work towards associate degrees and transfer to universities, and more than 500 students transfer to UC and CSU campuses each year. A second centre in Brentwood serves the east county.",
    studentLife:
      "The college has 33 student clubs and organizations, a Global Mentor Program for new international students and free bus tours to universities such as UC Davis, UC Berkeley and San Jose State. International students can apply for most scholarships after they enrol. Check the student life pages for current clubs and events.",
    accommodation:
      "The I-20 estimate assumes a homestay, and the district international office lists housing options in the East Bay. An on campus bus service links to the BART train, and students can also rent privately in Pittsburg and nearby cities. Check with the international office for current housing help and prices.",
    library:
      "The college library offers study spaces, computers and online resources, and free tutoring supports coursework. Check the library pages for opening hours and services.",
    sports:
      "LMC runs athletics teams including baseball, football, basketball and softball, and students can also join clubs and recreation on campus. Check the athletics pages for current teams.",
    wikipediaTitle: "Los Medanos College",
    ...seo("Los Medanos College", "Pittsburg, California"),
    courses: [
      ug("Associate in Science for Transfer, Business Administration", "Associate", "Business", "2 Years", "Jan 2027", "Fall and spring", 10728, "The main pathway to a business administration degree at a California State University."),
      ug("Associate in Science for Transfer, Computer Science", "Associate", "Computer Science", "2 Years", "Jan 2027", "Fall and spring", 10728),
      ug("Associate in Science, Engineering", "Associate", "Engineering", "2 Years", "Jan 2027", "Fall and spring", 10728, "Prepares students to move on to a four year engineering degree after transfer."),
      ug("Associate in Arts for Transfer, Psychology", "Associate", "Psychology", "2 Years", "Jan 2027", "Fall and spring", 10728),
    ],
    campuses: [
      {
        name: "Pittsburg Campus",
        city: "Pittsburg",
        address: "2700 East Leland Road, Pittsburg, CA 94565",
        description: "The main campus in the East Bay on about 120 acres, with teaching buildings, labs, the library and student services.",
      },
      {
        name: "Brentwood Center",
        city: "Brentwood",
        address: "1351 Pioneer Square, Brentwood, CA 94513",
        description: "A smaller centre in Brentwood that serves the far east of the county, so check which courses run there.",
      },
    ],
    documents: {
      Undergraduate: [
        ["Identity", "Passport"],
        ["Academic", "High school transcripts (required if under 18, recommended for everyone)"],
        ["Academic", "English language test result"],
        ["Financial", "Bank statement showing $30,495 in proof of funds"],
        ["Financial", "Financial sponsor form (if you have a sponsor)"],
        ["Visa", "Form I-20 issued by the college"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
      ],
    },
    faqs: usFaqs({
      name: "Los Medanos College",
      sector: "public",
      place: "Pittsburg, California",
      known:
        "Los Medanos College is known for its transfer pathways to University of California and California State University campuses, an honors programme with UCLA and other partners, and small classes in the East Bay.",
      ielts: CCCCD_ENGLISH_ANSWER,
      fees: CCCCD_FEES_ANSWER,
      intakes: CCCCD_INTAKES_ANSWER,
    }),
  },

  // ── PDF row 118 ────────────────────────────────────────────────────────
  {
    name: "Miami University Ohio",
    city: "Oxford",
    country: "United States",
    institutionType: "Public research university",
    website: "https://www.miamioh.edu",
    founded: 1809,
    upcomingIntake: "Aug 2027",
    programs: ["Business", "Engineering", "Computer Science"],
    summary:
      "A public research university in Oxford, Ohio, founded in 1809, with more than 120 undergraduate areas of study, a Tuition Promise that freezes costs for four years and international scholarships, including the full cost Presidential Fellows award.",
    ieltsOverall: 6.5,
    ieltsAlternatives: ["TOEFL iBT 80", "PTE 53", "Duolingo 110"],
    ieltsNote:
      "UG: IELTS 6.5, TOEFL iBT 80, PTE 53 or Duolingo 110. Lower scores may lead to conditional admission through the American Culture and English Program.",
    tuitionMin: 42882,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, non-Ohio resident)",
    tuitionNote:
      "Non-Ohio resident tuition and fees $42,882 for two semesters (2026/27 viewbook), frozen for four years by the Tuition Promise. Confirm on miamioh.edu.",
    overview:
      "Miami University is a public research university in Oxford, Ohio, founded in 1809 and known as a Public Ivy. The Oxford campus offers bachelor's degrees in more than 120 areas of study plus graduate programmes, with about 16,800 undergraduates, and students come from more than 100 countries. Miami also runs regional campuses, a centre in West Chester and a campus in Luxembourg.",
    studentLife:
      "International Student and Scholar Services runs orientation and support, the American Culture and English Program helps students build their English, and there are clubs with an international focus. Oxford is a university town about 35 miles north of Cincinnati with restaurants, shops and parks. Check the student life pages for current clubs and events.",
    accommodation:
      "Housing and meal plans are run by the university and are covered by Miami's Tuition Promise cost freeze for each new undergraduate class, and many older students rent apartments in Oxford. Check the housing pages for current prices and booking dates, and apply early.",
    library:
      "The University Libraries, including King Library, offer study spaces, online collections and research help, and academic advising and tutoring support coursework. Check the library pages for opening hours and services.",
    sports:
      "Miami competes in NCAA Division I athletics as the RedHawks in the Mid-American Conference, and students can also use recreation programmes and the Goggin Ice Center. Check the athletics and recreation pages for current teams and memberships.",
    wikipediaTitle: "Miami University",
    ...seo("Miami University Ohio", "Oxford, Ohio"),
    courses: [
      ug("BS Business, Finance", "BS", "Finance", "4 Years", "Aug 2027", "August and January", 42882, "A business degree from the Farmer School of Business with a finance major."),
      ug("BS Mechanical Engineering", "BS", "Engineering", "4 Years", "Aug 2027", "August and January", 42882, "An engineering degree that carries an extra college fee each semester, so confirm the total with admissions."),
      ug("BS Computer Science", "BS", "Computer Science", "4 Years", "Aug 2027", "August and January", 42882),
      pg("Master of Business Administration (MBA)", "MBA", "Business", undefined, "Aug 2027", "August and January", undefined, "Graduate fees differ from undergraduate fees, so confirm the fee with graduate admission."),
      pg("MS Computer Science and Software Engineering", "MS", "Computer Science", undefined, "Aug 2027", "August and January", undefined, "Graduate fees differ from undergraduate fees, so confirm the fee with graduate admission."),
    ],
    campuses: [
      {
        name: "Oxford Campus",
        city: "Oxford",
        address: "501 East High Street, Oxford, OH 45056",
        description: "The main campus, with most teaching, the University Libraries, residence halls and the Office of Admission.",
      },
      {
        name: "Luxembourg Campus",
        city: "Differdange",
        description: "The John E. Dolibois European Center in Differdange, Luxembourg, a study abroad campus that hosts nearly 300 Miami students a year.",
      },
    ],
    documents: US_DOCUMENTS,
    faqs: usFaqs({
      name: "Miami University Ohio",
      sector: "public",
      place: "Oxford, Ohio",
      known:
        "Miami University is known for strong undergraduate teaching, the Farmer School of Business, engineering and computing, education and a traditional residential campus in a small Ohio college town.",
      ielts:
        "Undergraduates need IELTS 6.5, TOEFL iBT 80, PTE 53 or Duolingo 110. Applicants with lower scores may be offered conditional admission through the American Culture and English Program. Some programmes may ask for more.",
      fees:
        "For 2026/27, non-Ohio resident tuition and fees are $42,882 for two semesters on the Oxford campus. The Tuition Promise freezes costs for four years for each incoming class, and international scholarships can reduce the bill.",
      intakes:
        "You can start in fall (August) or spring (January). First year international applicants who apply by Miami's December deadline are considered for the most scholarships, so check the dates for your term.",
    }),
  },

  // ── PDF row 119 ────────────────────────────────────────────────────────
  {
    name: "Miami University Ohio Regionals",
    city: "Middletown",
    country: "United States",
    institutionType: "Public university regional campuses",
    website: "https://miamioh.edu/regionals",
    founded: 1966,
    upcomingIntake: "Jan 2027",
    programs: ["General Studies", "Applied Business", "Applied Science"],
    summary:
      "The regional campuses of Miami University in Middletown and Hamilton, Ohio, offering associate degrees and the start of four year degrees, an 18 to 1 student to faculty ratio, an English Language Center and tuition well below the Oxford campus.",
    ieltsOverall: 6.5,
    ieltsAlternatives: ["TOEFL iBT 80", "PTE 53", "Duolingo 110"],
    ieltsNote:
      "Oxford UG scores apply: IELTS 6.5, TOEFL iBT 80, PTE 53 or Duolingo 110. Lower scores may start in the Middletown English Language Center. Confirm first.",
    tuitionMin: MIAMI_REGIONALS_YEARLY,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, non-Ohio resident, 24 credits)",
    tuitionNote:
      "Per credit hour: tuition $300.17, fees $30.67 and non-resident surcharge $534.97, about $20,779 for 24 credits. Confirm on the Miami One Stop page.",
    overview:
      "Miami University Regionals are the Hamilton and Middletown campuses of Miami University, plus the Voice of America Learning Center in West Chester. Middletown opened in 1966, and more than 3,600 students study on the regional campuses, where associate degrees, bachelor's degrees and the start of most four year degrees are offered. About 135 international students were enrolled in 2024.",
    studentLife:
      "Regional students can join clubs and use TRIO support programmes and career fairs, and international students who need more English can start in the Middletown English Language Center. Health insurance is mandatory for international students at Regionals. Check the Regionals pages for current events.",
    accommodation:
      "Hamilton and Middletown are commuter campuses, so students usually find rooms or apartments nearby, while residence halls are on the separate Oxford campus. Check with the Regionals admission office for current housing help and prices.",
    library:
      "Each regional campus has a library with study spaces, computers and online resources, and students also reach Miami's wider online collections. Check the library pages for opening hours and services.",
    sports:
      "Miami Regionals run their own athletics and recreation programmes, and students can join activities on campus. Check the Regionals athletics and recreation pages for current teams and memberships.",
    wikipediaTitle: "Miami University Middletown",
    ...seo("Miami University Ohio Regionals", "Middletown and Hamilton, Ohio"),
    courses: [
      ug("Associate in Arts, General Studies", "Associate", "General Studies", "2 Years", "Jan 2027", "Fall and spring", MIAMI_REGIONALS_YEARLY, "A two year transfer degree that covers general education and can lead on to a bachelor's degree."),
      ug("Associate of Applied Business", "Associate", "Business", "2 Years", "Jan 2027", "Fall and spring", MIAMI_REGIONALS_YEARLY),
      ug("Associate in Applied Science", "Associate", "Applied Science", "2 Years", "Jan 2027", "Fall and spring", MIAMI_REGIONALS_YEARLY),
      ug("Bachelor's degree start (continue at Oxford or Regionals)", "Pathway", "General Studies", undefined, "Jan 2027", "Fall and spring", MIAMI_REGIONALS_YEARLY, "Beginning coursework for most four year Miami degrees, with the option to continue at Oxford, so confirm the route with admissions."),
      ug("English Language Center", "Pathway", "English Language", undefined, "Jan 2027", "Fall and spring", undefined, "An intensive English programme in Middletown for conditional admission students, charged at its own rates."),
    ],
    campuses: [
      {
        name: "Hamilton Campus",
        city: "Hamilton",
        address: "1601 University Boulevard, Hamilton, OH 45011",
        description: "A compact commuter campus on the Great Miami River offering associate degrees, bachelor's degrees and beginning coursework.",
      },
      {
        name: "Middletown Campus",
        city: "Middletown",
        address: "4200 North University Boulevard, Middletown, OH 45042",
        description: "A commuter campus on about 141 acres near I-75, opened in 1966, and home to the English Language Center.",
      },
      {
        name: "Voice of America Learning Center",
        city: "West Chester",
        address: "7847 VOA Park Drive, West Chester, OH 45069",
        description: "A learning center between Cincinnati and Dayton offering selected undergraduate and graduate courses from the Regional and Oxford campuses.",
      },
    ],
    documents: {
      Undergraduate: US_DOCUMENTS.Undergraduate,
    },
    faqs: usFaqs({
      name: "Miami University Ohio Regionals",
      sector: "public",
      place: "Middletown and Hamilton, Ohio",
      known:
        "Miami Regionals are known for low cost Miami degrees, small classes, associate degrees and an English Language Center, on commuter campuses in southwest Ohio.",
      ielts:
        "Miami's undergraduate scores are IELTS 6.5, TOEFL iBT 80, PTE 53 or Duolingo 110. Applicants with lower scores can be considered for conditional admission through the Middletown English Language Center, so confirm with Regionals admission.",
      fees:
        "For 2026/27, a first time non-Ohio resident pays about $20,779 for 24 credits: tuition $300.17, fees $30.67 and a $534.97 non-resident surcharge per credit hour. The Tuition Promise freezes this rate for eight semesters.",
      intakes:
        "You can start in fall (August) or spring (January), and admission for new students is rolling, so apply early to leave time for your I-20 and visa. Check the Regionals admission page for the dates for your term.",
    }),
  },

  // ── PDF row 120 ────────────────────────────────────────────────────────
  {
    name: "Mt. San Antonio College",
    city: "Walnut",
    country: "United States",
    institutionType: "Public community college",
    website: "https://www.mtsac.edu",
    founded: 1945,
    upcomingIntake: "Feb 2027",
    programs: ["Business", "Computer Science", "Engineering"],
    summary:
      "A public community college in Walnut, California, about 25 miles east of Los Angeles, with more than 400 degree and certificate programmes, transfer pathways to California universities, a $50 application fee and a low English entry of IELTS 4.5.",
    ieltsOverall: 4.5,
    ieltsAlternatives: ["TOEFL iBT 3.5 (new scale)", "Duolingo 75", "PTE 41", "iTEP 3.5"],
    ieltsNote:
      "IELTS 4.5, TOEFL iBT 3.5 (new scale), Duolingo 75, PTE 41, iTEP 3.5 or Oxford ELLT 4. Partner English schools such as ELS Level 109 also count.",
    tuitionMin: 11520,
    tuitionCurrency: "USD",
    tuitionPeriod: "per year (2026/27, 24 units)",
    tuitionNote:
      "Non-resident tuition $434 per unit plus enrollment fee $46 per unit, 24 units. I-20 total is $27,942 with insurance and living costs. Confirm on mtsac.edu.",
    overview:
      "Mt. San Antonio College, known as Mt. SAC, is a public community college in Walnut, California, about 25 miles east of Los Angeles, and it began in 1945. It offers more than 400 degree and certificate programmes and is known as a strong transfer college to universities such as UCLA and USC. International F-1 students can apply for fall, spring and summer.",
    studentLife:
      "The International Student Center runs events and workshops and the Global Pals programme, and every F-1 student completes a mandatory orientation before classes. Student health insurance is mandatory for international students. Check the international student pages for current events.",
    accommodation:
      "The I-20 budget uses $9,500 a year for housing and $4,000 for food, and students arrange housing off campus. The international office has a housing and transportation page with current options and tips.",
    library:
      "The Mt. SAC library offers study spaces, computers and online resources, and counselling and tutoring support coursework and transfer plans. Check the library pages for opening hours and services.",
    sports:
      "Mt. SAC competes in athletics as the Mounties and hosts the well known Mt. SAC Relays track meet, and students can also join clubs and recreation on campus. Check the athletics pages for current teams.",
    wikipediaTitle: "Mt. San Antonio College",
    ...seo("Mt. San Antonio College", "Walnut, California"),
    courses: [
      ug("Associate in Science for Transfer, Business Administration", "Associate", "Business", "2 Years", "Feb 2027", "Fall and spring", 11520, "The main pathway to a business administration degree at a California State University."),
      ug("Associate in Science for Transfer, Computer Science", "Associate", "Computer Science", "2 Years", "Feb 2027", "Fall and spring", 11520),
      ug("Associate in Science, Engineering", "Associate", "Engineering", "2 Years", "Feb 2027", "Fall and spring", 11520, "Prepares students to move on to a four year engineering degree after transfer."),
      ug("Associate in Arts for Transfer, Psychology", "Associate", "Psychology", "2 Years", "Feb 2027", "Fall and spring", 11520),
    ],
    campuses: [
      {
        name: "Walnut Campus",
        city: "Walnut",
        address: "1100 North Grand Avenue, Walnut, CA 91789",
        description: "The single main campus in the San Gabriel Valley, with teaching buildings, the library, the International Student Center and athletics facilities.",
      },
    ],
    documents: {
      Undergraduate: [
        ["Identity", "Passport valid for at least 6 months beyond your arrival"],
        ["Academic", "Proof of high school completion (required if under 18)"],
        ["Academic", "English language test result (or an accepted exemption)"],
        ["Financial", "Bank letter or statement with an official signature or seal, dated within six months"],
        ["Visa", "Form I-20 issued by the college"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
        ["Visa", "Tuberculosis skin test dated within six months"],
      ],
    },
    faqs: usFaqs({
      name: "Mt. San Antonio College",
      sector: "public",
      place: "Walnut, California",
      known:
        "Mt. SAC is known for its transfer pathways to University of California and California State University campuses, a very wide choice of programmes and a large campus near Los Angeles.",
      ielts:
        "You need IELTS 4.5, TOEFL iBT 3.5 on the new scale, Duolingo 75, PTE 41, iTEP 3.5 or Oxford ELLT 4. Citizens of some English speaking countries are exempt, and completing a partner English school level such as ELS 109 also counts.",
      fees:
        "For 2026/27, non-resident tuition is $434 per unit and the enrollment fee is $46 per unit, about $11,520 for 24 units. The I-20 total is $27,942 with insurance and living costs, and the application fee is $50.",
      intakes:
        "You can start in fall, spring or summer. For spring 2027 the application deadline is November 15, 2026 and classes begin on February 22, 2027. The fall deadline was June 15 for 2026, so expect a similar date for 2027.",
    }),
  },

  // ── PDF row 121 ────────────────────────────────────────────────────────
  {
    name: "New York Film Academy",
    city: "New York",
    country: "United States",
    institutionType: "Private film and media arts school",
    website: "https://www.nyfa.edu",
    founded: 1992,
    upcomingIntake: "Jan 2027",
    programs: ["Filmmaking", "Acting for Film", "Photography"],
    summary:
      "A private film and performing arts school with campuses in New York City and Los Angeles (Burbank), offering AFA, BFA and MFA degrees in filmmaking, acting, photography and more, with English entry from IELTS 6.0 and a $75 application fee.",
    ieltsOverall: 6.0,
    ieltsAlternatives: ["TOEFL iBT 68 (4 on the new scale)", "Duolingo 105", "MET 55"],
    ieltsNote:
      "UG and AFA: IELTS 6.0, TOEFL 68 (4 new scale), Duolingo 105. Master's: IELTS 6.5, TOEFL 79 (4.5), Duolingo 120. Pathway Track for lower scores.",
    tuitionMin: 19500,
    tuitionMax: 20500,
    tuitionCurrency: "USD",
    tuitionPeriod: "per semester (Fall 2026 and Spring 2027)",
    tuitionNote:
      "Filmmaking tuition $19,500 per semester (MFA $20,500) plus a $2,000 departmental fee and smaller fees each semester. Confirm on nyfa.edu.",
    overview:
      "New York Film Academy was founded in 1992 and teaches film, media and performing arts through hands on, project based study at campuses in New York City and Los Angeles, with a further campus in Florence, Italy. It awards AFA, BFA and MFA degrees as well as one and two year certificates, and its students come from more than 120 countries.",
    studentLife:
      "Students learn by doing, writing, shooting and directing their own films, and the school runs a film festival department, career and alumni services and guest speaker events. International students who need more English can join the Pathway Track while earning degree credits. Check the student life pages for current activities.",
    accommodation:
      "NYFA publishes student housing information on its housing page, and many students share apartments near the New York and Burbank campuses. Students also budget for their own production costs on top of tuition, so check the cost of attendance pages for current housing prices.",
    library:
      "Each campus offers study and screening spaces and equipment support for productions, along with online resources for coursework. Check the NYFA pages for current opening hours and services.",
    sports:
      "NYFA is a specialist arts school without varsity athletics, so student life centres on film projects, festivals and social events, while students can use gyms and recreation in New York and Los Angeles. Check the student life pages for current activities.",
    wikipediaTitle: "New York Film Academy",
    ...seo("New York Film Academy", "New York City and Burbank"),
    courses: [
      ug("BFA Filmmaking", "BFA", "Film and Media", "3 Years", "Jan 2027", "January, May and August", 19500, "A nine semester degree in New York or Los Angeles where students write, shoot and direct their own films.", "per semester (Fall 2026 and Spring 2027)"),
      ug("BFA Acting for Film", "BFA", "Acting", "3 Years", "Jan 2027", "January, May and August", undefined, "An acting degree for film built on scene study, voice, movement and audition technique, so confirm the semester fee with admissions."),
      ug("AFA Filmmaking", "AFA", "Film and Media", "2 Years", "Jan 2027", "January, May and August", 19500, "A six semester associate degree in Los Angeles in which students make several of their own short films.", "per semester (Fall 2026 and Spring 2027)"),
      pg("MFA Filmmaking", "MFA", "Film and Media", "2 Years", "Jan 2027", "January and August", 20500, "A six semester graduate degree in Los Angeles covering directing, cinematography, editing, producing and sound.", "per semester (Fall 2026 and Spring 2027)"),
      pg("MFA Photography", "MFA", "Photography", "2 Years", "Jan 2027", "January and August", undefined, "A graduate photography degree in Los Angeles, so confirm the semester fee with admissions."),
    ],
    campuses: [
      {
        name: "New York City Campus",
        city: "New York",
        address: "17 Battery Place, New York, NY 10004",
        description: "The original campus near Battery Park in lower Manhattan, offering BFA and other programmes in film, media and performing arts.",
      },
      {
        name: "Los Angeles Campus",
        city: "Burbank",
        address: "3300 Riverside Drive, Burbank, CA 91505",
        description: "The Burbank campus near the major studios, where all NYFA degree levels are taught, including the AFA, BFA and MFA programmes.",
      },
    ],
    documents: {
      Undergraduate: [
        ["Identity", "Passport"],
        ["Academic", "High school transcript, translated and evaluated if from outside the USA"],
        ["Academic", "Narrative statement"],
        ["Academic", "Two letters of recommendation"],
        ["Academic", "Creative portfolio or audition"],
        ["Academic", "English language test result"],
        ["Financial", "Bank statement showing proof of funds"],
        ["Visa", "Form I-20 issued by the school"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
      ],
      Postgraduate: [
        ["Identity", "Passport"],
        ["Academic", "Degree certificate and transcripts, evaluated if from outside the USA"],
        ["Academic", "Narrative statement"],
        ["Academic", "Letters of recommendation"],
        ["Academic", "CV or resume"],
        ["Academic", "Creative portfolio or audition"],
        ["Academic", "English language test result"],
        ["Financial", "Bank statement showing proof of funds"],
        ["Visa", "Form I-20 issued by the school"],
        ["Visa", "F-1 visa interview appointment and SEVIS fee receipt"],
      ],
    },
    faqs: usFaqs({
      name: "New York Film Academy",
      sector: "private",
      place: "New York City and Burbank, California",
      known:
        "NYFA is known for hands on, project based programmes in filmmaking, acting, photography, producing and media, where students make their own films from the first term.",
      ielts:
        "For associate and bachelor's programmes, NYFA prefers IELTS 6.0, TOEFL 68 (4 on the new scale) or Duolingo 105. For master's programmes it prefers IELTS 6.5, TOEFL 79 (4.5) or Duolingo 120. Students below these scores can join the Pathway Track.",
      fees:
        "For Fall 2026 and Spring 2027, Filmmaking AFA and BFA tuition is $19,500 per semester and MFA Filmmaking is $20,500, plus a $2,000 departmental fee and smaller activity, technology and wellness fees. Other programmes differ, so confirm your course fee.",
      intakes:
        "Most degrees start three times a year, in January, May and August, though some programmes start only in certain terms. The application fee is $75, and a deposit secures your place after admission, so apply early for your I-20 and visa.",
    }),
  },
];