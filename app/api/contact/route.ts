import { NextRequest, NextResponse } from "next/server";
import { sendOwnerNotificationEmail } from "@/lib/email/ionos";
import { saveIntakeLead } from "@/src/leads/server/intakeLeadsDb";
import { sanitizeRequestBody } from "@/src/security/inputSanitizer";
import { guardPayloadSize, validateFieldLengths } from "@/src/security/payloadGuard";
import { buildRateLimitIdentity } from "@/src/security/requestIdentity";
import { checkRateLimit } from "@/src/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_LOCALES = new Set(["en", "fr", "ht", "es", "pt"]);

function readTrimmedString(value: unknown, maxLength = 2000): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function isEmail(value: string | undefined): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const rate = await checkRateLimit(
    buildRateLimitIdentity("contact-form", request),
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
  const name = readTrimmedString(sanitized.name, 200) ?? null;
  const email = readTrimmedString(sanitized.email, 254);
  const subject = readTrimmedString(sanitized.subject, 200);
  const message = readTrimmedString(sanitized.message, 4000);
  const source = readTrimmedString(sanitized.source, 100) ?? "contact_page";

  if (!email) {
    return NextResponse.json({ error: "Email address is required." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Email address is invalid." }, { status: 400 });
  }

  if (!subject) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const submission = {
    createdAt: new Date().toISOString(),
    locale,
    source,
    name,
    email,
    subject,
    message,
  };

  const leadResult = await saveIntakeLead({
    email,
    name,
    locale,
    source,
    summary: `Contact form: ${subject}`,
    metadata: {
      subject,
      message,
      submitted_at: submission.createdAt,
    },
    createdAt: submission.createdAt,
  });

  const emailResult = await sendOwnerNotificationEmail({
    to: "info@bizsproutai.com",
    replyTo: email,
    subject: `[BizSproutAI] Contact form - ${subject}`,
    text: [
      "New contact form submission",
      "",
      `Submitted: ${submission.createdAt}`,
      `Locale: ${locale}`,
      `Name: ${name ?? "n/a"}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
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
