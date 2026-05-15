import type { ElectionStatus } from "@/lib/types";

export interface VoterElectionRow {
  id: string;
  title: string;
  status: ElectionStatus;
  start_time: string | null;
  end_time: string | null;
  has_voted: boolean;
  registered_at: string;
  secret_id: string;
}
