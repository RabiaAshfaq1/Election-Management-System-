import { createClient } from "@/lib/supabase-server";
// SERVER ONLY — never import in client components

import { createAdminClient } from "@/lib/supabase-admin";
import type { Candidate, ElectionStatus } from "@/lib/types";

export interface PublicElection {
  id: string;
  title: string;
  description: string | null;
  status: ElectionStatus;
  start_time: string | null;
  end_time: string | null;
  registration_deadline: string | null;
  max_voters: number;
  category: string | null;
  organization: string;
  voter_count: number;
  registrations_locked?: boolean;
}

export interface ElectionDetail extends PublicElection {
  candidates: Candidate[];
}

export interface VoterRegistrationRow {
  id: string;
  election_id: string;
  user_id: string;
  has_voted: boolean;
  registered_at: string;
}

export async function getPublicElections(): Promise<PublicElection[]> {
  const supabase = createClient();

  const { data: elections, error } = await supabase
    .from("elections")
    .select(
      `
      id,
      title,
      description,
      status,
      start_time,
      end_time,
      registration_deadline,
      max_voters,
      category,
      creator_id,
      creator:profiles!creator_id (name)
    `
    )
    .in("status", ["published", "active", "completed"])
    .order("start_time", { ascending: false, nullsFirst: false });

  if (error || !elections) return [];

  const electionIds = elections.map((e) => e.id);
  let voterCounts: Record<string, number> = {};

  if (electionIds.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: registrations } = await admin
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
    } catch {
      // counts optional without service role
    }
  }

  const orgMap = new Map<string, string>();

  try {
    const admin = createAdminClient();
    const creatorIds = Array.from(new Set(elections.map((e) => e.creator_id)));
    const { data: requests } = await admin
      .from("election_requests")
      .select("creator_id, organization")
      .in("creator_id", creatorIds)
      .eq("status", "approved");

    for (const req of requests ?? []) {
      if (!orgMap.has(req.creator_id)) {
        orgMap.set(req.creator_id, req.organization);
      }
    }
  } catch {
    // fallback to profile name
  }

  return elections.map((e) => {
    const creator = Array.isArray(e.creator) ? e.creator[0] : e.creator;
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      status: e.status as ElectionStatus,
      start_time: e.start_time,
      end_time: e.end_time,
      registration_deadline: e.registration_deadline,
      max_voters: e.max_voters,
      category: e.category,
      organization:
        orgMap.get(e.creator_id) ?? creator?.name ?? "Organization",
      voter_count: voterCounts[e.id] ?? 0,
      registrations_locked:
        (voterCounts[e.id] ?? 0) >= e.max_voters,
    };
  });
}

export async function getElectionDetail(
  id: string
): Promise<ElectionDetail | null> {
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
      registration_deadline,
      max_voters,
      category,
      creator_id,
      creator:profiles!creator_id (name)
    `
    )
    .eq("id", id)
    .in("status", ["published", "active", "completed"])
    .maybeSingle();

  if (error || !election) return null;

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .eq("election_id", id)
    .order("created_at", { ascending: true });

  let voterCount = 0;
  let organization = "Organization";

  try {
    const admin = createAdminClient();

    const { count } = await admin
      .from("voter_registrations")
      .select("*", { count: "exact", head: true })
      .eq("election_id", id);

    voterCount = count ?? 0;

    const { data: request } = await admin
      .from("election_requests")
      .select("organization")
      .eq("creator_id", election.creator_id)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (request?.organization) {
      organization = request.organization;
    }
  } catch {
    const creator = Array.isArray(election.creator)
      ? election.creator[0]
      : election.creator;
    if (creator?.name) organization = creator.name;
  }

  const creator = Array.isArray(election.creator)
    ? election.creator[0]
    : election.creator;
  if (organization === "Organization" && creator?.name) {
    organization = creator.name;
  }

  return {
    id: election.id,
    title: election.title,
    description: election.description,
    status: election.status as ElectionStatus,
    start_time: election.start_time,
    end_time: election.end_time,
    registration_deadline: election.registration_deadline,
    max_voters: election.max_voters,
    category: election.category,
    organization,
    voter_count: voterCount,
    registrations_locked: voterCount >= election.max_voters,
    candidates: (candidates ?? []) as Candidate[],
  };
}

export async function getUserRegistration(
  electionId: string,
  userId: string
): Promise<VoterRegistrationRow | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from("voter_registrations")
    .select("id, election_id, user_id, has_voted, registered_at")
    .eq("election_id", electionId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

export async function isUserOnWaitlist(
  electionId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("election_waitlist")
      .select("id")
      .eq("election_id", electionId)
      .eq("user_id", userId)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

export function extractCategories(elections: PublicElection[]): string[] {
  const set = new Set<string>();
  for (const e of elections) {
    if (e.category?.trim()) set.add(e.category.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
