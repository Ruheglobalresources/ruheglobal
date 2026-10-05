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
  MessageCircle,
  MessageSquareWarning,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  type LucideIcon,
} from "lucide-react";
import { elevation1 } from "@/components/dashboard/styles";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { cn } from "@/lib/utils";
import { CounsellorCard } from "./counsellor-card";
import { usePortalShell } from "./portal-shell";
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
  const { ready, dragging, leftCollapsed: collapsed, toggleLeft, setChatOpen, unread } = usePortalShell();

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const toggle = (
    <button
      type="button"
      onClick={toggleLeft}
      aria-label={toggleLabel}
      aria-expanded={!collapsed}
      title={toggleLabel}
      className="grid size-9 shrink-0 place-items-center rounded-full text-neutral-500 outline-none transition hover:bg-neutral-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ruby-500/50"
    >
      <ToggleIcon size={20} />
    </button>
  );

  return (
    <>
      {/* Sidebar (desktop): full menu, or an icon rail when collapsed */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-16 z-20 hidden overflow-y-auto overflow-x-hidden border-r border-neutral-100 bg-white lg:block",
          collapsed ? "p-3" : "p-4",
          ready && !dragging && "transition-[width] duration-200 ease-out"
        )}
        style={{ width: "var(--portal-left)" }}
      >
        <div className={cn("space-y-4", collapsed && "flex flex-col items-center")}>
          {collapsed ? (
            toggle
          ) : (
            <div className="flex items-center justify-between pl-1">
              <span className="text-sm font-semibold text-ink">Menu</span>
              {toggle}
            </div>
          )}

          <ProfileCard name={user.name} email={user.email} compact={collapsed} />

          {collapsed ? (
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label={counsellor?.name ? `Message ${counsellor.name}` : "Message your counsellor"}
              title={counsellor?.name ? `Message ${counsellor.name}` : "Message your counsellor"}
              className="relative grid size-11 place-items-center rounded-full outline-none transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ruby-500/50"
            >
              {counsellor?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={counsellor.image} alt="" className="size-10 rounded-full object-cover" />
              ) : counsellor ? (
                <span className="grid size-10 place-items-center rounded-full bg-ruby-50 text-base font-semibold text-ruby-700">
                  {(counsellor.name ?? "C").charAt(0).toUpperCase()}
                </span>
              ) : (
                <MessageCircle size={22} className="text-neutral-600" />
              )}
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-ruby-500 px-1 text-[11px] font-semibold leading-5 text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          ) : (
            <div>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">Your counsellor</p>
              <CounsellorCard counsellor={counsellor} />
            </div>
          )}

          <nav
            aria-label="Main"
            className={cn(
              collapsed
                ? "flex flex-col items-center gap-1"
                : cn("overflow-hidden rounded-3xl border border-neutral-200 bg-white p-1.5", elevation1)
            )}
          >
            {MENU.map(({ label, icon: Icon, href, match, highlight }) => {
              const active = href && match ? match(pathname) : false;

              if (collapsed) {
                const rail = "grid size-11 place-items-center rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-ruby-500/50";
                if (!href) {
                  return (
                    <div
                      key={label}
                      aria-disabled="true"
                      aria-label={`${label} (coming soon)`}
                      title={`${label} (coming soon)`}
                      className={cn(rail, "cursor-not-allowed select-none", highlight ? "bg-ruby-50 text-ruby-700" : "text-neutral-300")}
                    >
                      <Icon size={20} />
                    </div>
                  );
                }
                return (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    title={label}
                    aria-current={active ? "page" : undefined}
                    className={cn(rail, active ? "bg-ruby-50 text-ruby-600" : "text-neutral-500 hover:bg-neutral-100")}
                  >
                    <Icon size={20} />
                  </Link>
                );
              }

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
        </div>
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