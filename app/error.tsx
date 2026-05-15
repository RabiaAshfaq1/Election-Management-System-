"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      message={error.message || "An unexpected error occurred."}
      reset={reset}
    />
  );
}
