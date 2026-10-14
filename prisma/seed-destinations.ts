// prisma/seed-destinations.ts
// Seeds the Destination, City, VisaPurpose and VisaType tables from
//   prisma/data/destinations.ts  (countries people move to, with their major cities)
//   prisma/data/visa-types.ts    (the visa funnel: purposes, then the visas of each destination)
// These tables feed the Accommodation and Visa Application checks of the eligibility flow.
//
// Safe to run any time:
//   - rows are matched by name / code (destinations), by (destination, name) (cities),
//     by slug (purposes) and by (destination, slug) (visa types)
//   - a row that already exists is NEVER changed, so anything edited in the database afterwards
//     (a reworded summary, a changed order, a deactivated city) survives a re-run
//   - new destinations, cities and visas added to the data files are inserted
//
// Run with:  npm run seed:destinations

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DESTINATIONS } from "./data/destinations"
import { VISA_PURPOSES, VISA_TYPES } from "./data/visa-types"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

function checkData() {
  const names = new Set(DESTINATIONS.map((d) => d.name));
  const purposes = new Set<string>(VISA_PURPOSES.map((p) => p.slug));

  for (const name of Object.keys(VISA_TYPES)) {
    if (!names.has(name)) throw new Error(`visa-types.ts has a destination that is not in destinations.ts: "${name}"`);
  }
  for (const [name, list] of Object.entries(VISA_TYPES)) {
    const slugs = new Set<string>();
    for (const visa of list) {
      if (!purposes.has(visa.purpose)) throw new Error(`"${name}" / "${visa.name}" has an unknown purpose "${visa.purpose}"`);
      if (slugs.has(visa.slug)) throw new Error(`"${name}" has the visa slug "${visa.slug}" twice`);
      slugs.add(visa.slug);
    }
  }
  for (const d of DESTINATIONS) {
    const seen = new Set<string>();
    for (const [city] of d.cities) {
      if (seen.has(city)) throw new Error(`"${d.name}" lists the city "${city}" twice`);
      seen.add(city);
    }
  }
}

async function main() {
  checkData();

  // 1. Destinations (existing ones are skipped, not updated)
  const destinations = await db.destination.createMany({
    data: DESTINATIONS.map((d, index) => ({ name: d.name, code: d.code, order: index + 1 })),
    skipDuplicates: true,
  });

  const rows = await db.destination.findMany({
    where: { name: { in: DESTINATIONS.map((d) => d.name) } },
    select: { id: true, name: true },
  });
  const idByName = new Map(rows.map((r) => [r.name, r.id]));

  // 2. Cities, under their destination, most chosen first
  let addedCities = 0;
  for (const destination of DESTINATIONS) {
    const destinationId = idByName.get(destination.name);
    if (!destinationId) continue;

    const result = await db.city.createMany({
      data: destination.cities.map(([name, region], index) => ({ destinationId, name, region, order: index + 1 })),
      skipDuplicates: true,
    });
    addedCities += result.count;
  }

  // 3. The goals of the visa funnel (existing ones are left alone)
  for (const purpose of VISA_PURPOSES) {
    await db.visaPurpose.upsert({
      where: { slug: purpose.slug },
      update: {},
      create: {
        slug: purpose.slug,
        name: purpose.name,
        goalLabel: purpose.goalLabel,
        description: purpose.description,
        emoji: purpose.emoji,
        order: purpose.order,
      },
    });
  }
  const purposeRows = await db.visaPurpose.findMany({ select: { id: true, slug: true } });
  const purposeIdBySlug = new Map(purposeRows.map((r) => [r.slug, r.id]));

  // 4. The visas of each destination, filed under the goal they serve
  let addedVisas = 0;
  for (const [destinationName, list] of Object.entries(VISA_TYPES)) {
    const destinationId = idByName.get(destinationName);
    if (!destinationId) continue;

    const result = await db.visaType.createMany({
      data: list.map((visa, index) => ({
        destinationId,
        purposeId: purposeIdBySlug.get(visa.purpose)!,
        slug: visa.slug,
        name: visa.name,
        summary: visa.summary,
        serviceSlug: visa.serviceSlug ?? null,
        order: index + 1,
      })),
      skipDuplicates: true,
    });
    addedVisas += result.count;
  }

  const [totalDestinations, totalCities, totalPurposes, totalVisas] = await Promise.all([
    db.destination.count(),
    db.city.count(),
    db.visaPurpose.count(),
    db.visaType.count(),
  ]);
  console.log(`Destinations added: ${destinations.count} (total ${totalDestinations})`);
  console.log(`Cities added: ${addedCities} (total ${totalCities})`);
  console.log(`Visa purposes: ${totalPurposes}`);
  console.log(`Visa types added: ${addedVisas} (total ${totalVisas})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });