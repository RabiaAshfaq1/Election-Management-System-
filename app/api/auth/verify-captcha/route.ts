import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  parseJsonBody,
  turnstileTokenSchema,
  validationErrorResponse,
} from "@/lib/validations/core";

const captchaBodySchema = z.object({
  turnstileToken: turnstileTokenSchema,
});

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, captchaBodySchema);
    const ok = await verifyTurnstileToken(body.turnstileToken, request);

    if (!ok) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const validation = validationErrorResponse(err);
    if (validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    return NextResponse.json({ error: "CAPTCHA verification failed" }, { status: 400 });
  }
}
