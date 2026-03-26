import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_TTL_SECONDS,
  getConfiguredAdminToken,
  signAdminSession,
} from "@/src/security/adminSession";
import { buildCorsHeaders } from "@/src/security/cors";
import { logAuditEvent } from "@/src/security/auditLog";
import { resolveClientIp, buildRateLimitIdentity } from "@/src/security/requestIdentity";
import { checkRateLimit } from "@/src/security/rateLimit";

export const runtime = "nodejs";

const RATE_LIMIT_REQUESTS_PER_MINUTE = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const LEGACY_COOKIE_NAMES = ["bizspr_admin_session", "bizspr_admin_token"];

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

function timingSafeTokenMatch(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function setSessionCookie(response: NextResponse, value: string): void {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value,
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  const adminToken = getConfiguredAdminToken();
  if (!adminToken) {
    console.error("Admin session: ADMIN_TOKEN environment variable is not configured.");
    return NextResponse.json({ error: "Service unavailable" }, { status: 503, headers: corsHeaders });
  }

  const rate = await checkRateLimit(
    buildRateLimitIdentity("admin-session", request),
    RATE_LIMIT_REQUESTS_PER_MINUTE,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many admin authentication attempts. Please retry shortly." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": String(rate.retryAfterSeconds),
        },
      }
    );
  }

  const headerToken =
    extractBearerToken(request.headers.get("authorization")) ?? request.headers.get("x-admin-token")?.trim();

  if (!headerToken || !timingSafeTokenMatch(headerToken, adminToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const now = Math.floor(Date.now() / 1000);
  const session = signAdminSession({
    v: 1,
    iat: now,
    exp: now + ADMIN_SESSION_TTL_SECONDS,
    jti: crypto.randomUUID(),
  });

  logAuditEvent({
    event: "admin.session.created",
    ip: resolveClientIp(request),
    sessionId: session.slice(0, 12) + "…",
  });

  const response = NextResponse.json({ ok: true }, { headers: corsHeaders });
  setSessionCookie(response, session);
  return response;
}

export async function DELETE(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  logAuditEvent({
    event: "admin.session.deleted",
    ip: resolveClientIp(request),
  });
  const response = NextResponse.json({ success: true }, { headers: corsHeaders });
  const expiredCookie = {
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  };

  response.cookies.set({ name: ADMIN_SESSION_COOKIE_NAME, ...expiredCookie });
  for (const name of LEGACY_COOKIE_NAMES) {
    response.cookies.set({ name, ...expiredCookie });
  }
  return response;
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
