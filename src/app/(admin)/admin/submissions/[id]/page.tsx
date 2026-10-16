import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StatusControl, CounselorControl } from "./status-control";
import { JourneyReviewSection } from "@/components/admin/journey-review-section";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

// One answer inside a saved version (see model SubmissionVersion)
type SnapshotAnswer = {
  applicationFieldId: string;
  label: string;
  type: string;
  stepNumber: number;
  order: number;
  value: string | null;
  fileUrl: string | null;
};

type PreviousAnswer = { version: number; savedAt: Date; value: string | null; fileUrl: string | null };

type Row = {
  fieldId: string;
  label: string;
  type: string;
  stepNumber: number;
  order: number;
  current: { value: string | null; fileUrl: string | null; id: string } | null;
  previous: PreviousAnswer[]; // newest first, only answers that differ from the current one
};

const isFileType = (type: string) => type === "IMAGE" || type === "FILE";
const hasContent = (a: { value: string | null; fileUrl: string | null } | null | undefined) =>
  !!(a && (a.value?.trim() || a.fileUrl));
const sameAnswer = (
  a: { value: string | null; fileUrl: string | null } | null | undefined,
  b: { value: string | null; fileUrl: string | null } | null | undefined
) => (a?.value?.trim() || null) === (b?.value?.trim() || null) && (a?.fileUrl || null) === (b?.fileUrl || null);

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
        versions: { orderBy: { version: "asc" } },
      },
    }),
    db.user.findMany({ where: { role: { in: ["COUNSELOR", "ADMIN"] } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);

  if (!submission) notFound();

  // an application that runs on the timeline is reviewed in the timeline panel
  const hasJourney = (await db.applicationStage.count({ where: { applicationId: submission.applicationId } })) > 0;

  const versions = submission.versions.map((v) => ({
    version: v.version,
    createdAt: v.createdAt,
    answers: (Array.isArray(v.answers) ? v.answers : []) as unknown as SnapshotAnswer[],
  }));
  const lastVersion = versions[versions.length - 1] ?? null;

  // One row per field: what it says now, and every earlier answer that was different.
  const rows = new Map<string, Row>();

  for (const v of submission.values) {
    const def = v.applicationField.fieldDefinition;
    rows.set(v.applicationFieldId, {
      fieldId: v.applicationFieldId,
      label: def.label,
      type: def.type,
      stepNumber: v.applicationField.stepNumber,
      order: v.applicationField.order,
      current: { value: v.value, fileUrl: v.fileUrl, id: v.id },
      previous: [],
    });
  }

  // fields that were answered in an earlier version but are empty or missing now still get a row
  for (const version of versions) {
    for (const a of version.answers) {
      if (!rows.has(a.applicationFieldId)) {
        rows.set(a.applicationFieldId, {
          fieldId: a.applicationFieldId,
          label: a.label,
          type: a.type,
          stepNumber: a.stepNumber,
          order: a.order,
          current: null,
          previous: [],
        });
      }
    }
  }

  for (const row of rows.values()) {
    const history: PreviousAnswer[] = [];
    for (const version of versions) {
      const answer = version.answers.find((a) => a.applicationFieldId === row.fieldId);
      if (!hasContent(answer)) continue;
      const last = history[history.length - 1];
      // consecutive versions with the same answer are one entry
      if (last && sameAnswer(last, answer)) continue;
      history.push({ version: version.version, savedAt: version.createdAt, value: answer!.value, fileUrl: answer!.fileUrl });
    }
    row.previous = history.filter((h) => !sameAnswer(h, row.current)).reverse();
  }

  const sortedRows = Array.from(rows.values())
    .filter((r) => hasContent(r.current) || r.previous.length > 0)
    .sort((a, b) => a.stepNumber - b.stepNumber || a.order - b.order);

  const answerChangedCount = sortedRows.filter((r) => r.previous.length > 0).length;
  // true when any saved answer is different from what the last submit sent
  const editedSinceLastSubmit =
    !!lastVersion &&
    Array.from(rows.values()).some(
      (r) => !sameAnswer(r.current, lastVersion.answers.find((a) => a.applicationFieldId === r.fieldId))
    );

  const renderAnswer = (type: string, value: string | null, fileUrl: string | null, label: string, asImage: boolean) => {
    if (isFileType(type) && fileUrl) {
      return asImage && type === "IMAGE" ? (
        <a href={fileUrl} target="_blank" rel="noreferrer">
          <Image src={fileUrl} alt={label} width={64} height={64} className="rounded-md object-cover" />
        </a>
      ) : (
        <a href={fileUrl} target="_blank" rel="noreferrer" className="text-[color:var(--color-teal)] hover:underline">
          View file
        </a>
      );
    }
    return value?.trim() ? value : <span className="text-neutral-300">Empty</span>;
  };

  return (
    <div>
      <Link href="/admin/submissions" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:underline">
        <ArrowLeft size={12} /> All submissions
      </Link>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-xl font-semibold">
            <Link href={`/admin/users/${submission.user.id}`} className="hover:underline">{submission.user.name ?? "Unnamed applicant"}</Link>
          </h1>
          <p className="text-sm text-neutral-500">{submission.user.email}</p>
          <p className="mt-1 text-sm text-neutral-600">
            {submission.application.name} · {submission.application.terminal.name} · step {submission.currentStep}
          </p>
          {submission.targetName && (
            <p className="mt-1 text-sm font-medium text-neutral-800">
              Applying to {submission.targetName}{submission.targetCourseName ? `, ${submission.targetCourseName}` : ""}
            </p>
          )}
          {submission.counselorRequestName && (
            <p className="mt-1 text-xs text-neutral-400">Applicant mentioned prior contact with: {submission.counselorRequestName}</p>
          )}

          {versions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-700">
                Sent {versions.length} {versions.length === 1 ? "time" : "times"}
              </span>
              {editedSinceLastSubmit && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-700">
                  Edited since last submit
                </span>
              )}
              {answerChangedCount > 0 && (
                <span className="text-neutral-500">
                  {answerChangedCount} {answerChangedCount === 1 ? "answer has" : "answers have"} earlier versions
                </span>
              )}
            </div>
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
            <p className="text-xs text-neutral-400">First submitted {submission.submittedAt.toLocaleString()}</p>
          )}
          {lastVersion && versions.length > 1 && (
            <p className="text-xs text-neutral-400">Last submitted {lastVersion.createdAt.toLocaleString()}</p>
          )}
        </div>
      </div>

      {hasJourney && <JourneyReviewSection submissionId={submission.id} />}

      {(!hasJourney || sortedRows.length > 0) && (
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
              {sortedRows.map((row) => (
                <tr key={row.fieldId} className="border-b align-top last:border-0">
                  <td className="px-4 py-3 text-neutral-500">{row.stepNumber}</td>
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {hasContent(row.current) ? (
                      renderAnswer(row.type, row.current!.value, row.current!.fileUrl, row.label, true)
                    ) : (
                      <span className="text-neutral-300">Now empty</span>
                    )}

                    {row.previous.length > 0 && (
                      <details className="mt-2 rounded-lg border bg-neutral-50 px-3 py-2 text-xs">
                        <summary className="cursor-pointer font-medium text-[color:var(--color-teal)]">
                          View previous answers ({row.previous.length})
                        </summary>
                        <ul className="mt-2 space-y-2">
                          {row.previous.map((p) => (
                            <li key={p.version} className="border-t pt-2 first:border-t-0 first:pt-0">
                              <p className="text-neutral-400">
                                Version {p.version} · {p.savedAt.toLocaleString()}
                              </p>
                              <div className="mt-0.5 text-neutral-700">
                                {renderAnswer(row.type, p.value, p.fileUrl, row.label, false)}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
              {sortedRows.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-400">No answers submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {versions.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">Submission history</h2>
          <ul className="space-y-1.5 rounded-xl border bg-white p-4 text-sm">
            {[...versions].reverse().map((v) => (
              <li key={v.version} className="flex items-center justify-between gap-3">
                <span className="font-medium text-neutral-700">Version {v.version}</span>
                <span className="text-xs text-neutral-400">
                  {v.createdAt.toLocaleString()} · {v.answers.length} {v.answers.length === 1 ? "answer" : "answers"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}