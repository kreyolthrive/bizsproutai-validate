import crypto from "node:crypto";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "bizspr_sprint_session";
const COOKIE_VERSION = "v1";
const SESSION_PREFIX = "spr_";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 365;
const FALLBACK_SECRET_GLOBAL_KEY = "__bizsprSprintSessionFallbackSecret";

type SprintSessionResolution = {
  sessionId: string;
  cookieToSet?: {
    name: string;
    value: string;
    path: string;
    httpOnly: boolean;
    sameSite: "lax";
    secure: boolean;
    maxAge: number;
  };
};

function getFallbackSecret(): string {
  const globalRef = globalThis as typeof globalThis & {
    [FALLBACK_SECRET_GLOBAL_KEY]?: string;
  };
  if (!globalRef[FALLBACK_SECRET_GLOBAL_KEY]) {
    globalRef[FALLBACK_SECRET_GLOBAL_KEY] = crypto.randomBytes(32).toString("hex");
  }
  return globalRef[FALLBACK_SECRET_GLOBAL_KEY]!;
}

function getSigningSecret(): string {
  const candidates = [
    process.env.SPRINT_SESSION_SECRET,
    process.env.AUTH_SESSION_SECRET,
    process.env.NEXTAUTH_SECRET,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ];
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }
  return getFallbackSecret();
}

function signSessionId(sessionId: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(sessionId)
    .digest("base64url");
}

function secureEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function encodeSessionCookieValue(sessionId: string): string {
  const signature = signSessionId(sessionId);
  return `${COOKIE_VERSION}.${sessionId}.${signature}`;
}

function decodeSessionCookieValue(value: string | undefined): string | null {
  if (!value) return null;
  const [version, sessionId, signature] = value.split(".");
  if (version !== COOKIE_VERSION || !sessionId || !signature) return null;
  if (!sessionId.startsWith(SESSION_PREFIX)) return null;
  const expected = signSessionId(sessionId);
  if (!secureEquals(signature, expected)) return null;
  return sessionId;
}

function buildCookie(value: string) {
  return {
    name: COOKIE_NAME,
    value,
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
  };
}

function newSessionId(): string {
  return `${SESSION_PREFIX}${crypto.randomUUID().replace(/-/g, "")}`;
}

export function resolveOrCreateSprintSession(request: NextRequest): SprintSessionResolution {
  const existing = decodeSessionCookieValue(request.cookies.get(COOKIE_NAME)?.value);
  if (existing) {
    return { sessionId: existing };
  }

  const sessionId = newSessionId();
  return {
    sessionId,
    cookieToSet: buildCookie(encodeSessionCookieValue(sessionId)),
  };
}
