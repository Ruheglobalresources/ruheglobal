import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StatusControl, CounselorControl } from "./status-control";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [submission, counselors] = await Promise.all([
    db.applicationSubmission.findUnique({
      where: { id },
      include: {
        user: true,
        counselor: true,
        application: { include: { terminal: true } },
        values: {
          include: { applicationField: { include: { fieldDefinition: true } } },
        },
      },
    }),
    db.user.findMany({ where: { role: { in: ["COUNSELOR", "ADMIN"] } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);

  if (!submission) notFound();

  const sortedValues = [...submission.values].sort(
    (a, b) => a.applicationField.stepNumber - b.applicationField.stepNumber || a.applicationField.order - b.applicationField.order
  );

  return (
    <div>
      <Link href="/admin/submissions" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:underline">
        <ArrowLeft size={12} /> All submissions
      </Link>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-xl font-semibold">{submission.user.name ?? "Unnamed applicant"}</h1>
          <p className="text-sm text-neutral-500">{submission.user.email}</p>
          <p className="mt-1 text-sm text-neutral-600">
            {submission.application.name} · {submission.application.terminal.name} · step {submission.currentStep}
          </p>
          {submission.counselorRequestName && (
            <p className="mt-1 text-xs text-neutral-400">Applicant mentioned prior contact with: {submission.counselorRequestName}</p>
          )}
        </div>
        <div className="space-y-3 rounded-xl border bg-white p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Status</label>
            <StatusControl submissionId={submission.id} status={submission.status} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Counselor</label>
            <CounselorControl submissionId={submission.id} counselorId={submission.counselorId} counselors={counselors} />
          </div>
          {submission.submittedAt && (
            <p className="text-xs text-neutral-400">Submitted {submission.submittedAt.toLocaleString()}</p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Answers</h2>
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3">Step</th>
                <th className="px-4 py-3">Field</th>
                <th className="px-4 py-3">Answer</th>
              </tr>
            </thead>
            <tbody>
              {sortedValues.map((v) => {
                const isFile = v.applicationField.fieldDefinition.type === "IMAGE" || v.applicationField.fieldDefinition.type === "FILE";
                return (
                  <tr key={v.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-neutral-500">{v.applicationField.stepNumber}</td>
                    <td className="px-4 py-3 font-medium">{v.applicationField.fieldDefinition.label}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {isFile && v.fileUrl ? (
                        v.applicationField.fieldDefinition.type === "IMAGE" ? (
                          <a href={v.fileUrl} target="_blank" rel="noreferrer">
                            <Image src={v.fileUrl} alt={v.applicationField.fieldDefinition.label} width={64} height={64} className="rounded-md object-cover" />
                          </a>
                        ) : (
                          <a href={v.fileUrl} target="_blank" rel="noreferrer" className="text-[color:var(--color-teal)] hover:underline">
                            View file
                          </a>
                        )
                      ) : (
                        v.value ?? <span className="text-neutral-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sortedValues.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-400">No answers submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
