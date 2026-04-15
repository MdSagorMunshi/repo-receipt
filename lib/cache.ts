import { Redis } from "@upstash/redis";

const CACHE_TTL = 60 * 60 * 24;
let warned = false;

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!warned) {
      console.warn("repo-receipt: Upstash Redis is not configured; receipt image caching is disabled.");
      warned = true;
    }
    return null;
  }

  return new Redis({ url, token });
}

export async function getCachedReceipt(key: string): Promise<Buffer | null> {
  const redis = getRedisClient();

  if (!redis) {
    return null;
  }

  const value = await redis.get<string>(key);
  return value ? Buffer.from(value, "base64") : null;
}

export async function setCachedReceipt(key: string, png: Buffer) {
  const redis = getRedisClient();

  if (!redis) {
    return;
  }

  await redis.set(key, png.toString("base64"), { ex: CACHE_TTL });
}
