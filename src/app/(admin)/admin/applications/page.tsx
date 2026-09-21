import Link from "next/link";
import { db } from "@/lib/db";
import { ApplicationForm } from "./application-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { deleteApplication, toggleApplicationActive, toggleApplicationLive } from "@/actions";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ terminal?: string }>;
}) {
  const { terminal: terminalFilter } = await searchParams;

  const [applications, terminals] = await Promise.all([
    db.application.findMany({
      where: terminalFilter ? { terminalId: terminalFilter } : undefined,
      orderBy: [{ terminal: { order: "asc" } }, { order: "asc" }],
      include: { terminal: true, _count: { select: { submissions: true, fields: true } } },
    }),
    db.portalTerminal.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  const activeTerminal = terminals.find((t) => t.id === terminalFilter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Applications</h1>
          <p className="text-sm text-neutral-500">
            {activeTerminal ? `Showing applications under "${activeTerminal.name}".` : "Everything an applicant can apply for, across every terminal."}
          </p>
        </div>
        <ApplicationForm terminals={terminals} defaultTerminalId={terminalFilter} />
      </div>

      {activeTerminal && (
        <Link href="/admin/applications" className="mb-4 inline-block text-xs font-medium text-neutral-500 hover:underline">
          ← Clear filter, show all terminals
        </Link>
      )}

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Terminal</th>
              <th className="px-4 py-3">Fields</th>
              <th className="px-4 py-3">Submissions</th>
              <th className="px-4 py-3">Live</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/applications/${a.id}`} className="flex items-center gap-1 hover:underline">
                    {a.icon ? `${a.icon} ` : ""}{a.name}
                    <ArrowRight size={12} className="text-neutral-400" />
                  </Link>
                  {a.badge && <Badge variant="secondary" className="mt-1">{a.badge}</Badge>}
                </td>
                <td className="px-4 py-3 text-neutral-500">{a.terminal.name}</td>
                <td className="px-4 py-3 text-neutral-500">{a._count.fields}</td>
                <td className="px-4 py-3 text-neutral-500">{a._count.submissions}</td>
                <td className="px-4 py-3"> <ActiveToggle id={a.id} checked={a.isLive} action={toggleApplicationLive.bind(null, a.id, !a.isLive)} /> </td>
                <td className="px-4 py-3"> <ActiveToggle id={a.id} checked={a.isActive} action={toggleApplicationActive.bind(null, a.id, !a.isActive)} /> </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <ApplicationForm terminals={terminals} application={a} />
                    {/* bound server action — not a closure — so it can cross to the Client Component */}
                    <DeleteButton action={deleteApplication.bind(null, a.id)} confirmMessage={`Delete "${a.name}"?`} />
                  </div>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-400">No applications yet — add your first one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
