// SERVER ONLY — never import in client components

import { Resend } from "resend";

import { renderEmailTemplate, type EmailTemplate } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase-admin";
import { createInAppNotification } from "@/lib/notifications/create";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail =
  process.env.RESEND_FROM_EMAIL ?? "VoteFlow <onboarding@resend.dev>";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export interface SendTemplatedEmailInput {
  template: EmailTemplate;
  to: string;
  data: Record<string, string | number>;
  userId?: string | null;
  createNotification?: {
    type: string;
    title: string;
    message: string;
    link?: string | null;
    electionId?: string | null;
  };
}

export async function sendTemplatedEmail({
  template,
  to,
  data,
  userId,
  createNotification,
}: SendTemplatedEmailInput) {
  const { subject, html } = renderEmailTemplate(template, data);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (createNotification && userId) {
    await createInAppNotification({
      userId,
      type: createNotification.type,
      title: createNotification.title,
      message: createNotification.message,
      link: createNotification.link,
      electionId: createNotification.electionId,
    });
  }

  return { subject };
}

export async function sendApprovalEmail({
  to,
  name,
  organization,
  userId,
}: {
  to: string;
  name: string;
  organization: string;
  userId?: string;
}) {
  await sendTemplatedEmail({
    template: "approval",
    to,
    data: { name, organization },
    userId,
    createNotification: userId
      ? {
          type: "election_request_approved",
          title: "Creator request approved",
          message: `Your request for ${organization} was approved.`,
          link: `${appUrl()}/dashboard/creator`,
        }
      : undefined,
  });
}

export async function sendRejectionEmail({
  to,
  name,
  reason,
  userId,
}: {
  to: string;
  name: string;
  reason: string;
  userId?: string;
}) {
  await sendTemplatedEmail({
    template: "rejection",
    to,
    data: { name, reason },
    userId,
    createNotification: userId
      ? {
          type: "election_request_rejected",
          title: "Creator request not approved",
          message: reason,
          link: `${appUrl()}/auth/signup`,
        }
      : undefined,
  });
}

export async function sendSecretIdEmail({
  to,
  voterName,
  electionTitle,
  secretId,
  startTime,
  electionId,
  userId,
}: {
  to: string;
  voterName: string;
  electionTitle: string;
  secretId: string;
  startTime: string;
  electionId: string;
  userId?: string;
}) {
  const voteUrl = `${appUrl()}/elections/${electionId}/vote`;

  await sendTemplatedEmail({
    template: "secret_id",
    to,
    data: {
      name: voterName,
      electionTitle,
      secretId,
      startTime,
      voteUrl,
    },
    userId,
    createNotification: userId
      ? {
          type: "registration_confirmed",
          title: "Secret voter ID issued",
          message: `Your ID for ${electionTitle} has been sent to your email.`,
          link: voteUrl,
          electionId,
        }
      : undefined,
  });
}

export async function sendElectionStartReminderEmail({
  to,
  voterName,
  electionTitle,
  startTime,
  electionId,
  userId,
}: {
  to: string;
  voterName: string;
  electionTitle: string;
  startTime: string;
  electionId: string;
  userId: string;
}) {
  const voteUrl = `${appUrl()}/elections/${electionId}/vote`;

  await sendTemplatedEmail({
    template: "election_start_reminder",
    to,
    data: {
      name: voterName,
      electionTitle,
      startTime,
      voteUrl,
    },
    userId,
    createNotification: {
      type: "election_started",
      title: "Election starts soon",
      message: `${electionTitle} begins in about one hour.`,
      link: voteUrl,
      electionId,
    },
  });
}

export async function sendElectionEndEmail({
  to,
  voterName,
  electionTitle,
  electionId,
  userId,
}: {
  to: string;
  voterName: string;
  electionTitle: string;
  electionId: string;
  userId: string;
}) {
  await sendTemplatedEmail({
    template: "election_end",
    to,
    data: { name: voterName, electionTitle },
    userId,
    createNotification: {
      type: "election_ended",
      title: "Election ended",
      message: `Voting has closed for ${electionTitle}.`,
      link: `${appUrl()}/elections/${electionId}/results`,
      electionId,
    },
  });
}

export async function sendWinnerEmail({
  to,
  creatorName,
  electionTitle,
  winnerName,
  totalVotes,
  userId,
}: {
  to: string;
  creatorName: string;
  electionTitle: string;
  winnerName: string;
  totalVotes: number;
  userId?: string;
}) {
  await sendTemplatedEmail({
    template: "winner_creator",
    to,
    data: { creatorName, electionTitle, winnerName, totalVotes },
    userId,
    createNotification: userId
      ? {
          type: "general",
          title: "Election completed",
          message: `${winnerName} won ${electionTitle} with ${totalVotes} votes.`,
          link: `${appUrl()}/dashboard/creator`,
        }
      : undefined,
  });
}

/** @deprecated Use sendElectionStartReminderEmail */
export async function sendElectionStartEmail(params: {
  to: string;
  voterName: string;
  electionTitle: string;
  electionId: string;
  userId?: string;
}) {
  return sendElectionStartReminderEmail({
    ...params,
    startTime: "soon",
    userId: params.userId ?? "",
  });
}

export async function insertAuditLog(
  userId: string | null,
  action: string,
  details: Record<string, unknown>
) {
  const admin = createAdminClient();

  const { error } = await admin.from("audit_logs").insert({
    user_id: userId,
    action,
    details,
  });

  if (error) {
    throw new Error(error.message);
  }
}
