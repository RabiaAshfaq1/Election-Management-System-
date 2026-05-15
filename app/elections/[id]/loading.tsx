import { CardsSkeleton } from "@/components/dashboard/skeletons";

export default function ElectionDetailLoading() {
  return (
    <div className="min-h-screen bg-paper pt-16">
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
        <div className="h-40 animate-pulse rounded-2xl bg-border/40" />
        <CardsSkeleton count={3} />
      </div>
    </div>
  );
}
