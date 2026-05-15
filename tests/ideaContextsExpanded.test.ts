import { describe, it, expect } from "vitest";
import { detectIdeaContext } from "@/lib/validation/ideaContexts";

// ─── Helper ───────────────────────────────────────────────────────────────────

function detect(idea: string, audience = "", stage: Parameters<typeof detectIdeaContext>[2] = "idea") {
  return detectIdeaContext(idea, audience, stage);
}

// ─── New category templates ───────────────────────────────────────────────────

describe("AI SaaS template", () => {
  it("detects AI-powered SaaS product", () => {
    const ctx = detect(
      "An AI-powered tool that automates contract review for law firms",
      "legal operations teams and general counsels"
    );
    expect(ctx?.nicheLabel).toBe("AI-powered SaaS product");
    expect(ctx?.nicheMistake).toMatch(/workflow|feature/i);
    expect(ctx?.nicheAssetReason).toMatch(/demo|before.after|workflow/i);
    expect(ctx?.nicheSteps).toHaveLength(4);
    expect(ctx?.nicheSteps[0]).toMatch(/ICP|workflow|who they are/i);
  });

  it("detects LLM-based product via 'llm' keyword", () => {
    const ctx = detect("A platform that uses an LLM to generate personalised email campaigns");
    expect(ctx?.nicheLabel).toBe("AI-powered SaaS product");
  });

  it("detects generative AI product", () => {
    const ctx = detect("A generative AI tool that creates social media content from a brand brief");
    expect(ctx?.nicheLabel).toBe("AI-powered SaaS product");
  });

  it("mid-stage AI SaaS step mentions concierge or pilot", () => {
    const ctx = detect("An AI platform for financial analysts", "", "assembly");
    expect(ctx?.nicheLabel).toBe("AI-powered SaaS product");
    expect(ctx?.nicheSteps[2]).toMatch(/concierge|pilot|manual/i);
  });
});

describe("Local service template", () => {
  it("detects local service business for cleaning", () => {
    const ctx = detect(
      "I want to start a cleaning service for homeowners in my neighborhood",
      "homeowners in suburban areas"
    );
    expect(ctx?.nicheLabel).toBe("local service business");
    expect(ctx?.nicheMistake).toMatch(/neighborhood|geography|broad/i);
    expect(ctx?.nicheAssetReason).toMatch(/service page|booking|search/i);
    expect(ctx?.nicheSteps[0]).toMatch(/zip code|neighborhood|service type/i);
  });

  it("detects landscaping / lawn care", () => {
    const ctx = detect("A platform to book lawn care services in local neighborhoods");
    expect(ctx?.nicheLabel).toBe("local service business");
  });

  it("detects plumber / handyman", () => {
    const ctx = detect("An app to help homeowners find a local handyman for quick repairs");
    expect(ctx?.nicheLabel).toBe("local service business");
  });
});

describe("Coaching / consulting template", () => {
  it("detects coaching business", () => {
    const ctx = detect(
      "I run a business coaching program for early-stage founders",
      "first-time entrepreneurs and startup founders"
    );
    expect(ctx?.nicheLabel).toBe("coaching or consulting practice");
    expect(ctx?.nicheMistake).toMatch(/specific|positioning|broad/i);
    expect(ctx?.nicheAssetReason).toMatch(/service page|consultation|positioning/i);
    expect(ctx?.nicheSteps[0]).toMatch(/positioning|help .* achieve|specific/i);
  });

  it("detects executive coaching", () => {
    const ctx = detect("An executive coach helping senior leaders improve their communication");
    expect(ctx?.nicheLabel).toBe("coaching or consulting practice");
  });

  it("detects consulting practice", () => {
    const ctx = detect("A consulting practice helping SaaS companies improve onboarding");
    expect(ctx?.nicheLabel).toBe("coaching or consulting practice");
  });

  it("late-stage coaching step mentions case studies", () => {
    const ctx = detect("I offer career coaching packages to job seekers", "", "launchReady");
    expect(ctx?.nicheLabel).toBe("coaching or consulting practice");
    expect(ctx?.nicheSteps[0]).toMatch(/case stud|client result/i);
  });
});

