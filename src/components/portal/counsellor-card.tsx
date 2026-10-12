// src/components/portal/counsellor-card.tsx
import Link from "next/link";
import { Headset, MessagesSquare } from "lucide-react";
import {
  elevation1,
  filledButton,
  outlinedButton,
} from "@/components/dashboard/styles";
import type { PortalCounsellor } from "@/lib/portal-counsellor";
import { cn } from "@/lib/utils";
import { OpenChatButton } from "./portal-shell";

export function CounsellorCard({
  counsellor,
  className,
  onNavigate,
}: {
  counsellor: PortalCounsellor | null;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-3",
        elevation1,
        className
      )}
    >
      {counsellor ? (
        <>
          <div className="flex items-center gap-2.5">
            {counsellor.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={counsellor.image}
                alt=""
                className="size-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ruby-50 text-sm font-semibold text-ruby-700">
                {(counsellor.name ?? "C").charAt(0).toUpperCase()}
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {counsellor.name ?? "Your counsellor"}
              </p>
              <p className="text-xs text-neutral-500">Counsellor</p>
            </div>
          </div>
          {counsellor.bio && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-600">
              {counsellor.bio}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-neutral-600">
          A counsellor is assigned to you once you start an application. You
          can talk to us any time.
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Link
          href="/contact"
          onClick={onNavigate}
          className={cn(filledButton, "min-w-0 flex-1")}
        >
          <Headset size={18} />
          Book a Session
        </Link>

        <OpenChatButton
          className={cn(outlinedButton, "size-10 shrink-0 p-0")}
          onClick={onNavigate}
          label={counsellor?.name ? "Message counsellor" : "Message us"}
        >
          <MessagesSquare size={18} />
        </OpenChatButton>
      </div>
    </div>
  );
}