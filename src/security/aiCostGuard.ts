/**
 * AI cost exposure limiter.
 *
 * Tracks AI API calls per IP/session to prevent runaway costs
 * from a single user or automated abuse.
 *
 * Uses Redis when available for cross-instance consistency on Vercel.
 * Falls back to in-memory counters.
 */

import { getRedisConfig, redisIncr } from "./redisClient";

const GLOBAL_KEY = "__bizsprAiCostTracker";

type CostEntry = {
  callCount: number;
  firstCallAt: number;
};

function getCostStore(): Map<string, CostEntry> {
  const globalRef = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Map<string, CostEntry>;
  };
  if (!globalRef[GLOBAL_KEY]) {
    globalRef[GLOBAL_KEY] = new Map<string, CostEntry>();
  }
  return globalRef[GLOBAL_KEY]!;
}

/** Max AI validation calls per IP per window. */
const MAX_AI_CALLS_PER_IP = parseInt(process.env.MAX_AI_CALLS_PER_IP ?? "10", 10);

/** Window duration in ms (1 hour). */
const AI_COST_WINDOW_MS = 60 * 60 * 1_000;
const AI_COST_EXPIRY_SECONDS = Math.ceil(AI_COST_WINDOW_MS / 1_000);

/** Global daily AI call budget across all users. */
const DAILY_GLOBAL_BUDGET = parseInt(process.env.DAILY_AI_BUDGET ?? "500", 10);
const DAILY_EXPIRY_SECONDS = 24 * 60 * 60;

const DAILY_KEY = "__bizsprAiDailyCount";

function getDailyCounter(): { count: number; date: string } {
  const globalRef = globalThis as typeof globalThis & {
    [DAILY_KEY]?: { count: number; date: string };
  };
  const today = new Date().toISOString().slice(0, 10);
  if (!globalRef[DAILY_KEY] || globalRef[DAILY_KEY].date !== today) {
    globalRef[DAILY_KEY] = { count: 0, date: today };
  }
  return globalRef[DAILY_KEY]!;
}

export type AiCostCheckResult = {
  allowed: boolean;
  reason?: string;
  remainingCalls?: number;
};

/**
 * In-memory fallback for AI cost limiting.
 */
function checkAiCostLimitInMemory(ip: string): AiCostCheckResult {
  const store = getCostStore();
  const now = Date.now();

  if (store.size > 5_000) {
    for (const [key, entry] of store.entries()) {
      if (now - entry.firstCallAt > AI_COST_WINDOW_MS) {
        store.delete(key);
      }
    }
  }

  const daily = getDailyCounter();
  if (daily.count >= DAILY_GLOBAL_BUDGET) {
    return { allowed: false, reason: "daily_ai_budget_exhausted", remainingCalls: 0 };
  }

  const entry = store.get(ip);
  if (!entry || now - entry.firstCallAt > AI_COST_WINDOW_MS) {
    store.set(ip, { callCount: 1, firstCallAt: now });
    daily.count += 1;
    return { allowed: true, remainingCalls: MAX_AI_CALLS_PER_IP - 1 };
  }

  if (entry.callCount >= MAX_AI_CALLS_PER_IP) {
    return { allowed: false, reason: "ai_calls_per_ip_exceeded", remainingCalls: 0 };
  }

  entry.callCount += 1;
  daily.count += 1;
  return { allowed: true, remainingCalls: MAX_AI_CALLS_PER_IP - entry.callCount };
}

/**
 * Check if an AI call should be allowed for this IP.
 * Uses Redis when available, falls back to in-memory.
 */
export async function checkAiCostLimit(ip: string): Promise<AiCostCheckResult> {
  const redisConfig = getRedisConfig();

  if (!redisConfig) {
    return checkAiCostLimitInMemory(ip);
  }

  try {
    // Check global daily budget
    const today = new Date().toISOString().slice(0, 10);
    const dailyKey = `aicost:daily:${today}`;
    const dailyCount = await redisIncr(redisConfig, dailyKey, DAILY_EXPIRY_SECONDS);
    if (dailyCount !== null && dailyCount > DAILY_GLOBAL_BUDGET) {
      return { allowed: false, reason: "daily_ai_budget_exhausted", remainingCalls: 0 };
    }

    // Check per-IP limit
    const ipKey = `aicost:ip:${ip}`;
    const ipCount = await redisIncr(redisConfig, ipKey, AI_COST_EXPIRY_SECONDS);
    if (ipCount !== null && ipCount > MAX_AI_CALLS_PER_IP) {
      return { allowed: false, reason: "ai_calls_per_ip_exceeded", remainingCalls: 0 };
    }

    const remaining = ipCount !== null ? Math.max(0, MAX_AI_CALLS_PER_IP - ipCount) : 0;
    return { allowed: true, remainingCalls: remaining };
  } catch {
    return checkAiCostLimitInMemory(ip);
  }
}
