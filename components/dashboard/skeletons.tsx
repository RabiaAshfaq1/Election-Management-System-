import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-border/60",
        className
      )}
    />
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-white p-6 shadow-card"
        >
          <Bone className="h-11 w-11 rounded-xl" />
          <Bone className="mt-4 h-10 w-24" />
          <Bone className="mt-2 h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
      <div className="border-b border-border p-4">
        <Bone className="h-10 w-full max-w-md" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-5 py-4">
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 w-24" />
            <Bone className="h-4 w-20" />
            <Bone className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-white p-6 shadow-card"
        >
          <Bone className="h-6 w-3/4" />
          <Bone className="mt-3 h-4 w-full" />
          <Bone className="mt-2 h-4 w-2/3" />
          <Bone className="mt-6 h-9 w-32" />
        </div>
      ))}
    </div>
  );
}
