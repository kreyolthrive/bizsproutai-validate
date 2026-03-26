import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendOwnerNotificationEmail } from "@/lib/email/ionos";
import { saveIntakeLead } from "@/src/leads/server/intakeLeadsDb";
import { sanitizeRequestBody } from "@/src/security/inputSanitizer";
import { guardPayloadSize, validateFieldLengths } from "@/src/security/payloadGuard";
import { checkRateLimit } from "@/src/security/rateLimit";
import { buildRateLimitIdentity } from "@/src/security/requestIdentity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_LOCALES = new Set(["en", "fr", "ht", "es", "pt"]);
const VALID_SERVICE_IDS = new Set([
  "idea_validation_sprint",
  "website_messaging_refresh",
  "ai_workflow_setup",
  "booking_follow_up_system",
  "ai_onboarding",
]);

function readTrimmedString(value: unknown, maxLength = 2000): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function isEmail(value: string | undefined): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const rate = await checkRateLimit(
    buildRateLimitIdentity("action-plan-intake", request),
    10,
    60_000
  );

  if (!rate.allowed) {
    if (rate.reason === "rate_limit_backend_unavailable") {
      return NextResponse.json(
        { error: "Service temporarily unavailable." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Too many requests. Please retry shortly." },
      { status: 429 }
    );
  }

  const guarded = await guardPayloadSize(request);
  if (!guarded.ok) {
    return NextResponse.json({ error: guarded.message }, { status: guarded.status });
  }

  if (typeof guarded.body !== "object" || guarded.body === null || Array.isArray(guarded.body)) {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const sanitized = sanitizeRequestBody(guarded.body as Record<string, unknown>);
  const fieldValidation = validateFieldLengths(sanitized);
  if (!fieldValidation.ok) {
    return NextResponse.json({ error: fieldValidation.message }, { status: 400 });
  }

  const localeRaw = readTrimmedString(sanitized.locale, 10) ?? "en";
  const locale = VALID_LOCALES.has(localeRaw) ? localeRaw : "en";
  const businessName = readTrimmedString(sanitized.businessName, 200);
  const email = readTrimmedString(sanitized.email, 254);
  const phone = readTrimmedString(sanitized.phone, 60);
  const selectedServices = readStringArray(sanitized.selectedServices).filter((item) =>
    VALID_SERVICE_IDS.has(item)
  );

  if (!businessName) {
    return NextResponse.json({ error: "Business name is required." }, { status: 400 });
  }

  if (selectedServices.length === 0) {
    return NextResponse.json({ error: "Select at least one service." }, { status: 400 });
  }

  if (!email || !phone) {
    return NextResponse.json(
      { error: "Provide both an email address and phone number." },
      { status: 400 }
    );
  }

  if (email && !isEmail(email)) {
    return NextResponse.json({ error: "Email address is invalid." }, { status: 400 });
  }

  const submission = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    locale,
    source: readTrimmedString(sanitized.source, 100) ?? "action_plan_page",
    name: readTrimmedString(sanitized.name, 200) ?? null,
    businessName,
    email: email ?? null,
    phone: phone ?? null,
    websiteUrl: readTrimmedString(sanitized.websiteUrl, 500) ?? null,
    stage: readTrimmedString(sanitized.stage, 100) ?? null,
    targetCustomer: readTrimmedString(sanitized.targetCustomer, 2000) ?? null,
    biggestChallenge: readTrimmedString(sanitized.biggestChallenge, 2000) ?? null,
    goal30Days: readTrimmedString(sanitized.goal30Days, 2000) ?? null,
    extraContext: readTrimmedString(sanitized.extraContext, 4000) ?? null,
    selectedServices,
    selectedServiceTitles: readStringArray(sanitized.selectedServiceTitles),
    consentFollowUp: readBoolean(sanitized.consentFollowUp),
  };
  const leadSummary = submission.selectedServiceTitles.length
    ? `Action plan request: ${submission.businessName} (${submission.selectedServiceTitles.join(", ")})`
    : `Action plan request: ${submission.businessName}`;

  const leadResult = await saveIntakeLead({
    email,
    name: submission.name,
    locale,
    source: submission.source,
    summary: leadSummary,
    consentMarketing: submission.consentFollowUp,
    metadata: {
      business_name: submission.businessName,
      phone: submission.phone,
      website_url: submission.websiteUrl,
      stage: submission.stage,
      target_customer: submission.targetCustomer,
      biggest_challenge: submission.biggestChallenge,
      goal_30_days: submission.goal30Days,
      extra_context: submission.extraContext,
      selected_services: submission.selectedServices,
      selected_service_titles: submission.selectedServiceTitles,
      submitted_at: submission.createdAt,
    },
    createdAt: submission.createdAt,
  });

  const emailResult = await sendOwnerNotificationEmail({
    to: "info@bizsproutai.com",
    replyTo: email,
    subject: `[BizSproutAI] Action plan intake - ${businessName}`,
    text: [
      "New action plan submission",
      "",
      `Submitted: ${submission.createdAt}`,
      `Locale: ${locale}`,
      `Source: ${submission.source}`,
      `Name: ${submission.name ?? "n/a"}`,
      `Business: ${submission.businessName}`,
      `Email: ${submission.email ?? "n/a"}`,
      `Phone: ${submission.phone ?? "n/a"}`,
      `Website: ${submission.websiteUrl ?? "n/a"}`,
      `Stage: ${submission.stage ?? "n/a"}`,
      `Consent follow-up: ${submission.consentFollowUp ? "yes" : "no"}`,
      "",
      "Selected services:",
      ...(submission.selectedServiceTitles.length
        ? submission.selectedServiceTitles
        : submission.selectedServices),
      "",
      `Target customer: ${submission.targetCustomer ?? "n/a"}`,
      "",
      `Biggest challenge: ${submission.biggestChallenge ?? "n/a"}`,
      "",
      `30-day goal: ${submission.goal30Days ?? "n/a"}`,
      "",
      `Extra context: ${submission.extraContext ?? "n/a"}`,
    ].join("\n"),
  });

  return NextResponse.json(
    {
      ok: true,
      eventId: leadResult.eventId,
      ownerEmailDelivered: emailResult.sent,
      ownerEmailError: emailResult.sent ? null : emailResult.error,
    },
    { status: 200 }
  );
}
