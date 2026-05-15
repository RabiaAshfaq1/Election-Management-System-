"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Admin dashboard error"
      message={error.message || "Could not load admin data."}
      reset={reset}
    />
  );
}
