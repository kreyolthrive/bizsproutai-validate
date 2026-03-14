import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classifyCategory } from "../src/validation/engine/classifyCategory";
import { validateIdeaDynamic } from "../src/validation/engine/orchestrator";
import { runBusinessValidationPipeline } from "../src/validation/engine/pipeline";

const ORIGINAL_ENV = { ...process.env };

const COFFEE_SUBSCRIPTION_IDEA =
  "Monthly subscription box delivering artisanal coffee beans from different regions. Subscribers pay $35/month and receive 2-3 coffee varieties with tasting notes and brewing guides.";
const WELLNESS_STUDIO_IDEA =
  "I want to build a women's wellness studio offering yoga, massage, and nutrition coaching.";
const CONSULTING_IDEA =
  "Fractional marketing consulting for boutique law firms that need predictable lead generation and clearer monthly reporting.";
const REAL_ESTATE_AGENT_IDEA =
  "I want to build a real estate agent business focused on first-time homebuyers in Atlanta.";
const POSTPARTUM_FITNESS_IDEA =
  "I want to build a remote fitness coach for new moms.";
const BARBER_VERTICAL_SAAS_IDEA =
  "Build a simple appointment booking app for a barber with time slots, basic client info, and appointment confirmation screen.";

function openAIResponse(content: unknown): Response {
  return new Response(
    JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify(content),
          },
        },
      ],
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }
  );
}

function extractPrompt(init?: RequestInit): string {
  const body = JSON.parse(String(init?.body ?? "{}")) as {
    messages?: Array<{ content?: string }>;
  };

  return body.messages?.at(-1)?.content ?? "";
}

function buildContextResponse(prompt: string) {
  if (prompt.includes("real estate agent business focused on first-time homebuyers in Atlanta")) {
    return {
      category: "local_service",
      subcategory: "real_estate_agent",
      businessModelType: "trust_based_high_ticket_local_service",
      segment: "First-time homebuyers in Atlanta",
      frameworkHint: "real_estate_agent_v1",
      countryCode: "US",
      region: "north_america",
      categoryConfidence: 0.95,
      countryConfidence: 0.94,
      categoryEvidence: [
        "The idea is a local professional service built around buyer representation.",
        "Real estate agent signals indicate a trust-based, regulated service model.",
      ],
      countryEvidence: ["Atlanta indicates the U.S. housing market."],
    };
  }

  if (prompt.includes("women's wellness studio")) {
    return {
      category: "local_service",
      frameworkHint: "local_service_v1",
      countryCode: "US",
      region: "north_america",
      categoryConfidence: 0.9,
      countryConfidence: 0.72,
      categoryEvidence: [
        "The offer is delivered in person through classes and appointments.",
        "A studio model fits local service better than coaching-only delivery.",
      ],
      countryEvidence: ["Defaulting to U.S. local-service context."],
    };
  }

  if (prompt.includes("Fractional marketing consulting for boutique law firms")) {
    return {
      category: "consulting",
      subcategory: "fractional_marketing_consulting",
      businessModelType: "expert_service_business",
      segment: "Boutique law firms",
      frameworkHint: "coaching_consulting_v1",
      countryCode: "US",
      region: "north_america",
      categoryConfidence: 0.94,
      countryConfidence: 0.74,
      categoryEvidence: ["The offer is a specialized client-service retainer."],
      countryEvidence: ["Defaulting to U.S. professional-service context."],
    };
  }

  if (prompt.includes("remote fitness coach for new moms")) {
    return {
      category: "health_wellness",
      subcategory: "postpartum_fitness_coaching",
      businessModelType: "remote_coaching_digital_service",
      segment: "new_moms",
      frameworkHint: "postpartum_fitness_coaching_v1",
      countryCode: "US",
      region: "north_america",
      categoryConfidence: 0.95,
      countryConfidence: 0.74,
      categoryEvidence: [
        "The offer is a wellness and recovery coaching service for postpartum mothers.",
        "The delivery model is remote coaching rather than an education platform.",
      ],
      countryEvidence: ["Defaulting to U.S. wellness-market context."],
    };
  }

  if (prompt.includes("appointment booking app for a barber")) {
    return {
      category: "saas",
      subcategory: "vertical_saas",
      businessModelType: "vertical_saas_workflow_software",
      segment: "barbers_barbershops",
      frameworkHint: "vertical_saas_v1",
      countryCode: "US",
      region: "north_america",
      categoryConfidence: 0.95,
      countryConfidence: 0.74,
      categoryEvidence: [
        "What is being built is software, while barbers are the customer segment.",
        "The idea is a niche workflow tool for appointment-based SMB operators.",
      ],
      countryEvidence: ["Defaulting to U.S. SMB software context."],
    };
  }

  return {
    category: "ecommerce",
    businessModelType: "product_business",
    frameworkHint: "ecommerce_v1",
    countryCode: "US",
    region: "north_america",
    categoryConfidence: 0.93,
    countryConfidence: 0.76,
    categoryEvidence: ["The recurring purchase is for shipped physical goods, not software."],
    countryEvidence: ["Defaulting to U.S. ecommerce context."],
  };
}

