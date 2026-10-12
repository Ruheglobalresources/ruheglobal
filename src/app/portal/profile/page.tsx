// src/app/portal/profile/page.tsx
// The applicant's profile: photo, name, basic info, qualifications and study preferences.
// Lives inside the portal layout, so the sidebar, counsellor card and chat are already around it.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileView } from "@/components/profile/profile-view";
import type { ProfileTab } from "@/components/profile/types";
import { getPortalCounsellor } from "@/lib/portal-counsellor";
import { getProfilePageData, profileCompleteness } from "@/lib/user-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My profile | Ruhe Global Resources",
  robots: { index: false, follow: false },
};

const TABS: ProfileTab[] = ["basic", "qualifications", "preferences"];

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/auth/login?callbackUrl=/portal/profile");

  const [data, counsellor, { tab }] = await Promise.all([
    getProfilePageData(userId),
    getPortalCounsellor(userId),
    searchParams,
  ]);
  if (!data) redirect("/auth/login?callbackUrl=/portal/profile");

  const initialTab = TABS.find((t) => t === tab) ?? "basic";

  return (
    <ProfileView
      profile={data.profile}
      qualifications={data.qualifications}
      tests={data.tests}
      counsellorName={counsellor?.name ?? null}
      completeness={profileCompleteness(data.profile, data.qualifications.length)}
      initialTab={initialTab}
    />
  );
}