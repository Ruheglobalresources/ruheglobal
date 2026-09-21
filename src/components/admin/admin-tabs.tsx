"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  FolderKanban,
  ListChecks,
  Inbox,
  UsersRound,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const TABS: Tab[] = [
  { href: "/admin/terminals", label: "Terminals", icon: LayoutGrid, adminOnly: true },
  { href: "/admin/applications", label: "Applications", icon: FolderKanban, adminOnly: true },
  { href: "/admin/fields", label: "Field Library", icon: ListChecks, adminOnly: true },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox, adminOnly: true },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/counselors", label: "Counselors", icon: UsersRound, adminOnly: true },
];

export function AdminTabs({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const tabs = TABS.filter((tab) => !tab.adminOnly || role === "ADMIN");

  return (
    <div className="border-b bg-white">
      <nav
        className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6"
        aria-label="Admin sections"
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[color:var(--color-ink)] text-white"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              )}
            >
              <Icon size={15} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}