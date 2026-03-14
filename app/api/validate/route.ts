import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";

import type {
  DynamicValidationResult,
  Locale,
  ValidationInput,
} from "@/src/validation/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_LOCALES = new Set<Locale>(["en", "fr", "ht", "es"]);

type JsonObject = Record<string, unknown>;

type ErrorResponseShape = {
  status: number;
  code: string;
  error: string;
  details?: string;
  providerFailures?: string[];
};

type ReportPayload = {
  filename: string;
  generatedAt: string;
  text: string;
  pdf?: {
    filename: string;
    mimeType: string;
    contentBase64: string;
    sizeBytes: number;
  } | null;
  pdfError?: string | null;
};

type EmailDeliveryStatus = {
  attempted: boolean;
  enabled: boolean;
  sentToUser: boolean;
  sentToOwner: boolean;
  errors: string[];
};

type PersistStatus = {
  saved: boolean;
  eventId: string | null;
  error: string | null;
};

type ValidationRunStatus = {
  saved: boolean;
  runId: string | null;
  error: string | null;
};

type ReportArtifacts = {
  report: ReportPayload;
  textDocument: {
    filename: string;
    generatedAt: string;
    text: string;
  } | null;
  pdfDocument: {
    filename: string;
    bytes: Uint8Array;
  } | null;
};

type ValidateSuccessResponse = DynamicValidationResult & {
  ok: true;
  requestId: string;
  email: string;
  report: ReportPayload;
  emailDelivery: EmailDeliveryStatus;
  leadCapture: PersistStatus;
  validationRun: ValidationRunStatus;
};

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
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

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeLocale(value: unknown): Locale {
  const locale = typeof value === "string" ? value.trim().toLowerCase() : "en";
  return VALID_LOCALES.has(locale as Locale) ? (locale as Locale) : "en";
}

function normalizeExperienceLevel(
  value: unknown
): ValidationInput["experienceLevel"] {
  const normalized = asTrimmedString(value);
  return normalized
    ? (normalized as ValidationInput["experienceLevel"])
    : undefined;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createRequestId(): string {
  return crypto.randomUUID();
}

function buildHeaders(requestId: string): HeadersInit {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "X-Request-Id": requestId,
    "Content-Type": "application/json; charset=utf-8",
  };
}

function sendJson(payload: unknown, status: number, requestId: string) {
  return NextResponse.json(payload, {
    status,
    headers: buildHeaders(requestId),
  });
}

function parseValidationPayload(
  body: unknown
): { email?: string; website?: string; input: ValidationInput } {
  const raw = isObject(body) ? body : {};

  const email = asTrimmedString(raw.email);
  const website = asTrimmedString(raw.website);

  const idea =
    asTrimmedString(raw.idea) ??
    asTrimmedString(raw.businessIdea) ??
    asTrimmedString(raw.description) ??
    "";

  const input: ValidationInput = {
    idea,
    locale: normalizeLocale(raw.locale),
    targetCustomer: asTrimmedString(raw.targetCustomer),
    targetMarket: asTrimmedString(raw.targetMarket),
    location: asTrimmedString(raw.location),
    offer: asTrimmedString(raw.offer),
    problem: asTrimmedString(raw.problem),
    pricingIdea: asTrimmedString(raw.pricingIdea),
    budgetUsd: asFiniteNumber(raw.budgetUsd),
    skillSummary: asTrimmedString(raw.skillSummary),
    channels: asStringArray(raw.channels),
    timelineDays: asFiniteNumber(raw.timelineDays),
    experienceLevel: normalizeExperienceLevel(raw.experienceLevel),
  };

  return { email, website, input };
}

