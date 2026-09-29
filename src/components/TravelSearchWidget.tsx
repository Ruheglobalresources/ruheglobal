// TravelSearchWidget.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, BookOpen, Mail, ArrowRight } from "lucide-react";
import { COUNTRIES, SCHOOLS } from "@/constants/schools";

// Course options come straight from the real school data — narrows to that
// country's programs once a destination is picked, otherwise shows every
// program across all countries. No more Study/Work split: we deal in school
// placements and work-visa routes alike, so course is always the second field.
function coursesFor(country: string | null): string[] {
  const pool = country ? SCHOOLS.filter((s) => s.country === country) : SCHOOLS;
  return Array.from(new Set(pool.flatMap((s) => s.programs))).sort();
}

type OpenField = "destination" | "course" | null;

export function TravelSearchWidget({
  className = "",
  pinned = false,
  fadeInOut = false,
}: {
  className?: string;
  /** True once the widget has scrolled to the trigger point and should morph
   *  into the fixed top navbar. The widget stays the same component/DOM node —
   *  only its own layout classes change, so framer-motion's `layout` animation
   *  can smoothly interpolate the transform for the user. */
  pinned?: boolean;
  /** When true, the widget animates in/out via a plain opacity fade instead of
   *  assuming it's a persistent node whose layout is being interpolated. Used
   *  by the standalone mobile sticky-nav instance, which mounts and unmounts
   *  under AnimatePresence rather than morphing in place. */
  fadeInOut?: boolean;
}) {
  const router = useRouter();
  const [openField, setOpenField] = useState<OpenField>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const courseOptions = useMemo(() => coursesFor(destination), [destination]);

  const toggle = (field: OpenField) => setOpenField((f) => (f === field ? null : field));

  useEffect(() => {
    if (!openField) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenField(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openField]);

  // course list is destination-specific, so a country change clears any prior pick
  useEffect(() => {
    setCourse(null);
  }, [destination]);

  // closing any open dropdown as soon as the widget starts morphing keeps the
  // transform clean — an open dropdown mid-morph would look broken
  useEffect(() => {
    setOpenField(null);
  }, [pinned]);

  const canSubmit = !!destination && !!course && /\S+@\S+\.\S+/.test(email);

  // Submission — a new/prospective lead filling out the fields, taking their
  // selections into the login flow so the right application form is preselected.
  function handleSubmit() {
  if (!canSubmit) {
    router.push("/auth/login");
    return;
  }

  const params = new URLSearchParams();
  params.set("country", destination!);
  params.set("course", course!);
  params.set("email", email);
  router.push(`/auth/login?${params.toString()}`);
}

  // Direct portal access — an existing user who doesn't need to fill anything out,
  // separate from the lead-capture submission above.
  function handlePortalSignIn() {
    router.push("/auth/login");
  }

  return (
    <motion.div
      ref={containerRef}
      layout
      initial={fadeInOut ? { opacity: 0 } : undefined}
      animate={fadeInOut ? { opacity: 1 } : undefined}
      exit={fadeInOut ? { opacity: 0 } : undefined}
      transition={
        fadeInOut
          ? {
              layout: { type: "spring", stiffness: 320, damping: 32 },
              opacity: { duration: 0.32, ease: "easeOut" },
            }
          : { type: "spring", stiffness: 320, damping: 32 }
      }
      // pinned strip sits just under the navbar when it's showing (--nav-offset
      // is set by Navbar; 0px when the navbar is hidden or absent)
      style={pinned ? { top: "var(--nav-offset, 0px)" } : undefined}
      className={[
        "w-full",
        pinned
          ? "fixed inset-x-0 top-0 z-[60] border-b border-black/10 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-md sm:px-5 sm:py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-1.5"
          : "relative rounded-3xl border border-black/10 bg-white shadow-2xl",
        className,
      ].join(" ")} >
      {/* fields row + primary submit button */}
      <motion.div
        layout
        className={
          pinned
            ? "flex flex-row items-stretch divide-x divide-black/10"
            : "flex flex-col divide-y divide-black/10 lg:flex-row lg:divide-y-0 lg:divide-x"
        }
      >
        <SearchField
          icon={<MapPin size={pinned ? 18 : 16} />}
          label="Destination"
          value={destination ?? (pinned ? "Destination" : "Where can we take you?")}
          active={openField === "destination"}
          onClick={() => toggle("destination")}
          compact={pinned}
        />
        <SearchField
          icon={<BookOpen size={pinned ? 18 : 16} />}
          label="Course"
          value={ course ?? ( <>      <span className="sm:hidden">Course</span>
       <span className="hidden sm:inline">Choose course</span>   </> ) }
          active={openField === "course"}
          onClick={() => toggle("course")}
          compact={pinned}
        />

        <EmailField value={email} onChange={setEmail} compact={pinned} />

        <button
  type="button"
  onClick={handleSubmit}
  aria-label="Get started"
  className={
    pinned
      ? "m-1 flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#AF0E13] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#8f0b10] focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby sm:px-6 sm:py-3 sm:text-base lg:py-2"
      : "m-1 flex items-center justify-center gap-2 rounded-2xl bg-[#AF0E13] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#8f0b10] focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby lg:m-1.5 lg:px-8 lg:py-4 lg:text-base lg:font-bold"
  }
>
  <span className={pinned ? "hidden sm:inline" : ""}>Get started</span>
  <ArrowRight className={pinned ? "h-4 w-4 shrink-0 sm:h-5 sm:w-5" : "h-4 w-4 shrink-0 lg:h-5 lg:w-5"} />
</button>
      </motion.div>

      {/* secondary row — direct portal sign-in for existing users, understated
          until hovered, same idea as the reference photo's "Sign in or join" teaser.
          Dropped once pinned — no room for it in the compact navbar strip. */}
      {!pinned && (
        <div className="border-t border-black/10 p-1.5">
          <button
            type="button"
            onClick={handlePortalSignIn}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-transparent px-6 py-3 text-center text-sm font-medium leading-snug text-black transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby"
          >
            Sign in to your Ruhe Global Resources account to start your education journey
            <ArrowRight
              size={16}
              className="shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      )}

      <AnimatePresence>
        {openField === "destination" && (
          <Dropdown pinned={pinned}>
            {COUNTRIES.map((c) => (
              <OptionRow
                key={c.name}
                label={`${c.flag}  ${c.name}`}
                selected={c.name === destination}
                onClick={() => {
                  setDestination(c.name);
                  setOpenField(null);
                }}
              />
            ))}
          </Dropdown>
        )}

        {openField === "course" && (
          <Dropdown pinned={pinned}>
            {courseOptions.map((c) => (
              <OptionRow
                key={c}
                label={c}
                selected={c === course}
                onClick={() => {
                  setCourse(c);
                  setOpenField(null);
                }}
              />
            ))}
          </Dropdown>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SearchField({
  icon,
  label,
  value,
  active,
  onClick,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-w-0 flex-1 items-center text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby",
        compact
          ? "gap-2 rounded-xl px-3 py-2.5 sm:gap-2.5 sm:px-4 sm:py-3 lg:px-5 lg:py-1.5"
          : "gap-3 rounded-2xl px-5 py-3.5 lg:gap-2 lg:px-3 lg:py-2.5",
        active ? "bg-ruby/10" : "hover:bg-black/5",
      ].join(" ")}
    >
      <span className="hidden shrink-0 text-ruby sm:inline-flex">{icon}</span>
      <span className="flex min-w-0 flex-col">
        <span
          className={[
            "font-mono uppercase tracking-[0.14em] text-black/45",
            compact ? "hidden text-[10px] sm:block" : "text-[10px] lg:text-[12px]",
          ].join(" ")}
        >
          {label}
        </span>
        <span
          className={[
            "truncate font-medium text-black/55",
            compact ? "text-sm sm:text-base lg:text-base" : "text-sm lg:text-lg",
          ].join(" ")}
        >
          {value}
        </span>
      </span>
    </button>
  );
}

// The lead's email — a real input, not a picker, so it gets its own field type.
function EmailField({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <label
      className={[
        "flex min-w-0 flex-1 cursor-text items-center text-left transition-colors hover:bg-black/5 focus-within:bg-ruby/10",
        compact
          ? "gap-2 rounded-xl px-3 py-2.5 sm:gap-2.5 sm:px-4 sm:py-3 lg:px-5 lg:py-1.5"
          : "gap-3 rounded-2xl px-5 py-3.5 lg:gap-2 lg:px-3 lg:py-2.5",
      ].join(" ")}
    >
      <span className="shrink-0 text-ruby">
        <Mail size={compact ? 18 : 16} />
      </span>
      <span className="flex w-full min-w-0 flex-col">
        <span
          className={[
            "font-mono uppercase tracking-[0.14em] text-black/45",
            compact ? "hidden text-[10px] sm:block" : "text-[10px] lg:text-[12px]",
          ].join(" ")}
        >
          Email
        </span>
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={compact ? "Email" : "you@email.com"}
          className={[
            "w-full min-w-0 bg-transparent font-medium text-black placeholder:text-black/40 focus:outline-none",
            compact ? "text-sm sm:text-base" : "text-sm lg:text-base",
          ].join(" ")}
        />
      </span>
    </label>
  );
}

function Dropdown({ children, pinned = false }: { children: React.ReactNode; pinned?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={[
        "absolute inset-x-0 z-20 mx-2 max-h-64 overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-xl",
        pinned ? "top-full mt-2" : "top-0",
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
}

function OptionRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors focus:outline-none",
        selected ? "bg-ruby/10 text-black font-medium" : "text-black/80 hover:bg-black/5",
      ].join(" ")}
    >
      {label}
      {selected && <span className="text-ruby">✓</span>}
    </button>
  );
}