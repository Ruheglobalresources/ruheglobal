"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type DateRange = { start: Date | null; end: Date | null };

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onClose?: () => void;
};

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function isSameDay(a?: Date | null, b?: Date | null) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}
function isBetween(d: Date, a: Date, b: Date) {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return d > lo && d < hi;
}

export function DateRangePicker({ value, onChange, onClose }: DateRangePickerProps) {
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(value.start ?? new Date()));

  const weeks = useMemo(() => {
    const first = startOfMonth(visibleMonth);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();

    const cells: (Date | null)[] = Array(startWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(first.getFullYear(), first.getMonth(), day));
    }
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [visibleMonth]);

  function handlePick(day: Date) {
    const { start, end } = value;
    if (!start || (start && end)) {
      onChange({ start: day, end: null });
      return;
    }
    if (day < start) {
      onChange({ start: day, end: start });
    } else {
      onChange({ start, end: day });
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className="w-full rounded-2xl border border-ink/10 bg-cloud p-4 shadow-xl"
    >
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() =>
            setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
          }
          className="p-1.5 rounded-full hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-mono text-xs tracking-[0.14em] uppercase text-ink/70">
          {visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() =>
            setVisibleMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
          }
          className="p-1.5 rounded-full hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-mono text-ink/40 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {weeks.flat().map((day, i) => {
          if (!day) return <div key={i} />;
          const disabled = day < today;
          const selectedStart = isSameDay(day, value.start);
          const selectedEnd = isSameDay(day, value.end);
          const inRange = value.start && value.end && isBetween(day, value.start, value.end);

          return (
            <button
              type="button"
              key={i}
              disabled={disabled}
              onClick={() => handlePick(day)}
              className={[
                "h-8 text-xs rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ember",
                disabled ? "text-ink/25 cursor-not-allowed" : "text-ink hover:bg-ember/15",
                selectedStart || selectedEnd ? "bg-ember text-cloud hover:bg-ember" : "",
                inRange ? "bg-ember/15" : "",
              ].join(" ")}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
        <button
          type="button"
          onClick={() => onChange({ start: null, end: null })}
          className="text-xs font-mono text-ink/50 hover:text-ink"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-cloud hover:bg-ink/90"
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}