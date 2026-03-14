import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  type AdminSessionPayload,
  verifyAdminSession,
} from "@/src/security/adminSession";

export class AdminUnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AdminUnauthorizedError";
  }
}

export async function getAdminSessionFromCookies(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return token ? verifyAdminSession(token) : null;
}

export function getAdminSessionFromRequest(request: NextRequest): AdminSessionPayload | null {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return token ? verifyAdminSession(token) : null;
}

export async function requireAdmin(): Promise<AdminSessionPayload> {
  const session = await getAdminSessionFromCookies();
  if (!session) throw new AdminUnauthorizedError();
  return session;
}

export function requireAdminRequest(request: NextRequest): AdminSessionPayload {
  const session = getAdminSessionFromRequest(request);
  if (!session) throw new AdminUnauthorizedError();
  return session;
}