function buildAnalysisResponse(prompt: string) {
  if (prompt.includes("real estate agent business focused on first-time homebuyers in Atlanta")) {
    return {
      framework: {
        archetype: "real_estate_agent",
        label: "Real Estate Agent Framework",
      },
      summary: {
        oneLiner:
          "This real estate agent concept has a clear niche and monetization path, but trust building and lead generation proof are still critical.",
        topOpportunities: [
          "First-time buyers need education and guidance",
          "Atlanta has enough volume to support niche positioning",
        ],
        biggestRisks: [
          "Competition from established agents",
          "Long lead-to-close cycle for first-time buyers",
        ],
      },
      assumptions: [
        "First-time homebuyers in Atlanta want more education than most agents provide.",
        "An education-first positioning can convert content into consultations.",
        "Lead acquisition cost can stay sustainable before referrals compound.",
      ],
      missingInfo: [
        "Licensing and brokerage setup is not confirmed.",
        "No proof yet of lead magnet conversion or referral partnerships.",
      ],
      criteria: [],
      problemDemand: {
        painLevel: 4.2,
        demandFrequency: 3.9,
        marketCoverage: 3.8,
        currentGap: 4.1,
        total: 16,
        passGate1: true,
        reasoning: "The segment needs clarity, trust, and education through a complex purchase.",
      },
      primarySegment: {
        name: "First-time homebuyers in Atlanta",
        who: "Local buyers who need help navigating financing and the purchase process",
        jobToBeDone: "Buy a first home with more guidance and confidence",
        currentPain: "The process feels confusing, high-stakes, and trust-sensitive",
        willingnessToPay: "Commission-based model fits if trust is earned",
        reachChannels: ["Local content", "Referral partners", "Social media", "Lender partnerships"],
        scores: {
          reachability: 3.6,
          painLevel: 4.3,
          payingCapability: 3.8,
          total: 11.7,
        },
        reasoning: "The niche is reachable, but trust and timing make conversion slower.",
      },
      solutionValidation: {
        painCoverage: 4.1,
        differentiation: 3.7,
        adoptionFriction: 2.7,
        score: 3.9,
        passGate3: true,
        reasoning: "Education-first positioning is differentiating if executed with credibility.",
      },
      marketValidation: {
        tam: 180000000,
        sam: 24000000,
        som: 1800000,
        confidence: 0.72,
        passGate4: true,
        directCompetitors: ["Established Atlanta agents", "Large brokerages"],
        indirectAlternatives: ["Zillow lead funnels", "Generalist buyer agents"],
        statusQuo: ["Choosing agents through referrals"],
        reasoning: "The market is viable, but share capture depends on trust and specialization.",
      },
      businessModelValidation: {
        model: "Commission-based buyer representation",
        entryPrice: 0,
        anchorPrice: 9000,
        margin: 74,
        score: 4.1,
        passGate4: true,
        reasoning: "High-ticket transactions can support the model once qualified clients convert.",
      },
      operationalValidation: {
        score: 3.4,
        passGate5: true,
        keyConstraints: ["Licensing", "Brokerage alignment", "Slow trust-building cycle"],
        reasoning: "Execution is feasible, but credibility and pipeline building take time.",
      },
      failureRisks: [
        {
          criterion: "Trust and reputation requirements",
          score: 2,
          reason: "New agents face a credibility gap versus established Atlanta agents.",
          severity: "high",
        },
        {
          criterion: "Licensing and brokerage setup",
          score: 3,
          reason: "Licensing, brokerage selection, and compliance decisions may slow launch.",
          severity: "medium",
        },
        {
          criterion: "Lead generation difficulty",
          score: 3,
          reason: "Sustainable lead flow may require content, partnerships, and referral systems before closings happen.",
          severity: "medium",
        },
      ],
      nextActions: [
        "Interview 10 first-time homebuyers in Atlanta about confusion, trust, and financing concerns.",
        "Build a landing page around first-time homebuyer guidance with a checklist or financing guide lead magnet.",
        "Validate local acquisition channels through content, referral partners, and a consultation funnel.",
      ],
      decision: "CONDITIONAL_GO",
      weightedScore: 74,
    };
  }

  if (prompt.includes("women's wellness studio")) {
    return {
      framework: {
        archetype: "local_service_business",
        label: "Local Service Business",
      },
      summary: {
        oneLiner: "The studio concept is locally viable if it can prove neighborhood demand and retention.",
        topOpportunities: ["Memberships", "Repeat bookings"],
        biggestRisks: ["Location economics", "Capacity utilization"],
      },
      assumptions: ["Local customers want a bundled wellness experience."],
      missingInfo: ["No confirmed location or pricing structure."],
      criteria: [],
      problemDemand: {
        painLevel: 4,
        demandFrequency: 3.8,
        marketCoverage: 3.7,
        currentGap: 3.9,
        total: 15.4,
        passGate1: true,
        reasoning: "The offer addresses recurring wellness demand.",
      },
      primarySegment: {
        name: "Women seeking local wellness services",
        who: "Customers looking for classes and appointments in one place",
        jobToBeDone: "Improve health and recovery through local recurring sessions",
        currentPain: "Fragmented services and inconsistent routines",
        willingnessToPay: "Moderate",
        reachChannels: ["Local partnerships", "Instagram", "Referral loops"],
        scores: {
          reachability: 3.9,
          painLevel: 3.8,
          payingCapability: 3.6,
          total: 11.3,
        },
        reasoning: "Neighborhood marketing and referrals are viable.",
      },
      solutionValidation: {
        painCoverage: 4,
        differentiation: 3.4,
        adoptionFriction: 2.2,
        score: 3.7,
        passGate3: true,
        reasoning: "The offer is easy to trial locally.",
      },
      marketValidation: {
        tam: 48000000,
        sam: 8200000,
        som: 600000,
        confidence: 0.69,
        passGate4: true,
        reasoning: "A neighborhood-scale studio can work if utilization is healthy.",
      },
      businessModelValidation: {
        model: "Membership plus appointments",
        entryPrice: 79,
        anchorPrice: 199,
        margin: 52,
        score: 3.7,
        passGate4: true,
        reasoning: "Membership and service mix can support retention.",
      },
      operationalValidation: {
        score: 3.5,
        passGate5: true,
        keyConstraints: ["Location", "Scheduling", "Staffing"],
        reasoning: "Operations are manageable with focused service packaging.",
      },
      nextActions: [
        "Test neighborhood demand before signing a location.",
        "Create founding membership and package options.",
        "Launch a local booking pilot with referral incentives.",
      ],
      decision: "CONDITIONAL_GO",
      weightedScore: 71,
    };
  }

  if (prompt.includes("Fractional marketing consulting for boutique law firms")) {
    return {
      framework: {
        archetype: "consulting",
        label: "Coaching / Consulting Framework",
      },
      summary: {
        oneLiner: "The consulting offer is promising if the founder can prove authority and package the niche offer tightly.",
        topOpportunities: ["Clear niche", "High-value retainer potential"],
        biggestRisks: ["Need proof and authority signals"],
      },
      assumptions: ["Boutique firms will switch for clearer reporting and predictable lead flow."],
      missingInfo: ["No case studies or signed pilots yet."],
      criteria: [],
      problemDemand: {
        painLevel: 4.2,
        demandFrequency: 3.9,
        marketCoverage: 3.5,
        currentGap: 4,
        total: 15.6,
        passGate1: true,
        reasoning: "The target buyers have meaningful commercial pain.",
      },
      primarySegment: {
        name: "Boutique law firms",
        who: "Small firms needing better lead generation and reporting",
        jobToBeDone: "Acquire predictable matters without building an in-house growth team",
        currentPain: "Inconsistent leads and weak attribution",
        willingnessToPay: "High enough for a retainer",
        reachChannels: ["LinkedIn", "Email outreach", "Industry referrals"],
        scores: {
          reachability: 3.9,
          painLevel: 4.2,
          payingCapability: 4.1,
          total: 12.2,
        },
        reasoning: "The segment is narrow and reachable.",
      },
      solutionValidation: {
        painCoverage: 4,
        differentiation: 3.8,
        adoptionFriction: 2.4,
        score: 3.9,
        passGate3: true,
        reasoning: "The offer is easy to pilot if framed around outcomes.",
      },
      marketValidation: {
        tam: 96000000,
        sam: 12000000,
        som: 900000,
        confidence: 0.7,
        passGate4: true,
        reasoning: "There is enough niche demand for a boutique consulting offer.",
      },
      businessModelValidation: {
        model: "Monthly consulting retainer",
        entryPrice: 1500,
        anchorPrice: 4500,
        margin: 66,
        score: 4,
        passGate4: true,
        reasoning: "Retainers support strong economics if churn is controlled.",
      },
      operationalValidation: {
        score: 3.8,
        passGate5: true,
        keyConstraints: ["Proof", "Capacity planning"],
        reasoning: "A few clients can validate the model quickly.",
      },
      nextActions: [
        "Interview 10 boutique firms about lead-generation pain.",
        "Package a sharper offer and price test.",
        "Run an outbound campaign to land pilot clients.",
      ],
      decision: "CONDITIONAL_GO",
      weightedScore: 73,
    };
  }

  if (prompt.includes("remote fitness coach for new moms")) {
    return {
      framework: {
        archetype: "postpartum_fitness_coaching",
        label: "Postpartum Fitness Coaching Framework",
      },
      summary: {
        oneLiner:
          "This postpartum coaching concept has credible niche demand, but trust, safety positioning, and sustainable acquisition still need proof.",
        topOpportunities: [
          "A clear new-mom niche creates sharper positioning than general online fitness.",
          "Remote coaching can better match the schedule constraints of postpartum mothers.",
        ],
        biggestRisks: [
          "Safety and credential trust can block conversion.",
          "Free postpartum content competes for attention unless the coaching value is clearer.",
        ],
      },
      assumptions: [
        "New moms want more personalized accountability than free postpartum workouts provide.",
        "A flexible remote format can retain clients despite disrupted schedules.",
        "Trusted safety-first positioning can convert content into consultations or memberships.",
      ],
      missingInfo: [
        "Credentials, disclaimers, and coaching safety boundaries are not yet clear.",
        "No proof yet on CAC, retention, or referral channels.",
      ],
      criteria: [],
      problemDemand: {
        painLevel: 4.2,
        demandFrequency: 3.7,
        marketCoverage: 3.6,
        currentGap: 4.1,
        total: 15.6,
        passGate1: true,
        reasoning: "Postpartum recovery and fitness needs are real, recurring, and under-served by generic programs.",
      },
      primarySegment: {
        name: "Postpartum mothers",
        who: "New moms who want safe guidance rebuilding strength and confidence after birth",
        jobToBeDone: "Recover and regain fitness safely with support that fits a disrupted routine",
        currentPain: "Generic workouts feel unsafe, inconsistent, or unrealistic after birth",
        willingnessToPay: "Moderate if trust and personalization are clear",
        reachChannels: ["Instagram", "Mom communities", "Referral partners", "Email"],
        scores: {
          reachability: 3.4,
          painLevel: 4.2,
          payingCapability: 3.3,
          total: 10.9,
        },
        reasoning: "The niche is reachable, but trust and time constraints reduce easy conversion.",
      },
      solutionValidation: {
        painCoverage: 4.1,
        differentiation: 3.9,
        adoptionFriction: 2.8,
        score: 3.9,
        passGate3: true,
        reasoning: "Safety-conscious remote support is differentiated if the coach is credible.",
      },
      marketValidation: {
        tam: 84000000,
        sam: 11000000,
        som: 950000,
        confidence: 0.69,
        passGate4: true,
        directCompetitors: ["Generic online fitness coaches", "Postpartum workout creators"],
        indirectAlternatives: ["Free YouTube workouts", "Pelvic floor resources"],
        statusQuo: ["Using free content inconsistently"],
        reasoning: "The niche is viable, but market capture depends on positioning and retention.",
      },
      businessModelValidation: {
        model: "Remote coaching or membership hybrid",
        entryPrice: 49,
        anchorPrice: 149,
        margin: 64,
        score: 3.8,
        passGate4: true,
        reasoning: "The model can work if personalization and retention are strong enough.",
      },
      operationalValidation: {
        score: 3.3,
        passGate5: true,
        keyConstraints: ["Credentials", "Safety boundaries", "Retention systems"],
        reasoning: "Execution is feasible, but trust and safety processes need to be explicit.",
      },
      failureRisks: [
        {
          criterion: "Trust and credentials",
          score: 2,
          reason: "Weak proof of credentials or postpartum expertise could block trust with new moms.",
          severity: "high",
        },
        {
          criterion: "Safety and liability",
          score: 3,
          reason: "Unclear safety boundaries or disclaimers could create liability and conversion friction.",
          severity: "high",
        },
        {
          criterion: "Acquisition channels",
          score: 3,
          reason: "Sustainable acquisition may depend on creator content, partnerships, and referrals before paid ads work.",
          severity: "medium",
        },
      ],
      nextActions: [
        "Interview 10 postpartum moms about recovery goals, safety fears, and what generic programs miss.",
        "Build a landing page with a postpartum recovery checklist or safe core-rebuild guide.",
        "Test acquisition through Instagram, mom groups, and postpartum-health referral partners.",
      ],
      decision: "CONDITIONAL_GO",
      weightedScore: 68,
    };
  }

  if (prompt.includes("appointment booking app for a barber")) {
    return {
      framework: {
        archetype: "vertical_saas",
        label: "Vertical SaaS / SMB Software Framework",
      },
      summary: {
        oneLiner:
          "This barber-booking software concept has a clear vertical wedge, but willingness to pay, switching friction, and competitive differentiation still need proof.",
        topOpportunities: [
          "A barber-specific workflow can be more compelling than generic scheduling software",
          "Repeat appointments and client rebooking create real retention potential",
        ],
        biggestRisks: [
          "Incumbent booking tools already serve the category",
          "Shops may resist switching unless onboarding is extremely simple",
        ],
      },
      assumptions: [
        "Independent barbers and small shops feel enough scheduling pain to adopt a better workflow tool.",
        "Barbers will pay for simpler rebooking and client-management workflows.",
        "A narrow barber-first wedge can stand out from generic appointment software.",
      ],
      missingInfo: [
        "No proof yet of willingness to pay from barbershops.",
        "Switching and migration friction have not been tested with live bookings.",
      ],
      criteria: [],
      problemDemand: {
        painLevel: 3.8,
        demandFrequency: 4.1,
        marketCoverage: 3.5,
        currentGap: 3.7,
        total: 15.1,
        passGate1: true,
        reasoning: "Booking, reminders, and repeat-client management are real operator workflows.",
      },
      primarySegment: {
        name: "Independent barbers and barbershops",
        who: "Small appointment-based operators managing bookings and repeat clients",
        jobToBeDone: "Fill time slots, reduce no-shows, and manage repeat clients with less admin",
        currentPain: "Scheduling, confirmations, and client tracking are fragmented or manual",
        willingnessToPay: "Moderate if setup is simple and time savings are obvious",
        reachChannels: ["Instagram", "Barber communities", "Direct outreach", "Referral partners"],
        scores: {
          reachability: 3.2,
          painLevel: 4.0,
          payingCapability: 3.0,
          total: 10.2,
        },
        reasoning: "The niche is reachable, but SMB price sensitivity and switching friction reduce easy conversion.",
      },
      solutionValidation: {
        painCoverage: 3.8,
        differentiation: 3.0,
        adoptionFriction: 3.1,
        score: 3.2,
        passGate3: true,
        reasoning: "The workflow is useful, but the wedge must be sharper than generic scheduling tools.",
      },
      marketValidation: {
        tam: 95000000,
        sam: 14000000,
        som: 900000,
        confidence: 0.68,
        passGate4: true,
        directCompetitors: ["Booksy", "Fresha", "Square Appointments"],
        indirectAlternatives: ["Manual booking", "Instagram DMs", "Calendar tools"],
        statusQuo: ["Existing booking software", "Text-message scheduling"],
        reasoning: "The market is viable, but incumbents already cover the category.",
      },
      businessModelValidation: {
        model: "Monthly subscription per shop",
        entryPrice: 19,
        anchorPrice: 59,
        margin: 72,
        score: 3.4,
        passGate4: true,
        reasoning: "Software margins are strong, but SMB willingness to pay is still uncertain.",
      },
      operationalValidation: {
        score: 2.8,
        passGate5: true,
        keyConstraints: ["Migration friction", "Support burden", "Feature creep risk"],
        reasoning: "Execution is possible, but onboarding and scope control will determine whether the MVP stays simple enough.",
      },
      failureRisks: [
        {
          criterion: "Switching friction and migration",
          score: 2,
          reason: "Barbers may not switch unless import, setup, and day-one booking flow are nearly frictionless.",
          severity: "high",
        },
        {
          criterion: "Competitive moat",
          score: 2,
          reason: "Booksy, Fresha, and Square Appointments already cover much of the basic booking problem.",
          severity: "high",
        },
        {
          criterion: "Willingness to pay",
          score: 3,
          reason: "Small shops may like the concept but still resist paying unless the ROI is immediate and obvious.",
          severity: "medium",
        },
      ],
      nextActions: [
        "Interview 10 barbers about booking pain, rebooking behavior, and what they use today.",
        "Test a barber-specific landing page with a clear monthly price and design-partner offer.",
        "Validate switching friction by manually migrating one pilot shop's bookings and client list.",
      ],
      decision: "CONDITIONAL_GO",
      weightedScore: 70,
    };
  }

  return {
    framework: {
      archetype: "ecommerce_product",
      label: "Ecommerce Framework",
    },
    summary: {
      oneLiner: "The product concept is viable if retention and acquisition can be proven.",
      topOpportunities: ["Repeat purchase", "Giftability"],
      biggestRisks: ["Acquisition cost", "Retention variance"],
    },
    assumptions: ["Subscribers will value curation enough to stay enrolled."],
    missingInfo: ["No retention or reorder proof yet."],
    criteria: [],
    problemDemand: {
      painLevel: 3.8,
      demandFrequency: 3.7,
      marketCoverage: 3.9,
      currentGap: 3.8,
      total: 15.2,
      passGate1: true,
      reasoning: "The product serves recurring discovery and convenience demand.",
    },
    primarySegment: {
      name: "Coffee enthusiasts",
      who: "Consumers who want curated coffee discovery at home",
      jobToBeDone: "Get high-quality beans without researching every purchase",
      currentPain: "Finding and rotating quality beans is time-consuming",
      willingnessToPay: "Moderate",
      reachChannels: ["Instagram", "Influencers", "Email"],
      scores: {
        reachability: 3.8,
        painLevel: 3.8,
        payingCapability: 3.5,
        total: 11.1,
      },
      reasoning: "The niche is reachable through content and paid social.",
    },
    solutionValidation: {
      painCoverage: 3.9,
      differentiation: 3.5,
      adoptionFriction: 2.1,
      score: 3.8,
      passGate3: true,
      reasoning: "The subscription format is straightforward to test.",
    },
    marketValidation: {
      tam: 78000000,
      sam: 14000000,
      som: 850000,
      confidence: 0.68,
      passGate4: true,
      reasoning: "There is enough niche demand for a curated subscription product.",
    },
    businessModelValidation: {
      model: "Subscription box",
      entryPrice: 35,
      anchorPrice: 49,
      margin: 48,
      score: 3.7,
      passGate4: true,
      reasoning: "Margins can work if churn and shipping are controlled.",
    },
    operationalValidation: {
      score: 3.4,
      passGate5: true,
      keyConstraints: ["Sourcing", "Shipping", "Retention"],
      reasoning: "The logistics are manageable with disciplined operations.",
    },
    nextActions: [
      "Test pricing and landing-page conversion.",
      "Validate retention assumptions with a pilot cohort.",
      "Estimate shipping and sourcing margins before launch.",
    ],
    decision: "CONDITIONAL_GO",
    weightedScore: 69,
  };
}

