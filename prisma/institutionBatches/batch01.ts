// prisma/institutionBatches/batch08.ts
//
// Batch 08: rows 39 to 43 of RGR University List new.pdf (all United Kingdom).
//   39  University of Greenwich
//   40  Heriot-Watt University
//   41  University of Hertfordshire
//   42  University of Huddersfield
//   43  University of Hull
//
// That gives 5 institutions from 5 PDF rows. Nothing needed merging, no countries needed
// correcting, and none of these PDF lines were joined by a parsing error.
// Batch 07 ended at row 38, so this batch carries on from row 39.
//
// This file is self contained. Save it as batch08.ts and run with 08. The engine only
// cares that the file exports INSTITUTIONS.
//
// HOW SURE EACH NUMBER IS (confirm the flagged ones before this reaches students):
//   Greenwich   : Official gre.ac.uk: the IELTS 6.5 (5.5 each skill) for BA English Language
//                 and ELT, the 8.0 (7.5 each skill) for Speech and Language Therapy, the three
//                 campuses, the 2,400 rooms and the Stockwell Street building (the campus page
//                 is an older one, so recheck). The Greenwich and Kent group (LASEUG, from 1
//                 August 2026) is from gre.ac.uk, kent.ac.uk and the Office for Students.
//                 Agent sites only (Collegedunia, quoting gre.ac.uk): UG 17,975, PG 18,700,
//                 MSc International Business 19,450, MBA 20,800, January 2027 starts. General
//                 IELTS 6.0 UG and 6.5 PG is from an aggregator. Founded is LEFT OUT because
//                 sources give 1992 and 1993 and the roots go back to 1890. The Park Row
//                 address is from a third party page. BSc Computer Science is general knowledge.
//   Heriot-Watt : Official hw.ac.uk: founded 1821, the campuses, 380 acres, the guaranteed
//                 accommodation line, UG IELTS 6.0 (actuarial science and languages 6.5,
//                 translation 7.0) from the Scotland English requirements PDF. Agent sites
//                 only: UG 18,432 to 26,296 and PG 24,952 to 26,296 (Collegedunia), January
//                 2027 starts for two MSc courses. Another agent page shows much higher UG fees
//                 and an older page shows 18,704 to 24,048, so the range is flagged. MSc
//                 Interpreting 7.0 and MSc Analytical Science 6.5 are from IDP. MBA fee not
//                 listed. UG course durations were not confirmed so they are left out.
//   Hertfordshire: UG 17,450, PG 17,950 to 22,450, MSc International Business 17,950 and the
//                 up to 4,000 scholarship are from Collegedunia quoting herts.ac.uk (the herts
//                 fees page returned an error). IELTS 6.0 UG and 6.5 PG with 5.5 each band is
//                 from an aggregator, and a herts.ac.uk course page confirms 6.0 with 5.5.
//                 Campuses, shuttle, first year room guarantee and the 22 minute train time
//                 are from herts.ac.uk pages. Founded 1992 is the university title date from an
//                 aggregator (the roots go back to 1952). Student numbers and the 90 countries
//                 are from an aggregator. UG course names are general knowledge.
//   Huddersfield: All tuition fees are from hud.ac.uk (international fees page, 2026/27) and
//                 london.hud.ac.uk. The September 2026, January 2027 and May 2027 intakes are
//                 from hud.ac.uk. IELTS 6.0 with 5.5 in each element is from IDP course pages
//                 (agent), because the official page does not show the numbers in text.
//                 Founded is LEFT OUT because no reliable year was found. Student Central,
//                 the library and HudLets are from hud.ac.uk student pages (older pages).
//   Hull        : Official hull.ac.uk: founded 1927 is from Wikipedia (the university site
//                 says almost a century), campus, library, 2,300 rooms, TEF Gold, the January
//                 2027 enrolment and the 2,000 UG fee waivers. IELTS 6.0 with 5.5 each skill
//                 is from UCAS pages for hull.ac.uk courses. The only fee found, 18,945 for BA
//                 Music, is from an aggregator, so tuitionMax is left out. PG waivers differ
//                 between sources (4,500 and 5,000) so no figure is given in the file.
//   Left out on purpose: acceptance rate and ranking (no university published them), social
//   links for all except Hull (only Hull's own footer was seen), and anything unconfirmed.
//
// Run:  npm run seed:institutions -- 08 --dry
//       npm run seed:institutions -- 08

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
  degree: string,
  subject: string,
  duration: string | undefined,
  nextIntake: string | undefined,
  intakes: string | undefined,
  tuitionAmount?: number,
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
    tuitionAmount,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
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
    tuitionAmount,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    description,
  };
}

