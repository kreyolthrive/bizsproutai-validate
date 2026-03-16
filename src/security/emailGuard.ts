/**
 * Email abuse prevention:
 * - Disposable email domain blocking
 * - Per-email send rate limiting (Redis-backed when available)
 * - Domain validation
 */

import { getRedisConfig, redisIncr } from "./redisClient";

/** Common disposable / temporary email domains. */
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.de",
  "grr.la",
  "sharklasers.com",
  "guerrillamailblock.com",
  "mailinator.com",
  "mailinator2.com",
  "maildrop.cc",
  "dispostable.com",
  "yopmail.com",
  "yopmail.fr",
  "tempmail.com",
  "temp-mail.org",
  "throwaway.email",
  "throwaway.email",
  "getnada.com",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "mailnesia.com",
  "tempinbox.com",
  "fakeinbox.com",
  "mailcatch.com",
  "mintemail.com",
  "mohmal.com",
  "harakirimail.com",
  "discard.email",
  "33mail.com",
  "mytemp.email",
  "tempr.email",
  "burnermail.io",
  "spamgourmet.com",
  "mailhazard.com",
  "jetable.org",
  "mailexpire.com",
  "mailmoat.com",
  "tempail.com",
  "tempomail.fr",
  "mailsac.com",
  "maildrop.cc",
  "emailondeck.com",
  "tempmailo.com",
  "getairmail.com",
  "crazymailing.com",
  "tmail.ws",
  "mailforspam.com",
  "safetymail.info",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

/* ── Per-email send rate limiting ────────────────────────────────── */

const GLOBAL_KEY = "__bizsprEmailSendTracker";

type EmailSendEntry = {
  count: number;
  firstSentAt: number;
};

function getEmailStore(): Map<string, EmailSendEntry> {
  const globalRef = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: Map<string, EmailSendEntry>;
  };
  if (!globalRef[GLOBAL_KEY]) {
    globalRef[GLOBAL_KEY] = new Map<string, EmailSendEntry>();
  }
  return globalRef[GLOBAL_KEY]!;
}

/** Max emails per address within the window (1 hour). */
const MAX_EMAILS_PER_ADDRESS = 3;
const EMAIL_WINDOW_MS = 60 * 60 * 1_000;

export type EmailGuardResult = {
  allowed: boolean;
  reason?: string;
};

/**
 * In-memory fallback for email send limiting.
 */
function checkEmailSendLimitInMemory(normalizedEmail: string): EmailGuardResult {
  const store = getEmailStore();
  const now = Date.now();

  if (store.size > 10_000) {
    for (const [key, entry] of store.entries()) {
      if (now - entry.firstSentAt > EMAIL_WINDOW_MS) {
        store.delete(key);
      }
    }
  }

  const entry = store.get(normalizedEmail);

  if (!entry || now - entry.firstSentAt > EMAIL_WINDOW_MS) {
    store.set(normalizedEmail, { count: 1, firstSentAt: now });
    return { allowed: true };
  }

  if (entry.count >= MAX_EMAILS_PER_ADDRESS) {
    return { allowed: false, reason: "email_send_limit_exceeded" };
  }

  entry.count += 1;
  return { allowed: true };
}

const EMAIL_EXPIRY_SECONDS = Math.ceil(EMAIL_WINDOW_MS / 1_000);

/**
 * Check if we should allow sending to this email address.
 * Uses Redis when available for cross-instance consistency.
 */
export async function checkEmailSendLimit(email: string): Promise<EmailGuardResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const redisConfig = getRedisConfig();

  if (!redisConfig) {
    return checkEmailSendLimitInMemory(normalizedEmail);
  }

  try {
    const key = `emailsend:${normalizedEmail}`;
    const count = await redisIncr(redisConfig, key, EMAIL_EXPIRY_SECONDS);
    if (count !== null && count > MAX_EMAILS_PER_ADDRESS) {
      return { allowed: false, reason: "email_send_limit_exceeded" };
    }
    return { allowed: true };
  } catch {
    return checkEmailSendLimitInMemory(normalizedEmail);
  }
}

/**
 * Stricter email validation beyond basic regex.
 */
export function isStrictlyValidEmail(email: string): { valid: boolean; reason?: string } {
  // Basic format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, reason: "invalid_format" };
  }

  // Length check per RFC 5321
  if (email.length > 254) {
    return { valid: false, reason: "too_long" };
  }

  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return { valid: false, reason: "invalid_format" };
  }

  // Local part max 64 chars
  if (localPart.length > 64) {
    return { valid: false, reason: "local_part_too_long" };
  }

  // Domain must have at least one dot and valid TLD
  const domainParts = domain.split(".");
  if (domainParts.length < 2) {
    return { valid: false, reason: "invalid_domain" };
  }

  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || tld.length > 63) {
    return { valid: false, reason: "invalid_tld" };
  }

  // No consecutive dots
  if (domain.includes("..")) {
    return { valid: false, reason: "invalid_domain" };
  }

  // Disposable email check
  if (isDisposableEmail(email)) {
    return { valid: false, reason: "disposable_email" };
  }

  return { valid: true };
}
