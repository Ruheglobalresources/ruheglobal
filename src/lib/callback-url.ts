// src/lib/callback-url.ts
// Everything that touches the ?callbackUrl= value of the login and register pages.
//
// Why a helper: the value comes from the address bar, so anyone can put anything in it.
// Without a check, https://other-site.com or javascript:... would be used as the place to
// send the user after login. Only a path on this site is accepted, everything else falls
// back to a safe default.
import { DEFAULT_LOGIN_REDIRECT } from "@/route";

const MAX_LENGTH = 2000;

export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback: string = DEFAULT_LOGIN_REDIRECT
): string {
  if (!raw) return fallback;

  const value = raw.trim();
  if (!value || value.length > MAX_LENGTH) return fallback;

  // must be a path on this site: blocks https://..., javascript:..., and //host
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  // browsers read a backslash like a slash (/\host), and control characters can hide a scheme
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return fallback;

  return value;
}

// /auth/login or /auth/register, carrying the page the user wanted in the first place.
// With no callback (or an unsafe one) it is the plain page.
export function authHref(page: "login" | "register", callbackUrl?: string | null): string {
  const safe = safeCallbackUrl(callbackUrl, "");
  return safe ? `/auth/${page}?callbackUrl=${encodeURIComponent(safe)}` : `/auth/${page}`;
}