// src/lib/institution-format.ts
// Small formatting helpers for the institution detail page.

export function money(amount: number, currency?: string | null) {
  const code = (currency ?? "").trim().toUpperCase();
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString("en-GB")}`.trim();
  }
}

// " / yr" when the period talks about a year (or is empty), otherwise the period text itself
function periodSuffix(period?: string | null) {
  const p = period?.trim();
  if (!p || /year|annum|yr/i.test(p)) return " / yr";
  return ` ${p}`;
}

/** "From £14,000 / yr", "£14,000 – £18,000 / yr", or null when no tuition is stored. */
export function tuitionLabel(i: {
  tuitionMin: number | null;
  tuitionMax: number | null;
  tuitionCurrency: string | null;
  tuitionPeriod: string | null;
}) {
  const min = i.tuitionMin && i.tuitionMin > 0 ? i.tuitionMin : null;
  const max = i.tuitionMax && i.tuitionMax > 0 ? i.tuitionMax : null;
  if (!min && !max) return null;

  const suffix = periodSuffix(i.tuitionPeriod);
  if (min && max) {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return lo === hi
      ? `${money(lo, i.tuitionCurrency)}${suffix}`
      : `${money(lo, i.tuitionCurrency)} – ${money(hi, i.tuitionCurrency)}${suffix}`;
  }
  if (min) return `From ${money(min, i.tuitionCurrency)}${suffix}`;
  return `Up to ${money(max as number, i.tuitionCurrency)}${suffix}`;
}

/** One course's fee. Falls back to the institution's currency; never guesses an amount. */
export function courseFee(
  c: { tuitionAmount: number | null; tuitionCurrency: string | null; tuitionPeriod: string | null },
  fallbackCurrency: string | null
) {
  if (!c.tuitionAmount || c.tuitionAmount <= 0) return null;
  return `${money(c.tuitionAmount, c.tuitionCurrency ?? fallbackCurrency)}${periodSuffix(c.tuitionPeriod)}`;
}

/** Lines for the "English requirement" row, e.g. ["IELTS 6.5 (no band below 6.0)", "TOEFL iBT 90"]. */
export function englishRequirement(i: {
  ieltsOverall: number | null;
  ieltsMinBand: number | null;
  ieltsAlternatives: string[];
  ieltsNote: string | null;
}) {
  const lines: string[] = [];
  if (i.ieltsOverall != null) {
    lines.push(
      `IELTS ${i.ieltsOverall.toFixed(1)}${i.ieltsMinBand != null ? ` (no band below ${i.ieltsMinBand.toFixed(1)})` : ""}`
    );
  } else if (i.ieltsMinBand != null) {
    lines.push(`IELTS: no band below ${i.ieltsMinBand.toFixed(1)}`);
  }
  for (const alt of i.ieltsAlternatives) if (alt.trim()) lines.push(alt.trim());
  return { lines, note: i.ieltsNote?.trim() || null };
}

export type DocGroup = { level: string; categories: { name: string; items: string[] }[] };

/** study level → category → document names, Undergraduate first. Keeps the admin's order inside each level. */
export function groupDocuments(rows: { studyLevel: string; category: string; name: string }[]): DocGroup[] {
  const levels = new Map<string, Map<string, string[]>>();
  for (const r of rows) {
    const cats = levels.get(r.studyLevel) ?? new Map<string, string[]>();
    const items = cats.get(r.category) ?? [];
    items.push(r.name);
    cats.set(r.category, items);
    levels.set(r.studyLevel, cats);
  }
  const rank = (l: string) => (/^under/i.test(l) ? 0 : /^post/i.test(l) ? 1 : 2);
  return Array.from(levels.entries())
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
    .map(([level, cats]) => ({
      level,
      categories: Array.from(cats.entries()).map(([name, items]) => ({ name, items })),
    }));
}

/** Paragraphs are separated by a blank line in the admin form. */
export const paragraphs = (text?: string | null) =>
  (text ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

export const safeUrl = (url?: string | null) => (url && /^https?:\/\//i.test(url) ? url : null);

export function truncate(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}