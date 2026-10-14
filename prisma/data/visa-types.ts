// prisma/data/visa-types.ts
// The visa funnel: first the person picks a goal in plain words (VISA_PURPOSES), then picks from the
// visas of their destination that serve that goal (VISA_TYPES), each with a short explanation.
// This file only fills the database the first time (prisma/seed-destinations.ts); after that rows are
// edited in the database, and a re-run never overwrites those edits.
//
// Rules for this file:
//   - Keys of VISA_TYPES must be destination names from prisma/data/destinations.ts.
//   - A visa is listed only where it exists. A purpose with no visa in a destination is not offered there.
//   - The position in each list becomes `order`: the most common visa first.
//   - Summaries are one plain sentence, written for someone who knows no visa words.
//   - No fees, salary levels, dates or processing times here: they change and would go stale. Add those
//     in the database when a counsellor has confirmed them.
//   - Visa rules change often. Have a counsellor review this list before it goes live.

export type PurposeSlug = "study" | "work" | "visit" | "family" | "business" | "not-sure";

export type VisaPurposeSeed = {
  slug: PurposeSlug;
  name: string;
  goalLabel: string; // what the person taps
  description: string;
  emoji: string;
  order: number;
};

export const VISA_PURPOSES: VisaPurposeSeed[] = [
  {
    slug: "study",
    name: "Study",
    goalLabel: "I want to study abroad",
    description: "Go to a school, college or university in another country.",
    emoji: "🎓",
    order: 1,
  },
  {
    slug: "work",
    name: "Work",
    goalLabel: "I want to work abroad",
    description: "Take up a job or look for work in another country.",
    emoji: "💼",
    order: 2,
  },
  {
    slug: "visit",
    name: "Visit",
    goalLabel: "I want to visit for a short time",
    description: "A holiday, seeing family or friends, or a short trip.",
    emoji: "✈️",
    order: 3,
  },
  {
    slug: "family",
    name: "Join family",
    goalLabel: "I want to join my spouse, partner or family",
    description: "Live with a husband, wife, partner or parent who is abroad, or travel with someone who is moving.",
    emoji: "👨‍👩‍👧",
    order: 4,
  },
  {
    slug: "business",
    name: "Business",
    goalLabel: "I want to do business or start a company",
    description: "Business meetings and deals, or setting up and running a business abroad.",
    emoji: "🏢",
    order: 5,
  },
  {
    slug: "not-sure",
    name: "Not sure",
    goalLabel: "I am not sure yet",
    description: "Tell us your situation and a counsellor will point you to the right visa.",
    emoji: "🤔",
    order: 99,
  },
];

export type VisaTypeSeed = {
  slug: string; // unique inside the destination
  purpose: PurposeSlug;
  name: string;
  summary: string;
  serviceSlug?: string; // the page under /services that explains it
};

// The services page each kind of visa points to. Family visas pick their own (spouse or dependant).
const SERVICE_BY_PURPOSE: Partial<Record<PurposeSlug, string>> = {
  study: "study-visa",
  work: "work-visa",
};

const v = (
  purpose: PurposeSlug,
  slug: string,
  name: string,
  summary: string,
  serviceSlug?: string
): VisaTypeSeed => ({ purpose, slug, name, summary, serviceSlug: serviceSlug ?? SERVICE_BY_PURPOSE[purpose] });

const SPOUSE = "spouse-visa";
const DEPENDANT = "dependent-visa";

