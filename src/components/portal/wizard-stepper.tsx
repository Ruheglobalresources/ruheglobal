"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardStep } from "./types";

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  furthestStep: number;
  disabled?: boolean;
  onStepClick: (stepNumber: number) => void;
}

export function WizardStepper({ steps, currentStep, furthestStep, disabled, onStepClick }: WizardStepperProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {steps.map((step) => {
        const isActive = step.stepNumber === currentStep;
        const isDone = step.stepNumber < currentStep;
        const isLocked = step.stepNumber > furthestStep;

        return (
          <button
            key={step.stepNumber}
            type="button"
            disabled={disabled || isLocked}
            onClick={() => onStepClick(step.stepNumber)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isActive && "border-[color:var(--color-teal)] bg-[color:var(--color-teal)] text-white",
              !isActive && !isLocked && "border-neutral-200 text-neutral-600 hover:bg-neutral-50",
              isLocked && "cursor-not-allowed border-neutral-100 text-neutral-300"
            )}
          >
            {isLocked ? (
              <Lock size={11} />
            ) : isDone ? (
              <Check size={11} />
            ) : (
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                  isActive ? "bg-white/20" : "bg-neutral-200"
                )}
              >
                {step.stepNumber}
              </span>
            )}
            {step.title}
          </button>
        );
      })}
    </div>
  );
}