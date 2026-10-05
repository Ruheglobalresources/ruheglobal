"use client";

// src/components/portal/portal-nav.tsx
// Desktop: the sidebar (profile card, counsellor card, menu). Phones: a bottom bar.
//
// Menu items without an href are pages that are not built yet. They show a
// "Soon" tag instead of a link, so nothing leads to a 404. Give one an href
// when its page exists.
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  FileStack,
  Folder,
  Gift,
  GraduationCap,
  Heart,
  House,
  MessageSquareWarning,
  User,
  type LucideIcon,
} from "lucide-react";
import { elevation1 } from "@/components/dashboard/styles";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
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

const isCatalogPath = (p: string) => p.startsWith("/portal/courses") || p.startsWith("/portal/institutions");

const MENU: MenuItem[] = [
  { label: "Home", icon: House, href: "/portal", match: (p) => p === "/portal" },
  { label: "Profile", icon: User },
  { label: "Documents", icon: Folder },
  { label: "Shortlist", icon: Heart },
  {
    label: "Applications",
    icon: FileStack,
    href: "/portal#applications",
    // The application wizard lives at /portal/<terminal>/<application>
    match: (p) => p !== "/portal" && !isCatalogPath(p),
  },
  { label: "Meet", icon: CalendarDays },
  { label: "Refer & Earn", icon: Gift, highlight: true },
  { label: "Report counsellor", icon: MessageSquareWarning },
];

const BOTTOM: MenuItem[] = [
  { label: "Home", icon: House, href: "/portal", match: (p) => p === "/portal" },
  { label: "Courses", icon: GraduationCap, href: "/portal/courses", match: (p) => p.startsWith("/portal/courses") },
  { label: "Institutions", icon: Building2, href: "/portal/institutions", match: (p) => p.startsWith("/portal/institutions") },
  {
    label: "Applications",
    icon: FileStack,
    href: "/portal#applications",
    match: (p) => p !== "/portal" && !isCatalogPath(p),
  },
];

type PortalNavProps = {
  user: { name: string | null; email: string | null };
  counsellor: PortalCounsellor | null;
};

export function PortalNav({ user, counsellor }: PortalNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar (desktop) */}
      <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-72 space-y-4 overflow-y-auto border-r border-neutral-100 bg-white p-4 lg:block">
        <ProfileCard name={user.name} email={user.email} />

        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Your counsellor</p>
          <CounsellorCard counsellor={counsellor} />
        </div>

        <nav aria-label="Main" className={cn("overflow-hidden rounded-3xl border border-neutral-200 bg-white p-1.5", elevation1)}>
          {MENU.map(({ label, icon: Icon, href, match, highlight }) => {
            const active = href && match ? match(pathname) : false;
            const base = "flex h-12 items-center gap-3 rounded-2xl px-3.5 text-[15px] font-medium transition";

            if (!href) {
              return (
                <div
                  key={label}
                  aria-disabled="true"
                  title="Coming soon"
                  className={cn(base, "cursor-not-allowed select-none", highlight ? "bg-gradient-to-r from-ruby-50 to-ruby-100/70 text-ruby-700" : "text-neutral-400")}
                >
                  <Icon size={20} />
                  <span className="flex-1">{label}</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(base, active ? "bg-ruby-50 text-ruby-700" : "text-neutral-600 hover:bg-neutral-100")}
              >
                <Icon size={20} className={active ? "text-ruby-600" : "text-neutral-500"} />
                <span className="flex-1">{label}</span>
                <ChevronRight size={18} className={active ? "text-ruby-600" : "text-neutral-400"} />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom bar (phones and tablets) */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {BOTTOM.map(({ label, icon: Icon, href, match }) => {
          const active = href && match ? match(pathname) : false;
          return (
            <Link
              key={label}
              href={href!}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium"
            >
              <span
                className={cn(
                  "grid h-8 w-16 place-items-center rounded-full transition",
                  active ? "bg-ruby-100 text-ruby-700" : "text-neutral-500"
                )}
              >
                <Icon size={20} />
              </span>
              <span className={active ? "text-ruby-700" : "text-neutral-500"}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}