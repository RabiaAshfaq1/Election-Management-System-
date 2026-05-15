import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { VoterElectionList } from "@/components/voter/voter-election-list";
import { requireRole } from "@/lib/auth-server";
import { getVoterElections } from "@/lib/dashboard/voter-data";

export default async function VoterElectionsPage() {
  const { supabase, user } = await requireRole("voter");
  const rows = await getVoterElections(supabase, user.id);

  return (
    <>
      <AdminPageHeader
        title="My Elections"
        description="Your registrations, secret voter IDs, and voting actions."
      />
      <VoterElectionList elections={rows} />
    </>
  );
}
