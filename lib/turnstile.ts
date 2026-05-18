import { getClientIp } from "@/lib/rate-limit";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  action?: string;
}

/**
 * Verifies a Cloudflare Turnstile token server-side.
 */
export async function verifyTurnstileToken(
  token: string,
  request?: Request
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[turnstile] TURNSTILE_SECRET_KEY not set — skipping verify in dev");
      return Boolean(token);
    }
    return false;
  }

  if (!token?.trim()) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (request) {
    const ip = getClientIp(request);
    if (ip !== "unknown") {
      body.set("remoteip", ip);
    }
  }

  let res: Response;
  try {
    res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );
  } catch (error) {
    console.error("[turnstile] siteverify request failed", error);
    return false;
  }

  if (!res.ok) {
    console.error("[turnstile] siteverify returned HTTP", res.status);
    return false;
  }

  const data = (await res.json()) as TurnstileVerifyResponse;
  if (!data.success) {
    console.error("[turnstile] verification failed", {
      errorCodes: data["error-codes"] ?? [],
      hostname: data.hostname,
      action: data.action,
    });
  }

  return data.success === true;
}
