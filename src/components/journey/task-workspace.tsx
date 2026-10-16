"use client";

// src/components/journey/task-workspace.tsx
// The page of one document (Passport, Graduation Certificate...), laid out like the Edvoy upload
// page: the pages of the document down the left with an Add button, the document itself in the
// middle, and "Fill in your details" on the right. The details start filled with what the
// applicant told us before (nationality and so on). Save changes sends the document to the
// counsellor; if something is still missing it is kept as a draft and says what is missing.
//
// It is a body of the portal page, not a modal. Everything it draws is reused: FlowFieldInput for
// the details (the same inputs as the eligibility check), uploadPortalFile for the upload and
// saveJourneyTask for the save.
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, FileText, Loader2, Lock, Plus, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlowFieldInput } from "@/components/step-flow/flow-field";
import { saveJourneyTask } from "@/actions/journey";
import { uploadPortalFile } from "@/lib/upload-portal-file";
import { cn } from "@/lib/utils";
import { fieldError, type AnswerMap } from "@/lib/eligibility";
import { visibleTaskFields } from "@/lib/journey/engine";
import { journeyHref, taskHref, type JourneyPathContext } from "@/lib/journey/paths";
import type { ApplyTargetInput } from "@/lib/application-target";
import type { JourneyFile, JourneyTaskDef, TaskStateValue } from "@/lib/journey/types";
import { TaskStatusBadge } from "./task-status";
import { useDependentOptions, withAnswer } from "./use-dependent-options";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const DEFAULT_ACCEPT = "image/*,application/pdf";

type LocalFile = Pick<JourneyFile, "url" | "name" | "mimeType" | "size">;

type Props = {
  applicationId: string;
  task: JourneyTaskDef;
  stageTitle: string;
  stageNumber: number;
  state: TaskStateValue;
  /** The applicant may still change this document. */
  editable: boolean;
  /** Why it cannot be changed, shown instead of the Save button. */
  lockedReason: string | null;
  initialFiles: JourneyFile[];
  /** What was saved, with the prefill from the profile filling the gaps. */
  initialAnswers: AnswerMap;
  reviewNote: string | null;
  badge: string | null;
  path: JourneyPathContext;
  /** Only while there is no saved submission yet (school applications). */
  target: ApplyTargetInput | null;
};

function matchesAccept(file: File, accept: string) {
  const tokens = accept.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return tokens.some((token) =>
    token.endsWith("/*") ? type.startsWith(token.slice(0, -1)) : token.startsWith(".") ? name.endsWith(token) : type === token
  );
}

const isImage = (f: LocalFile) => !!f.mimeType?.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(f.name);
const isPdf = (f: LocalFile) => f.mimeType === "application/pdf" || /\.pdf(\?|$)/i.test(f.name);

