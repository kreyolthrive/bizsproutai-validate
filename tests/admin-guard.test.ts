import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { AdminUnauthorizedError, requireAdminRequest } from "../src/security/adminAccess";
import { signAdminSession } from "../src/security/adminSession";

const ORIGINAL_ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

describe("admin access guard", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-admin-session-secret";
  });

  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = ORIGINAL_ADMIN_SESSION_SECRET;
  });

  it("blocks requests without a valid session cookie", () => {
    const request = new NextRequest("http://localhost/api/admin/leads");

    expect(() => requireAdminRequest(request)).toThrow(AdminUnauthorizedError);
  });

  it("accepts requests with a valid signed session cookie", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signAdminSession({
      v: 1,
      iat: now,
      exp: now + 60,
      jti: "guard-session-1",
    });

    const request = new NextRequest("http://localhost/api/admin/leads", {
      headers: {
        cookie: `admin_session=${token}`,
      },
    });

    const session = requireAdminRequest(request);

    expect(session.jti).toBe("guard-session-1");
  });
});
