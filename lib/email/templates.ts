import {
  approvalEmail,
  electionEndNotification,
  electionStartReminder,
  emailVerification,
  rejectionEmail,
  secretIdEmail,
  winnerNotificationCreator,
} from "@/lib/emails";

export type EmailTemplate =
  | "email_verification"
  | "approval"
  | "rejection"
  | "secret_id"
  | "election_start_reminder"
  | "election_end"
  | "winner_creator";

export const EMAIL_SUBJECTS: Record<EmailTemplate, string> = {
  email_verification: "Verify your VoteFlow account",
  approval: "Your election creator request was approved",
  rejection: "Your request was not approved",
  secret_id: "Your secret voter ID",
  election_start_reminder: "Election starts in 1 hour",
  election_end: "Election has ended",
  winner_creator: "Election results are in",
};

export function renderEmailTemplate(
  template: EmailTemplate,
  data: Record<string, string | number>
): { subject: string; html: string } {
  switch (template) {
    case "email_verification":
      return {
        subject: EMAIL_SUBJECTS.email_verification,
        html: emailVerification(
          String(data.name),
          String(data.verifyUrl)
        ),
      };
    case "approval":
      return {
        subject: EMAIL_SUBJECTS.approval,
        html: approvalEmail(String(data.name), String(data.organization)),
      };
    case "rejection":
      return {
        subject: EMAIL_SUBJECTS.rejection,
        html: rejectionEmail(String(data.name), String(data.reason)),
      };
    case "secret_id":
      return {
        subject: `${EMAIL_SUBJECTS.secret_id} — ${data.electionTitle}`,
        html: secretIdEmail(
          String(data.name),
          String(data.electionTitle),
          String(data.secretId),
          String(data.startTime),
          String(data.voteUrl)
        ),
      };
    case "election_start_reminder":
      return {
        subject: `${EMAIL_SUBJECTS.election_start_reminder} — ${data.electionTitle}`,
        html: electionStartReminder(
          String(data.name),
          String(data.electionTitle),
          String(data.startTime),
          String(data.voteUrl)
        ),
      };
    case "election_end":
      return {
        subject: `${EMAIL_SUBJECTS.election_end} — ${data.electionTitle}`,
        html: electionEndNotification(
          String(data.name),
          String(data.electionTitle)
        ),
      };
    case "winner_creator":
      return {
        subject: `${EMAIL_SUBJECTS.winner_creator} — ${data.electionTitle}`,
        html: winnerNotificationCreator(
          String(data.creatorName),
          String(data.electionTitle),
          String(data.winnerName),
          Number(data.totalVotes)
        ),
      };
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}
