import type { ValidationResult } from "./engine";

const DEDUP_KEY = "__bizsprFreeValidateDedupMap";
const TTL_MS = 60_000;

interface DedupEntry {
  result: ValidationResult;
  expiresAt: number;
}

function getStore(): Map<string, DedupEntry> {
  const g = globalThis as Record<string, unknown>;
  if (!g[DEDUP_KEY]) g[DEDUP_KEY] = new Map<string, DedupEntry>();
  return g[DEDUP_KEY] as Map<string, DedupEntry>;
}

export function getCachedResult(requestId: string): ValidationResult | null {
  const store = getStore();
  const entry = store.get(requestId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(requestId);
    return null;
  }
  return entry.result;
}

export function cacheResult(requestId: string, result: ValidationResult): void {
  const store = getStore();
  store.set(requestId, { result, expiresAt: Date.now() + TTL_MS });
  if (store.size > 1_000) {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt <= now) store.delete(key);
    }
  }
}

export function clearDedupStore(): void {
  const g = globalThis as Record<string, unknown>;
  delete g[DEDUP_KEY];
}
