import { NextRequest, NextResponse } from "next/server";
import { sendSmtpTestEmail } from "@/lib/email/ionos";
import { buildCorsHeaders } from "@/src/security/cors";
import { buildRateLimitIdentity } from "@/src/security/requestIdentity";
import { checkRateLimit } from "@/src/security/rateLimit";

export const runtime = "nodejs";

const RATE_LIMIT_REQUESTS_PER_MINUTE = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUEST_BYTES = 8_000;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolveDefaultRecipient(): string {
  return (
    process.env.IONOS_OWNER_EMAIL ??
    process.env.LEADS_TO_EMAIL ??
    process.env.IONOS_SMTP_USER ??
    process.env.SMTP_USER ??
    ""
  )
    .trim()
    .toLowerCase();
}

function isEmailTestEnabled(): boolean {
  // Explicitly disabled in production unless opted in
  if (process.env.NODE_ENV === "production") {
    return process.env.EMAIL_TEST_ENABLED === "true";
  }
  return true;
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  const contentLength = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: `Request payload too large (max ${MAX_REQUEST_BYTES} bytes).` },
      { status: 413, headers: corsHeaders }
    );
  }

  if (!isEmailTestEnabled()) {
    return NextResponse.json(
      { error: "Email test endpoint is disabled." },
      { status: 403, headers: corsHeaders }
    );
  }

  const rate = await checkRateLimit(
    buildRateLimitIdentity("email-test", request),
    RATE_LIMIT_REQUESTS_PER_MINUTE,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many email-test requests. Please retry shortly." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": String(rate.retryAfterSeconds),
        },
      }
    );
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const requestedTo =
    typeof (body as { to?: unknown }).to === "string"
      ? (body as { to: string }).to.trim().toLowerCase()
      : "";
  const to = requestedTo || resolveDefaultRecipient();

  if (!to || !isValidEmail(to)) {
    return NextResponse.json(
      { error: "Missing or invalid recipient email.", to },
      { status: 400, headers: corsHeaders }
    );
  }

  const result = await sendSmtpTestEmail(to);
  const status = result.sent ? 200 : result.enabled ? 502 : 503;

  return NextResponse.json(result, { status, headers: corsHeaders });
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
