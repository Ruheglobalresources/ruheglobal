/** What the student picks in the sidebar. */
export type SearchFilters = {
  country: string;
  institutionType: string;
  level: string;
  field: string;
  budget: string;
  count: number;
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
};

export type SourceLink = { title: string; url: string };

export type SearchResponse = {
  schools: School[];
  sources: SourceLink[];
  /** true when ANTHROPIC_API_KEY is missing and sample data was returned */
  demo: boolean;
  elapsedMs: number;
};
