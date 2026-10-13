"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { saveSubmissionStep, submitApplication } from "@/actions/submission";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { DynamicField } from "./dynamic-field";
import { WizardStepper } from "./wizard-stepper";
import { AutosaveStatus } from "./autosave-status";
import type { WizardStep, WizardAnswer, AutosaveState, ApplicationStatus } from "./types";
import type { ApplyTargetInput } from "@/lib/application-target";
import { STATUS_LABELS, isEditableStatus, isUnsubmittedStatus } from "@/constants/submission-status";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

interface ApplicationWizardProps {
  applicationId: string;
  applicationName: string;
  terminalName: string;
  steps: WizardStep[];
  initialSubmissionId: string | null;
  initialStatus: ApplicationStatus;
  initialCurrentStep: number;
  initialAnswers: WizardAnswer[];
  // school applications: who it is for (sent with the first save) and the fields the student cannot change
  target?: ApplyTargetInput | null;
  lockedFieldIds?: string[];
}

export function ApplicationWizard({
  applicationId,
  applicationName,
  terminalName,
  steps,
  initialSubmissionId,
  initialStatus,
  initialCurrentStep,
  initialAnswers,
  target = null,
  lockedFieldIds = [],
}: ApplicationWizardProps) {
  const router = useRouter();

  const [submissionId, setSubmissionId] = useState(initialSubmissionId);
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [furthestStep, setFurthestStep] = useState(initialCurrentStep);
  const [currentStep, setCurrentStep] = useState(Math.min(initialCurrentStep, steps.length || 1));
  const [answers, setAnswers] = useState<Record<string, WizardAnswer>>(() =>
    Object.fromEntries(initialAnswers.map((a) => [a.applicationFieldId, a]))
  );
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // a submitted application stays editable, only the closed statuses lock it
  const isLocked = !isEditableStatus(status);
  const hasBeenSubmitted = !isUnsubmittedStatus(status);
  const step = steps.find((s) => s.stepNumber === currentStep) ?? steps[0];
  const isLastStep = currentStep >= steps.length;

  function getAnswersForStep(stepNumber: number): WizardAnswer[] {
    const target = steps.find((s) => s.stepNumber === stepNumber);
    if (!target) return [];
    return target.fields.map((f) => answers[f.id] ?? { applicationFieldId: f.id, value: null, fileUrl: null });
  }

  async function runAutosave() {
    if (isLocked) return;
    setAutosaveState("saving");
    const result = await saveSubmissionStep({
      applicationId,
      submissionId,
      target,
      stepNumber: currentStep,
      values: getAnswersForStep(currentStep),
    });
    if (!result.success) {
      setAutosaveState("error");
      return;
    }
    setSubmissionId(result.submissionId);
    setFurthestStep((prev) => Math.max(prev, result.currentStep));
    setAutosaveState("saved");
    setSavedAt(new Date());
  }

  const { debounced: debouncedAutosave, cancel: cancelAutosave } = useDebouncedCallback(runAutosave, 1500);

  function handleFieldChange(fieldId: string, next: { value?: string | null; fileUrl?: string | null }) {
    setAnswers((prev) => ({
      ...prev,
      [fieldId]: {
        applicationFieldId: fieldId,
        value: next.value !== undefined ? next.value : prev[fieldId]?.value ?? null,
        fileUrl: next.fileUrl !== undefined ? next.fileUrl : prev[fieldId]?.fileUrl ?? null,
      },
    }));
    debouncedAutosave();
  }

  // Shared by Back and stepper clicks: silently save the step being left,
  // then move — never lose an edit just because the applicant navigated
  // away from it instead of clicking Save & Continue.
  async function goToStep(targetStep: number) {
    cancelAutosave();
    if (isLocked) {
      setCurrentStep(targetStep);
      return;
    }
    setAutosaveState("saving");
    const result = await saveSubmissionStep({
      applicationId,
      submissionId,
      target,
      stepNumber: currentStep,
      values: getAnswersForStep(currentStep),
    });
    if (!result.success) {
      setAutosaveState("error");
      toast.error(result.error);
      return;
    }
    setSubmissionId(result.submissionId);
    setFurthestStep((prev) => Math.max(prev, result.currentStep));
    setAutosaveState("saved");
    setSavedAt(new Date());
    setCurrentStep(targetStep);
  }

  async function handleSaveAndContinue() {
    cancelAutosave();
    setAutosaveState("saving");
    const nextStep = Math.min(currentStep + 1, steps.length);

    const result = await saveSubmissionStep({
      applicationId,
      submissionId,
      target,
      stepNumber: currentStep,
      setCurrentStep: isLastStep ? currentStep : nextStep,
      values: getAnswersForStep(currentStep),
    });

    if (!result.success) {
      setAutosaveState("error");
      toast.error(result.error);
      return;
    }

    setSubmissionId(result.submissionId);
    setFurthestStep((prev) => Math.max(prev, result.currentStep));
    setAutosaveState("saved");
    setSavedAt(new Date());

    if (!isLastStep) {
      setCurrentStep(nextStep);
      return;
    }

    setIsSubmitting(true);
    const submitResult = await submitApplication(applicationId, result.submissionId);
    setIsSubmitting(false);

    if (!submitResult.success) {
      toast.error(submitResult.error);
      if (submitResult.missingStep) setCurrentStep(submitResult.missingStep);
      return;
    }

    setStatus((prev) => (isUnsubmittedStatus(prev) ? "SUBMITTED" : prev));
    toast.success(hasBeenSubmitted ? "Application updated" : "Application submitted!");
    // the applicant lands on the list where every application can be tracked
    router.push("/portal/applications");
  }

  if (!step) {
    return <p className="text-sm text-neutral-500">This application doesn't have any fields configured yet.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-neutral-400">{terminalName}</p>
          <h1 className="text-lg font-semibold text-[color:var(--color-ink)]">{applicationName}</h1>
        </div>
        {!isLocked && <AutosaveStatus state={autosaveState} savedAt={savedAt} />}
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 rounded-lg border border-[color:var(--color-teal)]/30 bg-[color:var(--color-teal)]/5 px-3 py-2.5 text-sm text-[color:var(--color-teal)]">
          <CheckCircle2 size={16} />
          This application is {(STATUS_LABELS[status] ?? status).toLowerCase()} and can no longer be edited.
        </div>
      )}


      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        furthestStep={isLocked ? steps.length : furthestStep}
        disabled={autosaveState === "saving" || isSubmitting}
        onStepClick={goToStep}
      />

      <div className="rounded-xl border bg-white p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-neutral-500">
          Step {step.stepNumber} of {steps.length} — {step.title}
        </h2>
        <div className="space-y-5">
          {step.fields.map((field) => (
            <DynamicField
              key={field.id}
              applicationId={applicationId}
              field={field}
              answer={answers[field.id]}
              disabled={isLocked || lockedFieldIds.includes(field.id)}
              onChange={(next) => handleFieldChange(field.id, next)}
            />
          ))}
        </div>
      </div>

      {!isLocked && (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1 || autosaveState === "saving" || isSubmitting}
            onClick={() => goToStep(currentStep - 1)}
          >
            <ArrowLeft size={15} /> Back
          </Button>

          <Button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={autosaveState === "saving" || isSubmitting}
            className="bg-[color:var(--color-teal)] text-white hover:bg-[color:var(--color-teal)]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Submitting...
              </>
            ) : isLastStep ? (
              "Save & Submit"
            ) : (
              <>
                Save & Continue <ArrowRight size={15} />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}