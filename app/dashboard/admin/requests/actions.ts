"use server";

import { revalidatePath } from "next/cache";

import { insertAuditLog, sendApprovalEmail, sendRejectionEmail } from "@/lib/email/send";
import { requireRole } from "@/lib/auth-server";

export async function approveElectionRequest(requestId: string) {
  const { supabase, user } = await requireRole("super_admin");

  const { data: request, error: fetchError } = await supabase
    .from("election_requests")
    .select(
      `
      id,
      creator_id,
      organization,
      status,
      creator:profiles!creator_id (name, email)
    `
    )
    .eq("id", requestId)
    .eq("status", "pending")
    .single();

  if (fetchError || !request) {
    return { error: "Request not found or already processed" };
  }

  const creator = Array.isArray(request.creator)
    ? request.creator[0]
    : request.creator;

  if (!creator?.email) {
    return { error: "Creator profile not found" };
  }

  const { error: requestError } = await supabase
    .from("election_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  if (requestError) {
    return { error: requestError.message };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "election_creator", is_approved: true })
    .eq("id", request.creator_id);

  if (profileError) {
    return { error: profileError.message };
  }

  try {
    await sendApprovalEmail({
      to: creator.email,
      name: creator.name,
      organization: request.organization,
      userId: request.creator_id,
    });

    await insertAuditLog(user.id, "election_request_approved", {
      request_id: requestId,
      creator_id: request.creator_id,
      organization: request.organization,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { error: `Approved, but email failed: ${message}` };
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/requests");

  return { success: true };
}

export async function rejectElectionRequest(
  requestId: string,
  reason: string
) {
  const { supabase, user } = await requireRole("super_admin");

  if (!reason.trim()) {
    return { error: "Rejection reason is required" };
  }

  const { data: request, error: fetchError } = await supabase
    .from("election_requests")
    .select(
      `
      id,
      creator_id,
      organization,
      status,
      creator:profiles!creator_id (name, email)
    `
    )
    .eq("id", requestId)
    .eq("status", "pending")
    .single();

  if (fetchError || !request) {
    return { error: "Request not found or already processed" };
  }

  const creator = Array.isArray(request.creator)
    ? request.creator[0]
    : request.creator;

  if (!creator?.email) {
    return { error: "Creator profile not found" };
  }

  const trimmedReason = reason.trim();

  const { error: requestError } = await supabase
    .from("election_requests")
    .update({
      status: "rejected",
      rejection_reason: trimmedReason,
    })
    .eq("id", requestId);

  if (requestError) {
    return { error: requestError.message };
  }

  try {
    await sendRejectionEmail({
      to: creator.email,
      name: creator.name,
      reason: trimmedReason,
      userId: request.creator_id,
    });

    await insertAuditLog(user.id, "election_request_rejected", {
      request_id: requestId,
      creator_id: request.creator_id,
      organization: request.organization,
      reason: trimmedReason,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { error: `Rejected, but email failed: ${message}` };
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/requests");

  return { success: true };
}
