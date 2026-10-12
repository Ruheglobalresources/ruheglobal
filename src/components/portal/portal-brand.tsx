// src/components/portal/portal-brand.tsx
// The Ruhe Global Resources logo lockup used across the portal: the logo image
// from public/logo.svg, then RUHE over "Global Resources". Use `showText={false}`
// for the collapsed sidebar rail, and tone="dark" on dark surfaces.
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PortalBrandProps = {
  href?: string;
  showText?: boolean;
  tone?: "light" | "dark";
  className?: string;
  onClick?: () => void;
};

export function PortalBrand({
  href = "/portal",
  showText = true,
  tone = "light",
  className,
  onClick,
}: PortalBrandProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="Ruhe Global Resources"
      title="Ruhe Global Resources"
      className={cn(
        "flex min-w-0 items-center gap-1.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ruby-500/60",
        className
      )}
    >
      <Image
        src="/logo.svg"
        alt=""
        width={44}
        height={44}
        priority
        className="size-11 shrink-0 object-contain"
      />

      {showText && (
        <span className="flex min-w-0 flex-col justify-center leading-none">
          <span
            className={cn(
              "font-display text-[24px] font-extrabold tracking-wide",
              tone === "dark" ? "text-ruby-400" : "text-ruby"
            )}
          >
            RUHE
          </span>
          <span
            className={cn(
              "mt-1 truncate text-[10px] font-medium tracking-[0.18em]",
              tone === "dark" ? "text-white/80" : "text-ruby/90"
            )}
          >
            Global Resources
          </span>
        </span>
      )}
    </Link>
  );
}