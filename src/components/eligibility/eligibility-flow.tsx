"use client";

// src/components/eligibility/eligibility-flow.tsx
// The eligibility check, opened from "Show my matches" and from "Get started" on the applications page.
//   1. "What would you like to do today?": one pill per application of the eligibility terminal
//      (Study abroad, Visa application, Accommodation, Work abroad...). Tapping one opens its questions.
//   2. The questions of that application, one step at a time in the step modal. Steps and questions
//      come from the database, so what is asked, in which order, and when, is edited without code.
//   3. On the last step the answers are saved on the user and the course search opens with them.
// Each step is saved when the person presses Continue (the same save as the application wizard).
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, FileCheck2, GraduationCap, House, Loader2, Sparkles, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { completeEligibility, loadEligibilityFlow, loadUniversities } from "@/actions/eligibility";
import { saveSubmissionStep } from "@/actions/submission";
import { StepFrame } from "@/components/step-flow/step-frame";
import { FlowFieldInput } from "@/components/step-flow/flow-field";
import {
  getVisibleSteps,
  isStepComplete,
  type AnswerMap,
  type FlowField,
} from "@/lib/eligibility";
import type { EligibilityFlowData, EligibilityPill } from "@/lib/eligibility-data";
import { cn } from "@/lib/utils";

// Application.icon is a lucide icon name typed in the admin. Unknown names fall back to a sparkle.
const PILL_ICONS: Record<string, LucideIcon> = { GraduationCap, FileCheck2, House, Briefcase };

type Phase = "pick" | "steps" | "finishing";

