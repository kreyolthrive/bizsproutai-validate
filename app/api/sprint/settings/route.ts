import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SPRINT_SETTINGS } from "@/src/sprint/config";
import { getSprintSettingsFromDb, saveSprintSettingsToDb } from "@/src/sprint/server/settingsDb";
import { resolveOrCreateSprintSession } from "@/src/security/sprintSession";
import { buildCorsHeaders } from "@/src/security/cors";
import { buildRateLimitIdentity } from "@/src/security/requestIdentity";
import { checkRateLimit } from "@/src/security/rateLimit";
import { sanitizeRequestBody } from "@/src/security/inputSanitizer";

export const runtime = "nodejs";

const MAX_PROJECT_KEY_LENGTH = 180;
const MAX_REQUEST_BYTES = 32_000;
const RATE_LIMIT_REQUESTS_PER_MINUTE = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

function normalizeParam(value: string | null): string {
  return (value || "").trim();
}

function isPayloadTooLarge(request: NextRequest, maxBytes: number): boolean {
  const contentLength = Number(request.headers.get("content-length") ?? "");
  return Number.isFinite(contentLength) && contentLength > maxBytes;
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      "Cache-Control": "no-store",
      Allow: "GET, POST, OPTIONS",
    },
  });
}

export async function GET(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));

  const rate = await checkRateLimit(
    buildRateLimitIdentity("sprint-settings", request),
    RATE_LIMIT_REQUESTS_PER_MINUTE,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please retry shortly." },
      { status: 429, headers: { ...corsHeaders, "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  try {
    const projectKey = normalizeParam(request.nextUrl.searchParams.get("projectKey"));
    const session = resolveOrCreateSprintSession(request);

    if (!projectKey) {
      return NextResponse.json(
        { error: "Missing required query param: projectKey" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (projectKey.length > MAX_PROJECT_KEY_LENGTH) {
      return NextResponse.json(
        { error: `projectKey must be ${MAX_PROJECT_KEY_LENGTH} characters or fewer` },
        { status: 400, headers: corsHeaders }
      );
    }

    const settings = await getSprintSettingsFromDb(session.sessionId, projectKey);
    const response = NextResponse.json({ success: true, settings }, { headers: corsHeaders });
    if (session.cookieToSet) {
      response.cookies.set(session.cookieToSet);
    }
    return response;
  } catch (error) {
    console.error("Sprint settings read error:", error);
    return NextResponse.json(
      { error: "Failed to load sprint settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));

  if (isPayloadTooLarge(request, MAX_REQUEST_BYTES)) {
    return NextResponse.json(
      { error: `Request payload too large (max ${MAX_REQUEST_BYTES} bytes).` },
      { status: 413, headers: corsHeaders }
    );
  }

  const rate = await checkRateLimit(
    buildRateLimitIdentity("sprint-settings", request),
    RATE_LIMIT_REQUESTS_PER_MINUTE,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please retry shortly." },
      { status: 429, headers: { ...corsHeaders, "Retry-After": String(rate.retryAfterSeconds) } }
    );
  }

  try {
    const rawBody = await request.json();
    const body =
      typeof rawBody === "object" && rawBody !== null && !Array.isArray(rawBody)
        ? sanitizeRequestBody(rawBody as Record<string, unknown>)
        : rawBody;

    const projectKey = normalizeParam(body?.projectKey ?? null);
    const session = resolveOrCreateSprintSession(request);

    if (!projectKey) {
      return NextResponse.json(
        { error: "Missing required field: projectKey" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (projectKey.length > MAX_PROJECT_KEY_LENGTH) {
      return NextResponse.json(
        { error: `projectKey must be ${MAX_PROJECT_KEY_LENGTH} characters or fewer` },
        { status: 400, headers: corsHeaders }
      );
    }

    const settingsPatch = typeof body?.settings === "object" && body.settings !== null
      ? body.settings
      : DEFAULT_SPRINT_SETTINGS;

    const settings = await saveSprintSettingsToDb(session.sessionId, projectKey, settingsPatch);
    const response = NextResponse.json({ success: true, settings }, { headers: corsHeaders });
    if (session.cookieToSet) {
      response.cookies.set(session.cookieToSet);
    }
    return response;
  } catch (error) {
    console.error("Sprint settings write error:", error);
    return NextResponse.json(
      { error: "Failed to save sprint settings" },
      { status: 500, headers: corsHeaders }
    );
  }
}
