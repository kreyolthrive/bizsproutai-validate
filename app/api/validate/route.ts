import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { ValidationInput, Locale, Category } from "@/src/validation/types";
import { sendValidationEmails } from "@/lib/email/ionos";
import { buildValidationReportDocument } from "@/lib/report/validationReport";
import { buildValidationReportPdf } from "@/lib/report/validationReportPdf";
import { saveValidationLead } from "@/src/leads/server/validationLeadsDb";
import { saveBusinessValidationRun } from "@/src/validation/server/validationRunsDb";
import { buildCorsHeaders } from "@/src/security/cors";
import { buildRateLimitIdentity } from "@/src/security/requestIdentity";
import { checkRateLimit } from "@/src/security/rateLimit";
import { runBusinessValidationPipeline } from "@/src/validation/engine/pipeline";

export const runtime = "nodejs";

const VALID_LOCALES: Locale[] = ["en", "fr", "ht", "es"];
const VALID_CATEGORIES: Category[] = [
  "ecommerce",
  "coaching",
  "consulting",
  "finance",
  "tech",
  "local_service",
  "saas",
  "marketplace",
  "health_wellness",
  "edtech",
  "legal_law",
];
const MAX_IDEA_LENGTH = 1200;
const MAX_NAME_LENGTH = 120;
const MAX_SOURCE_LENGTH = 120;
const MAX_EMAIL_LENGTH = 320;
const MAX_METADATA_KEYS = 25;
const MAX_REQUEST_BYTES = 64_000;
const RATE_LIMIT_REQUESTS_PER_MINUTE = 120;
const RATE_LIMIT_WINDOW_MS = 60_000;
const EMAIL_RATE_LIMIT_REQUESTS = 6;
const EMAIL_RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const DUPLICATE_REQUEST_WINDOW_MS = 10 * 60_000;
const MAX_CHANNELS = 12;
const MAX_CHANNEL_LENGTH = 80;
const HONEYPOT_FIELD = "website";

function isRequestBodyTooLarge(request: NextRequest, maxBytes: number): boolean {
  const contentLength = Number(request.headers.get("content-length") ?? "");
  return Number.isFinite(contentLength) && contentLength > maxBytes;
}

function trimToLength(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function normalizeWhitespace(value: string, allowNewlines = false): string {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (allowNewlines) {
    return normalized.replace(/\n{3,}/g, "\n\n");
  }
  return normalized.replace(/\s+/g, " ");
}

function hasDisallowedControlChars(value: string, allowNewlines = false): boolean {
  return allowNewlines
    ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)
    : /[\u0000-\u001F\u007F]/.test(value);
}

function normalizeTextField(
  value: unknown,
  maxLength: number,
  fieldLabel: string,
  options?: { allowNewlines?: boolean }
): { value?: string; error?: string } {
  if (typeof value !== "string") return {};
  const normalized = normalizeWhitespace(value, options?.allowNewlines);
  if (!normalized) return {};
  if (hasDisallowedControlChars(normalized, options?.allowNewlines)) {
    return { error: `${fieldLabel} contains unsupported characters.` };
  }
  if (normalized.length > maxLength) {
    return { error: `${fieldLabel} must be ${maxLength} characters or fewer.` };
  }
  return { value: normalized };
}

function normalizeIdea(value: unknown): { value?: string; error?: string } {
  if (typeof value !== "string") {
    return { error: "Missing or invalid 'idea' field" };
  }

  const normalized = normalizeWhitespace(value, true);
  if (!normalized) {
    return { error: "Missing or invalid 'idea' field" };
  }
  if (hasDisallowedControlChars(normalized, true)) {
    return { error: "Idea contains unsupported characters." };
  }
  if (normalized.length < 10) {
    return { error: "Idea must be at least 10 characters" };
  }
  if (normalized.length > MAX_IDEA_LENGTH) {
    return { error: `Idea must be ${MAX_IDEA_LENGTH} characters or fewer` };
  }

  return { value: normalized };
}

