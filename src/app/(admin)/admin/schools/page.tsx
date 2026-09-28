import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/require-admin-page";
import { toggleSchoolActive } from "@/actions/schools";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { SchoolRowActions } from "./school-row-actions";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  await requireAdminPage();

  const schools = await db.school.findMany({
    orderBy: [{ country: "asc" }, { order: "asc" }, { name: "asc" }],
    include: { _count: { select: { courses: true, images: true } } },
  });

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

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Courses</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((s) => (
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
                <td className="px-4 py-3 text-neutral-500">{s.country}</td>
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
            {schools.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
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