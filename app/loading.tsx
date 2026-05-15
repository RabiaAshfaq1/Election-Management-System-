import { StatsSkeleton } from "@/components/dashboard/skeletons";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-border/60" />
        <StatsSkeleton count={3} />
      </div>
    </div>
  );
}
