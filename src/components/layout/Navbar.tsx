"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import Link from "next/link";
import { LogoOrbit } from "./LogoRings";
import { MessageBox } from "./MessageBox";
import { NavMenuTrigger } from "./nav/NavMenuTrigger";
import { ServicesMegaPanel } from "./nav/ServicesMegaPanel";
import { SchoolsMegaPanel } from "./nav/SchoolsMegaPanel";
import { SimpleDropdownPanel } from "./nav/SimpleDropdownPanel";
import { MobileNavSheet } from "./nav/MobileNavSheet";
import { PROGRAM_LINKS } from "@/data/site-nav";

const PHONE_DISPLAY = "+234 707 918 8996";
const PHONE_HREF = "tel:+2347079188996";

type MenuKey = "schools" | "programs" | "services";

export function Navbar() {
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  // hide on scroll down, reveal on scroll up
  const [visible, setVisible] = useState(true);
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

  // Scroll direction: down = hide, up = show. Always shown near the top of the
  // page. The small delta ignores trackpad jitter / tiny back-and-forth.
  useEffect(() => {
    const TOP_ZONE = 80;
    const MIN_DELTA = 6;
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(window.scrollY, 0); // iOS rubber-band can go negative
      if (y <= TOP_ZONE) {
        setVisible(true);
        lastY = y;
        return;
      }
      const diff = y - lastY;
      if (Math.abs(diff) < MIN_DELTA) return;
      if (diff > 0) {
        setVisible(false);
        closeMenuNow(); // don't leave a mega menu floating while the bar leaves
      } else {
        setVisible(true);
      }
      lastY = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Publish how much of the top of the viewport the navbar is covering as
  // --nav-offset (0px while hidden). The pinned search widget and any sticky
  // sidebars use it so they sit under the navbar instead of behind it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty("--nav-offset", visible ? `${el.offsetHeight}px` : "0px");
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--nav-offset");
    };
  }, [visible]);

  return (
    <header
      ref={headerRef}
      onMouseEnter={clearCloseTimer}
      onMouseLeave={closeMenuSoon}
      onFocusCapture={() => setVisible(true)}
      style={{ transform: visible ? "translateY(0)" : "translateY(calc(-100% - 32px))" }}
      className="fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out motion-reduce:transition-none border-b border-ink/10 bg-white shadow-lg shadow-black/5 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 md:gap-4 px-2 md:px-5 py-2 md:py-4 lg:px-5">
        {/* logo + brand */}
        
          <a href="/"
          onMouseEnter={closeMenuNow}
          className="flex min-w-0 items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember lg:shrink-0"
        >
          <LogoOrbit size={58} speed={2} className="h-14 w-14 shrink-0" />

          <div className="flex min-w-0 flex-col justify-center leading-none">
            <span className="font-display text-[27px] md:text-[35px] font-extrabold tracking-wide text-ruby">
              RUHE
            </span>
            <span className="mt-1 text-[11px] md:text-[15px] font-medium tracking-[0.18em] text-ruby/90">
              Global Resources
            </span>
          </div>
        </a>

        {/* desktop nav links */}
        <nav className="hidden flex-1 items-center justify-center gap-5 lg:flex">
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

          {/* links without a panel close whatever panel is open */}
          <Link
            href="/about"
            onMouseEnter={closeMenuNow}
            onFocus={closeMenuNow}
            className="text-sm font-medium text-ink/80 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            About
          </Link>
          <Link
            href="/contact"
            onMouseEnter={closeMenuNow}
            onFocus={closeMenuNow}
            className="text-sm font-medium text-ink/80 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            Contact
          </Link>
        </nav>

        {/* desktop CTAs */}
        <div
          onMouseEnter={closeMenuNow}
          className="hidden shrink-0 items-center gap-4 lg:flex"
        >
          <MessageBox />

          
           <a href={PHONE_HREF}
            className="hidden items-center gap-2 text-sm font-medium text-ink/80 transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ember xl:flex"
          >
            <Phone size={16} className="text-ember" />
            {PHONE_DISPLAY}
          </a>

          <div className="flex items-center gap-2.5">
            <Link
              href="/portal"
              className="rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
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
        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <MessageBox />

          
           <a href={PHONE_HREF}
            aria-label={`Call us at ${PHONE_DISPLAY}`}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
          >
            <Phone size={19} />
          </a>

          <MobileNavSheet />
        </div>
      </div>

      {/* Desktop mega menu */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-40 hidden border-b border-ink/15 border-t-[3px] border-t-ruby bg-white lg:block"
          >
            <div className="mx-auto flex w-full max-w-7xl justify-start px-2 md:px-5 lg:px-10">
              {activeMenu === "schools" && <SchoolsMegaPanel onNavigate={closeMenuNow} />}
              {activeMenu === "programs" && (
                <SimpleDropdownPanel links={PROGRAM_LINKS} onNavigate={closeMenuNow} />
              )}
              {activeMenu === "services" && <ServicesMegaPanel onNavigate={closeMenuNow} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}