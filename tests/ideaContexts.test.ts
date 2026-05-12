import { describe, it, expect } from "vitest";
import { detectIdeaContext } from "@/lib/validation/ideaContexts";
import { computeValidationResult } from "@/lib/validation/engine";

// ─── detectIdeaContext fixtures ───────────────────────────────────────────────

describe("detectIdeaContext — niche detection", () => {
  it("church event app → church event management app", () => {
    const ctx = detectIdeaContext(
      "I have an app for churches to manage their events including youth nights and Sunday services",
      "pastors and church event coordinators",
      "idea"
    );
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("church event management app");
    expect(ctx!.audienceLabel).toContain("pastor");
    expect(ctx!.nicheMistake).toMatch(/event type|denomination/i);
    expect(ctx!.nicheAssetReason).toMatch(/church/i);
    expect(ctx!.nicheSteps).toHaveLength(4);
    expect(ctx!.nicheSteps[0]).toMatch(/event type|youth night|Sunday/i);
  });

  it("restaurant ordering app → food business management app", () => {
    const ctx = detectIdeaContext(
      "A platform to manage restaurant reservations and reduce no-shows",
      "restaurant owners and managers",
      "assembly"
    );
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("food business management app");
    expect(ctx!.nicheMistake).toMatch(/restaurant|ordering|scheduling/i);
    expect(ctx!.nicheAssetReason).toMatch(/reservation/i);
    // assembly stage → mid group steps
    expect(ctx!.nicheSteps[0]).toMatch(/path|trace/i);
  });

  it("fitness coach tracker → fitness business management app", () => {
    const ctx = detectIdeaContext(
      "An app for personal trainers to track client sessions and manage gym class bookings",
      "gym owners and fitness studio managers",
      "optimization"
    );
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("fitness business management app");
    expect(ctx!.audienceLabel).toContain("gym owner");
    expect(ctx!.nicheMistake).toMatch(/scheduling|payment|tracking/i);
    // optimization stage → mid group steps
    expect(ctx!.nicheSteps).toHaveLength(4);
    expect(ctx!.nicheSteps[1]).toMatch(/studio|gym|booking/i);
  });

  it("real estate lead tool → real estate management app", () => {
    const ctx = detectIdeaContext(
      "A tool for landlords to manage rental property maintenance requests and tenant communication",
      "property managers",
      "launchReady"
    );
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("real estate management app");
    expect(ctx!.nicheMistake).toMatch(/import|integration|data/i);
    expect(ctx!.nicheAssetReason).toMatch(/landlord|property manager|spreadsheet/i);
    // launchReady stage → late group steps
    expect(ctx!.nicheSteps[0]).toMatch(/portfolio size|single property/i);
  });

  it("generic SaaS productivity app → null (no niche detected)", () => {
    const ctx = detectIdeaContext(
      "A SaaS dashboard to help teams manage their daily tasks and automate workflows",
      "small business teams",
      "firstAsset"
    );
    expect(ctx).toBeNull();
  });
});

// ─── Coaching regression — financial coaching program for immigrants ──────────

describe("Coaching regression — financial coaching immigrants Miami prompt", () => {
  const PROMPT =
    "I want to help new immigrants in Miami improve their credit and understand basic " +
    "money management through a 4-week financial coaching program. I want to test demand " +
    "with a service page, free 15-minute consultation CTA, and three educational posts " +
    "before creating the full program.";

  it("detectIdeaContext labels it as coaching or consulting practice", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("coaching or consulting practice");
  });

  it("firstAsset is 'Service consultation page', not 'Booking page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("Service consultation page");
    expect(result.firstAsset).not.toBe("Booking page");
  });

  it("verdict says 'clear enough to test', not 'too early to build'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.verdict).toMatch(/clear enough to test/i);
    expect(result.verdict).not.toMatch(/too early to build/i);
  });

  it("nicheMistake focuses on positioning/outcome, not missing audience", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).toMatch(/specific|positioning|broad/i);
    expect(ctx!.nicheMistake).not.toMatch(/customer type|not named|unnamed/i);
  });

  it("nicheAssetReason mentions service page and consultation", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheAssetReason).toMatch(/service page|consultation/i);
  });
});

