// prisma/institutionBatches/types.ts
//
// Shared types for every institution batch file. Batch files only hold data,
// the engine in prisma/seedInstitutions.ts does the writing.
//
// undefined = leave the stored value alone, null = clear it.

export type Nullable<T> = T | null;

export type CourseInput = {
  name: string;
  level?: "Undergraduate" | "Postgraduate";
  degree?: string;
  subject?: string;
  duration?: string;
  nextIntake?: string;
  intakes?: string;
  tuitionAmount?: number;
  tuitionCurrency?: string;
  tuitionPeriod?: string;
  description?: string; // one short paragraph
};

export type CampusInput = {
  name: string;
  city?: string;
  address?: string;
  description?: string; // one short paragraph
};

export type FaqInput = {
  question: string;
  answer: string; // one short paragraph
};

// [category, name], for example ["Identity", "Passport"]
export type DocumentRow = [category: string, name: string];

export type InstitutionInput = {
  // Required
  name: string;
  summary: string;

  // Optional. If you leave the slug out it is made from the name.
  slug?: string;

  // Basics
  city?: Nullable<string>;
  country?: Nullable<string>; // full name, e.g. "United Kingdom", never "UK"
  institutionType?: Nullable<string>;
  website?: Nullable<string>;
  imageUrl?: Nullable<string>;
  logoUrl?: Nullable<string>;
  ranking?: Nullable<string>;
  programs?: string[];

  // Stat strip
  founded?: Nullable<number>;
  acceptanceRate?: Nullable<string>;
  upcomingIntake?: Nullable<string>;

  // English requirements
  ieltsOverall?: Nullable<number>;
  ieltsMinBand?: Nullable<number>;
  ieltsAlternatives?: string[];
  ieltsNote?: Nullable<string>;

  // Tuition
  tuitionMin?: Nullable<number>;
  tuitionMax?: Nullable<number>;
  tuitionCurrency?: Nullable<string>;
  tuitionPeriod?: Nullable<string>;
  tuitionNote?: Nullable<string>;

  // Highlights tabs, one short paragraph each
  overview?: Nullable<string>;
  studentLife?: Nullable<string>;
  accommodation?: Nullable<string>;
  library?: Nullable<string>;
  sports?: Nullable<string>;

  // Social links
  facebookUrl?: Nullable<string>;
  instagramUrl?: Nullable<string>;
  twitterUrl?: Nullable<string>;
  linkedinUrl?: Nullable<string>;
  youtubeUrl?: Nullable<string>;

  // SEO
  metaTitle?: Nullable<string>;
  metaDescription?: Nullable<string>;

  isActive?: boolean;
  isFeatured?: boolean;
  order?: number;

  // Image lookup helpers (never stored)
  wikipediaTitle?: string;
  skipImageLookup?: boolean;

  // Child lists. Leave one as undefined to keep what is already stored,
  // set it to a list to replace the whole set.
  courses?: CourseInput[];
  campuses?: CampusInput[];
  documents?: Record<string, DocumentRow[]>; // keyed by "Undergraduate" | "Postgraduate"
  faqs?: FaqInput[];
};