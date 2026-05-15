import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireRole } from "@/lib/auth-server";

export default async function CreatorCandidatesPage() {
  await requireRole("election_creator");

  return (
    <>
      <AdminPageHeader
        title="Candidates"
        description="Add and manage candidates for your elections."
      />
      <div className="rounded-2xl border border-dashed border-border bg-white px-8 py-16 text-center shadow-card">
        <p className="font-heading text-lg font-bold text-ink">Coming soon</p>
        <p className="mt-2 text-sm text-muted">
          Select an election from My Elections to manage its candidates.
        </p>
      </div>
    </>
  );
}
