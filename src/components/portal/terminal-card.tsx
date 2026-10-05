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
import { elevation1, elevation2Hover } from "@/components/dashboard/styles";
import { cn } from "@/lib/utils";

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
      className={cn(
        "group flex items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-4 transition hover:border-ruby-200 hover:bg-ruby-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/50",
        elevation1,
        elevation2Hover
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ruby-50 text-ruby-600 transition group-hover:bg-ruby-100">
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-ink">{name}</span>
        <span className="block text-sm text-neutral-500">
          {applicationCount} application{applicationCount === 1 ? "" : "s"}
        </span>
      </span>
      <ArrowRight
        size={18}
        className="shrink-0 text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-ruby-600"
      />
    </Link>
  );
}