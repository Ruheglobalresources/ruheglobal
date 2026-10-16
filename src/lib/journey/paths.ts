// src/lib/journey/paths.ts
// Addresses of the timeline and its task pages. The "?submission=" part names the applicant's
// saved submission; before the first save there is none, so a school application carries its
// target (school or institution, and course) in the address instead, the same way the
// "Proceed to apply" link does (see lib/apply-link.ts).
import type { ApplyTargetInput } from "@/lib/application-target";

export type JourneyPathContext = {
  terminalSlug: string;
  applicationSlug: string;
  submissionId?: string | null;
  target?: ApplyTargetInput | null;
};

function query(ctx: JourneyPathContext, extra: Record<string, string | number | null | undefined> = {}) {
  const params = new URLSearchParams();
  if (ctx.submissionId) {
    params.set("submission", ctx.submissionId);
  } else if (ctx.target) {
    params.set("type", ctx.target.type);
    params.set("target", ctx.target.slug);
    if (ctx.target.courseId) params.set("course", ctx.target.courseId);
  }
  for (const [key, value] of Object.entries(extra)) {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

export const journeyHref = (ctx: JourneyPathContext, stageNumber?: number | null) =>
  `/portal/${ctx.terminalSlug}/${ctx.applicationSlug}${query(ctx, { stage: stageNumber })}`;

export const taskHref = (ctx: JourneyPathContext, taskSlug: string) =>
  `/portal/${ctx.terminalSlug}/${ctx.applicationSlug}/tasks/${taskSlug}${query(ctx)}`;