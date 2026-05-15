"use client";

import { AlertTriangle } from "lucide-react";

interface RouteErrorProps {
  title?: string;
  message?: string;
  reset: () => void;
}

export function RouteError({
  title = "Something went wrong",
  message = "We could not load this page. Please try again.",
  reset,
}: RouteErrorProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
        <AlertTriangle className="h-7 w-7 text-accent" />
      </div>
      <h2 className="font-heading text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted">{message}</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
