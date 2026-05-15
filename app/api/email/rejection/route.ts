import { NextResponse } from "next/server";

import { verifySuperAdmin } from "@/lib/admin/verify-admin";
import { insertAuditLog, sendRejectionEmail } from "@/lib/email/send";
import {
  emailRejectionBodySchema,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/validations/core";

export async function POST(request: Request) {
  const auth = await verifySuperAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await parseJsonBody(request, emailRejectionBodySchema);

    await sendRejectionEmail({
      to: body.to,
      name: body.name,
      reason: body.reason,
      userId: body.creatorId,
    });

    await insertAuditLog(auth.user.id, "election_request_rejected_email", {
      request_id: body.requestId,
      creator_id: body.creatorId,
      recipient: body.to,
      reason: body.reason,
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
