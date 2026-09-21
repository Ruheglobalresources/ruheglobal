import Link from "next/link";
import {
  GraduationCap,
  Plane,
  Landmark,
  Award,
  BookOpen,
  Globe2,
  Briefcase,
  Home as HomeIcon,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  Plane,
  Landmark,
  Award,
  BookOpen,
  Globe2,
  Briefcase,
  Home: HomeIcon,
};

// Terminal/Application `icon` is a free-text field in the admin, meant to
// hold a Lucide icon name (e.g. "Plane"). Anything unrecognized — including
// an empty string — falls back to a sane default rather than crashing.
export function resolvePortalIcon(name: string | null | undefined): LucideIcon {
  if (name && ICON_MAP[name]) return ICON_MAP[name];
  return GraduationCap;
}

interface TerminalCardProps {
  slug: string;
  name: string;
  icon: string | null;
  applicationCount: number;
}

export function TerminalCard({ slug, name, icon, applicationCount }: TerminalCardProps) {
  const Icon = resolvePortalIcon(icon);

  return (
    <Link
      href={`/portal/${slug}`}
      className="group flex items-center gap-4 rounded-xl border bg-white p-4 transition-colors hover:border-[color:var(--color-teal)] hover:bg-[color:var(--color-cloud)]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-teal)]/10 text-[color:var(--color-teal)]">
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[color:var(--color-ink)]">{name}</span>
        <span className="block text-xs text-neutral-500">
          {applicationCount} application{applicationCount === 1 ? "" : "s"}
        </span>
      </span>
      <ArrowRight
        size={16}
        className="shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[color:var(--color-teal)]"
      />
    </Link>
  );
}