// src/lib/portal-paths.ts
// Small shared pieces of the portal's phone layout. No React here, so the portal and the public
// pages (courses, institutions) can both import it.

// On phones the chat is its own page at this route (opened from the bottom bar).
export const CHAT_PAGE = "/portal/chat";

// The list of everything the applicant has started or sent (and the empty state with "Get started").
export const APPLICATIONS_PAGE = "/portal/applications";

// The eligibility check: a few questions that match the applicant with courses and open applications.
export const ELIGIBILITY_PAGE = "/portal/eligibility-check";

// Set in sessionStorage when someone opens the portal. The public /courses and /institutions pages
// use it to keep showing the portal's bottom bar for people who came from the portal.
export const PORTAL_FLAG_KEY = "portal:entered";

// Pages that are not an application, so the "Applications" tab/item is not highlighted on them.
export const isCatalogPath = (p: string) =>
  p.startsWith("/courses") || p.startsWith("/institutions") || p === CHAT_PAGE;