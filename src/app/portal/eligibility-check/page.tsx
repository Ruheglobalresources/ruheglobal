// src/app/portal/eligibility-check/page.tsx
// The eligibility check. It draws its own full-screen modal (see components/eligibility), so this
// page only checks the user is signed in and hands over the pills of the eligibility terminal.
// Opened from "Show my matches" on the dashboard and "Get started" on the applications page.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ELIGIBILITY_PAGE } from "@/lib/portal-paths";
import { authHref } from "@/lib/callback-url";
import { getEligibilityPills } from "@/lib/eligibility-data";
import { EligibilityFlow } from "@/components/eligibility/eligibility-flow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eligibility check | Ruhe Global Resources",
  robots: { index: false, follow: false },
};

export default async function EligibilityCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ check?: string }>;
}) {
  // ?check=study-abroad (or visa-application) opens that check straight away, skipping the picker
  const { check } = await searchParams;
  const slug = check?.trim() || null;

  const session = await auth();
  if (!session?.user?.id) {
    const back = slug ? `${ELIGIBILITY_PAGE}?check=${encodeURIComponent(slug)}` : ELIGIBILITY_PAGE;
    redirect(authHref("login", back));
  }

  const pills = await getEligibilityPills();
  const initialSlug = slug && pills.some((p) => p.slug === slug) ? slug : null;
  return <EligibilityFlow pills={pills} initialSlug={initialSlug} />;
}