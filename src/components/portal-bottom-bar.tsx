"use client";

// src/components/portal/portal-bottom-bar.tsx
// The phone bottom bar (Home, Courses, Institutions, Applications, Chat). One component, mounted in
// two places so it never disappears while someone moves around:
//   - portal-nav.tsx, on every /portal page (passes the unread count from the portal shell)
//   - portal-bottom-bar-gate.tsx, on the public /courses and /institutions pages (no unread badge there:
//     the unread count lives in the portal shell, which only exists under /portal)
// Chat is a real page (/portal/chat) that stops above this bar, so the bar stays visible on it.
// Height: --portal-bottom-bar, defined by the portal shell. It is repeated here as a fallback
// because the public pages have no portal shell.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileStack, GraduationCap, House, MessageCircle, type LucideIcon } from "lucide-react";
import { CHAT_PAGE, isCatalogPath } from "@/lib/portal-paths";
import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  icon: LucideIcon;
  href: string;
  match: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  { label: "Home", icon: House, href: "/portal", match: (p) => p === "/portal" },
  { label: "Courses", icon: GraduationCap, href: "/courses", match: (p) => p.startsWith("/courses") },
  { label: "Institutions", icon: Building2, href: "/institutions", match: (p) => p.startsWith("/institutions") },
  {
    label: "Applications",
    icon: FileStack,
    href: "/portal#applications",
    match: (p) => p !== "/portal" && !isCatalogPath(p),
  },
  { label: "Chat", icon: MessageCircle, href: CHAT_PAGE, match: (p) => p === CHAT_PAGE },
];

export function PortalBottomBar({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      // height: the portal's variable, or the same value on the public pages (no portal shell there)
      style={{ height: "var(--portal-bottom-bar, calc(4.5rem + env(safe-area-inset-bottom)))" }}
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] text-ink lg:hidden"
    >
      {TABS.map(({ label, icon: Icon, href, match }) => {
        const active = match(pathname);
        const isChat = href === CHAT_PAGE;
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={isChat && unread ? `Chat, ${unread} unread` : label}
            className="flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium"
          >
            <span
              className={cn(
                "relative grid h-8 w-16 place-items-center rounded-full transition",
                active ? "bg-ruby-100 text-ruby-700" : "text-neutral-500"
              )}
            >
              <Icon size={20} />
              {isChat && unread > 0 && (
                <span className="absolute right-3 top-0 grid min-w-4 place-items-center rounded-full bg-ruby-500 px-1 text-[10px] font-semibold leading-4 text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
            <span className={active ? "text-ruby-700" : "text-neutral-500"}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}