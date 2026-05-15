"use client";

import { cn } from "@/lib/utils";

const STEPS = ["Basic Info", "Schedule", "Review"];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="mb-8">
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-teal transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="flex justify-between gap-2">
        {STEPS.map((label, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <li
              key={label}
              className="flex flex-1 flex-col items-center text-center"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                  isActive && "bg-teal text-paper",
                  isComplete && "bg-teal/20 text-teal",
                  !isActive && !isComplete && "bg-paper text-muted"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "mt-2 hidden text-xs font-medium sm:block",
                  isActive ? "text-teal" : "text-muted"
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
