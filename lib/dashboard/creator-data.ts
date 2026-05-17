// SERVER ONLY — never import in client components

import type { ElectionCardData } from "@/lib/dashboard/types";

export async function getCreatorElections(
  supabase: ReturnType<typeof import("@/lib/supabase-server").createClient>,
  userId: string
): Promise<ElectionCardData[]> {
  const { data: elections } = await supabase
    .from("elections")
    .select(
      "id, title, description, category, status, start_time, end_time, registration_deadline, max_voters"
    )
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  const list = elections ?? [];
  const electionIds = list.map((e) => e.id);
  let voterCounts: Record<string, number> = {};

  if (electionIds.length > 0) {
    const { data: registrations } = await supabase
      .from("voter_registrations")
      .select("election_id")
      .in("election_id", electionIds);

    voterCounts = (registrations ?? []).reduce<Record<string, number>>(
      (acc, row) => {
        acc[row.election_id] = (acc[row.election_id] ?? 0) + 1;
        return acc;
      },
      {}
    );
  }

  return list.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    status: e.status,
    start_time: e.start_time,
    end_time: e.end_time,
    registration_deadline: e.registration_deadline,
    max_voters: e.max_voters,
    voter_count: voterCounts[e.id] ?? 0,
  }));
}

export async function getCreatorOverviewStats(
  supabase: ReturnType<typeof import("@/lib/supabase-server").createClient>,
  userId: string
) {
  const elections = await getCreatorElections(supabase, userId);
  const now = new Date();

  const activeElections = elections.filter((e) => e.status === "active");
  const totalVoters = elections.reduce((a, e) => a + (e.voter_count ?? 0), 0);

  const upcomingDeadlines = elections
    .filter(
      (e) =>
        e.registration_deadline &&
        new Date(e.registration_deadline) > now &&
        ["draft", "published"].includes(e.status)
    )
    .sort(
      (a, b) =>
        new Date(a.registration_deadline!).getTime() -
        new Date(b.registration_deadline!).getTime()
    )
    .slice(0, 5);

  return {
    activeElections,
    totalVoters,
    upcomingDeadlines,
    activeCount: activeElections.length,
  };
}
