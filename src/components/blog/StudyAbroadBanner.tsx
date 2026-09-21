// src/components/blog/StudyAbroadBanner.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Small CTA card for the blog post sidebar (lg+ only — see usage in
// app/(root)/blog/[slug]/page.tsx). Nudges readers toward starting a study
// abroad application while they're mid-article.
//
// NOTE: coverImage is an Unsplash placeholder (added to next.config.ts
// remotePatterns) — swap for a real branded photo before shipping.
export function StudyAbroadBanner({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-ruby/15 bg-white shadow-[0_1px_2px_rgba(16,16,16,0.03)] ${className}`}
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
          alt="Student walking through an airport with a suitcase, ready to study abroad"
          fill
          className="object-cover"
          sizes="360px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          Ready to study abroad?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/60">
          Let Ruhe Global Resources guide you from choosing a school to
          landing in your new country — every step, handled.
        </p>

        <Button variant="ruby" size="lg" asChild className="mt-4 w-full">
          <Link href="/auth/login">
            Start Your Journey
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>
    </div>
  );
}