import Link from "next/link";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/admin/status-badge";
import { SubmissionStatusValues } from "@/schemas";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = status && (SubmissionStatusValues as readonly string[]).includes(status) ? status : undefined;

  const submissions = await db.applicationSubmission.findMany({
    where: validStatus ? { status: validStatus as (typeof SubmissionStatusValues)[number] } : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      counselor: { select: { name: true } },
      application: { select: { name: true, terminal: { select: { name: true } } } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Submissions</h1>
        <p className="text-sm text-neutral-500">Every applicant attempt, across every application.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href="/admin/submissions"
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            !validStatus ? "border-neutral-900 bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50"
          )}
        >
          All
        </Link>
        {SubmissionStatusValues.map((s) => (
          <Link
            key={s}
            href={`/admin/submissions?status=${s}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              validStatus === s ? "border-neutral-900 bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50"
            )}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Application</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Counselor</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">
                  {s.user.name ?? "Unnamed"}
                  <div className="text-xs font-normal text-neutral-400">{s.user.email}</div>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {s.application.name}
                  <div className="text-xs text-neutral-400">{s.application.terminal.name}</div>
                  {s.targetName && (
                    <div className="text-xs font-medium text-neutral-600">
                      For {s.targetName}{s.targetCourseName ? `, ${s.targetCourseName}` : ""}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-neutral-500">{s.counselor?.name ?? s.counselorRequestName ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500">{s.updatedAt.toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/submissions/${s.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-teal)] hover:underline">
                    Review <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-neutral-400">No submissions {validStatus ? `with status "${validStatus.replace("_", " ")}"` : "yet"}.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}