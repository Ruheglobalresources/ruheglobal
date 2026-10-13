// prisma/seed-eligibility.ts
// Seeds the eligibility check: the "Eligibility check" terminal (kind ELIGIBILITY, hidden from the
// portal home), one application per pill (Study Abroad, Visa Application, Accommodation, Work Abroad),
// the question library, and which questions each pill asks on which step.
// The questions are in prisma/data/eligibility-questions.ts.
//
// Safe to run any time: rows are matched by key / slug / step number and are NEVER changed once they
// exist, so anything edited in the admin afterwards survives a re-run. New rows are added.
//
// Run with:  npx tsx prisma/seed-eligibility.ts

import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { FIELDS, PILLS, TERMINAL } from "./data/eligibility-questions";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  // 1. The question library
  const definitions = new Map<string, string>(); // key -> FieldDefinition id
  for (const f of FIELDS) {
    const row = await db.fieldDefinition.upsert({
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
    definitions.set(f.key, row.id);
  }

  // 2. The terminal that holds the eligibility applications (not shown on the portal home)
  const terminal = await db.portalTerminal.upsert({
    where: { slug: TERMINAL.slug },
    update: {},
    create: { name: TERMINAL.name, slug: TERMINAL.slug, kind: "ELIGIBILITY", order: TERMINAL.order, isVisible: false },
  });

  // 3. One application per pill, with its steps and the questions on each step
  for (const pill of PILLS) {
    const application = await db.application.upsert({
      where: { terminalId_slug: { terminalId: terminal.id, slug: pill.slug } },
      update: {},
      create: {
        terminalId: terminal.id,
        kind: "ELIGIBILITY",
        name: pill.name,
        subtitle: pill.subtitle,
        slug: pill.slug,
        icon: pill.icon,
        order: pill.order,
      },
    });

    for (const step of pill.steps) {
      await db.applicationStep.upsert({
        where: { applicationId_stepNumber: { applicationId: application.id, stepNumber: step.number } },
        update: {},
        create: { applicationId: application.id, stepNumber: step.number, title: step.title, emoji: step.emoji },
      });

      for (const [index, field] of step.fields.entries()) {
        const fieldDefinitionId = definitions.get(field.key);
        if (!fieldDefinitionId) throw new Error(`Unknown question key "${field.key}" in "${pill.name}"`);

        await db.applicationField.upsert({
          where: { applicationId_fieldDefinitionId: { applicationId: application.id, fieldDefinitionId } },
          update: {},
          create: {
            applicationId: application.id,
            fieldDefinitionId,
            isRequired: field.required ?? false,
            stepNumber: step.number,
            order: index,
            showWhen: field.showWhen as unknown as Prisma.InputJsonValue | undefined,
          },
        });
      }
    }
  }

  const [questions, applications] = await Promise.all([
    db.applicationField.count({ where: { application: { terminalId: terminal.id } } }),
    db.application.count({ where: { terminalId: terminal.id } }),
  ]);
  console.log(`Eligibility terminal ready: ${applications} pills, ${questions} questions placed.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });