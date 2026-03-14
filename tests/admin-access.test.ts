import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getConfiguredAdminToken, signAdminSession, verifyAdminSession } from "../src/security/adminSession";

const ORIGINAL_ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ORIGINAL_ADMIN_DASHBOARD_TOKEN = process.env.ADMIN_DASHBOARD_TOKEN;
const ORIGINAL_ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

describe("admin session", () => {
  beforeEach(() => {
    process.env.ADMIN_TOKEN = "top-secret-admin-token";
    process.env.ADMIN_DASHBOARD_TOKEN = "legacy-dashboard-token";
    process.env.ADMIN_SESSION_SECRET = "test-admin-session-secret";
  });

  afterEach(() => {
    process.env.ADMIN_TOKEN = ORIGINAL_ADMIN_TOKEN;
    process.env.ADMIN_DASHBOARD_TOKEN = ORIGINAL_ADMIN_DASHBOARD_TOKEN;
    process.env.ADMIN_SESSION_SECRET = ORIGINAL_ADMIN_SESSION_SECRET;
  });

  it("signs and verifies short-lived admin sessions", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signAdminSession({
      v: 1,
      iat: now,
      exp: now + 60,
      jti: "session-1",
    });

    const session = verifyAdminSession(token);
    expect(session).not.toBeNull();
    expect(session?.jti).toBe("session-1");
  });

  it("rejects tampered sessions", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signAdminSession({
      v: 1,
      iat: now,
      exp: now + 60,
      jti: "session-2",
    });
    const [body, sig] = token.split(".");
    const tamperedBody = `${body}A`;

    expect(verifyAdminSession(`${tamperedBody}.${sig}`)).toBeNull();
  });

  it("rejects expired sessions", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signAdminSession({
      v: 1,
      iat: now - 120,
      exp: now - 60,
      jti: "session-3",
    });

    expect(verifyAdminSession(token)).toBeNull();
  });

  it("prefers ADMIN_TOKEN over legacy ADMIN_DASHBOARD_TOKEN", () => {
    expect(getConfiguredAdminToken()).toBe("top-secret-admin-token");
  });
});
