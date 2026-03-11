import { NextRequest, NextResponse } from "next/server";
import { validateIdeaDynamic } from "@/src/validation/engine/orchestrator";
import type { ValidationInput, Locale, Category } from "@/src/validation/types";
import { sendValidationEmails } from "@/lib/email/ionos";
import { buildValidationReportDocument } from "@/lib/report/validationReport";
import { buildValidationReportPdf } from "@/lib/report/validationReportPdf";
import { saveValidationLead } from "@/src/leads/server/validationLeadsDb";
import { buildCorsHeaders } from "@/src/security/cors";
import { checkRateLimit } from "@/src/security/rateLimit";

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
const RATE_LIMIT_REQUESTS_PER_MINUTE = 120;
const RATE_LIMIT_WINDOW_MS = 60_000;

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

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  try {
    const ip = (request.headers.get("x-forwarded-for") ?? "unknown")
      .split(",")[0]
      ?.trim() || "unknown";
    const rate = checkRateLimit(`validate:${ip}`, RATE_LIMIT_REQUESTS_PER_MINUTE, RATE_LIMIT_WINDOW_MS);
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

    const body = await request.json();
    const name = trimToLength(body.name, MAX_NAME_LENGTH);
    const source = trimToLength(body.source, MAX_SOURCE_LENGTH) ?? "landing_page";
    const consentMarketing =
      typeof body.consentMarketing === "boolean" ? body.consentMarketing : true;
    const metadata = normalizeMetadata(body.metadata);

    // Validate required fields
    if (!body.idea || typeof body.idea !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'idea' field" },
        { status: 400, headers: corsHeaders }
      );
    }

    const normalizedIdea = body.idea.trim();
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
      body.locale && VALID_LOCALES.includes(body.locale) ? body.locale : "en";

    const category: Category | undefined =
      body.category && VALID_CATEGORIES.includes(body.category)
        ? body.category
        : undefined;

    const email =
      typeof body.email === "string" && body.email.trim().length > 0
        ? body.email.trim().toLowerCase()
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
      targetMarket: body.targetMarket,
      location: body.location,
      budgetUsd:
        typeof body.budgetUsd === "number" ? body.budgetUsd : undefined,
      channels: Array.isArray(body.channels) ? body.channels : undefined,
      timelineDays:
        typeof body.timelineDays === "number" ? body.timelineDays : undefined,
      experienceLevel: ["beginner", "intermediate", "advanced"].includes(
        body.experienceLevel
      )
        ? body.experienceLevel
        : undefined,
    };

    // Run dynamic validation
    const result = await validateIdeaDynamic(input);
    const reportText = buildValidationReportDocument({
      idea: input.idea,
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
        idea: input.idea,
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

    if (email) {
      try {
        // Save first so retargeting lead data is never lost if email fails.
        const initialLeadSave = await saveValidationLead({
          email,
          name,
          idea: input.idea,
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
        leadCapture = {
          saved: false,
          eventId: null,
          error: leadError instanceof Error ? leadError.message : "Failed to save lead to SQL database.",
        };
      }

      emailDelivery = await sendValidationEmails({
        userEmail: email,
        idea: input.idea,
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
            idea: input.idea,
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
