"use client";

import Link from "next/link";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ActionsMenuItem =
  | { type: "separator" }
  | {
      type?: "item";
      label: string;
      icon?: LucideIcon;
      href?: string;
      onSelect?: () => void;
      variant?: "default" | "destructive";
      disabled?: boolean;
    };

/**
 * The "..." button used on admin table rows. Pass `href` for a plain
 * navigation item, or `onSelect` for anything else (opening a controlled
 * dialog, running a confirm-and-delete, etc). `onSelect` handlers that open
 * a dialog should call `event.preventDefault()`-free — Radix already defers
 * closing until after `onSelect` runs, which is what lets a controlled
 * Dialog's `open` state flip a beat later without the two fighting for focus.
 */
export function ActionsMenu({ items, label = "Actions" }: { items: ActionsMenuItem[]; label?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" title={label}>
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item, i) => {
          if (item.type === "separator") return <DropdownMenuSeparator key={`sep-${i}`} />;
          const Icon = item.icon;
          if (item.href) {
            return (
              <DropdownMenuItem key={item.label} asChild variant={item.variant}>
                <Link href={item.href}>
                  {Icon && <Icon size={14} />}
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem
              key={item.label}
              variant={item.variant}
              disabled={item.disabled}
              onSelect={(e) => {
                // Keep the menu's own close animation, just make sure it
                // doesn't swallow focus before our handler (e.g. opening a
                // Dialog) gets to run.
                item.onSelect?.();
                void e;
              }}
            >
              {Icon && <Icon size={14} />}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}