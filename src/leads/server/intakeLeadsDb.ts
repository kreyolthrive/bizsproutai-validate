import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { canUseEphemeralPersistenceFallback } from "@/src/server/runtimeMode";
import {
  getSupabaseAdminClient,
  hasSupabaseAdminConfig,
} from "@/src/server/supabaseAdmin";

type IntakeLeadInput = {
  email: string;
  name?: string | null;
  locale: string;
  source: string;
  summary: string;
  consentMarketing?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readTrimmedString(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

async function saveIntakeLeadLocally(
  id: string,
  payload: Record<string, unknown>
): Promise<{ eventId: string; saved: boolean }> {
  const dataDir = path.join(process.cwd(), ".data");
  const filePath = path.join(dataDir, "intake-leads.ndjson");

  await mkdir(dataDir, { recursive: true });
  await appendFile(
    filePath,
    `${JSON.stringify({ id, storage: "local_file_fallback", ...payload })}\n`,
    "utf8"
  );

  return { eventId: id, saved: true };
}

export async function saveIntakeLead(
  input: IntakeLeadInput
): Promise<{ eventId: string; saved: boolean }> {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const id = randomUUID();
  const payload = {
    email: normalizeEmail(input.email),
    name: readTrimmedString(input.name),
    business_idea: input.summary,
    idea_category: input.source,
    score: null,
    decision: null,
    summary: input.summary,
    source: input.source,
    language: input.locale,
    country: null,
    consent_marketing: input.consentMarketing ?? true,
    email_sent: false,
    metadata: input.metadata ?? {},
    updated_at: createdAt,
  };

  if (!hasSupabaseAdminConfig()) {
    if (!canUseEphemeralPersistenceFallback()) {
      throw new Error(
        "Supabase admin storage is required in production for intake submissions."
      );
    }

    return saveIntakeLeadLocally(id, {
      ...payload,
      created_at: createdAt,
    });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("validation_leads")
    .insert(payload)
    .select("id")
    .single<{ id: string }>();

  if (error || !data?.id) {
    throw new Error(
      `Failed to save intake lead: ${error?.message ?? "unknown error"}`
    );
  }

  return { eventId: data.id, saved: true };
}
