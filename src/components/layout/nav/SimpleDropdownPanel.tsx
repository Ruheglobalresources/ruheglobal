import Link from "next/link";
import type { NavLink } from "@/data/site-nav";

export function SimpleDropdownPanel({ links }: { links: NavLink[] }) {
  return (
    <div className="w-72 divide-y divide-ink/10 py-1">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start gap-2.5 border-l-[3px] border-l-transparent px-4 py-3 transition-colors hover:border-l-ember hover:bg-ember/5 focus:outline-none"
          >
            <Icon size={16} className="mt-0.5 shrink-0 text-ink/35 group-hover:text-ember" />
            <span>
              <span className="block text-sm font-semibold text-ink group-hover:text-ember">
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
  );
}