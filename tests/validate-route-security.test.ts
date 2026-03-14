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
    delete (globalThis as typeof globalThis & { __bizsprRateLimitBuckets?: Map<string, unknown> }).__bizsprRateLimitBuckets;
    delete (globalThis as typeof globalThis & { __bizsprRateLimitWarned?: boolean }).__bizsprRateLimitWarned;

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
    expect(payload.error).toMatch(/Request payload too large/);
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

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid JSON body" });
  });

  it("rejects missing or invalid core input fields", async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({
        idea: "too short",
        email: "not-an-email",
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Idea must be at least 10 characters" });
  });

  it("allows blank email addresses and still returns a validation result", async () => {
    const { POST } = await loadRoute();
    const response = await POST(buildRequest(buildValidBody({ email: "   " })));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        overall_score: expect.any(Number),
      })
    );
  });

  it("rejects unicode and header-injection email variants", async () => {
    const { POST } = await loadRoute();

    const unicodeResponse = await POST(buildRequest(buildValidBody({ email: "f\u00F8under@example.com" })));
    expect(unicodeResponse.status).toBe(400);
    await expect(unicodeResponse.json()).resolves.toEqual({ error: "Invalid email format" });

    const newlineResponse = await POST(buildRequest(buildValidBody({ email: "founder@example.com\nbcc:evil@example.com" })));
    expect(newlineResponse.status).toBe(400);
    await expect(newlineResponse.json()).resolves.toEqual({ error: "Invalid email format" });
  });

  it("allows only configured origins in CORS headers", async () => {
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
    expect(response.headers.get("vary")).toBe("Origin");
  });

  it("suppresses duplicate submissions for the same email and idea", async () => {
    const { POST } = await loadRoute();

    const firstResponse = await POST(buildRequest(buildValidBody()));
    const duplicateResponse = await POST(buildRequest(buildValidBody()));

    expect(firstResponse.status).toBe(200);
    expect(duplicateResponse.status).toBe(409);
    await expect(duplicateResponse.json()).resolves.toEqual({
      error: "Duplicate validation request detected. Please wait before submitting again.",
    });
    expect(runBusinessValidationPipelineMock).toHaveBeenCalledTimes(1);
  });

  it("throttles repeated submissions for the same email even with different ideas", async () => {
    const { POST } = await loadRoute();
    let finalResponse: Response | null = null;

    for (let index = 0; index < 7; index += 1) {
      finalResponse = await POST(
        buildRequest(
          buildValidBody({
            idea: `Mobile car detailing service for busy professionals in Miami ${index}`,
          })
        )
      );
    }

    expect(finalResponse?.status).toBe(429);
    await expect(finalResponse?.json()).resolves.toEqual({
      error: "Too many validation requests for this email. Please retry later.",
    });
  });

  it("redacts emails and token-like strings from error logs", async () => {
    const { POST } = await loadRoute();
    runBusinessValidationPipelineMock.mockRejectedValueOnce(
      new Error("provider failed for founder@example.com using Bearer 0123456789abcdef0123456789abcdef")
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(buildRequest(buildValidBody()));

    expect(response.status).toBe(500);
    const logged = JSON.stringify(errorSpy.mock.calls);
    expect(logged).not.toContain("founder@example.com");
    expect(logged).not.toContain("0123456789abcdef0123456789abcdef");
    expect(logged).toContain("[redacted-email]");
    expect(logged).toContain("[redacted-token]");

    errorSpy.mockRestore();
  });
});
