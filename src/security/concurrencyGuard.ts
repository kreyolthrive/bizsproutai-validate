/**
 * Concurrency guard for the validation pipeline.
 *
 * - Caps total in-flight validations to prevent overload
 * - Deduplicates identical submissions within a short window
 */

import crypto from "node:crypto";

/* ── In-flight cap ───────────────────────────────────────────────── */

const GLOBAL_KEY = "__bizsprInFlightCounter";

function getCounter(): { count: number } {
  const globalRef = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: { count: number };
  };
  if (!globalRef[GLOBAL_KEY]) {
    globalRef[GLOBAL_KEY] = { count: 0 };
  }
  return globalRef[GLOBAL_KEY]!;
}

/** Max concurrent validation pipelines. */
const MAX_IN_FLIGHT = parseInt(process.env.MAX_CONCURRENT_VALIDATIONS ?? "8", 10);

export function acquireSlot(): boolean {
  const counter = getCounter();
  if (counter.count >= MAX_IN_FLIGHT) {
    return false;
  }
  counter.count += 1;
  return true;
}

export function releaseSlot(): void {
  const counter = getCounter();
  counter.count = Math.max(0, counter.count - 1);
}

export function getInFlightCount(): number {
  return getCounter().count;
}

/* ── Duplicate submission suppression ────────────────────────────── */

const DEDUP_KEY = "__bizsprDedupMap";
const DEDUP_WINDOW_MS = 30_000; // 30 seconds

type DedupEntry = {
  submittedAt: number;
  requestId: string;
};

function getDedupStore(): Map<string, DedupEntry> {
  const globalRef = globalThis as typeof globalThis & {
    [DEDUP_KEY]?: Map<string, DedupEntry>;
  };
  if (!globalRef[DEDUP_KEY]) {
    globalRef[DEDUP_KEY] = new Map<string, DedupEntry>();
  }
  return globalRef[DEDUP_KEY]!;
}

function submissionHash(email: string, idea: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.trim().toLowerCase()}:${idea.trim().toLowerCase()}`)
    .digest("hex")
    .slice(0, 20);
}

export type DedupResult =
  | { duplicate: false }
  | { duplicate: true; existingRequestId: string };

/**
 * Check if this exact (email, idea) pair was submitted in the last 30s.
 * If not, register it.
 */
export function checkDuplicate(email: string, idea: string, requestId: string): DedupResult {
  const store = getDedupStore();
  const now = Date.now();
  const hash = submissionHash(email, idea);

  // Prune old entries
  if (store.size > 2_000) {
    for (const [key, entry] of store.entries()) {
      if (now - entry.submittedAt > DEDUP_WINDOW_MS) {
        store.delete(key);
      }
    }
  }

  const existing = store.get(hash);
  if (existing && now - existing.submittedAt < DEDUP_WINDOW_MS) {
    return { duplicate: true, existingRequestId: existing.requestId };
  }

  store.set(hash, { submittedAt: now, requestId });
  return { duplicate: false };
}
