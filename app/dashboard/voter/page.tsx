import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { VoterOverview } from "@/components/voter/voter-overview";
import { requireRole } from "@/lib/auth-server";
import { getVoterElections } from "@/lib/dashboard/voter-data";

export default async function VoterDashboardPage() {
  const { supabase, user } = await requireRole("voter");
  const rows = await getVoterElections(supabase, user.id);

  const active = rows.filter((e) => e.status === "active").length;
  const voted = rows.filter((e) => e.has_voted).length;
  const pending = rows.filter(
    (e) => e.status === "active" && !e.has_voted
  ).length;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <AdminPageHeader
          title="Overview"
          description="Elections you are registered for and your voting status."
        />
        <Link
          href="/elections"
          className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper"
        >
          Browse elections
        </Link>
      </div>

      <VoterOverview
        elections={rows}
        stats={{ total: rows.length, active, voted, pending }}
      />
    </>
  );
}
