import { notFound, redirect } from "next/navigation";

import { VoteExperience } from "@/components/voting/vote-experience";
import { getUserRole } from "@/lib/auth";
import { getElectionDetail, getUserRegistration } from "@/lib/elections/data";
import { createClient } from "@/lib/supabase-server";

interface VotePageProps {
  params: { id: string };
}

export default async function VotePage({ params }: VotePageProps) {
  const electionId = params.id;
  const votePath = `/elections/${electionId}/vote`;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/auth/login?redirectTo=${encodeURIComponent(votePath)}`
    );
  }

  const role = await getUserRole(supabase, user);
  if (!role) {
    redirect("/auth/login?error=missing_role");
  }

  const election = await getElectionDetail(electionId);

  if (!election) {
    notFound();
  }

  if (election.status !== "active") {
    redirect(`/elections/${electionId}`);
  }

  const registration = await getUserRegistration(electionId, user.id);

  if (!registration) {
    redirect(`/elections/${electionId}`);
  }

  if (registration.has_voted) {
    redirect(`/elections/${electionId}/results`);
  }

  return (
    <VoteExperience
      electionId={electionId}
      electionTitle={election.title}
      candidates={election.candidates}
    />
  );
}
