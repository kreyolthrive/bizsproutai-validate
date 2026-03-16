/**
 * Bot detection and honeypot hardening.
 *
 * Multi-layer bot scoring:
 * 1. Enhanced honeypot — multiple hidden fields
 * 2. Timing analysis — rejects sub-human submission speeds
 * 3. Request fingerprint scoring — header anomalies typical of bots
 * 4. Repeated prompt spam detection
 */

import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { resolveClientIp } from "./requestIdentity";
import { getRedisConfig, redisIncr } from "./redisClient";

/* ── Honeypot fields ─────────────────────────────────────────────── */

/** All honeypot field names — if ANY are filled, it's a bot. */
export const HONEYPOT_FIELDS = ["website", "company_url", "phone_number", "fax"] as const;

export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  for (const field of HONEYPOT_FIELDS) {
    const value = body[field];
    if (typeof value === "string" && value.trim().length > 0) {
      return true;
    }
  }
  return false;
}

/* ── Timing analysis ─────────────────────────────────────────────── */

/**
 * Minimum time (ms) between page load and form submission.
 * Humans take at least 3 seconds to fill out a form.
 */
const MIN_SUBMISSION_TIME_MS = 3_000;

/**
 * Check if the submission was faster than humanly possible.
 * The client should send a `_loadedAt` timestamp (epoch ms) or a
 * `_formTimingMs` duration field.
 */
export function isSubmissionTooFast(body: Record<string, unknown>): boolean {
  // Check _formTimingMs (client-measured time in ms)
  if (typeof body._formTimingMs === "number" && Number.isFinite(body._formTimingMs)) {
    return body._formTimingMs < MIN_SUBMISSION_TIME_MS;
  }

  // Check _loadedAt (client page-load timestamp)
  if (typeof body._loadedAt === "number" && Number.isFinite(body._loadedAt)) {
    const elapsed = Date.now() - body._loadedAt;
    return elapsed < MIN_SUBMISSION_TIME_MS;
  }

  // No timing data — don't block (not all clients may send it)
  return false;
}

/* ── Request fingerprint scoring ─────────────────────────────────── */

export type BotScore = {
  score: number; // 0–100; higher = more bot-like
  reasons: string[];
};

const BOT_UA_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /wget/i,
  /curl\//i,
  /python-requests/i,
  /httpx/i,
  /node-fetch/i,
  /axios/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /scrapy/i,
];

export function computeBotScore(request: NextRequest, body: Record<string, unknown>): BotScore {
  let score = 0;
  const reasons: string[] = [];

  const ua = request.headers.get("user-agent") ?? "";

  // No user-agent
  if (!ua || ua.length < 10) {
    score += 30;
    reasons.push("missing_or_short_ua");
  }

  // Known bot user-agent patterns
  if (BOT_UA_PATTERNS.some((pattern) => pattern.test(ua))) {
    score += 40;
    reasons.push("bot_ua_pattern");
  }

  // Missing common browser headers
  if (!request.headers.get("accept-language")) {
    score += 10;
    reasons.push("no_accept_language");
  }
  if (!request.headers.get("accept")) {
    score += 5;
    reasons.push("no_accept_header");
  }

  // Honeypot triggered
  if (isHoneypotTriggered(body)) {
    score += 50;
    reasons.push("honeypot_filled");
  }

  // Timing too fast
  if (isSubmissionTooFast(body)) {
    score += 25;
    reasons.push("submission_too_fast");
  }

  // Exact duplicate idea (often spam)
  // This is checked at a higher level via abuse detection

  return { score: Math.min(100, score), reasons };
}

/** Threshold above which we silently reject the request. */
export const BOT_SCORE_THRESHOLD = 50;

/* ── Abuse detection: repeated prompt spam per IP ────────────────── */

const GLOBAL_KEY = "__bizsprAbuseTracker";

type AbuseEntry = {
  ideaHashes: string[];
  lastSeenAt: number;
};

function getAbuseStore(): Map<string, AbuseEntry> {
  const globalRef = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Map<string, AbuseEntry>;
  };
  if (!globalRef[GLOBAL_KEY]) {
    globalRef[GLOBAL_KEY] = new Map<string, AbuseEntry>();
  }
  return globalRef[GLOBAL_KEY]!;
}

