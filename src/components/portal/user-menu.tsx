"use client";

// src/components/portal/user-menu.tsx
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { logout } from "@/actions/auth/logout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ name, email, image }: { name: string | null; email: string | null; image?: string | null }) {
  const initial = (name ?? email ?? "?").trim().charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="grid size-10 place-items-center overflow-hidden rounded-full bg-ruby-500 text-base font-semibold text-white shadow-sm outline-none transition hover:bg-ruby-600 focus-visible:ring-2 focus-visible:ring-ruby-500/50 focus-visible:ring-offset-2"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          initial
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-2xl p-1.5">
        <DropdownMenuLabel className="px-3 py-2">
          <p className="truncate text-sm font-semibold text-ink">{name ?? "Your account"}</p>
          {email && <p className="truncate text-xs font-normal text-neutral-500">{email}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer gap-2 rounded-xl px-3 py-2 text-sm">
          <Link href="/portal/profile">
            <UserRound size={16} /> My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => logout()} className="cursor-pointer gap-2 rounded-xl px-3 py-2 text-sm">
          <LogOut size={16} /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}