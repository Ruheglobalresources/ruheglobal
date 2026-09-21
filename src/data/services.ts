export type ServiceLogo = {
  /** Human readable brand / institution name, used for the alt text. */
  name: string;
  /** Path inside /public. */
  src: string;
  /** Intrinsic dimensions so next/image can reserve the right space. */
  width: number;
  height: number;
  /**
   * Per-logo optical scale. Wordmarks read larger than emblems at the same
   * box height, so we nudge a few of them to keep the grid visually even.
   */
  scale?: number;
};

export type ServiceCategory = {
  id: string;
  /** Small ordinal shown above the card title. */
  index: string;
  title: string;
  description: string;
  /** Rendered as the accessible list of services behind the logo wall. */
  services: string[];
  /** Short label that introduces the logo wall. */
  logoCaption: string;
  logos: ServiceLogo[];
  /** Per-card clarification shown under the logo wall, where needed. */
  disclaimer?: string;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "study-abroad",
    index: "01",
    title: "Study Abroad",
    description:
      "Expert guidance for university selection, applications, admissions, scholarships, and student support.",
    services: [
      "University & College Placement",
      "Educational Advisory",
      "Course Selection",
      "University Selection",
      "Application & Admission Processing",
      "Scholarship Assistance",
      "Student Recruitment",
      "Student Support",
    ],
    logoCaption: "Institutions we place students with",
    logos: [
      {
        name: "University of Northampton",
        src: "/logos/study/northampton.png",
        width: 400,
        height: 120,
      },
      {
        name: "De Montfort University",
        src:  "/de-montfort.png",
        width: 400,
        height: 120,
      },
       {
        name: "University of Greenwich",
        src:  "/greenwich.png",
        width: 400,
        height: 120,
      },
      {
        name: "Dalhousie University",
        src: "/logos/study/dalhousie.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Deakin University",
        src: "/logos/study/deakin.png",
        width: 400,
        height: 120,
      },
      {
        name: "University of South Wales",
        src: "/logos/study/sw.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Woosong University",
        src: "/logos/study/woosong.svg",
        width: 400,
        height: 120,
      },
      // ── Added to round the wall out to 8. Drop any RGR doesn't place into. ──
      {
        name: "Coventry University",
        src: "/logos/study/coventry.png",
        width: 400,
        height: 120,
      },
      {
        name: "University of Hertfordshire",
        src: "/logos/study/hertfordshire.svg",
        width: 400,
        height: 120,
      },
       {
        name: "University of the West of Bristol",
        src: "/uwe.png",
        width: 400,
        height: 120,
      },
      {
        name: "Middlesex University",
        src: "/middlesex.png",
        width: 400,
        height: 120,
      },
      {
        name: "London School of Business and Finance",
        src: "/londonsbank.png",
        width: 400,
        height: 120,
      },
    ],
    disclaimer:
      "Institution logos indicate destinations we place students with. Representation arrangements vary by institution and intake.",
  },
  {
    id: "visa-immigration",
    index: "02",
    title: "Visa & Immigration",
    description:
      "Professional visa guidance, documentation support, and immigration assistance for international destinations.",
    services: [
      "Visa Advisory",
      "Visa Application Support",
      "Immigration Services",
      "Visa Documentation",
      "Pre-departure Support",
      "Post-arrival Support",
      "Work, Study & Migration Support",
    ],
    logoCaption: "Destinations & authorities we navigate",
    logos: [
      {
        name: "UK Visas and Immigration",
        src: "/logos/visa/ukvisa.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Immigration, Refugees and Citizenship Canada",
        src: "/logos/visa/ircc.svg",
        width: 400,
        height: 120,
        scale: 1.15,
      },
      {
        name: "Australian Department of Home Affairs",
        src: "/logos/visa/austrailia.png",
        width: 400,
        height: 120,
      },
      {
        name: "Immigration New Zealand",
        src: "/logos/visa/newzealand.svg",
        width: 400,
        height: 120,
      },
      {
        name: "U.S. Department of State",
        src: "/logos/visa/usd.gif",
        width: 400,
        height: 120,
        scale: 0.9,
      },
      // ── Added. Ireland is a common fifth destination; drop if not offered. ──
      {
        name: "Immigration Service Delivery, Ireland",
        src: "/logos/visa/ireland.png",
        width: 400,
        height: 120,
      },
    ],
    disclaimer:
      "Government marks identify the immigration routes we support. Ruhe Global Resources is not a government agency and is not endorsed by these authorities.",
  },
  {
    id: "exams-preparation",
    index: "03",
    title: "Exams & Preparation",
    description:
      "Preparation, registration, and academic support for international examinations and English-language requirements.",
    services: [
      "IELTS",
      "English Language Courses",
      "International Examination Tutorials",
      "Examination Registration",
      "Entrance Examination Preparation",
      "Academic Preparation",
      "Proofreading & Editing",
    ],
    logoCaption: "Examinations we prepare you for",
    logos: [
      {
        name: "IELTS",
        src: "/logos/exams/ielts.svg",
        width: 400,
        height: 120,
      },
      {
        name: "British Council",
        src: "/logos/exams/brits.jpg",
        width: 400,
        height: 120,
      },
      {
        name: "Pearson PTE Academic",
        src: "/logos/exams/pearson-pte.svg",
        width: 400,
        height: 120,
      },
      {
        name: "TOEFL",
        src: "/logos/exams/toefl.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Cambridge English",
        src: "/logos/exams/cambridge.png",
        width: 400,
        height: 120,
      },
      {
        name: "Cambridge International",
        src: "/logos/exams/cambridge.jpg",
        width: 400,
        height: 120,
      },
      // ── Added to round the wall out to 8. ──
      {
        name: "Duolingo English Test",
        src: "/logos/exams/duolingo.jfif",
        width: 400,
        height: 120,
      },
      {
        name: "GRE",
        src: "/logos/exams/gre.svg",
        width: 400,
        height: 120,
        scale: 0.9,
      },
    ],
    disclaimer:
      "Examination board logos identify the tests we prepare and register candidates for.",
  },
  {
    id: "travel-accommodation",
    index: "04",
    title: "Travel & Accommodation",
    description:
      "Seamless flight, accommodation, travel planning, and international experiences for students and travellers.",
    services: [
      "Local & International Air Tickets",
      "Flight Booking",
      "Global Hotel Reservations",
      "Accommodation Assistance",
      "Holiday Packages",
      "Educational Tours",
      "Summer Schools",
      "Honeymoon & Destination Wedding Travel",
      "Travel Logistics",
    ],
    logoCaption: "Airlines, hotels & platforms we book with",
    logos: [
      {
        name: "Emirates",
        src: "/logos/travel/emirates.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Qatar Airways",
        src: "/logos/travel/qatar-airways.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Turkish Airlines",
        src: "/logos/travel/turkish-airlines.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Ethiopian Airlines",
        src: "/logos/travel/ethiopian-airlines.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Marriott",
        src: "/logos/travel/marriott.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Hilton",
        src: "/logos/travel/hilton.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Radisson Hotels",
        src: "/logos/travel/radisson.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Accor",
        src: "/logos/travel/accor.svg",
        width: 400,
        height: 120,
      },
      {
        name: "Booking.com",
        src: "/logos/travel/booking.svg",
        width: 400,
        height: 120,
        scale: 0.95,
      },
      {
        name: "Expedia",
        src: "/logos/travel/expedia.svg",
        width: 400,
        height: 120,
      },
    ],
    disclaimer:
      "Airline, hotel and booking marks show the providers we book through on behalf of clients.",
  },
];