// ─── Marketplace regression — homeowner/handyman Miami marketplace ───────────

describe("Marketplace regression — homeowner handyman Miami prompt", () => {
  const PROMPT =
    "I want to build a marketplace app that connects homeowners in Miami with trusted " +
    "local handymen for small repair jobs. Homeowners can post a job, handymen can accept " +
    "it, and payment is held until the job is completed. I want to start by testing whether " +
    "homeowners will request quotes and whether handymen are willing to join before building " +
    "the full app.";

  it("detectIdeaContext labels it as two-sided marketplace", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("two-sided marketplace");
  });

  it("firstAsset is 'Marketplace pilot page', not 'Marketplace web app'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("Marketplace pilot page");
    expect(result.firstAsset).not.toBe("Marketplace web app");
  });

  it("nicheMistake focuses on cold-start / liquidity risk", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).toMatch(/both sides|supply|demand|broker/i);
  });

  it("idea-stage nicheSteps include buyer intake, provider intake, and manual brokerage", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheSteps).toHaveLength(4);
    expect(ctx!.nicheSteps[0]).toMatch(/geography|city|transaction type/i);
    expect(ctx!.nicheSteps[3]).toMatch(/manually|broker|transaction/i);
  });
});

// ─── Ecommerce regression — Haitian skincare preorder prompt ─────────────────

describe("Ecommerce regression — Haitian skincare preorder prompt", () => {
  const PROMPT =
    "I want to sell Haitian-inspired natural skincare products online, starting with a " +
    "turmeric and aloe face mask for women with dark spots and uneven skin tone. I want " +
    "to test demand with a product landing page, before-and-after education content, and " +
    "a preorder CTA before buying inventory.";

  it("detectIdeaContext labels it as product or ecommerce business", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("product or ecommerce business");
  });

  it("firstAsset is 'Preorder product page', not 'E-commerce store'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("Preorder product page");
    expect(result.firstAsset).not.toBe("E-commerce store");
  });

  it("nicheMistake focuses on inventory/manufacturing/demand risk", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).toMatch(/inventory|manufacturing|assumed demand/i);
  });

  it("nicheAssetReason mentions preorder or pre-sale and purchase intent", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheAssetReason).toMatch(/preorder|pre-sale|purchase intent/i);
  });

  it("idea-stage nicheSteps focus on one hero product and preorder validation", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheSteps).toHaveLength(4);
    expect(ctx!.nicheSteps[0]).toMatch(/hero product|catalog|one product/i);
  });
});

// ─── Local service regression — mobile car detailing Miami ───────────────────

describe("Local service regression — mobile car detailing Miami prompt", () => {
  const PROMPT =
    "I want to start a mobile car detailing service in Miami for busy professionals who " +
    "do not have time to wait at a car wash. I want to test demand with a simple service " +
    "page, clear packages, and a booking CTA before buying more equipment.";

  it("detectIdeaContext labels it as local service business", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("local service business");
  });

  it("nicheMistake does not say customer type is unnamed", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).not.toMatch(/customer type|not named|unnamed/i);
    expect(ctx!.nicheMistake).toMatch(/equipment|neighborhood|geography|broad/i);
  });

  it("nicheAssetReason mentions service page and proving demand before buying equipment", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheAssetReason).toMatch(/service page|booking/i);
    expect(ctx!.nicheAssetReason).toMatch(/equipment|invest/i);
  });

  it("computeValidationResult: firstAsset is 'Service booking page', not 'Booking page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("Service booking page");
    expect(result.firstAsset).not.toBe("Booking page");
  });

  it("computeValidationResult: verdict says 'clear enough to test', not 'too early to build'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.verdict).toMatch(/clear enough to test/i);
    expect(result.verdict).not.toMatch(/too early to build/i);
  });

  it("idea-stage nicheSteps focus on one service type and one neighborhood", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheSteps).toHaveLength(4);
    expect(ctx!.nicheSteps[0]).toMatch(/service type|zip code|neighborhood/i);
  });
});

// ─── AI SaaS / B2B SaaS regression — "book a workflow audit" must not misclassify ──

