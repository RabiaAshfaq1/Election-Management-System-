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
        "btn-primary w-full gap-2 px-4 py-3",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
