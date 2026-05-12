import { describe, it, expect } from "vitest";
import { buildFallbackIdeaContext, hasBroadUnclearOutcomes } from "@/lib/validation/ideaContexts";
import { computeValidationResult } from "@/lib/validation/engine";

// ─── buildFallbackIdeaContext unit tests ──────────────────────────────────────

describe("buildFallbackIdeaContext", () => {
  it("generic SaaS idea gets actionable fallback, not weak generic copy", () => {
    const ctx = buildFallbackIdeaContext(
      "A SaaS dashboard for teams to manage daily tasks and automate workflows",
      "small business teams and startups",
      "idea",
      "saas"
    );
    expect(ctx.nicheLabel).toBeNull();
    expect(ctx.nicheMistake).toBeTruthy();
    expect(ctx.nicheMistake.length).toBeGreaterThan(60);
    expect(ctx.nicheAssetReason).toMatch(/SaaS|demo|landing page|value proposition/i);
    expect(ctx.nicheSteps).toHaveLength(3);
    // Early stage — steps should focus on narrowing
    expect(ctx.nicheSteps[0]).toMatch(/sentence|target customer|specific person/i);
  });

  it("broad consumer app with 'everyone' audience gets definition-focused mistake", () => {
    const ctx = buildFallbackIdeaContext(
      "An app that helps everyone find the best local services near them",
      "everyone in the city",
      "firstAsset",
      "webApp"
    );
    expect(ctx.nicheMistake).toMatch(/everyone|targeting everyone|no one/i);
    expect(ctx.nicheAssetReason).toMatch(/landing page|call to action|promise/i);
  });

  it("idea with no audience defined gets audience-gap mistake", () => {
    const ctx = buildFallbackIdeaContext(
      "A platform that connects buyers and sellers of handmade goods",
      "",
      "idea",
      "marketplace"
    );
    expect(ctx.nicheMistake).toMatch(/customer type|specific|who/i);
    expect(ctx.audienceLabel).toBe("your target customers");
  });

  it("'busy professionals' in idea text does not trigger missing-audience warning", () => {
    const ctx = buildFallbackIdeaContext(
      "A service for busy professionals in Miami who need mobile car detailing",
      "",
      "idea",
      "booking"
    );
    expect(ctx.nicheMistake).not.toMatch(/customer type|not named|unnamed/i);
  });

  it("service business gets service-page asset reason", () => {
    const ctx = buildFallbackIdeaContext(
      "I offer consulting services to help businesses improve their marketing strategy",
      "marketing managers at SMBs",
      "firstAsset",
      "booking"
    );
    expect(ctx.nicheAssetReason).toMatch(/booking|scheduling|calendar|appointment/i);
    expect(ctx.nicheMistake).toBeTruthy();
  });

  it("ecommerce idea without niche match gets product/preorder asset reason", () => {
    const ctx = buildFallbackIdeaContext(
      "I want to sell eco-friendly cleaning products online",
      "environmentally conscious homeowners",
      "idea",
      "ecommerce"
    );
    expect(ctx.nicheAssetReason).toMatch(/product page|pre-order|purchase intent|inventory/i);
    expect(ctx.nicheSteps).toHaveLength(3);
  });

  it("all-in-one language triggers scope-warning mistake", () => {
    const ctx = buildFallbackIdeaContext(
      "A complete all-in-one solution for managing every aspect of a small business",
      "small business owners",
      "assembly",
      "saas"
    );
    expect(ctx.nicheMistake).toMatch(/all.in.one|scope|one problem|narrow/i);
  });

  it("no revenue signal triggers payment-validation mistake", () => {
    const ctx = buildFallbackIdeaContext(
      "A community platform where dog owners share tips and find local meetups",
      "dog owners in urban areas",
      "idea",
      "webApp"
    );
    expect(ctx.nicheMistake).toMatch(/pay|paid|revenue|willingness to pay/i);
  });

  it("mid-stage steps focus on channel and offer testing", () => {
    const ctx = buildFallbackIdeaContext(
      "A scheduling tool for freelance designers",
      "freelance graphic designers",
      "assembly",
      "webApp"
    );
    // assembly → mid group
    expect(ctx.nicheSteps[1]).toMatch(/channel|outreach|platform/i);
    expect(ctx.nicheSteps[2]).toMatch(/offer|CTA|payment|commitment/i);
  });

  it("late-stage steps focus on conversion, proof, and follow-up", () => {
    const ctx = buildFallbackIdeaContext(
      "A project management tool for independent contractors",
      "independent contractors",
      "launchReady",
      "saas"
    );
    // launchReady → late group
    expect(ctx.nicheSteps[0]).toMatch(/funnel|drop.off|conversion/i);
    expect(ctx.nicheSteps[1]).toMatch(/testimonial|proof/i);
    expect(ctx.nicheSteps[2]).toMatch(/follow.up|re.engag|warm lead/i);
  });
});

