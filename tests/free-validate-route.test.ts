import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// ─── Module mocks ─────────────────────────────────────────────────────────────

const supabaseUpsertMock = vi.fn();
const supabaseUpdateMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      upsert: () => ({
        select: () => ({
          single: supabaseUpsertMock,
        }),
      }),
      update: () => ({
        eq: supabaseUpdateMock,
      }),
    }),
  }),
}));

const sendOwnerNotificationMock = vi.fn();
vi.mock("@/lib/email/resendNotification", () => ({
  sendOwnerNotification: sendOwnerNotificationMock,
}));

const sendFreeValidationResultEmailMock = vi.fn();
vi.mock("@/lib/email/freeValidationEmail", () => ({
  sendFreeValidationResultEmail: sendFreeValidationResultEmailMock,
}));

// Re-use existing rate limiter and security utils — mock them for test isolation
vi.mock("@/src/security/rateLimit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9, retryAfterSeconds: 0 }),
}));

vi.mock("@/src/security/requestIdentity", () => ({
  resolveClientIp: vi.fn().mockReturnValue("1.2.3.4"),
  buildRateLimitIdentity: vi.fn().mockReturnValue("free-validate:1.2.3.4"),
}));

vi.mock("@/src/security/payloadGuard", () => ({
  guardPayloadSize: vi.fn().mockImplementation(async (req: NextRequest) => {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 32768) {
      return { ok: false, code: "payload_too_large", message: "Request body exceeds maximum allowed size.", status: 413 };
    }
    try {
      const body = await req.json();
      return { ok: true, body };
    } catch {
      return { ok: false, code: "invalid_json", message: "Request body must be valid JSON.", status: 400 };
    }
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRequest(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/free-validate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...headers },
  });
}

const VALID_FULL_BODY = {
  email: "founder@example.com",
  firstName: "Alex",
  locale: "en",
  stageIndex: 1,
  idea: "A freelance bookkeeping service for small business owners",
  audience: "solopreneurs",
  hasLiveAsset: false,
  hasTraction: false,
};

async function loadRoute() {
  const { POST } = await import("../app/api/free-validate/route");
  return { POST };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetModules();
  supabaseUpsertMock.mockReset();
  supabaseUpdateMock.mockReset();
  sendOwnerNotificationMock.mockReset();
  sendFreeValidationResultEmailMock.mockReset();

  // Delete dedup store to prevent cross-test bleed
  delete (globalThis as Record<string, unknown>)["__bizsprFreeValidateDedupMap"];
  delete (globalThis as Record<string, unknown>)["__bizsprRateLimitBuckets"];
  delete (globalThis as Record<string, unknown>)["__bizsprRateLimitWarned"];

  // Default happy-path mocks
  supabaseUpsertMock.mockResolvedValue({ data: { id: "lead-123" }, error: null });
  supabaseUpdateMock.mockResolvedValue({ error: null });
  sendOwnerNotificationMock.mockResolvedValue({ sent: true, error: null });
  sendFreeValidationResultEmailMock.mockResolvedValue({ sent: true, error: null });

  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
});

// ─── Input validation ─────────────────────────────────────────────────────────

describe("input validation", () => {
  it("rejects missing email", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, email: undefined }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("missing_email");
  });

  it("rejects invalid email", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, email: "not-an-email" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("invalid_email");
  });

  it("rejects email with header-injection characters", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, email: "founder@test.com\nbcc:evil@test.com" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("invalid_email");
  });

  it("rejects stageIndex below 0", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: -1 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("invalid_stage");
  });

  it("rejects stageIndex above 3", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: 4 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("invalid_stage");
  });

  it("rejects non-integer stageIndex", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: 1.5 }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("invalid_stage");
  });

  it("rejects idea shorter than 10 characters", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, idea: "short" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe("idea_too_short");
  });

  it("rejects string 'true' for hasLiveAsset (must be boolean)", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, hasLiveAsset: "true" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("invalid_field");
  });

  it("rejects null for hasTraction (must be boolean)", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, hasTraction: null }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("invalid_field");
  });

  it("rejects oversized payload", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest(VALID_FULL_BODY, { "content-length": "70000" }));
    expect(res.status).toBe(413);
  });
});

