import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getApplicationInputsView } from "@/lib/application-inputs-data";
import { ApplicationInputs } from "@/components/admin/application-inputs";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ApplicationForm } from "@/app/(admin)/admin/applications/application-form";

export const dynamic = "force-dynamic";

export default async function TerminalFieldsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [terminal, applications] = await Promise.all([
    db.portalTerminal.findUnique({ where: { id } }),
    db.application.findMany({
      where: { terminalId: id },
      orderBy: { order: "asc" },
      include: { _count: { select: { fields: true } } },
    }),
  ]);

  if (!terminal) notFound();

  const BackLink = () => (
    <Link
      href="/admin/terminals"
      className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:underline"
    >
      <ArrowLeft size={12} /> Terminals
    </Link>
  );

  // No application under this terminal yet. Most terminals only need one (the application
  // effectively is the form for that terminal), so this is the common first step, not a dead end.
  if (applications.length === 0) {
    return (
      <div>
        <BackLink />
        <div className="rounded-xl border border-dashed bg-white p-8 text-center">
          <p className="mb-1 font-medium">No application yet under &quot;{terminal.name}&quot;</p>
          <p className="mb-4 text-sm text-neutral-500">
            Create one first, then come back here to pick its inputs.
          </p>
          <div className="flex justify-center">
            <ApplicationForm terminals={[{ id: terminal.id, name: terminal.name }]} defaultTerminalId={terminal.id} />
          </div>
        </div>
      </div>
    );
  }

  // Exactly one application (the common case): manage its inputs right here.
  if (applications.length === 1) {
    const application = applications[0];
    const inputs = await getApplicationInputsView(application.id);
    if (!inputs) notFound();

    return (
      <div>
        <BackLink />
        <div className="mb-6">
          <h1 className="text-xl font-semibold">
            {terminal.icon ? `${terminal.icon} ` : ""}Inputs: {terminal.name}
          </h1>
          <p className="text-sm text-neutral-500">
            The inputs applicants fill out for &quot;{application.name}&quot;.
          </p>
        </div>
        <ApplicationInputs view={inputs} />
      </div>
    );
  }

  // Several applications under this terminal: pick which one.
  return (
    <div>
      <BackLink />
      <div className="mb-6">
        <h1 className="text-xl font-semibold">
          {terminal.name} has {applications.length} applications
        </h1>
        <p className="text-sm text-neutral-500">Pick one to manage its inputs.</p>
      </div>
      <div className="space-y-2">
        {applications.map((a) => (
          <Link
            key={a.id}
            href={`/admin/applications/${a.id}`}
            className="flex items-center justify-between rounded-xl border bg-white p-4 hover:border-neutral-300"
          >
            <div>
              <p className="font-medium">
                {a.icon ? `${a.icon} ` : ""}
                {a.name}
              </p>
              <p className="text-xs text-neutral-500">{a._count.fields} input(s)</p>
            </div>
            <ArrowRight size={14} className="text-neutral-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}