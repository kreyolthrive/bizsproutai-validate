import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { computeValidationResult, type ValidationResult } from "@/lib/validation/engine";
import { sendFreeValidationResultEmail } from "@/lib/email/freeValidationEmail";
import { sendOwnerNotification } from "@/lib/email/resendNotification";
import { logger } from "@/lib/validation/logger";
import { getCachedResult, cacheResult } from "@/lib/validation/dedup";
import { checkRateLimit } from "@/src/security/rateLimit";
import { resolveClientIp } from "@/src/security/requestIdentity";
import { guardPayloadSize } from "@/src/security/payloadGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_LOCALES = new Set(["en", "fr", "ht", "es", "pt"]);
const MAX_IDEA_CHARS = 2_000;
const MAX_AUDIENCE_CHARS = 500;
const MAX_NAME_CHARS = 80;

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationStatus {
  ownerNotified: boolean;
  resultEmailSent: boolean;
  ownerError: string | null;
  emailError: string | null;
}

interface FreeValidateResponse {
  ok: boolean;
  requestId: string;
  result?: ValidationResult;
  leadSaved: boolean;
  notificationStatus: NotificationStatus | null;
  error?: string;
  code?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  if (/[\r\n\t]/.test(email)) return false; // header injection guard
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  error: string
): NextResponse<FreeValidateResponse> {
  return NextResponse.json(
    { ok: false, requestId, leadSaved: false, notificationStatus: null, code, error },
    { status, headers: { "X-Request-Id": requestId } }
  );
}

// ─── Supabase: partial lead ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertByEmail(
  supabase: any,
  fields: Record<string, unknown>
): Promise<{ id: string } | null> {
  const email = fields.email as string;
  const sb = supabase as any; // bypass generated-types mismatch (no schema file in repo)

  const { data: updated } = await sb
    .from("validation_leads")
    .update(fields)
    .eq("email", email)
    .select("id")
    .maybeSingle();
  if (updated) return updated as { id: string };

  const { data: inserted, error } = await sb
    .from("validation_leads")
    .insert(fields)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return inserted as { id: string };
}

async function savePartialLead(
  email: string,
  firstName: string,
  locale: string,
  timestamp: string,
  requestId: string
): Promise<{ leadId: string | null; saved: boolean }> {
  const supabase = getSupabase();
  if (!supabase) {
    logger.warn({ event: "db_skip", requestId, ts: timestamp, email, reason: "Supabase not configured" });
    return { leadId: null, saved: false };
  }

  try {
    const data = await upsertByEmail(supabase, {
      email,
      name: firstName || null,
      language: locale,
      source: "free-validation-partial",
      consent_marketing: false,
      email_sent: false,
      metadata: { completed: false, requestId, submittedAt: timestamp },
      updated_at: timestamp,
    });
    logger.info({ event: "db_save_ok", requestId, ts: timestamp, email, leadId: data?.id, partial: true });
    return { leadId: data?.id ?? null, saved: true };
  } catch (err) {
    logger.error({ event: "db_save_fail", requestId, ts: timestamp, email, error: String(err), partial: true });
    return { leadId: null, saved: false };
  }
}

// ─── Supabase: full lead ──────────────────────────────────────────────────────

