import { NextRequest, NextResponse } from "next/server";
import { logAuditEvent } from "@/src/security/auditLog";
import { buildCorsHeaders } from "@/src/security/cors";
import { resolveClientIp, buildRateLimitIdentity } from "@/src/security/requestIdentity";
import { checkRateLimit } from "@/src/security/rateLimit";
import {
  getSupabaseAdminClient,
  hasSupabaseAdminConfig,
} from "@/src/server/supabaseAdmin";

export const runtime = "nodejs";

const RATE_LIMIT_REQUESTS_PER_MINUTE = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_BODY_BYTES = 2_000;

function isValidEmail(email: string): boolean {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && trimmed.length <= 254;
}

/**
 * DELETE /api/user-data
 *
 * GDPR / right-to-erasure endpoint.
 * Accepts { "email": "user@example.com" } and deletes all records
 * associated with that email from validation_leads and
 * business_validation_runs tables.
 */
export async function DELETE(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));

  const contentLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request payload too large." },
      { status: 413, headers: corsHeaders }
    );
  }

  const rate = await checkRateLimit(
    buildRateLimitIdentity("user-data-delete", request),
    RATE_LIMIT_REQUESTS_PER_MINUTE,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please retry shortly." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": String(rate.retryAfterSeconds),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: corsHeaders }
    );
  }

  const email =
    typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Data storage is not configured." },
      { status: 503, headers: corsHeaders }
    );
  }

  const supabase = getSupabaseAdminClient();

  try {
    const { error: leadsError, count: leadsCount } = await supabase
      .from("validation_leads")
      .delete({ count: "exact" })
      .ilike("email", email);

    if (leadsError) {
      console.error("GDPR delete validation_leads error:", leadsError.message);
    }

    const { error: runsError, count: runsCount } = await supabase
      .from("business_validation_runs")
      .delete({ count: "exact" })
      .ilike("email", email);

    if (runsError) {
      console.error(
        "GDPR delete business_validation_runs error:",
        runsError.message
      );
    }

    if (leadsError && runsError) {
      return NextResponse.json(
        { error: "Failed to process deletion request." },
        { status: 500, headers: corsHeaders }
      );
    }

    logAuditEvent({
      event: "gdpr.data.deleted",
      ip: resolveClientIp(request),
      email,
      detail: `leads=${leadsCount ?? 0} runs=${runsCount ?? 0}`,
    });

    return NextResponse.json(
      {
        deleted: true,
        records: {
          validation_leads: leadsCount ?? 0,
          business_validation_runs: runsCount ?? 0,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("GDPR deletion unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
