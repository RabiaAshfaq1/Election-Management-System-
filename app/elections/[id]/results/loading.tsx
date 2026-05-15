import { StatsSkeleton } from "@/components/dashboard/skeletons";

export default function ResultsLoading() {
  return (
    <div className="min-h-screen bg-paper pt-16">
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
        <div className="h-32 animate-pulse rounded-2xl bg-border/40" />
        <StatsSkeleton count={3} />
        <div className="h-80 animate-pulse rounded-2xl bg-white shadow-card" />
      </div>
    </div>
  );
}
