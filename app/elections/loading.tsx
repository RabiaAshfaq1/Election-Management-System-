import { CardsSkeleton } from "@/components/dashboard/skeletons";

export default function ElectionsLoading() {
  return (
    <div className="min-h-screen bg-paper pt-16">
      <div className="mx-auto max-w-7xl space-y-8 px-6 py-12 lg:px-10">
        <div className="h-24 animate-pulse rounded-2xl bg-border/40" />
        <CardsSkeleton count={6} />
      </div>
    </div>
  );
}
