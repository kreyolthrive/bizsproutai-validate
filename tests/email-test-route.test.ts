import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../app/api/email-test/route";

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const ORIGINAL_EMAIL_TEST_ENABLED = process.env.EMAIL_TEST_ENABLED;

function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("email test route", () => {
  afterEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV);
    process.env.EMAIL_TEST_ENABLED = ORIGINAL_EMAIL_TEST_ENABLED;
    delete (globalThis as typeof globalThis & { __bizsprRateLimitBuckets?: Map<string, unknown> }).__bizsprRateLimitBuckets;
  });

  it("is disabled in production unless explicitly enabled", async () => {
    setNodeEnv("production");
    process.env.EMAIL_TEST_ENABLED = "false";

    const response = await POST(
      new NextRequest("http://localhost/api/email-test", {
        method: "POST",
        body: JSON.stringify({ to: "owner@example.com" }),
        headers: {
          "content-type": "application/json",
        },
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Email test endpoint is disabled." });
  });

  it("rejects oversized request bodies", async () => {
    setNodeEnv("development");

    const response = await POST(
      new NextRequest("http://localhost/api/email-test", {
        method: "POST",
        headers: {
          "content-length": "9000",
        },
      })
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "Request payload too large (max 8000 bytes).",
    });
  });
});