export function EligibilityFlow({ pills }: { pills: EligibilityPill[] }) {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("pick");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [flow, setFlow] = useState<EligibilityFlowData | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [stepNumber, setStepNumber] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  // universities by country name; "loading" while the request is out
  const [universities, setUniversities] = useState<Record<string, string[] | "loading">>({});

  // Leave: back to the page the person came from, or the dashboard when this was opened directly.
  const close = useCallback(() => {
    const cameFromSite = document.referrer.startsWith(window.location.origin);
    if (cameFromSite && window.history.length > 1) router.back();
    else router.replace("/portal");
  }, [router]);

  const allFields = useMemo<FlowField[]>(() => flow?.steps.flatMap((s) => s.fields) ?? [], [flow]);
  const visible = useMemo(() => (flow ? getVisibleSteps(flow.steps, answers) : []), [flow, answers]);

  const foundIndex = visible.findIndex((s) => s.stepNumber === stepNumber);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const current = visible[currentIndex];
  const isLast = currentIndex >= visible.length - 1;

  // A list that depends on an earlier answer (the universities of the chosen country) is loaded when
  // that answer is given, and kept so going back and forth does not ask again.
  const dependentFields = useMemo(
    () => allFields.filter((f) => f.optionsSource === "UNIVERSITIES" && f.dependsOnKey),
    [allFields]
  );
  useEffect(() => {
    for (const field of dependentFields) {
      const country = answers[field.dependsOnKey!]?.trim();
      if (!country || universities[country] !== undefined) continue;
      setUniversities((prev) => ({ ...prev, [country]: "loading" }));
      loadUniversities(country)
        .then((list) => setUniversities((prev) => ({ ...prev, [country]: list })))
        .catch(() => setUniversities((prev) => ({ ...prev, [country]: [] })));
    }
  }, [dependentFields, answers, universities]);

  const optionsFor = (field: FlowField) => {
    if (field.optionsSource !== "UNIVERSITIES") return { options: field.options, loading: false, blocked: undefined };
    const country = field.dependsOnKey ? answers[field.dependsOnKey]?.trim() : "";
    if (!country) return { options: [], loading: false, blocked: "Choose the country first" };
    const entry = universities[country];
    return { options: Array.isArray(entry) ? entry : [], loading: entry === "loading", blocked: undefined };
  };

  const setAnswer = (field: FlowField, value: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (value.trim()) next[field.key] = value;
      else delete next[field.key];
      // an answer that depended on this one (a university of the old country) is no longer valid
      for (const other of allFields) {
        if (other.dependsOnKey === field.key) delete next[other.key];
      }
      return next;
    });
  };

  async function pick(pill: EligibilityPill) {
    if (loadingId) return;
    setLoadingId(pill.id);
    try {
      const data = await loadEligibilityFlow(pill.id);
      if (!data || data.steps.length === 0) {
        toast.error("This check is not ready yet.");
        return;
      }
      setFlow(data);
      setAnswers(data.answers);
      setSubmissionId(data.submissionId);
      setStepNumber(null);
      setPhase("steps");
    } catch {
      toast.error("Could not open this check. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }

  function back() {
    if (currentIndex > 0) setStepNumber(visible[currentIndex - 1].stepNumber);
    else setPhase("pick");
  }

  async function next() {
    if (!flow || !current || saving) return;
    setSaving(true);

    const upcoming = visible[currentIndex + 1];
    const saved = await saveSubmissionStep({
      applicationId: flow.applicationId,
      submissionId,
      stepNumber: current.stepNumber,
      setCurrentStep: upcoming?.stepNumber ?? current.stepNumber,
      values: current.fields.map((f) => ({ applicationFieldId: f.id, value: answers[f.key] ?? null, fileUrl: null })),
    }).catch(() => null);

    if (!saved || !saved.success) {
      setSaving(false);
      toast.error(saved && !saved.success ? saved.error : "Could not save. Check your connection and try again.");
      return;
    }
    setSubmissionId(saved.submissionId);

    if (upcoming) {
      setStepNumber(upcoming.stepNumber);
      setSaving(false);
      return;
    }

    setPhase("finishing");
    const done = await completeEligibility(flow.applicationId, saved.submissionId).catch(() => null);
    if (!done || !done.success) {
      setPhase("steps");
      setSaving(false);
      toast.error(done && !done.success ? done.error : "Could not finish. Please try again.");
      if (done && !done.success && done.stepNumber) setStepNumber(done.stepNumber);
      return;
    }

    router.push(done.query ? `/courses?q=${encodeURIComponent(done.query)}` : "/courses");
  }

  // ---- 1. what would you like to do today -----------------------------------
  if (phase === "pick") {
    return (
      <StepFrame title="What would you like to do today?" emoji="✨" progress={4} onClose={close}>
        {pills.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">Nothing is set up here yet. Please check back soon.</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {pills.map((pill) => {
              const Icon = (pill.icon && PILL_ICONS[pill.icon]) || Sparkles;
              const busy = loadingId === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  disabled={!!loadingId}
                  onClick={() => pick(pill)}
                  className={cn(
                    "inline-flex items-center gap-2.5 rounded-full bg-neutral-100 px-6 py-4 text-base font-medium text-ink outline-none transition hover:bg-ruby-50 hover:text-ruby-700 focus-visible:ring-2 focus-visible:ring-ruby-500/50 disabled:opacity-60",
                    busy && "bg-ruby-50 text-ruby-700"
                  )}
                >
                  {busy ? <Loader2 size={20} className="animate-spin" /> : <Icon size={20} className="text-ruby-600" />}
                  {pill.name}
                </button>
              );
            })}
          </div>
        )}
      </StepFrame>
    );
  }

  // ---- 3. saving the profile and opening the course search ------------------
  if (phase === "finishing" || !current) {
    return (
      <StepFrame title="Finding your matches" emoji="🎓" progress={100} onClose={close}>
        <div className="grid place-items-center py-10 text-ruby-500">
          <Loader2 size={34} className="animate-spin" />
        </div>
      </StepFrame>
    );
  }

  // ---- 2. the questions -------------------------------------------------------
  const complete = isStepComplete(current, answers);
  const progress = Math.max(8, Math.min(94, Math.round(((currentIndex + 1) / visible.length) * 100)));

  return (
    <StepFrame
      title={current.title}
      emoji={current.emoji}
      progress={progress}
      onBack={back}
      onClose={close}
      footer={
        <button
          type="button"
          onClick={next}
          disabled={!complete || saving}
          className="inline-flex h-12 w-full max-w-[320px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-ruby-700 to-ruby-500 text-base font-semibold text-white shadow-md outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ruby-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              {isLast ? "See my matches" : "Continue"} <ArrowRight size={18} />
            </>
          )}
        </button>
      }
    >
      <div className="space-y-6">
        {current.fields.map((field) => {
          const { options, loading, blocked } = optionsFor(field);
          return (
            <FlowFieldInput
              key={field.id}
              field={field}
              value={answers[field.key] ?? ""}
              options={options}
              loadingOptions={loading}
              blockedText={blocked}
              onChange={(value) => setAnswer(field, value)}
            />
          );
        })}
      </div>
    </StepFrame>
  );
}