// prisma/institutionBatches/batch57.ts
//
// Batch 57: rows 341 to 344 of RGR University List (Switzerland, Slovenia and Georgia). THIS IS THE LAST BATCH.
//   341  EU Business School                                                   (private business school, filed under Switzerland)
//   342  HTMi (International Hotel and Tourism Institute)                     (private hospitality institute, Sarnen, Switzerland)
//   343  University of EMUNI, The Euro Mediterranean University               (international postgraduate university, Portoroz, Slovenia)
//   344  David Tvildiani Medical University                                   (private medical university, Tbilisi, Georgia)
//
// That gives 4 institutions from 4 PDF rows, nothing skipped. Batch 56 ended at row 340. The PDF ends at row 344, so
// with this batch every row from 1 to 344 has been covered.
//
// DECISION ROW 341 (EU Business School): the PDF lists it under Switzerland, but the school also has campuses in
// Barcelona and Munich. It is filed under Switzerland, as the PDF has it, with Geneva as the home city. Montreux, Barcelona
// and Munich are listed as campuses. Change country to Spain and city to Barcelona if you would rather file it there.
// This is the same call as Geneva Business School in batch 56. One extra FAQ explains who awards the degrees.
//
// DECISION ROW 343 (EMUNI): EMUNI is a postgraduate only institution, so it has no bachelor's courses. The only
// programme confirmed from a recent source is the Master in Intercultural Business Communication (2018/19 flyer). Older
// reports name other EMUNI label masters (Risk Science, Global Law, International Relations and Immigration, Culture
// and Tourism), but those are from 2008 to 2012 and are not listed because they may no longer run. An extra FAQ tells
// students that there is no undergraduate route.
//
// SLUG NOTES: row 342 is filed as HTMi Hotel and Tourism Management Institute Switzerland. The PDF writes
// "International Hotel and Tourism Institute", but the study portals use the Hotel and Tourism Management Institute
// Switzerland name. Row 343 uses the name EMUNI University in the entry.
//
// WEB SEARCH: DONE for all four schools.
//   - EU Business School: Wikipedia says founded 1973 as European University, Geneva campus 1987, Barcelona 1989,
//     Munich 1991, plus a digital campus. The school's own descriptions add Montreux. It offers foundation, bachelor's,
//     master's, MBA and doctoral programmes in English, with fields such as business administration, communication,
//     tourism management, international relations, sports management, digital media management, international
//     business, marketing and finance. A DBA runs on the Geneva campus. Accreditations listed: ACBSP, IACBE, IQA from
//     CEEMAN and the Swiss EduQua label. State recognised degrees are awarded through partners, named as the
//     University of Roehampton, the University of Derby and UCAM. Website euruni.edu comes from the school's brochure.
//   - HTMi: campus in Sarnen, Switzerland. Programmes found on study portals: BA International Hospitality Business
//     Management, BA International Hospitality and Human Resources Management (both list entry as a Higher Diploma or
//     equivalent, IELTS about 6, TOEFL 550), MA Hotel Business Management (IELTS 6, TOEFL 547, includes work
//     placement), an MBA Postgraduate Diploma in Hospitality Management with an MSc by Edinburgh Napier University after
//     a dissertation, and Postgraduate Diplomas in International Hotel and Tourism Management and in International Hotel
//     Events Management. Modes listed are on campus, blended and online. One portal gave 23,000 CHF a year for a
//     postgraduate diploma, not filed because it was not checked.
//   - EMUNI: established 9 June 2008 in Portoroz, co-founded by the universities of Haifa, Maribor, Sousse and Urbino
//     Carlo Bo, one of the priorities of the Union for the Mediterranean, legal entity in Slovenia since February 2009.
//     The 2018/19 flyer gives the address Kidricevo nabrezje 2, 6330 Piran, lectures in Piran with e-learning, and an
//     optional semester at Urbino for 24 ECTS or more with a second certificate. An older record gives Soncna pot 20,
//     Portoroz.
//   - David Tvildiani Medical University: private, Tbilisi. One cycle English language Medical Doctor programme, 360
//     ECTS, six years, accredited by Georgia's quality body from 29 June 2021 to 29 June 2028 (with a progress report
//     condition). Sites in Tbilisi (Ljubljana St 13 and Chiaureli St 6, and Ak. Tsereteli Ave 121) and Rustavi. A
//     portal says AIETI Medical School was listed in the WHO directory in 1995 and was founded in 1989, and the
//     accreditation report says the MD programme dates from 1991. A study portal lists September starts with a 1 July
//     deadline. Other programmes named by one portal: pre medical, nursing and PhD.
//
// WHAT NEEDS CHECKING BEFORE IT REACHES STUDENTS:
//   - Every English score. None was confirmed for EU Business School, EMUNI or David Tvildiani. HTMi figures come from
//     study portals.
//   - All programme names, lengths and intakes. Start dates (February or September for the Swiss schools, October for
//     EMUNI, September for David Tvildiani) are typical figures, not confirmed.
//   - Campus addresses. No street address was found for any EU Business School campus or for HTMi. The EMUNI and David
//     Tvildiani addresses came from older records, and the Rustavi street name differs between sources.
//   - Websites. htmi.ch and dtmu.edu.ge are from memory and were not shown in the searches.
//   - Founding year of David Tvildiani (1989 from one portal, MD programme from 1991). No founding year is filed for HTMi.
//   - Which EU Business School degrees are awarded by which partner, and whether they are recognised where the student
//     plans to work or study next.
//   - Whether the EMUNI master is still offered and taught in English.
//   - Which David Tvildiani years run on which campus, and whether nursing and the pre medical programme are open to
//     international students.
//   - Medical degree recognition and licensing in the country where the student plans to practise (for example the
//     home country medical council rules for foreign graduates).
//   - Visa rules for Nigerian applicants (Swiss national visa, Slovenian long stay visa, Georgian student visa). The
//     document packs list the usual items only.
//
// FEWER THAN 10 COURSES: all four entries list only what is well known or was found. I did not pad them with invented
// courses. EMUNI has a single course. Send me the school's course list if you want more.
//
// Left out on purpose: tuition figures, acceptance rate, ranking, social links, postal codes and anything unconfirmed.
//
// TEXT LIMITS: every text field is one paragraph and stays inside the engine limits (summary 320, ieltsNote 160,
// tuitionNote 160, metaTitle 70, metaDescription 170, overview/studentLife/accommodation/library/sports 450,
// course and campus description 300, FAQ answer 400). Run with --dry first to confirm the batch passes.
//
// Run:  npm run seed:institutions -- 57 --dry
//       npm run seed:institutions -- 57