const SEP_JAN = "September, with January starts on some courses";

export const INSTITUTIONS: InstitutionInput[] = [
  // ── PDF row 39 ─────────────────────────────────────────────────────────
  {
    name: "University of Greenwich",
    city: "Greenwich",
    country: "United Kingdom",
    institutionType: "Public university",
    website: "https://www.gre.ac.uk",
    upcomingIntake: "Jan 2027",
    programs: ["Business", "Computing", "Health"],
    summary:
      "A public university in south east London and Kent, with campuses at Greenwich, Avery Hill and Medway. It teaches business, computing, health, education, engineering and creative subjects, and is now part of the London and South East University Group with the University of Kent.",
    ieltsOverall: 6.0,
    ieltsNote: "Most UG courses ask for IELTS 6.0 and PG 6.5, per an agent site. BA English Language and ELT needs 6.5. Check your course page.",
    tuitionMin: 17975,
    tuitionMax: 20800,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "UG £17,975, PG £18,700, MSc International Business £19,450, MBA £20,800, per an agent site quoting Greenwich. Confirm on gre.ac.uk.",
    overview:
      "The University of Greenwich has three campuses: the Old Royal Naval College in Greenwich, Avery Hill in Eltham and Medway in Kent. It teaches architecture, business, computing, health, education, engineering and more. From August 2026 it forms part of the London and South East University Group alongside the University of Kent.",
    studentLife:
      "Students can choose a historic riverside setting in Greenwich, a parkland campus at Avery Hill or a campus at Medway in Kent. Free buses link Avery Hill and Greenwich, and central London is a short train ride from Avery Hill. The students' union runs clubs and societies.",
    accommodation:
      "The university has said it offers around 2,400 rooms on or near its campuses, with the Student Village at Avery Hill home to many students. Check the accommodation pages for current prices, guarantee conditions and booking dates.",
    library:
      "The Stockwell Street building at Greenwich houses a library alongside film and television studios, and libraries also serve the other campuses. Check the library pages for opening hours and services.",
    sports:
      "Avery Hill has the main sports facilities, including a sports hall, outdoor pitches and a gym, and there is also a gym at Medway. Students can join exercise classes such as yoga and Zumba. Check the sport pages for current offers.",
    wikipediaTitle: "University of Greenwich",
    ...seo("University of Greenwich", "London and Kent"),
    courses: [
      ug("BA English Language and English Language Teaching", "BA", "English", undefined, "Sep 2027", "September and January", 17975),
      ug("BSc Computer Science", "BSc", "Computer Science", undefined, "Sep 2027", "September and January", 17975),
      ug("BSc Speech and Language Therapy", "BSc", "Health", undefined, "Sep 2027", "September", undefined, "A health course with a much higher English requirement, IELTS 8.0 overall with 7.5 in each skill. Check the fee with Greenwich."),
      pg("MSc International Business", "MSc", "Business", "1 Year", "Jan 2027", "September and January", 19450),
      pg("MBA", "MBA", "Business", undefined, "Jan 2027", "September and January", 20800),
    ],
    campuses: [
      {
        name: "Greenwich Campus",
        city: "Greenwich",
        address: "Old Royal Naval College, Park Row, London SE10 9LS",
        description: "The largest campus, in the historic Old Royal Naval College, a World Heritage Site beside the River Thames.",
      },
      {
        name: "Avery Hill Campus",
        city: "Eltham",
        description: "A purpose built campus beside Avery Hill Park, with sports facilities and the student village. A free bus links it to Greenwich.",
      },
      {
        name: "Medway Campus",
        city: "Chatham Maritime",
        description: "A campus in Chatham Maritime, Kent, with teaching and living spaces within a short walk of each other.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "the University of Greenwich",
      sector: "public",
      place: "south east London and Kent, England",
      known:
        "Greenwich is known for business, computing, architecture, health and education courses, three campuses in London and Kent, and a historic riverside campus in a World Heritage Site.",
      ielts:
        "An agent site shows IELTS 6.0 for most undergraduate courses and 6.5 for postgraduate courses. BA English Language and ELT needs 6.5, and Speech and Language Therapy needs 8.0, so check your course.",
      fees:
        "An agent site quoting Greenwich lists 2026/27 fees of £17,975 for undergraduate courses, £18,700 for most postgraduate courses, £19,450 for MSc International Business and £20,800 for the MBA. Confirm with Greenwich.",
      intakes:
        "Courses start in September and January. Check your course page for exact dates and deadlines.",
    }),
  },

  // ── PDF row 40 ─────────────────────────────────────────────────────────
  {
    name: "Heriot-Watt University",
    city: "Edinburgh",
    country: "United Kingdom",
    institutionType: "Public research university",
    website: "https://www.hw.ac.uk",
    founded: 1821,
    upcomingIntake: "Jan 2027",
    programs: ["Engineering", "Business", "Computer Science"],
    summary:
      "A public research university in Edinburgh, Scotland, with its main campus at Riccarton and further campuses in the Scottish Borders and Orkney. It is known for engineering, business, computing, science and design, and it also has campuses in Dubai and Malaysia.",
    ieltsOverall: 6.0,
    ieltsNote: "UG courses usually need IELTS 6.0, while actuarial science and languages need 6.5 or more. PG needs vary by course. Check your course page.",
    tuitionMin: 18432,
    tuitionMax: 26296,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "UG £18,432 to £26,296 and PG £24,952 to £26,296 from an agent site, but other agent sites differ. The MBA costs more. Confirm on hw.ac.uk.",
    overview:
      "Heriot-Watt University is a public research university in Edinburgh with roots in 1821. Its main campus sits in 380 acres of parkland at Riccarton, and it also has campuses in the Scottish Borders and Orkney, and in Dubai and Malaysia. It teaches engineering, business, computing, science, design and languages.",
    studentLife:
      "The Edinburgh campus is a green parkland site on the edge of the city, with the Scottish capital close by for culture and events. Students can also study at the Scottish Borders campus, which focuses on textiles and design, and the Go Global option lets students spend time at the Dubai or Malaysia campuses.",
    accommodation:
      "Heriot-Watt says all new entrants are guaranteed a place in university managed accommodation, with options at the Edinburgh and Borders campuses. Check the accommodation pages for current prices, conditions and booking dates.",
    library:
      "The Edinburgh campus library offers study spaces, computers and a large online collection of journals and ebooks. Check the library pages for opening hours and services.",
    sports:
      "Students can use the campus sport and fitness facilities and join clubs through the students' union. Check the sport pages for current memberships.",
    wikipediaTitle: "Heriot-Watt University",
    ...seo("Heriot-Watt University", "Edinburgh, Scotland"),
    courses: [
      ug("MA (Hons) International Business Management", "MA", "Business", undefined, "Sep 2027", "September", 18432),
      ug("BSc (Hons) Computer Science", "BSc", "Computer Science", undefined, "Sep 2027", "September"),
      pg("MSc International Business Management", "MSc", "Business", "1 Year", "Jan 2027", SEP_JAN, 24952),
      pg("MSc Data Science", "MSc", "Data Science", "1 Year", "Jan 2027", SEP_JAN, 25720),
      pg("MSc Interpreting", "MSc", "Languages", "1 Year", "Sep 2027", "September", undefined, "Needs IELTS 7.0 overall with at least 6.5 in every skill, plus strong command of English and other languages. Check the fee and language strands with Heriot-Watt."),
      pg("MSc Analytical Science for the Biosciences Industries", "MSc", "Science", undefined, "Sep 2027", "September", undefined, "Needs IELTS 6.5 overall with at least 6.0 in each element, and a good degree in a life science, physical science or engineering subject."),
    ],
    campuses: [
      {
        name: "Edinburgh Campus",
        city: "Edinburgh",
        description: "The main campus, set in 380 acres of parkland in the Riccarton area of Edinburgh, home to most schools.",
      },
      {
        name: "Scottish Borders Campus",
        city: "Galashiels",
        description: "A campus in Galashiels that is home to the School of Textiles and Design, for fashion, design and textiles.",
      },
      {
        name: "Orkney Campus",
        city: "Stromness",
        description: "A campus in Stromness, Orkney, offering postgraduate study in marine and environmental science.",
      },
      {
        name: "Dubai Campus",
        city: "Dubai",
        description: "A campus in Dubai, UAE, in a seven storey building opened in 2021, with subjects such as architecture, computer science, engineering and finance.",
      },
      {
        name: "Malaysia Campus",
        city: "Putrajaya",
        description: "A campus in Putrajaya, near Kuala Lumpur, Malaysia. Its fees are set separately in Malaysian ringgit and are not covered here.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "Heriot-Watt University",
      sector: "public",
      place: "Edinburgh, Scotland, with further campuses in Scotland, Dubai and Malaysia",
      known:
        "Heriot-Watt is known for engineering, business, computing, science, design and languages, with a green parkland campus in Edinburgh and a specialist textiles and design campus in the Scottish Borders.",
      ielts:
        "Most undergraduate courses ask for IELTS 6.0, while actuarial science and languages ask for 6.5 or more. Postgraduate scores vary, for example 6.5 for analytical science and 7.0 for interpreting.",
      fees:
        "Agent sites quoting 2026/27 rates show undergraduate fees from about £18,432 to £26,296 and master's fees from about £24,952 to £26,296, but sources differ. A merit scholarship of up to £5,000 may apply. Confirm with Heriot-Watt.",
      intakes:
        "Undergraduate courses start in September. Many master's courses start in September, and an agent site shows January 2027 starts for some. Check your course page for exact dates.",
    }),
  },

  // ── PDF row 41 ─────────────────────────────────────────────────────────
  {
    name: "University of Hertfordshire",
    city: "Hatfield",
    country: "United Kingdom",
    institutionType: "Public university",
    website: "https://www.herts.ac.uk",
    founded: 1992,
    upcomingIntake: "Jan 2027",
    programs: ["Business", "Computing", "Engineering"],
    summary:
      "A public university in Hatfield, Hertfordshire, about 35 km north of London, with two campuses linked by a free shuttle bus. It teaches business, computing, engineering, health, law, psychology and creative subjects to students from nearly 90 countries.",
    ieltsOverall: 6.0,
    ieltsMinBand: 5.5,
    ieltsNote: "UG usually needs IELTS 6.0 with 5.5 in each band, and PG 6.5 with 5.5, per an agent site. Check your course page.",
    tuitionMin: 17450,
    tuitionMax: 22450,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "UG £17,450 and PG £17,950 to £22,450 from an agent page quoting Hertfordshire. A scholarship of up to £4,000 may apply. Confirm on herts.ac.uk.",
    overview:
      "The University of Hertfordshire is a public university in Hatfield, close to London, with roots in a technical college founded in 1952 and university status since 1992. Its two campuses, College Lane and de Havilland, are linked by a free shuttle bus, and it has more than 25,000 students.",
    studentLife:
      "Hatfield sits on the main rail line into London, with a typical journey of about 22 minutes to King's Cross, and close to Hertfordshire countryside. Students can join sports teams that compete in British Universities and Colleges Sport leagues, and both campuses have cafes and social spaces.",
    accommodation:
      "Modern accommodation is available on campus, and the university guarantees a room in the first year for students who meet application deadlines and personal requirements. Private student housing is also close to campus. Check the accommodation pages for current prices.",
    library:
      "Libraries and learning spaces on the campuses offer study areas, computers and a large online collection of journals and ebooks. Check the library pages for opening hours and services.",
    sports:
      "The Hertfordshire Sports Village on the de Havilland campus has a 25 metre pool, sports halls, a fitness suite and outdoor pitches, and there is a smaller gym on College Lane. The village is open to the local community too.",
    wikipediaTitle: "University of Hertfordshire",
    ...seo("University of Hertfordshire", "Hatfield, Hertfordshire"),
    courses: [
      ug("BSc (Hons) Computer Science", "BSc", "Computer Science", "3 Years", "Sep 2027", "September", 17450),
      ug("BA (Hons) Psychology", "BA", "Psychology", "3 Years", "Sep 2027", "September", 17450),
      ug("LLB (Hons) Law", "LLB", "Law", "3 Years", "Sep 2027", "September", 17450),
      pg("MSc International Business", "MSc", "Business", "1 Year", "Jan 2027", SEP_JAN, 17950),
      pg("MSc Computer Science", "MSc", "Computer Science", "1 Year", "Jan 2027", SEP_JAN),
    ],
    campuses: [
      {
        name: "College Lane Campus",
        city: "Hatfield",
        address: "College Lane, Hatfield AL10 9AB",
        description: "A main campus in Hatfield with teaching buildings, accommodation, cafes and a smaller gym.",
      },
      {
        name: "de Havilland Campus",
        city: "Hatfield",
        address: "Hatfield AL10 9EU",
        description: "A campus on the site of the former Hatfield aerodrome, home to the Sports Village, a restaurant and student accommodation.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "the University of Hertfordshire",
      sector: "public",
      place: "Hatfield, Hertfordshire, England",
      known:
        "Hertfordshire is known for business, computing, engineering, health, law and psychology courses, a Sports Village, and two campuses in Hatfield close to London.",
      ielts:
        "Undergraduate courses usually ask for IELTS 6.0 with no band below 5.5, and postgraduate courses usually ask for 6.5 with 5.5 in each band. Check your course page for the exact score.",
      fees:
        "An agent page quoting Hertfordshire lists 2026/27 fees of £17,450 for undergraduate courses and £17,950 to £22,450 for taught master's courses. A scholarship of up to £4,000 may apply, so confirm with Hertfordshire.",
      intakes:
        "Undergraduate courses start in September. Many master's courses start in September or January. An agent page gives a 27 November 2026 application deadline, so check your course page.",
    }),
  },

  // ── PDF row 42 ─────────────────────────────────────────────────────────
  {
    name: "University of Huddersfield",
    city: "Huddersfield",
    country: "United Kingdom",
    institutionType: "Public university",
    website: "https://www.hud.ac.uk",
    upcomingIntake: "Jan 2027",
    programs: ["Business", "Computing", "Engineering"],
    summary:
      "A public university in Huddersfield, West Yorkshire, with a town centre campus at Queensgate and a London campus. It teaches business, computing, engineering, health, art and design and media courses, with a pathway centre for students who need extra preparation.",
    ieltsOverall: 6.0,
    ieltsMinBand: 5.5,
    ieltsNote: "Many courses ask for IELTS 6.0 with no band below 5.5, per course pages on an agent site. Check your course page for the exact score.",
    tuitionMin: 17600,
    tuitionMax: 21000,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "UG £17,600, most MA and MSc £18,700, MBA £19,690, some health courses up to £21,000, from hud.ac.uk. Placement year £3,300.",
    overview:
      "The University of Huddersfield is a public university whose main campus at Queensgate sits in the town centre, with the Huddersfield Narrow Canal running through it. It also runs a London campus offering international business courses, and a separate International Study Centre offers pathway programmes for students who need extra preparation.",
    studentLife:
      "Huddersfield is a West Yorkshire town at the foot of the Pennines with good road and rail links. Student Central is the campus hub, bringing together the students' union, a shop, the library and computer suites, and the town centre is a short walk away.",
    accommodation:
      "Students can find university halls and private housing, and the students' union runs an accommodation office called HudLets that works with halls and private landlords. Check the accommodation pages for current prices and booking dates.",
    library:
      "The library sits in the heart of the campus within the Student Central building, with study spaces, computer suites and online collections. Check the library pages for opening hours and services.",
    sports:
      "Students can use the campus gym and sports facilities and join clubs through the students' union. Check the sport pages for current memberships.",
    wikipediaTitle: "University of Huddersfield",
    ...seo("University of Huddersfield", "Huddersfield and London"),
    courses: [
      ug("BA (Hons) International Business", "BA", "Business", undefined, "Jan 2027", "September, January and May", 17600, "Offered at the London campus, where the 2026/27 international fee is the same as the main undergraduate rate."),
      ug("BSc (Hons) Computer Science", "BSc", "Computer Science", undefined, "Jan 2027", "September, January and May", 17600),
      ug("BA (Hons) Media and Communications", "BA", "Media", undefined, "Jan 2027", "September, January and May", 17600),
      pg("MSc International Business", "MSc", "Business", "1 Year", "Jan 2027", "September, January and May", 18700),
      pg("MSc Electronic and Automotive Engineering", "MSc", "Engineering", "1 Year", "Jan 2027", "September, January and May", 18700),
      pg("MBA", "MBA", "Business", undefined, "Jan 2027", "September, January and May", 19690),
    ],
    campuses: [
      {
        name: "Queensgate Campus",
        city: "Huddersfield",
        address: "Queensgate, Huddersfield HD1 3DH",
        description: "The main campus in the town centre, with the library, students' union, teaching buildings and the Barbara Hepworth Building for art and design.",
      },
      {
        name: "University of Huddersfield London",
        city: "London",
        description: "A London campus for international students, offering selected business courses with its own fees and entry requirements.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "the University of Huddersfield",
      sector: "public",
      place: "Huddersfield, West Yorkshire, England, with a campus in London",
      known:
        "Huddersfield is known for business, computing, engineering, health, music, art and design and media courses, a compact town centre campus and clear published fees for international students.",
      ielts:
        "Many courses ask for IELTS 6.0 overall with no element below 5.5, according to course pages on an agent site. Some courses ask for more, so check your course page for the exact score.",
      fees:
        "For 2026/27, Huddersfield lists £17,600 for undergraduate courses, £18,700 for most MA and MSc courses and £19,690 for the MBA. Some health and pharmacy courses cost more, and a placement year is £3,300.",
      intakes:
        "The 2026/27 year includes September 2026, January 2027 and May 2027 starts. Check your course page for which of these your course offers.",
    }),
  },

  // ── PDF row 43 ─────────────────────────────────────────────────────────
  {
    name: "University of Hull",
    city: "Hull",
    country: "United Kingdom",
    institutionType: "Public research university",
    website: "https://www.hull.ac.uk",
    founded: 1927,
    upcomingIntake: "Jan 2027",
    programs: ["Computing", "Business", "Health"],
    summary:
      "A public research university in Hull, East Riding of Yorkshire, on one compact campus on Cottingham Road. It teaches health, business, law, science, computing, arts and engineering, and runs the Hull York Medical School with the University of York.",
    ieltsOverall: 6.0,
    ieltsMinBand: 5.5,
    ieltsNote: "UG courses ask for IELTS 6.0 overall with 5.5 in each skill. Some PG courses ask for 6.5. Check your course page.",
    tuitionMin: 18945,
    tuitionCurrency: "GBP",
    tuitionPeriod: "per year (2026/27)",
    tuitionNote: "Only one UG fee was found, £18,945 for BA Music from an aggregator site. Confirm all fees on hull.ac.uk before quoting.",
    overview:
      "The University of Hull began in 1927 as University College Hull and is based on a single campus on Cottingham Road. It describes itself as England's 14th oldest university and holds a Gold rating in the Teaching Excellence Framework 2023. It teaches business, health, science, computing, law and arts, and OnCampus Hull offers preparation programmes.",
    studentLife:
      "The university says students can reach lectures from their room in under 10 minutes on one safe campus. It describes Hull as the UK's most affordable city, with rent below half of London levels, and the campus has bars, cafes and support services.",
    accommodation:
      "New on campus accommodation provides rooms for more than 2,300 students, with wifi and bills included in the rent. Check the accommodation pages for current prices, guarantee conditions and booking dates.",
    library:
      "The seven storey Brynmor Jones Library holds over a million books and digital resources, with silent zones, group rooms, a family room, a cafe and views from its top floor.",
    sports:
      "The campus has an all new sports centre and gym, and students can join clubs through the students' union. Check the sport pages for current memberships.",
    wikipediaTitle: "University of Hull",
    facebookUrl: "https://www.facebook.com/UniversityOfHull",
    instagramUrl: "https://www.instagram.com/universityofhull",
    linkedinUrl: "https://uk.linkedin.com/school/university-of-hull",
    ...seo("University of Hull", "Hull, Yorkshire"),
    courses: [
      ug("BSc (Hons) Computer Science", "BSc", "Computer Science", "3 Years", "Sep 2027", "September"),
      ug("BSc (Hons) Computer Science (Artificial Intelligence)", "BSc", "Computer Science", undefined, "Sep 2027", "September"),
      ug("BA (Hons) Music", "BA", "Music", "3 Years", "Sep 2027", "September", 18945),
      ug("BA (Hons) English", "BA", "English", undefined, "Sep 2027", "September"),
      ug("BEng (Hons) Civil Engineering", "BEng", "Engineering", undefined, "Sep 2027", "September"),
      pg("MSc Artificial Intelligence and Data Science", "MSc", "Computer Science", "1 Year", undefined, undefined),
    ],
    campuses: [
      {
        name: "Hull Campus",
        city: "Hull",
        address: "Cottingham Road, Hull HU6 7RX",
        description: "The single main campus, with the Brynmor Jones Library, a sports centre, the Allam Medical Building and on campus accommodation.",
      },
    ],
    documents: UK_DOCUMENTS,
    faqs: ukFaqs({
      name: "the University of Hull",
      sector: "public",
      place: "Hull, East Riding of Yorkshire, England",
      known:
        "Hull is known for its single compact campus, a Gold rating in the Teaching Excellence Framework 2023, the Hull York Medical School and courses in business, health, computing, law and arts.",
      ielts:
        "Undergraduate courses ask for IELTS 6.0 overall with at least 5.5 in each skill. Some postgraduate courses ask for 6.5, so check your course page for the exact score.",
      fees:
        "Only one fee was found, £18,945 a year for BA Music from an aggregator site. Hull offers a £2,000 a year fee waiver to undergraduates from listed countries, and postgraduate waivers exist. Confirm all fees with Hull.",
      intakes:
        "Hull lists September 2026, January 2027 and May 2027 enrolment for its fee waivers. Most undergraduate courses start in September, so check your course page for exact dates.",
    }),
  },
];