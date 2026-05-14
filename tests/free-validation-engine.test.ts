import { describe, it, expect } from "vitest";
import { computeValidationResult } from "@/lib/validation/engine";

// Helpers
function compute(
  stageIndex: number,
  idea: string,
  audience = "",
  hasLiveAsset = false,
  hasTraction = false
) {
  return computeValidationResult(stageIndex, idea, audience, hasLiveAsset, hasTraction);
}

// ─── Stage correctness ────────────────────────────────────────────────────────

describe("stage assignment", () => {
  it("stage 0 → Idea Stage", () => {
    const r = compute(0, "I want to help people with their problems");
    expect(r.stage).toBe("Idea Stage");
    expect(r.stageTag).toBe("Idea Stage");
  });

  it("stage 1 → First Asset Stage", () => {
    const r = compute(1, "Offer coaching for new entrepreneurs");
    expect(r.stage).toBe("First Asset Stage");
    expect(r.stageTag).toBe("First Asset Stage");
  });

  it("stage 2 without live asset → Assembly Stage", () => {
    const r = compute(2, "I have pieces but nothing connected", "", false, false);
    expect(r.stage).toBe("Assembly Stage");
  });

  it("stage 2 with live asset → Optimization Stage", () => {
    const r = compute(2, "I have a site and some social media", "", true, false);
    expect(r.stage).toBe("Optimization Stage");
  });

  it("stage 3 without traction → Launch-Ready Stage", () => {
    const r = compute(3, "Ready to launch my offer", "", true, false);
    expect(r.stage).toBe("Launch-Ready Stage");
  });

  it("stage 3 with traction → Launch + Scale Stage", () => {
    const r = compute(3, "I already have paying clients", "", true, true);
    expect(r.stage).toBe("Launch + Scale Stage");
  });

  it("out-of-range stageIndex falls back to stage 0", () => {
    const r = compute(99, "some idea");
    expect(r.stage).toBe("Idea Stage");
  });

  it("negative stageIndex falls back to Idea Stage", () => {
    const r = compute(-1, "some idea");
    expect(r.stage).toBe("Idea Stage");
  });

  it("null stageIndex falls back to Idea Stage", () => {
    const r = compute(null as unknown as number, "some idea");
    expect(r.stage).toBe("Idea Stage");
  });

  it("undefined stageIndex falls back to Idea Stage", () => {
    const r = compute(undefined as unknown as number, "some idea");
    expect(r.stage).toBe("Idea Stage");
  });
});

// ─── Verdict correctness ──────────────────────────────────────────────────────

describe("verdict correctness", () => {
  it("stage 0 verdict: too early to build", () => {
    const r = compute(0, "vague idea with no direction");
    expect(r.verdict).toMatch(/too early to build/i);
  });

  it("stage 1 verdict: clear enough to launch", () => {
    const r = compute(1, "bookkeeping service for freelancers");
    expect(r.verdict).toMatch(/clear enough to launch/i);
  });

  it("stage 2 with live asset verdict: connect them", () => {
    const r = compute(2, "website and instagram but scattered", "", true, false);
    expect(r.verdict).toMatch(/connect/i);
  });

  it("stage 3 with traction verdict: build systems to scale", () => {
    const r = compute(3, "getting clients consistently now", "", true, true);
    expect(r.verdict).toMatch(/systems to scale/i);
  });
});

// ─── Result structure ─────────────────────────────────────────────────────────

describe("result structure", () => {
  it("always returns exactly 4 next steps", () => {
    for (let i = 0; i <= 3; i++) {
      const r = compute(i, "test idea with enough words here");
      expect(r.nextSteps).toHaveLength(4);
    }
  });

  it("always returns a non-empty warning", () => {
    for (let i = 0; i <= 3; i++) {
      const r = compute(i, "test idea with enough words here");
      expect(r.warning.length).toBeGreaterThan(20);
    }
  });

  it("always returns firstAsset and firstAssetReason", () => {
    for (let i = 0; i <= 3; i++) {
      const r = compute(i, "service business for local clients");
      expect(r.firstAsset.length).toBeGreaterThan(0);
      expect(r.firstAssetReason.length).toBeGreaterThan(0);
    }
  });
});

// ─── First asset detection — framework-based, not custom ─────────────────────

