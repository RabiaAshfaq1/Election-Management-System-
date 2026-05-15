import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ElectionWizardForm } from "@/components/creator/election-wizard-form";
import { requireRole } from "@/lib/auth-server";

export default async function CreateElectionPage() {
  await requireRole("election_creator");

  return (
    <>
      <AdminPageHeader
        title="Create Election"
        description="Set up a new election in three simple steps."
      />
      <ElectionWizardForm mode="create" />
    </>
  );
}
