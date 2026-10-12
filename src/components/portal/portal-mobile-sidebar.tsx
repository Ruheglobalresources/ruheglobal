"use client";

// src/components/portal/portal-mobile-sidebar.tsx
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
  user: { name: string | null; email: string | null; image?: string | null };
  counsellor: PortalCounsellor | null;
};

export function PortalMobileSidebar({ user, counsellor }: PortalMobileSidebarProps) {
  const [open, setOpen] = useState(false);

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

      <SheetContent
        side="left"
        className="h-dvh w-[88%] max-w-sm gap-0 border-white/10 bg-ink p-0 sm:max-w-sm lg:hidden [&>button]:text-white/70 [&>button]:hover:text-white"
      >
        <SheetHeader className="shrink-0 border-b border-white/10 py-4 pl-4 pr-12">
          <SheetTitle className="font-display text-xl font-semibold tracking-tight text-ruby-400">
            Ruhe<span className="text-white"> Global Resources</span>
          </SheetTitle>
          <SheetDescription className="sr-only">Portal navigation</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]">
          <PortalSidebarContent user={user} counsellor={counsellor} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}