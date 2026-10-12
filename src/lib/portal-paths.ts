// src/lib/portal-paths.ts
// Small shared pieces of the portal's phone layout. No React here, so the portal and the public
// pages (courses, institutions) can both import it.

// On phones the chat is its own page at this route (opened from the bottom bar).
export const CHAT_PAGE = "/portal/chat";

// Set in sessionStorage when someone opens the portal. The public /courses and /institutions pages
// use it to keep showing the portal's bottom bar for people who came from the portal.
export const PORTAL_FLAG_KEY = "portal:entered";

// Pages that are not an application, so the "Applications" tab/item is not highlighted on them.
export const isCatalogPath = (p: string) =>
  p.startsWith("/courses") || p.startsWith("/institutions") || p === CHAT_PAGE;