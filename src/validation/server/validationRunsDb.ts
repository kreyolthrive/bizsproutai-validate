import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import type { DynamicValidationResult, ValidationInput } from "@/src/validation/types";
import { loadFramework } from "@/src/validation/engine/loadFramework";

const DB_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "bizspr.db");
const require = createRequire(import.meta.url);

let database: import("node:sqlite").DatabaseSync | null = null;

function getDatabaseSync(): typeof import("node:sqlite").DatabaseSync {
  return require("node:sqlite").DatabaseSync as typeof import("node:sqlite").DatabaseSync;
}

function getDb(): import("node:sqlite").DatabaseSync {
  if (database) return database;

  fs.mkdirSync(DB_DIR, { recursive: true });
  const DatabaseSync = getDatabaseSync();
  database = new DatabaseSync(DB_FILE);
  database.exec(`
    CREATE TABLE IF NOT EXISTS business_validation_runs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      business_id TEXT,
      idea_input TEXT NOT NULL,
      business_category TEXT NOT NULL,
      framework_used TEXT NOT NULL,
      overall_score INTEGER NOT NULL,
      confidence_score INTEGER NOT NULL,
      final_verdict TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_validation_scores (
      id TEXT PRIMARY KEY,
      validation_run_id TEXT NOT NULL,
      score_name TEXT NOT NULL,
      score_value INTEGER NOT NULL,
      weight REAL,
      reason TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_validation_insights (
      id TEXT PRIMARY KEY,
      validation_run_id TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_validation_research (
      id TEXT PRIMARY KEY,
      validation_run_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      query_used TEXT,
      summary TEXT NOT NULL,
      evidence TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS business_validation_frameworks (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      framework_name TEXT NOT NULL,
      version TEXT NOT NULL,
      criteria_json TEXT NOT NULL,
      weights_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(category, framework_name, version)
    );
  `);

  return database;
}

type SaveValidationRunInput = {
  userId?: string | null;
  businessId?: string | null;
  input: ValidationInput;
  result: DynamicValidationResult;
};

function insertScores(runId: string, result: DynamicValidationResult, createdAt: string): void {
  if (!result.scores) return;

  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO business_validation_scores (
      id, validation_run_id, score_name, score_value, weight, reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const criteriaByKey = new Map(result.criteria.map((criterion) => [criterion.key, criterion]));
  const reasons: Record<string, string | undefined> = {
    market_demand: result.frameworkReport?.problemDemand.keyInsight ?? criteriaByKey.get("problem_validation")?.evidence[0],
    monetization: result.frameworkReport?.businessModelValidation.model ?? criteriaByKey.get("business_model")?.evidence[0],
    competition: criteriaByKey.get("competition")?.risks[0] ?? criteriaByKey.get("differentiation")?.evidence[0],
    acquisition: criteriaByKey.get("distribution")?.recommendations[0] ?? criteriaByKey.get("market_access")?.recommendations[0],
    execution_feasibility: result.frameworkReport?.operationalValidation.keyConstraints[0] ?? criteriaByKey.get("execution_ability")?.risks[0],
    differentiation: criteriaByKey.get("differentiation")?.evidence[0] ?? result.summary.topOpportunities[0],
    risk: result.failureRisks[0]?.reason,
  };

  for (const [scoreName, scoreValue] of Object.entries(result.scores)) {
    statement.run(
      randomUUID(),
      runId,
      scoreName,
      Math.round(scoreValue),
      null,
      reasons[scoreName] ?? null,
      createdAt
    );
  }
}

function insertInsights(runId: string, result: DynamicValidationResult, createdAt: string): void {
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO business_validation_insights (
      id, validation_run_id, type, content, created_at
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const insightSets: Array<[string, string[] | undefined]> = [
    ["strength", result.strengths],
    ["weakness", result.weaknesses],
    ["risk", result.keyRisks],
    ["assumption", result.assumptionsToTest],
    ["next_step", result.recommendedNextSteps],
  ];

  for (const [type, entries] of insightSets) {
    for (const content of entries ?? []) {
      statement.run(randomUUID(), runId, type, content, createdAt);
    }
  }
}

function insertResearch(runId: string, input: ValidationInput, result: DynamicValidationResult, createdAt: string): void {
  if (!result.researchSummary) return;

  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO business_validation_research (
      id, validation_run_id, source_type, query_used, summary, evidence, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const query = JSON.stringify({
    idea: input.idea,
    targetCustomer: input.targetCustomer,
    targetMarket: input.targetMarket,
    location: input.location,
    category: result.businessCategory ?? result.category,
  });

  const entries: Array<[string, string[]]> = [
    ["demand_signals", result.researchSummary.demandSignals],
    ["competition_notes", result.researchSummary.competitionNotes],
    ["market_trends", result.researchSummary.marketTrends],
    ["monetization_notes", result.researchSummary.monetizationNotes],
    ["acquisition_challenges", result.researchSummary.acquisitionChallenges],
    ["differentiation_opportunities", result.researchSummary.differentiationOpportunities],
    ["risk_factors", result.researchSummary.riskFactors],
  ];

  for (const [sourceType, rows] of entries) {
    for (const row of rows) {
      statement.run(
        randomUUID(),
        runId,
        sourceType,
        query,
        row,
        JSON.stringify({ sources: result.researchSummary.sources }),
        createdAt
      );
    }
  }
}

function upsertFramework(result: DynamicValidationResult): void {
  const frameworkName = result.frameworkUsed ?? result.framework_used;
  if (!frameworkName) return;

  const framework = loadFramework({
    category: result.category,
    countryCode: result.country.code,
  });
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO business_validation_frameworks (
      id, category, framework_name, version, criteria_json, weights_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(category, framework_name, version) DO UPDATE SET
      criteria_json = excluded.criteria_json,
      weights_json = excluded.weights_json,
      updated_at = excluded.updated_at
  `);
  const nowIso = new Date().toISOString();

  statement.run(
    `${result.category}:${frameworkName}:v1`,
    result.businessCategory ?? result.category,
    frameworkName,
    "v1",
    JSON.stringify(framework.criteria.map((criterion) => ({
      key: criterion.key,
      label: criterion.label,
      description: criterion.description ?? null,
    }))),
    JSON.stringify(framework.criteria.map((criterion) => ({
      key: criterion.key,
      weight: criterion.weight,
    }))),
    nowIso
  );
}

export function saveBusinessValidationRun(input: SaveValidationRunInput): { runId: string } {
  const db = getDb();
  const runId = randomUUID();
  const createdAt = new Date().toISOString();
  const statement = db.prepare(`
    INSERT INTO business_validation_runs (
      id, user_id, business_id, idea_input, business_category, framework_used,
      overall_score, confidence_score, final_verdict, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  statement.run(
    runId,
    input.userId ?? null,
    input.businessId ?? null,
    JSON.stringify(input.result.submittedContext ?? input.input),
    input.result.businessCategory ?? input.result.business_category ?? input.result.category,
    input.result.frameworkUsed ?? input.result.framework_used ?? `${input.result.category}_v1`,
    input.result.overall_score ?? 0,
    input.result.confidenceScore ?? input.result.confidence_score ?? 0,
    input.result.finalVerdict ?? input.result.final_verdict ?? "promising_but_needs_proof",
    createdAt
  );

  upsertFramework(input.result);
  insertScores(runId, input.result, createdAt);
  insertInsights(runId, input.result, createdAt);
  insertResearch(runId, input.input, input.result, createdAt);

  return { runId };
}
