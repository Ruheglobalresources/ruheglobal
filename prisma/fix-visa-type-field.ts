// prisma/fix-visa-type-field.ts
// Turns the "Visa type applying for" question into a select that reads the VisaType table,
// the same way "Destination country" reads the Destination table.
//
// Why this is needed: the question row "visa_type" was first created by prisma/seed-fields.ts as a
// plain TEXT field. prisma/seed-eligibility.ts never changes a row that already exists, so the
// better definition in prisma/data/eligibility-questions.ts was never applied. The database still
// holds the old TEXT field, which is why the form shows a plain box and not a list.
//
// What it does (safe to run more than once):
//   1. visa_type          becomes a SELECT whose choices are the visas of the chosen destination
//   2. destination_country becomes a SELECT that reads the Destination table, so the names always
//                          match the VisaType rows (the visa list is found by destination name)
//
// Run with:  npx tsx prisma/fix-visa-type-field.ts

import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const [visa, destination] = await Promise.all([
    db.fieldDefinition.findUnique({ where: { key: "visa_type" } }),
    db.fieldDefinition.findUnique({ where: { key: "destination_country" } }),
  ]);

  if (!visa) throw new Error('The question "visa_type" does not exist. Run npm run seed:eligibility first.');
  if (!destination) throw new Error('The question "destination_country" does not exist. Run npm run seed:eligibility first.');

  console.log(
    `Before: visa_type is ${visa.type} / ${visa.optionsSource} / ${visa.display}, ` +
      `destination_country is ${destination.type} / ${destination.optionsSource} / ${destination.display}`
  );

  // 1. Destination: choices come from the Destination table
  await db.fieldDefinition.update({
    where: { key: "destination_country" },
    data: {
      type: "SELECT",
      display: "SEARCH",
      optionsSource: "DESTINATIONS",
      dependsOnKey: null,
      alsoDependsOnKey: null,
      options: Prisma.DbNull,
    },
  });

  // 2. Visa type: choices come from the VisaType table, for the destination picked above.
  //    alsoDependsOnKey stays empty, so every active visa of that destination is listed.
  await db.fieldDefinition.update({
    where: { key: "visa_type" },
    data: {
      type: "SELECT",
      display: "SEARCH",
      optionsSource: "VISA_TYPES",
      dependsOnKey: "destination_country",
      alsoDependsOnKey: null,
      allowOther: false,
      otherLabel: null,
      options: Prisma.DbNull,
      placeholder: null,
    },
  });

  // 3. A quick check that the data behind the list is there
  const destinations = await db.destination.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { name: true, _count: { select: { visaTypes: { where: { isActive: true } } } } },
  });

  console.log("\nActive visa types per destination:");
  for (const d of destinations) console.log(`  ${d.name}: ${d._count.visaTypes}`);

  const empty = destinations.filter((d) => d._count.visaTypes === 0).map((d) => d.name);
  if (empty.length > 0) {
    console.log(`\nThese destinations have no visa types yet, so people there will see "Not sure yet": ${empty.join(", ")}`);
  }

  // 4. Is the question actually placed on the Visa Application check?
  const placed = await db.applicationField.findMany({
    where: { fieldDefinitionId: visa.id },
    select: { stepNumber: true, isRequired: true, application: { select: { name: true } } },
  });
  console.log(
    "\nvisa_type is placed on: " +
      (placed.length ? placed.map((p) => `${p.application.name} (step ${p.stepNumber})`).join(", ") : "no application")
  );

  console.log("\nDone. Reload the eligibility check and pick a destination: the visa list loads from the database.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });