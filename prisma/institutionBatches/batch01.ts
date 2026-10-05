// prisma/institutionBatches/batch07.ts
//
// Batch 07: rows 31 to 38 of RGR University List new.pdf (all United Kingdom).
//   31, 32, 33  University of Exeter (UK/Saudi), (Thailand), (India/Nepal/Sri Lanka/Bangladesh)
//               These three PDF rows are regional contract lines for the same university,
//               so they are MERGED into one entry: University of Exeter.
//   34  Falmouth University
//   35  University of Glasgow
//   36  Glasgow Caledonian University
//   37  Global Banking School (a private provider, not a university)
//   38  Glyndwr University Wrexham (now called Wrexham University, plain name used)
//
// That gives 6 institutions from 8 PDF rows, because rows 31 to 33 are one university.
// No countries needed correcting and none of these PDF lines were joined by a parsing error.
//
// This file is self contained. Save it as batch07.ts and run with 07, or paste it
// over the contents of batch01.ts and run with 01. The engine only cares that the
// file exports INSTITUTIONS.
//
// HOW SURE EACH NUMBER IS (confirm the flagged ones before this reaches students):
//   Exeter      : IELTS profiles (6.0, 6.5 or 7.0 by course) and the 3,000 to 10,000 scholarship
//                 ranges are from exeter.ac.uk and the Exeter International Study Centre. UG from
//                 24,900 (business, finance, economics), medicine 48,900 and PG 30,700 to 44,700
//                 come from an agent page quoting Exeter rates. Founded 1955 is the charter
//                 date. Only MSc Finance, MSc Marketing and One Planet MBA are named in sources,
//                 the UG course names are general knowledge. Jan 2027 start is from exeter.ac.uk.
//   Falmouth    : The 19,950 flat UG fee and the 1,955 placement year fee come from one agent
//                 page, so tuitionMax is left untouched and PG fees are not listed. IELTS 6.0
//                 with 5.5 (UG) and 6.5 for some courses is from agent pages. The 2,000 and
//                 5,000 scholarships and the 50 percent pre enrolment payment are from official
//                 pages quoted by agents. Founded 2012 is the university title date. The Penryn
//                 address is from a study portal.
//   Glasgow     : UG 27,720 (arts and social sciences) is from gla.ac.uk, 33,210 (science and
//                 engineering) is from an agent page, and the two PG course fees are from IDP.
//                 IELTS 6.5 as the common profile and 7.0 for law, medicine and some PG courses
//                 are from agent pages. Founded 1451 is from reference pages. The UG course
//                 names are general knowledge.
//   Glasgow Cal : 15,200 to 21,900 comes from ApplyBoard, while another agent page shows lower UG
//                 fees from 14,500, so confirm. The 2,500 UG automatic discount is from
//                 ApplyBoard. IELTS 6.0 (7.0 for some courses) is from agent pages. Founded 1993
//                 is the university title date. Course names are from agent pages and general
//                 knowledge.
//   GBS         : Not a university. It offers courses validated by partner universities. No
//                 international fees were found (home fees are 5,760 for a foundation year and
//                 9,535 a year), so tuition fields are left untouched, and IELTS is left out
//                 because it is set per course. Campus names, the 2016 start, October, February
//                 and June intakes and course names are from GBS, Bath Spa and Wikipedia pages.
//                 The FAQs are written by hand because it is not a university.
//   Wrexham     : UG 11,750, MA and MSc 12,500 and MBA 13,000 for 2026/27 come from an agent
//                 page quoting Wrexham fees. IELTS 6.0 is from an agent page, another shows
//                 6.5. Founded 2008 is the university title date, roots go back to 1887. The
//                 Northop and St Asaph sites are from one agent page. The PDF still says Glyndwr,
//                 the university is now called Wrexham University. January starts are assumed.
//   Left out on purpose: acceptance rate, ranking and social links (none were seen on
//   official sites). Campus addresses are only given where a page showed them.
//
// Run:  npm run seed:institutions -- 07 --dry
//       npm run seed:institutions -- 07

import type { CourseInput, DocumentRow, FaqInput, InstitutionInput } from "./types";

// ── Shared UK helpers ────────────────────────────────────────────────────

