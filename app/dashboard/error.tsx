"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Dashboard error"
      message={error.message || "Could not load dashboard data."}
      reset={reset}
    />
  );
}
