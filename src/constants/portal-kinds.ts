// src/constants/portal-kinds.ts
// What a portal terminal is USED FOR. The admin picks one when creating a terminal, and
// the public pages use it to know where to send an applicant (for example the "Proceed to
// apply" buttons on schools and institutions open the application of the SCHOOL terminal).
//
// The values match the PortalKind enum in prisma/schema.prisma. Add a new kind in BOTH
// places, then in the app code that handles it.
export const PortalKindValues = ["GENERAL", "SCHOOL", "VISA", "WORK_ABROAD", "HOUSING", "EVENT"] as const;

export type PortalKindValue = (typeof PortalKindValues)[number];

export const PORTAL_KINDS: Record<PortalKindValue, { label: string; description: string }> = {
  GENERAL: {
    label: "General",
    description: "Not tied to any flow on the website. Shown on the portal only.",
  },
  SCHOOL: {
    label: "School and institution",
    description: "Applications opened from the school and institution pages (Proceed to apply).",
  },
  VISA: {
    label: "Visa",
    description: "Visa applications.",
  },
  WORK_ABROAD: {
    label: "Work abroad",
    description: "Work abroad and migration applications.",
  },
  HOUSING: {
    label: "Housing",
    description: "House and property applications.",
  },
  EVENT: {
    label: "Event",
    description: "Events and fairs. Collects visitor data at the event.",
  },
};

export const kindLabel = (kind: string) => PORTAL_KINDS[kind as PortalKindValue]?.label ?? kind;