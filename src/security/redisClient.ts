/**
 * Shared Redis client for all security modules.
 * Uses Upstash Redis REST API (compatible with Vercel KV).
 * Falls back to in-memory when Redis is not configured.
 */

export type RedisConfig = {
  url: string;
  token: string;
};

const WARNED_KEY = "__bizsprRedisClientWarned";

function hasWarned(): boolean {
  return (globalThis as Record<string, unknown>)[WARNED_KEY] === true;
}

function markWarned(): void {
  (globalThis as Record<string, unknown>)[WARNED_KEY] = true;
}

export function getRedisConfig(): RedisConfig | null {
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

/**
 * Execute a Redis pipeline (array of commands).
 * Returns array of results or null on failure.
 */
export async function redisPipeline(
  config: RedisConfig,
  commands: string[][]
): Promise<Array<{ result?: unknown }> | null> {
  try {
    const response = await fetch(`${config.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Redis returned HTTP ${response.status}`);
    }

    return (await response.json()) as Array<{ result?: unknown }>;
  } catch (error) {
    if (!hasWarned()) {
      console.error("Redis unavailable; falling back to in-memory.", error);
      markWarned();
    }
    return null;
  }
}

/**
 * Increment a Redis key with expiry. Returns the new count, or null on failure.
 */
export async function redisIncr(
  config: RedisConfig,
  key: string,
  expirySeconds: number
): Promise<number | null> {
  const results = await redisPipeline(config, [
    ["INCR", key],
    ["EXPIRE", key, String(expirySeconds)],
  ]);

  if (!results) return null;
  const count = Number(results[0]?.result ?? 0);
  return Number.isFinite(count) && count >= 1 ? count : null;
}

/**
 * Get a Redis key value. Returns the value or null.
 */
export async function redisGet(
  config: RedisConfig,
  key: string
): Promise<string | null> {
  const results = await redisPipeline(config, [["GET", key]]);
  if (!results) return null;
  const val = results[0]?.result;
  return typeof val === "string" ? val : null;
}

/**
 * Set a Redis key with expiry.
 */
export async function redisSet(
  config: RedisConfig,
  key: string,
  value: string,
  expirySeconds: number
): Promise<boolean> {
  const results = await redisPipeline(config, [
    ["SET", key, value, "EX", String(expirySeconds)],
  ]);
  return results !== null;
}
