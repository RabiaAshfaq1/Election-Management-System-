import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ElectionWizardForm } from "@/components/creator/election-wizard-form";
import { toDatetimeLocalValue } from "@/lib/election-utils";
import { requireRole } from "@/lib/auth-server";
import type { ElectionCategory } from "@/lib/validations/election";

interface EditElectionPageProps {
  params: { id: string };
}

export default async function EditElectionPage({ params }: EditElectionPageProps) {
  const { supabase, user } = await requireRole("election_creator");

  const { data: election, error } = await supabase
    .from("elections")
    .select("*")
    .eq("id", params.id)
    .eq("creator_id", user.id)
    .single();

  if (error || !election) {
    notFound();
  }

  const isDraft = election.status === "draft";

  return (
    <>
      <AdminPageHeader
        title={isDraft ? "Edit Election" : "View Election"}
        description={
          isDraft
            ? "Update your draft before publishing."
            : "This election can no longer be edited."
        }
      />
      <ElectionWizardForm
        mode="edit"
        electionId={election.id}
        readOnly={!isDraft}
        currentStatus={election.status}
        defaultValues={{
          title: election.title,
          description: election.description ?? "",
          category: (election.category as ElectionCategory) ?? "Other",
          start_time: toDatetimeLocalValue(election.start_time),
          end_time: toDatetimeLocalValue(election.end_time),
          registration_deadline: toDatetimeLocalValue(
            election.registration_deadline
          ),
          max_voters: election.max_voters,
        }}
      />
    </>
  );
}
