import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/creator/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { requireRole } from "@/lib/auth-server";
import { getCreatorElections } from "@/lib/dashboard/creator-data";

export default async function CreatorResultsPage() {
  const { supabase, user } = await requireRole("election_creator");
  const elections = await getCreatorElections(supabase, user.id);
  const withResults = elections.filter((e) =>
    ["active", "completed"].includes(e.status)
  );

  return (
    <>
      <AdminPageHeader
        title="Results"
        description="View live and final results for your elections."
      />

      {withResults.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="No results yet"
          description="Results appear once an election is active or completed."
        />
      ) : (
        <ul className="space-y-3">
          {withResults.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-card"
            >
              <div>
                <p className="font-medium text-ink">{e.title}</p>
                <p className="text-xs text-muted">
                  {e.voter_count ?? 0} voters registered
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={e.status} />
                <Link
                  href={`/elections/${e.id}/results`}
                  className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-paper hover:bg-teal-light"
                >
                  Open results
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
