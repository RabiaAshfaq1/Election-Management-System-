export function verifyInternalEmailRequest(request: Request): boolean {
  const secret =
    process.env.EMAIL_API_SECRET ??
    process.env.CRON_SECRET ??
    process.env.INTERNAL_API_SECRET;

  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) {
    return true;
  }

  const cronHeader = request.headers.get("x-cron-secret");
  if (cronHeader === secret) {
    return true;
  }

  return false;
}
