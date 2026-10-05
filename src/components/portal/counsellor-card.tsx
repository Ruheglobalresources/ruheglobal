// src/components/portal/counsellor-card.tsx
import Link from "next/link";
import { Headset } from "lucide-react";
import { elevation1, filledButton } from "@/components/dashboard/styles";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { cn } from "@/lib/utils";

export function CounsellorCard({ counsellor, className }: { counsellor: PortalCounsellor | null; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-neutral-200 bg-white p-4", elevation1, className)}>
      {counsellor ? (
        <div className="flex items-center gap-3">
          {counsellor.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={counsellor.image} alt="" className="size-12 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ruby-50 text-base font-semibold text-ruby-700">
              {(counsellor.name ?? "C").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{counsellor.name ?? "Your counsellor"}</p>
            <p className="text-sm text-neutral-500">Counsellor</p>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-neutral-600">
          A counsellor is assigned to you once you start an application. You can talk to us any time.
        </p>
      )}

      <Link href="/contact" className={cn(filledButton, "mt-4 w-full")}>
        <Headset size={18} /> Book a Session
      </Link>
    </div>
  );
}