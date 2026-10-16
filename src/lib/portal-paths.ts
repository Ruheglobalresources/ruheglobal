// src/lib/portal-paths.ts
// Small shared pieces of the portal's phone layout. No React here, so the portal and the public
// pages (courses, institutions) can both import it.

// On phones the chat is its own page at this route (opened from the bottom bar).
export const CHAT_PAGE = "/portal/chat";

// The list of everything the applicant has started or sent (and the empty state with "Get started").
export const APPLICATIONS_PAGE = "/portal/applications";

// The eligibility check: a few questions that match the applicant with courses and open applications.
export const ELIGIBILITY_PAGE = "/portal/eligibility-check";

// The portal terminals that do not list applications. Opening one starts its eligibility check
// straight away (the check with the same slug in the eligibility terminal), skipping the
// "What would you like to do today?" picker.
export const STUDY_ABROAD_TERMINAL_SLUG = "study-abroad";
export const VISA_APPLICATION_TERMINAL_SLUG = "visa-application";
export const ELIGIBILITY_TERMINAL_SLUGS: readonly string[] = [STUDY_ABROAD_TERMINAL_SLUG, VISA_APPLICATION_TERMINAL_SLUG];

// Where a terminal card or link should go: the eligibility check for Study Abroad and Visa
// Application, the terminal's own page for every other terminal.
export const terminalHref = (terminalSlug: string) =>
  ELIGIBILITY_TERMINAL_SLUGS.includes(terminalSlug)
    ? `${ELIGIBILITY_PAGE}?check=${encodeURIComponent(terminalSlug)}`
    : `/portal/${terminalSlug}`;

// Set in sessionStorage when someone opens the portal. The public /courses and /institutions pages
// use it to keep showing the portal's bottom bar for people who came from the portal.
export const PORTAL_FLAG_KEY = "portal:entered";

// Pages that are not an application, so the "Applications" tab/item is not highlighted on them.
export const isCatalogPath = (p: string) =>
  p.startsWith("/courses") || p.startsWith("/institutions") || p === CHAT_PAGE;