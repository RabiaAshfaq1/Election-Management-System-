import type { ElectionStatus } from "@/lib/types";

export interface ElectionCardData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: ElectionStatus;
  start_time: string | null;
  end_time: string | null;
  registration_deadline: string | null;
  max_voters: number;
  voter_count?: number;
}

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
