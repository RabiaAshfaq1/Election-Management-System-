import { NextResponse } from "next/server";

import { verifyInternalEmailRequest } from "@/lib/email/internal-auth";
import { insertAuditLog, sendTemplatedEmail } from "@/lib/email/send";
import type { EmailTemplate } from "@/lib/email/templates";
import {
  emailSendBodySchema,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/validations/core";

export async function POST(request: Request) {
  if (!verifyInternalEmailRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await parseJsonBody(request, emailSendBodySchema);

    const result = await sendTemplatedEmail({
      template: body.template as EmailTemplate,
      to: body.to,
      data: body.data,
      userId: body.userId,
      createNotification: body.notification
        ? {
            type: body.notification.type,
            title: body.notification.title,
            message: body.notification.message,
            link: body.notification.link,
            electionId: body.notification.electionId,
          }
        : undefined,
    });

    await insertAuditLog(body.userId ?? null, "email_sent", {
      template: body.template,
      to: body.to,
      subject: result.subject,
    });

    return NextResponse.json({ success: true, subject: result.subject });
  } catch (err) {
    const validation = validationErrorResponse(err);
    if (validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    const message =
      err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