// General UK student visa application pack. Confirm anything specific with the
// admissions team of each university.
const UK_DOCUMENTS: Record<string, DocumentRow[]> = {
  Undergraduate: [
    ["Identity", "Passport"],
    ["Academic", "Academic transcripts and certificates"],
    ["Academic", "Personal statement"],
    ["Academic", "Reference letter"],
    ["Academic", "English language test result"],
    ["Financial", "Bank statement"],
    ["Visa", "Tuberculosis test certificate (if required for your country)"],
  ],
  Postgraduate: [
    ["Identity", "Passport"],
    ["Academic", "Degree certificate and transcripts"],
    ["Academic", "Personal statement"],
    ["Academic", "CV"],
    ["Academic", "Reference letter"],
    ["Academic", "English language test result"],
    ["Financial", "Bank statement"],
    ["Visa", "Tuberculosis test certificate (if required for your country)"],
  ],
};

function ukFaqs(o: {
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
      answer: `It is a ${o.sector} university in ${o.place}.`,
    },
    { question: `What is ${o.name} known for?`, answer: o.known },
    { question: `What IELTS score do I need for ${o.name}?`, answer: o.ielts },
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
  subject: string,
  duration: string | undefined,
  nextIntake: string | undefined,
  intakes: string | undefined,
  tuitionAmount?: number
): CourseInput {
  return {
    name,
    level: "Undergraduate",
    degree: name.startsWith("BEng") ? "BEng" : name.startsWith("BA") ? "BA" : name.startsWith("LLB") ? "LLB" : "BSc",
    subject,
    duration,
    nextIntake,
    intakes,
    tuitionAmount,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
  };
}

function pg(
  name: string,
  subject: string,
  degree: string,
  duration: string | undefined,
  nextIntake: string | undefined,
  intakes: string | undefined,
  tuitionAmount?: number
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
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
  };
}

const SEP_JAN = "September, with January starts on some courses";

