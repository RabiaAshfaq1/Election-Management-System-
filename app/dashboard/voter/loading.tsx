import { CardsSkeleton, StatsSkeleton } from "@/components/dashboard/skeletons";

export default function VoterLoading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-border/60" />
      <StatsSkeleton count={4} />
      <CardsSkeleton count={2} />
    </div>
  );
}
