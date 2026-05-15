import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ElectionCards } from "@/components/creator/election-cards";
import { requireRole } from "@/lib/auth-server";
import { getCreatorElections } from "@/lib/dashboard/creator-data";

export default async function CreatorElectionsPage() {
  const { supabase, user } = await requireRole("election_creator");
  const elections = await getCreatorElections(supabase, user.id);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <AdminPageHeader
          title="My Elections"
          description="Manage drafts, publish, finalize voters, and run live elections."
        />
        <Link
          href="/dashboard/creator/create"
          className="rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-teal-light"
        >
          Create New
        </Link>
      </div>
      <ElectionCards elections={elections} />
    </>
  );
}
