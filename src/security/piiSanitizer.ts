/**
 * PII sanitization for logs and error messages.
 * Ensures emails, IPs, and other PII are redacted before logging.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const IPV4_REGEX = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
const IPV6_REGEX = /([0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}/g;

/**
 * Mask an email address: j***@example.com
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "[email]";
  const masked = local.length > 1 ? `${local[0]}***` : "***";
  return `${masked}@${domain}`;
}

/**
 * Mask an IP address: 192.168.xxx.xxx
 */
export function maskIp(ip: string): string {
  if (ip.includes(":")) {
    // IPv6 — show first two segments
    const parts = ip.split(":");
    return `${parts[0]}:${parts[1]}:***`;
  }
  const parts = ip.split(".");
  return `${parts[0]}.${parts[1]}.xxx.xxx`;
}

const TOKEN_REGEX = /\b[0-9a-fA-F]{32,}\b/g;
const BEARER_REGEX = /Bearer\s+\S+/gi;

/**
 * Redact PII from a string intended for logging.
 */
export function sanitizeForLog(text: string): string {
  return text
    .replace(EMAIL_REGEX, (match) => maskEmail(match))
    .replace(IPV6_REGEX, (match) => maskIp(match))
    .replace(IPV4_REGEX, (match) => maskIp(match));
}

/**
 * Redact emails and token-like strings from error messages before logging.
 */
export function redactSensitiveTokens(text: string): string {
  return text
    .replace(EMAIL_REGEX, "[redacted-email]")
    .replace(BEARER_REGEX, "Bearer [redacted-token]")
    .replace(TOKEN_REGEX, "[redacted-token]");
}

/**
 * Create a safe log object from request details, redacting PII.
 */
export function safeLogContext(params: {
  requestId: string;
  email?: string;
  ip?: string;
  locale?: string;
  ideaPreview?: string;
  [key: string]: unknown;
}): Record<string, unknown> {
  const safe: Record<string, unknown> = {
    requestId: params.requestId,
    locale: params.locale,
  };

  if (params.email) {
    safe.email = maskEmail(params.email);
  }

  if (params.ip) {
    safe.ip = maskIp(params.ip);
  }

  if (params.ideaPreview) {
    // Truncate idea preview and sanitize any embedded PII
    safe.ideaPreview = sanitizeForLog(params.ideaPreview.slice(0, 80));
  }

  return safe;
}