function classifyValidationError(message: string): ErrorResponseShape {
  const details = message.trim();
  const lower = details.toLowerCase();

  if (lower.includes("email is required")) {
    return {
      status: 400,
      code: "missing_email",
      error: "Email is required to receive your validation report.",
      details,
    };
  }

  if (
    lower.includes("validation input is missing an idea") ||
    lower.includes("missing an idea")
  ) {
    return {
      status: 400,
      code: "invalid_input",
      error: "Validation input is missing an idea.",
      details,
    };
  }

  if (
    lower.includes("no ai validation provider is configured") ||
    lower.includes("ai validation is not configured") ||
    lower.includes("openai_api_key is missing") ||
    lower.includes("anthropic_api_key is missing") ||
    lower.includes("perplexity_api_key is missing")
  ) {
    return {
      status: 503,
      code: "provider_not_configured",
      error: "AI validation provider is not configured.",
      details,
    };
  }

  if (lower.includes("all ai providers failed for business validation analysis")) {
    const tail =
      details
        .split("All AI providers failed for business validation analysis.")[1]
        ?.trim() ?? "";

    const providerFailures = tail
      ? tail
          .split(" | ")
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined;

    return {
      status: 502,
      code: "ai_validation_failed",
      error: "All AI validation providers failed.",
      details,
      providerFailures,
    };
  }

  if (
    lower.includes("request failed with status 401") ||
    lower.includes("request failed with status 403") ||
    lower.includes("incorrect api key provided") ||
    lower.includes("invalid_api_key")
  ) {
    return {
      status: 502,
      code: "provider_auth_error",
      error: "AI provider authentication failed.",
      details,
    };
  }

  if (
    lower.includes("provider returned malformed json") ||
    lower.includes("expected ',' or ']' after array element in json") ||
    lower.includes("missing or invalid object") ||
    lower.includes("missing or invalid string") ||
    lower.includes("missing or invalid number") ||
    lower.includes("missing or invalid array") ||
    lower.includes("missing a valid finalverdict") ||
    lower.includes("missing frameworkreport.weightedscore") ||
    lower.includes("missing frameworkreport.decision") ||
    lower.includes("missing aipillardata") ||
    lower.includes("must include at least 3 pillars")
  ) {
    return {
      status: 502,
      code: "invalid_ai_response",
      error: "AI provider returned malformed or incomplete validation output.",
      details,
    };
  }

  return {
    status: 500,
    code: "internal_error",
    error: "Internal server error.",
    details,
  };
}

function buildFallbackReport(args: {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
}): ReportPayload {
  const generatedAt = new Date().toISOString();

  const nextSteps = Array.isArray(args.result.nextActions)
    ? args.result.nextActions
    : [];

  const text = [
    "BizSproutAI Validation Report",
    "============================",
    `Generated: ${generatedAt}`,
    `Locale: ${args.locale}`,
    `Email: ${args.email ?? "not provided"}`,
    "",
    "Submitted Idea",
    "--------------",
    args.idea,
    "",
    "Summary",
    "-------",
    args.result.summary?.oneLiner ?? "Validation completed.",
    "",
    "Next Steps",
    "----------",
    ...(nextSteps.length ? nextSteps : ["No next steps returned."]).map(
      (item) => `- ${item}`
    ),
    "",
    "Generated by BizSproutAI",
  ].join("\n");

  return {
    filename: "bizsproutai-validation-report.txt",
    generatedAt,
    text,
    pdf: null,
    pdfError: "Primary report builder failed. Returned fallback text report.",
  };
}

async function buildReportArtifacts(args: {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
  requestId: string;
}): Promise<ReportArtifacts> {
  let textDocument: ReportArtifacts["textDocument"] = null;
  let pdfDocument: ReportArtifacts["pdfDocument"] = null;

  let report = buildFallbackReport({
    idea: args.idea,
    email: args.email,
    locale: args.locale,
    result: args.result,
  });

  try {
    const reportModule = await import("@/lib/report/validationReport");
    const document = reportModule.buildValidationReportDocument({
      idea: args.idea,
      email: args.email,
      locale: args.locale,
      result: args.result,
    });

    textDocument = document;

    report = {
      filename: document.filename,
      generatedAt: document.generatedAt,
      text: document.text,
      pdf: null,
      pdfError: null,
    };
  } catch (error) {
    console.error(
      `[api/validate][${args.requestId}] text report generation failed`,
      error
    );
  }

  try {
    const pdfModule = await import("@/lib/report/validationReportPdf");
    const pdf = await pdfModule.buildValidationReportPdf({
      idea: args.idea,
      email: args.email,
      locale: args.locale,
      result: args.result,
      generatedAt: report.generatedAt,
    });

    pdfDocument = pdf;

    report.pdf = {
      filename: pdf.filename,
      mimeType: "application/pdf",
      contentBase64: Buffer.from(pdf.bytes).toString("base64"),
      sizeBytes: pdf.bytes.byteLength,
    };
    report.pdfError = null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build PDF report.";

    console.error(
      `[api/validate][${args.requestId}] pdf report generation failed`,
      error
    );

    report.pdf = null;
    report.pdfError = message;
  }

  return {
    report,
    textDocument,
    pdfDocument,
  };
}