function hashIdea(idea: string): string {
  return crypto
    .createHash("sha256")
    .update(idea.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
}

/** Window in ms for tracking duplicate ideas per IP (1 hour). */
const ABUSE_WINDOW_MS = 60 * 60 * 1_000;

/** Max distinct ideas per IP within the window before flagging as spam. */
const MAX_UNIQUE_IDEAS_PER_WINDOW = 15;

/** Max identical idea submissions per IP within the window. */
const MAX_DUPLICATE_IDEAS_PER_WINDOW = 3;

export type AbuseCheckResult = {
  blocked: boolean;
  reason?: string;
};

/**
 * In-memory abuse check (fallback when Redis is unavailable).
 */
function checkPromptAbuseInMemory(ip: string, ideaHash: string): AbuseCheckResult {
  const store = getAbuseStore();
  const now = Date.now();

  // Prune stale entries periodically
  if (store.size > 5_000) {
    for (const [key, entry] of store.entries()) {
      if (now - entry.lastSeenAt > ABUSE_WINDOW_MS) {
        store.delete(key);
      }
    }
  }

  const entry = store.get(ip);
  if (!entry || now - entry.lastSeenAt > ABUSE_WINDOW_MS) {
    store.set(ip, { ideaHashes: [ideaHash], lastSeenAt: now });
    return { blocked: false };
  }

  const duplicateCount = entry.ideaHashes.filter((h) => h === ideaHash).length;
  if (duplicateCount >= MAX_DUPLICATE_IDEAS_PER_WINDOW) {
    return { blocked: true, reason: "duplicate_idea_spam" };
  }

  const uniqueIdeas = new Set(entry.ideaHashes);
  if (uniqueIdeas.size >= MAX_UNIQUE_IDEAS_PER_WINDOW) {
    return { blocked: true, reason: "too_many_ideas" };
  }

  entry.ideaHashes.push(ideaHash);
  entry.lastSeenAt = now;
  return { blocked: false };
}

const ABUSE_EXPIRY_SECONDS = Math.ceil(ABUSE_WINDOW_MS / 1_000);

/**
 * Track and detect repeated prompt spam from the same IP.
 * Uses Redis when available for cross-instance consistency on Vercel.
 */
export async function checkPromptAbuse(ip: string, idea: string): Promise<AbuseCheckResult> {
  const ideaHash = hashIdea(idea);
  const redisConfig = getRedisConfig();

  if (!redisConfig) {
    return checkPromptAbuseInMemory(ip, ideaHash);
  }

  try {
    // Redis key for duplicate detection: per-IP + per-idea-hash counter
    const dupKey = `abuse:dup:${ip}:${ideaHash}`;
    const dupCount = await redisIncr(redisConfig, dupKey, ABUSE_EXPIRY_SECONDS);
    if (dupCount !== null && dupCount > MAX_DUPLICATE_IDEAS_PER_WINDOW) {
      return { blocked: true, reason: "duplicate_idea_spam" };
    }

    // Redis key for total unique ideas: per-IP counter
    const totalKey = `abuse:total:${ip}`;
    const totalCount = await redisIncr(redisConfig, totalKey, ABUSE_EXPIRY_SECONDS);
    if (totalCount !== null && totalCount > MAX_UNIQUE_IDEAS_PER_WINDOW) {
      return { blocked: true, reason: "too_many_ideas" };
    }

    return { blocked: false };
  } catch {
    // Fall back to in-memory on Redis error
    return checkPromptAbuseInMemory(ip, ideaHash);
  }
}

/* ── Convenience: run all bot checks ─────────────────────────────── */

export type BotCheckResult = {
  blocked: boolean;
  code: string;
  reason?: string;
  botScore?: BotScore;
};

export async function runBotChecks(
  request: NextRequest,
  body: Record<string, unknown>,
  idea: string
): Promise<BotCheckResult> {
  // 1. Bot score
  const botScore = computeBotScore(request, body);
  if (botScore.score >= BOT_SCORE_THRESHOLD) {
    return {
      blocked: true,
      code: "invalid_request",
      reason: `bot_score_${botScore.score}`,
      botScore,
    };
  }

  // 2. Prompt abuse
  const ip = resolveClientIp(request);
  const abuse = await checkPromptAbuse(ip, idea);
  if (abuse.blocked) {
    return {
      blocked: true,
      code: "rate_limited",
      reason: abuse.reason,
      botScore,
    };
  }

  return { blocked: false, code: "ok", botScore };
}
