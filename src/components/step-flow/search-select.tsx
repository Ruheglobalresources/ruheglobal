"use client";

// src/components/step-flow/search-select.tsx
// A search box over a list of choices (countries, universities, majors, subjects).
//   - single: a field with a floating label; type to narrow the list, pick one, clear with the x
//   - multiple: a rounded search bar; every pick becomes a chip under it, up to `max`
// Works with the keyboard: arrows move, Enter picks, Escape closes, Backspace removes the last chip.
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchSelectProps = {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  max?: number | null;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
};

const MAX_SHOWN = 80;

export function SearchSelect({
  label,
  options,
  value,
  onChange,
  multiple = false,
  max,
  placeholder,
  required,
  disabled,
  loading,
  emptyText = "No results",
}: SearchSelectProps) {
  const id = useId();
  const listId = `${id}-list`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const atMax = multiple && !!max && value.length >= max;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = multiple ? options.filter((o) => !value.includes(o)) : options;
    if (!q) return pool.slice(0, MAX_SHOWN);
    const starts: string[] = [];
    const contains: string[] = [];
    for (const option of pool) {
      const lower = option.toLowerCase();
      if (lower.startsWith(q)) starts.push(option);
      else if (lower.includes(q)) contains.push(option);
    }
    return [...starts, ...contains].slice(0, MAX_SHOWN);
  }, [options, query, value, multiple]);

  // close when the person clicks elsewhere
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // On a phone the keyboard covers the list. While it is open the field scrolls to the top of the
  // visible area (just under the header) so the list has room above the keyboard. It runs again when
  // the keyboard finishes opening, because the visible height changes then.
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 639px)").matches) return;
    const reveal = () => wrapRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    const timer = window.setTimeout(reveal, 250);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", reveal);
    return () => {
      window.clearTimeout(timer);
      vv?.removeEventListener("resize", reveal);
    };
  }, [open]);

  const pick = (option: string) => {
    if (multiple) {
      if (atMax) return;
      onChange([...value, option]);
      setQuery("");
      setActive(0);
      inputRef.current?.focus();
    } else {
      onChange([option]);
      setQuery("");
      setOpen(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && matches[active]) {
        e.preventDefault();
        pick(matches[active]);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.stopPropagation();
        setOpen(false);
        setQuery("");
      }
    } else if (e.key === "Backspace" && multiple && !query && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const list = open && (
    <ul
      id={listId}
      role="listbox"
      className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
    >
      {loading ? (
        <li className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-500">
          <Loader2 size={15} className="animate-spin" /> Loading
        </li>
      ) : matches.length === 0 ? (
        <li className="px-4 py-3 text-sm text-neutral-500">{emptyText}</li>
      ) : (
        matches.map((option, i) => (
          <li
            key={option}
            role="option"
            aria-selected={value.includes(option)}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => pick(option)}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "cursor-pointer px-4 py-3 text-[15px] text-ink",
              i === active ? "bg-neutral-100" : "hover:bg-neutral-50"
            )}
          >
            {option}
          </li>
        ))
      )}
    </ul>
  );

  if (multiple) {
    return (
      <div ref={wrapRef} className="scroll-mt-4">
        <div className="relative">
          <div
            className={cn(
              "flex h-14 items-center gap-3 rounded-full bg-neutral-100 px-5 transition focus-within:ring-2 focus-within:ring-ruby-500/40",
              (disabled || atMax) && "opacity-60"
            )}
          >
            <Search size={20} className="shrink-0 text-neutral-500" />
            <input
              ref={inputRef}
              id={id}
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-label={label}
              autoComplete="off"
              disabled={disabled || atMax}
              value={query}
              placeholder={placeholder ?? "Search"}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-neutral-500"
            />
          </div>
          {list}
        </div>

        {value.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {value.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-ruby-50 py-1.5 pl-3.5 pr-2 text-sm font-medium text-ruby-700"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((v) => v !== item))}
                  aria-label={`Remove ${item}`}
                  className="grid size-5 place-items-center rounded-full hover:bg-ruby-100"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  const shown = open ? query : (value[0] ?? "");

  return (
    <div ref={wrapRef} className="relative scroll-mt-4">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          autoComplete="off"
          disabled={disabled}
          value={shown}
          placeholder=" "
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "peer h-14 w-full rounded-xl border border-neutral-300 bg-white px-3 pb-1.5 pt-6 pr-20 text-[16px] text-ink outline-none transition focus:border-ruby-500 focus:ring-2 focus:ring-ruby-500/20 disabled:bg-neutral-50",
            open && "border-ruby-500 ring-2 ring-ruby-500/20"
          )}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 text-neutral-500 transition-all",
            shown || open ? "top-2 text-[11px]" : "top-4 text-[15px]"
          )}
        >
          {label}
          {required ? " *" : ""}
        </label>

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-neutral-400">
          {value.length > 0 && !disabled && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setQuery("");
              }}
              aria-label={`Clear ${label}`}
              className="grid size-7 place-items-center rounded-full hover:bg-neutral-100 hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown size={18} className={cn("transition", open && "rotate-180")} />
        </div>
      </div>
      {list}
    </div>
  );
}