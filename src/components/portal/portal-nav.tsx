"use client";

// src/components/portal/portal-nav.tsx
// Desktop: ONE frame made of the sidebar and the top navbar together (like the
// Paystack dashboard). Its colour is --portal-frame, set once in portal-shell.tsx.
// The navbar is not a separate bar stacked on the sidebar: its first cell
// is the sidebar's own header (the logo), so the logo row, the doors and
// Courses / Institutions all sit on one continuous strip, and the sidebar menu hangs
// from it. Each sidebar has exactly one door, and it sits outside the bar:
//   - menu door: right after the sidebar, in the navbar
//   - chat door: at the right end of the navbar, next to the chat bar
// Phones: the bottom bar (portal-bottom-bar.tsx); its Chat tab opens the chat as a full page (/portal/chat).
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
  PanelRightClose,
  PanelRightOpen,
  User,
  type LucideIcon,
} from "lucide-react";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { cn } from "@/lib/utils";
import { CounsellorCard } from "./counsellor-card";
import { isCatalogPath } from "@/lib/portal-paths";
import { LEFT_EXPANDED, usePortalShell } from "./portal-shell";
import { ProfileCard } from "./profile-card";
import { PortalBottomBar } from "../portal-bottom-bar";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  match?: (pathname: string) => boolean;
  highlight?: boolean;
};

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

const door =
  "relative grid size-9 shrink-0 place-items-center rounded-lg text-ink/60 outline-none transition hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-ruby-500/60";

const TOP_LINKS = [
  { label: "Courses", href: "/courses", icon: GraduationCap },
  { label: "Institutions", href: "/institutions", icon: Building2 },
];

