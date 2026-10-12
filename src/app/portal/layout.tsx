// src/app/portal/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { OnboardingGate } from "@/components/profile/onboarding-modal";
import { ChatPanel } from "@/components/portal/chat-panel";
import { StaffChatPanel } from "@/components/portal/staff-chat-panel";
import { PortalMain, PortalShell } from "@/components/portal/portal-shell";
import { PortalNav } from "@/components/portal/portal-nav";
import { PortalMobileSidebar } from "@/components/portal/portal-mobile-sidebar";
import { UserMenu } from "@/components/portal/user-menu";
import { getPortalCounsellor } from "@/lib/portal-counsellor";
import { getOnboardingState } from "@/lib/user-profile";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/portal");

  const isApplicant = session.user.role === "USER";
  const [counsellor, onboarding] = await Promise.all([
    getPortalCounsellor(session.user.id),
    // only applicants are asked to set up a profile, not counselors or admins
    isApplicant ? getOnboardingState(session.user.id) : null,
  ]);

  // Forced onboarding: until an applicant finishes it, nothing else of the portal is
  // rendered. The sidebar, chat and page content are not even sent to the browser.
  // When the last step is saved, the gate refreshes and this layout renders the full
  // portal at the same address, so a deep link (for example an apply link) is kept.
  if (onboarding && !onboarding.completed) {
    return (
      <div className="min-h-screen bg-white">
        <Toaster richColors position="top-center" />
        <header className="flex h-14 items-center border-b border-neutral-200 bg-white px-4 pt-[env(safe-area-inset-top)] sm:px-6">
          <span className="font-display text-lg font-semibold tracking-tight text-ruby-600">
            Ruhe<span className="text-ink"> Global Resources</span>
          </span>
        </header>
        <OnboardingGate initial={onboarding.initial} />
      </div>
    );
  }

  const user = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return (
    <PortalShell>
      <Toaster richColors position="top-center" />

      {/* Top bar: phones and tablets only. On lg+ the fixed sidebar replaces it. */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-neutral-200 bg-white px-4 pt-[env(safe-area-inset-top)] lg:hidden">
        <PortalMobileSidebar user={user} counsellor={counsellor} />

        <Link
          href="/portal"
          className="min-w-0 flex-1 truncate font-display text-lg font-semibold tracking-tight text-ruby-600"
        >
          Ruhe<span className="text-ink"> Global Resources</span>
        </Link>

        <Link
          href="/courses"
          aria-label="Search courses"
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink transition hover:bg-neutral-100"
        >
          <Search size={20} />
        </Link>

        <UserMenu name={user.name} email={user.email} image={user.image} />
      </header>

      <PortalNav user={user} counsellor={counsellor} />

      <PortalMain>{children}</PortalMain>

      {/* applicants have one conversation; counselors and admins have an inbox of many */}
      {session.user.role === "USER" ? (
        <ChatPanel counsellor={counsellor} />
      ) : (
        <StaffChatPanel role={session.user.role} />
      )}
    </PortalShell>
  );
}