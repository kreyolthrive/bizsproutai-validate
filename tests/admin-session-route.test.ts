import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { DELETE, POST } from "../app/api/admin/session/route";

const ORIGINAL_ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const ORIGINAL_ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("admin session route", () => {
  beforeEach(() => {
    process.env.ADMIN_TOKEN = "top-secret-admin-token";
    process.env.ADMIN_SESSION_SECRET = "test-admin-session-secret";
    delete (globalThis as typeof globalThis & { __bizsprRateLimitBuckets?: Map<string, unknown> }).__bizsprRateLimitBuckets;
  });

  afterEach(() => {
    process.env.ADMIN_TOKEN = ORIGINAL_ADMIN_TOKEN;
    process.env.ADMIN_SESSION_SECRET = ORIGINAL_ADMIN_SESSION_SECRET;
    setNodeEnv(ORIGINAL_NODE_ENV);
    delete (globalThis as typeof globalThis & { __bizsprRateLimitBuckets?: Map<string, unknown> }).__bizsprRateLimitBuckets;
  });

  it("creates an admin session cookie for valid tokens", async () => {
    const request = new NextRequest("http://localhost/api/admin/session", {
      method: "POST",
      headers: {
        "x-admin-token": "top-secret-admin-token",
      },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(response.headers.get("set-cookie")).toContain("admin_session=");
  });

  it("rejects invalid admin tokens", async () => {
    const request = new NextRequest("http://localhost/api/admin/session", {
      method: "POST",
      headers: {
        "x-admin-token": "wrong-token",
      },
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload).toEqual({ error: "Unauthorized" });
  });

  it("clears admin cookies on logout", async () => {
    const request = new NextRequest("http://localhost/api/admin/session", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    const payload = await response.json();
    const setCookie = response.headers.get("set-cookie") || "";

    expect(response.status).toBe(200);
    expect(payload).toEqual({ success: true });
    expect(setCookie).toContain("admin_session=;");
    expect(setCookie).toContain("Max-Age=0");
  });

  it("rate limits repeated auth attempts from the same client", async () => {
    let response: Response | null = null;

    for (let index = 0; index < 21; index += 1) {
      response = await POST(
        new NextRequest("http://localhost/api/admin/session", {
          method: "POST",
          headers: {
            "x-admin-token": "wrong-token",
            "x-forwarded-for": "203.0.113.10",
            "user-agent": "vitest",
          },
        })
      );
    }

    expect(response).not.toBeNull();
    expect(response?.status).toBe(429);
    expect(response?.headers.get("retry-after")).toBeTruthy();
  });

  it("marks admin session cookies as HttpOnly, SameSite=Strict, and Secure in production", async () => {
    setNodeEnv("production");

    const response = await POST(
      new NextRequest("http://localhost/api/admin/session", {
        method: "POST",
        headers: {
          "x-admin-token": "top-secret-admin-token",
        },
      })
    );

    const setCookie = response.headers.get("set-cookie") || "";

    expect(setCookie).toContain("HttpOnly");
    expect(setCookie.toLowerCase()).toContain("samesite=strict");
    expect(setCookie).toContain("Secure");
  });
});
