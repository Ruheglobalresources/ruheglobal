import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/require-admin-page";
import { toggleSchoolActive } from "@/actions/schools";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { SchoolRowActions } from "./school-row-actions";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/constants/schools";
import { cn } from "@/lib/utils";
import { Plus, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  await requireAdminPage();
  const { country } = await searchParams;

  const schools = await db.school.findMany({
    orderBy: [{ country: "asc" }, { order: "asc" }, { name: "asc" }],
    include: { _count: { select: { courses: true, images: true } } },
  });

  // Group schools under their country. Countries follow the order (and flags)
  // defined in COUNTRIES; any country stored in the DB but missing from that
  // list is appended alphabetically so no school is ever hidden.
  const byCountry = new Map<string, typeof schools>();
  for (const s of schools) {
    const list = byCountry.get(s.country);
    if (list) list.push(s);
    else byCountry.set(s.country, [s]);
  }

  const known = COUNTRIES.filter((c) => byCountry.has(c.name));
  const knownNames = new Set(COUNTRIES.map((c) => c.name));
  const extra = [...byCountry.keys()]
    .filter((name) => !knownNames.has(name))
    .sort()
    .map((name) => ({ name, flag: "🌍" }));
  const countries = [...known, ...extra];

  // Ignore a ?country= value that has no schools, and fall back to "All".
  const activeCountry = country && byCountry.has(country) ? country : undefined;
  const visible = activeCountry ? countries.filter((c) => c.name === activeCountry) : countries;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Schools</h1>
          <p className="text-sm text-neutral-500">
            The schools shown in &ldquo;Top schools&rdquo; on the home page, each with its own page at /schools/slug.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/schools/new">
            <Plus size={16} className="mr-1" /> Add school
          </Link>
        </Button>
      </div>

      {/* country tabs */}
      {countries.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Link
            href="/admin/schools"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              !activeCountry ? "border-neutral-900 bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50"
            )}
          >
            All ({schools.length})
          </Link>
          {countries.map((c) => (
            <Link
              key={c.name}
              href={`/admin/schools?country=${encodeURIComponent(c.name)}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                activeCountry === c.name
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              {c.flag} {c.name} ({byCountry.get(c.name)!.length})
            </Link>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Courses</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => {
              const rows = byCountry.get(c.name) ?? [];
              return (
                <Fragment key={c.name}>
                  {/* country header row */}
                  <tr className="border-b bg-neutral-50/70">
                    <td colSpan={6} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                      <span className="mr-2">{c.flag}</span>
                      {c.name}
                      <span className="ml-2 font-normal normal-case text-neutral-400">
                        {rows.length} {rows.length === 1 ? "school" : "schools"}
                      </span>
                    </td>
                  </tr>
                  {rows.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                            {s.coverImage ? (
                              <Image src={s.coverImage} alt="" fill className="object-cover" sizes="56px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                                <GraduationCap size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link href={`/admin/schools/${s.id}/edit`} className="font-medium hover:underline">
                              {s.name}
                            </Link>
                            <p className="text-xs text-neutral-400">/schools/{s.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">{s._count.courses}</td>
                      <td className="px-4 py-3 text-neutral-500">{s._count.images}</td>
                      <td className="px-4 py-3 text-neutral-500">{s.order}</td>
                      <td className="px-4 py-3">
                        <ActiveToggle
                          checked={s.isActive}
                          action={toggleSchoolActive.bind(null, s.id, !s.isActive)}
                          id={s.id}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <SchoolRowActions school={{ id: s.id, name: s.name, slug: s.slug }} />
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
            {schools.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No schools yet, add your first one above, or run{" "}
                  <code className="rounded bg-neutral-100 px-1 py-0.5">npm run seed:schools</code>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}