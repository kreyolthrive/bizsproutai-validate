import crypto from "node:crypto";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 15 * 60;

const b64u = (buf: Buffer) =>
  buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const unb64u = (s: string) =>
  Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4), "base64");

export type AdminSessionPayload = {
  v: 1;
  iat: number;
  exp: number;
  jti: string;
};

export function getConfiguredAdminToken(): string | null {
  const configured = process.env.ADMIN_TOKEN?.trim() || process.env.ADMIN_DASHBOARD_TOKEN?.trim();
  return configured && configured.length > 0 ? configured : null;
}

export function signAdminSession(payload: AdminSessionPayload): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET");

  const body = b64u(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = crypto.createHmac("sha256", secret).update(body).digest();
  return `${body}.${b64u(sig)}`;
}

export function verifyAdminSession(token: string): AdminSessionPayload | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expected = crypto.createHmac("sha256", secret).update(body).digest();
  const got = unb64u(sig);

  if (got.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(got, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(unb64u(body)).toString("utf8")) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload?.v !== 1) return null;
    if (!Number.isFinite(payload.iat) || !Number.isFinite(payload.exp)) return null;
    if (payload.exp < now) return null;
    if (typeof payload.jti !== "string" || payload.jti.length === 0) return null;
    return payload;
  } catch {
    return null;
  }
}
