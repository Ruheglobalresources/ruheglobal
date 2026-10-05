"use client";

// src/components/portal/portal-mobile-sidebar.tsx
// The portal sidebar for phones and tablets (below lg). Same Sheet component
// the homepage MobileNavSheet uses, but sliding in from the left. The trigger
// is the hamburger in the portal top bar.
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { PortalSidebarContent } from "./portal-sidebar-content";

type PortalMobileSidebarProps = {
  user: { name: string | null; email: string | null };
  counsellor: PortalCounsellor | null;
};

export function PortalMobileSidebar({ user, counsellor }: PortalMobileSidebarProps) {
  const [open, setOpen] = useState(false);

  // If the window grows to desktop width while the sheet is open, the fixed
  // sidebar takes over, so close the sheet instead of leaving its overlay behind.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-ink outline-none transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ruby-500/50 lg:hidden"
        >
          <Menu size={22} />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="h-dvh w-[88%] max-w-sm gap-0 bg-white p-0 sm:max-w-sm lg:hidden">
        <SheetHeader className="shrink-0 border-b border-neutral-100 py-4 pl-4 pr-12">
          <SheetTitle className="font-display text-xl font-semibold tracking-tight text-ruby-600">
            Ruhe<span className="text-ink"> Global Resources</span>
          </SheetTitle>
          <SheetDescription className="sr-only">Portal navigation</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <PortalSidebarContent user={user} counsellor={counsellor} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}