import type { CourseInput, DocumentRow, FaqInput, InstitutionInput } from "./types";

// ── Shared helpers ───────────────────────────────────────────────────────

// General student visa packs. Confirm anything specific with the international office of
// each institution and with the immigration service of the country.
const CH_DOCUMENTS: Record<string, DocumentRow[]> = {
  Undergraduate: [
    ["Identity", "Passport"],
    ["Academic", "Secondary school certificate and transcripts, legalised, with a certified translation if needed"],
    ["Academic", "English language test result or proof of English study"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Proof of tuition fee or deposit payment"],
    ["Visa", "Admission letter from the institution"],
    ["Visa", "Swiss national visa (type D) application at the Swiss embassy"],
    ["Visa", "Proof of accommodation in Switzerland, if requested"],
    ["Visa", "Health insurance valid in Switzerland"],
  ],
  Postgraduate: [
    ["Identity", "Passport"],
    ["Academic", "Degree certificate and transcripts, legalised, with a certified translation if needed"],
    ["Academic", "CV or resume"],
    ["Academic", "Statement of purpose or motivation letter"],
    ["Academic", "English language test result or proof of English study"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Proof of tuition fee or deposit payment"],
    ["Visa", "Admission letter from the institution"],
    ["Visa", "Swiss national visa (type D) application at the Swiss embassy"],
    ["Visa", "Proof of accommodation in Switzerland, if requested"],
    ["Visa", "Health insurance valid in Switzerland"],
  ],
};

const SI_DOCUMENTS: Record<string, DocumentRow[]> = {
  Postgraduate: [
    ["Identity", "Passport"],
    ["Academic", "Bachelor degree certificate and transcripts, legalised, with a certified translation if needed"],
    ["Academic", "CV or resume"],
    ["Academic", "Statement of purpose or motivation letter"],
    ["Academic", "English language test result or proof of English study"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Proof of tuition fee or deposit payment"],
    ["Visa", "Admission letter from the institution"],
    ["Visa", "Slovenian long stay visa (type D) or temporary residence permit for study"],
    ["Visa", "Proof of accommodation in Slovenia"],
    ["Visa", "Police clearance, if required"],
    ["Visa", "Health insurance"],
  ],
};

const GE_DOCUMENTS: Record<string, DocumentRow[]> = {
  Undergraduate: [
    ["Identity", "Passport"],
    ["Academic", "Secondary school certificate and transcripts, legalised or with an apostille, with a certified translation if needed"],
    ["Academic", "English language test result, or proof of English study if the university asks for it"],
    ["Academic", "Entrance examination result, as set by the university"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Proof of tuition fee or deposit payment"],
    ["Visa", "Admission letter from the university"],
    ["Visa", "Georgian student visa or residence permit application"],
    ["Visa", "Medical certificate and police clearance, if required"],
    ["Visa", "Health insurance"],
  ],
  Postgraduate: [
    ["Identity", "Passport"],
    ["Academic", "Degree certificate and transcripts, legalised or with an apostille, with a certified translation if needed"],
    ["Academic", "CV or resume"],
    ["Academic", "Research proposal or statement of purpose"],
    ["Academic", "English language test result or proof of English study"],
    ["Financial", "Bank statement showing proof of funds"],
    ["Financial", "Proof of tuition fee or deposit payment"],
    ["Visa", "Admission letter from the university"],
    ["Visa", "Georgian student visa or residence permit application"],
    ["Visa", "Health insurance"],
  ],
};

function faqs(o: {
  name: string;
  sector: "public" | "private";
  place: string;
  known: string;
  ielts: string;
  fees: string;
  intakes: string;
  statusAnswer?: string;
}): FaqInput[] {
  return [
    {
      question: `Is ${o.name} a public or private institution?`,
      answer: o.statusAnswer ?? `It is a ${o.sector} institution in ${o.place}.`,
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
  cur: string,
  name: string,
  degree: string,
  subject: string,
  duration: string | undefined,
  nextIntake: string | undefined,
  intakes: string | undefined,
  description?: string
): CourseInput {
  return {
    name,
    level: "Undergraduate",
    degree,
    subject,
    duration,
    nextIntake,
    intakes,
    tuitionCurrency: cur,
    tuitionPeriod: "per year (2026/27)",
    description,
  };
}

function pg(
  cur: string,
  name: string,
  degree: string,
  subject: string,
  duration: string | undefined,
  nextIntake: string | undefined,
  intakes: string | undefined,
  description?: string
): CourseInput {
  return {
    name,
    level: "Postgraduate",
    degree,
    subject,
    duration,
    nextIntake,
    intakes,
    tuitionCurrency: cur,
    tuitionPeriod: "per year (2026/27)",
    description,
  };
}

// Short repeated sentence for courses where no fee was found.
const CONFIRM_FEE = "Confirm the fee with admissions before you apply.";

export const INSTITUTIONS: InstitutionInput[] = [
  // ── PDF row 341 ────────────────────────────────────────────────────────
  {
    name: "EU Business School",
    slug: "eu-business-school",
    city: "Geneva",
    country: "Switzerland",
    institutionType: "Private business school",
    website: "https://www.euruni.edu",
    founded: 1973,
    upcomingIntake: "Feb 2027",
    programs: ["Business Administration", "International Relations", "Tourism Management"],
    summary:
      "A private business school founded in 1973, with campuses in Geneva and Montreux in Switzerland, plus Barcelona and Munich. It teaches foundation, bachelor's, master's, MBA and doctoral programmes in English, in fields such as business administration, marketing, international relations and tourism.",
    ieltsNote:
      "No entry score was found. Programmes are taught in English. Confirm the accepted tests and scores for your programme with admissions.",
    tuitionCurrency: "CHF",
    tuitionNote: "No tuition figure was confirmed. Fees differ by programme and campus. Confirm with EU Business School admissions.",
    overview:
      "EU Business School was founded in 1973 as European University and has campuses in Geneva, Montreux, Barcelona and Munich, plus a digital campus. It offers foundation, bachelor's, master's, MBA and doctoral programmes taught in English. State recognised degrees are awarded through academic partners, including the University of Roehampton, the University of Derby and UCAM, depending on the programme and campus.",
    studentLife:
      "Classes are small and international, and English is the language of teaching. Geneva is a global hub for banks and international bodies, and Montreux sits on Lake Geneva. Check the EU Business School pages for events, clubs and student support.",
    accommodation:
      "Housing differs by campus, and many students rent rooms or shared flats. Swiss rents are high, so budget carefully. Check the EU Business School accommodation pages for current options, costs and booking dates, and apply early.",
    library:
      "No library details were confirmed. The school runs a digital campus with online learning tools. Check the EU Business School pages for facilities and study support.",
    sports:
      "No sports facility details were confirmed. Sports management is one of the school's subject areas. Check the EU Business School pages for current clubs and activities.",
    wikipediaTitle: "EU Business School",
    ...seo("EU Business School", "Geneva, Switzerland"),
    courses: [
      ug("CHF", "Bachelor in Business Administration", "BBA", "Business", undefined, "Feb 2027", undefined, "A bachelor's degree in business, offered with several specialisations. The school lists BBA, BA and BS awards. It was not checked for 2026/27. Confirm the specialisations, length, campus and intakes. " + CONFIRM_FEE),
      ug("CHF", "Bachelor in International Relations", "Bachelor", "International Relations", undefined, "Feb 2027", undefined, "International relations is one of the fields the school lists. The level and title were not checked. Confirm the degree title, length, campus and intakes. " + CONFIRM_FEE),
      pg("CHF", "Master of Business Administration (MBA)", "MBA", "Business", undefined, "Feb 2027", undefined, "An MBA taught in English, with specialisations such as entrepreneurship and marketing named in rankings. It was not checked for 2026/27. Confirm the length, campus, intakes and entry rules. " + CONFIRM_FEE),
      pg("CHF", "Doctor of Business Administration (DBA)", "DBA", "Business", undefined, undefined, undefined, "A doctoral programme in business, listed on the Geneva campus. It was not checked for 2026/27. Confirm the length, format, start dates and entry rules. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "Geneva Campus",
        city: "Geneva",
        address: "Geneva, Switzerland. Confirm the full address with the school.",
        description: "The first Swiss campus, opened in 1987. A Swiss student visa is needed for study here. Confirm the address and which programmes are taught there.",
      },
      {
        name: "Montreux Campus",
        city: "Montreux",
        address: "Montreux, Switzerland. Confirm the full address with the school.",
        description: "A Swiss campus on Lake Geneva, listed alongside Geneva for foundation and bachelor's programmes. Confirm the address and which programmes are taught there.",
      },
      {
        name: "Barcelona Campus",
        city: "Barcelona",
        address: "Barcelona, Spain. Confirm the full address with the school.",
        description: "A campus in Barcelona, opened in 1989. A Spanish student visa is needed for study here. Confirm the address and which programmes are taught there.",
      },
      {
        name: "Munich Campus",
        city: "Munich",
        address: "Munich, Germany. Confirm the full address with the school.",
        description: "A campus in Munich, opened in 1991. Confirm the address, programmes and whether it takes international students.",
      },
    ],
    documents: CH_DOCUMENTS,
    faqs: [
      ...faqs({
        name: "EU Business School",
        sector: "private",
        place: "Geneva and Montreux, Switzerland, with campuses in Spain and Germany",
        known:
          "EU Business School is known for English taught business programmes, small classes, campuses in Geneva, Montreux, Barcelona and Munich, and degrees awarded through partner universities.",
        ielts:
          "No entry score was found for this listing. Programmes are taught in English. Confirm the accepted tests and the score for your programme with admissions before you apply.",
        fees:
          "No tuition figure was confirmed for this listing. Fees differ by programme and campus, and housing and Swiss living costs are extra. Confirm the current figures with admissions.",
        intakes:
          "Start dates were not confirmed. Many business schools start in September and in January or February. Check with admissions for the next start, and apply early to leave time for your student visa.",
      }),
      {
        question: "Who awards the degree at EU Business School?",
        answer:
          "The school lists ACBSP and IACBE programme accreditation, IQA quality accreditation from CEEMAN and the Swiss EduQua label. State recognised degrees are awarded through partners such as Roehampton, Derby and UCAM. Check which partner awards your degree and how it is recognised in your next country.",
      },
    ],
  },

  // ── PDF row 342 ────────────────────────────────────────────────────────
  {
    name: "HTMi Hotel and Tourism Management Institute Switzerland",
    slug: "htmi-hotel-and-tourism-management-institute-switzerland",
    city: "Sarnen",
    country: "Switzerland",
    institutionType: "Private hospitality management institute",
    website: "https://www.htmi.ch",
    upcomingIntake: "Feb 2027",
    programs: ["Hospitality Management", "Hotel Business Management", "Tourism Management"],
    summary:
      "A private hospitality and tourism institute in Sarnen, central Switzerland, with bachelor's, postgraduate diploma and master's programmes in hotel, events and tourism management, taught in English on campus, blended or online. One master's route leads to an MSc from Edinburgh Napier University.",
    ieltsNote:
      "HTMi accepts an interview or its own English test. Study portals list about IELTS 6.0 or TOEFL 547 to 550. Confirm the score for your programme.",
    tuitionCurrency: "CHF",
    tuitionNote: "No tuition figure was confirmed. Fees differ by programme. Confirm with HTMi admissions.",
    overview:
      "HTMi, the Hotel and Tourism Management Institute Switzerland, is a private institute with its campus in Sarnen, in central Switzerland. It offers bachelor's degrees, postgraduate diplomas and master's programmes in hospitality, hotel business, events and tourism management, available on campus, blended or online, and taught in English.",
    studentLife:
      "Several programmes combine academic study with a work placement or internship in hospitality. Sarnen is a small town on a lake in central Switzerland, with mountains and walking routes nearby. Check the HTMi pages for events, clubs and student support.",
    accommodation:
      "Sarnen is a small town, so many students live in rented rooms or shared housing nearby. Swiss rents are high, so budget carefully. Check the HTMi accommodation pages for current options, costs and booking dates, and apply early.",
    library:
      "No library details were confirmed. Programmes can be taken on campus, blended or online, so learning tools are available digitally. Check the HTMi pages for facilities and study support.",
    sports:
      "No sports facility details were confirmed. The lake and mountain setting offers hiking, water sports and winter sports nearby. Check the HTMi pages for current clubs and activities.",
    ...seo("HTMi Hotel and Tourism Management Institute Switzerland", "Sarnen, Switzerland"),
    courses: [
      ug("CHF", "BA in International Hospitality Business Management", "BA", "Hospitality", undefined, "Feb 2027", undefined, "A bachelor's degree listed on a study portal. Entry is listed as a Higher Diploma in International Hotel and Tourism Management or equivalent, with about IELTS 6.0. Confirm the route, length and intakes. " + CONFIRM_FEE),
      ug("CHF", "BA in International Hospitality and Human Resources Management", "BA", "Hospitality", undefined, "Feb 2027", undefined, "A bachelor's degree listed on a study portal, with the same entry as the business management BA. It was not checked on the HTMi site. Confirm the route, length and intakes. " + CONFIRM_FEE),
      pg("CHF", "MA in Hotel Business Management", "MA", "Hospitality", undefined, "Feb 2027", undefined, "A master's degree that includes a work placement or internship, with about IELTS 6.0 listed. It was not checked for 2026/27. Confirm the length, intakes and entry rules. " + CONFIRM_FEE),
      pg("CHF", "MBA Postgraduate Diploma and MSc in Hospitality and Tourism Management", "MSc", "Hospitality", undefined, "Feb 2027", undefined, "A route to an HTMi MBA and an MSc from Edinburgh Napier University, after a dissertation. It was not checked for 2026/27. Confirm the length, intakes and entry rules. " + CONFIRM_FEE),
      pg("CHF", "Postgraduate Diploma in International Hotel and Tourism Management", "PG Diploma", "Hospitality", undefined, "Feb 2027", undefined, "A postgraduate diploma with academic study and a work placement or internship. It was not checked for 2026/27. Confirm the length, intakes and entry rules. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "Sarnen Campus",
        city: "Sarnen",
        address: "Sarnen, Canton of Obwalden, Switzerland. Confirm the full address with HTMi.",
        description: "The institute's campus in central Switzerland. A Swiss student visa is needed. Confirm the address and which programmes run on campus, blended or online.",
      },
    ],
    documents: CH_DOCUMENTS,
    faqs: [
      ...faqs({
        name: "HTMi",
        sector: "private",
        place: "Sarnen, Switzerland",
        known:
          "HTMi is known as a Swiss hospitality and tourism institute with programmes in hotel business, events and tourism management, work placements, and options to study on campus, blended or online.",
        ielts:
          "HTMi accepts an interview or its own English placement test. Study portals list about IELTS 6.0, or TOEFL 547 to 550, depending on the programme. Confirm the accepted tests and the score for your programme with admissions.",
        fees:
          "No tuition figure was confirmed for this listing. Fees differ by programme, and housing and Swiss living costs are extra. Confirm the current figures with HTMi admissions.",
        intakes:
          "Start dates were not confirmed. Check with HTMi admissions for the next start, and apply early to leave time for your Swiss student visa.",
      }),
      {
        question: "Do HTMi students get a UK degree?",
        answer:
          "One HTMi master's route lists an MSc awarded by Edinburgh Napier University after a dissertation, alongside an HTMi MBA. Other awards are issued by HTMi itself. Confirm which body awards your degree and how it is recognised where you plan to work or study next.",
      },
    ],
  },

  // ── PDF row 343 ────────────────────────────────────────────────────────
  {
    name: "EMUNI University (Euro Mediterranean University)",
    slug: "emuni-euro-mediterranean-university",
    city: "Portorož",
    country: "Slovenia",
    institutionType: "International postgraduate university",
    website: "https://emuni.si",
    founded: 2008,
    upcomingIntake: "Oct 2027",
    programs: ["Intercultural Business Communication", "Euro Mediterranean Studies"],
    summary:
      "An international postgraduate university founded in 2008 with its seat in Portorož, on Slovenia's Adriatic coast, set up under the Union for the Mediterranean. It runs master's level programmes, research and summer schools, often with partner universities such as Urbino in Italy. It has no bachelor's courses.",
    ieltsNote:
      "No entry score was found. Confirm the English level and the accepted tests for your master's programme with EMUNI admissions.",
    tuitionCurrency: "EUR",
    tuitionNote: "No tuition figure was confirmed. EMUNI works with partner universities, so fees differ by programme. Confirm with EMUNI.",
    overview:
      "EMUNI University was established on 9 June 2008 in Portorož, Slovenia, as an international postgraduate institution for the Euro Mediterranean region. It was co-founded by the universities of Haifa, Maribor, Sousse and Urbino Carlo Bo. It offers master's level study, summer schools and research, and many programmes are run together with partner universities.",
    studentLife:
      "Lectures for some programmes are held in Piran, with e-learning and an optional mobility semester at the University of Urbino in Italy. Piran and Portorož are seaside towns on the Adriatic, with a mild climate. Check the EMUNI pages for events and student support.",
    accommodation:
      "Students usually rent rooms or shared flats in Piran, Portorož or nearby towns. A 2018 flyer listed approximate accommodation costs, so ask EMUNI for current figures. Check the EMUNI pages for booking dates, and apply early.",
    library:
      "No library details were confirmed. Some programmes use e-learning alongside classroom lectures. Check the EMUNI pages for facilities and study support.",
    sports:
      "No sports facility details were confirmed. The coast around Piran and Portorož is good for walking, cycling and water sports. Check the EMUNI pages for current clubs and activities.",
    wikipediaTitle: "Euro-Mediterranean University of Slovenia",
    ...seo("EMUNI University", "Portorož, Slovenia"),
    courses: [
      pg("EUR", "Master in Intercultural Business Communication", "Master", "Business", undefined, "Oct 2027", undefined, "A second cycle master's degree with lectures in Piran and e-learning, and an optional semester at the University of Urbino. The details are from a 2018/19 flyer. Confirm that it still runs, the language, length and entry rules. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "EMUNI Seat (Piran and Portorož)",
        city: "Portorož",
        address: "Kidričevo nabrežje 2, 6330 Piran. An older record gives Sončna pot 20, Portorož. Confirm the full address with EMUNI.",
        description: "The seat of the university. A 2018/19 flyer gave the Piran address and an older record the Portorož one, so confirm where classes are held.",
      },
    ],
    documents: SI_DOCUMENTS,
    faqs: [
      ...faqs({
        name: "EMUNI",
        sector: "private",
        place: "Portorož, Slovenia",
        statusAnswer:
          "EMUNI is an international postgraduate university set up in 2008 under the Union for the Mediterranean and registered in Slovenia. Its public or private status was not confirmed, so check with EMUNI.",
        known:
          "EMUNI is known as an international postgraduate university for the Euro Mediterranean region, with master's programmes run with partner universities, summer schools, research and a mobility option in Urbino, Italy.",
        ielts:
          "No entry score was found for this listing. Confirm the English level and the accepted tests for your master's programme with EMUNI admissions before you apply.",
        fees:
          "No tuition figure was confirmed for this listing. Fees differ by programme, and housing and living costs are extra. Confirm the current figures with EMUNI.",
        intakes:
          "Start dates were not confirmed. Slovenian master's programmes usually start in autumn. Check with EMUNI admissions, and apply early to leave time for your student visa.",
      }),
      {
        question: "Can I study a bachelor's degree at EMUNI?",
        answer:
          "No. EMUNI is a postgraduate institution, so it offers master's level and doctoral study rather than bachelor's degrees. You need a recognised bachelor's degree to apply, and the master's programme on offer should be confirmed with EMUNI admissions.",
      },
    ],
  },

  // ── PDF row 344 ────────────────────────────────────────────────────────
  {
    name: "David Tvildiani Medical University",
    slug: "david-tvildiani-medical-university",
    city: "Tbilisi",
    country: "Georgia",
    institutionType: "Private medical university",
    website: "https://dtmu.edu.ge",
    founded: 1989,
    upcomingIntake: "Sep 2027",
    programs: ["Medicine", "Nursing", "Pre Medical Studies"],
    summary:
      "A private medical university in Tbilisi, Georgia, with roots in the AIETI Medical School, founded in 1989. Its English taught six year Medical Doctor (MD) programme is the main offer for international students, alongside nursing and a pre medical programme.",
    ieltsNote:
      "No English score was found. The MD programme is taught in English and has an entrance exam. Confirm the English requirement with DTMU admissions.",
    tuitionCurrency: "USD",
    tuitionNote: "Sources disagree on fees, so none is filed. Confirm the annual MD fee and any deposit with DTMU admissions.",
    overview:
      "David Tvildiani Medical University is a private university in Tbilisi that grew out of the AIETI Medical School, which a portal says was listed in the WHO directory of medical schools in 1995. Its one cycle English taught Medical Doctor programme is worth 360 ECTS and runs for six years. Georgian accreditation for the MD runs to June 2028.",
    studentLife:
      "Tbilisi is Georgia's capital, with about 1.5 million people, a lively food and café scene, and living costs below most of Western Europe. English and Georgian students study in separate streams. Check the DTMU pages for events, clinical placements and student support.",
    accommodation:
      "Students rent rooms or shared flats in Tbilisi, and some listings mention hostels at the campuses. Check the DTMU accommodation pages for current options, costs and booking dates, and apply early.",
    library:
      "No library details were confirmed. The MD programme uses problem based learning with tutors, as noted in a 2021 accreditation review. Check the DTMU pages for facilities and study support.",
    sports:
      "No sports facility details were confirmed. Tbilisi has parks, gyms and hills nearby for hiking. Check the DTMU pages for current clubs and activities.",
    ...seo("David Tvildiani Medical University", "Tbilisi, Georgia"),
    courses: [
      ug("USD", "Medical Doctor (MD)", "MD", "Medicine", "6 Years", "Sep 2027", "September", "A one cycle English taught medical degree of 360 ECTS. Applicants sit an entrance exam, and one portal listed a 1 July deadline. Confirm the entry rules, deadline and recognition for your home country. " + CONFIRM_FEE),
      ug("USD", "Bachelor in Nursing", "Bachelor", "Nursing", undefined, "Sep 2027", "September", "A nursing programme listed by one portal. It was not checked on the DTMU site. Confirm that it is taught in English and open to international students, and the length and entry rules. " + CONFIRM_FEE),
      ug("USD", "Pre Medical Programme", "Pre Medical", "Medicine", undefined, "Sep 2027", "September", "A programme listed by one portal to bridge high school and the MD programme. It was not checked on the DTMU site. Confirm the length, language and whether it leads into the MD. " + CONFIRM_FEE),
    ],
    campuses: [
      {
        name: "Tbilisi Campus",
        city: "Tbilisi",
        address: "Ljubljana St 13 and Chiaureli St 6, and Ak. Tsereteli Ave 121, Tbilisi. Confirm the full address with the university.",
        description: "The main sites in the capital, listed in the accreditation record. A portal says years 3 to 6 are taught in Tbilisi, which was not confirmed. Confirm where each year is taught.",
      },
      {
        name: "Rustavi Campus",
        city: "Rustavi",
        address: "Rustavi, Georgia. Sources give Amjato St 69 and Sanapiro St 69, so confirm the address with the university.",
        description: "A site in Rustavi, near Tbilisi, listed in the accreditation record. A portal says years 1 and 2 are taught here, which was not confirmed. Confirm which years run here.",
      },
    ],
    documents: GE_DOCUMENTS,
    faqs: [
      ...faqs({
        name: "David Tvildiani Medical University",
        sector: "private",
        place: "Tbilisi, Georgia",
        known:
          "DTMU is known for its English taught six year MD programme, its roots in the AIETI Medical School, and a problem based learning curriculum. Check how the degree is recognised before you apply, because licensing rules differ by country.",
        ielts:
          "No English score was found for this listing. The MD programme is taught in English and applicants sit an entrance exam. Confirm the English requirement and the exam format with DTMU admissions.",
        fees:
          "Sources disagree on the annual fee, so none is filed. Housing, insurance and living costs are extra. Confirm the current fee and any deposit with DTMU admissions.",
        intakes:
          "The MD programme starts in September, and one portal listed a 1 July application deadline. Confirm the current dates with DTMU admissions, and apply early to leave time for your student visa.",
      }),
      {
        question: "Will my DTMU medical degree be recognised in my home country?",
        answer:
          "Recognition and licensing rules differ by country, and some medical councils ask foreign graduates to pass extra exams or register first. Check the rules of the council in the country where you plan to practise before you apply.",
      },
    ],
  },
];