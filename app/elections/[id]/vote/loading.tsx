import { CardsSkeleton } from "@/components/dashboard/skeletons";

export default function VoteLoading() {
  return (
    <div className="min-h-screen bg-paper pt-16">
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-12">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-border/60" />
        <div className="h-64 animate-pulse rounded-2xl bg-white shadow-card" />
        <CardsSkeleton count={2} />
      </div>
    </div>
  );
}
