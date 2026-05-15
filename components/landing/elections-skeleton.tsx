export function ElectionsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-border bg-white"
        >
          <div className="h-1.5 bg-paper" />
          <div className="space-y-4 p-6">
            <div className="h-5 w-20 rounded-full bg-paper" />
            <div className="h-7 w-3/4 rounded-lg bg-paper" />
            <div className="h-4 w-1/2 rounded bg-paper" />
            <div className="h-2 w-full rounded-full bg-paper" />
            <div className="h-11 rounded-xl bg-paper" />
          </div>
        </div>
      ))}
    </div>
  );
}
