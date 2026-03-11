import crypto from "node:crypto";
import type { NextRequest } from "next/server";

type AdminAccessInput = {
  authorizationHeader?: string | null;
  adminTokenHeader?: string | null;
  queryToken?: string | null;
};

export type AdminAccessResult = {
  ok: boolean;
  status: number;
  reason: string;
};

function getConfiguredToken(): string | null {
  const token = process.env.ADMIN_DASHBOARD_TOKEN?.trim();
  return token && token.length > 0 ? token : null;
}

function secureEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function extractBearerToken(authorizationHeader?: string | null): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

export function authorizeAdminAccess(input: AdminAccessInput): AdminAccessResult {
  const configuredToken = getConfiguredToken();
  if (!configuredToken) {
    return {
      ok: false,
      status: 503,
      reason: "Admin access is disabled. Missing ADMIN_DASHBOARD_TOKEN.",
    };
  }

  const presentedToken =
    extractBearerToken(input.authorizationHeader) ??
    input.adminTokenHeader?.trim() ??
    input.queryToken?.trim() ??
    null;

  if (!presentedToken) {
    return {
      ok: false,
      status: 401,
      reason: "Missing admin token.",
    };
  }

  if (!secureEquals(presentedToken, configuredToken)) {
    return {
      ok: false,
      status: 403,
      reason: "Invalid admin token.",
    };
  }

  return { ok: true, status: 200, reason: "authorized" };
}

export function authorizeAdminRequest(request: NextRequest): AdminAccessResult {
  return authorizeAdminAccess({
    authorizationHeader: request.headers.get("authorization"),
    adminTokenHeader: request.headers.get("x-admin-token"),
    queryToken: request.nextUrl.searchParams.get("token"),
  });
}

