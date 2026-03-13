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
const MAX_METADATA_KEYS = 25;
const MAX_REQUEST_BYTES = 64_000;
const RATE_LIMIT_REQUESTS_PER_MINUTE = 120;
const RATE_LIMIT_WINDOW_MS = 60_000;

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

function toOptionalText(value: unknown, maxLength = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
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
    const name = trimToLength(safeBody.name, MAX_NAME_LENGTH);
    const source = trimToLength(safeBody.source, MAX_SOURCE_LENGTH) ?? "landing_page";
    const consentMarketing =
      typeof safeBody.consentMarketing === "boolean" ? safeBody.consentMarketing : true;
    const metadata = normalizeMetadata(safeBody.metadata);

    // Validate required fields
    if (!safeBody.idea || typeof safeBody.idea !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'idea' field" },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedIdea = safeBody.idea.trim();
    if (normalizedIdea.length < 10) {
      return NextResponse.json(
        { error: "Idea must be at least 10 characters" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (normalizedIdea.length > MAX_IDEA_LENGTH) {
      return NextResponse.json(
        { error: `Idea must be ${MAX_IDEA_LENGTH} characters or fewer` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate optional fields
    const locale: Locale =
      safeBody.locale && VALID_LOCALES.includes(safeBody.locale as Locale) ? safeBody.locale as Locale : "en";

    const category: Category | undefined =
      safeBody.category && VALID_CATEGORIES.includes(safeBody.category as Category)
        ? safeBody.category as Category
        : undefined;

    const email =
      typeof safeBody.email === "string" && safeBody.email.trim().length > 0
        ? safeBody.email.trim().toLowerCase()
        : undefined;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Build validation input
    const input: ValidationInput = {
      idea: normalizedIdea,
      locale,
      category,
      targetCustomer: toOptionalText(safeBody.targetCustomer),
      targetMarket: toOptionalText(safeBody.targetMarket),
      location: toOptionalText(safeBody.location),
      offer: toOptionalText(safeBody.offer),
      problem: toOptionalText(safeBody.problem),
      pricingIdea: toOptionalText(safeBody.pricingIdea),
      budgetUsd: toOptionalNumber(safeBody.budgetUsd),
      skillSummary: toOptionalText(safeBody.skillSummary),
      channels: Array.isArray(safeBody.channels)
        ? safeBody.channels.filter((channel): channel is string => typeof channel === "string")
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
      console.error("Validation run persistence error:", validationRunError);
      validationRun = {
        saved: false,
        runId: null,
        error: "Failed to persist validation run.",
      };
    }

    if (email) {
      try {
        // Save first so retargeting lead data is never lost if email fails.
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
      } catch (leadError) {
        console.error("Lead capture error:", leadError);
        leadCapture = {
          saved: false,
          eventId: null,
          error: "Failed to save lead to SQL database.",
        };
      }

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

      // Best-effort refresh of delivery flags on the same lead record.
      if (leadCapture.saved) {
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
          console.error("Lead status refresh error:", leadUpdateError);
        }
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
    console.error("Validation error:", error);
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
