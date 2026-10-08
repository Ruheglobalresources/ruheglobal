import Link from "next/link";
import { db } from "@/lib/db";
import { TerminalForm } from "./terminal-form";
import { TerminalRowActions } from "@/components/admin/terminal-row-actions";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { toggleTerminalActive } from "@/actions";
import { kindLabel } from "@/constants/portal-kinds";

export const dynamic = "force-dynamic";

export default async function AdminTerminalsPage() {
  const terminals = await db.portalTerminal.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Terminals</h1>
          <p className="text-sm text-neutral-500">
            The top-level sections applicants see on the portal — Exams &amp; Prep, Work &amp; Migration, Study Abroad, and so on.
          </p>
        </div>
        <TerminalForm />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Used for</th>
              <th className="px-4 py-3">Applications</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {terminals.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{t.icon ? `${t.icon} ` : ""}{t.name}</td>
                <td className="px-4 py-3 text-neutral-500">{kindLabel(t.kind)}</td>
                <td className="px-4 py-3 text-neutral-500">
                  <Link href={`/admin/applications?terminal=${t.id}`} className="hover:underline">
                    {t._count.applications}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500">{t.order}</td>
                <td className="px-4 py-3">
                  {/* action is a Server Action bound with BOTH the id and the target
                      (flipped) state — ActiveToggle only ever calls action(id), so the
                      new value has to be pre-baked here rather than computed client-side */}
                  <ActiveToggle
                    checked={t.isActive}
                    action={toggleTerminalActive.bind(null, t.id, !t.isActive)}
                    id={t.id}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <TerminalRowActions terminal={t} />
                </td>
              </tr>
            ))}
            {terminals.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No terminals yet — add your first one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}