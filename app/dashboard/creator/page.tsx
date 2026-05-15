import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreatorOverview } from "@/components/creator/creator-overview";
import { requireRole } from "@/lib/auth-server";
import { getCreatorOverviewStats } from "@/lib/dashboard/creator-data";

export default async function CreatorOverviewPage() {
  const { supabase, user } = await requireRole("election_creator");
  const {
    activeElections,
    totalVoters,
    upcomingDeadlines,
    activeCount,
  } = await getCreatorOverviewStats(supabase, user.id);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <AdminPageHeader
          title="Overview"
          description="Your active elections, voter totals, and upcoming deadlines."
        />
        <Link
          href="/dashboard/creator/create"
          className="rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-light"
        >
          Create Election
        </Link>
      </div>

      <CreatorOverview
        activeCount={activeCount}
        totalVoters={totalVoters}
        upcomingCount={upcomingDeadlines.length}
        activeElections={activeElections}
        upcomingDeadlines={upcomingDeadlines}
      />
    </>
  );
}
