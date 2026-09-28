import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdminPage } from "@/lib/require-admin-page";
import { ArrowLeft } from "lucide-react";
import { SchoolForm } from "../../school-form";

export default async function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  const school = await db.school.findUnique({
    where: { id },
    include: {
      courses: { orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" } },
    },
  });
  if (!school) notFound();

  return (
    <div>
      <Link
        href="/admin/schools"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={14} /> Back to schools
      </Link>

      <h1 className="mb-6 text-xl font-semibold">Edit school</h1>

      <SchoolForm school={school} />
    </div>
  );
}