// SERVER ONLY — never import in client components

import { createAdminClient } from "@/lib/supabase-admin";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  electionId?: string | null;
}

export async function createInAppNotification(input: CreateNotificationInput) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
      election_id: input.electionId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
