import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/require-admin-page";
import { toggleInstitutionActive } from "@/actions/institutions";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { InstitutionRowActions } from "./institution-row-actions";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminInstitutionsPage() {
  await requireAdminPage();

  const institutions = await db.institution.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Institutions</h1>
          <p className="text-sm text-neutral-500">
            The institution catalog behind course search — shown alongside live AI-search results.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/institutions/new">
            <Plus size={16} className="mr-1" /> Add institution
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Institution</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((inst) => (
              <tr key={inst.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      {inst.imageUrl ? (
                        <Image src={inst.imageUrl} alt="" fill className="object-cover" sizes="56px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <Building2 size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <Link href={`/admin/institutions/${inst.id}/edit`} className="font-medium hover:underline">
                        {inst.name}
                      </Link>
                      <p className="text-xs text-neutral-400">{inst.city ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-500">{inst.country ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500">{inst.institutionType ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500">{inst.order}</td>
                <td className="px-4 py-3">
                  <ActiveToggle
                    checked={inst.isActive}
                    action={toggleInstitutionActive.bind(null, inst.id, !inst.isActive)}
                    id={inst.id}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <InstitutionRowActions institution={inst} />
                </td>
              </tr>
            ))}
            {institutions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  No institutions yet — add your first one above, or run{" "}
                  <code className="rounded bg-neutral-100 px-1 py-0.5">npm run seed:institutions</code>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