// ─── Engine integration — fallback fires when no niche matches ────────────────

describe("computeValidationResult — fallback context integration", () => {
  it("generic SaaS idea gets ideaContext even without a niche match", () => {
    const r = computeValidationResult(
      0,
      "A SaaS dashboard for teams to manage daily tasks and automate workflows",
      "small business teams",
      false,
      false
    );
    expect(r.ideaContext).not.toBeNull();
    expect(r.ideaContext!.nicheLabel).toBeNull();
    expect(r.ideaContext!.nicheMistake).toBeTruthy();
    expect(r.ideaContext!.nicheSteps).toHaveLength(3);
    // nicheLabel null → convenience field is also null
    expect(r.nicheLabel).toBeNull();
    // nicheSteps still populated from fallback
    expect(r.nicheSteps).not.toBeNull();
    expect(r.nicheSteps).toHaveLength(3);
  });

  it("broad consumer app has ideaContext with audience-focused mistake", () => {
    const r = computeValidationResult(
      1,
      "An app that helps anyone discover events near them",
      "",
      false,
      false
    );
    expect(r.ideaContext).not.toBeNull();
    expect(r.ideaContext!.nicheMistake).toMatch(/customer type|specific/i);
  });
});

// ─── Broad/unclear idea regression — "platform that helps people improve their lives" ──

describe("Broad unclear idea regression — all-in-one life improvement platform", () => {
  const PROMPT =
    "I want to build a platform that helps people improve their lives, make money, " +
    "stay motivated, and become successful using AI.";

  it("hasBroadUnclearOutcomes returns true for this prompt", () => {
    expect(hasBroadUnclearOutcomes(PROMPT, "")).toBe(true);
  });

  it("computeValidationResult: firstAsset is 'Idea clarity test', not 'Web app'", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false);
    expect(r.firstAsset).toBe("Idea clarity test");
    expect(r.firstAsset).not.toBe("Web app");
  });

  it("computeValidationResult: domainLabel is not 'web app'", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false);
    expect(r.domainLabel).not.toMatch(/^web app$/i);
  });

  it("computeValidationResult: domainLabel is 'early-stage idea'", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false);
    expect(r.domainLabel).toBe("early-stage idea");
  });

  it("computeValidationResult: nicheLabel is null — no niche template should match", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false);
    expect(r.nicheLabel).toBeNull();
  });

  it("warning (nicheMistake) mentions missing specific audience", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false);
    expect(r.ideaContext?.nicheMistake).toMatch(/customer type|specific|audience/i);
  });

  it("asset reason explains why not to build the platform yet", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false);
    expect(r.ideaContext?.nicheAssetReason).toMatch(
      /multiple broad outcomes|broad outcomes|no specific audience|platform/i
    );
  });

  it("locked demand label domain does not mention web app", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false);
    expect((r.domainLabel ?? "").toLowerCase()).not.toContain("web app");
  });

  it("hasBroadUnclearOutcomes does not fire for a focused SaaS idea", () => {
    expect(
      hasBroadUnclearOutcomes(
        "A SaaS dashboard for law firms to manage client intake and track cases",
        "small law firms"
      )
    ).toBe(false);
  });

  it("hasBroadUnclearOutcomes does not fire when fewer than 2 broad outcome signals present", () => {
    expect(
      hasBroadUnclearOutcomes(
        "I want to build an app that helps people make money through freelancing",
        ""
      )
    ).toBe(false);
  });
});

// ─── Non-English locale guard ─────────────────────────────────────────────────

describe("computeValidationResult — non-English locale skips fallback", () => {
  it("French locale returns null ideaContext for a generic SaaS idea", () => {
    const r = computeValidationResult(
      0,
      "Un tableau de bord pour gérer les tâches quotidiennes des équipes",
      "petites entreprises",
      false,
      false,
      "fr"
    );
    expect(r.ideaContext).toBeNull();
    expect(r.nicheLabel).toBeNull();
    expect(r.nicheSteps).toBeNull();
    // Generic translation warning still present
    expect(r.warning).toBeTruthy();
  });

  it("Haitian Creole locale returns null ideaContext", () => {
    const r = computeValidationResult(
      0,
      "Yon aplikasyon pou ede biznis yo jere kliyan yo",
      "pèt biznis",
      false,
      false,
      "ht"
    );
    expect(r.ideaContext).toBeNull();
    expect(r.warning).toBeTruthy();
  });
});
