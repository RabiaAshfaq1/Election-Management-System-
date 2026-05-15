import { createAdminClient } from "@/lib/supabase-admin";

export interface ElectionTransparencySummary {
  total_votes: number;
  voter_list_frozen_at: string | null;
  override_count: number;
  has_overrides: boolean;
  results_verified: boolean;
}

function isOverrideAction(action: string): boolean {
  return action.toLowerCase().includes("override");
}

function logMatchesElection(
  details: Record<string, unknown> | null,
  electionId: string
): boolean {
  if (!details) return false;
  return details.election_id === electionId;
}

export async function getElectionTransparencySummary(
  electionId: string,
  totalVotes: number,
  isCompleted: boolean
): Promise<ElectionTransparencySummary> {
  let voterListFrozenAt: string | null = null;
  let overrideCount = 0;

  try {
    const admin = createAdminClient();

    const { data: logs } = await admin
      .from("audit_logs")
      .select("action, created_at, details")
      .order("created_at", { ascending: false })
      .limit(2000);

    for (const log of logs ?? []) {
      const details = log.details as Record<string, unknown> | null;
      if (!logMatchesElection(details, electionId)) continue;

      if (log.action === "voter_ids_generated") {
        if (!voterListFrozenAt) {
          voterListFrozenAt = log.created_at;
        }
      }

      if (isOverrideAction(log.action)) {
        overrideCount += 1;
      }
    }
  } catch {
    // summary is best-effort
  }

  return {
    total_votes: totalVotes,
    voter_list_frozen_at: voterListFrozenAt,
    override_count: overrideCount,
    has_overrides: overrideCount > 0,
    results_verified: isCompleted && overrideCount === 0,
  };
}
