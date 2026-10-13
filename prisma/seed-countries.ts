// prisma/seed-countries.ts
// Seeds the Country and University tables from prisma/data/african-universities.ts.
// These two tables feed the "Tell us your undergraduate story" step of the eligibility check
// (country of education, then the university under that country).
//
// Safe to run any time:
//   - rows are matched by country code and by (country, university name)
//   - a row that already exists is NEVER changed, so anything edited in the database afterwards
//     (a renamed university, a changed order, a deactivated country) survives a re-run
//   - new countries and new universities added to the data file are inserted
//
// Run with:  npm run seed:countries

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { AFRICAN_COUNTRIES } from "./data/african-universities";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure it is in your .env file at the project root.");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  // 1. Countries (existing ones are skipped, not updated)
  const countries = await db.country.createMany({
    data: AFRICAN_COUNTRIES.map((c) => ({
      code: c.code,
      name: c.name,
      region: c.region,
      continent: "Africa",
      order: c.order,
    })),
    skipDuplicates: true,
  });

  // 2. Universities, under their country (existing ones are skipped, not updated)
  const rows = await db.country.findMany({
    where: { code: { in: AFRICAN_COUNTRIES.map((c) => c.code) } },
    select: { id: true, code: true },
  });
  const idByCode = new Map(rows.map((r) => [r.code, r.id]));

  let addedUniversities = 0;
  for (const country of AFRICAN_COUNTRIES) {
    const countryId = idByCode.get(country.code);
    if (!countryId) continue;

    const result = await db.university.createMany({
      data: country.universities.map((entry, index) => ({
        countryId,
        name: entry.replace(/^~/, ""),
        ownership: entry.startsWith("~") ? ("PRIVATE" as const) : ("PUBLIC" as const),
        order: index,
      })),
      skipDuplicates: true,
    });
    addedUniversities += result.count;
  }

  const [totalCountries, totalUniversities] = await Promise.all([db.country.count(), db.university.count()]);
  console.log(`Countries added: ${countries.count} (total ${totalCountries})`);
  console.log(`Universities added: ${addedUniversities} (total ${totalUniversities})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });