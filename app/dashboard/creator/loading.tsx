import { CardsSkeleton, StatsSkeleton } from "@/components/dashboard/skeletons";

export default function CreatorLoading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-border/60" />
      <StatsSkeleton count={3} />
      <CardsSkeleton />
    </div>
  );
}
