import { getRedisClient } from "@/lib/cache";

const FALLBACK_WINDOW_MS = 60 * 60 * 1000;
const fallbackStore = new Map<string, { count: number; resetAt: number }>();
let warnedAboutFallback = false;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
}

function getWindowReset(windowMs: number) {
  const now = Date.now();
  const startedAt = Math.floor(now / windowMs) * windowMs;
  return startedAt + windowMs;
}

function cleanupFallbackStore(now: number) {
  for (const [key, entry] of fallbackStore.entries()) {
    if (entry.resetAt <= now) {
      fallbackStore.delete(key);
    }
  }
}

async function rateLimitWithFallback(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now();
  cleanupFallbackStore(now);

  const existing = fallbackStore.get(key);
  const resetAt = existing?.resetAt ?? getWindowReset(windowMs);
  const count = existing && existing.resetAt > now ? existing.count + 1 : 1;
  fallbackStore.set(key, { count, resetAt });

  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
    retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

export async function applyRateLimit(name: string, identifier: string, limit: number, windowMs = FALLBACK_WINDOW_MS) {
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const resetAt = getWindowReset(windowMs);
  const redisKey = `ratelimit:${name}:${bucket}:${identifier}`;
  const redis = getRedisClient();

  if (!redis) {
    if (!warnedAboutFallback) {
      console.warn("repo-receipt: Upstash Redis is not configured; falling back to in-memory rate limiting.");
      warnedAboutFallback = true;
    }

    return rateLimitWithFallback(redisKey, limit, windowMs);
  }

  const count = await redis.incr(redisKey);

  if (count === 1) {
    await redis.expire(redisKey, Math.max(1, Math.ceil((resetAt - now) / 1000)));
  }

  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetAt,
    retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  } satisfies RateLimitResult;
}
