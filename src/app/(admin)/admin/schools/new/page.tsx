import Link from "next/link";
import { requireAdminPage } from "@/lib/require-admin-page";
import { ArrowLeft } from "lucide-react";
import { SchoolForm } from "../school-form";

export default async function NewSchoolPage() {
  await requireAdminPage();

  return (
    <div>
      <Link
        href="/admin/schools"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={14} /> Back to schools
      </Link>

      <h1 className="mb-6 text-xl font-semibold">Add school</h1>

      <SchoolForm />
    </div>
  );
}