describe("Marketplace template", () => {
  it("detects two-sided marketplace", () => {
    const ctx = detect(
      "A marketplace that connects freelance designers with small businesses looking for design work",
      "small business owners and freelance designers"
    );
    expect(ctx?.nicheLabel).toBe("two-sided marketplace");
    expect(ctx?.nicheMistake).toMatch(/both sides|supply|demand|broker/i);
    expect(ctx?.nicheAssetReason).toMatch(/intake form|supply|demand/i);
    expect(ctx?.nicheSteps[0]).toMatch(/geography|city|transaction type/i);
  });

  it("detects gig platform", () => {
    const ctx = detect("A gig platform connecting local delivery drivers with retail merchants");
    expect(ctx?.nicheLabel).toBe("two-sided marketplace");
  });

  it("mid-stage marketplace step identifies harder side to acquire", () => {
    const ctx = detect("A peer-to-peer market for renting outdoor gear", "", "optimization");
    expect(ctx?.nicheLabel).toBe("two-sided marketplace");
    expect(ctx?.nicheSteps[0]).toMatch(/supply|demand|harder/i);
  });
});

describe("Ecommerce / preorder template", () => {
  it("detects physical product preorder", () => {
    const ctx = detect(
      "I want to sell eco-friendly water bottles online via a preorder campaign",
      "environmentally conscious consumers"
    );
    expect(ctx?.nicheLabel).toBe("product or ecommerce business");
    expect(ctx?.nicheMistake).toMatch(/inventory|manufacturing|assumed demand/i);
    expect(ctx?.nicheAssetReason).toMatch(/preorder|pre-sale|purchase intent/i);
    expect(ctx?.nicheSteps[0]).toMatch(/hero product|catalog|one product/i);
  });

  it("detects dropshipping idea", () => {
    const ctx = detect("A dropshipping business selling pet accessories");
    expect(ctx?.nicheLabel).toBe("product or ecommerce business");
  });

  it("detects Shopify store idea", () => {
    const ctx = detect("I want to launch a Shopify store for handmade candles");
    expect(ctx?.nicheLabel).toBe("product or ecommerce business");
  });
});

describe("Consumer app / waitlist template", () => {
  it("detects consumer app with waitlist", () => {
    const ctx = detect(
      "A mobile app for tracking daily habits — building a waitlist before launch",
      "people who want to build better personal habits"
    );
    expect(ctx?.nicheLabel).toBe("consumer app or pre-launch product");
    expect(ctx?.nicheMistake).toMatch(/user segment|habit|urgency/i);
    expect(ctx?.nicheAssetReason).toMatch(/waitlist|landing page|intent/i);
    expect(ctx?.nicheSteps[0]).toMatch(/user segment|specific/i);
  });

  it("detects B2C product via 'waitlist' keyword alone", () => {
    const ctx = detect("Building a waitlist for a new social discovery app");
    expect(ctx?.nicheLabel).toBe("consumer app or pre-launch product");
  });
});

describe("Education / online course template", () => {
  it("detects online course creator", () => {
    const ctx = detect(
      "I want to create an online course teaching freelance writers how to get clients",
      "aspiring freelance writers"
    );
    expect(ctx?.nicheLabel).toBe("online course or education product");
    expect(ctx?.nicheMistake).toMatch(/curriculum|outcome|pay/i);
    expect(ctx?.nicheAssetReason).toMatch(/workshop|waitlist|live/i);
    expect(ctx?.nicheSteps[0]).toMatch(/learner type|outcome/i);
  });

  it("detects cohort-based course", () => {
    const ctx = detect("A cohort-based course on growth marketing for startup founders");
    expect(ctx?.nicheLabel).toBe("online course or education product");
  });

  it("late-stage course step mentions alumni or payment plan", () => {
    const ctx = detect("Teaching an online course on personal finance", "", "launchScale");
    expect(ctx?.nicheLabel).toBe("online course or education product");
    expect(ctx?.nicheSteps[1]).toMatch(/alumni|follow.up|community/i);
  });
});

