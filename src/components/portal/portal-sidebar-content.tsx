"use client";

// src/components/portal/portal-sidebar-content.tsx
// Everything that lives in the portal sidebar: profile card, counsellor card
// and the main menu. One component, two homes: the fixed desktop <aside> in
// portal-nav.tsx and the slide-in sheet on phones (portal-mobile-sidebar.tsx).
// Keeping a single copy means the two can never drift apart.
//
// Menu items without an href are pages that are not built yet. They show a
// "Soon" tag instead of a link, so nothing leads to a 404. Give one an href
// when its page exists.
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  FileStack,
  Folder,
  Gift,
  Heart,
  House,
  MessageSquareWarning,
  User,
  type LucideIcon,
} from "lucide-react";
import { elevation1 } from "@/components/dashboard/styles";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { APPLICATIONS_PAGE, isCatalogPath } from "@/lib/portal-paths";
import { cn } from "@/lib/utils";
import { CounsellorCard } from "./counsellor-card";
import { ProfileCard } from "./profile-card";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  match?: (pathname: string) => boolean;
  highlight?: boolean;
};

const MENU: MenuItem[] = [
  { label: "Home", icon: House, href: "/portal", match: (p) => p === "/portal" },
  { label: "Profile", icon: User, href: "/portal/profile", match: (p) => p.startsWith("/portal/profile") },
  { label: "Documents", icon: Folder },
  { label: "Shortlist", icon: Heart },
  {
    label: "Applications",
    icon: FileStack,
    href: APPLICATIONS_PAGE,
    // The application wizard lives at /portal/<terminal>/<application>
    match: (p) => p !== "/portal" && !p.startsWith("/portal/profile") && !isCatalogPath(p),
  },
  { label: "Meet", icon: CalendarDays },
  { label: "Refer & Earn", icon: Gift, highlight: true },
  { label: "Report counsellor", icon: MessageSquareWarning },
];

type PortalSidebarContentProps = {
  user: { name: string | null; email: string | null; image?: string | null };
  counsellor: PortalCounsellor | null;
  /** Called when a link inside the sidebar is followed. The mobile sheet uses it to close itself. */
  onNavigate?: () => void;
};

export function PortalSidebarContent({ user, counsellor, onNavigate }: PortalSidebarContentProps) {
  const pathname = usePathname();

  return (
  <div className="space-y-4">
    <ProfileCard name={user.name} email={user.email} image={user.image} />

    <div>
      <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/50">Your counsellor</p>
      <CounsellorCard counsellor={counsellor} onNavigate={onNavigate} />
    </div>

    <nav aria-label="Main" className="space-y-0.5 pt-1">
      {MENU.map(({ label, icon: Icon, href, match, highlight }) => {
        const active = href && match ? match(pathname) : false;
        const base = "flex h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition";

        if (!href) {
          return (
            <div
              key={label}
              aria-disabled="true"
              title="Coming soon"
              className={cn(
                base,
                "cursor-not-allowed select-none",
                highlight ? "bg-ruby-500/20 text-ruby-200" : "text-white/35"
              )}
            >
              <Icon size={20} />
              <span className="flex-1">{label}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                Soon
              </span>
            </div>
          );
        }

        return (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              base,
              "outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/60",
              active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon size={20} className={active ? "text-ruby-400" : "text-white/55"} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={18} className={active ? "text-ruby-400" : "text-white/35"} />
          </Link>
        );
      })}
    </nav>
  </div>
);
}