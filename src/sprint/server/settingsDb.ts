import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SPRINT_SETTINGS } from "@/src/sprint/config";
import type { SprintIntensity, SprintSettings } from "@/src/sprint/types";

const DB_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "bizspr.db");
const REDIS_KEY_PREFIX = "sprint_settings:v1";
const REDIS_WARNED_FALLBACK_GLOBAL_KEY = "__bizsprSprintSettingsRedisFallbackWarned";

type DatabaseSyncType = import("node:sqlite").DatabaseSync;
let database: DatabaseSyncType | null = null;
let sqliteUnavailable = false;

type RedisConfig = {
  url: string;
  token: string;
};

type SprintSettingsRow = {
  user_id: string;
  project_key: string;
  sprint_template_id: string;
  sprint_intensity: string;
  onboarding_completed: number;
  started_at: string | null;
  completed_task_ids: string;
  updated_at: string;
};

type SprintSettingsPatch = Partial<SprintSettings>;

function isValidIntensity(value: unknown): value is SprintIntensity {
  return value === "light" || value === "standard" || value === "intensive";
}

function getDefaultSettings(): SprintSettings {
  return {
    ...DEFAULT_SPRINT_SETTINGS,
    completedTaskIds: [],
  };
}

function parseCompletedTaskIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function normalizeSettings(value: unknown): SprintSettings {
  if (!value || typeof value !== "object") {
    return getDefaultSettings();
  }

  const candidate = value as Partial<SprintSettings> & {
    completedTaskIds?: unknown;
  };

  const templateId =
    typeof candidate.sprintTemplateId === "string" && candidate.sprintTemplateId.trim()
      ? candidate.sprintTemplateId.trim()
      : DEFAULT_SPRINT_SETTINGS.sprintTemplateId;

  const startedAt =
    typeof candidate.startedAt === "string" && candidate.startedAt.trim()
      ? candidate.startedAt.trim()
      : undefined;

  return {
    sprintTemplateId: templateId,
    sprintIntensity: isValidIntensity(candidate.sprintIntensity)
      ? candidate.sprintIntensity
      : DEFAULT_SPRINT_SETTINGS.sprintIntensity,
    onboardingCompleted:
      typeof candidate.onboardingCompleted === "boolean"
        ? candidate.onboardingCompleted
        : DEFAULT_SPRINT_SETTINGS.onboardingCompleted,
    startedAt,
    completedTaskIds: parseCompletedTaskIds(candidate.completedTaskIds),
  };
}

function rowToSettings(row: SprintSettingsRow | null): SprintSettings {
  if (!row) return getDefaultSettings();

  return normalizeSettings({
    sprintTemplateId: row.sprint_template_id,
    sprintIntensity: row.sprint_intensity,
    onboardingCompleted: row.onboarding_completed === 1,
    startedAt: row.started_at || undefined,
    completedTaskIds: row.completed_task_ids,
  });
}

function mergeSettings(current: SprintSettings, patch: SprintSettingsPatch): SprintSettings {
  return {
    sprintTemplateId: patch.sprintTemplateId || current.sprintTemplateId,
    sprintIntensity: isValidIntensity(patch.sprintIntensity)
      ? patch.sprintIntensity
      : current.sprintIntensity,
    onboardingCompleted:
      typeof patch.onboardingCompleted === "boolean"
        ? patch.onboardingCompleted
        : current.onboardingCompleted,
    startedAt: patch.startedAt ?? current.startedAt,
    completedTaskIds: Array.isArray(patch.completedTaskIds)
      ? patch.completedTaskIds.filter((task): task is string => typeof task === "string")
      : current.completedTaskIds || [],
  };
}

function hasWarnedRedisFallback(): boolean {
  const globalRef = globalThis as typeof globalThis & {
    [REDIS_WARNED_FALLBACK_GLOBAL_KEY]?: boolean;
  };
  return globalRef[REDIS_WARNED_FALLBACK_GLOBAL_KEY] === true;
}

function markWarnedRedisFallback(): void {
  const globalRef = globalThis as typeof globalThis & {
    [REDIS_WARNED_FALLBACK_GLOBAL_KEY]?: boolean;
  };
  globalRef[REDIS_WARNED_FALLBACK_GLOBAL_KEY] = true;
}

function warnRedisFallback(error: unknown): void {
  if (hasWarnedRedisFallback()) return;
  console.error("Sprint settings shared storage unavailable; falling back to local SQLite.", error);
  markWarnedRedisFallback();
}

function getRedisConfig(): RedisConfig | null {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (upstashUrl && upstashToken) {
    return { url: upstashUrl.replace(/\/+$/, ""), token: upstashToken };
  }

  const kvUrl = process.env.KV_REST_API_URL?.trim();
  const kvToken = process.env.KV_REST_API_TOKEN?.trim();
  if (kvUrl && kvToken) {
    return { url: kvUrl.replace(/\/+$/, ""), token: kvToken };
  }

  return null;
}

async function runRedisPipeline(
  config: RedisConfig,
  commands: Array<Array<string>>
): Promise<Array<{ result?: unknown }>> {
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis backend returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as Array<{ result?: unknown }>;
  if (!Array.isArray(payload)) {
    throw new Error("Invalid Redis backend response.");
  }

  return payload;
}

