import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/require-admin-page";
import { ArrowLeft } from "lucide-react";
import { InstitutionForm } from "../../institution-form";

export default async function EditInstitutionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  const institution = await db.institution.findUnique({ where: { id } });
  if (!institution) notFound();

  return (
    <div>
      <Link
        href="/admin/institutions"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={14} /> Back to institutions
      </Link>

      <h1 className="mb-6 text-xl font-semibold">Edit institution</h1>

      <InstitutionForm institution={institution} />
    </div>
  );
}
