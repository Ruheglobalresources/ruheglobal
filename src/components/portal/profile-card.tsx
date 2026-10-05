"use client";

// src/components/portal/profile-card.tsx
// The card at the top of the sidebar. The chevron opens the account menu.
import { ChevronDown, LogOut } from "lucide-react";
import { logout } from "@/actions/auth/logout";
import { elevation1 } from "@/components/dashboard/styles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ProfileCard({
  name,
  email,
  compact = false,
}: {
  name: string | null;
  email: string | null;
  compact?: boolean;
}) {
  const label = name ?? email ?? "Your account";
  const initial = label.trim().charAt(0).toUpperCase();

  // Collapsed sidebar: just the avatar. It still opens the account menu.
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Account menu for ${label}`}
          title={label}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-ruby-500 text-lg font-semibold text-white outline-none transition hover:bg-ruby-600 focus-visible:ring-2 focus-visible:ring-ruby-500/50 focus-visible:ring-offset-2"
        >
          {initial}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right" className="w-64 rounded-2xl p-1.5">
          <DropdownMenuItem onSelect={() => logout()} className="cursor-pointer gap-2 rounded-xl px-3 py-2 text-sm">
            <LogOut size={16} /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-3xl border border-neutral-200 bg-white p-4 text-left outline-none transition hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-ruby-500/50",
          elevation1
        )}
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ruby-500 text-lg font-semibold text-white">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">{label}</span>
          {name && email && <span className="block truncate text-sm text-neutral-500">{email}</span>}
        </span>
        <ChevronDown size={20} className="shrink-0 text-neutral-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-2xl p-1.5">
        <DropdownMenuItem onSelect={() => logout()} className="cursor-pointer gap-2 rounded-xl px-3 py-2 text-sm">
          <LogOut size={16} /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}