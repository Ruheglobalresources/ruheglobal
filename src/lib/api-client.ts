// src/lib/api-client.ts
// Tiny fetch wrapper for the Hono API (/api/v1). The web app calls it with a
// relative URL. The Expo app can reuse the same shape with an absolute base,
// for example https://www.ruhegr.com/api/v1.
export const API_BASE = "/api/v1";

export type PageMeta = { total: number; page: number; limit: number; totalPages: number };
export type Paged<T> = { data: T[]; meta: PageMeta };

export async function apiGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  signal?: AbortSignal
): Promise<T> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") qs.set(key, String(value));
  }
  const query = qs.toString();

  const res = await fetch(`${API_BASE}${path}${query ? `?${query}` : ""}`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}
