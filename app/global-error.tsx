"use client";

import { RouteError } from "@/components/dashboard/route-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-paper">
        <RouteError
          title="Application error"
          message={error.message || "An unexpected error occurred."}
          reset={reset}
        />
      </body>
    </html>
  );
}
