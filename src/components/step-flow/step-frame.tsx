"use client";

// src/components/step-flow/step-frame.tsx
// The full-screen modal every step of a flow is drawn in: a top bar with the logo and a close
// button, then a centred column with a back arrow and progress bar, the step title, the questions
// and one big button. The education doodles sit behind it (step-backdrop.tsx).
// Reusable for any multi-step flow: it knows nothing about eligibility.
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import { PortalBrand } from "@/components/portal/portal-brand";
import { StepBackdrop } from "./step-backdrop";

type StepFrameProps = {
  title: string;
  emoji?: string | null;
  /** 0 to 100 */
  progress: number;
  /** Shown as an arrow before the progress bar. Leave out to hide it. */
  onBack?: () => void;
  onClose: () => void;
  children: ReactNode;
  /** Usually the Continue button. */
  footer?: ReactNode;
};

export function StepFrame({ title, emoji, progress, onBack, onClose, children, footer }: StepFrameProps) {
  // The page behind must not scroll while the modal is open; Escape closes it.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const percent = Math.min(100, Math.max(0, progress));

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-100 px-4 pt-[env(safe-area-inset-top)] shadow-sm sm:px-6">
        <PortalBrand />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 place-items-center rounded-full text-neutral-500 outline-none transition hover:bg-neutral-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ruby-500/50"
        >
          <X size={22} />
        </button>
      </header>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <StepBackdrop />

        <div className="relative mx-auto flex min-h-full w-full max-w-[560px] flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:pt-10">
          <div className="flex items-center gap-4">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back"
                className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-ink outline-none transition hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-ruby-500/50"
              >
                <ArrowLeft size={22} />
              </button>
            ) : (
              <span className="size-10 shrink-0" />
            )}
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200"
            >
              <div
                className="h-full rounded-full bg-ruby-500 transition-[width] duration-300 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <h2 className="mt-6 text-center text-2xl font-semibold leading-snug text-ink">
            {title}
            {emoji ? <span aria-hidden="true"> {emoji}</span> : null}
          </h2>
          <div className="mt-5 border-b border-neutral-200" />

          <div className="mt-8 flex-1">{children}</div>

          {footer && <div className="mt-10 flex justify-center">{footer}</div>}
        </div>
      </div>
    </div>
  );
}