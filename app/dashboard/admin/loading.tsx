import { StatsSkeleton, TableSkeleton } from "@/components/dashboard/skeletons";

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-border/60" />
      <StatsSkeleton />
      <TableSkeleton />
    </div>
  );
}
