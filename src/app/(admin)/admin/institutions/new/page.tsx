import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin-page";
import { ArrowLeft } from "lucide-react";
import { InstitutionForm } from "../institution-form";

export default async function NewInstitutionPage() {
  await requireAdminPage();

  return (
    <div>
      <Link
        href="/admin/institutions"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={14} /> Back to institutions
      </Link>

      <h1 className="mb-6 text-xl font-semibold">Add institution</h1>

      <InstitutionForm />
    </div>
  );
}
