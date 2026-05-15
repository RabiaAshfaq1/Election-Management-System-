"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth-server";
import type { ElectionFormInput } from "@/lib/validations/election";

type SubmitStatus = "draft" | "published";

function toPayload(data: ElectionFormInput, status: SubmitStatus) {
  return {
    title: data.title,
    description: data.description || null,
    category: data.category,
    start_time: new Date(data.start_time).toISOString(),
    end_time: new Date(data.end_time).toISOString(),
    registration_deadline: new Date(data.registration_deadline).toISOString(),
    max_voters: data.max_voters,
    status,
  };
}

export async function createElection(
  data: ElectionFormInput,
  status: SubmitStatus
) {
  const { supabase, user } = await requireRole("election_creator");

  const { data: election, error } = await supabase
    .from("elections")
    .insert({
      ...toPayload(data, status),
      creator_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/creator");
  revalidatePath("/dashboard/creator/create");

  return { success: true, id: election.id };
}

export async function updateElection(
  electionId: string,
  data: ElectionFormInput,
  status: SubmitStatus
) {
  const { supabase, user } = await requireRole("election_creator");

  const { data: existing, error: fetchError } = await supabase
    .from("elections")
    .select("id, status, creator_id")
    .eq("id", electionId)
    .single();

  if (fetchError || !existing) {
    return { error: "Election not found" };
  }

  if (existing.creator_id !== user.id) {
    return { error: "You do not have permission to edit this election" };
  }

  if (existing.status !== "draft") {
    return { error: "Only draft elections can be edited" };
  }

  const { error } = await supabase
    .from("elections")
    .update(toPayload(data, status))
    .eq("id", electionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/creator");
  revalidatePath(`/dashboard/creator/elections/${electionId}/edit`);

  return { success: true, id: electionId };
}

async function assertElectionOwner(
  supabase: ReturnType<typeof import("@/lib/supabase-server").createClient>,
  userId: string,
  electionId: string
) {
  const { data, error } = await supabase
    .from("elections")
    .select("id, title, status, creator_id, start_time")
    .eq("id", electionId)
    .single();

  if (error || !data) return { error: "Election not found" as const };
  if (data.creator_id !== userId) {
    return { error: "You do not have permission" as const };
  }
  return { election: data };
}

export async function publishElection(electionId: string) {
  const { supabase, user } = await requireRole("election_creator");
  const check = await assertElectionOwner(supabase, user.id, electionId);
  if ("error" in check) return { error: check.error };
  if (check.election.status !== "draft") {
    return { error: "Only draft elections can be published" };
  }

  const { error } = await supabase
    .from("elections")
    .update({ status: "published" })
    .eq("id", electionId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/creator");
  revalidatePath("/dashboard/creator/elections");
  return { success: true };
}

export async function startElection(electionId: string) {
  const { supabase, user } = await requireRole("election_creator");
  const check = await assertElectionOwner(supabase, user.id, electionId);
  if ("error" in check) return { error: check.error };
  if (!["published", "draft"].includes(check.election.status)) {
    return { error: "Election cannot be started from this status" };
  }

  const { error } = await supabase
    .from("elections")
    .update({ status: "active" })
    .eq("id", electionId);

  if (error) return { error: error.message };

  try {
    const { createAdminClient } = await import("@/lib/supabase-admin");
    const { sendElectionStartReminderEmail } = await import("@/lib/email/send");
    const { format } = await import("date-fns");

    const admin = createAdminClient();
    const startLabel = check.election.start_time
      ? format(new Date(check.election.start_time), "MMM d, yyyy 'at' h:mm a")
      : "now";

    const { data: registrations } = await admin
      .from("voter_registrations")
      .select(
        `user_id, profile:profiles!user_id (email, name)`
      )
      .eq("election_id", electionId);

    for (const reg of registrations ?? []) {
      const profile = Array.isArray(reg.profile) ? reg.profile[0] : reg.profile;
      if (!profile?.email) continue;
      try {
        await sendElectionStartReminderEmail({
          to: profile.email,
          voterName: profile.name ?? "Voter",
          electionTitle: check.election.title,
          startTime: startLabel,
          electionId,
          userId: reg.user_id,
        });
      } catch {
        // continue notifying others
      }
    }
  } catch {
    // election started; emails best-effort
  }

  revalidatePath("/dashboard/creator");
  revalidatePath("/dashboard/creator/elections");
  revalidatePath(`/elections/${electionId}`);
  return { success: true };
}

export async function stopElection(electionId: string) {
  const { supabase, user } = await requireRole("election_creator");
  const check = await assertElectionOwner(supabase, user.id, electionId);
  if ("error" in check) return { error: check.error };
  if (check.election.status !== "active") {
    return { error: "Only active elections can be stopped" };
  }

  const { error } = await supabase
    .from("elections")
    .update({ status: "completed" })
    .eq("id", electionId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/creator");
  revalidatePath("/dashboard/creator/elections");
  return { success: true };
}
