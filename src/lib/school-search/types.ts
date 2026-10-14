/** What the student picks in the sidebar. */
export type SearchFilters = {
  institution: string;
  country: string;
  institutionType: string;
  level: string;
  field: string;
  budget: string;
  count: number;
  /** From the eligibility check: the subjects the student picked. Used to match programmes. */
  subjects?: string[];
  /** From the eligibility check: the student's IELTS overall. Used to put schools they qualify for first. */
  ieltsScore?: number;
};

export type School = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  institutionType: string | null;
  summary: string;
  programs: string[];
  ielts: {
    overall: number | null;
    minBand: number | null;
    alternatives: string[];
    note: string | null;
  };
  tuition: {
    min: number | null;
    max: number | null;
    currency: string | null;
    period: string | null;
    note: string | null;
  };
  ranking: string | null;
  website: string | null;
  imageUrl: string | null;
  logoUrl: string | null;
  /** Only when the search carried the student's IELTS and the school's requirement is known. */
  ieltsFit?: "meets" | "below";
};

export type SourceLink = { title: string; url: string };

export type SearchResponse = {
  schools: School[];
  sources: SourceLink[];
  /**
   * Where these results came from:
   * - "database": our own vetted institutions (checked first, always shown for free)
   * - "ai": found live by the AI web-search fallback
   * - "demo": sample data because ANTHROPIC_API_KEY is missing
   */
  source: "database" | "ai" | "demo";
  elapsedMs: number;
};