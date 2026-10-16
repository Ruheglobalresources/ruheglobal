// src/lib/journey/progress.ts
// Progress of timeline submissions for the lists (dashboard "continue" strip, My applications).
// A classic application counts answered required inputs; a timeline application counts stages and
// tasks, so the lists ask this first and fall back to the old calculation for everything else.
// Definitions are loaded once per application and the applicant once, however many submissions.
import { db } from "@/lib/db";
import { computeJourney } from "./engine";
import { buildJourneyContext } from "./context";
import { loadApplicantSource, loadJourneyDefinition, loadJourneyEntries } from "./data";

export type ProgressItem = { id: string; applicationId: string; courseLevel: string | null };

// submission id -> percent, only for submissions of applications that have stages
export async function getJourneyPercents(userId: string, items: ProgressItem[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (items.length === 0) return out;

  const applicationIds = [...new Set(items.map((i) => i.applicationId))];
  const counts = await db.applicationStage.groupBy({
    by: ["applicationId"],
    where: { applicationId: { in: applicationIds } },
    _count: { _all: true },
  });
  const journeyApps = counts.filter((c) => c._count._all > 0).map((c) => c.applicationId);
  if (journeyApps.length === 0) return out;

  const journeyItems = items.filter((i) => journeyApps.includes(i.applicationId));

  const [source, definitions, entries] = await Promise.all([
    loadApplicantSource(userId),
    Promise.all(journeyApps.map(async (id) => [id, await loadJourneyDefinition(id)] as const)),
    Promise.all(journeyItems.map((i) => loadJourneyEntries(i.id))),
  ]);
  const stagesByApp = new Map(definitions);

  journeyItems.forEach((item, index) => {
    const stages = stagesByApp.get(item.applicationId) ?? [];
    const context = buildJourneyContext({ eligibility: source.eligibility, courseLevel: item.courseLevel });
    out.set(item.id, computeJourney({ stages, ...entries[index], context }).percent);
  });
  return out;
}