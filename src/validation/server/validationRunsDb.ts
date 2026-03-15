import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type {
  DynamicValidationResult,
  Locale,
  ValidationInput,
} from "@/src/validation/types";
import { resolveOverallScore100 } from "@/src/validation/decision";

type ReportPayload = {
  filename: string;
  generatedAt: string;
  text: string;
  pdf?: {
    filename: string;
    mimeType?: string;
    contentBase64?: string;
    sizeBytes?: number;
  } | null;
  pdfError?: string | null;
};

type SaveValidationRunInput = {
  requestId?: string;
  userId?: string | null;
  businessId?: string | null;
  email: string;
  locale?: Locale;
  input: ValidationInput;
  result: DynamicValidationResult;
  report: ReportPayload;
  source?: string;
  createdAt?: string;
};

export type ValidationRunSaveResult = {
  runId: string;
  saved: boolean;
};

type ValidationRunRow = {
  id: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function resolveCategory(result: DynamicValidationResult): string {
  return (
    result.businessCategory ??
    result.business_category ??
    result.category ??
    "unknown"
  );
}

function resolveFramework(result: DynamicValidationResult): string {
  return (
    result.selectedFramework?.frameworkLabel ??
    result.frameworkUsed ??
    result.framework_used ??
    result.framework?.label ??
    `${resolveCategory(result)}_v1`
  );
}

function resolveCountry(result: DynamicValidationResult): string | null {
  const code = readString(result.country?.code);
  if (code) return code;

  const countryUnknown = result.country as unknown;
  if (isRecord(countryUnknown)) {
    const runtimeValue =
      readString(countryUnknown["name"]) ??
      readString(countryUnknown["label"]) ??
      readString(countryUnknown["country"]);

    if (runtimeValue) return runtimeValue;
  }

  return null;
}

function resolveSummary(result: DynamicValidationResult): string {
  return result.summary?.oneLiner ?? "Validation completed.";
}

function resolveConfidenceScore(result: DynamicValidationResult): number {
  const candidates: unknown[] = [
    result.confidenceScore,
    result.confidence_score,
    isRecord(result.meta) ? result.meta["confidence"] : undefined,
    isRecord(result.meta) ? result.meta["confidenceScore"] : undefined,
    isRecord(result.meta) ? result.meta["confidence_score"] : undefined,
  ];

  for (const candidate of candidates) {
    const numeric = readNumber(candidate);
    if (typeof numeric === "number") {
      return clampScore(numeric);
    }
  }

  return 0;
}

function resolveFinalVerdict(result: DynamicValidationResult): string {
  const directDecision = readString(result.frameworkReport?.decision);
  if (directDecision === "PIVOT_RECOMMENDED") return "NO_GO";
  if (directDecision) return directDecision;

  const finalVerdict =
    readString(result.finalVerdict) ?? readString(result.final_verdict);
  if (finalVerdict) return finalVerdict;

  const status = readString(result.status);
  if (status === "GO") return "GO";
  if (status === "REFINE") return "NO_GO";

  return "NEED_WORK";
}

function resolveOverallScore(result: DynamicValidationResult): number {
  const direct =
    readNumber(result.overall_score) ??
    readNumber(result.overallScore) ??
    readNumber(result.frameworkReport?.weightedScore);

  if (typeof direct === "number") {
    return clampScore(direct);
  }

  return clampScore(resolveOverallScore100(result));
}

function buildIdeaInputJson(input: SaveValidationRunInput): string {
  return JSON.stringify({
    email: normalizeEmail(input.email),
    locale: input.locale ?? input.input.locale ?? "en",
    submittedAt: input.createdAt ?? new Date().toISOString(),
    input: input.input,
    submittedContext: input.result.submittedContext ?? null,
  });
}

function buildMetadataJson(input: SaveValidationRunInput): string {
  return JSON.stringify({
    requestId: input.requestId ?? null,
    source: input.source ?? "bizsproutai-validation",
    category: resolveCategory(input.result),
    framework: resolveFramework(input.result),
    country: resolveCountry(input.result),
    summary: resolveSummary(input.result),
    scores: input.result.scores ?? null,
    report_filename: input.report.filename,
    report_generated_at: input.report.generatedAt,
    report_pdf_filename: input.report.pdf?.filename ?? null,
    report_pdf_mime_type: input.report.pdf?.mimeType ?? null,
    report_pdf_size_bytes: input.report.pdf?.sizeBytes ?? null,
    report_pdf_error: input.report.pdfError ?? null,
  });
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function tryInsertRun(
  payload: Record<string, unknown>
): Promise<ValidationRunRow | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("business_validation_runs")
    .insert(payload)
    .select("id")
    .single<ValidationRunRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

function buildInsertPayloads(input: SaveValidationRunInput, runId: string) {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const normalizedEmail = normalizeEmail(input.email);
  const locale = input.locale ?? input.input.locale ?? "en";
  const ideaInputJson = buildIdeaInputJson(input);
  const metadataJson = buildMetadataJson(input);
  const businessCategory = resolveCategory(input.result);
  const frameworkUsed = resolveFramework(input.result);
  const overallScore = resolveOverallScore(input.result);
  const confidenceScore = resolveConfidenceScore(input.result);
  const finalVerdict = resolveFinalVerdict(input.result);
  const summary = resolveSummary(input.result);
  const country = resolveCountry(input.result);

  const richPayload: Record<string, unknown> = {
    id: runId,
    request_id: input.requestId ?? runId,
    user_id: input.userId ?? null,
    business_id: input.businessId ?? null,
    email: normalizedEmail,
    locale,
    idea_input: ideaInputJson,
    input_json: ideaInputJson,
    result_json: JSON.stringify(input.result),
    business_category: businessCategory,
    framework_used: frameworkUsed,
    overall_score: overallScore,
    confidence_score: confidenceScore,
    final_verdict: finalVerdict,
    summary,
    country,
    report_filename: input.report.filename,
    report_generated_at: input.report.generatedAt,
    report_text: input.report.text,
    report_pdf_filename: input.report.pdf?.filename ?? null,
    report_pdf_size_bytes: input.report.pdf?.sizeBytes ?? null,
    source: input.source ?? "bizsproutai-validation",
    metadata: metadataJson,
    created_at: createdAt,
    updated_at: createdAt,
  };

  const mediumPayload: Record<string, unknown> = {
    id: runId,
    email: normalizedEmail,
    locale,
    idea_input: ideaInputJson,
    business_category: businessCategory,
    framework_used: frameworkUsed,
    overall_score: overallScore,
    confidence_score: confidenceScore,
    final_verdict: finalVerdict,
    summary,
    country,
    metadata: metadataJson,
    created_at: createdAt,
    updated_at: createdAt,
  };

  const minimalPayload: Record<string, unknown> = {
    id: runId,
    user_id: input.userId ?? null,
    business_id: input.businessId ?? null,
    idea_input: ideaInputJson,
    business_category: businessCategory,
    framework_used: frameworkUsed,
    overall_score: overallScore,
    confidence_score: confidenceScore,
    final_verdict: finalVerdict,
    created_at: createdAt,
  };

  return [
    { label: "rich", payload: richPayload },
    { label: "medium", payload: mediumPayload },
    { label: "minimal", payload: minimalPayload },
  ];
}

export async function saveBusinessValidationRun(
  input: SaveValidationRunInput
): Promise<ValidationRunSaveResult> {
  const runId = input.requestId?.trim() || randomUUID();
  const attempts = buildInsertPayloads(input, runId);
  const errors: string[] = [];

  for (const attempt of attempts) {
    try {
      await tryInsertRun(attempt.payload);
      return { runId, saved: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Supabase insert error";
      errors.push(`${attempt.label}: ${message}`);
    }
  }

  throw new Error(
    `Failed to save validation run to Supabase. ${errors.join(" | ")}`
  );
}
