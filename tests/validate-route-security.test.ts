import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const runBusinessValidationPipelineMock = vi.fn();
const sendValidationEmailsMock = vi.fn();
const saveValidationLeadMock = vi.fn();
const saveBusinessValidationRunMock = vi.fn();
const buildValidationReportDocumentMock = vi.fn();
const buildValidationReportPdfMock = vi.fn();

vi.mock("@/src/validation/engine/pipeline", () => ({
  runBusinessValidationPipeline: runBusinessValidationPipelineMock,
}));

vi.mock("@/lib/email/ionos", () => ({
  sendValidationEmails: sendValidationEmailsMock,
}));

vi.mock("@/src/leads/server/validationLeadsDb", () => ({
  saveValidationLead: saveValidationLeadMock,
}));

vi.mock("@/src/validation/server/validationRunsDb", () => ({
  saveBusinessValidationRun: saveBusinessValidationRunMock,
}));

vi.mock("@/lib/report/validationReport", () => ({
  buildValidationReportDocument: buildValidationReportDocumentMock,
}));

vi.mock("@/lib/report/validationReportPdf", () => ({
  buildValidationReportPdf: buildValidationReportPdfMock,
}));

function buildRequest(body: Record<string, unknown>, headers?: HeadersInit) {
  return new NextRequest("http://localhost/api/validate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });
}

function buildValidBody(overrides: Record<string, unknown> = {}) {
  return {
    idea: "Mobile car detailing for busy professionals in Miami",
    email: "founder@example.com",
    locale: "en",
    ...overrides,
  };
}

function buildValidationResult() {
  return {
    status: "GO",
    category: "local_service",
    businessCategory: "local_service",
    country: { code: "US", name: "United States" },
    summary: {
      oneLiner: "Strong local demand",
      topOpportunities: ["Busy professionals value convenience"],
      biggestRisks: ["Need repeat-purchase proof"],
    },
    nextActions: ["Interview five buyers"],
    strengths: ["Clear pain point"],
    weaknesses: ["Differentiation needs proof"],
    keyRisks: ["Competition is crowded"],
    assumptionsToTest: ["People will subscribe monthly"],
    recommendedNextSteps: ["Run five customer interviews"],
    researchSummary: {
      demandSignals: [],
      competitionNotes: [],
      marketTrends: [],
      monetizationNotes: [],
      acquisitionChallenges: [],
      differentiationOpportunities: [],
      riskFactors: [],
      sources: [],
    },
    scores: {
      market_demand: 72,
      monetization: 70,
      competition: 58,
      acquisition: 61,
      execution_feasibility: 80,
      differentiation: 55,
      risk: 48,
    },
    criteria: [],
    framework: { label: "General" },
    meta: { generatedAt: "2026-03-13T00:00:00.000Z" },
    overallScore: 3.8,
    overall_score: 76,
    confidenceScore: 81,
  };
}

async function loadRoute() {
  return import("../app/api/validate/route");
}

describe("validate route security controls", () => {
  beforeEach(() => {
    vi.resetModules();
    runBusinessValidationPipelineMock.mockReset();
    sendValidationEmailsMock.mockReset();
    saveValidationLeadMock.mockReset();
    saveBusinessValidationRunMock.mockReset();
    buildValidationReportDocumentMock.mockReset();
    buildValidationReportPdfMock.mockReset();
    // Reset all globalThis-based stores to prevent cross-test bleed
    const keysToDelete = [
      "__bizsprRateLimitBuckets",
      "__bizsprRateLimitWarned",
      "__bizsprAbuseTracker",
      "__bizsprEmailSendTracker",
      "__bizsprAiCostTracker",
      "__bizsprInFlightCounter",
      "__bizsprDedupMap",
    ] as const;
    for (const key of keysToDelete) {
      delete (globalThis as Record<string, unknown>)[key];
    }

    runBusinessValidationPipelineMock.mockResolvedValue(buildValidationResult());
    sendValidationEmailsMock.mockResolvedValue({
      attempted: true,
      enabled: true,
      sentToUser: true,
      sentToOwner: true,
      errors: [],
    });
    saveValidationLeadMock.mockResolvedValue({
      saved: true,
      eventId: "lead-1",
    });
    saveBusinessValidationRunMock.mockReturnValue({
      runId: "run-1",
    });
    buildValidationReportDocumentMock.mockReturnValue({
      filename: "validation-report.txt",
      generatedAt: "2026-03-13T00:00:00.000Z",
      text: "report body",
    });
    buildValidationReportPdfMock.mockResolvedValue({
      filename: "validation-report.pdf",
      bytes: new Uint8Array([1, 2, 3]),
    });
  });

  it("rejects oversized request bodies", async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      new NextRequest("http://localhost/api/validate", {
        method: "POST",
        headers: {
          "content-length": "70000",
        },
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("payload_too_large");
    expect(payload.error).toMatch(/exceeds maximum/i);
    expect(payload.requestId).toEqual(expect.any(String));
  });

  it("rejects malformed JSON", async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      new NextRequest("http://localhost/api/validate", {
        method: "POST",
        body: "{",
        headers: {
          "content-type": "application/json",
        },
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("invalid_json");
    expect(payload.error).toMatch(/valid JSON/i);
  });

  it("rejects requests with missing email", async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        idea: "Mobile car detailing for busy professionals in Miami",
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("missing_email");
  });

  it("returns a successful validation result for valid input", async () => {
    const { POST } = await loadRoute();
    const response = await POST(buildRequest(buildValidBody()));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.requestId).toEqual(expect.any(String));
    expect(payload.overall_score).toEqual(expect.any(Number));
  });

  it("rejects header-injection and malformed email variants", async () => {
    const { POST } = await loadRoute();

    const newlineResponse = await POST(buildRequest(buildValidBody({ email: "founder@example.com\nbcc:evil@example.com" })));
    expect(newlineResponse.status).toBe(400);
    const newlinePayload = await newlineResponse.json();
    expect(newlinePayload.ok).toBe(false);
    expect(newlinePayload.code).toBe("invalid_email");

    const noAtResponse = await POST(buildRequest(buildValidBody({ email: "not-an-email" })));
    expect(noAtResponse.status).toBe(400);
    const noAtPayload = await noAtResponse.json();
    expect(noAtPayload.ok).toBe(false);
    expect(noAtPayload.code).toBe("invalid_email");
  });

  it("does not include access-control-allow-origin for unauthorized origins", async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      new NextRequest("http://localhost/api/validate", {
        method: "POST",
        body: JSON.stringify({}),
        headers: {
          origin: "https://evil.example",
          "content-type": "application/json",
        },
      })
    );

    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("throttles repeated submissions via rate limiting", async () => {
    const { POST } = await loadRoute();
    let finalResponse: Response | null = null;

    for (let index = 0; index < 12; index += 1) {
      finalResponse = await POST(
        buildRequest(
          buildValidBody({
            idea: `Mobile car detailing service for busy professionals in Miami ${index}`,
          })
        )
      );
    }

    expect(finalResponse?.status).toBe(429);
    const payload = await finalResponse?.json();
    expect(payload.ok).toBe(false);
    expect(payload.code).toBe("rate_limited");
  });

  it("redacts emails and token-like strings from error logs", async () => {
    const { POST } = await loadRoute();
    runBusinessValidationPipelineMock.mockRejectedValueOnce(
      new Error("provider failed for founder@example.com using Bearer 0123456789abcdef0123456789abcdef")
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(buildRequest(buildValidBody()));

    expect(response.status).toBeGreaterThanOrEqual(400);
    const logged = JSON.stringify(errorSpy.mock.calls.map(call =>
      call.map(arg => typeof arg === "string" ? arg : JSON.stringify(arg))
    ));
    expect(logged).not.toContain("founder@example.com");
    expect(logged).not.toContain("0123456789abcdef0123456789abcdef");
    expect(logged).toContain("[redacted-email]");
    expect(logged).toContain("[redacted-token]");

    errorSpy.mockRestore();
  });

  it("includes X-Request-Id header in all responses", async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      new NextRequest("http://localhost/api/validate", {
        method: "POST",
        body: "{",
        headers: { "content-type": "application/json" },
      })
    );

    expect(response.headers.get("x-request-id")).toEqual(expect.any(String));
    expect(response.headers.get("x-request-id")!.length).toBeGreaterThan(0);
  });
});
