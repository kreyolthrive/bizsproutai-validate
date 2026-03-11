import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { DEFAULT_SPRINT_SETTINGS } from "@/src/sprint/config";
import type { SprintIntensity, SprintSettings } from "@/src/sprint/types";

const DB_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "bizspr.db");

let database: DatabaseSync | null = null;

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

function getDb(): DatabaseSync {
  if (database) return database;

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
}

function parseCompletedTaskIds(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function rowToSettings(row: SprintSettingsRow | null): SprintSettings {
  if (!row) {
    return {
      ...DEFAULT_SPRINT_SETTINGS,
      completedTaskIds: [],
    };
  }

  return {
    sprintTemplateId: row.sprint_template_id || DEFAULT_SPRINT_SETTINGS.sprintTemplateId,
    sprintIntensity: isValidIntensity(row.sprint_intensity)
      ? row.sprint_intensity
      : DEFAULT_SPRINT_SETTINGS.sprintIntensity,
    onboardingCompleted: row.onboarding_completed === 1,
    startedAt: row.started_at || undefined,
    completedTaskIds: parseCompletedTaskIds(row.completed_task_ids),
  };
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

export function getSprintSettingsFromDb(userId: string, projectKey: string): SprintSettings {
  const db = getDb();
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

export function saveSprintSettingsToDb(
  userId: string,
  projectKey: string,
  patch: SprintSettingsPatch
): SprintSettings {
  const db = getDb();
  const current = getSprintSettingsFromDb(userId, projectKey);
  const merged = mergeSettings(current, patch);

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
