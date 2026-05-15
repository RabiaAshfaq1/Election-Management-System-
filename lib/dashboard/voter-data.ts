// SERVER ONLY — never import in client components

import type { VoterElectionRow } from "@/lib/dashboard/types";

export type { VoterElectionRow };

export async function getVoterElections(
  supabase: ReturnType<typeof import("@/lib/supabase-server").createClient>,
  userId: string
): Promise<VoterElectionRow[]> {
  const { data } = await supabase
    .from("voter_registrations")
    .select(
      `
      has_voted,
      registered_at,
      secret_id,
      election:elections (
        id,
        title,
        status,
        start_time,
        end_time
      )
    `
    )
    .eq("user_id", userId)
    .order("registered_at", { ascending: false });

  const rows: VoterElectionRow[] = [];

  for (const reg of data ?? []) {
    const election = Array.isArray(reg.election) ? reg.election[0] : reg.election;
    if (!election) continue;

    rows.push({
      id: election.id,
      title: election.title,
      status: election.status,
      start_time: election.start_time,
      end_time: election.end_time,
      has_voted: reg.has_voted,
      registered_at: reg.registered_at,
      secret_id: reg.secret_id,
    });
  }

  return rows;
}