async function saveFullLead(
  email: string,
  firstName: string,
  locale: string,
  stageIndex: number,
  idea: string,
  audience: string,
  hasLiveAsset: boolean,
  hasTraction: boolean,
  result: ValidationResult,
  timestamp: string,
  requestId: string
): Promise<{ leadId: string | null; saved: boolean }> {
  const supabase = getSupabase();
  if (!supabase) {
    logger.warn({ event: "db_skip", requestId, ts: timestamp, email, reason: "Supabase not configured" });
    return { leadId: null, saved: false };
  }

  try {
    const data = await upsertByEmail(supabase, {
      email,
      name: firstName || null,
      business_idea: idea || null,
      language: locale,
      source: "free-validation",
      consent_marketing: false,
      email_sent: false,
      metadata: {
        stageIndex,
        audience: audience || null,
        hasLiveAsset,
        hasTraction,
        completed: true,
        requestId,
        submittedAt: timestamp,
        result: {
          stage: result.stage,
          verdict: result.verdict,
          firstAsset: result.firstAsset,
          firstAssetReason: result.firstAssetReason,
          nextSteps: result.nextSteps,
          warning: result.warning,
        },
      },
      updated_at: timestamp,
    });
    logger.info({ event: "db_save_ok", requestId, ts: timestamp, email, leadId: data?.id, stage: result.stage });
    return { leadId: data?.id ?? null, saved: true };
  } catch (err) {
    logger.error({ event: "db_save_fail", requestId, ts: timestamp, email, error: String(err) });
    return { leadId: null, saved: false };
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const ts = new Date().toISOString();
  const startMs = Date.now();

  // 1. Payload size guard
  const sizeCheck = await guardPayloadSize(req);
  if (!sizeCheck.ok) {
    return NextResponse.json(
      { ok: false, requestId, leadSaved: false, notificationStatus: null, code: sizeCheck.code, error: sizeCheck.message },
      { status: sizeCheck.status, headers: { "X-Request-Id": requestId } }
    );
  }

  // 2. Rate limit by IP
  const ip = resolveClientIp(req);
  const rlKey = `free-validate:${ip}`;
  const rl = await checkRateLimit(rlKey, 10, 60_000); // 10 per minute per IP
  if (!rl.allowed) {
    logger.warn({ event: "rate_limited", requestId, ts, ip, retryAfterSeconds: rl.retryAfterSeconds });
    return NextResponse.json(
      { ok: false, requestId, leadSaved: false, notificationStatus: null, code: "rate_limited", error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "X-Request-Id": requestId, "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  // 3. Body is already parsed by guardPayloadSize
  const body = sizeCheck.body as Record<string, unknown>;

  // 4. Validate email
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return errorResponse(requestId, 400, "missing_email", "Email address is required.");
  }
  if (!isValidEmail(email)) {
    return errorResponse(requestId, 400, "invalid_email", "A valid email address is required.");
  }

  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim().slice(0, MAX_NAME_CHARS) : "";
  const locale =
    typeof body.locale === "string" && VALID_LOCALES.has(body.locale) ? body.locale : "en";

  // 5. Determine if this is a full validation or partial lead capture.
  //    A request signals full-validation intent if stageIndex OR idea is present.
  //    Partial = neither present (email-only step 0 capture).
  const rawStage = body.stageIndex;
  const rawIdea = body.idea;
  const rawHasLiveAsset = body.hasLiveAsset;
  const rawHasTraction = body.hasTraction;

  const intendsFull =
    rawStage !== undefined || rawIdea !== undefined ||
    rawHasLiveAsset !== undefined || rawHasTraction !== undefined;

  const isFullValidation =
    intendsFull &&
    typeof rawStage === "number" &&
    Number.isInteger(rawStage) &&
    (rawStage as number) >= 0 &&
    (rawStage as number) <= 3 &&
    typeof rawIdea === "string" &&
    (rawIdea as string).trim().length >= 10 &&
    typeof rawHasLiveAsset === "boolean" &&
    typeof rawHasTraction === "boolean";

  // ── Explicit validation errors for malformed full-validation requests ────

  if (intendsFull && !isFullValidation) {
    if (rawStage !== undefined && (typeof rawStage !== "number" || !Number.isInteger(rawStage) || rawStage < 0 || rawStage > 3)) {
      return errorResponse(requestId, 400, "invalid_stage", "stageIndex must be an integer between 0 and 3.");
    }
    if (rawIdea !== undefined && (typeof rawIdea !== "string" || rawIdea.trim().length < 10)) {
      return errorResponse(requestId, 400, "idea_too_short", "Idea must be at least 10 characters.");
    }
    if ((rawHasLiveAsset !== undefined && typeof rawHasLiveAsset !== "boolean") ||
        (rawHasTraction !== undefined && typeof rawHasTraction !== "boolean")) {
      return errorResponse(requestId, 400, "invalid_field", "hasLiveAsset and hasTraction must be boolean values.");
    }
  }

  // ── Partial lead: email capture only ──────────────────────────────────────

  if (!isFullValidation) {
    logger.info({ event: "partial_lead", requestId, ts, email, locale });

    const { saved } = await savePartialLead(email, firstName, locale, ts, requestId);

    // Fire-and-forget owner notification — does not block response
    sendOwnerNotification({ email, firstName, completed: false, timestamp: ts })
      .then((r) => {
        if (!r.sent) logger.warn({ event: "owner_notify_fail", requestId, ts, email, error: r.error ?? undefined });
        else logger.info({ event: "owner_notify_ok", requestId, ts, email, partial: true });
      })
      .catch((err) => logger.error({ event: "owner_notify_error", requestId, ts, email, error: String(err) }));

    return NextResponse.json(
      { ok: true, requestId, leadSaved: saved, notificationStatus: null, partial: true },
      { headers: { "X-Request-Id": requestId } }
    );
  }

  // ── Full validation ────────────────────────────────────────────────────────

  // 6. Extract validated full-validation fields
  const stageIndex = rawStage as number;
  const idea = (rawIdea as string).trim().slice(0, MAX_IDEA_CHARS);

  const rawAudience = body.audience;
  const audience =
    typeof rawAudience === "string" ? rawAudience.trim().slice(0, MAX_AUDIENCE_CHARS) : "";

  const hasLiveAsset = rawHasLiveAsset as boolean;
  const hasTraction = rawHasTraction as boolean;

  // 7. Idempotency: check for cached result from duplicate submit
  const clientRequestId =
    typeof body.requestId === "string" && body.requestId.length === 36
      ? body.requestId
      : null;

  if (clientRequestId) {
    const cached = getCachedResult(clientRequestId);
    if (cached) {
      logger.info({ event: "dedup_hit", requestId, ts, email, clientRequestId });
      return NextResponse.json(
        { ok: true, requestId, result: cached, leadSaved: true, notificationStatus: null, deduplicated: true },
        { headers: { "X-Request-Id": requestId } }
      );
    }
  }

  logger.info({ event: "validation_started", requestId, ts, email, locale, stageIndex });

  // 8. Compute result server-side
  const result = computeValidationResult(stageIndex, idea, audience, hasLiveAsset, hasTraction);
  logger.info({ event: "validation_completed", requestId, ts, email, stage: result.stage, verdict: result.verdict, firstAsset: result.firstAsset, durationMs: Date.now() - startMs });

  // 9. Persist to DB — must succeed before notifications
  const { saved: leadSaved } = await saveFullLead(
    email, firstName, locale, stageIndex, idea, audience,
    hasLiveAsset, hasTraction, result, ts, requestId
  );

  // 10. Cache for dedup (regardless of DB outcome — result is correct)
  if (clientRequestId) cacheResult(clientRequestId, result);

  // 11. Fire notifications in parallel
  const notificationStatus: NotificationStatus = {
    ownerNotified: false,
    resultEmailSent: false,
    ownerError: null,
    emailError: null,
  };

  const [ownerRes, emailRes] = await Promise.allSettled([
    sendOwnerNotification({
      email, firstName,
      stage: result.stage,
      verdict: result.verdict,
      firstAsset: result.firstAsset,
      idea: idea || undefined,
      audience: audience || undefined,
      completed: true,
      timestamp: ts,
    }),
    sendFreeValidationResultEmail(email, firstName, locale, {
      stage: result.stage,
      verdict: result.verdict,
      firstAsset: result.firstAsset,
      firstAssetReason: result.firstAssetReason,
      nextSteps: result.nextSteps,
      warning: result.warning,
    }),
  ]);

  if (ownerRes.status === "fulfilled" && ownerRes.value.sent) {
    notificationStatus.ownerNotified = true;
    logger.info({ event: "owner_notify_ok", requestId, ts, email });
  } else {
    const err = ownerRes.status === "rejected" ? String(ownerRes.reason) : (ownerRes.value.error ?? "unknown");
    notificationStatus.ownerError = err;
    logger.error({ event: "owner_notify_fail", requestId, ts, email, error: err });
  }

  if (emailRes.status === "fulfilled" && emailRes.value.sent) {
    notificationStatus.resultEmailSent = true;
    logger.info({ event: "result_email_ok", requestId, ts, email });
    const supabase = getSupabase();
    if (supabase) {
      await (supabase as any)
        .from("validation_leads")
        .update({ email_sent: true })
        .eq("email", email);
    }
  } else {
    const err = emailRes.status === "rejected" ? String(emailRes.reason) : (emailRes.value.error ?? "unknown");
    notificationStatus.emailError = err;
    logger.error({ event: "result_email_fail", requestId, ts, email, error: err });
  }

  logger.info({
    event: "request_complete",
    requestId,
    ts,
    email,
    stage: result.stage,
    leadSaved,
    ownerNotified: notificationStatus.ownerNotified,
    emailSent: notificationStatus.resultEmailSent,
    durationMs: Date.now() - startMs,
  });

  return NextResponse.json(
    { ok: true, requestId, result, leadSaved, notificationStatus },
    { headers: { "X-Request-Id": requestId } }
  );
}
