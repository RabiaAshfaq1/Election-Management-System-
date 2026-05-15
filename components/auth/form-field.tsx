"use client";

import type { InputHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

export function FormField({
  label,
  registration,
  error,
  className,
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id ?? registration.name;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        {label}
      </label>
      <input
        id={fieldId}
        {...registration}
        {...props}
        className={cn(
          "w-full rounded-xl border border-border bg-paper px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-teal focus:ring-2 focus:ring-teal/20",
          error && "border-accent focus:border-accent focus:ring-accent/20",
          className
        )}
      />
      {error && (
        <p className="mt-1.5 text-xs text-accent" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