describe("AI SaaS regression — law firm workflow audit prompt", () => {
  const PROMPT =
    "I want to build an AI SaaS tool for small law firms that summarizes client intake " +
    "forms, identifies missing information, and prepares a draft case summary before the " +
    "first consultation. I want to test demand with a demo landing page and a 'book a " +
    "workflow audit' CTA before building the full product.";

  it("ideaContext label is AI-powered SaaS product", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("AI-powered SaaS product");
  });

  it("nicheMistake mentions workflow validation, not missing customer", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).toMatch(/workflow/i);
    expect(ctx!.nicheMistake).not.toMatch(/customer type|not named|unnamed/i);
  });

  it("nicheAssetReason mentions demo page and workflow audit CTA", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheAssetReason).toMatch(/demo/i);
    expect(ctx!.nicheAssetReason).toMatch(/workflow/i);
  });

  it("computeValidationResult: firstAsset is 'SaaS demo page', not 'Web app (SaaS)' or 'Booking page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("SaaS demo page");
    expect(result.firstAsset).not.toBe("Web app (SaaS)");
    expect(result.firstAsset).not.toBe("Booking page");
    expect(result.domainLabel).not.toMatch(/service|appointment/i);
  });

  it("idea-stage nicheSteps focus on ICP definition and workflow validation", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheSteps).toHaveLength(4);
    expect(ctx!.nicheSteps[0]).toMatch(/ICP|workflow|who they are/i);
  });
});

// ─── Nonprofit / community regression — Haitian parents community project ─────

describe("Nonprofit / community regression — Haitian parents community project prompt", () => {
  const PROMPT =
    "I want to start a community project that helps Haitian parents in Miami find " +
    "tutoring resources, school information, and college preparation support for their " +
    "children. I want to test interest with a simple mission page and volunteer/contact CTA.";

  it("does not classify as education management app", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx?.nicheLabel).not.toBe("education management app");
  });

  it("classifies as community or social impact project", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx?.nicheLabel).toBe("community or social impact project");
  });

  it("firstAsset is 'Community resource page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("Community resource page");
  });

  it("nicheAssetReason does not mention tutors, teachers, scheduling, or progress updates", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheAssetReason).not.toMatch(/tutor|teacher|schedul|progress update|assignment/i);
  });

  it("nicheMistake does not mention SIS or student information system", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).not.toMatch(/SIS|student information system/i);
  });

  it("nicheMistake mentions mission, community need, trust signal, and clear action", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).toMatch(/mission/i);
    expect(ctx!.nicheMistake).toMatch(/community|need/i);
    expect(ctx!.nicheMistake).toMatch(/trust/i);
    expect(ctx!.nicheMistake).toMatch(/action|CTA/i);
  });

  it("domainLabel does not mention education management app", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).not.toMatch(/education management|education app/i);
  });

  it("domainLabel mentions community or nonprofit", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).toMatch(/community|nonprofit/i);
  });

  it("domainLabel is 'community projects' (no 'businesses' suffix)", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).toBe("community projects");
  });
});

// ─── Creator / digital product regression — freelancer template kit ──────────

describe("Creator / digital product regression — freelancer template kit prompt", () => {
  const PROMPT =
    "I want to sell a digital template kit that helps new freelancers organize client " +
    "onboarding, proposals, invoices, and follow-up messages. I want to test demand with " +
    "a simple landing page and waitlist before creating the full template bundle.";

  it("detectIdeaContext labels it as creator or digital product business", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("creator or digital product business");
  });

  it("firstAsset is not 'App waitlist page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).not.toBe("App waitlist page");
  });

  it("firstAsset is 'Template landing page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("Template landing page");
  });

  it("nicheAssetReason does not mention app screens or beta testing", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheAssetReason).not.toMatch(/app screen|beta test/i);
  });

  it("nicheMistake does not mention consumer app urgency or change behavior", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).not.toMatch(/consumer app|change.*behavior|urgency.*habit/i);
  });

  it("domainLabel does not mention consumer app", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).not.toMatch(/consumer app/i);
  });

  it("domainLabel mentions digital product", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).toMatch(/digital product|creator/i);
  });
});

// ─── Online course regression — Haitian small business AI marketing course ─────

