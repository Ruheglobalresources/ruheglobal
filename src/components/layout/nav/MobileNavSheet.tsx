// src/components/nav/MobileNavSheet.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { LogoOrbit } from "../LogoRings";
import { AiCourseSearchBox } from "./AiCourseSearchBox";
import { PROGRAM_LINKS, SERVICE_COLUMNS } from "@/data/site-nav";

const PHONE_DISPLAY = "+234 707 918 8996";
const PHONE_HREF = "tel:+2347079188996";

// Same accent order as ServicesMegaPanel, so a service keeps the same color
// whether someone sees it on desktop or mobile.
const COLUMN_ACCENTS = [
  { pill: "bg-teal", tick: "border-l-teal" },
  { pill: "bg-ember", tick: "border-l-ember" },
  { pill: "bg-ruby", tick: "border-l-ruby" },
  { pill: "bg-gold", tick: "border-l-gold" },
] as const;

type SectionKey = "programs" | "services";

export function MobileNavSheet() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SectionKey | null>(null);

  const toggleSection = (key: SectionKey) =>
    setSection((current) => (current === key ? null : key));

  const closeAll = () => {
    setOpen(false);
    setSection(null);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember lg:hidden"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </SheetTrigger>

      {/* [&>button]:hidden strips shadcn's default top-right close icon —
          the hero below has its own close button, so we don't want two. */}
      <SheetContent
        side="right"
        className="inset-y-0 h-[100dvh] w-screen max-w-none border-0 bg-white p-0 sm:max-w-none [&>button]:hidden"
      >
        <SheetTitle className="sr-only">Site menu</SheetTitle>

        <div className="flex h-full flex-col overflow-hidden">
          {/* hero */}
          <div className="shrink-0 bg-ink px-5 pb-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                <LogoOrbit size={60} speed={2} className="h-15 w-15 shrink-0" />
                <div className="flex min-w-0 flex-col justify-center leading-none">
                  <span className="font-display text-[30px] font-extrabold tracking-wide text-ruby">
                    RUHE
                  </span>
                  <span className="mt-1 text-[13px] font-medium uppercase tracking-[0.18em] text-ruby/90">
                    Global Resources
                  </span>
                </div>
              </div>
              <SheetClose asChild>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-cloud transition-colors hover:bg-cloud/10"
                >
                  <X size={21} />
                </button>
              </SheetClose>
            </div>

            <p className="mt-4 text-sm font-medium text-cloud/70">
              Search for a course or institution
            </p>
            <div className="mt-2.5">
              <AiCourseSearchBox id="mobile-nav-search" />
            </div>
          </div>

          {/* scrollable body */}
          <nav className="flex-1 overflow-y-auto px-5 py-2">
            <Link
              href="/school-search"
              onClick={closeAll}
              className="flex items-center justify-between border-b border-ink/10 py-4 text-[15px] font-semibold text-ink"
            >
              Schools
              <ArrowRight size={16} className="text-ink/30" />
            </Link>

            {/* Programs */}
            <div className="border-b border-ink/10">
              <button
                type="button"
                onClick={() => toggleSection("programs")}
                aria-expanded={section === "programs"}
                className="flex w-full items-center justify-between py-4 text-[15px] font-semibold text-ink"
              >
                Programs
                <ChevronDown
                  size={17}
                  className={`text-ink/40 transition-transform ${
                    section === "programs" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {section === "programs" && (
                <div className="flex flex-col gap-1 pb-4">
                  {PROGRAM_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeAll}
                        className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-ink/5"
                      >
                        <Icon size={17} className="mt-0.5 shrink-0 text-ink/40" />
                        <span>
                          <span className="block text-sm font-semibold text-ink">
                            {link.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-ink/55">
                            {link.blurb}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Services */}
            <div className="border-b border-ink/10">
              <button
                type="button"
                onClick={() => toggleSection("services")}
                aria-expanded={section === "services"}
                className="flex w-full items-center justify-between py-4 text-[15px] font-semibold text-ink"
              >
                Services
                <ChevronDown
                  size={17}
                  className={`text-ink/40 transition-transform ${
                    section === "services" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {section === "services" && (
                <div className="flex flex-col gap-5 pb-4">
                  {SERVICE_COLUMNS.map((column, i) => {
                    const accent = COLUMN_ACCENTS[i % COLUMN_ACCENTS.length];
                    return (
                      <div key={column.title}>
                        <p
                          className={`${accent.pill} inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white`}
                        >
                          {column.title}
                        </p>
                        <div className="mt-1.5 flex flex-col">
                          {column.links.map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeAll}
                                className={`flex items-start gap-3 border-l-[3px] border-l-transparent px-2 py-2.5 transition-colors hover:bg-ink/5 ${accent.tick}`}
                              >
                                <Icon size={16} className="mt-0.5 shrink-0 text-ink/40" />
                                <span>
                                  <span className="block text-sm font-semibold text-ink">
                                    {link.label}
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-snug text-ink/55">
                                    {link.blurb}
                                  </span>
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/about"
              onClick={closeAll}
              className="block border-b border-ink/10 py-4 text-[15px] font-semibold text-ink"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={closeAll}
              className="block border-b border-ink/10 py-4 text-[15px] font-semibold text-ink"
            >
              Contact
            </Link>
          </nav>

          {/* bottom actions */}
          <div className="shrink-0 border-t border-ink/10 bg-white px-5 py-4">
            <div className="flex flex-col gap-2.5">
              <a
                href={PHONE_HREF}
                onClick={closeAll}
                className="flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-3 text-center text-sm font-medium text-ink transition-colors hover:bg-ink/5"
              >
                <Phone size={16} className="text-ruby" />
                {PHONE_DISPLAY}
              </a>
              <Link
                href="/auth/login"
                onClick={closeAll}
                className="rounded-full border border-ink/15 px-4 py-3 text-center text-sm font-medium text-ink transition-colors hover:bg-ink/5"
              >
                Login to portal
              </Link>
              <Link
                href="/contact"
                onClick={closeAll}
                className="rounded-full bg-ruby px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-ruby-600"
              >
                Book free consultation
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}