function buildRedisKey(userId: string, projectKey: string): string {
  return `${REDIS_KEY_PREFIX}:${userId}:${projectKey}`;
}

async function getSprintSettingsFromRedis(
  config: RedisConfig,
  userId: string,
  projectKey: string
): Promise<SprintSettings | null> {
  const key = buildRedisKey(userId, projectKey);
  const payload = await runRedisPipeline(config, [["GET", key]]);
  const raw = payload[0]?.result;
  if (typeof raw !== "string" || !raw) return null;

  try {
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function saveSprintSettingsToRedis(
  config: RedisConfig,
  userId: string,
  projectKey: string,
  settings: SprintSettings
): Promise<void> {
  const key = buildRedisKey(userId, projectKey);
  const payload = JSON.stringify({
    ...settings,
    updatedAt: new Date().toISOString(),
  });
  await runRedisPipeline(config, [["SET", key, payload]]);
}

function getDatabaseSync(): typeof import("node:sqlite").DatabaseSync | null {
  if (sqliteUnavailable) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqliteModule = require("node:sqlite");
    return sqliteModule.DatabaseSync as typeof import("node:sqlite").DatabaseSync;
  } catch {
    sqliteUnavailable = true;
    console.warn("[settingsDb] node:sqlite unavailable - local SQLite fallback disabled");
    return null;
  }
}

function getDb(): DatabaseSyncType | null {
  if (sqliteUnavailable) return null;
  if (database) return database;

  const DatabaseSync = getDatabaseSync();
  if (!DatabaseSync) return null;

  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    database = new DatabaseSync(DB_FILE);

    database.exec(`
      CREATE TABLE IF NOT EXISTS sprint_settings (
        user_id TEXT NOT NULL,
        project_key TEXT NOT NULL,
        sprint_template_id TEXT NOT NULL DEFAULT 'generic_90_day',
        sprint_intensity TEXT NOT NULL DEFAULT 'standard',
        onboarding_completed INTEGER NOT NULL DEFAULT 0,
        started_at TEXT,
        completed_task_ids TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL,
        PRIMARY KEY (user_id, project_key)
      );
    `);

    return database;
  } catch (error) {
    sqliteUnavailable = true;
    console.warn("[settingsDb] Failed to initialize SQLite database:", error);
    return null;
  }
}

function getSprintSettingsFromSqlite(userId: string, projectKey: string): SprintSettings {
  const db = getDb();
  if (!db) return getDefaultSettings();

  const statement = db.prepare(`
    SELECT user_id, project_key, sprint_template_id, sprint_intensity,
           onboarding_completed, started_at, completed_task_ids, updated_at
    FROM sprint_settings
    WHERE user_id = ? AND project_key = ?
    LIMIT 1
  `);

  const row = statement.get(userId, projectKey) as SprintSettingsRow | undefined;
  return rowToSettings(row || null);
}

function saveSprintSettingsToSqlite(
  userId: string,
  projectKey: string,
  patch: SprintSettingsPatch
): SprintSettings {
  const db = getDb();
  const current = getSprintSettingsFromSqlite(userId, projectKey);
  const merged = mergeSettings(current, patch);

  // If SQLite is unavailable, return merged settings without persisting
  if (!db) return merged;

  const nowIso = new Date().toISOString();
  const statement = db.prepare(`
    INSERT INTO sprint_settings (
      user_id,
      project_key,
      sprint_template_id,
      sprint_intensity,
      onboarding_completed,
      started_at,
      completed_task_ids,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, project_key) DO UPDATE SET
      sprint_template_id = excluded.sprint_template_id,
      sprint_intensity = excluded.sprint_intensity,
      onboarding_completed = excluded.onboarding_completed,
      started_at = excluded.started_at,
      completed_task_ids = excluded.completed_task_ids,
      updated_at = excluded.updated_at
  `);

  statement.run(
    userId,
    projectKey,
    merged.sprintTemplateId,
    merged.sprintIntensity,
    merged.onboardingCompleted ? 1 : 0,
    merged.startedAt || null,
    JSON.stringify(merged.completedTaskIds || []),
    nowIso
  );

  return merged;
}

export async function getSprintSettingsFromDb(userId: string, projectKey: string): Promise<SprintSettings> {
  const redisConfig = getRedisConfig();
  if (!redisConfig) {
    return getSprintSettingsFromSqlite(userId, projectKey);
  }

  try {
    const redisSettings = await getSprintSettingsFromRedis(redisConfig, userId, projectKey);
    return redisSettings ?? getDefaultSettings();
  } catch (error) {
    warnRedisFallback(error);
    return getSprintSettingsFromSqlite(userId, projectKey);
  }
}

export async function saveSprintSettingsToDb(
  userId: string,
  projectKey: string,
  patch: SprintSettingsPatch
): Promise<SprintSettings> {
  const redisConfig = getRedisConfig();
  if (!redisConfig) {
    return saveSprintSettingsToSqlite(userId, projectKey, patch);
  }

  try {
    const current = (await getSprintSettingsFromRedis(redisConfig, userId, projectKey)) ?? getDefaultSettings();
    const merged = mergeSettings(current, patch);
    await saveSprintSettingsToRedis(redisConfig, userId, projectKey, merged);
    return merged;
  } catch (error) {
    warnRedisFallback(error);
    return saveSprintSettingsToSqlite(userId, projectKey, patch);
  }
}
