"use client";

// src/components/profile/qualifications-panel.tsx
// "Qualifications" tab: three lists (academic, English tests, standardized tests), each with
// an "Add" button that opens the Modal (Vaul drawer on phones, dialog on desktop).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, ClipboardList, Languages, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteQualification, deleteTest, saveQualification, saveTest } from "@/actions/profile";
import { filledButton, outlinedButton } from "@/components/dashboard/styles";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Modal } from "@/components/ui/modal";
import { ACADEMIC_LEVELS, COUNTRY_NAMES, pastYearOptions } from "@/constants/profile-options";
import {
  QualificationSchema,
  TEST_NAMES,
  TestSchema,
  type QualificationValues,
  type TestKind,
  type TestValues,
} from "@/schemas/profile";
import { cn } from "@/lib/utils";
import { SelectField, TextField } from "./fields";
import { formatMonthYear, mapIssues } from "./form-utils";
import type { QualificationItem, TestItem } from "./types";

// ─── Panel ───────────────────────────────────────────────────────────────

type Deleting = { type: "qualification" | "test"; id: string; label: string } | null;

export function QualificationsPanel({
  qualifications,
  tests,
}: {
  qualifications: QualificationItem[];
  tests: TestItem[];
}) {
  const router = useRouter();

  const [qualOpen, setQualOpen] = useState(false);
  const [qualItem, setQualItem] = useState<QualificationItem | null>(null);

  const [testOpen, setTestOpen] = useState(false);
  const [testKind, setTestKind] = useState<TestKind>("ENGLISH");
  const [testItem, setTestItem] = useState<TestItem | null>(null);

  const [deleting, setDeleting] = useState<Deleting>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const english = tests.filter((t) => t.kind === "ENGLISH");
  const standard = tests.filter((t) => t.kind === "STANDARDIZED");

  const openQualification = (item: QualificationItem | null) => {
    setQualItem(item);
    setQualOpen(true);
  };
  const openTest = (kind: TestKind, item: TestItem | null) => {
    setTestKind(kind);
    setTestItem(item);
    setTestOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError(null);
    const res = deleting.type === "qualification" ? await deleteQualification(deleting.id) : await deleteTest(deleting.id);
    setDeleteBusy(false);
    if ("error" in res) {
      setDeleteError(res.error);
      return;
    }
    setDeleting(null);
    toast.success("Removed");
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <Section icon={Award} title="Academic Qualifications" addLabel="Add Qualification" onAdd={() => openQualification(null)}>
        {qualifications.map((q) => (
          <EntryCard
            key={q.id}
            title={q.programme ? `${q.level} · ${q.programme}` : q.level}
            subtitle={[q.institution, q.country].filter(Boolean).join(", ")}
            meta={[
              q.startYear || q.endYear ? `${q.startYear || "?"} – ${q.endYear || "Present"}` : "",
              q.grade ? `Grade: ${q.grade}` : "",
            ]
              .filter(Boolean)
              .join("  ·  ")}
            onEdit={() => openQualification(q)}
            onDelete={() => {
              setDeleteError(null);
              setDeleting({ type: "qualification", id: q.id, label: q.institution });
            }}
          />
        ))}
      </Section>

      <Section icon={Languages} title="English Language Tests" addLabel="Add English Test" onAdd={() => openTest("ENGLISH", null)}>
        {english.map((t) => (
          <TestCard key={t.id} test={t} onEdit={() => openTest("ENGLISH", t)} onDelete={() => {
            setDeleteError(null);
            setDeleting({ type: "test", id: t.id, label: t.name });
          }} />
        ))}
      </Section>

      <Section icon={ClipboardList} title="Standardized Tests" addLabel="Add Standard Test" onAdd={() => openTest("STANDARDIZED", null)}>
        {standard.map((t) => (
          <TestCard key={t.id} test={t} onEdit={() => openTest("STANDARDIZED", t)} onDelete={() => {
            setDeleteError(null);
            setDeleting({ type: "test", id: t.id, label: t.name });
          }} />
        ))}
      </Section>

      <Modal showModal={qualOpen} setShowModal={setQualOpen} className="sm:max-w-md">
        <QualificationForm item={qualItem} onDone={() => setQualOpen(false)} />
      </Modal>

      <Modal showModal={testOpen} setShowModal={setTestOpen} className="sm:max-w-md">
        <TestForm kind={testKind} item={testItem} onDone={() => setTestOpen(false)} />
      </Modal>

      <ConfirmationModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Remove this entry?"
        description={deleting ? `"${deleting.label}" will be removed from your profile.` : ""}
        confirmText="Remove"
        variant="destructive"
        isLoading={deleteBusy}
        loadingText="Removing..."
        error={deleteError}
      />
    </div>
  );
}

// ─── Layout pieces ───────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  addLabel,
  onAdd,
  children,
}: {
  icon: React.ElementType;
  title: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2.5 text-base font-semibold text-ink/80">
        <Icon size={22} className="text-ink/60" />
        {title}
      </h2>
      <div className="mt-3 space-y-2.5">{children}</div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-ruby-50 px-5 text-sm font-semibold text-ruby-700 transition hover:bg-ruby-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/40"
      >
        <Plus size={18} />
        {addLabel}
      </button>
    </section>
  );
}