describe("business category routing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.ENABLE_AI_VALIDATION = "true";
    process.env.OPENAI_API_KEY = "test-openai-key";
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.PERPLEXITY_API_KEY;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        const prompt = extractPrompt(init);
        if (prompt.includes("Infer business category and target-country context")) {
          return openAIResponse(buildContextResponse(prompt));
        }

        return openAIResponse(buildAnalysisResponse(prompt));
      })
    );
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("classifies a physical subscription box as ecommerce instead of saas", () => {
    const result = classifyCategory({
      idea: COFFEE_SUBSCRIPTION_IDEA,
    });

    expect(result.category).toBe("ecommerce");
    expect(result.confidence).toBeGreaterThan(0.85);
  });

  it("keeps website generation mandatory for validation results", async () => {
    const result = await validateIdeaDynamic({
      idea: COFFEE_SUBSCRIPTION_IDEA,
      locale: "en",
    });

    expect(result.category).toBe("ecommerce");
    expect(result.buildTriggered).toBe(true);
    expect(result.buildJobs.some((job) => job.type === "website")).toBe(true);
  });

  it("routes an in-person wellness studio to local service instead of coaching", async () => {
    const classification = classifyCategory({
      idea: WELLNESS_STUDIO_IDEA,
    });

    expect(classification.category).toBe("local_service");
    expect(classification.confidence).toBeGreaterThan(0.85);
    expect(classification.alternativeCategories[0]?.category).toBe("health_wellness");

    const result = await validateIdeaDynamic({
      idea: WELLNESS_STUDIO_IDEA,
      locale: "en",
    });

    expect(result.category).toBe("local_service");
    expect(result.framework?.archetype).toBe("local_service_business");
    expect(result.framework?.label).toBe("Local Service Business");
    expect(result.failureRisks.some((risk) => /online education|coaching framework|coaching-specific/i.test(risk.reason))).toBe(false);
    expect(result.nextActions.join(" ")).toMatch(/location|membership|local|launch|pilot|booking|referral/i);

    const pipelineResult = await runBusinessValidationPipeline({
      idea: WELLNESS_STUDIO_IDEA,
      locale: "en",
    });

    expect(pipelineResult.businessCategory).toBe("local_service");
    expect(pipelineResult.frameworkUsed).toBe("local_service_v1");
    expect(pipelineResult.overall_score).toBeGreaterThanOrEqual(50);
    expect(pipelineResult.keyRisks?.join(" ")).not.toMatch(/online education|coaching framework|coaching-specific/i);
    expect(pipelineResult.recommendedNextSteps?.[0]).not.toMatch(/validation website/i);
    expect(pipelineResult.recommendedNextSteps?.join(" ")).toMatch(/segment|neighborhood|package|interview|local/i);
  });

  it("maps consulting ideas into the coaching and consulting validation framework", async () => {
    const pipelineResult = await runBusinessValidationPipeline({
      idea: CONSULTING_IDEA,
      locale: "en",
      targetCustomer: "Boutique law firms",
      offer: "Fractional marketing consulting retainer",
      problem: "Lead generation is inconsistent and reporting is unclear",
    });

    expect(pipelineResult.businessCategory).toBe("coaching_consulting");
    expect(pipelineResult.frameworkUsed).toBe("coaching_consulting_v1");
    expect(pipelineResult.selectedFramework?.frameworkLabel).toMatch(/Coaching \/ Consulting/i);
    expect(pipelineResult.scores?.monetization).toBeGreaterThanOrEqual(0);
    expect(pipelineResult.recommendedTests?.join(" ")).toMatch(/interview|offer|pricing|campaign/i);
  });

  it("specializes real estate agent businesses into a professional local service model", async () => {
    const pipelineResult = await runBusinessValidationPipeline({
      idea: REAL_ESTATE_AGENT_IDEA,
      locale: "en",
      targetCustomer: "First-time homebuyers in Atlanta",
      location: "Atlanta",
      offer: "Buyer representation and education-first homebuying guidance",
      problem: "First-time buyers need more guidance, trust, and clarity during the homebuying process",
    });

    expect(pipelineResult.businessCategory).toBe("professional_local_service");
    expect(pipelineResult.categoryRouting?.subcategory).toBe("real_estate_agent");
    expect(pipelineResult.inferredBusinessModel?.businessModelType).toBe("trust_based_high_ticket_local_service");
    expect(pipelineResult.frameworkUsed).toBe("real_estate_agent_v1");
    expect(pipelineResult.selectedFramework?.frameworkLabel).toBe("Real Estate Agent Framework");
    expect(pipelineResult.selectedFramework?.criteria.join(" ")).toMatch(/housing demand|lead generation|trust|licensing|sales cycle/i);
    expect(pipelineResult.keyRisks?.join(" ")).toMatch(/licensing|brokerage|competition|financing|trust/i);
    expect(pipelineResult.assumptionsToTest?.join(" ")).toMatch(/first-time homebuyers|education-first|acquisition cost/i);
    expect(pipelineResult.recommendedNextSteps?.join(" ")).toMatch(/landing page|guide|licensing|niche|content|consultation/i);
    expect(pipelineResult.overall_score).toBeGreaterThanOrEqual(60);
  });

  it("routes postpartum remote coaching into a wellness-coaching validation path", async () => {
    const classification = classifyCategory({
      idea: POSTPARTUM_FITNESS_IDEA,
    });

    expect(classification.category).toBe("health_wellness");
    expect(classification.confidence).toBeGreaterThan(0.85);

    const pipelineResult = await runBusinessValidationPipeline({
      idea: POSTPARTUM_FITNESS_IDEA,
      locale: "en",
      targetCustomer: "Postpartum moms",
      offer: "Remote postpartum fitness coaching with accountability and safe recovery guidance",
      problem: "New moms struggle to find safe, personalized fitness support that fits their schedule after birth",
    });

    expect(pipelineResult.businessCategory).toBe("coaching_wellness_service");
    expect(pipelineResult.categoryRouting?.subcategory).toBe("postpartum_fitness_coaching");
    expect(pipelineResult.inferredBusinessModel?.businessModelType).toBe("remote_coaching_digital_service");
    expect(pipelineResult.frameworkUsed).toBe("postpartum_fitness_coaching_v1");
    expect(pipelineResult.selectedFramework?.frameworkLabel).toBe("Postpartum Fitness Coaching Framework");
    expect(pipelineResult.selectedFramework?.criteria.join(" ")).toMatch(/postpartum demand|trust|safety|willingness to pay|time constraints/i);
    expect(pipelineResult.researchSummary?.competitionNotes.join(" ")).not.toMatch(/Coursera|Udemy|corporate training|LinkedIn Learning/i);
    expect(pipelineResult.researchSummary?.marketTrends.join(" ")).not.toMatch(/corporate training|career|curriculum/i);
    expect(pipelineResult.keyRisks?.join(" ")).toMatch(/trust|credential|safety|liability|retention/i);
    expect(pipelineResult.recommendedNextSteps?.join(" ")).toMatch(/landing page|checklist|guide|instagram|mom|referral/i);
    expect(pipelineResult.recommendedNextSteps?.join(" ")).not.toMatch(/curriculum|career|income/i);

    const weightedOverall = Math.round(
      pipelineResult.scores!.market_demand * 0.2 +
        pipelineResult.scores!.monetization * 0.14 +
        pipelineResult.scores!.competition * 0.11 +
        pipelineResult.scores!.acquisition * 0.14 +
        pipelineResult.scores!.execution_feasibility * 0.14 +
        pipelineResult.scores!.differentiation * 0.12 +
        pipelineResult.scores!.risk * 0.15
    );

    expect(pipelineResult.overall_score).toBe(weightedOverall);
  });

  it("keeps software for barbers in a vertical SaaS validation path instead of local service", async () => {
    const classification = classifyCategory({
      idea: BARBER_VERTICAL_SAAS_IDEA,
    });

    expect(classification.category).toBe("saas");
    expect(classification.alternativeCategories[0]?.category).toBe("local_service");

    const pipelineResult = await runBusinessValidationPipeline({
      idea: BARBER_VERTICAL_SAAS_IDEA,
      locale: "en",
      targetCustomer: "Independent barbers and small barbershops",
      offer: "Booking and lightweight client-management software for barbers",
      problem: "Barbers lose time to manual scheduling, no-shows, and weak client follow-up",
      pricingIdea: "$29/month per shop",
    });

    expect(pipelineResult.businessCategory).toBe("saas");
    expect(pipelineResult.categoryRouting?.subcategory).toBe("vertical_saas");
    expect(pipelineResult.inferredBusinessModel?.businessModelType).toBe("vertical_saas_workflow_software");
    expect(pipelineResult.inferredBusinessModel?.segment).toBe("barbers_barbershops");
    expect(pipelineResult.frameworkUsed).toBe("vertical_saas_v1");
    expect(pipelineResult.selectedFramework?.frameworkLabel).toBe("Vertical SaaS / SMB Software Framework");
    expect(pipelineResult.selectedFramework?.criteria.join(" ")).toMatch(/switching friction|workflow depth|retention|feature bloat/i);
    expect(pipelineResult.researchSummary?.competitionNotes.join(" ")).toMatch(/Booksy|Fresha|Square Appointments|barber/i);
    expect(pipelineResult.researchSummary?.monetizationNotes.join(" ")).toMatch(/barbers|switch|monthly/i);
    expect(pipelineResult.keyRisks?.join(" ")).toMatch(/switch|incumbent|feature bloat|pay/i);
    expect(pipelineResult.recommendedNextSteps?.join(" ")).toMatch(/barbers|design-partner|switching friction|landing page|interview/i);
    const expectedDecision =
      pipelineResult.overall_score! >= 80
        ? "GO"
        : pipelineResult.overall_score! >= 65
          ? "CONDITIONAL_GO"
          : pipelineResult.overall_score! >= 50
            ? "NEED_WORK"
            : "NO_GO";
    expect(pipelineResult.frameworkReport?.decision).toBe(expectedDecision);
  });
});
