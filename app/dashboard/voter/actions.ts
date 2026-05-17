"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function becomeElectionCreator() {
  const { user, role } = await requireAuth();

  if (role === "super_admin") {
    return { error: "You are already a platform admin." };
  }

  if (role === "election_creator") {
    redirect("/dashboard/creator");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role: "election_creator", is_approved: true })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/voter");
  revalidatePath("/dashboard/creator");
  redirect("/dashboard/creator");
}
