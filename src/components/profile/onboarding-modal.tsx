"use client";

// src/components/profile/onboarding-modal.tsx
// The forced setup shown to applicants until they finish it.
//   - phones: a Vaul bottom drawer, desktop: a dialog (both come from <Modal>)
//   - 4 steps, each saved as soon as "Continue" is pressed, so leaving halfway keeps the answers
//   - it cannot be skipped or closed: the Modal is left permanently open (no setShowModal,
//     no onClose), so Esc, outside click and drag down do nothing
//   - the portal layout renders ONLY this gate until onboarding is finished, on every
//     portal page including the profile page
//   - "Sign out" is the only way out, so nobody is trapped
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/actions/auth/logout";
import { saveOnboardingStep } from "@/actions/profile";
import { filledButton, outlinedButton } from "@/components/dashboard/styles";
import { Modal } from "@/components/ui/modal";
import { COUNTRY_NAMES, MONTHS, STUDY_DESTINATIONS, STUDY_LEVELS, startYearOptions } from "@/constants/profile-options";
import { OnboardingStepSchema, type OnboardingStepInput } from "@/schemas/profile";
import type { OnboardingInitial } from "@/lib/user-profile";
import { cn } from "@/lib/utils";
import { SelectField, TextField } from "./fields";
import { mapIssues, todayIso } from "./form-utils";
import { SubjectPicker } from "./subject-picker";

const TOTAL_STEPS = 4;

const COPY = [
  {
    title: "Welcome! Let's set up your profile",
    text: "Use your name exactly as it appears on your passport or ID.",
  },
  {
    title: "Where are you from?",
    text: "Your counsellor uses this to check visa and entry requirements for you.",
  },
  {
    title: "Your study plans",
    text: "Tell us where and at what level you would like to study.",
  },
  {
    title: "What would you like to study?",
    text: "Pick up to 10 subjects. We use them to suggest courses and institutions.",
  },
] as const;

function payloadFor(step: number, v: OnboardingInitial): OnboardingStepInput {
  switch (step) {
    case 1:
      return { step: 1, name: v.name, phone: v.phone, dateOfBirth: v.dateOfBirth };
    case 2:
      return { step: 2, nationality: v.nationality, residenceCountry: v.residenceCountry, residenceCity: v.residenceCity };
    case 3:
      return {
        step: 3,
        preferredDestination: v.preferredDestination,
        preferredStudyLevel: v.preferredStudyLevel,
        preferredStartYear: v.preferredStartYear,
        preferredStartMonth: v.preferredStartMonth,
      };
    default:
      return { step: 4, subjects: v.subjects };
  }
}

export function OnboardingGate({ initial }: { initial: OnboardingInitial }) {
  const router = useRouter();

  const [finished, setFinished] = useState(false);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<OnboardingInitial>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const busy = pending || finished;

  const set = <K extends keyof OnboardingInitial>(key: K) => (value: OnboardingInitial[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: "" } : e));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const payload = payloadFor(step, values);
    const parsed = OnboardingStepSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error));
      return;
    }

    setPending(true);
    const res = await saveOnboardingStep(payload);
    setPending(false);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    // Last step saved. The layout stops rendering this gate once the refresh lands,
    // and the full portal appears at the same address.
    setFinished(true);
    toast.success("You're all set. Your profile is saved.");
    router.refresh();
  };

  const copy = COPY[step - 1];
  const years = startYearOptions(5);

  return (
    // No setShowModal and no onClose on purpose: the modal stays open and cannot be dismissed.
    // [&>button]:hidden hides the dialog's built in close button (a direct child of the content).
    <Modal showModal className="sm:max-w-md [&>button]:hidden">
      <form
        onSubmit={onSubmit}
        className="max-h-[88dvh] overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-1 sm:max-h-[80dvh] sm:p-0"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ruby-600">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < step ? "bg-ruby-500" : "bg-ink/10")} />
          ))}
        </div>

        <h2 className="mt-5 font-display text-xl font-semibold text-ink">{copy.title}</h2>
        <p className="mt-1 text-sm text-ink/60">{copy.text}</p>

        <div className="mt-5 space-y-3.5">
          {step === 1 && (
            <>
              <TextField id="ob-name" label="Full name" value={values.name} onChange={set("name")} autoComplete="name" error={errors.name} />
              <TextField id="ob-phone" label="Phone number" type="tel" value={values.phone} onChange={set("phone")} placeholder="+234 806 012 3454" autoComplete="tel" error={errors.phone} />
              <TextField id="ob-dob" label="Date of birth" type="date" value={values.dateOfBirth} onChange={set("dateOfBirth")} max={todayIso()} autoComplete="bday" error={errors.dateOfBirth} />
            </>
          )}

          {step === 2 && (
            <>
              <SelectField id="ob-nationality" label="Nationality" value={values.nationality} onChange={set("nationality")} options={COUNTRY_NAMES} error={errors.nationality} />
              <SelectField id="ob-country" label="Residence country" value={values.residenceCountry} onChange={set("residenceCountry")} options={COUNTRY_NAMES} error={errors.residenceCountry} />
              <TextField id="ob-city" label="Residence city (optional)" value={values.residenceCity} onChange={set("residenceCity")} autoComplete="address-level2" error={errors.residenceCity} />
            </>
          )}

          {step === 3 && (
            <>
              <SelectField id="ob-destination" label="Preferred destination" placeholder="Where do you want to study?" value={values.preferredDestination} onChange={set("preferredDestination")} options={STUDY_DESTINATIONS} error={errors.preferredDestination} />
              <SelectField id="ob-level" label="Preferred study level" placeholder="Choose a level" value={values.preferredStudyLevel} onChange={set("preferredStudyLevel")} options={STUDY_LEVELS} error={errors.preferredStudyLevel} />
              <div className="grid grid-cols-2 gap-3">
                <SelectField id="ob-year" label="Start year" value={values.preferredStartYear} onChange={set("preferredStartYear")} options={years} error={errors.preferredStartYear} />
                <SelectField id="ob-month" label="Start month" value={values.preferredStartMonth} onChange={set("preferredStartMonth")} options={MONTHS} error={errors.preferredStartMonth} />
              </div>
            </>
          )}

          {step === 4 && <SubjectPicker value={values.subjects} onChange={set("subjects")} error={errors.subjects} />}
        </div>

        <div className="mt-7 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setStep(step - 1);
              }}
              disabled={busy}
              aria-label="Back"
              className={cn(outlinedButton, "w-11 shrink-0 px-0")}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <button type="submit" disabled={busy} className={cn(filledButton, "flex-1 disabled:opacity-60")}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {step === TOTAL_STEPS ? "Finish" : "Continue"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          disabled={busy}
          className="mx-auto mt-3 block rounded-full px-4 py-2 text-sm font-medium text-ink/55 transition hover:bg-ink/5 hover:text-ink disabled:opacity-60"
        >
          Sign out
        </button>
      </form>
    </Modal>
  );
}