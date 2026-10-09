// src/app/portal/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { ChatPanel } from "@/components/portal/chat-panel";
import { PortalMain, PortalShell } from "@/components/portal/portal-shell";
import { PortalNav } from "@/components/portal/portal-nav";
import { PortalMobileSidebar } from "@/components/portal/portal-mobile-sidebar";
import { UserMenu } from "@/components/portal/user-menu";
import { getPortalCounsellor } from "@/lib/portal-counsellor";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/portal");

  const counsellor = await getPortalCounsellor(session.user.id);
  const user = { name: session.user.name ?? null, email: session.user.email ?? null };

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

        <UserMenu name={user.name} email={user.email} />
      </header>

      <PortalNav user={user} counsellor={counsellor} />

      <PortalMain>{children}</PortalMain>

      <ChatPanel counsellor={counsellor} />
    </PortalShell>
  );
}