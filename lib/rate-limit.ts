/**
 * In-memory rate limiter for middleware and API routes.
 * Note: resets on cold starts; use Upstash Redis for multi-instance production.
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

const MAX_STORE_SIZE = 10_000;

function pruneStore() {
  if (store.size <= MAX_STORE_SIZE) return;
  const now = Date.now();
  for (const [key, bucket] of Array.from(store.entries())) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
    if (store.size <= MAX_STORE_SIZE * 0.8) break;
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    pruneStore();
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 },
  votingApi: { limit: 10, windowMs: 60 * 1000 },
} as const;
