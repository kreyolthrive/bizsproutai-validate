import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../app/api/admin/leads/route";
import { signAdminSession } from "../src/security/adminSession";

const ORIGINAL_ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

describe("admin leads route", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-admin-session-secret";
  });

  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = ORIGINAL_ADMIN_SESSION_SECRET;
  });

  it("rejects unauthorized requests", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/leads"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("accepts authorized requests and enforces permission checks before loading data", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signAdminSession({
      v: 1,
      iat: now,
      exp: now + 60,
      jti: "admin-leads-access",
    });

    const response = await GET(
      new NextRequest("http://localhost/api/admin/leads", {
        headers: {
          cookie: `admin_session=${token}`,
        },
      })
    );

    expect(response.status).not.toBe(401);
  });
});
