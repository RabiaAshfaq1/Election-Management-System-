const TEAL = "#1a6b6b";
const INK = "#0a0a0f";
const MUTED = "#6b6b7a";
const PAPER = "#f5f3ee";
const WHITE = "#ffffff";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function emailLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VoteFlow</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER};font-family:'DM Sans',system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${PAPER};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:${WHITE};border-radius:16px;overflow:hidden;border:1px solid rgba(10,10,15,0.08);">
          <tr>
            <td style="background-color:${TEAL};padding:28px 32px;text-align:center;">
              <p style="margin:0;font-family:Fraunces,Georgia,'Times New Roman',serif;font-size:32px;font-weight:700;color:${WHITE};letter-spacing:-0.02em;">
                VoteFlow
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:${INK};font-size:15px;line-height:1.65;font-family:'DM Sans',system-ui,sans-serif;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid rgba(10,10,15,0.08);text-align:center;">
              <p style="margin:0;font-size:12px;color:${MUTED};font-family:'DM Sans',system-ui,sans-serif;">
                VoteFlow — Secure Elections Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<p style="margin:28px 0 0;text-align:center;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background-color:${TEAL};color:${WHITE};padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:600;font-size:14px;font-family:'DM Sans',system-ui,sans-serif;">
      ${escapeHtml(label)}
    </a>
  </p>`;
}

export function emailVerification(name: string, verifyUrl: string): string {
  const body = `
    <p style="margin:0 0 16px;color:${INK};">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;color:${INK};">
      Welcome to VoteFlow. Please verify your email address to activate your account and participate in secure elections.
    </p>
    ${ctaButton(verifyUrl, "Verify your account")}
    <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">
      If you did not create an account, you can safely ignore this email.
    </p>
  `;
  return emailLayout(body);
}

export function approvalEmail(name: string, organization: string): string {
  const dashboardUrl = `${appBaseUrl()}/dashboard/creator`;
  const body = `
    <p style="margin:0 0 16px;color:${INK};">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;color:${INK};">
      Your request to run elections for <strong>${escapeHtml(organization)}</strong> has been approved.
    </p>
    <p style="margin:0 0 16px;color:${INK};">
      You now have <strong>Election Creator</strong> access. Create elections, manage candidates, and publish certified results.
    </p>
    ${ctaButton(dashboardUrl, "Open creator dashboard")}
  `;
  return emailLayout(body);
}

export function rejectionEmail(name: string, reason: string): string {
  const body = `
    <p style="margin:0 0 16px;color:${INK};">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;color:${INK};">
      Your election creator request was not approved at this time.
    </p>
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${MUTED};">Reason</p>
    <p style="margin:0 0 16px;padding:16px;background-color:${PAPER};border-radius:12px;border-left:4px solid #e63946;color:${INK};">
      ${escapeHtml(reason)}
    </p>
    <p style="margin:0;font-size:14px;color:${MUTED};">
      Contact your administrator if you have questions.
    </p>
  `;
  return emailLayout(body);
}

export function secretIdEmail(
  name: string,
  electionTitle: string,
  secretId: string,
  startTime: string,
  voteUrl: string
): string {
  const body = `
    <p style="margin:0 0 16px;color:${INK};">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;color:${INK};">
      You are registered for <strong>${escapeHtml(electionTitle)}</strong>.
      Below is your secret voter ID.
    </p>
    <div style="margin:24px 0;padding:24px;background-color:${PAPER};border-radius:12px;border:2px dashed ${TEAL};text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};">Secret Voter ID</p>
      <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:700;color:${INK};letter-spacing:0.08em;">
        ${escapeHtml(secretId)}
      </p>
    </div>
    <p style="margin:20px 0 0;padding:12px 16px;background-color:rgba(230,57,70,0.08);border-left:4px solid #e63946;font-size:14px;color:${INK};">
      <strong>Do not share this ID.</strong> Use it to cast your vote.
    </p>
    <p style="margin:16px 0 0;font-size:14px;color:${MUTED};">
      <strong style="color:${INK};">Starts:</strong> ${escapeHtml(startTime)}
    </p>
    ${ctaButton(voteUrl, "Go to voting page")}
  `;
  return emailLayout(body);
}

export function electionStartReminder(
  name: string,
  electionTitle: string,
  startTime: string,
  voteUrl: string
): string {
  const body = `
    <p style="margin:0 0 16px;color:${INK};">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;color:${INK};">
      <strong>${escapeHtml(electionTitle)}</strong> begins in about one hour
      (${escapeHtml(startTime)}).
    </p>
    <p style="margin:0 0 16px;color:${INK};">
      Have your secret voter ID ready. Voting opens at the scheduled start time.
    </p>
    ${ctaButton(voteUrl, "View election")}
  `;
  return emailLayout(body);
}

export function electionEndNotification(
  name: string,
  electionTitle: string
): string {
  const body = `
    <p style="margin:0 0 16px;color:${INK};">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 16px;color:${INK};">
      Voting has ended for <strong>${escapeHtml(electionTitle)}</strong>.
    </p>
    <p style="margin:0 0 16px;color:${INK};">
      Results are being finalized. Thank you for participating.
    </p>
    ${ctaButton(`${appBaseUrl()}/elections`, "Browse elections")}
  `;
  return emailLayout(body);
}

export function winnerNotificationCreator(
  creatorName: string,
  electionTitle: string,
  winnerName: string,
  totalVotes: number
): string {
  const body = `
    <p style="margin:0 0 16px;color:${INK};">Hi ${escapeHtml(creatorName)},</p>
    <p style="margin:0 0 16px;color:${INK};">
      <strong>${escapeHtml(electionTitle)}</strong> has concluded.
    </p>
    <div style="margin:24px 0;padding:24px;background-color:${PAPER};border-radius:12px;text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};">Winner</p>
      <p style="margin:0;font-family:Fraunces,Georgia,serif;font-size:26px;font-weight:700;color:${TEAL};">
        ${escapeHtml(winnerName)}
      </p>
      <p style="margin:12px 0 0;font-size:14px;color:${MUTED};">
        ${totalVotes.toLocaleString()} votes cast
      </p>
    </div>
    ${ctaButton(`${appBaseUrl()}/dashboard/creator`, "View results in dashboard")}
  `;
  return emailLayout(body);
}

/** @deprecated Use electionStartReminder */
export function electionStartEmail(
  voterName: string,
  electionTitle: string,
  voteUrl: string
): string {
  return electionStartReminder(voterName, electionTitle, "now", voteUrl);
}

/** @deprecated Use winnerNotificationCreator */
export function winnerEmail(
  creatorName: string,
  electionTitle: string,
  winnerName: string,
  totalVotes: number
): string {
  return winnerNotificationCreator(
    creatorName,
    electionTitle,
    winnerName,
    totalVotes
  );
}
