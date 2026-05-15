"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function VoterDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="Voter dashboard error"
      message={error.message || "Could not load voter data."}
      reset={reset}
    />
  );
}