describe("Creator / digital product template", () => {
  it("detects Notion template business", () => {
    const ctx = detect(
      "I want to sell Notion templates for project managers",
      "freelancers and project managers"
    );
    expect(ctx?.nicheLabel).toBe("creator or digital product business");
    expect(ctx?.nicheMistake).toMatch(/audience|outcome|painful task/i);
    expect(ctx?.nicheAssetReason).toMatch(/landing page|mockup|pre-sale/i);
    expect(ctx?.nicheSteps[0]).toMatch(/painful task|manually|repeatedly/i);
  });

  it("detects ebook / digital guide", () => {
    const ctx = detect("Selling an ebook on how to start a freelance design business");
    expect(ctx?.nicheLabel).toBe("creator or digital product business");
  });

  it("detects digital product shop on Gumroad", () => {
    const ctx = detect("A digital product shop on Gumroad selling design presets");
    expect(ctx?.nicheLabel).toBe("creator or digital product business");
  });
});

describe("Nonprofit / community (broader) template", () => {
  it("detects community platform idea", () => {
    const ctx = detect(
      "I want to build an online community platform for immigrant entrepreneurs",
      "immigrant business owners and entrepreneurs"
    );
    expect(ctx?.nicheLabel).toBe("community or social impact project");
    expect(ctx?.nicheMistake).toMatch(/CTA|action|mission|passive/i);
    expect(ctx?.nicheAssetReason).toMatch(/CTA|action|page/i);
    expect(ctx?.nicheSteps[0]).toMatch(/community|specific group|shared need/i);
  });

  it("detects social impact / civic tech project", () => {
    const ctx = detect("A civic tech platform helping residents report local infrastructure issues");
    expect(ctx?.nicheLabel).toBe("community or social impact project");
  });

  it("detects community building idea", () => {
    const ctx = detect("I want to build a community for remote workers who struggle with isolation");
    expect(ctx?.nicheLabel).toBe("community or social impact project");
  });
});

describe("Health / wellness template", () => {
  it("detects wellness app", () => {
    const ctx = detect(
      "A wellness app helping corporate employees manage stress and improve focus",
      "HR managers and employees at mid-size companies"
    );
    expect(ctx?.nicheLabel).toBe("health or wellness offer");
    expect(ctx?.nicheMistake).toMatch(/specific|vague|outcome/i);
    expect(ctx?.nicheAssetReason).toMatch(/service page|challenge|consultation/i);
    expect(ctx?.nicheSteps[0]).toMatch(/audience|specific|wellness/i);
  });

  it("detects nutrition coaching", () => {
    const ctx = detect("A nutrition coaching platform for busy professionals who want to eat better");
    expect(ctx?.nicheLabel).toBe("health or wellness offer");
  });

  it("detects weight loss program", () => {
    const ctx = detect("A weight loss program for new mothers", "postpartum women");
    expect(ctx?.nicheLabel).toBe("health or wellness offer");
  });

  it("does NOT override therapy template (therapy detected first)", () => {
    const ctx = detect("A mental health therapy app for anxiety management");
    expect(ctx?.nicheLabel).toBe("therapy practice management app");
  });
});

describe("Real estate agent / buyer-seller template", () => {
  it("detects real estate agent tool", () => {
    const ctx = detect(
      "A CRM tool to help real estate agents manage their leads and follow-ups",
      "real estate agents and brokers"
    );
    expect(ctx?.nicheLabel).toBe("real estate service or lead generation tool");
    expect(ctx?.nicheMistake).toMatch(/broad|specific|lane/i);
    expect(ctx?.nicheAssetReason).toMatch(/lead.capture|consultation|prospect/i);
    expect(ctx?.nicheSteps[0]).toMatch(/niche|buyer|seller|geography/i);
  });

  it("detects homebuyer service", () => {
    const ctx = detect("A service helping first-time homebuyers navigate the purchase process");
    expect(ctx?.nicheLabel).toBe("real estate service or lead generation tool");
  });

  it("detects realtor lead gen idea", () => {
    const ctx = detect("A lead generation platform for realtors in growing suburban markets");
    expect(ctx?.nicheLabel).toBe("real estate service or lead generation tool");
  });

  it("does NOT override property management template (landlord/rental keyword present)", () => {
    const ctx = detect(
      "A tool for landlords to track rental property maintenance requests",
      "property managers"
    );
    expect(ctx?.nicheLabel).toBe("real estate management app");
  });
});

// ─── Specificity guard — specific templates win over broader category ─────────

