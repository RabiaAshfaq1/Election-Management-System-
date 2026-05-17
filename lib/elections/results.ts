// SERVER ONLY — never import in client components

import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import type { Candidate, ElectionStatus } from "@/lib/types";

const BAR_COLORS = ["#1a6b6b", "#c9a84c", "#e63946", "#2a9d8f", "#6b6b7a"];

export interface ResultsCandidate {
  id: string;
  name: string;
  designation: string | null;
  photo_url: string | null;
  manifesto: string | null;
  vote_count: number;
  percentage: number;
  rank: number;
  bar_color: string;
}

export interface ElectionResultsData {
  election: {
    id: string;
    title: string;
    description: string | null;
    status: ElectionStatus;
    start_time: string | null;
    end_time: string | null;
    category: string | null;
    organization: string;
    max_voters: number;
  };
  candidates: ResultsCandidate[];
  total_votes: number;
  total_registered: number;
  voted_count: number;
  turnout_percentage: number;
  winner: ResultsCandidate | null;
}

async function resolveOrganization(
  admin: ReturnType<typeof createAdminClient>,
  creatorId: string,
  fallbackName?: string | null
): Promise<string> {
  const { data: request } = await admin
    .from("election_requests")
    .select("organization")
    .eq("creator_id", creatorId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return request?.organization ?? fallbackName ?? "Organization";
}

function rankCandidates(
  candidates: Candidate[],
  voteMap: Map<string, number>
): ResultsCandidate[] {
  const totalVotes = Array.from(voteMap.values()).reduce(
    (sum, n) => sum + n,
    0
  );

  const ranked = candidates
    .map((candidate, index) => {
      const vote_count = voteMap.get(candidate.id) ?? 0;
      const percentage =
        totalVotes > 0
          ? Math.round((vote_count / totalVotes) * 1000) / 10
          : 0;

      return {
        id: candidate.id,
        name: candidate.name,
        designation: candidate.designation,
        photo_url: candidate.photo_url,
        manifesto: candidate.manifesto,
        vote_count,
        percentage,
        rank: 0,
        bar_color: BAR_COLORS[index % BAR_COLORS.length],
      };
    })
    .sort((a, b) => b.vote_count - a.vote_count);

  ranked.forEach((item, index) => {
    item.rank = index + 1;
  });

  return ranked;
}

export async function getElectionResults(
  electionId: string
): Promise<ElectionResultsData | null> {
  const supabase = createClient();

  const { data: election, error } = await supabase
    .from("elections")
    .select(
      `
      id,
      title,
      description,
      status,
      start_time,
      end_time,
      category,
      max_voters,
      creator_id,
      creator:profiles!creator_id (name)
    `
    )
    .eq("id", electionId)
    .in("status", ["published", "active", "completed"])
    .maybeSingle();

  if (error || !election) return null;

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .eq("election_id", electionId)
    .order("created_at", { ascending: true });

  let voteMap = new Map<string, number>();
  let totalRegistered = 0;
  let votedCount = 0;
  let organization = "Organization";

  try {
    const admin = createAdminClient();

    const creator = Array.isArray(election.creator)
      ? election.creator[0]
      : election.creator;

    organization = await resolveOrganization(
      admin,
      election.creator_id,
      creator?.name
    );

    const { data: voteRows } = await admin
      .from("votes")
      .select("candidate_id")
      .eq("election_id", electionId);

    voteMap = (voteRows ?? []).reduce<Map<string, number>>((map, row) => {
      map.set(row.candidate_id, (map.get(row.candidate_id) ?? 0) + 1);
      return map;
    }, new Map());

    const { count: regCount } = await admin
      .from("voter_registrations")
      .select("*", { count: "exact", head: true })
      .eq("election_id", electionId);

    const { count: voted } = await admin
      .from("voter_registrations")
      .select("*", { count: "exact", head: true })
      .eq("election_id", electionId)
      .eq("has_voted", true);

    totalRegistered = regCount ?? 0;
    votedCount = voted ?? 0;
  } catch {
    const { data: rpcCounts } = await supabase.rpc("get_election_vote_counts", {
      p_election_id: electionId,
    });

    if (rpcCounts) {
      for (const row of rpcCounts as { candidate_id: string; vote_count: number }[]) {
        voteMap.set(row.candidate_id, Number(row.vote_count));
      }
    }
  }

  const ranked = rankCandidates((candidates ?? []) as Candidate[], voteMap);
  const totalVotes = ranked.reduce((sum, c) => sum + c.vote_count, 0);
  const turnout =
    totalRegistered > 0
      ? Math.round((votedCount / totalRegistered) * 1000) / 10
      : 0;

  const leader =
    ranked.length > 0 && ranked[0].vote_count > 0 ? ranked[0] : null;

  return {
    election: {
      id: election.id,
      title: election.title,
      description: election.description,
      status: election.status as ElectionStatus,
      start_time: election.start_time,
      end_time: election.end_time,
      category: election.category,
      organization,
      max_voters: election.max_voters,
    },
    candidates: ranked,
    total_votes: totalVotes,
    total_registered: totalRegistered,
    voted_count: votedCount,
    turnout_percentage: turnout,
    winner: leader,
  };
}
