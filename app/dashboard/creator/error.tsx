"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function CreatorDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Creator dashboard error"
      message={error.message || "Could not load creator data."}
      reset={reset}
    />
  );
}
