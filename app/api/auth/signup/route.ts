import { NextResponse } from "next/server";

import { authGuardResponse } from "@/lib/auth-guard";
import { getAuthCallbackUrl } from "@/lib/auth-client";
import { createClient } from "@/lib/supabase-server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  parseJsonBody,
  signupApiSchema,
  validationErrorResponse,
} from "@/lib/validations/core";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, signupApiSchema);

    const captchaOk = await verifyTurnstileToken(body.turnstileToken, request);
    if (!captchaOk) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          name: body.fullName,
          phone: body.phone,
        },
        emailRedirectTo: getAuthCallbackUrl("/auth/verify"),
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, email: body.email });
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
    const message = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
