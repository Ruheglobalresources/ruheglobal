import type { School } from "./types";

/**
 * Flat shape Claude returns. Kept flat (no nested objects) because models are
 * noticeably more reliable filling flat tool schemas, and it keeps the JSON small.
 */
export type RawSchool = {
  name?: string;
  city?: string;
  country?: string;
  institutionType?: string;
  summary?: string;
  programs?: string[];
  ieltsOverall?: number;
  ieltsMinBand?: number;
  ieltsAlternatives?: string[];
  ieltsNote?: string;
  tuitionMin?: number;
  tuitionMax?: number;
  tuitionCurrency?: string;
  tuitionPeriod?: string;
  tuitionNote?: string;
  ranking?: string;
  website?: string;
  wikipediaTitle?: string;
};

export const REPORT_SCHOOLS_SCHEMA = {
  type: "object" as const,
  properties: {
    schools: {
      type: "array",
      description: "One entry per institution. Never invent an institution.",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Official institution name." },
          city: { type: "string" },
          country: { type: "string" },
          institutionType: {
            type: "string",
            description: "e.g. Public research university, Private college.",
          },
          summary: {
            type: "string",
            description:
              "One or two plain sentences on what this school is known for and why it fits the request. Max 220 characters.",
          },
          programs: {
            type: "array",
            items: { type: "string" },
            description:
              "Up to 3 real programme names at the requested level and field.",
          },
          ieltsOverall: {
            type: "number",
            description: "Required overall IELTS band, e.g. 6.5. Omit if unknown.",
          },
          ieltsMinBand: {
            type: "number",
            description: "Minimum required in each sub-band, e.g. 6.0. Omit if unknown.",
          },
          ieltsAlternatives: {
            type: "array",
            items: { type: "string" },
            description: 'Accepted equivalents, e.g. ["TOEFL iBT 90", "PTE 65"].',
          },
          ieltsNote: {
            type: "string",
            description:
              "Short caveat, e.g. 'Higher for Nursing and Law'. Max 120 characters.",
          },
          tuitionMin: {
            type: "number",
            description: "Lower bound of annual international tuition, numbers only.",
          },
          tuitionMax: {
            type: "number",
            description: "Upper bound of annual international tuition, numbers only.",
          },
          tuitionCurrency: {
            type: "string",
            description: "ISO 4217 code, e.g. GBP, USD, CAD, AUD, EUR.",
          },
          tuitionPeriod: {
            type: "string",
            description: "e.g. 'per year (2025/26)' or 'total programme'.",
          },
          tuitionNote: {
            type: "string",
            description: "Short caveat when fees vary by programme. Max 120 characters.",
          },
          ranking: {
            type: "string",
            description: "Short ranking string, e.g. 'QS #142 (2026)'. Omit if unknown.",
          },
          website: {
            type: "string",
            description: "Official homepage URL, https:// included.",
          },
          wikipediaTitle: {
            type: "string",
            description:
              "Exact English Wikipedia article title for this institution, used to fetch a campus photo.",
          },
        },
        required: ["name", "summary"],
      },
    },
  },
  required: ["schools"],
};

function num(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value.replace(/[^\d.]/g, "")) : value;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
}

function str(value: unknown, max = 300): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, max) : null;
}

function list(value: unknown, max = 4): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .slice(0, max)
    .map((v) => v.trim().slice(0, 120));
}

/**
 * The URL comes from a model, and it ends up in an href. Only ever allow
 * http(s) so a `javascript:` URL can't slip through.
 */
function safeUrl(value: unknown): string | null {
  const raw = str(value, 300);
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normaliseSchool(raw: RawSchool, index: number): School | null {
  const name = str(raw.name, 160);
  if (!name) return null;

  return {
    id: `${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`,
    name,
    city: str(raw.city, 80),
    country: str(raw.country, 80),
    institutionType: str(raw.institutionType, 80),
    summary: str(raw.summary, 320) ?? "",
    programs: list(raw.programs, 3),
    ielts: {
      overall: num(raw.ieltsOverall),
      minBand: num(raw.ieltsMinBand),
      alternatives: list(raw.ieltsAlternatives, 3),
      note: str(raw.ieltsNote, 160),
    },
    tuition: {
      min: num(raw.tuitionMin),
      max: num(raw.tuitionMax),
      currency: str(raw.tuitionCurrency, 8)?.toUpperCase() ?? null,
      period: str(raw.tuitionPeriod, 60),
      note: str(raw.tuitionNote, 160),
    },
    ranking: str(raw.ranking, 60),
    website: safeUrl(raw.website),
    imageUrl: null,
    logoUrl: null,
  };
}
