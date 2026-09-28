import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICE_COLUMNS } from "@/data/site-nav";

const COLUMN_ACCENTS = [
  {
    header: "bg-teal",
    tick: "hover:border-l-teal",
    tint: "hover:bg-teal/5",
    label: "group-hover:text-teal",
    icon: "group-hover:text-teal",
  },
  {
    header: "bg-ember",
    tick: "hover:border-l-ember",
    tint: "hover:bg-ember/5",
    label: "group-hover:text-ember",
    icon: "group-hover:text-ember",
  },
  {
    header: "bg-ruby",
    tick: "hover:border-l-ruby",
    tint: "hover:bg-ruby/5",
    label: "group-hover:text-ruby",
    icon: "group-hover:text-ruby",
  },
  {
    header: "bg-gold",
    tick: "hover:border-l-gold",
    tint: "hover:bg-gold/5",
    label: "group-hover:text-gold",
    icon: "group-hover:text-gold",
  },
] as const;

export function ServicesMegaPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="w-full py-1">
      <div className="grid grid-cols-4 divide-x divide-ink/12">
        {SERVICE_COLUMNS.map((column, index) => {
          const accent = COLUMN_ACCENTS[index % COLUMN_ACCENTS.length];
          return (
            <div key={column.title} className="flex flex-col">
              <p className={`${accent.header} px-4 py-2.5 text-sm font-bold text-white`}>
                {column.title}
              </p>
              <ul className="flex flex-1 flex-col divide-y divide-ink/10">
                {column.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className={`group flex items-start gap-2.5 border-l-[3px] border-l-transparent px-4 py-3 transition-colors focus:outline-none ${accent.tick} ${accent.tint}`}
                      >
                        {Icon && (
                          <Icon
                            size={16}
                            className={`mt-0.5 shrink-0 text-ink/35 transition-colors ${accent.icon}`}
                          />
                        )}
                        <span>
                          <span
                            className={`block text-sm font-semibold text-ink transition-colors ${accent.label}`}
                          >
                            {link.label}
                          </span>
                          {link.blurb && (
                            <span className="mt-0.5 block text-xs leading-snug text-ink/55">
                              {link.blurb}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* consultation bar — moved here from the old promo column so it now
          spans the full width at the bottom of the panel */}
      <div className="flex flex-col items-start justify-between gap-4 border-t border-ink/15 bg-ink px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-base font-bold leading-snug text-cloud">
            Not sure where to start?
          </p>
          <p className="mt-1 text-sm leading-snug text-cloud/70">
            Talk to a counsellor about your options. It&apos;s free and takes 15 minutes.
          </p>
        </div>
        <Link
          href="/contact"
          onClick={onNavigate}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ruby px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ruby-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember"
        >
          Book free consultation
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}