// Navbar.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import  { LogoOrbit } from "./LogoRings";
import { MessageBox } from "./MessageBox";

const NAV_LINKS = [
  { label: "Top Schools", href: "#top-schools" },
  { label: "Services", href: "#services" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-30 border-b border-cloud/10 bg-ink/40 shadow-lg shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 md:gap-6 px-2 md:px-5 py-2 md:py-4 lg:px-10">
        {/* logo + brand */}
        <a
          href="#"
  className="flex min-w-0 items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember lg:shrink-0"
>
  <LogoOrbit size={60} speed={2} className="h-15 w-15 shrink-0" />

   {/* Mobile brand */}
  <div className="flex min-w-0 flex-col justify-center leading-none md:">
    <span className="font-display text-[30px] md:text-[35px] font-extrabold tracking-wide text-ruby">
      RUHE
    </span>
    <span className="mt-1 text-[13px] md:text-[15px] font-medium uppercase tracking-[0.18em] text-ruby/90">
      Global Resources
    </span>
  </div>

  {/* Desktop brand 
  <span className="hidden truncate font-display text-lg font-semibold tracking-wide text-ruby sm:text-xl lg:block lg:text-2xl">
    Ruhe Global Resources
  </span> */}

</a>

        {/* desktop nav links — spread across the middle, like the reference */}
        <nav className="hidden flex-1 items-center justify-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-cloud/85 transition-colors hover:text-cloud focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* desktop CTAs — Login / Start Free / Book Free Consultation */}
        <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
           <MessageBox />
            <div className="flex items-center gap-2.5">
          <Link
            href="/auth/login"
            className="rounded-full bg-[#1F023F] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2c0759] focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink transition-colors hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            Start Free
          </Link>
          <a
            href="#contact"
            className="rounded-full bg-ruby px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-ruby-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            Book Free Consultation
          </a>
          </div>
        </div>

       {/* mobile actions */}
<div className="flex shrink-0 items-center gap-2 lg:hidden">

  {/* Message */}
  <MessageBox mobile />

  {/* Menu */}
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
            <nav className="flex flex-col divide-y divide-cloud/10 px-5 py-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-sm font-medium text-cloud/90 transition-colors hover:text-cloud focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
                >
                  {link.label}
                </a>
              ))}
              <div className="my-2 flex flex-col gap-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[#1F023F] px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-[#2c0759]"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-gold px-4 py-3 text-center text-sm font-semibold text-ink transition-colors hover:brightness-95"
                >
                  Start Free
                </Link>
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-ruby px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-ruby-600"
                >
                  Book Free Consultation
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}