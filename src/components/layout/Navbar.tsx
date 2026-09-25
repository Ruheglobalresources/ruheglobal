"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import Link from "next/link";
import { LogoOrbit } from "./LogoRings";
import { MessageBox } from "./MessageBox";
import { NavMenuTrigger } from "./nav/NavMenuTrigger";
import { ServicesMegaPanel } from "./nav/ServicesMegaPanel";
import { SchoolsMegaPanel } from "./nav/SchoolsMegaPanel";
import { SimpleDropdownPanel } from "./nav/SimpleDropdownPanel";
import { PROGRAM_LINKS, SERVICE_COLUMNS } from "@/data/site-nav";

const PHONE_DISPLAY = "+234 707 918 8996";
const PHONE_HREF = "tel:+2347079188996";

type MenuKey = "schools" | "programs" | "services";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const toggleMobileSection = (key: string) =>
    setMobileSection((current) => (current === key ? null : key));

  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = (key: MenuKey) => {
    clearCloseTimer();
    setActiveMenu(key);
  };

  const toggleMenu = (key: MenuKey) =>
    setActiveMenu((current) => (current === key ? null : key));

  const closeMenuSoon = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setActiveMenu(null), 180);
  };

  const closeMenuNow = () => {
    clearCloseTimer();
    setActiveMenu(null);
  };

  useEffect(() => {
    if (!activeMenu) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenuNow();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeMenuNow();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [activeMenu]);

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <header
      ref={headerRef}
      onMouseLeave={closeMenuSoon}
      className="absolute inset-x-0 top-0 z-30 border-b border-cloud/10 bg-ink/40 shadow-lg shadow-black/20 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 md:gap-4 px-2 md:px-5 py-2 md:py-4 lg:px-5">
        {/* logo + brand */}
        <a
          href="/"
          className="flex min-w-0 items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember lg:shrink-0"
        >
          <LogoOrbit size={60} speed={2} className="h-15 w-15 shrink-0" />

          <div className="flex min-w-0 flex-col justify-center leading-none">
            <span className="font-display text-[30px] md:text-[35px] font-extrabold tracking-wide text-ruby">
              RUHE
            </span>
            <span className="mt-1 text-[13px] md:text-[15px] font-medium uppercase tracking-[0.18em] text-ruby/90">
              Global Resources
            </span>
          </div>
        </a>

        {/* desktop nav links */}
        <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
          <NavMenuTrigger
            label="Schools"
            active={activeMenu === "schools"}
            onOpen={() => openMenu("schools")}
            onToggle={() => toggleMenu("schools")}
          />
          <NavMenuTrigger
            label="Programs"
            active={activeMenu === "programs"}
            onOpen={() => openMenu("programs")}
            onToggle={() => toggleMenu("programs")}
          />
          <NavMenuTrigger
            label="Services"
            active={activeMenu === "services"}
            onOpen={() => openMenu("services")}
            onToggle={() => toggleMenu("services")}
          />

          <Link
            href="/about"
            className="text-sm font-medium text-cloud/85 transition-colors hover:text-cloud focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-cloud/85 transition-colors hover:text-cloud focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            Contact
          </Link>
        </nav>

        {/* desktop CTAs */}
        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <MessageBox />

          <a
            href={PHONE_HREF}
            className="hidden items-center gap-2 text-sm font-medium text-cloud/85 transition-colors hover:text-cloud focus:outline-none focus-visible:ring-2 focus-visible:ring-ember xl:flex"
          >
            <Phone size={16} className="text-ember" />
            {PHONE_DISPLAY}
          </a>

          <div className="flex items-center gap-2.5">
            <Link
              href="/auth/login"
              className="rounded-full border border-cloud/25 px-5 py-2 text-sm font-medium text-cloud transition-colors hover:border-cloud/50 hover:bg-cloud/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              Login to portal
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-ruby px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-ruby-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              Book free consultation
            </Link>
          </div>
        </div>

        {/* mobile actions */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <a
            href={PHONE_HREF}
            aria-label={`Call us at ${PHONE_DISPLAY}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-cloud transition-colors hover:bg-cloud/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            <Phone size={19} />
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-cloud transition-colors hover:bg-cloud/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden border-t border-cloud/10 bg-ink/60 backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex max-h-[75vh] flex-col divide-y divide-cloud/10 overflow-y-auto px-5 py-2">
              {/* Top schools — flat link */}
              <Link
                href="/school-search"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-medium text-cloud/90 transition-colors hover:text-cloud"
              >
                Schools
              </Link>

              {/* Programs accordion */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => toggleMobileSection("programs")}
                  aria-expanded={mobileSection === "programs"}
                  className="flex w-full items-center justify-between py-2 text-sm font-medium text-cloud/90"
                >
                  Programs
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileSection === "programs" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {mobileSection === "programs" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-3"
                    >
                      {PROGRAM_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 text-sm text-cloud/75 hover:text-cloud"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Services accordion — now includes Exams & Prep */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => toggleMobileSection("services")}
                  aria-expanded={mobileSection === "services"}
                  className="flex w-full items-center justify-between py-2 text-sm font-medium text-cloud/90"
                >
                  Services
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileSection === "services" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {mobileSection === "services" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-3"
                    >
                      {SERVICE_COLUMNS.map((column) => (
                        <div key={column.title} className="py-2">
                          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ember/90">
                            {column.title}
                          </p>
                          {column.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setMobileOpen(false)}
                              className="block py-1.5 text-sm text-cloud/75 hover:text-cloud"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-medium text-cloud/90 transition-colors hover:text-cloud"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-medium text-cloud/90 transition-colors hover:text-cloud"
              >
                Contact
              </Link>

              <div className="my-2 flex flex-col gap-2.5 pt-2">
                <a
                  href={PHONE_HREF}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-cloud/25 px-4 py-3 text-center text-sm font-medium text-cloud transition-colors hover:bg-cloud/5"
                >
                  <Phone size={16} className="text-ember" />
                  Call us now
                </a>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-cloud/25 px-4 py-3 text-center text-sm font-medium text-cloud transition-colors hover:bg-cloud/5"
                >
                  Login to portal
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-ruby px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-ruby-600"
                >
                  Book free consultation
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop mega menu */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-40 hidden border-b border-ink/15 border-t-[3px] border-t-ink bg-cloud lg:block"
          >
            <div className="mx-auto flex w-full max-w-7xl justify-start px-2 md:px-5 lg:px-10">
              {activeMenu === "schools" && <SchoolsMegaPanel />}
              {activeMenu === "programs" && <SimpleDropdownPanel links={PROGRAM_LINKS} />}
              {activeMenu === "services" && <ServicesMegaPanel />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}