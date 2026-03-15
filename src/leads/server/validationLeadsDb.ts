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

type SaveValidationLeadInput = {
  requestId?: string;
  email: string;
  name?: string;
  idea: string;
  locale: Locale;
  input?: ValidationInput;
  result: DynamicValidationResult;
  report?: ReportPayload;
  reportFilename?: string;
  reportText?: string;
  emailSentToUser?: boolean;
  emailSentToOwner?: boolean;
  source?: string;
  consentMarketing?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export type LeadSaveResult = {
  eventId: string;
  saved: boolean;
};

type ValidationLeadRow = {
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeIdea(idea: string): string {
  return idea.trim();
}

function toDecision(result: DynamicValidationResult): string {
  const decision = result.frameworkReport?.decision;

  if (decision === "PIVOT_RECOMMENDED") return "NO_GO";
  if (decision) return decision;
  if (result.status === "GO") return "GO";
  if (result.status === "REFINE") return "NO_GO";

  return "NEED_WORK";
}

function resolveScore(result: DynamicValidationResult): number {
  if (typeof result.frameworkReport?.weightedScore === "number") {
    return Math.max(
      0,
      Math.min(100, Math.round(result.frameworkReport.weightedScore))
    );
  }

  return Math.max(0, Math.min(100, resolveOverallScore100(result)));
}

function resolveCategory(result: DynamicValidationResult): string | null {
  return (
    result.businessCategory ??
    result.business_category ??
    result.category ??
    null
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

function resolveFramework(result: DynamicValidationResult): string | null {
  return (
    result.framework?.label ??
    result.selectedFramework?.frameworkLabel ??
    result.frameworkUsed ??
    result.framework_used ??
    null
  );
}

function resolveReportFilename(input: SaveValidationLeadInput): string {
  return input.report?.filename ?? input.reportFilename ?? "validation-report.txt";
}

function resolveReportText(input: SaveValidationLeadInput): string {
  return (
    input.report?.text ??
    input.reportText ??
    "Validation report unavailable."
  );
}

function resolveReportGeneratedAt(input: SaveValidationLeadInput): string {
  const metaGeneratedAt =
    isRecord(input.result.meta) ? readString(input.result.meta["generatedAt"]) : undefined;

  return (
    input.report?.generatedAt ??
    metaGeneratedAt ??
    input.createdAt ??
    new Date().toISOString()
  );
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

function buildPayload(input: SaveValidationLeadInput, nowIso: string) {
  const emailSentToUser = input.emailSentToUser ?? false;
  const emailSentToOwner = input.emailSentToOwner ?? false;
  const reportFilename = resolveReportFilename(input);
  const reportText = resolveReportText(input);
  const reportGeneratedAt = resolveReportGeneratedAt(input);

  return {
    email: normalizeEmail(input.email),
    name: input.name?.trim() || null,
    business_idea: normalizeIdea(input.idea),
    idea_category: resolveCategory(input.result),
    score: resolveScore(input.result),
    decision: toDecision(input.result),
    summary: resolveSummary(input.result),
    source: input.source ?? "bizsproutai-validation",
    language: input.locale,
    country: resolveCountry(input.result),
    consent_marketing: input.consentMarketing ?? true,
    email_sent: emailSentToUser,
    metadata: {
      ...(input.metadata ?? {}),
      request_id: input.requestId ?? null,
      framework: resolveFramework(input.result),
      report_filename: reportFilename,
      report_generated_at: reportGeneratedAt,
      report_text_length: reportText.length,
      report_pdf_filename: input.report?.pdf?.filename ?? null,
      report_pdf_size_bytes: input.report?.pdf?.sizeBytes ?? null,
      report_pdf_error: input.report?.pdfError ?? null,
      email_sent_to_owner: emailSentToOwner,
      email_sent_to_user: emailSentToUser,
      submitted_input: input.input ?? null,
    },
    updated_at: nowIso,
  };
}

export async function saveValidationLead(
  input: SaveValidationLeadInput
): Promise<LeadSaveResult> {
  const supabase = getSupabaseClient();
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedIdea = normalizeIdea(input.idea);
  const nowIso = input.createdAt ?? new Date().toISOString();
  const payload = buildPayload(input, nowIso);

  const { data, error } = await supabase
    .from("validation_leads")
    .insert(payload)
    .select("id")
    .single<ValidationLeadRow>();

  if (!error && data?.id) {
    return { eventId: data.id, saved: true };
  }

  if (error?.code === "23505") {
    const { data: existing, error: fetchError } = await supabase
      .from("validation_leads")
      .select("id")
      .ilike("email", normalizedEmail)
      .eq("business_idea", normalizedIdea)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<ValidationLeadRow>();

    if (fetchError) {
      throw new Error(`Duplicate lead lookup failed: ${fetchError.message}`);
    }

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("validation_leads")
        .update({
          name: payload.name,
          idea_category: payload.idea_category,
          score: payload.score,
          decision: payload.decision,
          summary: payload.summary,
          source: payload.source,
          language: payload.language,
          country: payload.country,
          consent_marketing: payload.consent_marketing,
          email_sent: payload.email_sent,
          metadata: payload.metadata,
          updated_at: nowIso,
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(`Failed to refresh duplicate lead: ${updateError.message}`);
      }

      return { eventId: existing.id, saved: true };
    }

    throw new Error("Lead already exists but could not be resolved for update.");
  }

  throw new Error(
    `Failed to save validation lead: ${error?.message ?? "unknown error"}`
  );
}