// ─── Partial lead ─────────────────────────────────────────────────────────────

describe("partial lead (email only)", () => {
  it("saves partial lead and returns ok without result", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ email: "partial@example.com", firstName: "Sam", locale: "en" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.partial).toBe(true);
    expect(body.result).toBeUndefined();
    expect(body.requestId).toBeTruthy();
  });

  it("fires owner notification for partial lead", async () => {
    const { POST } = await loadRoute();
    await POST(buildRequest({ email: "partial@example.com" }));
    // Allow microtask queue to flush
    await new Promise((r) => setTimeout(r, 10));
    expect(sendOwnerNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "partial@example.com", completed: false })
    );
  });
});

// ─── Full validation ──────────────────────────────────────────────────────────

describe("full validation", () => {
  it("returns structured result with all required fields", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest(VALID_FULL_BODY));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.result).toBeDefined();
    expect(body.result.stage).toBeTruthy();
    expect(body.result.verdict).toBeTruthy();
    expect(body.result.firstAsset).toBeTruthy();
    expect(body.result.firstAssetReason).toBeTruthy();
    expect(body.result.nextSteps).toHaveLength(4);
    expect(body.result.warning).toBeTruthy();
  });

  it("includes requestId and X-Request-Id header", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest(VALID_FULL_BODY));
    const body = await res.json();
    expect(body.requestId).toBeTruthy();
    expect(res.headers.get("X-Request-Id")).toBe(body.requestId);
  });

  it("reports leadSaved:true when DB succeeds", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest(VALID_FULL_BODY));
    const body = await res.json();
    expect(body.leadSaved).toBe(true);
  });

  it("reports leadSaved:false when DB fails but still returns result", async () => {
    supabaseUpsertMock.mockResolvedValue({ data: null, error: { message: "DB down" } });
    const { POST } = await loadRoute();
    const res = await POST(buildRequest(VALID_FULL_BODY));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.result).toBeDefined();
    expect(body.leadSaved).toBe(false);
  });

  it("includes notificationStatus with owner and email fields", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest(VALID_FULL_BODY));
    const body = await res.json();
    expect(body.notificationStatus).toBeDefined();
    expect(typeof body.notificationStatus.ownerNotified).toBe("boolean");
    expect(typeof body.notificationStatus.resultEmailSent).toBe("boolean");
  });

  it("result still returned when notification fails", async () => {
    sendOwnerNotificationMock.mockResolvedValue({ sent: false, error: "Resend error" });
    sendFreeValidationResultEmailMock.mockResolvedValue({ sent: false, error: "SMTP error" });
    const { POST } = await loadRoute();
    const res = await POST(buildRequest(VALID_FULL_BODY));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.result).toBeDefined();
    expect(body.notificationStatus.ownerNotified).toBe(false);
    expect(body.notificationStatus.resultEmailSent).toBe(false);
    expect(body.notificationStatus.ownerError).toBe("Resend error");
  });

  it("fires owner notification for completed validation", async () => {
    const { POST } = await loadRoute();
    await POST(buildRequest(VALID_FULL_BODY));
    expect(sendOwnerNotificationMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: "founder@example.com", completed: true })
    );
  });

  it("fires result email to submitter", async () => {
    const { POST } = await loadRoute();
    await POST(buildRequest(VALID_FULL_BODY));
    expect(sendFreeValidationResultEmailMock).toHaveBeenCalledWith(
      "founder@example.com",
      "Alex",
      "en",
      expect.objectContaining({ stage: expect.any(String) })
    );
  });
});

// ─── Scenario: each stage produces correct, controlled result ─────────────────

