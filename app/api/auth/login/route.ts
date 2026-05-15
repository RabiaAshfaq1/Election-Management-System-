import { NextResponse } from "next/server";

import { authGuardResponse } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase-server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  loginApiSchema,
  parseJsonBody,
  validationErrorResponse,
} from "@/lib/validations/core";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, loginApiSchema);

    const captchaOk = await verifyTurnstileToken(body.turnstileToken, request);
    if (!captchaOk) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: { id: data.user?.id, email: data.user?.email },
    });
  } catch (err) {
    const validation = validationErrorResponse(err);
    if (validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    const guarded = authGuardResponse(err);
    if (guarded) return guarded;
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
