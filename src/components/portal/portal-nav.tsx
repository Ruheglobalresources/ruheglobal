"use client";

// src/components/portal/portal-nav.tsx
// Material 3 navigation: a rail on desktop, a bottom bar on phones.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FolderOpen, GraduationCap, House } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/portal", icon: House, match: (p: string) => p === "/portal" },
  { label: "Courses", href: "/portal/courses", icon: GraduationCap, match: (p: string) => p.startsWith("/portal/courses") },
  {
    label: "Institutions",
    href: "/portal/institutions",
    icon: Building2,
    match: (p: string) => p.startsWith("/portal/institutions"),
  },
  {
    label: "Applications",
    href: "/portal#applications",
    icon: FolderOpen,
    // Application wizard pages live at /portal/<terminal>/<application>
    match: (p: string) => p !== "/portal" && !p.startsWith("/portal/courses") && !p.startsWith("/portal/institutions"),
  },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop rail */}
      <nav aria-label="Main" className="fixed inset-y-0 left-0 top-16 z-20 hidden w-60 flex-col gap-1 border-r border-neutral-200 bg-white p-3 lg:flex">
        {items.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 items-center gap-3 rounded-full px-4 text-sm font-medium transition",
                active ? "bg-ruby-50 text-ruby-700" : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              <Icon size={20} className={active ? "text-ruby-600" : "text-neutral-500"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {items.map(({ label, href, icon: Icon, match }) => {
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
