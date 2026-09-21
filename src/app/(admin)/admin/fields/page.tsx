import { db } from "@/lib/db";
import { FieldForm } from "./field-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteField } from "@/actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminFieldsPage() {
  const fields = await db.fieldDefinition.findMany({
    orderBy: [{ category: "asc" }, { label: "asc" }],
    include: { _count: { select: { applicationFields: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Field Library</h1>
          <p className="text-sm text-neutral-500">
            Every input a form could ask for — attach whichever ones an application needs from its detail page.
          </p>
        </div>
        <FieldForm />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Used on</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{f.label}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-500">{f.key}</td>
                <td className="px-4 py-3 text-neutral-500">{f.category}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{f.type.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3 text-neutral-500">{f._count.applicationFields} application(s)</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <FieldForm field={f as any} />
                    {/* bound server action — not a closure — so it can cross to the Client Component */}
                    <DeleteButton action={deleteField.bind(null, f.id)} confirmMessage="Are you sure?" />
                  </div>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No fields yet — add your first one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}