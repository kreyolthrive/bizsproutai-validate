import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseAdminClient,
  hasSupabaseAdminConfig,
} from "@/src/server/supabaseAdmin";
import { sendOwnerNotification } from "@/lib/email/resendNotification";
import { checkRateLimit } from "@/src/security/rateLimit";
import { resolveClientIp } from "@/src/security/requestIdentity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_LOCALES = new Set(["en", "fr", "ht", "es", "pt"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  if (/[\r\n\t]/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const ts = new Date().toISOString();

  // Rate-limit by IP: 5 attempts per minute
  const ip = resolveClientIp(req);
  const rl = await checkRateLimit(`waitlist:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Validate email
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const name =
    typeof body.name === "string" ? body.name.trim().slice(0, 80) || null : null;
  const source =
    typeof body.source === "string" ? body.source.slice(0, 80) : "free_validation_result";
  const locale =
    typeof body.locale === "string" && VALID_LOCALES.has(body.locale)
      ? body.locale
      : null;
  const validationLeadId =
    typeof body.validationLeadId === "string" && UUID_RE.test(body.validationLeadId)
      ? body.validationLeadId
      : null;
  const stage =
    typeof body.stage === "string" ? body.stage.slice(0, 100) : null;

  // Persist to waitlist_leads via upsert (unique on lower(email))
  let waitlistLeadId: string | null = null;

  if (hasSupabaseAdminConfig()) {
    try {
      const sb = getSupabaseAdminClient() as any;

      // Try update first (email already on list)
      const { data: updated } = await sb
        .from("waitlist_leads")
        .update({ name, source, locale, stage, updated_at: ts })
        .eq("email", email)
        .select("id")
        .maybeSingle();

      if (updated) {
        waitlistLeadId = updated.id as string;
      } else {
        const { data: inserted, error } = await sb
          .from("waitlist_leads")
          .insert({
            email,
            name,
            source,
            locale,
            validation_lead_id: validationLeadId,
            stage,
            updated_at: ts,
          })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        waitlistLeadId = (inserted as any)?.id ?? null;
      }
    } catch (err) {
      console.error("[waitlist] DB save failed:", String(err));
      // Non-fatal: still return success to client
    }
  }

  // Notify owner (fire and forget)
  sendOwnerNotification({
    email,
    firstName: name || "",
    stage: stage ? `WAITLIST — ${stage}` : "WAITLIST_SIGNUP",
    completed: true,
    timestamp: ts,
  }).catch((err) =>
    console.error("[waitlist] Owner notification failed:", String(err))
  );

  return NextResponse.json(
    { ok: true, waitlistLeadId: waitlistLeadId ?? requestId },
    { headers: { "X-Request-Id": requestId } }
  );
}