describe("stage scenarios — server computes correct framework-based result", () => {
  it("stage 0 (vague idea): Idea Stage, warns against building", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: 0, idea: "I want to start something but have no idea what it is yet" }));
    const body = await res.json();
    expect(body.result.stage).toBe("Idea Stage");
    expect(body.result.warning).toMatch(/build/i);
  });

  it("stage 1 (service business): First Asset Stage, asset is predefined", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: 1, idea: "consulting and coaching for early-stage startup founders" }));
    const body = await res.json();
    expect(body.result.stage).toBe("First Asset Stage");
    expect(body.result.firstAsset.length).toBeGreaterThan(0);
  });

  it("stage 2 + marketplace idea: detects marketplace asset", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: 2, idea: "platform to connect buyers and sellers of handmade crafts" }));
    const body = await res.json();
    expect(body.result.firstAsset).toBe("Marketplace web app");
  });

  it("stage 1 + software: detects SaaS asset", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: 1, idea: "SaaS tool with user accounts and dashboard for team management" }));
    const body = await res.json();
    expect(body.result.firstAsset).toBe("Web app (SaaS)");
  });

  it("stage 2 + live asset: Optimization Stage", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: 2, hasLiveAsset: true, hasTraction: false }));
    const body = await res.json();
    expect(body.result.stage).toBe("Optimization Stage");
  });

  it("stage 3 + live + traction: Launch + Scale Stage", async () => {
    const { POST } = await loadRoute();
    const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: 3, hasLiveAsset: true, hasTraction: true }));
    const body = await res.json();
    expect(body.result.stage).toBe("Launch + Scale Stage");
  });
});

// ─── Rate limiting ────────────────────────────────────────────────────────────

describe("rate limiting", () => {
  it("returns 429 when rate limit exceeded", async () => {
    const { checkRateLimit } = await import("@/src/security/rateLimit");
    vi.mocked(checkRateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfterSeconds: 45 });
    const { POST } = await loadRoute();
    const res = await POST(buildRequest(VALID_FULL_BODY));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.code).toBe("rate_limited");
    expect(res.headers.get("Retry-After")).toBe("45");
  });
});

// ─── Deduplication ────────────────────────────────────────────────────────────

describe("deduplication", () => {
  it("returns cached result on duplicate requestId without re-running DB or email", async () => {
    const { POST } = await loadRoute();
    const reqId = "11111111-1111-1111-1111-111111111111";

    // First call
    const res1 = await POST(buildRequest({ ...VALID_FULL_BODY, requestId: reqId }));
    const body1 = await res1.json();
    expect(body1.ok).toBe(true);

    // Reset mocks to detect any second-call activity
    supabaseUpsertMock.mockClear();
    sendOwnerNotificationMock.mockClear();

    // Duplicate call
    const res2 = await POST(buildRequest({ ...VALID_FULL_BODY, requestId: reqId }));
    const body2 = await res2.json();

    expect(body2.ok).toBe(true);
    expect(body2.deduplicated).toBe(true);
    expect(body2.result.stage).toBe(body1.result.stage);
    expect(supabaseUpsertMock).not.toHaveBeenCalled();
    expect(sendOwnerNotificationMock).not.toHaveBeenCalled();
  });
});

// ─── Free result is generic and controlled ────────────────────────────────────

describe("result is generic and controlled", () => {
  const KNOWN_STAGES = new Set([
    "Idea Stage",
    "First Asset Stage",
    "Assembly Stage",
    "Optimization Stage",
    "Launch-Ready Stage",
    "Launch + Scale Stage",
  ]);

  const KNOWN_ASSETS = new Set([
    "Booking page",
    "Mobile app",
    "Marketplace web app",
    "Web app (SaaS)",
    "Web app",
    "Lead funnel",
    "E-commerce store",
    "Simple landing page (offer test)",
    "Landing page or booking page",
    "Unified website or funnel",
    "Full launch system",
  ]);

  const ideas = [
    "dog walking service for busy professionals",
    "SaaS platform with dashboard and user accounts",
    "marketplace connecting tutors with students",
    "mobile app for construction site inspectors",
    "online coaching program for new parents",
  ];

  for (const idea of ideas) {
    it(`result for "${idea.slice(0, 40)}…" uses only known stages and assets`, async () => {
      const { POST } = await loadRoute();
      for (let stage = 0; stage <= 3; stage++) {
        const res = await POST(buildRequest({ ...VALID_FULL_BODY, stageIndex: stage, idea }));
        const body = await res.json();
        expect(KNOWN_STAGES.has(body.result.stage)).toBe(true);
        expect(KNOWN_ASSETS.has(body.result.firstAsset)).toBe(true);
        expect(body.result.nextSteps).toHaveLength(4);
      }
    });
  }
});