describe("specificity: specific templates fire before broad categories", () => {
  it("therapy idea hits therapy template, not health/wellness", () => {
    const ctx = detect("An app for therapists to manage client intake and scheduling");
    expect(ctx?.nicheLabel).toBe("therapy practice management app");
  });

  it("fitness studio idea hits fitness template, not health/wellness", () => {
    const ctx = detect("A scheduling app for yoga studio class bookings");
    expect(ctx?.nicheLabel).toBe("fitness business management app");
  });

  it("nonprofit management hits nonprofit template, not community/social impact", () => {
    const ctx = detect("A volunteer management platform for nonprofits and NGOs");
    expect(ctx?.nicheLabel).toBe("nonprofit management app");
  });

  it("formal education management hits education management, not online course", () => {
    const ctx = detect("An LMS for school management and student progress tracking");
    expect(ctx?.nicheLabel).toBe("education management app");
  });
});

// ─── B2B wholesale / vendor commerce ─────────────────────────────────────────

describe("B2B wholesale / vendor commerce template", () => {
  it("detects the exact failing idea: vendors buy products, ship wherever", () => {
    const ctx = detect(
      "I want to build a platform that allows vendors to buy products from us and we will ship them wherever they want."
    );
    expect(ctx?.nicheLabel).toBe("B2B wholesale or vendor commerce");
    expect(ctx?.nicheAssetReason).toMatch(/vendor order interest page|vendor.*want to buy/i);
    expect(ctx?.nicheMistake).toMatch(/platform|price|shipping/i);
    expect(ctx?.nicheSteps).toHaveLength(4);
    expect(ctx?.nicheSteps[0]).toMatch(/vendor type|retailer|reseller/i);
  });

  it("detects wholesale business", () => {
    const ctx = detect("I want to start a wholesale distribution business for retail stores");
    expect(ctx?.nicheLabel).toBe("B2B wholesale or vendor commerce");
  });

  it("detects bulk order business", () => {
    const ctx = detect("I offer bulk orders for office supplies and hardware to small businesses");
    expect(ctx?.nicheLabel).toBe("B2B wholesale or vendor commerce");
  });

  it("detects product sourcing business", () => {
    const ctx = detect("I help retailers with product sourcing from overseas suppliers");
    expect(ctx?.nicheLabel).toBe("B2B wholesale or vendor commerce");
  });

  it("does NOT match a regular B2C ecommerce store", () => {
    const ctx = detect("I want to build an ecommerce store selling clothing online to consumers");
    expect(ctx?.nicheLabel).not.toBe("B2B wholesale or vendor commerce");
  });

  it("does NOT match a two-sided marketplace", () => {
    const ctx = detect("I want to build a marketplace connecting buyers and sellers of handmade goods");
    expect(ctx?.nicheLabel).not.toBe("B2B wholesale or vendor commerce");
  });

  it("mid-stage wholesale steps mention order volume or friction", () => {
    const ctx = detect(
      "I want to build a platform that allows vendors to buy products from us and we will ship them wherever they want.",
      "",
      "assembly"
    );
    expect(ctx?.nicheLabel).toBe("B2B wholesale or vendor commerce");
    expect(ctx?.nicheSteps[0]).toMatch(/vendor type|order|segment/i);
  });
});

// ─── computeValidationResult integration: vendor idea returns correct firstAsset ─

describe("computeValidationResult — B2B wholesale firstAsset override", () => {
  it("returns Vendor order interest page for the vendor platform idea", async () => {
    const { computeValidationResult } = await import("@/lib/validation/engine");
    const result = computeValidationResult(
      0,
      "I want to build a platform that allows vendors to buy products from us and we will ship them wherever they want.",
      "",
      false,
      false,
      "en"
    );
    expect(result.firstAsset).toBe("Vendor order interest page");
    expect(result.nicheLabel).toBe("B2B wholesale or vendor commerce");
    expect(result.domainLabel).toBe("B2B wholesale / vendor");
    expect(result.nicheSteps).toHaveLength(4);
  });
});

// ─── Generic / unclear ideas fall through to null ────────────────────────────

describe("generic ideas return null (handled by buildFallbackIdeaContext in engine)", () => {
  it("vague productivity tool returns null", () => {
    const ctx = detect("A productivity tool to help people get more done", "everyone");
    expect(ctx).toBeNull();
  });

  it("unclear idea with no keywords returns null", () => {
    const ctx = detect("Something that solves a big problem in the market", "businesses");
    expect(ctx).toBeNull();
  });
});
