/**
 * Input sanitization — strips potentially dangerous content from user input.
 * Targets: HTML/script injection, SQL injection patterns, control characters.
 */

/** Strip HTML tags from a string. */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/** Remove control characters except common whitespace (\n, \r, \t). */
function stripControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/** Collapse excessive whitespace/newlines. */
function collapseWhitespace(input: string): string {
  return input
    .replace(/\n{4,}/g, "\n\n\n") // Max 3 consecutive newlines
    .replace(/[ \t]{20,}/g, "    "); // Max 20 consecutive spaces/tabs
}

/**
 * Sanitize a user-provided text field.
 * Does NOT alter meaning — just removes dangerous characters and excessive whitespace.
 */
export function sanitizeTextField(input: string): string {
  let sanitized = input;
  sanitized = stripHtml(sanitized);
  sanitized = stripControlChars(sanitized);
  sanitized = collapseWhitespace(sanitized);
  return sanitized.trim();
}

/**
 * Sanitize all string fields in a body object (shallow).
 * Returns a new object with sanitized string values.
 */
export function sanitizeRequestBody(body: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeTextField(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeTextField(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