describe("Online course regression — Haitian small business AI marketing course prompt", () => {
  const PROMPT =
    "I want to create an online course that teaches Haitian small business owners how to " +
    "use AI tools to create social media posts, organize customer leads, and build a simple " +
    "marketing system. I want to test demand with a free workshop before building the full course.";

  it("detectIdeaContext labels it as online course or education product", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("online course or education product");
  });

  it("firstAsset is not 'Web app'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).not.toBe("Web app");
  });

  it("firstAsset is 'Workshop signup page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("Workshop signup page");
  });

  it("domainLabel does not mention 'web app'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).not.toMatch(/web app/i);
  });

  it("domainLabel mentions online course", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).toMatch(/online course|education|course/i);
  });

  it("nicheLabel starts with a vowel — UI should use 'an', not 'a'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    const label = result.nicheLabel ?? "";
    expect(/^[aeiou]/i.test(label)).toBe(true);
  });
});

// ─── Consumer app / waitlist regression — college student study app ───────────

describe("Consumer app / waitlist regression — college student study app prompt", () => {
  const PROMPT =
    "I want to build a mobile app for first-year college students who struggle to stay " +
    "consistent with studying. The app will help them create a weekly study plan, get AI " +
    "reminders, and track completed study sessions. I want to test demand with a landing " +
    "page and waitlist before building the app.";

  it("detectIdeaContext labels it as consumer app or pre-launch product", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("consumer app or pre-launch product");
  });

  it("firstAsset is not 'Booking page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).not.toBe("Booking page");
  });

  it("firstAsset is 'App waitlist page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).toBe("App waitlist page");
  });

  it("domainLabel does not mention 'service / appointment'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).not.toMatch(/service|appointment/i);
  });

  it("domainLabel mentions consumer app", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).toMatch(/consumer app|app|pre.launch/i);
  });
});

// ─── Real estate regression — first-time homebuyer lead-capture page ─────────

describe("Real estate regression — first-time homebuyer South Florida prompt", () => {
  const PROMPT =
    "I want to help first-time homebuyers in South Florida understand the buying process, " +
    "prepare their documents, and connect with trusted lenders and agents. I want to test " +
    "demand with a lead-capture page and free buyer readiness consultation.";

  it("detectIdeaContext labels it as real estate service or lead generation tool", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toBe("real estate service or lead generation tool");
  });

  it("firstAsset is 'Buyer readiness page', not 'Booking page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).not.toBe("Booking page");
    expect(result.firstAsset).toBe("Buyer readiness page");
  });

  it("domainLabel does not say 'service / appointment'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).not.toMatch(/service\s*\/\s*appointment/i);
    expect(result.domainLabel).toMatch(/real estate/i);
  });
});

// ─── Health/wellness regression — wellness coaching for busy moms ─────────────

describe("Health/wellness regression — wellness coaching for busy moms prompt", () => {
  const PROMPT =
    "I want to launch a wellness coaching service for busy moms who want to reduce stress, " +
    "sleep better, and build a simple weekly self-care routine. I want to test demand with " +
    "a challenge page and consultation CTA before creating the full program.";

  it("detectIdeaContext labels it as health or wellness product", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx).not.toBeNull();
    expect(ctx!.nicheLabel).toMatch(/health|wellness/i);
  });

  it("firstAsset is 'Wellness challenge page', not 'Booking page'", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.firstAsset).not.toBe("Booking page");
    expect(result.firstAsset).toMatch(/wellness challenge|challenge signup/i);
  });

  it("nicheMistake does not say the customer type is missing", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheMistake).not.toMatch(/customer type|not named|unnamed/i);
    expect(ctx!.nicheMistake).toMatch(/wellness|specific|outcome|vague/i);
  });

  it("nicheAssetReason mentions challenge page, busy moms, and wellness outcome", () => {
    const ctx = detectIdeaContext(PROMPT, "", "idea");
    expect(ctx!.nicheAssetReason).toMatch(/challenge/i);
    expect(ctx!.nicheAssetReason).toMatch(/moms?|parents?/i);
    expect(ctx!.nicheAssetReason).toMatch(/wellness|health|outcome/i);
  });

  it("domainLabel does not mention service / appointment", () => {
    const result = computeValidationResult(0, PROMPT, "", false, false);
    expect(result.domainLabel).not.toMatch(/service|appointment/i);
    expect(result.domainLabel).toMatch(/wellness|health/i);
  });
});