function normalizeEmail(value: unknown): { value?: string; error?: string } {
  if (typeof value !== "string") {
    return { error: "Email is required to receive your validation report." };
  }

  const email = value.trim().toLowerCase();
  if (!email) {
    return { error: "Email is required to receive your validation report." };
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    return { error: `Email must be ${MAX_EMAIL_LENGTH} characters or fewer.` };
  }
  if (hasDisallowedControlChars(email)) {
    return { error: "Invalid email format" };
  }

  // Restrict to conventional ASCII mailbox syntax. Internationalized addresses
  // can be supported later with a dedicated normalization path.
  const emailPattern =
    /^(?=.{1,64}@.{3,255}$)(?!.*\.\.)[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  if (!emailPattern.test(email)) {
    return { error: "Invalid email format" };
  }

  return { value: email };
}

function normalizeOptionalEmail(value: unknown): { value?: string; error?: string } {
  if (value === undefined || value === null) return {};
  if (typeof value !== "string") {
    return { error: "Invalid email format" };
  }

  if (!value.trim()) {
    return {};
  }

  return normalizeEmail(value);
}

function hashForScope(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function buildDuplicateFingerprint(email: string | undefined, idea: string, idempotencyKey?: string | null): string {
  if (typeof idempotencyKey === "string" && idempotencyKey.trim()) {
    return `idempotency:${idempotencyKey.trim().slice(0, 120)}`;
  }

  const canonicalIdea = idea.toLowerCase().replace(/\s+/g, " ").trim();
  return `content:${email ?? "anonymous"}:${canonicalIdea}`;
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[redacted-email]")
    .replace(/bearer\s+[a-z0-9._-]+/gi, "Bearer [redacted-token]")
    .replace(/\b(?:[a-f0-9]{32,}|[a-z0-9+/_-]{32,})\b/gi, "[redacted-secret]");
}

function toSafeErrorLog(error: unknown): Record<string, string> {
  if (error instanceof Error) {
    const maybeCode = (error as Error & { code?: string }).code;
    return {
      name: error.name,
      message: redactSensitiveText(error.message).slice(0, 240),
      ...(maybeCode ? { code: redactSensitiveText(maybeCode).slice(0, 64) } : {}),
    };
  }

  return {
    message: typeof error === "string" ? redactSensitiveText(error).slice(0, 240) : "unknown error",
  };
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = Object.entries(value as Record<string, unknown>).slice(0, MAX_METADATA_KEYS);
  const normalized: Record<string, unknown> = {};
  for (const [key, entry] of entries) {
    const safeKey = key.trim().slice(0, 64);
    if (!safeKey) continue;
    if (typeof entry === "string") {
      normalized[safeKey] = entry.slice(0, 500);
      continue;
    }
    if (typeof entry === "number" || typeof entry === "boolean" || entry === null) {
      normalized[safeKey] = entry;
      continue;
    }
    normalized[safeKey] = String(entry).slice(0, 500);
  }
  return normalized;
}

function toOptionalText(value: unknown, fieldLabel: string, maxLength = 500): { value?: string; error?: string } {
  return normalizeTextField(value, maxLength, fieldLabel);
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  try {
    if (isRequestBodyTooLarge(request, MAX_REQUEST_BYTES)) {
      return NextResponse.json(
        { error: `Request payload too large (max ${MAX_REQUEST_BYTES} bytes).` },
        { status: 413, headers: corsHeaders }
      );
    }

    const rate = await checkRateLimit(
      buildRateLimitIdentity("validate", request),
      RATE_LIMIT_REQUESTS_PER_MINUTE,
      RATE_LIMIT_WINDOW_MS
    );
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many validation requests. Please retry shortly." },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": String(rate.retryAfterSeconds),
          },
        }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: corsHeaders }
      );
    }

    const safeBody = (typeof body === "object" && body !== null) ? (body as Record<string, unknown>) : {};
    const nameInput = normalizeTextField(safeBody.name, MAX_NAME_LENGTH, "Name");
    if (nameInput.error) {
      return NextResponse.json({ error: nameInput.error }, { status: 400, headers: corsHeaders });
    }

    const sourceInput = normalizeTextField(safeBody.source, MAX_SOURCE_LENGTH, "Source");
    if (sourceInput.error) {
      return NextResponse.json({ error: sourceInput.error }, { status: 400, headers: corsHeaders });
    }

    const honeypot = trimToLength(safeBody[HONEYPOT_FIELD], 200);
    if (honeypot) {
      return NextResponse.json(
        { error: "Unable to process validation request." },
        { status: 400, headers: corsHeaders }
      );
    }

    const name = nameInput.value;
    const source = sourceInput.value ?? "landing_page";
    const consentMarketing =
      typeof safeBody.consentMarketing === "boolean" ? safeBody.consentMarketing : true;
    const metadata = normalizeMetadata(safeBody.metadata);

    const ideaInput = normalizeIdea(safeBody.idea);
    if (ideaInput.error || !ideaInput.value) {
      return NextResponse.json(
        { error: ideaInput.error ?? "Missing or invalid 'idea' field" },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedIdea = ideaInput.value;

    // Validate optional fields
    const locale: Locale =
      safeBody.locale && VALID_LOCALES.includes(safeBody.locale as Locale) ? safeBody.locale as Locale : "en";

    const category: Category | undefined =
      safeBody.category && VALID_CATEGORIES.includes(safeBody.category as Category)
        ? safeBody.category as Category
        : undefined;

    const emailInput = normalizeOptionalEmail(safeBody.email);
    if (emailInput.error) {
      return NextResponse.json(
        { error: emailInput.error ?? "Invalid email format" },
        { status: 400, headers: corsHeaders }
      );
    }

    const email = emailInput.value;

    if (email) {
      const emailRate = await checkRateLimit(
        `validate-email:${hashForScope(email)}`,
        EMAIL_RATE_LIMIT_REQUESTS,
        EMAIL_RATE_LIMIT_WINDOW_MS
      );
      if (!emailRate.allowed) {
        return NextResponse.json(
          { error: "Too many validation requests for this email. Please retry later." },
          {
            status: 429,
            headers: {
              ...corsHeaders,
              "Retry-After": String(emailRate.retryAfterSeconds),
            },
          }
        );
      }
    }

    const duplicateRate = await checkRateLimit(
      `validate-dedupe:${hashForScope(buildDuplicateFingerprint(email, normalizedIdea, request.headers.get("idempotency-key")))}`,
      1,
      DUPLICATE_REQUEST_WINDOW_MS
    );
    if (!duplicateRate.allowed) {
      return NextResponse.json(
        { error: "Duplicate validation request detected. Please wait before submitting again." },
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Retry-After": String(duplicateRate.retryAfterSeconds),
          },
        }
      );
    }

    const targetCustomer = toOptionalText(safeBody.targetCustomer, "Target customer");
    const targetMarket = toOptionalText(safeBody.targetMarket, "Target market");
    const location = toOptionalText(safeBody.location, "Location");
    const offer = toOptionalText(safeBody.offer, "Offer");
    const problem = toOptionalText(safeBody.problem, "Problem");
    const pricingIdea = toOptionalText(safeBody.pricingIdea, "Pricing idea");
    const skillSummary = toOptionalText(safeBody.skillSummary, "Skill summary");
    const optionalErrors = [
      targetCustomer.error,
      targetMarket.error,
      location.error,
      offer.error,
      problem.error,
      pricingIdea.error,
      skillSummary.error,
    ].filter(Boolean);
    if (optionalErrors.length > 0) {
      return NextResponse.json(
        { error: optionalErrors[0] },
        { status: 400, headers: corsHeaders }
      );
    }

    // Build validation input
    const input: ValidationInput = {
      idea: normalizedIdea,
      locale,
      category,
      targetCustomer: targetCustomer.value,
      targetMarket: targetMarket.value,
      location: location.value,
      offer: offer.value,
      problem: problem.value,
      pricingIdea: pricingIdea.value,
      budgetUsd: toOptionalNumber(safeBody.budgetUsd),
      skillSummary: skillSummary.value,
      channels: Array.isArray(safeBody.channels)
        ? safeBody.channels
            .slice(0, MAX_CHANNELS)
            .map((channel) => normalizeTextField(channel, MAX_CHANNEL_LENGTH, "Channel"))
            .filter((channel): channel is { value: string } => Boolean(channel.value))
            .map((channel) => channel.value)
        : undefined,
      timelineDays: toOptionalNumber(safeBody.timelineDays),
      experienceLevel: ["beginner", "intermediate", "advanced"].includes(
        String(safeBody.experienceLevel)
      )
        ? (String(safeBody.experienceLevel) as ValidationInput["experienceLevel"])
        : undefined,
    };

    // Run category-aware validation pipeline
    const result = await runBusinessValidationPipeline(input);
    const reportText = buildValidationReportDocument({
      idea: normalizedIdea,
      email,
      locale,
      result,
    });
    let reportPdf:
      | {
          filename: string;
          bytes: Uint8Array;
        }
      | null = null;
    let pdfGenerationError: string | null = null;

    try {
      reportPdf = await buildValidationReportPdf({
        idea: normalizedIdea,
        email,
        locale,
        result,
        generatedAt: reportText.generatedAt,
      });
    } catch (error) {
      pdfGenerationError = error instanceof Error ? error.message : "Failed to generate PDF report.";
    }

    const report = {
      filename: reportText.filename,
      generatedAt: reportText.generatedAt,
      text: reportText.text,
      pdf: reportPdf
        ? {
            filename: reportPdf.filename,
            mimeType: "application/pdf",
            contentBase64: Buffer.from(reportPdf.bytes).toString("base64"),
            sizeBytes: reportPdf.bytes.byteLength,
          }
        : null,
      pdfError: pdfGenerationError,
    };

    let emailDelivery = {
      attempted: false,
      enabled: false,
      sentToUser: false,
      sentToOwner: false,
      errors: [] as string[],
    };
    let leadCapture = {
      saved: false,
      eventId: null as string | null,
      error: null as string | null,
    };

    let validationRun = {
      saved: false,
      runId: null as string | null,
      error: null as string | null,
    };

    try {
      const savedRun = saveBusinessValidationRun({
        input,
        result,
      });
      validationRun = {
        saved: true,
        runId: savedRun.runId,
        error: null,
      };
    } catch (validationRunError) {
      console.error("Validation run persistence error:", toSafeErrorLog(validationRunError));
      validationRun = {
        saved: false,
        runId: null,
        error: "Failed to persist validation run.",
      };
    }

    try {
      // Save first so retargeting lead data is never lost if email fails.
      if (email) {
        const initialLeadSave = await saveValidationLead({
          email,
          name,
          idea: normalizedIdea,
          locale,
          result,
          reportFilename: reportPdf?.filename ?? reportText.filename,
          reportText: reportText.text,
          emailSentToUser: false,
          emailSentToOwner: false,
          source,
          consentMarketing,
          metadata,
        });
        leadCapture = {
          saved: initialLeadSave.saved,
          eventId: initialLeadSave.eventId,
          error: null,
        };
      }
    } catch (leadError) {
      console.error("Lead capture error:", toSafeErrorLog(leadError));
      leadCapture = {
        saved: false,
        eventId: null,
        error: "Failed to save lead to SQL database.",
      };
    }

    if (email) {
      emailDelivery = await sendValidationEmails({
        userEmail: email,
        idea: normalizedIdea,
        locale,
        result,
        report: {
          filename: reportText.filename,
          generatedAt: reportText.generatedAt,
          text: reportText.text,
          pdf: reportPdf ?? undefined,
        },
      });
    }

    // Best-effort refresh of delivery flags on the same lead record.
    if (email && leadCapture.saved) {
      try {
        await saveValidationLead({
          email,
          name,
          idea: normalizedIdea,
          locale,
          result,
          reportFilename: reportPdf?.filename ?? reportText.filename,
          reportText: reportText.text,
          emailSentToUser: emailDelivery.sentToUser,
          emailSentToOwner: emailDelivery.sentToOwner,
          source,
          consentMarketing,
          metadata,
        });
      } catch (leadUpdateError) {
        console.error("Lead status refresh error:", toSafeErrorLog(leadUpdateError));
      }
    }

    return NextResponse.json({
      ...result,
      emailDelivery,
      leadCapture,
      validationRun,
      report,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Validation error:", toSafeErrorLog(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