function EntryCard({
  title,
  subtitle,
  meta,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_1px_2px_rgba(16,27,45,0.06)]">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-sm text-ink/60">{subtitle}</p>}
        {meta && <p className="mt-1 text-xs text-ink/45">{meta}</p>}
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${title}`}
        className="grid size-9 shrink-0 place-items-center rounded-full text-ink/55 transition hover:bg-ruby-50 hover:text-ruby-700"
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${title}`}
        className="grid size-9 shrink-0 place-items-center rounded-full text-ink/55 transition hover:bg-ruby-50 hover:text-ruby-700"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function TestCard({ test, onEdit, onDelete }: { test: TestItem; onEdit: () => void; onDelete: () => void }) {
  return (
    <EntryCard
      title={test.name}
      subtitle={`Score: ${test.score}`}
      meta={test.testDate ? `Taken ${formatMonthYear(test.testDate)}` : undefined}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

// ─── Modal forms ─────────────────────────────────────────────────────────
// Mounted only while their modal is open, so every opening starts from the entry's
// saved values (or a blank form) with no stale state to reset.

const modalBody =
  "max-h-[85dvh] overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-1 sm:max-h-[80dvh] sm:p-0";

function FormFooter({ pending, onCancel, saveLabel }: { pending: boolean; onCancel: () => void; saveLabel: string }) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3">
      <button type="button" onClick={onCancel} disabled={pending} className={cn(outlinedButton, "px-6")}>
        Cancel
      </button>
      <button type="submit" disabled={pending} className={cn(filledButton, "px-8 disabled:opacity-60")}>
        {pending && <Loader2 size={16} className="animate-spin" />}
        {saveLabel}
      </button>
    </div>
  );
}

function QualificationForm({ item, onDone }: { item: QualificationItem | null; onDone: () => void }) {
  const router = useRouter();
  const [values, setValues] = useState<QualificationValues>({
    level: item?.level ?? "",
    institution: item?.institution ?? "",
    programme: item?.programme ?? "",
    country: item?.country ?? "",
    startYear: item?.startYear ?? "",
    endYear: item?.endYear ?? "",
    grade: item?.grade ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const set = (key: keyof QualificationValues) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  const years = pastYearOptions(50, 6);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = QualificationSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error));
      return;
    }
    setPending(true);
    const res = await saveQualification(item?.id ?? null, values);
    setPending(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success(item ? "Qualification updated" : "Qualification added");
    onDone();
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className={modalBody}>
      <h2 className="text-lg font-semibold text-ink">{item ? "Edit qualification" : "Add qualification"}</h2>
      <p className="mt-1 text-sm text-ink/60">Your highest and most recent education first.</p>

      <div className="mt-5 space-y-3.5">
        <SelectField id="q-level" label="Level" value={values.level} onChange={set("level")} options={ACADEMIC_LEVELS} error={errors.level} />
        <TextField id="q-institution" label="School or institution" value={values.institution} onChange={set("institution")} error={errors.institution} />
        <TextField id="q-programme" label="Course or programme (optional)" value={values.programme} onChange={set("programme")} error={errors.programme} />
        <SelectField id="q-country" label="Country (optional)" value={values.country} onChange={set("country")} options={COUNTRY_NAMES} error={errors.country} />
        <div className="grid grid-cols-2 gap-3">
          <SelectField id="q-start" label="Start year" value={values.startYear} onChange={set("startYear")} options={years} error={errors.startYear} />
          <SelectField id="q-end" label="End year" value={values.endYear} onChange={set("endYear")} options={years} error={errors.endYear} />
        </div>
        <TextField id="q-grade" label="Grade or CGPA (optional)" value={values.grade} onChange={set("grade")} placeholder="e.g. Second class upper" error={errors.grade} />
      </div>

      <FormFooter pending={pending} onCancel={onDone} saveLabel={item ? "Save" : "Add"} />
    </form>
  );
}

function TestForm({ kind, item, onDone }: { kind: TestKind; item: TestItem | null; onDone: () => void }) {
  const router = useRouter();
  const [values, setValues] = useState<TestValues>({
    kind,
    name: item?.name ?? "",
    score: item?.score ?? "",
    testDate: item?.testDate ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const set = (key: keyof TestValues) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  const english = kind === "ENGLISH";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = TestSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error));
      return;
    }
    setPending(true);
    const res = await saveTest(item?.id ?? null, values);
    setPending(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success(item ? "Test updated" : "Test added");
    onDone();
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className={modalBody}>
      <h2 className="text-lg font-semibold text-ink">
        {item ? "Edit" : "Add"} {english ? "English test" : "standardized test"}
      </h2>
      <p className="mt-1 text-sm text-ink/60">
        {english ? "Add your IELTS, TOEFL or similar result." : "Add your GRE, GMAT, SAT or similar result."}
      </p>

      <div className="mt-5 space-y-3.5">
        <SelectField id="t-name" label="Test" value={values.name} onChange={set("name")} options={TEST_NAMES[kind]} error={errors.name} />
        <TextField
          id="t-score"
          label={english ? "Overall score" : "Score"}
          value={values.score}
          onChange={set("score")}
          placeholder={english ? "e.g. 7.0" : "e.g. 320"}
          error={errors.score}
        />
        <TextField id="t-date" label="Test date (optional)" type="date" value={values.testDate} onChange={set("testDate")} error={errors.testDate} />
      </div>

      <FormFooter pending={pending} onCancel={onDone} saveLabel={item ? "Save" : "Add"} />
    </form>
  );
}