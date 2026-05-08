/**
 * IP-based rate limiter.
 *
 * Uses Upstash/Vercel KV Redis when configured (UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL + KV_REST_API_TOKEN) for
 * cross-instance consistency on Vercel.
 *
 * Redis is OPTIONAL. When not configured — or when it errors — the limiter
 * falls back to an in-memory bucket per serverless instance. In-memory rate
 * limiting is best-effort on Vercel (not shared across instances), but it
 * will never block a request simply because Redis is unavailable.
 *
 * To add distributed rate limiting later: set UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN in your Vercel environment variables.
 */

type Bucket = {
  count: number;
  expiresAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  reason?: string;
};

type RedisConfig = {
  url: string;
  token: string;
};

const GLOBAL_KEY = "__bizsprRateLimitBuckets";
const WARNED_GLOBAL_KEY = "__bizsprRateLimitWarned";
const DEFAULT_RESPONSE: RateLimitResult = {
  allowed: true,
  remaining: 0,
  retryAfterSeconds: 1,
};

function getStore(): Map<string, Bucket> {
  const globalRef = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Map<string, Bucket>;
  };
  if (!globalRef[GLOBAL_KEY]) {
    globalRef[GLOBAL_KEY] = new Map<string, Bucket>();
  }
  return globalRef[GLOBAL_KEY]!;
}

function hasWarnedRedisFallback(): boolean {
  return (globalThis as Record<string, unknown>)[WARNED_GLOBAL_KEY] === true;
}

function markWarnedRedisFallback(): void {
  (globalThis as Record<string, unknown>)[WARNED_GLOBAL_KEY] = true;
}

function getRedisConfig(): RedisConfig | null {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (upstashUrl && upstashToken) {
    return { url: upstashUrl.replace(/\/+$/, ""), token: upstashToken };
  }

  const kvUrl = process.env.KV_REST_API_URL?.trim();
  const kvToken = process.env.KV_REST_API_TOKEN?.trim();
  if (kvUrl && kvToken) {
    return { url: kvUrl.replace(/\/+$/, ""), token: kvToken };
  }

  return null;
}

function pruneExpiredBuckets(store: Map<string, Bucket>, now: number): void {
  if (store.size < 2_000) return;
  for (const [key, bucket] of store.entries()) {
    if (bucket.expiresAt <= now) {
      store.delete(key);
    }
  }
}

function buildResult(count: number, limit: number, retryAfterSeconds: number): RateLimitResult {
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, retryAfterSeconds),
  };
}

function checkRateLimitInMemory(
  scopedKey: string,
  limit: number,
  windowEndMs: number,
  windowMs: number,
  now: number
): RateLimitResult {
  const store = getStore();
  pruneExpiredBuckets(store, now);

  const existing = store.get(scopedKey);
  if (!existing || existing.expiresAt <= now) {
    store.set(scopedKey, { count: 1, expiresAt: windowEndMs + windowMs });
    return buildResult(1, limit, Math.ceil((windowEndMs - now) / 1000));
  }

  existing.count += 1;
  return buildResult(existing.count, limit, Math.ceil((windowEndMs - now) / 1000));
}

async function checkRateLimitInRedis(
  config: RedisConfig,
  scopedKey: string,
  limit: number,
  windowEndMs: number,
  windowMs: number,
  now: number
): Promise<RateLimitResult> {
  const expirySeconds = Math.max(1, Math.ceil((windowMs * 2) / 1000));
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", scopedKey],
      ["EXPIRE", scopedKey, String(expirySeconds)],
    ]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Rate limit backend returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as Array<{ result?: unknown }>;
  const count = Number(payload?.[0]?.result ?? 0);
  if (!Number.isFinite(count) || count < 1) {
    throw new Error("Invalid rate limit backend response.");
  }

  return buildResult(count, limit, Math.ceil((windowEndMs - now) / 1000));
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (limit <= 0 || windowMs <= 0) return DEFAULT_RESPONSE;

  const now = Date.now();
  const windowId = Math.floor(now / windowMs);
  const windowEndMs = (windowId + 1) * windowMs;
  const scopedKey = `${key}:${windowId}`;
  const redisConfig = getRedisConfig();

  // No Redis configured — use in-memory best-effort limiter.
  // This is not shared across Vercel serverless instances, but it will
  // never block a request simply because Redis is unavailable.
  if (!redisConfig) {
    return checkRateLimitInMemory(scopedKey, limit, windowEndMs, windowMs, now);
  }

  try {
    return await checkRateLimitInRedis(redisConfig, scopedKey, limit, windowEndMs, windowMs, now);
  } catch (error) {
    // Redis error — fail open to in-memory. Never block because backend is down.
    if (!hasWarnedRedisFallback()) {
      console.warn("[rateLimit] Redis backend error — falling back to in-memory limiter.", error);
      markWarnedRedisFallback();
    }
    return checkRateLimitInMemory(scopedKey, limit, windowEndMs, windowMs, now);
  }
}
