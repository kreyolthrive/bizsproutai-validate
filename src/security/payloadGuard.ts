/**
 * Payload size guard — rejects oversized request bodies before JSON parsing.
 * Also enforces field-level length limits and structural validation.
 */

import type { NextRequest } from "next/server";

/** Max raw body size in bytes (32 KB — generous for a business idea + context fields). */
export const MAX_PAYLOAD_BYTES = 32_768;

/** Max length for the business idea text field (characters). */
export const MAX_IDEA_LENGTH = 5_000;

/** Max length for any single optional text field (characters). */
export const MAX_FIELD_LENGTH = 2_000;

/** Max email length per RFC 5321. */
export const MAX_EMAIL_LENGTH = 254;

/** Max number of channels array entries. */
export const MAX_CHANNELS_COUNT = 20;

/** Max length per channel entry. */
export const MAX_CHANNEL_LENGTH = 100;

export type PayloadGuardResult =
  | { ok: true; body: unknown }
  | { ok: false; code: string; message: string; status: number };

/**
 * Read and validate request body size before JSON parsing.
 */
export async function guardPayloadSize(
  request: NextRequest
): Promise<PayloadGuardResult> {
  // Check Content-Length header first (fast reject)
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredSize = parseInt(contentLength, 10);
    if (Number.isFinite(declaredSize) && declaredSize > MAX_PAYLOAD_BYTES) {
      return {
        ok: false,
        code: "payload_too_large",
        message: `Request body exceeds maximum allowed size of ${MAX_PAYLOAD_BYTES} bytes.`,
        status: 413,
      };
    }
  }

  // Read body as text to check actual size
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return {
      ok: false,
      code: "invalid_body",
      message: "Failed to read request body.",
      status: 400,
    };
  }

  if (rawBody.length > MAX_PAYLOAD_BYTES) {
    return {
      ok: false,
      code: "payload_too_large",
      message: `Request body exceeds maximum allowed size of ${MAX_PAYLOAD_BYTES} bytes.`,
      status: 413,
    };
  }

  // Parse JSON
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return {
      ok: false,
      code: "invalid_json",
      message: "Request body must be valid JSON.",
      status: 400,
    };
  }

  return { ok: true, body };
}

export type FieldValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

/**
 * Validate parsed field lengths to prevent abuse via oversized strings.
 */
export function validateFieldLengths(body: Record<string, unknown>): FieldValidationResult {
  // Check idea length
  const idea = body.idea ?? body.businessIdea ?? body.description;
  if (typeof idea === "string" && idea.length > MAX_IDEA_LENGTH) {
    return {
      ok: false,
      code: "idea_too_long",
      message: `Business idea exceeds maximum length of ${MAX_IDEA_LENGTH} characters.`,
    };
  }

  // Check email length
  if (typeof body.email === "string" && body.email.length > MAX_EMAIL_LENGTH) {
    return {
      ok: false,
      code: "invalid_email",
      message: "Email address is too long.",
    };
  }

  // Check optional text fields
  const textFields = [
    "targetCustomer",
    "targetMarket",
    "location",
    "offer",
    "problem",
    "pricingIdea",
    "skillSummary",
  ] as const;

  for (const field of textFields) {
    const value = body[field];
    if (typeof value === "string" && value.length > MAX_FIELD_LENGTH) {
      return {
        ok: false,
        code: "field_too_long",
        message: `Field "${field}" exceeds maximum length of ${MAX_FIELD_LENGTH} characters.`,
      };
    }
  }

  // Check channels array
  if (Array.isArray(body.channels)) {
    if (body.channels.length > MAX_CHANNELS_COUNT) {
      return {
        ok: false,
        code: "too_many_channels",
        message: `Channels array exceeds maximum of ${MAX_CHANNELS_COUNT} entries.`,
      };
    }
    for (const ch of body.channels) {
      if (typeof ch === "string" && ch.length > MAX_CHANNEL_LENGTH) {
        return {
          ok: false,
          code: "channel_too_long",
          message: `Channel entry exceeds maximum length of ${MAX_CHANNEL_LENGTH} characters.`,
        };
      }
    }
  }

  return { ok: true };
}
