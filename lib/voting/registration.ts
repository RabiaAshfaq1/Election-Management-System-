import type { SupabaseClient } from "@supabase/supabase-js";

export interface VoterRegistrationRecord {
  id: string;
  election_id: string;
  user_id: string;
  secret_id: string;
  has_voted: boolean;
}

export function normalizeSecretId(value: string): string {
  return value.trim().toUpperCase();
}

export function secretIdsMatch(stored: string, provided: string): boolean {
  return normalizeSecretId(stored) === normalizeSecretId(provided);
}

export async function getVoterRegistration(
  supabase: SupabaseClient,
  electionId: string,
  userId: string
): Promise<VoterRegistrationRecord | null> {
  const { data } = await supabase
    .from("voter_registrations")
    .select("id, election_id, user_id, secret_id, has_voted")
    .eq("election_id", electionId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}
