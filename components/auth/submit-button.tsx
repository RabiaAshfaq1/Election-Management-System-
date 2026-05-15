"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function SubmitButton({
  children,
  loading,
  className,
  type = "submit",
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-paper transition hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