function normalizeEmailResult(value: unknown): EmailDeliveryStatus {
  if (!isObject(value)) {
    return {
      attempted: true,
      enabled: true,
      sentToUser: true,
      sentToOwner: false,
      errors: [],
    };
  }

  const errors = Array.isArray(value.errors)
    ? value.errors.filter((item): item is string => typeof item === "string")
    : [];

  const sentToUser =
    typeof value.sentToUser === "boolean"
      ? value.sentToUser
      : typeof value.userSent === "boolean"
        ? value.userSent
        : typeof value.sent === "boolean"
          ? value.sent
          : true;

  const sentToOwner =
    typeof value.sentToOwner === "boolean"
      ? value.sentToOwner
      : typeof value.ownerSent === "boolean"
        ? value.ownerSent
        : false;

  const attempted =
    typeof value.attempted === "boolean" ? value.attempted : true;

  const enabled = typeof value.enabled === "boolean" ? value.enabled : true;

  return {
    attempted,
    enabled,
    sentToUser,
    sentToOwner,
    errors,
  };
}

async function persistLead(args: {
  requestId: string;
  email: string;
  input: ValidationInput;
  result: DynamicValidationResult;
  report: ReportPayload;
}): Promise<PersistStatus> {
  try {
    const mod = await import("@/src/leads/server/validationLeadsDb");
    const saveValidationLead = (mod as Record<string, unknown>).saveValidationLead;

    if (typeof saveValidationLead !== "function") {
      throw new Error("saveValidationLead export was not found.");
    }

    await (saveValidationLead as (payload: unknown) => Promise<unknown>)({
      requestId: args.requestId,
      email: args.email,
      locale: args.input.locale ?? "en",
      idea: args.input.idea,
      input: args.input,
      result: args.result,
      report: args.report,
      source: "bizsproutai-validation",
      createdAt: new Date().toISOString(),
    });

    return {
      saved: true,
      eventId: args.requestId,
      error: null,
    };
  } catch (error) {
    return {
      saved: false,
      eventId: null,
      error: error instanceof Error ? error.message : "Failed to save lead.",
    };
  }
}

async function persistValidationRun(args: {
  requestId: string;
  email: string;
  input: ValidationInput;
  result: DynamicValidationResult;
  report: ReportPayload;
}): Promise<ValidationRunStatus> {
  try {
    const mod = await import("@/src/validation/server/validationRunsDb");
    const saveBusinessValidationRun = (mod as Record<string, unknown>)
      .saveBusinessValidationRun;

    if (typeof saveBusinessValidationRun !== "function") {
      throw new Error("saveBusinessValidationRun export was not found.");
    }

    await (saveBusinessValidationRun as (payload: unknown) => Promise<unknown>)({
      requestId: args.requestId,
      email: args.email,
      locale: args.input.locale ?? "en",
      input: args.input,
      result: args.result,
      report: args.report,
      createdAt: new Date().toISOString(),
    });

    return {
      saved: true,
      runId: args.requestId,
      error: null,
    };
  } catch (error) {
    return {
      saved: false,
      runId: null,
      error:
        error instanceof Error ? error.message : "Failed to save validation run.",
    };
  }
}

