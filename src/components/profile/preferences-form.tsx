"use client";

// src/components/profile/preferences-form.tsx
// "Preferences" tab: where, what level, when, and which subjects.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { savePreferences } from "@/actions/profile";
import { filledButton, outlinedButton } from "@/components/dashboard/styles";
import { MONTHS, STUDY_DESTINATIONS, STUDY_LEVELS, startYearOptions } from "@/constants/profile-options";
import { PreferencesSchema, type PreferencesValues } from "@/schemas/profile";
import { cn } from "@/lib/utils";
import { SelectField } from "./fields";
import { mapIssues } from "./form-utils";
import { SubjectPicker } from "./subject-picker";
import { ProfileData } from "./type";


const pick = (p: ProfileData): PreferencesValues => ({
  preferredDestination: p.preferredDestination,
  preferredStudyLevel: p.preferredStudyLevel,
  preferredStartYear: p.preferredStartYear,
  preferredStartMonth: p.preferredStartMonth,
  subjects: p.subjects,
});

export function PreferencesForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [saved, setSaved] = useState<PreferencesValues>(() => pick(profile));
  const [values, setValues] = useState<PreferencesValues>(() => pick(profile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const set = <K extends keyof PreferencesValues>(key: K) => (value: PreferencesValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  const years = startYearOptions(5);
  // keep a previously saved year selectable even once it is in the past
  const yearOptions = values.preferredStartYear && !years.includes(values.preferredStartYear)
    ? [values.preferredStartYear, ...years]
    : years;

  const onSave = () => {
    const parsed = PreferencesSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error));
      return;
    }
    startTransition(async () => {
      const res = await savePreferences(values);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      setSaved(values);
      toast.success("Preferences saved");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty && !pending) onSave();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id="pref-destination"
          label="Preferred destination"
          placeholder="Preferred destination"
          value={values.preferredDestination}
          onChange={set("preferredDestination")}
          options={STUDY_DESTINATIONS}
          error={errors.preferredDestination}
        />
        <SelectField
          id="pref-level"
          label="Preferred study level"
          placeholder="Preferred study level"
          value={values.preferredStudyLevel}
          onChange={set("preferredStudyLevel")}
          options={STUDY_LEVELS}
          error={errors.preferredStudyLevel}
        />
        <SelectField
          id="pref-year"
          label="Preferred start year"
          placeholder="Preferred start year"
          value={values.preferredStartYear}
          onChange={set("preferredStartYear")}
          options={yearOptions}
          error={errors.preferredStartYear}
        />
        <SelectField
          id="pref-month"
          label="Preferred month"
          placeholder="Preferred month"
          value={values.preferredStartMonth}
          onChange={set("preferredStartMonth")}
          options={MONTHS}
          error={errors.preferredStartMonth}
        />
      </div>

      <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-ink/60">Profile subjects</h3>
      <div className="max-w-xl">
        <SubjectPicker value={values.subjects} onChange={set("subjects")} error={errors.subjects} />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setValues(saved);
            setErrors({});
          }}
          disabled={!dirty || pending}
          className={cn(outlinedButton, "px-6 disabled:pointer-events-none disabled:opacity-40")}
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={!dirty || pending}
          className={cn(filledButton, "px-8 disabled:pointer-events-none disabled:opacity-50")}
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          Save
        </button>
      </div>
    </form>
  );
}