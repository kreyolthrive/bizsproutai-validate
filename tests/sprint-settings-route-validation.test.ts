// @vitest-environment node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const ORIGINAL_CWD = process.cwd();
const ORIGINAL_VERCEL = process.env.VERCEL;
const ORIGINAL_UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const ORIGINAL_UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ORIGINAL_KV_URL = process.env.KV_REST_API_URL;
const ORIGINAL_KV_TOKEN = process.env.KV_REST_API_TOKEN;

describe("sprint settings route validation", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bizspr-sprint-validation-"));
    process.chdir(tempDir);
    delete process.env.VERCEL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    vi.resetModules();
  });

  afterEach(() => {
    process.chdir(ORIGINAL_CWD);
    fs.rmSync(tempDir, { recursive: true, force: true });
    process.env.VERCEL = ORIGINAL_VERCEL;
    process.env.UPSTASH_REDIS_REST_URL = ORIGINAL_UPSTASH_URL;
    process.env.UPSTASH_REDIS_REST_TOKEN = ORIGINAL_UPSTASH_TOKEN;
    process.env.KV_REST_API_URL = ORIGINAL_KV_URL;
    process.env.KV_REST_API_TOKEN = ORIGINAL_KV_TOKEN;
    vi.resetModules();
  });

  it("rejects GET without projectKey", async () => {
    const { GET } = await import("../app/api/sprint/settings/route");
    const response = await GET(new NextRequest("http://localhost/api/sprint/settings"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing required query param: projectKey",
    });
  });

  it("rejects POST without projectKey", async () => {
    const { POST } = await import("../app/api/sprint/settings/route");
    const response = await POST(
      new NextRequest("http://localhost/api/sprint/settings", {
        method: "POST",
        body: JSON.stringify({ settings: {} }),
        headers: {
          "content-type": "application/json",
        },
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Missing required field: projectKey",
    });
  });

  it("rejects overlong project keys", async () => {
    const { GET } = await import("../app/api/sprint/settings/route");
    const longKey = "x".repeat(181);
    const response = await GET(
      new NextRequest(`http://localhost/api/sprint/settings?projectKey=${longKey}`)
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "projectKey must be 180 characters or fewer",
    });
  });
});
