import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CandidatesManager } from "@/components/creator/candidates-manager";
import { requireRole } from "@/lib/auth-server";
import type { Candidate } from "@/lib/types";

interface CandidatesPageProps {
  params: { id: string };
}

export default async function ElectionCandidatesPage({
  params,
}: CandidatesPageProps) {
  const { supabase, user } = await requireRole("election_creator");

  const { data: election, error } = await supabase
    .from("elections")
    .select("id, title")
    .eq("id", params.id)
    .eq("creator_id", user.id)
    .single();

  if (error || !election) {
    notFound();
  }

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .eq("election_id", params.id)
    .order("created_at", { ascending: true });

  return (
    <>
      <div className="mb-8">
        <Link
          href="/dashboard/creator"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-teal hover:text-teal-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Elections
        </Link>
        <h1 className="font-heading text-3xl font-bold text-ink">
          {election.title}
        </h1>
        <p className="mt-2 text-sm text-muted">Manage candidates for this election</p>
      </div>

      <CandidatesManager
        electionId={election.id}
        initialCandidates={(candidates ?? []) as Candidate[]}
      />
    </>
  );
}
