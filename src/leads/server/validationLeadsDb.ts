import { createClient } from "@supabase/supabase-js";
import type { DynamicValidationResult, Locale } from "@/src/validation/types";

type SaveValidationLeadInput = {
  email: string;
  name?: string;
  idea: string;
  locale: Locale;
  result: DynamicValidationResult;
  reportFilename: string;
  reportText: string;
  emailSentToUser: boolean;
  emailSentToOwner: boolean;
  source?: string;
  consentMarketing?: boolean;
  metadata?: Record<string, unknown>;
};

export type LeadSaveResult = {
  eventId: string;
  saved: boolean;
};

type ValidationLeadRow = {
  id: string;
};

function toDecision(result: DynamicValidationResult): string {
  const decision = result.frameworkReport?.decision;
  // Map to DB-safe values (constraint allows: GO, CONDITIONAL_GO, NEED_WORK, NO_GO)
  if (decision === "PIVOT_RECOMMENDED") return "NO_GO";
  if (decision) return decision;
  if (result.status === "GO") return "GO";
  if (result.status === "REFINE") return "NO_GO";
  return "NEED_WORK";
}

function resolveScore(result: DynamicValidationResult): number {
  if (typeof result.frameworkReport?.weightedScore === "number") {
    return Math.max(0, Math.min(100, Math.round(result.frameworkReport.weightedScore)));
  }
  return Math.max(0, Math.min(100, Math.round(Number(result.overallScore) * 20)));
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function saveValidationLead(input: SaveValidationLeadInput): Promise<LeadSaveResult> {
  const supabase = getSupabaseClient();
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedIdea = input.idea.trim();
  const nowIso = new Date().toISOString();
  const decision = toDecision(input.result);
  const score = resolveScore(input.result);

  const payload = {
    email: normalizedEmail,
    name: input.name?.trim() || null,
    business_idea: normalizedIdea,
    idea_category: input.result.category,
    score,
    decision,
    summary: input.result.summary.oneLiner,
    source: input.source ?? "landing_page",
    language: input.locale,
    country: input.result.country.code,
    consent_marketing: input.consentMarketing ?? true,
    email_sent: input.emailSentToUser,
    metadata: {
      ...(input.metadata ?? {}),
      framework: input.result.framework?.label ?? null,
      report_filename: input.reportFilename,
      report_generated_at: input.result.meta.generatedAt,
      email_sent_to_owner: input.emailSentToOwner,
      email_sent_to_user: input.emailSentToUser,
    },
    updated_at: nowIso,
  };

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

  throw new Error(`Failed to save validation lead: ${error?.message ?? "unknown error"}`);
}
