import type { School } from "./types";
import type { RawSchool } from "./schema";

const WIKI_ENDPOINT = "https://en.wikipedia.org/w/api.php";
// Wikimedia asks API clients to identify themselves with a contact URL.
const UA = "RuheGlobalSchoolSearch/1.0 (https://www.ruhegr.com; school search tool)";

type WikiResponse = {
  query?: {
    pages?: Array<{
      title?: string;
      thumbnail?: { source?: string };
    }>;
  };
};

/**
 * Models hallucinate image URLs constantly, so we never trust them for photos.
 * Instead we resolve a real campus photo from Wikipedia's page-image index.
 */
async function fetchWikipediaImage(query: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "1000",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "1",
    gsrnamespace: "0",
    redirects: "1",
    origin: "*",
  });

  try {
    const res = await fetch(`${WIKI_ENDPOINT}?${params.toString()}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as WikiResponse;
    const source = data.query?.pages?.[0]?.thumbnail?.source;
    return typeof source === "string" ? source : null;
  } catch {
    return null;
  }
}

function hostnameOf(website: string | null): string | null {
  if (!website) return null;
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function faviconFor(website: string | null): string | null {
  const host = hostnameOf(website);
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=128` : null;
}

/**
 * Attaches a campus photo + logo to every school, in parallel.
 * `raws[i]` must be the raw record that `schools[i]` was built from.
 */
export async function enrichWithImages(
  schools: School[],
  raws: RawSchool[],
): Promise<School[]> {
  return Promise.all(
    schools.map(async (school, i) => {
      const hint = raws[i]?.wikipediaTitle?.trim();
      const location = [school.city, school.country].filter(Boolean).join(" ");
      const query = hint && hint.length > 2 ? hint : `${school.name} ${location}`.trim();

      let imageUrl = await fetchWikipediaImage(query);
      if (!imageUrl && hint) imageUrl = await fetchWikipediaImage(school.name);

      return { ...school, imageUrl, logoUrl: faviconFor(school.website) };
    }),
  );
}
