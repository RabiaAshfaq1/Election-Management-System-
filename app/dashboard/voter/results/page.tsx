import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { requireRole } from "@/lib/auth-server";
import { getVoterElections } from "@/lib/dashboard/voter-data";

export default async function VoterResultsPage() {
  const { supabase, user } = await requireRole("voter");
  const rows = await getVoterElections(supabase, user.id);
  const completed = rows.filter((e) => e.status === "completed");

  return (
    <>
      <AdminPageHeader
        title="Results"
        description="Final results for elections you participated in."
      />

      {completed.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="No completed elections"
          description="Results will appear here after an election you joined has ended."
        />
      ) : (
        <ul className="space-y-3">
          {completed.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-card"
            >
              <div>
                <p className="font-medium text-ink">{e.title}</p>
                <p className="text-xs text-muted">
                  {e.has_voted ? "You voted in this election" : "You did not vote"}
                </p>
              </div>
              <Link
                href={`/elections/${e.id}/results`}
                className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-paper hover:bg-teal-light"
              >
                View results
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
