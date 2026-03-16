/**
 * Circuit breaker for AI provider calls.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests are rejected immediately
 * - HALF_OPEN: Testing if provider has recovered
 *
 * Also provides timeout budgets and retry with exponential backoff.
 */

export type CircuitState = "closed" | "open" | "half_open";

type CircuitEntry = {
  state: CircuitState;
  failureCount: number;
  lastFailureAt: number;
  lastSuccessAt: number;
  halfOpenAttempts: number;
};

const GLOBAL_KEY = "__bizsprCircuitBreakers";

function getCircuitStore(): Map<string, CircuitEntry> {
  const globalRef = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Map<string, CircuitEntry>;
  };
  if (!globalRef[GLOBAL_KEY]) {
    globalRef[GLOBAL_KEY] = new Map<string, CircuitEntry>();
  }
  return globalRef[GLOBAL_KEY]!;
}

/** Number of consecutive failures before opening the circuit. */
const FAILURE_THRESHOLD = 5;

/** How long to keep the circuit open before half-opening (ms). */
const OPEN_DURATION_MS = 60_000; // 1 minute

/** Max half-open probe attempts before re-opening. */
const MAX_HALF_OPEN_ATTEMPTS = 2;

function getEntry(provider: string): CircuitEntry {
  const store = getCircuitStore();
  let entry = store.get(provider);
  if (!entry) {
    entry = {
      state: "closed",
      failureCount: 0,
      lastFailureAt: 0,
      lastSuccessAt: 0,
      halfOpenAttempts: 0,
    };
    store.set(provider, entry);
  }
  return entry;
}

/**
 * Check if a request to this provider should be allowed.
 */
export function canCallProvider(provider: string): boolean {
  const entry = getEntry(provider);
  const now = Date.now();

  switch (entry.state) {
    case "closed":
      return true;

    case "open": {
      // Check if enough time has passed to try half-open
      if (now - entry.lastFailureAt > OPEN_DURATION_MS) {
        entry.state = "half_open";
        entry.halfOpenAttempts = 0;
        return true;
      }
      return false;
    }

    case "half_open": {
      // Allow limited probes
      if (entry.halfOpenAttempts < MAX_HALF_OPEN_ATTEMPTS) {
        entry.halfOpenAttempts += 1;
        return true;
      }
      return false;
    }
  }
}

/**
 * Record a successful call — closes the circuit.
 */
export function recordSuccess(provider: string): void {
  const entry = getEntry(provider);
  entry.state = "closed";
  entry.failureCount = 0;
  entry.halfOpenAttempts = 0;
  entry.lastSuccessAt = Date.now();
}

/**
 * Record a failed call — may open the circuit.
 */
export function recordFailure(provider: string): void {
  const entry = getEntry(provider);
  const now = Date.now();
  entry.failureCount += 1;
  entry.lastFailureAt = now;

  if (entry.state === "half_open") {
    // Half-open probe failed — re-open
    entry.state = "open";
    return;
  }

  if (entry.failureCount >= FAILURE_THRESHOLD) {
    entry.state = "open";
  }
}

/**
 * Get the current state of a provider's circuit.
 */
export function getCircuitState(provider: string): CircuitState {
  return getEntry(provider).state;
}

/* ── Timeout budget ──────────────────────────────────────────────── */

/** Default timeout for AI provider calls (ms). */
export const DEFAULT_AI_TIMEOUT_MS = 30_000;

/** Max total time budget for the entire validation pipeline (ms). */
export const PIPELINE_TIMEOUT_MS = 60_000;

/**
 * Create an AbortSignal that fires after the given timeout.
 */
export function createTimeoutSignal(timeoutMs: number = DEFAULT_AI_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

/* ── Retry with exponential backoff ──────────────────────────────── */

export type RetryOptions = {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  shouldRetry?: (error: unknown) => boolean;
};

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2,
  baseDelayMs: 500,
  maxDelayMs: 5_000,
  timeoutMs: DEFAULT_AI_TIMEOUT_MS,
  shouldRetry: (error: unknown) => {
    // Retry on transient errors, not on auth/validation errors
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("401") || msg.includes("403") || msg.includes("invalid_api_key")) {
        return false;
      }
      if (msg.includes("timeout") || msg.includes("econnreset") || msg.includes("429") || msg.includes("500") || msg.includes("502") || msg.includes("503")) {
        return true;
      }
    }
    return false;
  },
};

/**
 * Execute a function with retry and exponential backoff.
 */
export async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  provider: string,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };

  if (!canCallProvider(provider)) {
    throw new Error(`Circuit breaker open for provider: ${provider}`);
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const signal = createTimeoutSignal(opts.timeoutMs);
      const result = await fn(signal);
      recordSuccess(provider);
      return result;
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxRetries || !opts.shouldRetry(error)) {
        recordFailure(provider);
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        opts.maxDelayMs,
        opts.baseDelayMs * Math.pow(2, attempt) + Math.random() * 200
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  recordFailure(provider);
  throw lastError;
}
