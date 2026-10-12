"use client";

// src/components/profile/profile-view.tsx
// The profile page body: identity header (photo, name, quick actions), a progress bar, and
// the three tabs: Basic info / Qualifications / Preferences.
import { useState } from "react";
import Link from "next/link";
import { FileStack, MapPin, MessageCircle, Pencil, Phone, SlidersHorizontal, User, Award } from "lucide-react";
import { elevation1, filledButton, outlinedButton } from "@/components/dashboard/styles";
import { OpenChatButton } from "@/components/portal/portal-shell";
import { COMPANY_PHONE_DISPLAY, COMPANY_PHONE_HREF } from "@/constants/contact";
import { cn } from "@/lib/utils";
import { AvatarEditor } from "./avatar-editor";
import { BasicInfoForm, NAME_INPUT_ID } from "./basic-info-form";
import { PreferencesForm } from "./preferences-form";
import { QualificationsPanel } from "./qualifications-panel";
import type { ProfileData, ProfileTab, QualificationItem, TestItem } from "./types";

const TABS: { id: ProfileTab; label: string; icon: React.ElementType }[] = [
  { id: "basic", label: "Basic info", icon: User },
  { id: "qualifications", label: "Qualifications", icon: Award },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

export function ProfileView({
  profile,
  qualifications,
  tests,
  counsellorName,
  completeness,
  initialTab,
}: {
  profile: ProfileData;
  qualifications: QualificationItem[];
  tests: TestItem[];
  counsellorName: string | null;
  completeness: number;
  initialTab: ProfileTab;
}) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);

  const displayName = profile.name || profile.email.split("@")[0] || "Your profile";
  const where = [profile.residenceCity, profile.residenceCountry].filter(Boolean).join(", ");
  const firstName = counsellorName?.trim().split(/\s+/)[0];

  const editName = () => {
    setTab("basic");
    setTimeout(() => {
      const el = document.getElementById(NAME_INPUT_ID) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 60);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="flex items-center gap-2.5 font-display text-2xl font-semibold text-ink">
        <Award size={26} className="text-ink/60" />
        Profile
      </h1>

      {/* Identity + quick actions */}
      <section className={cn("mt-5 rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6", elevation1)}>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <AvatarEditor userId={profile.userId} name={displayName} image={profile.image} />

          <div className="min-w-0 flex-1 text-center sm:pt-2 sm:text-left">
            <div className="flex items-center justify-center gap-1.5 sm:justify-start">
              <h2 className="truncate text-xl font-semibold text-ink">{displayName}</h2>
              <button
                type="button"
                onClick={editName}
                aria-label="Change your name"
                className="grid size-8 shrink-0 place-items-center rounded-full text-ink/50 transition hover:bg-ruby-50 hover:text-ruby-700"
              >
                <Pencil size={15} />
              </button>
            </div>
            <p className="truncate text-sm text-ink/60">{profile.email}</p>
            {where && (
              <p className="mt-1 flex items-center justify-center gap-1 text-sm text-ink/55 sm:justify-start">
                <MapPin size={14} /> {where}
              </p>
            )}

            <div className="mx-auto mt-4 max-w-xs sm:mx-0">
              <div className="flex items-center justify-between text-xs font-medium text-ink/60">
                <span>Profile completeness</span>
                <span>{completeness}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-ruby-500 transition-[width]" style={{ width: `${completeness}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
          <Link href="/profile/applications" className={cn(filledButton, "w-full")}>
            <FileStack size={18} />
            My applications
          </Link>
          <OpenChatButton className={cn(outlinedButton, "h-11 w-full")}>
            <MessageCircle size={18} />
            {firstName ? `Chat with ${firstName}` : "Chat with counsellor"}
          </OpenChatButton>
          <a href={COMPANY_PHONE_HREF} className={cn(outlinedButton, "h-11 w-full")} aria-label={`Call Ruhe Global Resources on ${COMPANY_PHONE_DISPLAY}`}>
            <Phone size={18} />
            Call us
          </a>
        </div>
      </section>

      {/* Tabs */}
      <div role="tablist" aria-label="Profile sections" className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={active}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex h-12 shrink-0 items-center gap-2 rounded-full px-5 text-[15px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/40",
                active ? "bg-ruby-50 text-ruby-700" : "bg-neutral-100 text-ink/70 hover:bg-neutral-200/70"
              )}
            >
              <Icon size={19} />
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6 pb-6">
        {tab === "basic" && <BasicInfoForm profile={profile} />}
        {tab === "qualifications" && <QualificationsPanel qualifications={qualifications} tests={tests} />}
        {tab === "preferences" && <PreferencesForm profile={profile} />}
      </div>
    </div>
  );
}