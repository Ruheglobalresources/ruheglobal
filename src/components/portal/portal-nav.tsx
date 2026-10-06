"use client";

// src/components/portal/portal-nav.tsx
// Desktop: the sidebar (profile card, counsellor card, menu). Phones: a bottom bar.
//
// Menu items without an href are pages that are not built yet. They show a
// "Soon" tag instead of a link, so nothing leads to a 404. Give one an href
// when its page exists.
import { useState } from "react";
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
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { cn } from "@/lib/utils";
import { CounsellorCard } from "./counsellor-card";
import { LEFT_EXPANDED, usePortalShell } from "./portal-shell";
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

// Thin ruby bar on the screen edge next to the active item. The offset matches
// the aside's padding (p-3 expanded, p-2 collapsed) so the bar touches the edge.
const accentBar = (offset: string) =>
  `before:absolute before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-ruby-500 ${
    offset === "-left-2" ? "before:-left-2" : "before:-left-3"
  }`;

type PortalNavProps = {
  user: { name: string | null; email: string | null };
  counsellor: PortalCounsellor | null;
};

export function PortalNav({ user, counsellor }: PortalNavProps) {
  const pathname = usePathname();
  const { ready, dragging, leftCollapsed: userCollapsed, toggleLeft, setChatOpen, unread } = usePortalShell();

  // Hover-peek: only when the user has closed the panel. Hovering the icon rail
  // shows the full sidebar over the page; leaving it closes it again. If the
  // user has the panel open, hover does nothing. `collapsed` is what gets drawn.
  const [hovered, setHovered] = useState(false);
  const peek = userCollapsed && hovered;
  const collapsed = userCollapsed && !hovered;

  const toggleLabel = userCollapsed ? "Expand sidebar" : "Collapse sidebar";
  const ToggleIcon = userCollapsed ? PanelLeftOpen : PanelLeftClose;
  const toggle = (
    <button
      type="button"
      onClick={() => {
        setHovered(false); // closing collapses right away, even with the cursor still over it
        toggleLeft();
      }}
      aria-label={toggleLabel}
      aria-expanded={!userCollapsed}
      title={toggleLabel}
      className="grid size-9 shrink-0 place-items-center rounded-full text-white/70 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-ruby-500/60"
    >
      <ToggleIcon size={20} />
    </button>
  );

  return (
    <>
      {/* Sidebar (desktop): full menu, or an icon rail when collapsed */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 hidden overflow-y-auto overflow-x-hidden bg-ink [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] lg:block",
          collapsed ? "p-2" : "p-3",
          peek && "shadow-[8px_0_24px_rgba(16,27,45,0.3)]",
          ready && !dragging && "transition-[width] duration-200 ease-out"
        )}
        // While peeking, the aside grows over the page. --portal-left stays at the
        // rail width, so the page content does not move.
        style={{ width: peek ? `${LEFT_EXPANDED}px` : "var(--portal-left)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={cn("space-y-3", collapsed && "flex flex-col items-center")}>
          {collapsed ? (
            <>
              <Link
                href="/portal"
                aria-label="Ruhe Global Resources"
                title="Ruhe Global Resources"
                className="grid size-10 place-items-center rounded-xl bg-ruby-500 font-display text-lg font-semibold text-white outline-none transition hover:bg-ruby-600 focus-visible:ring-2 focus-visible:ring-ruby-500/60"
              >
                R
              </Link>
              {toggle}
            </>
          ) : (
            <div className="flex h-10 items-center justify-between gap-2 pl-1">
              <Link
                href="/portal"
                className="min-w-0 truncate font-display text-lg font-semibold tracking-tight text-ruby-400 outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/60"
              >
                Ruhe<span className="text-white"> Global Resources</span>
              </Link>
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
              className="relative grid size-10 place-items-center rounded-full outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ruby-500/60"
            >
              {counsellor?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={counsellor.image} alt="" className="size-9 rounded-full object-cover" />
              ) : counsellor ? (
                <span className="grid size-9 place-items-center rounded-full bg-ruby-50 text-base font-semibold text-ruby-700">
                  {(counsellor.name ?? "C").charAt(0).toUpperCase()}
                </span>
              ) : (
                <MessageCircle size={20} className="text-white/70" />
              )}
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-ruby-500 px-1 text-[11px] font-semibold leading-5 text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          ) : (
            <div>
              <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-white/50">Your counsellor</p>
              <CounsellorCard counsellor={counsellor} />
            </div>
          )}

          <nav
            aria-label="Main"
            className={cn(
              collapsed
                ? "flex flex-col items-center gap-1"
                : "space-y-0.5 pt-1"
            )}
          >
            {MENU.map(({ label, icon: Icon, href, match, highlight }) => {
              const active = href && match ? match(pathname) : false;

              if (collapsed) {
                const rail =
                  "relative grid size-10 place-items-center rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-ruby-500/60";
                if (!href) {
                  return (
                    <div
                      key={label}
                      aria-disabled="true"
                      aria-label={`${label} (coming soon)`}
                      title={`${label} (coming soon)`}
                      className={cn(rail, "cursor-not-allowed select-none", highlight ? "bg-ruby-500/20 text-ruby-200" : "text-white/30")}
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
                    className={cn(rail, active ? cn("bg-white/10 text-white", accentBar("-left-2")) : "text-white/65 hover:bg-white/10 hover:text-white")}
                  >
                    <Icon size={20} />
                  </Link>
                );
              }

              const base = "relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition";

              if (!href) {
                return (
                  <div
                    key={label}
                    aria-disabled="true"
                    title="Coming soon"
                    className={cn(base, "cursor-not-allowed select-none", highlight ? "bg-ruby-500/20 text-ruby-200" : "text-white/35")}
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
                  aria-current={active ? "page" : undefined}
                  className={cn(base, active ? cn("bg-white/10 text-white", accentBar("-left-3")) : "text-white/70 hover:bg-white/10 hover:text-white")}
                >
                  <Icon size={20} className={active ? "text-ruby-400" : "text-white/55"} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={18} className={active ? "text-ruby-400" : "text-white/35"} />
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