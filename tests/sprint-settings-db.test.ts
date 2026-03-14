// @vitest-environment node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SPRINT_SETTINGS } from "../src/sprint/config";

const ORIGINAL_CWD = process.cwd();
const ORIGINAL_VERCEL = process.env.VERCEL;
const ORIGINAL_UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const ORIGINAL_UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ORIGINAL_KV_URL = process.env.KV_REST_API_URL;
const ORIGINAL_KV_TOKEN = process.env.KV_REST_API_TOKEN;

describe("sprint settings storage", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "bizspr-sprint-settings-"));
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

  it("returns default settings for new projects", async () => {
    const { getSprintSettingsFromDb } = await import("../src/sprint/server/settingsDb");

    await expect(getSprintSettingsFromDb("user-1", "project-1")).resolves.toEqual({
      ...DEFAULT_SPRINT_SETTINGS,
      completedTaskIds: [],
    });
  });

  it("persists create and update operations across reads", async () => {
    const { getSprintSettingsFromDb, saveSprintSettingsToDb } = await import("../src/sprint/server/settingsDb");

    const created = await saveSprintSettingsToDb("user-1", "project-1", {
      sprintIntensity: "intensive",
      onboardingCompleted: true,
      startedAt: "2026-03-13T00:00:00.000Z",
      completedTaskIds: ["task-1"],
    });

    const updated = await saveSprintSettingsToDb("user-1", "project-1", {
      completedTaskIds: ["task-1", "task-2"],
    });

    const stored = await getSprintSettingsFromDb("user-1", "project-1");

    expect(created).toMatchObject({
      sprintTemplateId: DEFAULT_SPRINT_SETTINGS.sprintTemplateId,
      sprintIntensity: "intensive",
      onboardingCompleted: true,
      startedAt: "2026-03-13T00:00:00.000Z",
      completedTaskIds: ["task-1"],
    });
    expect(updated).toMatchObject({
      sprintIntensity: "intensive",
      onboardingCompleted: true,
      completedTaskIds: ["task-1", "task-2"],
    });
    expect(stored).toEqual(updated);
    expect(fs.existsSync(path.join(tempDir, ".data", "bizspr.db"))).toBe(true);
  });
});
