import { getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

export async function verifyElectionCreator(electionId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Unauthorized", status: 401 };
  }

  const role = await getUserRole(supabase, user);

  if (role !== "election_creator") {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }

  const { data: election, error } = await supabase
    .from("elections")
    .select("id, title, creator_id")
    .eq("id", electionId)
    .single();

  if (error || !election || election.creator_id !== user.id) {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }

  return { ok: true as const, supabase, user, election };
}

export async function verifyCandidateOwner(candidateId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Unauthorized", status: 401 };
  }

  const role = await getUserRole(supabase, user);

  if (role !== "election_creator") {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }

  const { data: candidate, error } = await supabase
    .from("candidates")
    .select(
      `
      id,
      election_id,
      photo_url,
      election:elections!election_id (creator_id, title)
    `
    )
    .eq("id", candidateId)
    .single();

  if (error || !candidate) {
    return { ok: false as const, error: "Not found", status: 404 };
  }

  const election = Array.isArray(candidate.election)
    ? candidate.election[0]
    : candidate.election;

  if (!election || election.creator_id !== user.id) {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }

  return {
    ok: true as const,
    supabase,
    user,
    candidate,
    election: { id: candidate.election_id, title: election.title },
  };
}
