// src/components/portal/counsellor-card.tsx
import Link from "next/link";
import { Headset, MessageCircle } from "lucide-react";
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
        "rounded-3xl border border-neutral-200 bg-white p-4",
        elevation1,
        className
      )}
    >
      {counsellor ? (
        <div className="flex items-center gap-3">
          {counsellor.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={counsellor.image}
              alt=""
              className="size-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ruby-50 text-base font-semibold text-ruby-700">
              {(counsellor.name ?? "C").charAt(0).toUpperCase()}
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">
              {counsellor.name ?? "Your counsellor"}
            </p>
            <p className="text-sm text-neutral-500">Counsellor</p>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-neutral-600">
          A counsellor is assigned to you once you start an application. You
          can talk to us any time.
        </p>
      )}

      <OpenChatButton
        className={cn(outlinedButton, "mt-4 w-full")}
        onClick={onNavigate}
      >
        <MessageCircle size={18} />
        Message {counsellor?.name ? "counsellor" : "us"}
      </OpenChatButton>

      <Link
        href="/contact"
        onClick={onNavigate}
        className={cn(filledButton, "mt-2 w-full")}
      >
        <Headset size={18} />
        Book a Session
      </Link>
    </div>
  );
}