export const INSTITUTIONS: InstitutionInput[] = [
  // ── PDF rows 31, 32 and 33 (merged) ────────────────────────────────────
  {
    name: "University of Exeter",
    city: "Exeter",
    country: "United Kingdom",
    institutionType: "Public research university",
    website: "https://www.exeter.ac.uk",
    founded: 1955,
    upcomingIntake: "Jan 2027",
    programs: ["Business", "Medicine", "Environmental Sciences"],
    summary:
      "A public Russell Group research university in Devon and Cornwall, with campuses in Exeter and Penryn, teaching business, medicine, humanities, science and engineering to students from over 150 countries.",
    ieltsOverall: 6.0,
    ieltsMinBand: 5.5,
    ieltsNote: "Set by course: IELTS 6.0, 6.5 or 7.0 overall, with sub scores from 5.5 to 6.5. Check your course page for the exact profile.",
    tuitionMin: 24900,
    tuitionMax: 44700,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "UG from £24,900 and PG £30,700 to £44,700 from an agent page quoting Exeter rates. Medicine is £48,900. Confirm on exeter.ac.uk.",
    overview:
      "The University of Exeter is a Russell Group research university with campuses in Exeter, in Devon, and at Penryn, in Cornwall. It has around 30,000 students from more than 150 countries, and teaches business, medicine, humanities, social sciences, science and engineering, with an international study centre for pathway courses.",
    studentLife:
      "Students live in or near Exeter, a historic cathedral city, or in Cornwall at the Penryn campus, close to beaches and the coast. The students' guild runs clubs and societies, and the international team supports new students with visas and settling in.",
    accommodation:
      "Exeter offers halls of residence at its campuses, and many students also rent privately in the city. Check the accommodation pages for current prices, guarantee conditions and booking dates.",
    library:
      "Libraries across the campuses offer study spaces, computers and a large online collection of journals and ebooks. Check the library pages for the building closest to your course.",
    sports:
      "Students can use the university sport facilities and join clubs through the students' guild. Check the sport pages for current memberships.",
    wikipediaTitle: "University of Exeter",
    ...seo("University of Exeter", "Exeter and Penryn"),
    courses: [
      ug("BSc Economics", "Economics", "3 Years", "Sep 2027", "September", 24900),
      ug("LLB Law", "Law", "3 Years", "Sep 2027", "September"),
      ug("BSc Computer Science", "Computer Science", "3 Years", "Sep 2027", "September"),
      pg("MSc Finance", "Finance", "MSc", "1 Year", "Jan 2027", SEP_JAN, 30700),
      pg("MSc Marketing", "Marketing", "MSc", "1 Year", "Jan 2027", SEP_JAN, 30700),
      pg("One Planet MBA", "Business", "MBA", "1 Year", "Sep 2027", "September", 44700),
    ],
    campuses: [
      {
        name: "Streatham Campus",
        city: "Exeter",
        description: "The main campus in Exeter, set in landscaped grounds close to the city centre, where most schools are based.",
      },
      {
        name: "St Luke's Campus",
        city: "Exeter",
        description: "A campus in Exeter, home to sport, health and medical courses.",
      },
      {
        name: "Penryn Campus",
        city: "Penryn",
        description: "The Cornwall campus near Falmouth, home to environment, sustainability and creative courses close to the coast.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "the University of Exeter",
      sector: "public",
      place: "Exeter and Penryn, England",
      known:
        "Exeter is known as a Russell Group research university with strong courses in business, medicine, humanities, science and environmental subjects, on campuses in Devon and Cornwall.",
      ielts:
        "Requirements are set by course. Most ask for IELTS 6.0 or 6.5 overall, and some ask for 7.0, with sub scores from 5.5 to 6.5. Check your course page for the exact profile.",
      fees:
        "Agent pages quoting Exeter's 2026/27 rates show undergraduate fees from £24,900 and postgraduate fees from £30,700 to £44,700, with medicine at £48,900. Merit scholarships of £3,000 to £10,000 may apply, so confirm with Exeter.",
      intakes:
        "Undergraduate courses start in September. Many postgraduate taught courses start in September, and some master's courses start in January. Check your course page for exact dates.",
    }),
  },

  // ── PDF row 34 ─────────────────────────────────────────────────────────
  {
    name: "Falmouth University",
    city: "Falmouth",
    country: "United Kingdom",
    institutionType: "Public university",
    website: "https://www.falmouth.ac.uk",
    founded: 2012,
    upcomingIntake: "Sep 2027",
    programs: ["Art and Design", "Media", "Business"],
    summary:
      "A small specialist creative university in Cornwall, teaching from Falmouth and Penryn, known for art, design, media, performance and business courses, including Cornwall Business School.",
    ieltsOverall: 6.0,
    ieltsMinBand: 5.5,
    ieltsNote: "Undergraduate courses ask for IELTS 6.0 with no band below 5.5, and some courses ask for 6.5. Check your course page.",
    tuitionMin: 19950,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "UG £19,950 flat fee on most on campus courses, from an agent page. PG fees were not confirmed. Check falmouth.ac.uk for 2026/27.",
    overview:
      "Falmouth University is a specialist creative university in Cornwall, with campuses in Falmouth and Penryn and more than 120 years of creative teaching. It teaches art, design, film, media, performance and games, and Cornwall Business School runs master's courses in international business, entrepreneurship and digital marketing.",
    studentLife:
      "Students live in a coastal Cornish town with beaches, harbours and a strong creative community, and it is a long train ride from London. The students' union runs clubs and societies, and the international team supports new students.",
    accommodation:
      "Falmouth offers halls of residence close to its campuses, and many students also rent privately around Falmouth and Penryn. Check the accommodation pages for current prices and booking dates.",
    library:
      "Libraries on the campuses offer study spaces, computers, studios and online collections of journals and ebooks. Check the library pages for opening hours and services.",
    sports:
      "Students can join sport and outdoor clubs through the students' union, and the coast offers surfing, sailing and walking. Check the university pages for current facilities.",
    wikipediaTitle: "Falmouth University",
    ...seo("Falmouth University", "Falmouth and Penryn, Cornwall"),
    courses: [
      ug("BA (Hons) Drawing", "Art and Design", "3 Years", "Sep 2027", "September", 19950),
      ug("BA (Hons) Photography", "Art and Design", "3 Years", "Sep 2027", "September", 19950),
      ug("BA (Hons) Fine Art", "Art and Design", "3 Years", "Sep 2027", "September", 19950),
      pg("MSc International Business Management", "Business", "MSc", "1 Year", "Sep 2027", "September"),
      pg("MSc Entrepreneurship and Innovation Management", "Business", "MSc", "1 Year", "Sep 2027", "September"),
      pg("MSc Digital Marketing", "Marketing", "MSc", "1 Year", "Sep 2027", "September"),
    ],
    campuses: [
      {
        name: "Penryn Campus",
        city: "Penryn",
        address: "Treliever Road, Penryn TR10 9FE",
        description: "A campus in Penryn, near Falmouth, where Cornwall Business School and many creative and technology courses are taught.",
      },
      {
        name: "Falmouth Campus",
        city: "Falmouth",
        description: "A campus in the seaside town of Falmouth, home to art, design and media studios.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "Falmouth University",
      sector: "public",
      place: "Falmouth and Penryn, Cornwall, England",
      known:
        "Falmouth is known as a specialist creative university, with strong courses in art, design, media, film, performance and games, and a business school offering master's degrees.",
      ielts:
        "Undergraduate courses ask for IELTS 6.0 overall with no band below 5.5, and some courses ask for 6.5. Check your course page for the exact score.",
      fees:
        "An agent page lists a flat 2026/27 international undergraduate fee of £19,950 for most on campus courses. At least half of the first year fees must be paid before enrolment. Talent scholarships of £2,000 to £5,000 may apply, so confirm with Falmouth.",
      intakes:
        "Undergraduate courses start in September. Taught master's courses at Cornwall Business School also start in September, so check your course page for exact dates.",
    }),
  },

  // ── PDF row 35 ─────────────────────────────────────────────────────────
  {
    name: "University of Glasgow",
    city: "Glasgow",
    country: "United Kingdom",
    institutionType: "Public research university",
    website: "https://www.gla.ac.uk",
    founded: 1451,
    upcomingIntake: "Sep 2027",
    programs: ["Medicine", "Law", "Engineering"],
    summary:
      "A public Russell Group research university in Glasgow, Scotland, founded in 1451 and one of the oldest in the English speaking world, known for medicine, law, social sciences, science and engineering.",
    ieltsOverall: 6.5,
    ieltsNote: "Most courses ask for IELTS 6.5. Law, medicine and some postgraduate courses ask for 7.0. Check your course page.",
    tuitionMin: 27720,
    tuitionMax: 33210,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "UG £27,720 (arts and social sciences, gla.ac.uk) and £33,210 (sciences and engineering, agent page). Medicine costs more.",
    overview:
      "The University of Glasgow is a Russell Group research university founded in 1451, with its main campus at Gilmorehill in Glasgow's West End. It teaches medicine, law, social sciences, arts, science and engineering, and most Scottish undergraduate degrees take four years.",
    studentLife:
      "Glasgow is a lively, affordable Scottish city with a strong music, arts and food scene, and the main campus sits in the West End beside parks and museums. The students' union runs clubs and societies, and the international team supports new students.",
    accommodation:
      "The university offers halls of residence, and many students also rent privately in the West End and nearby areas. Check the accommodation pages for current prices and booking dates.",
    library:
      "The main library offers study spaces, computers and a large online collection of journals and ebooks. Check the library pages for opening hours and services.",
    sports:
      "Students can use the university sport and fitness facilities and join clubs through the students' union. Check the sport pages for current memberships.",
    wikipediaTitle: "University of Glasgow",
    ...seo("University of Glasgow", "Glasgow, Scotland"),
    courses: [
      ug("LLB Law", "Law", "4 Years", "Sep 2027", "September", 27720),
      ug("BSc Computing Science", "Computer Science", "4 Years", "Sep 2027", "September", 33210),
      ug("BEng Mechanical Engineering", "Engineering", "4 Years", "Sep 2027", "September", 33210),
      pg("MSc Research in Physics and Astronomy", "Physics", "MSc", "1 Year", "Sep 2027", "September", 33210),
      pg("MLitt Research in Philosophy", "Philosophy", "MLitt", "2 Years", "Sep 2027", "September", 27720),
    ],
    campuses: [
      {
        name: "Gilmorehill",
        city: "Glasgow",
        description: "The main campus in Glasgow's West End, centred on the historic Gothic main building, where most schools are based.",
      },
      {
        name: "Garscube",
        city: "Glasgow",
        description: "A campus on the north west edge of Glasgow, home to the School of Veterinary Medicine.",
      },
      {
        name: "Dumfries",
        city: "Dumfries",
        description: "A campus in Dumfries in south west Scotland, offering selected degrees outside Glasgow.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "the University of Glasgow",
      sector: "public",
      place: "Glasgow, Scotland",
      known:
        "Glasgow is known as a Russell Group research university founded in 1451, with strong courses in medicine, law, social sciences, science and engineering.",
      ielts:
        "Most undergraduate and master's courses ask for IELTS 6.5 overall. Law, medicine and some postgraduate courses ask for 7.0, so check your course page for the exact profile.",
      fees:
        "For 2026/27, international undergraduate fees are £27,720 for arts and social sciences and £33,210 for science and engineering. Medicine costs much more, and postgraduate fees vary by course, so confirm with Glasgow.",
      intakes:
        "Undergraduate courses start in September and most Scottish degrees take four years. Postgraduate taught courses also start mainly in September, so check your course page.",
    }),
  },

  // ── PDF row 36 ─────────────────────────────────────────────────────────
  {
    name: "Glasgow Caledonian University",
    city: "Glasgow",
    country: "United Kingdom",
    institutionType: "Public university",
    website: "https://www.gcu.ac.uk",
    founded: 1993,
    upcomingIntake: "Jan 2027",
    programs: ["Health", "Business", "Engineering"],
    summary:
      "A public university in Glasgow, Scotland, with a city centre campus in Cowcaddens and a London campus, known for health, nursing, business, engineering and the built environment, with placement year options.",
    ieltsOverall: 6.0,
    ieltsNote: "Many courses ask for IELTS 6.0, while others, such as nursing, ask for 7.0. Check your course page for the exact score.",
    tuitionMin: 15200,
    tuitionMax: 21900,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "£15,200 to £21,900 from an agent page. Another agent page shows UG from £14,500. A £2,500 UG discount may apply. Confirm on gcu.ac.uk.",
    overview:
      "Glasgow Caledonian University is a public university with its main campus in Cowcaddens, near Glasgow city centre, and a campus in London. It offers more than 150 courses in health, nursing, business, engineering and the built environment, and many courses include a placement year.",
    studentLife:
      "Students study in the middle of Glasgow, a friendly and affordable Scottish city with a strong music and arts scene. The students' association runs clubs and societies, and the international team supports new students.",
    accommodation:
      "The university offers halls of residence close to the city centre campus, and many students also rent privately in Glasgow. Check the accommodation pages for current prices and booking dates.",
    library:
      "The campus library offers study spaces, computers and a large online collection of journals and ebooks. Check the library pages for opening hours and services.",
    sports:
      "Students can use the university sport and fitness facilities and join clubs through the students' association. Check the sport pages for current memberships.",
    wikipediaTitle: "Glasgow Caledonian University",
    ...seo("Glasgow Caledonian University", "Glasgow, Scotland"),
    courses: [
      ug("BSc (Hons) Computer Science", "Computer Science", "4 Years", "Sep 2027", "September"),
      ug("BEng (Hons) Mechanical Engineering", "Engineering", "4 Years", "Sep 2027", "September"),
      pg("MSc International Management and Business Development", "Business", "MSc", "1 Year", "Jan 2027", "September and January, with some May starts"),
    ],
    campuses: [
      {
        name: "Glasgow Campus",
        city: "Glasgow",
        address: "Cowcaddens Road, Glasgow",
        description: "The main campus in Cowcaddens, a short walk from Glasgow city centre, with teaching buildings, library and student services.",
      },
      {
        name: "London Campus",
        city: "London",
        description: "A London campus offering selected postgraduate courses for international students.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "Glasgow Caledonian University",
      sector: "public",
      place: "Glasgow, Scotland, with a campus in London",
      known:
        "GCU is known for health, nursing, business, engineering and the built environment, with placement year options and a city centre campus in Glasgow.",
      ielts:
        "Many courses ask for IELTS 6.0 overall, while nursing and some other courses ask for 7.0. Check your course page for the exact score.",
      fees:
        "An agent page lists 2026/27 international fees of about £15,200 to £21,900 a year depending on the course. A £2,500 a year discount may apply to self funded undergraduates. Confirm the exact fee with GCU.",
      intakes:
        "Many courses start in September or January, and some start in May. Most Scottish undergraduate degrees take four years. Check your course page for exact dates.",
    }),
  },

  // ── PDF row 37 ─────────────────────────────────────────────────────────
  {
    name: "Global Banking School",
    city: "London",
    country: "United Kingdom",
    institutionType: "Private higher education provider",
    website: "https://globalbanking.ac.uk",
    founded: 2016,
    upcomingIntake: "Feb 2027",
    programs: ["Business", "Banking and Finance", "Computing"],
    summary:
      "A private higher education provider with campuses in London, Birmingham, Leeds and Manchester, teaching business, banking, finance, computing and health courses validated by partner universities.",
    ieltsNote: "English requirements are set course by course and depend on the awarding university. Check the course page for the exact score.",
    tuitionNote: "International fees were not confirmed. Check globalbanking.ac.uk for the fee for your course and campus.",
    overview:
      "Global Banking School is a private higher education provider that opened its first campus in East London in 2016 and now has ten campuses across London, Birmingham, Leeds and Manchester. Its business, banking, finance, computing and health courses are validated and awarded by partner universities, and it has students from over 85 nationalities.",
    studentLife:
      "Students study in busy city centre campuses in four of the UK's biggest cities, with flexible weekday, evening and weekend timetables. GBS gives one to one academic, personal and career guidance from application to graduation.",
    accommodation:
      "GBS does not run its own halls of residence. Students usually rent private or shared housing near their campus, so check with GBS for advice before you book anywhere.",
    library:
      "Each campus offers study spaces, computers and access to online learning resources. Ask your campus about opening hours and services.",
    sports:
      "Sport is not a main feature of the city centre campuses, so students normally use local gyms, clubs and parks. Ask GBS about student activities.",
    wikipediaTitle: "Global Banking School",
    skipImageLookup: true,
    ...seo("Global Banking School", "London, Birmingham, Leeds and Manchester"),
    courses: [
      ug("BA (Hons) Global Business (Business Management) with Foundation Year", "Business", "4 Years", "Feb 2027", "October, February and June"),
      ug("BSc (Hons) Computing with Integrated Foundation Year", "Computer Science", "4 Years", "Feb 2027", "October, February and June"),
      ug("BSc (Hons) Project Management with Integrated Foundation Year", "Business", "4 Years", "Feb 2027", "October, February and June"),
      pg("MSc Global Business", "Business", "MSc", undefined, "Feb 2027", "October, February and June"),
      pg("MSc Project Management", "Business", "MSc", undefined, "Feb 2027", "October, February and June"),
    ],
    campuses: [
      { name: "London Greenford", city: "London", description: "A GBS campus in Greenford, West London." },
      { name: "London Canary Wharf", city: "London", description: "The Republic campus in Canary Wharf, East London." },
      { name: "London Stratford", city: "London", description: "Campuses at GEDU House and Cam Road in Stratford, East London." },
      { name: "London Bow Road", city: "London", description: "The original GBS campus on Bow Road in East London, opened in 2016." },
      { name: "Birmingham Brindleyplace", city: "Birmingham", description: "A city centre campus at Brindleyplace in Birmingham." },
      { name: "Birmingham Norfolk House", city: "Birmingham", description: "A city centre campus at Norfolk House in Birmingham." },
      { name: "Manchester Universal Square", city: "Manchester", description: "A campus at Universal Square in Manchester." },
      { name: "Leeds Wellington Place", city: "Leeds", description: "A city centre campus at Wellington Place in Leeds." },
    ],
    documents: UK_DOCUMENTS,
    faqs: [
      {
        question: "Is Global Banking School a university?",
        answer: "No. It is a private higher education provider in London, and its degrees are validated and awarded by partner universities such as Bath Spa, Suffolk and Leeds Trinity.",
      },
      {
        question: "What is Global Banking School known for?",
        answer: "GBS is known for business, banking, finance, accounting, computing and health courses, taught in city centre campuses with flexible timetables.",
      },
      {
        question: "What IELTS score do I need for Global Banking School?",
        answer: "English requirements are set for each course and depend on the awarding university, so check the course page for the exact IELTS score.",
      },
      {
        question: "How much are tuition fees for international students at Global Banking School?",
        answer: "Fees depend on the course and campus. Please confirm the current international fee for your course with GBS before you apply.",
      },
      {
        question: "When can I start at Global Banking School?",
        answer: "Courses start in October, February and June. Confirm the start dates for your course and campus before applying.",
      },
    ],
  },

  // ── PDF row 38 ─────────────────────────────────────────────────────────
  {
    name: "Wrexham University",
    city: "Wrexham",
    country: "United Kingdom",
    institutionType: "Public university",
    website: "https://www.wrexham.ac.uk",
    founded: 2008,
    upcomingIntake: "Sep 2027",
    programs: ["Business", "Computing", "Health"],
    summary:
      "A public university in Wrexham, North Wales, formerly Glyndŵr University, known for health, computing, engineering, business and creative courses, and for lower international tuition fees.",
    ieltsOverall: 6.0,
    ieltsNote: "Standard IELTS 6.0 for most courses. Some courses ask for more. Check your course page for the exact score.",
    tuitionMin: 11750,
    tuitionMax: 13000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "UG £11,750, MA and MSc £12,500, MBA £13,000, from an agent page quoting Wrexham fees. Confirm on wrexham.ac.uk.",
    overview:
      "Wrexham University, formerly Glyndŵr University, is a public university in North Wales close to the English border, with roots from the Wrexham School of Science and Art in 1887. It teaches health, computing, engineering, business and creative subjects, and keeps its international undergraduate fees the same through the degree.",
    studentLife:
      "Wrexham is a market town in North Wales that is smaller and cheaper than the big UK cities, and it has become well known through Wrexham AFC. The students' union runs clubs and societies, and the international team supports new students.",
    accommodation:
      "The university offers halls of residence in Wrexham, and many students also rent privately in the town. Check the accommodation pages for current prices and booking dates.",
    library:
      "The campus library offers study spaces, computers and a large online collection of journals and ebooks. Check the library pages for opening hours and services.",
    sports:
      "Students can use the university sport facilities and join clubs through the students' union. Check the sport pages for current memberships.",
    wikipediaTitle: "Wrexham University",
    ...seo("Wrexham University", "Wrexham, North Wales"),
    courses: [
      ug("BA (Hons) International Business", "Business", "3 Years", "Sep 2027", SEP_JAN, 11750),
      ug("BSc (Hons) Computer Science", "Computer Science", "3 Years", "Sep 2027", SEP_JAN, 11750),
      pg("MBA", "Business", "MBA", "1 Year", "Sep 2027", SEP_JAN, 13000),
    ],
    campuses: [
      {
        name: "Plas Coch",
        city: "Wrexham",
        description: "The main campus in Wrexham, with teaching buildings, library and student services.",
      },
      {
        name: "Regent Street",
        city: "Wrexham",
        description: "A second campus site in Wrexham town.",
      },
      {
        name: "Northop",
        city: "Northop",
        description: "A campus in Northop, Flintshire, in North East Wales.",
      },
      {
        name: "St Asaph",
        city: "St Asaph",
        description: "A campus in St Asaph, Denbighshire, in North Wales.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "Wrexham University",
      sector: "public",
      place: "Wrexham, North Wales",
      known:
        "Wrexham is known for health, computing, engineering, business and creative courses, and for some of the lower international tuition fees among UK universities.",
      ielts:
        "Most courses ask for IELTS 6.0 overall, though one agent page shows 6.5. Some courses ask for more, so check your course page for the exact score.",
      fees:
        "For 2026/27, an agent page lists international fees of £11,750 for undergraduate courses, £12,500 for MA and MSc courses and £13,000 for the MBA. Confirm the exact fee with Wrexham before you apply.",
      intakes:
        "Many courses start in September, and some start in January. Check your course page for exact dates and deadlines.",
    }),
  },
];