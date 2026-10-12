"use client";

// src/components/profile/basic-info-form.tsx
// "Basic info" tab: name (changeable), nationality, residence, phone, date of birth.
// Save only lights up when something changed; Discard puts the saved values back.
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveBasicInfo } from "@/actions/profile";
import { filledButton, outlinedButton } from "@/components/dashboard/styles";
import { COUNTRY_NAMES } from "@/constants/profile-options";
import { BasicInfoSchema, type BasicInfoValues } from "@/schemas/profile";
import { cn } from "@/lib/utils";
import { SelectField, TextField } from "./fields";
import { mapIssues, todayIso } from "./form-utils";
import type { ProfileData } from "./types";

export const NAME_INPUT_ID = "profile-name";

const pick = (p: ProfileData): BasicInfoValues => ({
  name: p.name,
  phone: p.phone,
  nationality: p.nationality,
  residenceCountry: p.residenceCountry,
  residenceCity: p.residenceCity,
  dateOfBirth: p.dateOfBirth,
});

export function BasicInfoForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [saved, setSaved] = useState<BasicInfoValues>(() => pick(profile));
  const [values, setValues] = useState<BasicInfoValues>(() => pick(profile));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const set = <K extends keyof BasicInfoValues>(key: K) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  };

  const onSave = () => {
    const parsed = BasicInfoSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(mapIssues(parsed.error));
      return;
    }
    startTransition(async () => {
      const res = await saveBasicInfo(values);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      setSaved(values);
      toast.success("Basic info saved");
      router.refresh();
    });
  };

  const onDiscard = () => {
    setValues(saved);
    setErrors({});
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty && !pending) onSave();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id={NAME_INPUT_ID}
          label="Full name"
          value={values.name}
          onChange={set("name")}
          autoComplete="name"
          hint="As per your passport or ID proof"
          error={errors.name}
        />
        <SelectField
          id="profile-nationality"
          label="Nationality"
          value={values.nationality}
          onChange={set("nationality")}
          options={COUNTRY_NAMES}
          error={errors.nationality}
        />
        <SelectField
          id="profile-residence-country"
          label="Residence country"
          value={values.residenceCountry}
          onChange={set("residenceCountry")}
          options={COUNTRY_NAMES}
          error={errors.residenceCountry}
        />
        <TextField
          id="profile-residence-city"
          label="Residence city"
          value={values.residenceCity}
          onChange={set("residenceCity")}
          autoComplete="address-level2"
          error={errors.residenceCity}
        />
        <TextField
          id="profile-phone"
          label="Phone number"
          type="tel"
          value={values.phone}
          onChange={set("phone")}
          placeholder="+234 806 012 3454"
          autoComplete="tel"
          error={errors.phone}
        />
        <TextField
          id="profile-dob"
          label="Date of birth"
          type="date"
          value={values.dateOfBirth}
          onChange={set("dateOfBirth")}
          max={todayIso()}
          autoComplete="bday"
          error={errors.dateOfBirth}
        />
        <TextField
          id="profile-email"
          label="Email"
          type="email"
          value={profile.email}
          onChange={() => {}}
          readOnly
          hint="Your sign-in email. Contact us if it needs to change."
          className="md:col-span-1"
        />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={onDiscard}
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