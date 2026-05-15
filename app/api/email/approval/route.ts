import { NextResponse } from "next/server";

import { verifySuperAdmin } from "@/lib/admin/verify-admin";
import { insertAuditLog, sendApprovalEmail } from "@/lib/email/send";
import {
  emailApprovalBodySchema,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/validations/core";

export async function POST(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await parseJsonBody(request, emailApprovalBodySchema);

    await sendApprovalEmail({
      to: body.to,
      name: body.name,
      organization: body.organization,
      userId: body.creatorId,
    });

    await insertAuditLog(auth.user.id, "election_request_approved_email", {
      request_id: body.requestId,
      creator_id: body.creatorId,
      organization: body.organization,
      recipient: body.to,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const validation = validationErrorResponse(err);
    if (validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
