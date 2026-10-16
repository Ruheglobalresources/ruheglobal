// prisma/seed-journey.ts
// Gives applications their timeline (the application engine): stages, the tasks of each stage and
// the details inputs of each task. The journeys are described in prisma/data/journeys/*.ts.
//
// Safe to run any time: rows are matched by stage number / task slug and are NEVER changed once
// they exist, so anything edited in the database afterwards survives a re-run. New stages, tasks
// and inputs are added. Nothing is ever deleted.
//
// Run with:  npx tsx prisma/seed-journey.ts            (every journey)
//            npx tsx prisma/seed-journey.ts school     (only data/journeys/school.ts)
//
// A new journey: copy data/journeys/school.ts, describe its stages, add it to JOURNEYS below.

import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { JourneySeed } from "./data/journeys/types";
import { SCHOOL_JOURNEY } from "./data/journeys/school";

// file name -> journey. Add the journeys of the visa, accommodation... terminals here.
const JOURNEYS: Record<string, JourneySeed> = {
  school: SCHOOL_JOURNEY,
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function seedJourney(journey: JourneySeed) {
  // 1. which application gets the timeline
  const application =
    "kind" in journey.application
      ? await db.application.findFirst({
          // the same pick as the "Proceed to apply" door (app/portal/applications/new/route.ts)
          where: { kind: journey.application.kind, isActive: true, terminal: { isActive: true } },
          orderBy: [{ terminal: { order: "asc" } }, { order: "asc" }],
        })
      : await db.application.findFirst({
          where: { slug: journey.application.slug, terminal: { slug: journey.application.terminalSlug } },
        });
  if (!application) {
    throw new Error(`${journey.name}: no application found for ${JSON.stringify(journey.application)}. Seed the terminals first.`);
  }

  // 2. questions that are not in the library yet
  for (const f of journey.extraFields ?? []) {
    await db.fieldDefinition.upsert({
      where: { key: f.key },
      update: {},
      create: {
        key: f.key,
        label: f.label,
        type: f.type,
        category: f.category,
        placeholder: f.placeholder,
        helpText: f.helpText,
        options: f.options,
        display: f.display ?? "DEFAULT",
        optionsSource: f.optionsSource ?? "STATIC",
        dependsOnKey: f.dependsOnKey,
        maxSelections: f.maxSelections,
        suggestions: f.suggestions,
        pattern: f.pattern,
      },
    });
  }

  // every input the journey uses must exist in the library: a typo should stop the seed, not
  // silently leave a task without its input
  const usedKeys = [...new Set(journey.stages.flatMap((s) => s.tasks.flatMap((t) => (t.fields ?? []).map((f) => f.key))))];
  const definitions = await db.fieldDefinition.findMany({ where: { key: { in: usedKeys } }, select: { id: true, key: true } });
  const definitionId = new Map(definitions.map((d) => [d.key, d.id]));
  const missing = usedKeys.filter((key) => !definitionId.has(key));
  if (missing.length > 0) {
    throw new Error(
      `${journey.name}: these inputs are not in the field library: ${missing.join(", ")}. ` +
        `Run seed:fields and seed:eligibility first, or add them under extraFields.`
    );
  }

  // 3. stages, tasks and inputs
  let stagesAdded = 0;
  let tasksAdded = 0;

  for (const stage of journey.stages) {
    const before = await db.applicationStage.findUnique({
      where: { applicationId_stageNumber: { applicationId: application.id, stageNumber: stage.number } },
      select: { id: true },
    });
    const stageRow = await db.applicationStage.upsert({
      where: { applicationId_stageNumber: { applicationId: application.id, stageNumber: stage.number } },
      update: {},
      create: {
        applicationId: application.id,
        stageNumber: stage.number,
        slug: stage.slug,
        title: stage.title,
        description: stage.description,
        completion: stage.completion,
      },
    });
    if (!before) stagesAdded++;

    for (const [index, task] of stage.tasks.entries()) {
      const existing = await db.applicationTask.findUnique({
        where: { applicationId_slug: { applicationId: application.id, slug: task.slug } },
        select: { id: true },
      });

      const taskRow =
        existing ??
        (await db.applicationTask.create({
          data: {
            applicationId: application.id,
            stageId: stageRow.id,
            slug: task.slug,
            groupTitle: task.group,
            subgroupTitle: task.subgroup,
            title: task.title,
            description: task.description,
            kind: task.kind ?? "DOCUMENT",
            isRequired: task.required ?? true,
            order: index,
            maxFiles: task.maxFiles ?? 10,
            accept: task.accept,
            showWhen: task.showWhen ? (task.showWhen as Prisma.InputJsonValue) : undefined,
            qualificationLevel: task.qualificationLevel,
          },
        }));
      if (!existing) tasksAdded++;

      for (const [fieldIndex, field] of (task.fields ?? []).entries()) {
        await db.applicationTaskField.upsert({
          where: { taskId_fieldDefinitionId: { taskId: taskRow.id, fieldDefinitionId: definitionId.get(field.key)! } },
          update: {},
          create: {
            taskId: taskRow.id,
            fieldDefinitionId: definitionId.get(field.key)!,
            isRequired: field.required ?? false,
            order: fieldIndex,
            showWhen: field.showWhen ? (field.showWhen as Prisma.InputJsonValue) : undefined,
          },
        });
      }
    }
  }

  console.log(`${journey.name} (${application.name}): ${stagesAdded} stages and ${tasksAdded} tasks added.`);
}

async function main() {
  const wanted = process.argv[2];
  const names = wanted ? [wanted] : Object.keys(JOURNEYS);

  for (const name of names) {
    const journey = JOURNEYS[name];
    if (!journey) throw new Error(`Unknown journey "${name}". Known: ${Object.keys(JOURNEYS).join(", ")}`);
    await seedJourney(journey);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });