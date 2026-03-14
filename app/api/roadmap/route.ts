import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/src/roadmap";
import { buildCorsHeaders } from "@/src/security/cors";
import { buildRateLimitIdentity } from "@/src/security/requestIdentity";
import { checkRateLimit } from "@/src/security/rateLimit";
import type { SprintIntensity } from "@/src/sprint/types";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 64_000;
const MAX_IDEA_LENGTH = 1_200;
const MAX_REGION_LENGTH = 80;
const MAX_COUNTRY_LENGTH = 80;
const MAX_BUSINESS_TYPE_LENGTH = 80;
const RATE_LIMIT_REQUESTS_PER_MINUTE = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isPayloadTooLarge(request: NextRequest, maxBytes: number): boolean {
  const contentLength = Number(request.headers.get("content-length") ?? "");
  return Number.isFinite(contentLength) && contentLength > maxBytes;
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function normalizeSprintSettings(
  value: unknown
): { sprintTemplateId?: string; sprintIntensity?: SprintIntensity; onboardingCompleted?: boolean } | undefined {
  const objectValue = normalizeObject(value);
  if (!objectValue) return undefined;

  const sprintTemplateId = normalizeText(objectValue.sprintTemplateId, 80) ?? undefined;
  const sprintIntensity = ["light", "standard", "intensive"].includes(String(objectValue.sprintIntensity))
    ? (String(objectValue.sprintIntensity) as SprintIntensity)
    : undefined;
  const onboardingCompleted =
    typeof objectValue.onboardingCompleted === "boolean"
      ? objectValue.onboardingCompleted
      : undefined;

  return {
    sprintTemplateId,
    sprintIntensity,
    onboardingCompleted,
  };
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));

  if (isPayloadTooLarge(request, MAX_REQUEST_BYTES)) {
    return NextResponse.json(
      { error: `Request payload too large (max ${MAX_REQUEST_BYTES} bytes).` },
      { status: 413, headers: corsHeaders }
    );
  }

  const rate = await checkRateLimit(
    buildRateLimitIdentity("roadmap", request),
    RATE_LIMIT_REQUESTS_PER_MINUTE,
    RATE_LIMIT_WINDOW_MS
  );
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many roadmap requests. Please retry shortly." },
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

  const payload = normalizeObject(body) ?? {};
  const idea = normalizeText(payload.idea, MAX_IDEA_LENGTH);
  const country = normalizeText(payload.country, MAX_COUNTRY_LENGTH);
  const businessType = normalizeText(payload.businessType, MAX_BUSINESS_TYPE_LENGTH);
  const regionInput = normalizeText(payload.region, MAX_REGION_LENGTH);

  if (!idea || !country || !businessType) {
    return NextResponse.json(
      { error: "Missing required fields: idea, country, businessType" },
      { status: 400, headers: corsHeaders }
    );
  }

  const region = regionInput ?? country;

  if (idea.length < 10) {
    return NextResponse.json(
      { error: "Idea must be at least 10 characters." },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const roadmap = await generateRoadmap({
      idea,
      region,
      country,
      businessType,
      validationData: normalizeObject(payload.validationData),
      sprintSettings: normalizeSprintSettings(payload.sprintSettings),
    });

    return NextResponse.json({ success: true, roadmap }, { headers: corsHeaders });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  return NextResponse.json(
    {
      message: "Roadmap API - Use POST to generate a build plan",
      version: "1.0.0",
      supported_countries: ["USA", "Nigeria", "Kenya", "Haiti", "Brazil", "Mexico"],
      required_fields: ["idea", "country", "businessType"],
      optional_fields: ["sprintSettings.sprintTemplateId", "sprintSettings.sprintIntensity"],
    },
    { headers: corsHeaders }
  );
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