export function PortalNav({ user, counsellor }: PortalNavProps) {
  const pathname = usePathname();
  const { ready, dragging, leftCollapsed: userCollapsed, toggleLeft, chatOpen, setChatOpen, unread } = usePortalShell();

  // Hover-peek: only when the user has closed the panel. Hovering the icon rail
  // shows the full sidebar over the page; leaving it closes it again. If the
  // user has the panel open, hover does nothing. `collapsed` is what gets drawn.
  const [hovered, setHovered] = useState(false);
  const peek = userCollapsed && hovered;
  const collapsed = userCollapsed && !hovered;

  const animate = ready && !dragging;
  const leftLabel = userCollapsed ? "Expand sidebar" : "Collapse sidebar";
  const LeftIcon = userCollapsed ? PanelLeftOpen : PanelLeftClose;
  const rightLabel = chatOpen ? "Collapse chat" : unread ? `Open chat, ${unread} unread` : "Open chat";
  const RightIcon = chatOpen ? PanelRightClose : PanelRightOpen;

  return (
    <>
      {/* ONE frame, desktop. Row 1 (this header) = sidebar header + navbar on a single strip. */}
      <header
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-14 items-center bg-[var(--portal-frame)] lg:flex",
          animate && "transition-[right] duration-200 ease-out motion-reduce:transition-none"
        )}
        style={{ right: "var(--portal-right)" }}
      >
        {/* The sidebar's own header cell: same width as the sidebar, so strip and sidebar are one piece */}
        <div
          className={cn(
            "flex h-full shrink-0 items-center px-3",
            animate && "transition-[width] duration-200 ease-out motion-reduce:transition-none"
          )}
          style={{ width: "var(--portal-left)" }}
        >
          {userCollapsed ? (
            <Link
              href="/portal"
              aria-label="Ruhe Global Resources"
              title="Ruhe Global Resources"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-ruby-500 font-display text-lg font-semibold text-white outline-none transition hover:bg-ruby-600 focus-visible:ring-2 focus-visible:ring-ruby-500/60"
            >
              R
            </Link>
          ) : (
            <Link
              href="/portal"
              className="min-w-0 truncate pl-1 font-display text-lg font-semibold tracking-tight text-ruby-600 outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/60"
            >
              Ruhe<span className="text-ink"> Global Resources</span>
            </Link>
          )}
        </div>

        {/* Menu door: the only one for the menu sidebar */}
        <button
          type="button"
          onClick={toggleLeft}
          aria-label={leftLabel}
          aria-expanded={!userCollapsed}
          title={leftLabel}
          className={door}
        >
          <LeftIcon size={20} />
        </button>

        <nav aria-label="Catalog" className="ml-2 flex items-center gap-1">
          {TOP_LINKS.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ruby-500/60",
                  active ? "bg-ruby-50 text-ruby-700" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                )}
              >
                <Icon size={16} className={active ? "text-ruby-600" : "text-ink/45"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Chat door: the only one for the chat sidebar */}
        <button
          type="button"
          onClick={() => setChatOpen(!chatOpen)}
          aria-label={rightLabel}
          aria-expanded={chatOpen}
          title={rightLabel}
          className={cn(door, "mr-3")}
        >
          <RightIcon size={20} />
          {!chatOpen && unread > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-ruby-500 px-1 text-[11px] font-semibold leading-5 text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </header>

      {/* Row 2: the sidebar body, hanging from the strip. Same colour as the strip, no seam, no border. */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 top-14 z-20 hidden flex-col overflow-hidden bg-[var(--portal-frame)] lg:flex",
          peek && "shadow-[8px_0_24px_rgba(16,27,45,0.12)]",
          animate && "transition-[width] duration-200 ease-out motion-reduce:transition-none"
        )}
        // While peeking, the aside grows over the page. --portal-left stays at the
        // rail width, so the page content does not move.
        style={{ width: peek ? `${LEFT_EXPANDED}px` : "var(--portal-left)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* The whole sidebar body scrolls, so its scrollbar starts right under the navbar */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-3 pt-2 [scrollbar-color:rgba(16,27,45,0.25)_transparent] [scrollbar-width:thin]",
            collapsed ? "px-2" : "px-3"
          )}
        >
          <div className={cn("space-y-3", collapsed && "flex flex-col items-center")}>
            <ProfileCard name={user.name} email={user.email} compact={collapsed} />

            {collapsed ? (
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                aria-label={counsellor?.name ? `Message ${counsellor.name}` : "Message your counsellor"}
                title={counsellor?.name ? `Message ${counsellor.name}` : "Message your counsellor"}
                className="relative grid size-10 place-items-center rounded-full outline-none transition hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-ruby-500/60"
              >
                {counsellor?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={counsellor.image} alt="" className="size-9 rounded-full object-cover" />
                ) : counsellor ? (
                  <span className="grid size-9 place-items-center rounded-full bg-ruby-50 text-base font-semibold text-ruby-700">
                    {(counsellor.name ?? "C").charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <MessageCircle size={20} className="text-ink/60" />
                )}
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-ruby-500 px-1 text-[11px] font-semibold leading-5 text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            ) : (
              <div>
                <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wider text-ink/50">Your counsellor</p>
                <CounsellorCard counsellor={counsellor} />
              </div>
            )}

            <nav
              aria-label="Main"
              className={cn(collapsed ? "flex flex-col items-center gap-1" : "space-y-0.5 pt-1")}
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
                      className={cn(rail, "cursor-not-allowed select-none", highlight ? "bg-ruby-500/10 text-ruby-700" : "text-ink/30")}
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
                    className={cn(rail, active ? cn("bg-ruby-50 text-ruby-700", accentBar("-left-2")) : "text-ink/65 hover:bg-ink/5 hover:text-ink")}
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
                    className={cn(base, "cursor-not-allowed select-none", highlight ? "bg-ruby-500/10 text-ruby-700" : "text-ink/35")}
                  >
                    <Icon size={20} />
                    <span className="flex-1">{label}</span>
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink/55">
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
                  className={cn(base, active ? cn("bg-ruby-50 text-ruby-700", accentBar("-left-3")) : "text-ink/70 hover:bg-ink/5 hover:text-ink")}
                >
                  <Icon size={20} className={active ? "text-ruby-600" : "text-ink/45"} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={18} className={active ? "text-ruby-600" : "text-ink/35"} />
                </Link>
              );
            })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Bottom bar (phones and tablets): a shared component, also used on the public courses and institutions pages */}
      <PortalBottomBar unread={unread} />
    </>
  );
}