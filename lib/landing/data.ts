// SERVER ONLY — never import in client components

import { createAdminClient } from "@/lib/supabase-admin";
import {
  getPublicElections,
  type PublicElection,
} from "@/lib/elections/data";

export type { PublicElection };

export interface PlatformStats {
  activeElections: number;
  votesCast: number;
  organizations: number;
  uptime: string;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const admin = createAdminClient();

    const [
      { count: activeElections },
      { count: votesCast },
      { data: creators },
    ] = await Promise.all([
      admin
        .from("elections")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      admin.from("votes").select("*", { count: "exact", head: true }),
      admin.from("elections").select("creator_id"),
    ]);

    const organizations = new Set(
      (creators ?? []).map((e) => e.creator_id)
    ).size;

    return {
      activeElections: activeElections ?? 0,
      votesCast: votesCast ?? 0,
      organizations,
      uptime: "99.9%",
    };
  } catch {
    return {
      activeElections: 0,
      votesCast: 0,
      organizations: 0,
      uptime: "99.9%",
    };
  }
}

export { getPublicElections };