describe("first asset detection", () => {
  it("booking-related idea → Booking page", () => {
    const r = compute(1, "appointment scheduling for therapy practices", "therapists");
    expect(r.firstAsset).toBe("Booking page");
  });

  it("mobile app idea → Mobile app", () => {
    const r = compute(1, "mobile app for field workers to track their hours");
    expect(r.firstAsset).toBe("Mobile app");
  });

  it("marketplace idea → Marketplace interest page", () => {
    const r = compute(2, "marketplace to connect buyers and sellers of handmade goods");
    expect(r.firstAsset).toBe("Marketplace interest page");
  });

  it("SaaS / dashboard idea → Web app (SaaS)", () => {
    const r = compute(1, "SaaS dashboard for team project management with user accounts");
    expect(r.firstAsset).toBe("Web app (SaaS)");
  });

  it("generic software idea → Web app", () => {
    // No SaaS/dashboard/login keywords — matches the generic app/portal pattern
    const r = compute(1, "a portal for tracking client projects and managing deliverables");
    expect(r.firstAsset).toBe("Web app");
  });

  it("e-commerce idea → Preorder product page", () => {
    const r = compute(1, "online store selling handmade candles and physical products");
    expect(r.firstAsset).toBe("Preorder product page");
  });

  it("funnel / lead magnet idea → Lead funnel", () => {
    const r = compute(1, "free guide and email sequence opt-in to nurture leads");
    expect(r.firstAsset).toBe("Lead funnel");
  });

  it("vague early-stage idea → stage-appropriate fallback", () => {
    const r = compute(0, "I want to help people with their problems somehow");
    // Stage 0 fallback is index 0 of the fallbacks array
    expect(r.firstAsset).toBe("Simple landing page (offer test)");
  });

  it("service business without keywords → landing page fallback", () => {
    const r = compute(1, "consulting service for small business owners");
    expect(r.firstAsset).toBe("Landing page or booking page");
  });

  it("first asset is always one of the predefined options — never custom text", () => {
    const knownAssets = new Set([
      "Booking page",
      "Mobile app",
      "Marketplace interest page",
      "Web app (SaaS)",
      "Web app",
      "Lead funnel",
      "Preorder product page",
      "Simple landing page (offer test)",
      "Landing page or booking page",
      "Unified website or funnel",
      "Full launch system",
      // Override values (triggered by specific idea signals, not in the ideas array below)
      "Idea clarity test",
      "Workflow clarity test",
      "SaaS demo page",
      "Service booking page",
      "Service consultation page",
      "Marketplace interest page",
      "Preorder product page",
      "App waitlist page",
      "Workshop signup page",
      "Template landing page",
      "Community resource page",
      "Wellness service page",
      "Wellness challenge page",
      "Real estate lead-capture page",
      "Buyer readiness page",
    ]);

    const ideas = [
      "I sell dog walking services",
      "accounting platform with dashboards",
      "marketplace for gig workers",
      "mobile app for delivery drivers",
      "coaching business for founders",
      "physical product selling online",
      "free email course to build a list",
    ];

    for (let stage = 0; stage <= 3; stage++) {
      for (const idea of ideas) {
        const r = compute(stage, idea);
        expect(knownAssets.has(r.firstAsset)).toBe(true);
      }
    }
  });
});

// ─── Scenario coverage ────────────────────────────────────────────────────────

describe("scenario coverage", () => {
  it("vague early-stage idea: stage 0, generic first asset, 4 steps", () => {
    const r = compute(0, "I want to start some kind of business but not sure what");
    expect(r.stage).toBe("Idea Stage");
    expect(r.nextSteps).toHaveLength(4);
    expect(r.verdict).toBeTruthy();
  });

  it("service business: stage 1, recommend asset, actionable steps", () => {
    const r = compute(1, "freelance bookkeeping and accounting for small business owners", "solopreneurs");
    expect(r.stage).toBe("First Asset Stage");
    expect(r.firstAsset.length).toBeGreaterThan(0);
    expect(r.nextSteps[0]).toContain("asset");
  });

  it("marketplace idea: stage 2 assembled, marketplace pilot page detected", () => {
    const r = compute(2, "two-sided gig platform connecting freelance photographers with clients", "businesses");
    expect(r.firstAsset).toBe("Marketplace interest page");
    expect(r.stage).toMatch(/Assembly Stage|Optimization Stage/);
  });

  it("software app idea: stage 1, web app asset", () => {
    const r = compute(1, "project management platform with user accounts and team dashboards");
    expect(r.firstAsset).toMatch(/Web app/);
  });

  it("something live without traction: stage 2 + live asset → Optimization", () => {
    const r = compute(2, "I have a landing page and social accounts", "", true, false);
    expect(r.stage).toBe("Optimization Stage");
    expect(r.verdict).toMatch(/connect/i);
  });

  it("something live with traction: stage 3 + both flags → Launch + Scale", () => {
    const r = compute(3, "clients are booking and paying every week", "", true, true);
    expect(r.stage).toBe("Launch + Scale Stage");
    expect(r.verdict).toMatch(/scale/i);
    expect(r.nextSteps[0]).toMatch(/document|working/i);
  });
});

// ─── All-in-one platform regression ──────────────────────────────────────────

describe("All-in-one platform regression — computeValidationResult", () => {
  const PROMPT =
    "I want to build an all-in-one platform that helps entrepreneurs with marketing, sales, branding, websites, content, and customer management.";

  it("firstAsset is 'Workflow clarity test', not 'Web app'", () => {
    const r = compute(0, PROMPT);
    expect(r.firstAsset).toBe("Workflow clarity test");
    expect(r.firstAsset).not.toBe("Web app");
  });

  it("domainLabel does not say 'web app'", () => {
    const r = compute(0, PROMPT);
    expect(r.domainLabel).not.toMatch(/web app/i);
  });

  it("domainLabel is 'all-in-one platform idea'", () => {
    const r = compute(0, PROMPT);
    expect(r.domainLabel).toBe("all-in-one platform idea");
  });
});
