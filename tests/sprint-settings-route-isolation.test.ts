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

describe("sprint settings route isolation", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bizspr-sprint-route-"));
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

  it("keeps sprint settings isolated per session cookie", async () => {
    const { GET, POST } = await import("../app/api/sprint/settings/route");

    const createResponse = await POST(
      new NextRequest("http://localhost/api/sprint/settings", {
        method: "POST",
        body: JSON.stringify({
          projectKey: "saas:launch-plan",
          settings: {
            sprintIntensity: "intensive",
            onboardingCompleted: true,
            completedTaskIds: ["task-1"],
          },
        }),
        headers: {
          "content-type": "application/json",
        },
      })
    );

    const setCookie = createResponse.headers.get("set-cookie");
    const sessionCookie = setCookie?.split(";")[0];
    expect(sessionCookie).toContain("bizspr_sprint_session=");

    const sameSessionResponse = await GET(
      new NextRequest("http://localhost/api/sprint/settings?projectKey=saas%3Alaunch-plan", {
        headers: {
          cookie: sessionCookie!,
        },
      })
    );
    const sameSessionPayload = await sameSessionResponse.json();

    const otherSessionResponse = await GET(
      new NextRequest("http://localhost/api/sprint/settings?projectKey=saas%3Alaunch-plan")
    );
    const otherSessionPayload = await otherSessionResponse.json();

    expect(sameSessionPayload.settings.onboardingCompleted).toBe(true);
    expect(sameSessionPayload.settings.completedTaskIds).toEqual(["task-1"]);
    expect(otherSessionPayload.settings.onboardingCompleted).toBe(false);
    expect(otherSessionPayload.settings.completedTaskIds).toEqual([]);
  });
});
