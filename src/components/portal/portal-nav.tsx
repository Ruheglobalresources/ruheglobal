"use client";

// src/components/portal/portal-nav.tsx
// Desktop: the sidebar (profile card, counsellor card, menu). Phones: a bottom
// bar. The sidebar contents are shared with the phone sheet, see
// portal-sidebar-content.tsx.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileStack, GraduationCap, House, type LucideIcon } from "lucide-react";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { cn } from "@/lib/utils";
import { isCatalogPath, PortalSidebarContent } from "./portal-sidebar-content";

type BottomItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  match: (pathname: string) => boolean;
};

const BOTTOM: BottomItem[] = [
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
      <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-72 overflow-y-auto border-r border-neutral-100 bg-white p-4 lg:block">
        <PortalSidebarContent user={user} counsellor={counsellor} />
      </aside>

      {/* Bottom bar (phones and tablets) */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {BOTTOM.map(({ label, icon: Icon, href, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={label}
              href={href}
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