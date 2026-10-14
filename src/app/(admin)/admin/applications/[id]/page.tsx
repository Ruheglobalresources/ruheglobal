//src/app/(admin)/admin/applications/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getApplicationInputsView } from "@/lib/application-inputs-data";
import { ApplicationForm } from "../application-form";
import { TagForm } from "./tag-form";
import { ApplicationInputs } from "@/components/admin/application-inputs";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteTag } from "@/actions";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [application, terminals, inputs] = await Promise.all([
    db.application.findUnique({
      where: { id },
      include: {
        terminal: true,
        tags: { orderBy: { order: "asc" } },
        _count: { select: { submissions: true } },
      },
    }),
    db.portalTerminal.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    getApplicationInputsView(id),
  ]);

  if (!application || !inputs) notFound();

  return (
    <div>
      <Link href="/admin/applications" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:underline">
        <ArrowLeft size={12} /> All applications
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{application.icon ? `${application.icon} ` : ""}{application.name}</h1>
          <p className="text-sm text-neutral-500">
            {application.terminal.name} · {application._count.submissions} submission(s)
          </p>
          {application.subtitle && <p className="mt-1 text-sm text-neutral-600">{application.subtitle}</p>}
        </div>
        <ApplicationForm terminals={terminals} application={application} />
      </div>

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">Tags</h2>
          <TagForm applicationId={application.id} />
        </div>
        <div className="flex flex-wrap gap-2 rounded-xl border bg-white p-4">
          {application.tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-1">
              <TagForm applicationId={application.id} tag={tag} />
              {/* bound server action, not a closure, so it can cross to the Client Component */}
              <DeleteButton
                action={deleteTag.bind(null, tag.id, application.id)}
                confirmMessage="Remove this tag? This can't be undone."
                title="Remove tag?"
              />
            </div>
          ))}
          {application.tags.length === 0 && <p className="text-sm text-neutral-400">No tags yet. These show as pills on the application card.</p>}
        </div>
      </section>

      <ApplicationInputs view={inputs} />
    </div>
  );
}