export const VISA_TYPES: Record<string, VisaTypeSeed[]> = {
  "United Kingdom": [
    v("study", "student", "Student visa", "For studying full time at a UK school that is licensed to take international students. You need an offer from the school first."),
    v("work", "skilled-worker", "Skilled Worker visa", "For people with a job offer from a UK employer that is licensed to sponsor, in a job that qualifies."),
    v("work", "graduate", "Graduate visa", "For international students who have finished a UK degree and want to stay on to work or look for work."),
    v("work", "health-care-worker", "Health and Care Worker visa", "For qualified doctors, nurses and other health professionals with a job offer from an approved UK employer."),
    v("visit", "standard-visitor", "Standard Visitor visa", "For a holiday, visiting family or friends, a short course or a short business trip. You cannot work or settle on it."),
    v("family", "spouse-partner", "Spouse or partner visa", "To join your husband, wife or partner who lives in the UK as a British citizen or with settled status.", SPOUSE),
    v("family", "dependant", "Dependant visa", "For the partner or children of someone on a UK study or work visa that allows family to come along.", DEPENDANT),
    v("business", "innovator-founder", "Innovator Founder visa", "To start and run a new, original business in the UK with the backing of an approved endorsing body."),
  ],
  Canada: [
    v("study", "study-permit", "Study permit", "For studying at a Canadian school that is approved to take international students. You need a letter of acceptance first."),
    v("work", "work-permit", "Work permit", "For working in Canada for an employer, usually with a job offer. Some permits tie you to one employer and some do not."),
    v("work", "pgwp", "Post-Graduation Work Permit", "For international graduates of eligible Canadian schools who want to work in Canada after their studies."),
    v("work", "express-entry", "Express Entry (permanent residence)", "For skilled workers who want to move to Canada for good. You are scored on age, education, work experience and language."),
    v("visit", "visitor-visa", "Visitor visa", "For a holiday, visiting family or friends, or a short business trip. You cannot work or study long term on it."),
    v("family", "spousal-sponsorship", "Spousal sponsorship", "To join your husband, wife or partner who is a Canadian citizen or permanent resident.", SPOUSE),
    v("family", "accompanying-family", "Family of a student or worker", "For the spouse and children of someone studying or working in Canada who want to come along.", DEPENDANT),
  ],
  "United States": [
    v("study", "f1", "F-1 student visa", "For studying full time at a US school that is approved to take international students. You need the school's I-20 form first."),
    v("work", "h1b", "H-1B work visa", "For skilled jobs that need a degree, with a US employer who sponsors you. Places are limited and picked by lottery."),
    v("work", "o1", "O-1 visa", "For people with extraordinary ability in fields like science, business, arts or sport, backed by a US employer or agent."),
    v("work", "l1", "L-1 transfer visa", "For employees moved by their company to a US office after working for it abroad."),
    v("visit", "b2", "B-2 visitor visa", "For a holiday, visiting family or friends, or medical treatment. You cannot work or study on it."),
    v("family", "spouse-citizen", "Spouse of a US citizen visa", "To join your husband or wife who is a US citizen and live in the US permanently.", SPOUSE),
    v("family", "fiance", "Fiance visa (K-1)", "For people engaged to a US citizen who plan to marry within a set time after arriving.", SPOUSE),
    v("family", "dependant", "Dependant visa", "For the spouse and children of someone on a US student or work visa, such as F-2 and H-4.", DEPENDANT),
    v("business", "b1", "B-1 business visitor visa", "For business meetings, conferences and deals in the US. You cannot be employed there on it."),
  ],
  Australia: [
    v("study", "student-500", "Student visa (subclass 500)", "For studying full time at an Australian school registered for international students. You need a confirmation of enrolment first."),
    v("work", "skills-in-demand", "Skills in Demand visa (subclass 482)", "For skilled workers sponsored by an Australian employer for a job on the approved list."),
    v("work", "graduate-485", "Temporary Graduate visa (subclass 485)", "For international students who have just finished an Australian degree and want to stay on to work."),
    v("work", "skilled-independent", "Skilled Independent visa (subclass 189)", "For skilled workers who want to live in Australia for good without an employer or state sponsoring them. It is points based."),
    v("visit", "visitor-600", "Visitor visa (subclass 600)", "For a holiday, visiting family or friends, or a short business trip. You cannot work on it."),
    v("family", "partner", "Partner visa", "To join your husband, wife or partner who is an Australian citizen or permanent resident.", SPOUSE),
  ],
  Germany: [
    v("study", "student", "Student visa", "For studying at a German university or college. You need an admission letter and proof that you can pay for your stay."),
    v("work", "skilled-worker", "Skilled Worker visa", "For qualified professionals with a job offer in Germany that fits their degree or training."),
    v("work", "blue-card", "EU Blue Card", "For graduates with a well paid job offer in Germany. It is a fast route to a long stay."),
    v("work", "opportunity-card", "Opportunity Card (Chancenkarte)", "For skilled people without a job offer yet. A points score lets you move to Germany to look for work."),
    v("visit", "schengen-visitor", "Schengen visitor visa", "For a holiday, visiting family or friends, or a short business trip. It also lets you travel to other Schengen countries."),
    v("family", "family-reunification", "Family reunification visa", "To join your husband, wife, parent or child who already lives in Germany.", SPOUSE),
    v("business", "self-employment", "Self employment visa", "To work for yourself or run a business in Germany, with a business plan that shows it can succeed."),
  ],
  Ireland: [
    v("study", "study-visa", "Study visa", "For studying full time at an Irish school on the approved list. You need an offer and proof that you can pay for your stay."),
    v("work", "critical-skills", "Critical Skills Employment Permit", "For highly skilled jobs that Ireland has a shortage of. It is a quick route to settling, and to bringing your family."),
    v("work", "general-permit", "General Employment Permit", "For jobs that are not on the critical skills list, with an Irish employer ready to hire you."),
    v("visit", "short-stay", "Short stay visit visa", "For a holiday, visiting family or friends, or a short business trip. You cannot work or study on it."),
    v("family", "join-family", "Join family visa", "To join a husband, wife, partner or close relative who lives in Ireland.", SPOUSE),
    v("business", "step", "Start-up Entrepreneur Programme", "For founders of a new, high potential business who want to set it up and run it from Ireland."),
  ],
  France: [
    v("study", "student", "Long stay student visa", "For studying in France for more than three months. You need an admission letter and proof that you can pay for your stay."),
    v("work", "talent-passport", "Talent Passport", "For highly skilled workers, researchers, artists and investors who want to live and work in France for several years."),
    v("work", "employee", "Employee work visa", "For people with a job offer from a French employer that has approval to hire from abroad."),
    v("visit", "schengen-visitor", "Schengen short stay visa", "For a holiday, visiting family or friends, or a short business trip. It also lets you travel to other Schengen countries."),
    v("family", "family-spouse", "Family or spouse visa", "To join your husband, wife, parent or child who lives in France.", SPOUSE),
  ],
  Netherlands: [
    v("study", "student-permit", "Student residence permit", "For studying at a Dutch school that is approved to take international students. The school applies for it with you."),
    v("work", "highly-skilled-migrant", "Highly Skilled Migrant permit", "For skilled workers hired by a Dutch employer that is recognised to sponsor them."),
    v("work", "orientation-year", "Orientation Year permit", "For graduates of Dutch universities and some top universities abroad who want a year to look for work or start a business."),
    v("visit", "schengen-visitor", "Schengen short stay visa", "For a holiday, visiting family or friends, or a short business trip. It also lets you travel to other Schengen countries."),
    v("family", "family-residence", "Partner or family residence permit", "To join your husband, wife, partner or parent who lives in the Netherlands.", SPOUSE),
    v("business", "startup", "Startup residence permit", "For founders of an innovative startup who are supported by an experienced Dutch mentor."),
  ],
  "New Zealand": [
    v("study", "student", "Student visa", "For studying at a New Zealand school that is approved to take international students. You need an offer of a place first."),
    v("work", "aewv", "Accredited Employer Work Visa", "For people with a job offer from a New Zealand employer that is accredited to hire from abroad."),
    v("work", "post-study", "Post Study Work Visa", "For international graduates of New Zealand schools who want to work after their studies."),
    v("work", "skilled-migrant", "Skilled Migrant Category Resident Visa", "For skilled workers who want to live in New Zealand for good. You are scored on skills, work experience and qualifications."),
    v("visit", "visitor", "Visitor visa", "For a holiday, visiting family or friends, or a short trip. You cannot work or study long term on it."),
    v("family", "partner", "Partner of a New Zealander visa", "To join your husband, wife or partner who is a New Zealand citizen or resident.", SPOUSE),
  ],
  Italy: [
    v("study", "student", "Student visa", "For studying at an Italian university or college. You need an admission letter and proof that you can pay for your stay."),
    v("work", "subordinate", "Work visa for employees", "For a job with an Italian employer, within the yearly limit the government sets for foreign workers."),
    v("visit", "schengen-visitor", "Schengen short stay visa", "For a holiday, visiting family or friends, or a short business trip. It also lets you travel to other Schengen countries."),
    v("family", "family-reunification", "Family reunification visa", "To join your husband, wife, parent or child who lives in Italy.", SPOUSE),
    v("business", "self-employment", "Self employment visa", "To work for yourself or run a business in Italy."),
    v("business", "startup", "Italian Startup Visa", "For founders of an innovative startup who want to build it in Italy."),
  ],
  Poland: [
    v("study", "student", "Student visa", "For studying at a Polish university or college. You need an admission letter and proof that you can pay for your stay."),
    v("work", "work-visa", "Work visa", "For a job with a Polish employer that has the permit to hire you."),
    v("visit", "schengen-visitor", "Schengen short stay visa", "For a holiday, visiting family or friends, or a short business trip. It also lets you travel to other Schengen countries."),
    v("family", "family-reunification", "Family reunification", "To join your husband, wife, parent or child who lives in Poland.", SPOUSE),
  ],
  "United Arab Emirates": [
    v("study", "student", "Student visa", "For studying at a university or college in the UAE. The school sponsors your visa."),
    v("work", "employment", "Employment visa", "For people with a job offer from a UAE employer, who sponsors your visa and residence."),
    v("work", "green-visa", "Green visa", "For skilled workers and freelancers who want to live and work in the UAE without an employer as sponsor."),
    v("visit", "tourist", "Tourist visa", "For a holiday, visiting family or friends, or a short trip. You cannot work on it."),
    v("family", "family-residence", "Family residence visa", "For residents of the UAE who want to bring their husband, wife and children to live with them.", DEPENDANT),
    v("business", "investor-partner", "Investor or partner visa", "For people who invest in, or own a share of, a UAE company."),
    v("business", "golden", "Golden visa", "A long residence visa for investors, business owners and some skilled people."),
  ],
  "South Africa": [
    v("study", "study", "Study visa", "For studying at a registered South African school. You need an offer and proof that you can pay for your stay."),
    v("work", "critical-skills", "Critical Skills Work visa", "For skilled people in jobs on South Africa's critical skills list, with or without a job offer."),
    v("work", "general-work", "General Work visa", "For a job offer from a South African employer who could not find a local to fill the role."),
    v("visit", "visitor", "Visitor's visa", "For a holiday, visiting family or friends, or a short business trip. You cannot work on it."),
    v("family", "spousal", "Spousal or life partner visa", "To join your husband, wife or life partner who is a South African citizen or permanent resident.", SPOUSE),
    v("business", "business", "Business visa", "To set up or buy into a business in South Africa, with the money and the plan to back it."),
  ],
};