// ─── Non-English locale guard (engine level) ─────────────────────────────────

describe("computeValidationResult — non-English locale", () => {
  it("French locale returns null ideaContext even for a church idea", () => {
    const result = computeValidationResult(
      0,
      "Une application pour les églises pour gérer leurs événements",
      "pasteurs et coordinateurs d'événements",
      false,
      false,
      "fr"
    );
    expect(result.ideaContext).toBeNull();
    expect(result.nicheLabel).toBeNull();
    expect(result.nicheSteps).toBeNull();
    // Generic warning should fall through
    expect(result.warning).toBeTruthy();
  });
});

// ─── Haitian Creole regression — WhatsApp false positive + English leakage ────

describe("Haitian Creole regression — service page + WhatsApp idea", () => {
  const PROMPT =
    "Mwen vle kreye yon sèvis ki ede ti biznis ayisyen nan Miami jwenn plis kliyan " +
    "atravè paj sèvis, mesaj WhatsApp, ak kontni edikatif.";

  it("firstAsset is not 'Aplikasyon web' — WhatsApp must not trigger webApp", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false, "ht");
    expect(r.firstAsset).not.toBe("Aplikasyon web");
    expect(r.firstAsset.toLowerCase()).not.toContain("aplikasyon web");
  });

  it("firstAsset is a Haitian Creole page label, not an English string", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false, "ht");
    // Must contain 'Paj' (Haitian Creole for page/landing page)
    expect(r.firstAsset).toMatch(/paj/i);
    // Must not be English
    expect(r.firstAsset).not.toMatch(/^Web app|^Booking page|^Mobile app|^Lead funnel/i);
  });

  it("domainLabel is null — no label that would trigger an English verdict prefix", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false, "ht");
    expect(r.domainLabel).toBeNull();
  });

  it("nicheLabel is null — non-English guard is active", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false, "ht");
    expect(r.nicheLabel).toBeNull();
  });

  it("verdict is the Haitian Creole text — no 'For a' or 'at this stage' leakage", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false, "ht");
    expect(r.verdict).not.toMatch(/^For (a|an)\b/i);
    expect(r.verdict).not.toContain("at this stage");
  });

  it("locked demand label domain does not mention web app / aplikasyon web", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false, "ht");
    expect((r.domainLabel ?? "").toLowerCase()).not.toContain("web app");
    expect((r.domainLabel ?? "").toLowerCase()).not.toContain("aplikasyon web");
  });

  it("ideaContext is null — no English template injected", () => {
    const r = computeValidationResult(0, PROMPT, "", false, false, "ht");
    expect(r.ideaContext).toBeNull();
  });
});

// ─── Multilingual non-leakage — French / Spanish / Portuguese ─────────────────

describe("Multilingual non-leakage — no English verdict prefix in localized output", () => {
  const LOCALES: Array<{ locale: string; name: string; idea: string }> = [
    {
      locale: "fr",
      name: "French",
      idea: "Je veux créer une plateforme SaaS pour aider les petites entreprises à gérer leurs clients.",
    },
    {
      locale: "es",
      name: "Spanish",
      idea: "Quiero construir una aplicación para ayudar a los restaurantes a gestionar sus reservas.",
    },
    {
      locale: "pt",
      name: "Portuguese",
      idea: "Quero criar uma plataforma para conectar compradores e vendedores de produtos artesanais.",
    },
  ];

  for (const { locale, name, idea } of LOCALES) {
    it(`${name}: verdict does not start with 'For a' or 'For an'`, () => {
      const r = computeValidationResult(0, idea, "", false, false, locale);
      expect(r.verdict).not.toMatch(/^For (a|an)\b/i);
      expect(r.verdict).not.toContain("at this stage");
    });

    it(`${name}: nicheLabel is null — no English niche context injected`, () => {
      const r = computeValidationResult(0, idea, "", false, false, locale);
      expect(r.nicheLabel).toBeNull();
      expect(r.ideaContext).toBeNull();
    });
  }
});
