import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  RequestsTable,
  type PendingRequest,
} from "@/components/admin/requests-table";
import { requireRole } from "@/lib/auth-server";

export default async function AdminRequestsPage() {
  const { supabase } = await requireRole("super_admin");

  const { data, error } = await supabase
    .from("election_requests")
    .select(
      `
      id,
      organization,
      purpose,
      email,
      created_at,
      creator:profiles!creator_id (name, email)
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const requests: PendingRequest[] = (data ?? []).map((row) => ({
    id: row.id,
    organization: row.organization,
    purpose: row.purpose,
    email: row.email,
    created_at: row.created_at,
    creator: Array.isArray(row.creator) ? row.creator[0] : row.creator,
  }));

  return (
    <>
      <AdminPageHeader
        title="Election Requests"
        description="Review and approve creator access requests."
      />
      <RequestsTable requests={requests} />
    </>
  );
}
