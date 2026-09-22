/**
 * Tiny in-memory rate limiter. Every real search costs money (Claude + web
 * searches), so an open endpoint needs *some* brake.
 *
 * Limits: best-effort only. On serverless each instance keeps its own memory,
 * so this stops casual hammering, not a determined abuser. For a hard limit,
 * move the counter to your database/Redis or require a signed-in user.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SEARCHES_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function checkRateLimit(key: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_SEARCHES_PER_WINDOW) {
    hits.set(key, recent);
    const retryAfterSec = Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
    return { ok: false, retryAfterSec };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing forever.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }

  return { ok: true, retryAfterSec: 0 };
}

export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}