export function TaskWorkspace({
  applicationId,
  task,
  stageTitle,
  stageNumber,
  state,
  editable,
  lockedReason,
  initialFiles,
  initialAnswers,
  reviewNote,
  badge,
  path,
  target,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [submissionId, setSubmissionId] = useState<string | null>(path.submissionId ?? null);
  const [files, setFiles] = useState<LocalFile[]>(() =>
    initialFiles.map((f) => ({ url: f.url, name: f.name, mimeType: f.mimeType, size: f.size }))
  );
  const [active, setActive] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const accept = task.accept?.trim() || DEFAULT_ACCEPT;
  const isDocument = task.kind === "DOCUMENT";
  const shownFields = useMemo(() => visibleTaskFields(task, answers), [task, answers]);
  const { optionsFor } = useDependentOptions(task.fields, answers);

  const current = files[Math.min(active, Math.max(files.length - 1, 0))];
  const backHref = journeyHref({ ...path, submissionId: submissionId ?? path.submissionId }, stageNumber);

  async function addFiles(list: FileList | File[] | null) {
    const incoming = list ? Array.from(list) : [];
    if (incoming.length === 0 || !editable || uploading) return;

    const room = task.maxFiles - files.length;
    if (room <= 0) {
      toast.error(`You can add up to ${task.maxFiles} pages here`);
      return;
    }

    const usable: File[] = [];
    for (const file of incoming) {
      if (!matchesAccept(file, accept)) toast.error(`"${file.name}" is not an accepted file type`);
      else if (file.size > MAX_FILE_BYTES) toast.error(`"${file.name}" is larger than 15 MB`);
      else usable.push(file);
    }
    if (usable.length > room) toast.message(`Only the first ${room} could be added`);

    const chosen = usable.slice(0, room);
    if (chosen.length === 0) return;

    setUploading(true);
    try {
      const uploaded: LocalFile[] = [];
      for (const file of chosen) {
        const url = await uploadPortalFile(file, applicationId, task.slug);
        uploaded.push({ url, name: file.name, mimeType: file.type || null, size: file.size });
      }
      setActive(files.length);
      setFiles((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error("The upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setActive((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
  }

  async function save() {
    if (saving || uploading || !editable) return;
    setSaving(true);

    const result = await saveJourneyTask({
      applicationId,
      submissionId,
      target: submissionId ? null : target,
      taskId: task.id,
      answers,
      files: files.map((f) => ({ url: f.url, name: f.name, mimeType: f.mimeType, size: f.size })),
      submit: true,
    }).catch(() => null);

    setSaving(false);

    if (!result || !result.success) {
      toast.error(result && !result.success ? result.error : "Could not save. Check your connection and try again.");
      return;
    }

    setSubmissionId(result.submissionId);
    const saved = { ...path, submissionId: result.submissionId };

    if (result.missing) {
      // kept as a draft: stay here, and from now on the address names the saved submission
      toast.warning(`Saved as a draft. ${result.missing}.`);
      router.replace(taskHref(saved, task.slug));
      router.refresh();
      return;
    }

    toast.success(`${task.title} saved`);
    router.push(journeyHref(saved, stageNumber));
    router.refresh();
  }

  const hasDetails = task.fields.length > 0;

  return (
    <div className="space-y-4">
      {/* top bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white px-4 py-3">
        <Link
          href={backHref}
          aria-label="Back to the application"
          className="grid size-9 shrink-0 place-items-center rounded-full text-neutral-600 transition hover:bg-neutral-100"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-[color:var(--color-ink)]">{task.title}</h1>
            <TaskStatusBadge state={state} />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            {task.subgroupTitle ?? task.groupTitle ?? stageTitle}
          </p>
        </div>
        {editable ? (
          <Button
            type="button"
            onClick={save}
            disabled={saving || uploading}
            className="h-10 rounded-full bg-[color:var(--color-teal)] px-6 text-white hover:bg-[color:var(--color-teal)]/90"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            Save changes
          </Button>
        ) : (
          lockedReason && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              <Lock size={13} /> {lockedReason}
            </span>
          )
        )}
      </div>

      {state === "CHANGES_REQUESTED" && reviewNote && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Your counsellor asked for changes</p>
            <p className="mt-0.5">{reviewNote}</p>
          </div>
        </div>
      )}

      <div className={cn("grid gap-4", isDocument ? "lg:grid-cols-[104px_minmax(0,1fr)_320px]" : "lg:max-w-md")}>
        {/* pages of the document */}
        {isDocument && (
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {files.map((file, index) => (
              <div key={file.url} className="relative w-20 shrink-0 lg:w-full">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Page ${index + 1}`}
                  className={cn(
                    "grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-lg border bg-neutral-100 transition",
                    index === active ? "ring-2 ring-[color:var(--color-teal)]" : "hover:border-neutral-400"
                  )}
                >
                  {isImage(file) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={file.url} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-neutral-400">
                      <FileText size={22} />
                      <span className="text-[10px] font-medium">{isPdf(file) ? "PDF" : "File"}</span>
                    </span>
                  )}
                  <span className="absolute bottom-1 left-1 grid size-5 place-items-center rounded-full bg-black/60 text-[10px] font-medium text-white">
                    {index + 1}
                  </span>
                </button>
                {editable && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove page ${index + 1}`}
                    className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-white/90 text-neutral-500 shadow hover:text-[color:var(--color-ruby)]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}

            {editable && files.length < task.maxFiles && (
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="flex h-11 w-20 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-neutral-900 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60 lg:w-full"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
              </button>
            )}
          </div>
        )}

        {/* the document */}
        {isDocument && (
        <div
          onDragOver={(e) => {
            if (!editable) return;
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            if (!editable) return;
            e.preventDefault();
            setDragging(false);
            void addFiles(e.dataTransfer.files);
          }}
        >
          <div
              className={cn(
                "relative grid min-h-[420px] place-items-center overflow-hidden rounded-xl border bg-neutral-100",
                dragging && "border-[color:var(--color-teal)] bg-[color:var(--color-teal)]/5"
              )}
            >
              {current ? (
                isImage(current) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.url} alt={`${task.title}, page ${active + 1}`} className="max-h-[70vh] w-full object-contain" />
                ) : isPdf(current) ? (
                  <iframe src={current.url} title={`${task.title}, page ${active + 1}`} className="h-[70vh] w-full bg-white" />
                ) : (
                  <a href={current.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-[color:var(--color-teal)] underline">
                    Open {current.name}
                  </a>
                )
              ) : editable ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="flex max-w-xs flex-col items-center gap-3 px-6 py-10 text-center text-neutral-500 disabled:opacity-60"
                >
                  <span className="grid size-14 place-items-center rounded-full bg-white text-[color:var(--color-teal)] shadow-sm">
                    {uploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                  </span>
                  <span className="text-sm font-medium text-[color:var(--color-ink)]">Upload your {task.title.toLowerCase()}</span>
                  <span className="text-xs">
                    Drag a file here or tap to choose. Photos and PDF, up to 15 MB each.
                    {task.maxFiles > 1 ? ` Up to ${task.maxFiles} pages.` : ""}
                  </span>
                </button>
              ) : (
                <p className="text-sm text-neutral-400">Nothing was uploaded.</p>
              )}

              {uploading && current && (
                <div className="absolute inset-0 grid place-items-center bg-white/60">
                  <Loader2 size={26} className="animate-spin text-[color:var(--color-teal)]" />
                </div>
              )}

              {files.length > 0 && (
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow">
                  {Math.min(active + 1, files.length)} of {files.length}
                </span>
              )}
            </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={task.maxFiles > 1}
            disabled={!editable || uploading}
            className="hidden"
            onChange={(e) => void addFiles(e.target.files)}
          />
        </div>
        )}

        {/* details */}
        {hasDetails && (
          <aside className="h-fit rounded-xl border bg-white p-4 lg:sticky lg:top-4">
            <h2 className="text-base font-semibold text-[color:var(--color-ink)]">Fill in your details</h2>
            <p className="mt-1 text-xs text-neutral-500">
              {task.description ?? "Enter the details exactly as they appear on the document."}
            </p>
            {badge && <p className="mt-2 text-xs font-medium text-amber-600">{badge}</p>}

            {/* a disabled fieldset switches off every input inside it when the document is locked */}
            <fieldset disabled={!editable} className="mt-4 min-w-0 space-y-5 border-0 p-0">
              {shownFields.map((field) => {
                const { options, notes, loading, blocked } = optionsFor(field);
                return (
                  <FlowFieldInput
                    key={field.id}
                    field={field}
                    value={answers[field.key] ?? ""}
                    options={options}
                    notes={notes}
                    loadingOptions={loading}
                    blockedText={blocked}
                    onChange={(value) => setAnswers((prev) => withAnswer(task.fields, prev, field, value))}
                  />
                );
              })}
            </fieldset>

            {editable && shownFields.some((f) => fieldError(f, answers[f.key])) && (
              <p className="mt-3 text-xs text-[color:var(--color-ruby)]">Check the highlighted details before saving.</p>
            )}
          </aside>
        )}
      </div>

      {!isDocument && !hasDetails && (
        <p className="rounded-xl border bg-white p-4 text-sm text-neutral-500">Nothing to fill in here.</p>
      )}
    </div>
  );
}