async function deliverEmails(args: {
  requestId: string;
  email: string;
  input: ValidationInput;
  result: DynamicValidationResult;
  report: ReportPayload;
  textDocument: ReportArtifacts["textDocument"];
  pdfDocument: ReportArtifacts["pdfDocument"];
}): Promise<EmailDeliveryStatus> {
  try {
    const mod = await import("@/lib/email/ionos");
    const sendValidationEmails = (mod as Record<string, unknown>)
      .sendValidationEmails;

    if (typeof sendValidationEmails !== "function") {
      throw new Error("sendValidationEmails export was not found.");
    }

    const emailResult = await (sendValidationEmails as (
      payload: unknown
    ) => Promise<unknown>)({
      requestId: args.requestId,
      email: args.email,
      to: args.email,
      locale: args.input.locale ?? "en",
      idea: args.input.idea,
      input: args.input,
      result: args.result,
      report: args.report,
      reportText: args.textDocument?.text ?? args.report.text,
      reportFilename: args.textDocument?.filename ?? args.report.filename,
      pdfFilename: args.pdfDocument?.filename ?? args.report.pdf?.filename,
      pdfBytes: args.pdfDocument?.bytes ?? null,
      pdfBuffer: args.pdfDocument ? Buffer.from(args.pdfDocument.bytes) : null,
      attachments: args.pdfDocument
        ? [
            {
              filename: args.pdfDocument.filename,
              content: Buffer.from(args.pdfDocument.bytes),
              contentType: "application/pdf",
            },
          ]
        : [],
    });

    return normalizeEmailResult(emailResult);
  } catch (error) {
    return {
      attempted: true,
      enabled: true,
      sentToUser: false,
      sentToOwner: false,
      errors: [error instanceof Error ? error.message : "Email delivery failed."],
    };
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      Allow: "POST, OPTIONS",
    },
  });
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId();

  try {
    console.log(`[api/validate][${requestId}] POST handler reached`);

    let body: unknown;

    try {
      body = await request.json();
    } catch (error) {
      console.error(`[api/validate][${requestId}] invalid json body`, error);

      return sendJson(
        {
          ok: false,
          requestId,
          code: "invalid_json",
          error: "Request body must be valid JSON.",
        },
        400,
        requestId
      );
    }

    const { email, website, input } = parseValidationPayload(body);

    console.log(`[api/validate][${requestId}] normalized input`, {
      email,
      locale: input.locale,
      ideaPreview: input.idea?.slice(0, 120),
      honeypotFilled: Boolean(website),
    });

    if (website) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: "invalid_request",
          error: "Invalid request.",
        },
        400,
        requestId
      );
    }

    if (!email) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: "missing_email",
          error: "Email is required to receive your validation report.",
        },
        400,
        requestId
      );
    }

    if (!isValidEmail(email)) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: "invalid_email",
          error: "Please provide a valid email address.",
        },
        400,
        requestId
      );
    }

    if (!input.idea?.trim()) {
      return sendJson(
        {
          ok: false,
          requestId,
          code: "invalid_input",
          error: "Validation input is missing an idea.",
        },
        400,
        requestId
      );
    }

    const pipelineModule = await import("@/src/validation/engine/pipeline");
    const runBusinessValidationPipeline =
      pipelineModule.runBusinessValidationPipeline;

    if (typeof runBusinessValidationPipeline !== "function") {
      throw new Error("runBusinessValidationPipeline export was not found.");
    }

    const result = (await runBusinessValidationPipeline(
      input
    )) as DynamicValidationResult;

    const artifacts = await buildReportArtifacts({
      idea: input.idea,
      email,
      locale: input.locale ?? "en",
      result,
      requestId,
    });

    const [leadCapture, validationRun, emailDelivery] = await Promise.all([
      persistLead({
        requestId,
        email,
        input,
        result,
        report: artifacts.report,
      }),
      persistValidationRun({
        requestId,
        email,
        input,
        result,
        report: artifacts.report,
      }),
      deliverEmails({
        requestId,
        email,
        input,
        result,
        report: artifacts.report,
        textDocument: artifacts.textDocument,
        pdfDocument: artifacts.pdfDocument,
      }),
    ]);

    const response: ValidateSuccessResponse = {
      ok: true,
      requestId,
      email,
      report: artifacts.report,
      emailDelivery,
      leadCapture,
      validationRun,
      ...result,
    };

    return sendJson(response, 200, requestId);
  } catch (error) {
    console.error(`[api/validate][${requestId}] caught error`, error);

    const message =
      error instanceof Error ? error.message : "Unknown validation error";

    const classified = classifyValidationError(message);

    return sendJson(
      {
        ok: false,
        requestId,
        code: classified.code,
        error: classified.error,
        details: classified.details,
        providerFailures: classified.providerFailures,
      },
      classified.status,
      requestId
    );
  }
}
