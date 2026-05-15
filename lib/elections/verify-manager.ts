import { getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

export async function verifyElectionManager(electionId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Unauthorized", status: 401 };
  }

  const role = await getUserRole(supabase, user);

  if (!role) {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }

  const { data: election, error } = await supabase
    .from("elections")
    .select("id, title, category, start_time, creator_id, status")
    .eq("id", electionId)
    .single();

  if (error || !election) {
    return { ok: false as const, error: "Election not found", status: 404 };
  }

  const isAdmin = role === "super_admin";
  const isOwner =
    role === "election_creator" && election.creator_id === user.id;

  if (!isAdmin && !isOwner) {
    return { ok: false as const, error: "Forbidden", status: 403 };
  }

  return { ok: true as const, user, role, election };
}
