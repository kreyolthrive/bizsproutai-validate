import { ENGINE_VERSION } from "../constants";
import { getDefaultFrameworkGuideId, getFrameworkGuide, getFrameworkGuideCatalog, type FrameworkGuide } from "../frameworkGuides";
import type {
  CriterionResult,
  CountryDetection,
  DynamicValidationResult,
  FailureRisk,
  FixSuggestion,
  FrameworkDecision,
  Locale,
  Region,
  ScoreBand,
  SimplifiedFrameworkReport,
  SimplifiedGateResult,
  ValidationInput,
  Verdict,
} from "../types";
import type { LoadedFramework } from "./loadFramework";
import type { CategoryClassification } from "./classifyCategory";
import type { ProviderName } from "../providers/router";
import { getAvailableProviders } from "../providers/router";
import { triggerBuildFlow } from "./triggerBuildFlow";
import { categorySchemas, countrySchemas } from "../schemas";
import { detectCountry } from "./detectCountry";
import {
  classifyCategory,
  hasInPersonWellnessServiceSignals,
  hasPhysicalProductSubscriptionSignals,
  hasVerticalSaasSignals,
} from "./classifyCategory";

type AIValidationContext = {
  input: ValidationInput;
  locale: Locale;
  category: LoadedFramework["category"];
  framework: LoadedFramework;
  frameworkGuide: FrameworkGuide;
  country: DynamicValidationResult["country"];
  categoryClassification: CategoryClassification;
  businessModel?: {
    subcategory?: string;
    businessModelType?: string;
    segment?: string;
    frameworkHint?: string;
  };
};

type AIResolvedContext = {
  category: LoadedFramework["category"];
  country: CountryDetection;
  categoryClassification: CategoryClassification;
  subcategory?: string;
  businessModelType?: string;
  segment?: string;
  frameworkHint?: string;
};

type RawCriterion = {
  key?: string;
  label?: string;
  score?: number;
  evidence?: unknown;
  risks?: unknown;
  recommendations?: unknown;
};

type RawGate = {
  gate?: number;
  name?: string;
  score?: number;
  maxScore?: number;
  passed?: boolean;
  status?: string;
  blockedByGate?: number;
  reasoning?: string;
};

type RawPillarAnalysis = {
  key?: string;
  score?: number;
  status?: string;
  summary?: string;
  advice?: unknown;
  questions?: unknown;
  evidence?: unknown;
};

type RawAIAnalysis = {
  framework?: {
    archetype?: string;
    label?: string;
  };
  summary?: {
    oneLiner?: string;
    topOpportunities?: unknown;
    biggestRisks?: unknown;
  };
  assumptions?: unknown;
  missingInfo?: unknown;
  criteria?: RawCriterion[];
  problemDemand?: {
    painLevel?: number;
    demandFrequency?: number;
    marketCoverage?: number;
    currentGap?: number;
    total?: number;
    passGate1?: boolean;
    keyInsight?: string;
    reasoning?: string;
  };
  primarySegment?: {
    name?: string;
    who?: string;
    jobToBeDone?: string;
    currentPain?: string;
    willingnessToPay?: string;
    reachChannels?: unknown;
    scores?: {
      reachability?: number;
      painLevel?: number;
      payingCapability?: number;
      total?: number;
    };
    reasoning?: string;
  };
  solutionValidation?: {
    painCoverage?: number;
    differentiation?: number;
    adoptionFriction?: number;
    score?: number;
    passGate3?: boolean;
    reasoning?: string;
  };
  marketValidation?: {
    tam?: number;
    sam?: number;
    som?: number;
    confidence?: number;
    passGate4?: boolean;
    directCompetitors?: unknown;
    indirectAlternatives?: unknown;
    statusQuo?: unknown;
    reasoning?: string;
  };
  businessModelValidation?: {
    model?: string;
    entryPrice?: number;
    anchorPrice?: number;
    margin?: number;
    score?: number;
    passGate4?: boolean;
    reasoning?: string;
  };
  operationalValidation?: {
    score?: number;
    passGate5?: boolean;
    keyConstraints?: unknown;
    reasoning?: string;
  };
  gates?: RawGate[];
  failureRisks?: Array<{
    criterion?: string;
    score?: number;
    reason?: string;
    severity?: string;
  }>;
  fixes?: Array<{
    issue?: string;
    action?: string;
    expectedImpact?: string;
  }>;
  alternatives?: Array<{
    model?: string;
    reason?: string;
    viability?: number;
  }>;
  nextActions?: unknown;
  decision?: FrameworkDecision;
  weightedScore?: number;
  pillarAnalysis?: RawPillarAnalysis[];
  nextExperiments?: unknown;
  pathForward?: string;
  constructiveVerdict?: string;
};

type RawAIContextInference = {
  category?: string;
  subcategory?: string;
  businessModelType?: string;
  segment?: string;
  frameworkHint?: string;
  countryCode?: string;
  region?: string;
  categoryConfidence?: number;
  countryConfidence?: number;
  categoryEvidence?: unknown;
  countryEvidence?: unknown;
};

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
const PERPLEXITY_ENDPOINT = "https://api.perplexity.ai/chat/completions";

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
const PERPLEXITY_MODEL = process.env.PERPLEXITY_MODEL || "sonar-pro";
const REQUEST_TIMEOUT_MS = 45_000;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toScoreBand(value: number): ScoreBand {
  return clamp(Math.round(value), 1, 5) as ScoreBand;
}

function toVerdict(scoreBand: ScoreBand): Verdict {
  if (scoreBand >= 4) return "go";
  if (scoreBand >= 3) return "caution";
  return "pivot";
}

function toStatus(decision: FrameworkDecision): DynamicValidationResult["status"] {
  if (decision === "GO") return "GO";
  if (decision === "PIVOT_RECOMMENDED") return "REFINE";
  return "FIX";
}

const PROVIDER_FAILOVER_ORDER: Array<Exclude<ProviderName, "heuristic">> = ["claude", "perplexity", "chatgpt"];
const AI_PROVIDER_NAMES = new Set<ProviderName>(["claude", "perplexity", "chatgpt"]);

function isAIProvider(provider: ProviderName): provider is Exclude<ProviderName, "heuristic"> {
  return AI_PROVIDER_NAMES.has(provider) && provider !== "heuristic";
}

function getAIProviderChain(): Array<Exclude<ProviderName, "heuristic">> {
  if (process.env.ENABLE_AI_VALIDATION === "false") {
    return [];
  }

  const available = new Set(getAvailableProviders().filter(isAIProvider));
  return PROVIDER_FAILOVER_ORDER.filter((provider) => available.has(provider));
}

function toStringArray(value: unknown, maxItems = 3): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function toText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function extractJsonObject(text: string): RawAIAnalysis {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/i);
  const candidate = fenceMatch?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("AI provider did not return JSON.");
  }

  return JSON.parse(candidate.slice(start, end + 1)) as RawAIAnalysis;
}

function extractContextJsonObject(text: string): RawAIContextInference {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/i);
  const candidate = fenceMatch?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start < 0 || end < start) {
    throw new Error("AI provider did not return context JSON.");
  }

  return JSON.parse(candidate.slice(start, end + 1)) as RawAIContextInference;
}

function buildPillarInstructions(category: string, context?: { input?: { idea?: string } }): string {
  const categoryInstructions: Record<string, string> = {
    saas: `SaaS/Software framework:
- Problem & Demand: Is the problem painful and frequent? Are people using workarounds (spreadsheets, hacks, multiple tools)? If weak: "Talk to 10-20 target users and collect specific stories of when this problem hurt them." "Try a simple manual service version before writing code."
- Customer & Context Fit: Clear ICP (role, company size, industry)? Budget and tech maturity to adopt SaaS? If weak: "Tighten your audience from 'businesses' to one niche (e.g., B2B agencies 5-20 people)." "Check how they currently buy software."
- Competition & Differentiation: What tools do they use today? Is your wedge clearly different (faster, cheaper, localized)? If weak: "Write a one-sentence comparison vs the top 2 tools: 'Unlike X, we...'." "Focus on one workflow or vertical."
- Business Model & Money: Pricing model clear (per user, per account, per transaction)? LTV supports CAC? If weak: "Test 2-3 price points with potential customers before building." "Offer a simple entry plan."
- Acquisition & Channels: How will you reach your ICP? Communities, marketplaces, partners? If weak: "List 3 places your ICP hangs out and plan one test in each."
- Execution & Founder Fit: Tech/product skills? V1 scope realistic? If weak: "Shrink the v1 to one critical workflow you can ship in 4-8 weeks."`,

    local_service: `Local Service Business framework (cleaning, salon, tutoring, handyman):
- Problem & Demand: Service needed regularly in the area? People already paying for it? If weak: "Talk to 10 neighbors or local businesses." "Check how many similar providers exist within 5-10 km."
- Customer & Context Fit: Who exactly (students, families, offices)? Within reachable radius? If weak: "Pick one primary segment and design your offer just for them first."
- Competition & Differentiation: How many similar providers? What makes people choose you first? If weak: "List 3 ways to clearly stand out (faster, specialized, mobile, premium)."
- Business Model & Money: After costs (transport, supplies), enough profit per job? Repeat clients? If weak: "Create simple bundles or subscriptions (weekly, monthly) for recurring revenue."
- Acquisition & Channels: How will customers find you (WhatsApp, Facebook, flyers, referrals)? If weak: "Start with referrals and WhatsApp. Aim for first 5-10 clients this way."
- Execution & Founder Fit: Skills/equipment? Regulations/certifications? If weak: "Start with minimal setup and validate demand before buying more equipment."`,

    ecommerce: `Ecommerce framework:
- Problem & Demand: Is there real demand for this product? Are people actively searching for it? If weak: "Validate with a simple landing page or marketplace listing before investing in inventory."
- Customer & Context Fit: Clear buyer persona? Buying behavior online? If weak: "Define your ideal customer's age, income, shopping habits, and where they currently buy."
- Competition & Differentiation: How saturated is the market? Unique angle? If weak: "Find an underserved niche or unique product angle that big players ignore."
- Business Model & Money: Margins after COGS, shipping, returns? If weak: "Calculate true per-unit economics including packaging, shipping, returns, and ads."
- Acquisition & Channels: Traffic sources (social, SEO, marketplace, ads)? If weak: "Start with one channel you can master and test with <$200 in ads."
- Execution & Founder Fit: Supply chain ready? Fulfillment capacity? If weak: "Start with dropshipping or small batches to test before scaling inventory."`,

    coaching: `Online Education / Coaching framework:
- Problem & Demand: Clear transformation (pass exam, get job, skill)? People already buying courses/coaching? If weak: "Write your promise as 'In X weeks, I help Y do Z' and test interest."
- Customer & Context Fit: Time, internet, and money to participate? Cultural attitudes to paying coaches? If weak: "Run a small cohort or 1-1 beta with 3-5 people to learn before scaling."
- Competition & Differentiation: Free/cheap alternatives (YouTube, MOOCs)? Why choose you? If weak: "Lean on accountability, community, and local context instead of just content."
- Business Model & Money: Pricing vs income in region? Group vs 1-1 vs self-paced? If weak: "Pre-sell a cohort with a clear date and curriculum before recording everything."
- Acquisition & Channels: Audience already (email list, social following)? If weak: "Host a free workshop or challenge as a feeder into your paid offer."
- Execution & Founder Fit: Expertise and credibility? Time to deliver live? If weak: "Start with a small, time-bound program to test energy and results."`,

    consulting: `Agency / Freelancer / Marketing Services framework:
- Problem & Demand: Do target clients already pay for this outcome? Pain clear and urgent? If weak: "Reframe from 'I do marketing' to 'I get X result for Y niche'."
- Customer & Context Fit: Clear niche (restaurants, coaches, real estate)? Can they afford fees? If weak: "Pick one narrow niche and talk to 5-10 prospects."
- Competition & Differentiation: How many similar agencies? What makes you different? If weak: "Design 1-2 simple offers with outcomes and timelines instead of vague services."
- Business Model & Money: Pricing (retainer, project, performance)? Minimum clients needed? If weak: "Calculate: target income / average retainer = clients needed."
- Acquisition & Channels: Referrals, cold outreach, inbound content? Social proof? If weak: "Plan a 30-day outreach sprint: DMs, calls, and valuable content."
- Execution & Founder Fit: Skills in delivery? Can deliver consistently? If weak: "Start with a smaller promise you can over-deliver on to build testimonials."`,

    restaurant: `Restaurant / Food Truck framework:
- Problem & Demand: Is there demand for this cuisine/price point/location? Lines at similar places, or gaps at key hours? If weak: "Run a pop-up or delivery-only test weekend before committing to a full venue."
- Customer & Context Fit: Who are primary customers (office workers, students, families)? Enough nearby at meal times? If weak: "Map where your customers are at breakfast, lunch, dinner, and adapt hours/menu."
- Competition & Differentiation: How many similar food options nearby? Why would someone cross the street for you? If weak: "Define one hook: signature dish, speed, health angle, vibe, or story."
- Business Model & Money: Estimated daily covers vs break-even? Delivery vs dine-in mix? If weak: "Run basic math: rent/truck payment + salaries + ingredients vs realistic daily customers."
- Acquisition & Channels: How will people hear about you (walk-by, social, delivery apps)? Repeat customers? If weak: "Plan a simple loyalty mechanic (punch card, WhatsApp list, lunchtime deals)."
- Execution & Founder Fit: Experience running F&B? Supply chain reliability? If weak: "Start with a smaller format (cloud kitchen, food truck, pop-up) if risk feels high."`,
  };

  // Detect food-related ideas for restaurant framework
  const foodKeywords = /\b(restaurant|food\s*truck|cafe|bakery|catering|kitchen|cuisine|food\s*stand|diner|bistro|eatery|food\s*cart|taco|pizza|burger|sushi|ramen|bbq|grill|food\s*delivery)\b/i;

  // Map additional categories to their closest framework
  const categoryMap: Record<string, string> = {
    saas: "saas",
    tech: "saas",
    local_service: "local_service",
    health_wellness: "local_service",
    ecommerce: "ecommerce",
    marketplace: "ecommerce",
    coaching: "coaching",
    edtech: "coaching",
    consulting: "consulting",
    finance: "saas",
    legal_law: "consulting",
  };

  let frameworkKey = categoryMap[category] ?? "saas";

  // Override to restaurant framework for food-related local service ideas
  if ((category === "local_service" || category === "ecommerce") && foodKeywords.test(context?.input?.idea ?? "")) {
    frameworkKey = "restaurant";
  }

  return categoryInstructions[frameworkKey] ?? categoryInstructions.saas;
}

function buildPrompt(context: AIValidationContext): string {
  const { input, locale, category, framework, frameworkGuide, country, categoryClassification, businessModel } = context;

  const pillarGuide = buildPillarInstructions(category, { input });

  return JSON.stringify(
    {
      task: "Analyze this business idea using deep AI reasoning with category-specific 6-pillar validation. Return JSON only.",
      outputRequirements: {
        weightedScore: "0-100 integer (overall validation score)",
        criteriaScoreRange: "1-5 integer",
        gateScores: {
          gate1: "0-20",
          gate2: "0-15",
          gate3: "0-5",
          gate4: "0-5",
          gate5: "0-5",
        },
        pillarAnalysis: {
          description: "REQUIRED: Deep 6-pillar analysis. For EACH pillar, reason step-by-step about THIS specific idea.",
          format: "Array of 6 objects, one per pillar, in order",
          pillars: [
            { key: "problem_demand", label: "Problem & Demand" },
            { key: "customer_context_fit", label: "Customer & Context Fit" },
            { key: "competition_differentiation", label: "Competition & Differentiation" },
            { key: "business_model_money", label: "Business Model & Money" },
            { key: "acquisition_channels", label: "Acquisition & Channels" },
            { key: "execution_founder_fit", label: "Execution & Founder Fit" },
          ],
          perPillar: {
            key: "pillar key string (e.g., problem_demand)",
            score: "0-100 integer reflecting THIS idea's strength on this pillar",
            status: "strong (70+) | moderate (40-69) | weak (<40)",
            summary: "1-2 sentences in plain language explaining THIS idea's performance on this pillar. Be SPECIFIC to the idea, not generic.",
            advice: "Array of 2-3 specific, actionable 'How to improve or pivot' suggestions tailored to THIS idea",
            evidence: "Array of 1-3 specific observations from the idea that justify the score",
          },
        },
        constructiveVerdict: {
          values: ["promising_execution", "promising_needs_validation", "high_risk_improve_or_pivot"],
          rules: "Use promising_execution for weightedScore 70+, promising_needs_validation for 40-69, high_risk_improve_or_pivot for 0-39. NEVER say NO GO.",
        },
        pathForward: "1-2 sentence summary of recommended path forward for the founder",
        nextExperiments: "Array of 3-5 concrete experiments/next steps the founder can run in the real world (interviews, pre-sales, landing pages, pricing tests). These are ACTION ITEMS.",
        maxItems: {
          summaryBullets: 3,
          assumptions: "5 — CRITICAL: Each assumption must be a testable HYPOTHESIS about the market, customer, or business model. Frame as beliefs that need validation. Good examples: 'First-time buyers want more guided support than current agents provide', 'An education-first positioning increases trust and conversion', 'The target neighborhoods produce enough qualified buyers'. BAD (these are experiments, put in nextExperiments instead): 'Interview 15 buyers', 'Create a bootcamp', 'Start a newsletter', 'Shadow experienced agents'. If it starts with a verb telling the founder what to DO, it is an experiment, NOT an assumption.",
          missingInfo: 6,
          risks: 5,
          fixes: 5,
          alternatives: 4,
          nextActions: 5,
        },
      },
      businessIdea: {
        idea: input.idea,
        locale,
        category,
        subcategory: businessModel?.subcategory ?? null,
        businessModelType: businessModel?.businessModelType ?? null,
        segment: businessModel?.segment ?? null,
        targetCustomer: input.targetCustomer ?? null,
        targetMarket: input.targetMarket ?? null,
        location: input.location ?? null,
        offer: input.offer ?? null,
        problem: input.problem ?? null,
        pricingIdea: input.pricingIdea ?? null,
        budgetUsd: input.budgetUsd ?? null,
        skillSummary: input.skillSummary ?? null,
        channels: input.channels ?? [],
        timelineDays: input.timelineDays ?? null,
        experienceLevel: input.experienceLevel ?? null,
      },
      detectedContext: {
        countryCode: country.code,
        region: country.region,
        countryEvidence: country.evidence,
        categoryConfidence: categoryClassification.confidence,
        frameworkHint: businessModel?.frameworkHint ?? frameworkGuide.id,
        subcategory: businessModel?.subcategory ?? null,
        businessModelType: businessModel?.businessModelType ?? null,
        segment: businessModel?.segment ?? null,
        alternativeCategories: categoryClassification.alternativeCategories,
      },
      categorySpecificFramework: pillarGuide,
      frameworkGuide: {
        id: frameworkGuide.id,
        label: frameworkGuide.label,
        publicCategory: frameworkGuide.publicCategory,
        subcategory: frameworkGuide.subcategory ?? null,
        businessModelType: frameworkGuide.businessModelType ?? null,
        criteria: frameworkGuide.criteria,
        analysisInstructions: frameworkGuide.analysisInstructions,
      },
      framework: {
        category: framework.category,
        displayName: framework.displayName,
        criteria: framework.criteria,
        failurePatterns: framework.failurePatterns,
        alternativeModels: framework.alternativeModels,
        countryAdjustments: framework.countryAdjustments,
        regionContext: framework.regionContext,
      },
      instructions: [
        "CRITICAL: You MUST use deep AI reasoning to analyze THIS SPECIFIC business idea. Do NOT use shallow keyword matching or static category rules.",
        "Reason step-by-step through each of the 6 pillars using the categorySpecificFramework as your guide.",
        "For each pillar, think about: What specific evidence exists in the idea? What are the real-world conditions for this niche? What would actually help this founder?",
        `Use frameworkGuide.id=${frameworkGuide.id} as the primary analysis guide.`,
        "The 'pillarAnalysis' array is REQUIRED and is the most important part of the output. Each pillar MUST have a specific, non-generic summary and advice.",
        "Pillar summaries must reference THIS idea specifically (e.g., 'A hair salon in downtown Miami faces moderate competition from 15+ existing salons' NOT 'Competition exists in the area').",
        "Pillar advice must be actionable and specific (e.g., 'Offer a free first haircut to 20 walk-ins from the nearby WeWork office' NOT 'Consider marketing strategies').",
        "SCORING CALIBRATION (these thresholds are STRICT — the system auto-derives verdicts from the score):",
        "- weightedScore 70-100: Promising — focus on execution and testing. Clear demand, testable model, founder can act now.",
        "- weightedScore 40-69: Early stage — validate before building. Real signal exists but key assumptions untested.",
        "- weightedScore 0-39: High risk — improve or pivot. Major gaps in demand, model, or feasibility.",
        "PILLAR SCORES: Each pillar score is 0-100. Labels are auto-derived: 70+ = strong, 40-69 = moderate, 0-39 = weak.",
        "Do not be overly pessimistic. An idea with real demand but strong competition is early-stage (40-60), not high-risk.",
        "CONSTRUCTIVE GUIDANCE: Your job is to HELP users refine, improve, or pivot—never to reject.",
        "For ANY score: (1) specific ways to improve, (2) specific ways to test cheaply, (3) pivot suggestions if weak.",
        "In 'nextExperiments', ALWAYS provide 3-5 concrete real-world experiments (interviews, pre-sales, landing pages, pricing tests) that can be done in <1 week with <$100. This is REQUIRED regardless of score.",
        "In 'pathForward', give a clear 1-2 sentence recommendation for what the founder should do next.",
        "In 'constructiveVerdict', use ONLY: promising_execution (70+), promising_needs_validation (40-69), or high_risk_improve_or_pivot (0-39).",
        "Even for low-scoring ideas, identify the CORE INSIGHT that might be valuable and suggest how to reposition.",
        "If the idea concerns a restaurant or food truck: evaluate location demand, concept differentiation, daily cover math, and suggest starting smaller (pop-up, cloud kitchen) if risk is high.",
        "For vertical SaaS: evaluate target segment willingness to pay, switching friction, acquisition difficulty, and retention risk.",
        "RESEARCH SIGNALS: For topOpportunities and biggestRisks, include 1-2 niche-specific facts: typical pricing ranges, known competitors, relevant market trends. NEVER use vague global market numbers ($300B market) or half-sentences like 'No key insight was provided.'",
        "SECTION LIMITS: strengths (topOpportunities) 3-4 bullets, risks (biggestRisks) 3-5 bullets, assumptions 3-5 bullets, nextExperiments 3-5 items. Every bullet must be specific to THIS idea.",
        "DEDUPLICATION: Do NOT repeat the same point across strengths, risks, and assumptions. Each section must add unique information.",
        "QUALITY RULES FOR OUTPUT SECTIONS:",
        "- topOpportunities (strengths): Max 3-4 bullets. Each MUST be specific to THIS idea. Do NOT include generic macro facts (global market size, 'economic cycles', names of large consulting firms like McKinsey/BCG/Deloitte, '$300B market'). Do NOT use formulaic phrases that apply to any SaaS (like 'A focused vertical tool can feel more relevant' or 'Recurring workflow usage can create retention'). Good: 'Small shops frequently run out of key items, creating real urgency for automated reorder alerts.' Bad: 'A narrow MVP around one workflow can help.'",
        "- biggestRisks: Each risk must describe what could go WRONG, not what to DO about it. Good: 'You may struggle to stand out because the offer is too generic.' Bad: 'Pick one specific business size.' Risks should read as consequences, not instructions.",
        "- assumptions: Frame as testable HYPOTHESES about the market or customer, not action steps. Good: 'Small shops with 50+ SKUs feel enough inventory pain to pay for a dedicated tool.' Bad: 'Interview 15-20 shop owners.' Bad: 'Partner with local business associations.' If it tells the founder to DO something, it is an experiment, not an assumption.",
        "- failureRisks: Each reason must be a risk statement, not advice. Filter out action-item language (do not start with imperative verbs).",
        "- customer_context_fit: When assessing customer fit weakness, focus on BUDGET CONSTRAINTS, SWITCHING COSTS, and EXISTING ALTERNATIVES — not 'technical sophistication'. Most small business owners can use apps; the real barrier is whether they see enough value to switch from free/existing tools.",
        "- DEDUP: Do not repeat the same point across multiple sections. If something appears as a risk, do not also list it as an assumption. Each section should add new information.",
        "Do not add markdown, commentary, or code fences. Return one JSON object only.",
      ],
    },
    null,
    2
  );
}

function buildContextPrompt(input: ValidationInput, locale: Locale): string {
  const categoryOptions = Object.values(categorySchemas).map((schema) => ({
    category: schema.category,
    displayName: schema.displayName,
    cues: schema.criteria.map((criterion) => criterion.label).slice(0, 3),
    failurePatterns: schema.failurePatterns.map((pattern) => pattern.pattern).slice(0, 2),
  }));

  const countryOptions = Object.values(countrySchemas).map((country) => ({
    country: country.country,
    name: country.name,
    region: country.region,
    currency: country.currency,
    paymentRails: country.paymentRails.slice(0, 4),
  }));

  const frameworkOptions = getFrameworkGuideCatalog().map((guide) => ({
    id: guide.id,
    label: guide.label,
    category: guide.category,
    publicCategory: guide.publicCategory,
    subcategory: guide.subcategory ?? null,
    businessModelType: guide.businessModelType ?? null,
    cues: guide.cues,
    criteria: guide.criteria.slice(0, 5),
  }));

  return JSON.stringify(
    {
      task: "Infer business category and target-country context for a business idea. Return JSON only.",
      businessIdea: {
        idea: input.idea,
        locale,
        explicitCategory: input.category ?? null,
        targetMarket: input.targetMarket ?? null,
        location: input.location ?? null,
      },
      categoryOptions,
      frameworkOptions,
      countryOptions,
      instructions: [
        "Choose the best business category from categoryOptions.",
        "Choose the best matching frameworkHint from frameworkOptions. Prefer the most specific framework that matches the actual business model.",
        "CRITICAL: Distinguish carefully between software subscriptions and physical-product subscriptions.",
        "CRITICAL: Separate WHAT IS BEING BUILT from WHO IT SERVES. The product type determines category, not the customer segment.",
        "If customers pay repeatedly for shipped, delivered, boxed, or inventoried physical goods, classify it as ecommerce, not saas.",
        "Only classify as saas when the recurring payment is for software, a digital tool, a platform, or workflow automation.",
        "CRITICAL FOR VERTICAL SAAS: If the idea is software, an app, a platform, or a tool built FOR barbers, salons, spas, clinics, or other local-service operators, the category MUST be 'saas' and frameworkHint MUST be 'vertical_saas_v1'. The customer segment (barber, salon, etc.) defines the vertical niche, NOT the business category.",
        "Example: 'Build a booking app for a barber' = category: saas, frameworkHint: vertical_saas_v1, subcategory: vertical_saas, segment: barbers/barbershops",
        "Do not let a local-service customer segment override a software-product business model. Building software FOR a local service is SaaS, not local_service.",
        "The 'local_service' category is ONLY for when someone is OPERATING a local service business (being a barber, running a salon), NOT for building software tools for those operators.",
        "If the idea is an in-person studio, clinic, spa, wellness center, or appointment-based local business that the founder will OPERATE, prefer local_service over coaching or consulting.",
        "If the idea mixes classes, appointments, memberships, and wellness services in a physical location, treat coaching as a secondary offer rather than the main business model.",
        "If the idea is a remote fitness, nutrition, wellness, or postpartum coaching service, prefer health_wellness over edtech unless the main product is a course, curriculum, certification, or training platform.",
        "Do not classify remote wellness coaching as edtech just because it teaches habits or includes educational content.",
        "If the audience is postpartum women, new moms, or pregnancy recovery customers, favor a wellness-coaching framework that accounts for trust, safety, retention, and time constraints.",
        "When the business is a local professional service such as a real estate agent, lawyer, or advisor, distinguish the professional-service model from generic local services.",
        "If the idea is a real estate agent or brokerage-style service, keep category grounded in local/professional services but return subcategory and frameworkHint that reflect the real_estate_agent model when supported.",
        "Choose a countryCode only if the idea strongly points to one of the listed countryOptions; otherwise return null.",
        "If no listed country is strongly supported, still infer the likely region.",
        "Return category, subcategory, businessModelType, segment, frameworkHint, countryCode, region, categoryConfidence, countryConfidence, categoryEvidence, countryEvidence.",
        "Do not add markdown or prose outside the JSON object.",
      ],
    },
    null,
    2
  );
}

function buildSystemInstructions(): string {
  return [
    "You are BizSproutAI, an AI business validation assistant.",
    "Your job is to evaluate a single business idea in depth and give constructive, category-aware feedback and next steps.",
    "You must: Use AI + LLM reasoning to analyze this specific idea, its context, and its market.",
    "Classify the idea into the closest business category and load the matching validation framework.",
    "Reason step by step using the 6 pillars (Problem & Demand, Customer & Context Fit, Competition & Differentiation, Business Model & Money, Acquisition & Channels, Execution & Founder Fit).",
    "Generate scores and insights for each pillar based on deep analysis of THIS specific idea.",
    "Base your analysis on the current idea and context only, not on previous users or previous validations.",
    "You must NOT: Use shallow keyword matching or static rules as the main logic.",
    "You must NOT: Reuse cached text, stale reasoning, or generic filler. Every idea requires fresh reasoning.",
    "You must NOT: Output hard labels like 'GO' or 'NO GO'. Use constructive verdicts only.",
    "Be honest but encouraging: highlight risks clearly, then immediately show how to reduce those risks or consider a better angle.",
    "Return a single valid JSON object with the requested fields and no markdown.",
  ].join(" ");
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function requestOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const response = await fetchWithTimeout(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "developer", content: buildSystemInstructions() },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response did not include content.");
  }

  return content;
}

async function requestAnthropic(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

  const response = await fetchWithTimeout(ANTHROPIC_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 3000,
      system: buildSystemInstructions(),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = payload.content
    ?.filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Anthropic response did not include text.");
  }

  return text;
}

async function requestPerplexity(prompt: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY is not configured.");

  const response = await fetchWithTimeout(PERPLEXITY_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: PERPLEXITY_MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: buildSystemInstructions() },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Perplexity response did not include content.");
  }

  return content;
}

async function requestProvider(provider: ProviderName, prompt: string): Promise<string> {
  switch (provider) {
    case "chatgpt":
      return requestOpenAI(prompt);
    case "claude":
      return requestAnthropic(prompt);
    case "perplexity":
      return requestPerplexity(prompt);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

async function requestStructuredFromProviders<T>(
  prompt: string,
  purpose: string,
  parser: (text: string) => T
): Promise<{ provider: ProviderName; parsed: T }> {
  const providers = getAIProviderChain();

  if (providers.length === 0) {
    throw new Error(
      "AI validation is not configured. Add at least one provider key such as ANTHROPIC_API_KEY, PERPLEXITY_API_KEY, or OPENAI_API_KEY."
    );
  }

  const failures: string[] = [];

  for (const provider of providers) {
    try {
      const text = await requestProvider(provider, prompt);
      return {
        provider,
        parsed: parser(text),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${provider}: ${message}`);
    }
  }

  throw new Error(`All AI providers failed for ${purpose}. ${failures.join(" | ")}`);
}

function normalizeRegion(value: unknown): Region | null {
  if (
    value === "north_america" ||
    value === "caribbean" ||
    value === "latin_america" ||
    value === "africa" ||
    value === "europe" ||
    value === "asia"
  ) {
    return value;
  }

  return null;
}

function normalizeCategoryFromAI(value: unknown): LoadedFramework["category"] | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();

  return normalized in categorySchemas ? (normalized as LoadedFramework["category"]) : null;
}

function normalizeFrameworkHint(value: unknown, category: LoadedFramework["category"]): string {
  if (typeof value === "string") {
    const normalized = value.trim();
    if (getFrameworkGuide(normalized)) {
      return normalized;
    }
  }

  return getDefaultFrameworkGuideId(category);
}

function overrideCategoryForBusinessModel(
  proposedCategory: LoadedFramework["category"],
  fallbackCategory: CategoryClassification,
  input: ValidationInput
): {
  category: LoadedFramework["category"];
  confidenceFloor: number;
  evidence: string[];
  frameworkHintOverride?: string;
} {
  const combinedText = [
    input.idea,
    input.offer,
    input.problem,
    input.pricingIdea,
    input.targetCustomer,
    input.targetMarket,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n");

  if (hasPhysicalProductSubscriptionSignals(combinedText)) {
    return {
      category: "ecommerce",
      confidenceFloor: 0.88,
      evidence: [
        "Recurring-payment language is tied to delivery of physical goods",
        "Physical subscription-product signals override SaaS classification",
      ],
    };
  }

  if (hasVerticalSaasSignals(combinedText)) {
    return {
      category: "saas",
      confidenceFloor: 0.88,
      frameworkHintOverride: "vertical_saas_v1",
      evidence: [
        "The idea is software built for local-service operators, so the core business model is vertical SaaS",
        "Customer segment signals should shape the niche, not override the product model",
        "Using Vertical SaaS / SMB Software Framework for validation",
      ],
    };
  }

  if (hasInPersonWellnessServiceSignals(combinedText)) {
    return {
      category: "local_service",
      confidenceFloor: 0.84,
      evidence: [
        "In-person wellness studio / appointment signals outweigh coaching-only interpretation",
        "Dominant business model is local service with classes, appointments, or memberships",
      ],
    };
  }

  return {
    category: proposedCategory ?? fallbackCategory.category,
    confidenceFloor: proposedCategory === fallbackCategory.category ? fallbackCategory.confidence : 0.7,
    evidence: [],
  };
}

async function inferBusinessContextWithAI(
  input: ValidationInput,
  locale: Locale
): Promise<AIResolvedContext> {
  const { parsed: raw } = await requestStructuredFromProviders(
    buildContextPrompt(input, locale),
    "context inference",
    extractContextJsonObject
  );
  const fallbackCategoryClassification = classifyCategory({
    idea: input.idea,
    explicitCategory: input.category,
  });
  const fallbackCountry = detectCountry({
    idea: input.idea,
    locale,
    location: input.location,
    targetMarket: input.targetMarket,
  });

  const aiCategory = normalizeCategoryFromAI(raw.category) ?? input.category ?? fallbackCategoryClassification.category;
  const categoryOverride = overrideCategoryForBusinessModel(aiCategory, fallbackCategoryClassification, input);
  const category = categoryOverride.category;
  
  // Use frameworkHintOverride if set (e.g. for vertical SaaS), otherwise use AI-inferred or default
  let frameworkHint: string;
  if (categoryOverride.frameworkHintOverride) {
    frameworkHint = categoryOverride.frameworkHintOverride;
  } else if (category !== aiCategory) {
    frameworkHint = getDefaultFrameworkGuideId(category);
  } else {
    frameworkHint = normalizeFrameworkHint(raw.frameworkHint, category);
  }
  
  const categoryClassification: CategoryClassification = {
    category,
    confidence: clamp(
      typeof raw.categoryConfidence === "number"
        ? raw.categoryConfidence
        : categoryOverride.confidenceFloor,
      0.3,
      1
    ),
    alternativeCategories: fallbackCategoryClassification.alternativeCategories,
    evidence: [
      ...(toStringArray(raw.categoryEvidence, 4).length
        ? toStringArray(raw.categoryEvidence, 4)
        : fallbackCategoryClassification.evidence),
      ...categoryOverride.evidence,
    ].slice(0, 4),
  };

  const inferredRegion = normalizeRegion(raw.region) ?? fallbackCountry.region;
  const inferredCountryCode =
    typeof raw.countryCode === "string" && raw.countryCode.trim()
      ? raw.countryCode.trim().toUpperCase()
      : fallbackCountry.code;

  const country: CountryDetection = {
    code: inferredCountryCode,
    region: inferredRegion,
    confidence: clamp(
      typeof raw.countryConfidence === "number" ? raw.countryConfidence : fallbackCountry.confidence,
      0.3,
      1
    ),
    evidence: toStringArray(raw.countryEvidence, 4).length
      ? toStringArray(raw.countryEvidence, 4)
      : fallbackCountry.evidence,
  };

  return {
    category,
    country,
    categoryClassification,
    subcategory: typeof raw.subcategory === "string" && raw.subcategory.trim() ? raw.subcategory.trim() : undefined,
    businessModelType:
      typeof raw.businessModelType === "string" && raw.businessModelType.trim()
        ? raw.businessModelType.trim()
        : undefined,
    segment: typeof raw.segment === "string" && raw.segment.trim() ? raw.segment.trim() : undefined,
    frameworkHint,
  };
}

function computeWeightedScore(criteria: CriterionResult[], framework: LoadedFramework): number {
  const criteriaByKey = new Map(criteria.map((criterion) => [criterion.key, criterion]));
  const weighted = framework.criteria.reduce((total, criterion) => {
    const result = criteriaByKey.get(criterion.key);
    const score = result ? result.score / 5 : 0.4;
    return total + score * criterion.weight;
  }, 0);

  return Math.round(clamp(weighted * 100, 0, 100));
}

function buildCriteria(raw: RawAIAnalysis, framework: LoadedFramework): CriterionResult[] {
  return framework.criteria.map((criterion) => {
    const match = raw.criteria?.find(
      (item) =>
        item.key === criterion.key ||
        (typeof item.label === "string" &&
          item.label.trim().toLowerCase() === criterion.label.trim().toLowerCase())
    );

    return {
      key: criterion.key,
      label: criterion.label,
      weight: criterion.weight,
      score: toScoreBand(toNumber(match?.score, 3)),
      evidence: toStringArray(match?.evidence, 3),
      risks: toStringArray(match?.risks, 3),
      recommendations: toStringArray(match?.recommendations, 3).length
        ? toStringArray(match?.recommendations, 3)
        : criterion.fixSuggestions.slice(0, 3),
    };
  });
}

function deriveDecision(weightedScore: number, _gates: SimplifiedGateResult[]): FrameworkDecision {
  // Single source of truth: 0-39 pivot, 40-69 conditional, 70+ go
  // Aligned with decision.ts thresholds
  if (weightedScore >= 70) return "GO";
  if (weightedScore >= 40) return "CONDITIONAL_GO";
  return "PIVOT_RECOMMENDED";
}

function normalizeGates(raw: RawAIAnalysis, businessModelScore: number): SimplifiedGateResult[] {
  const problemDemand = raw.problemDemand ?? {};
  const primarySegment = raw.primarySegment?.scores ?? {};
  const solutionValidation = raw.solutionValidation ?? {};
  const businessModel = raw.businessModelValidation ?? {};
  const operationalValidation = raw.operationalValidation ?? {};

  const defaults: SimplifiedGateResult[] = [
    {
      gate: 1,
      name: "Problem & Demand",
      score: clamp(toNumber(problemDemand.total, 0), 0, 20),
      maxScore: 20,
      passed: !!problemDemand.passGate1,
      status: problemDemand.passGate1 ? "PASS" : "FAIL",
      reasoning: toText(problemDemand.reasoning, ""),
    },
    {
      gate: 2,
      name: "Customer & Location Fit",
      score: clamp(toNumber(primarySegment.total, 0), 0, 15),
      maxScore: 15,
      passed: clamp(toNumber(primarySegment.total, 0), 0, 15) >= 9,
      status: clamp(toNumber(primarySegment.total, 0), 0, 15) >= 9 ? "PASS" : "FAIL",
      reasoning: toText(raw.primarySegment?.reasoning, ""),
    },
    {
      gate: 3,
      name: "Competition & Differentiation",
      score: clamp(toNumber(solutionValidation.score, 0), 0, 5),
      maxScore: 5,
      passed: !!solutionValidation.passGate3,
      status: solutionValidation.passGate3 ? "PASS" : "FAIL",
      reasoning: toText(solutionValidation.reasoning, ""),
    },
    {
      gate: 4,
      name: "Business Model & Unit Economics",
      score: clamp(businessModelScore, 0, 5),
      maxScore: 5,
      passed: !!businessModel.passGate4,
      status: businessModel.passGate4 ? "PASS" : "FAIL",
      reasoning: toText(businessModel.reasoning, ""),
    },
    {
      gate: 5,
      name: "Operational Feasibility",
      score: clamp(toNumber(operationalValidation.score, 0), 0, 5),
      maxScore: 5,
      passed: !!operationalValidation.passGate5,
      status: operationalValidation.passGate5 ? "PASS" : "FAIL",
      reasoning: toText(operationalValidation.reasoning, ""),
    },
  ];

  return defaults.map((fallback) => {
    const provided = raw.gates?.find((gate) => gate.gate === fallback.gate);
    const status = provided?.status === "BLOCKED" || provided?.status === "PASS" || provided?.status === "FAIL"
      ? provided.status
      : fallback.status;

    return {
      gate: fallback.gate,
      name: toText(provided?.name, fallback.name),
      score: clamp(toNumber(provided?.score, fallback.score), 0, fallback.maxScore),
      maxScore: clamp(toNumber(provided?.maxScore, fallback.maxScore), 1, fallback.maxScore),
      passed: typeof provided?.passed === "boolean" ? provided.passed : fallback.passed,
      status,
      blockedByGate:
        typeof provided?.blockedByGate === "number" && provided.blockedByGate >= 1 && provided.blockedByGate <= 5
          ? (provided.blockedByGate as 1 | 2 | 3 | 4 | 5)
          : undefined,
      reasoning: toText(provided?.reasoning, fallback.reasoning),
    };
  });
}

function buildFailureRisks(raw: RawAIAnalysis, criteria: CriterionResult[]): FailureRisk[] {
  const provided = raw.failureRisks
    ?.map((risk) => {
      const severity =
        risk.severity === "critical" ||
        risk.severity === "high" ||
        risk.severity === "medium" ||
        risk.severity === "low"
          ? risk.severity
          : "medium";

      const reason = toText(risk.reason, "");
      if (!reason) return null;

      return {
        criterion: toText(risk.criterion, "general"),
        score: toScoreBand(toNumber(risk.score, 2)),
        reason,
        severity,
      } satisfies FailureRisk;
    })
    .filter((risk): risk is FailureRisk => Boolean(risk))
    .slice(0, 5);

  if (provided && provided.length > 0) {
    return provided;
  }

  return criteria
    .filter((criterion) => criterion.score <= 3)
    .flatMap((criterion) =>
      criterion.risks.slice(0, 1).map((risk) => ({
        criterion: criterion.label,
        score: criterion.score,
        reason: risk,
        severity: (criterion.score <= 2 ? "high" : "medium") as FailureRisk["severity"],
      }))
    )
    .slice(0, 5);
}

function buildFixes(raw: RawAIAnalysis, criteria: CriterionResult[]): FixSuggestion[] {
  const provided = raw.fixes
    ?.map((fix) => {
      const action = toText(fix.action, "");
      if (!action) return null;

      return {
        issue: toText(fix.issue, "Improve the weakest part of the concept."),
        action,
        expectedImpact: toText(fix.expectedImpact, "Increases confidence in the business model."),
      } satisfies FixSuggestion;
    })
    .filter((fix): fix is FixSuggestion => Boolean(fix))
    .slice(0, 5);

  if (provided && provided.length > 0) {
    return provided;
  }

  return criteria
    .filter((criterion) => criterion.score <= 3)
    .map((criterion) => ({
      issue: `Weakness in ${criterion.label}`,
      action: criterion.recommendations[0] ?? `Strengthen evidence for ${criterion.label}.`,
      expectedImpact: `Raises confidence in ${criterion.label.toLowerCase()}.`,
    }))
    .slice(0, 5);
}

function buildAlternatives(raw: RawAIAnalysis, framework: LoadedFramework) {
  const provided = raw.alternatives
    ?.map((alternative) => {
      const model = toText(alternative.model, "");
      if (!model) return null;

      return {
        model,
        reason: toText(alternative.reason, ""),
        viability: toScoreBand(toNumber(alternative.viability, 3)),
      };
    })
    .filter((alternative): alternative is NonNullable<typeof alternative> => Boolean(alternative))
    .slice(0, 4);

  if (provided && provided.length > 0) {
    return provided;
  }

  return framework.alternativeModels.slice(0, 4).map((model) => ({
    model,
    reason: "Derived from the category framework alternatives.",
    viability: 3 as ScoreBand,
  }));
}

export type AIGeneratedPillar = {
  key: string;
  score: number;
  status: "strong" | "moderate" | "weak";
  summary: string;
  advice: string[];
  evidence: string[];
};

export type AIGeneratedPillarData = {
  pillars: AIGeneratedPillar[];
  constructiveVerdict: string | null;
  pathForward: string | null;
  nextExperiments: string[];
};

const VALID_PILLAR_KEYS = new Set([
  "problem_demand",
  "customer_context_fit",
  "competition_differentiation",
  "business_model_money",
  "acquisition_channels",
  "execution_founder_fit",
]);

function extractAIPillarData(raw: RawAIAnalysis): AIGeneratedPillarData | null {
  if (!Array.isArray(raw.pillarAnalysis) || raw.pillarAnalysis.length === 0) {
    return null;
  }

  const pillars: AIGeneratedPillar[] = raw.pillarAnalysis
    .filter((p): p is RawPillarAnalysis => p !== null && typeof p === "object")
    .filter((p) => typeof p.key === "string" && VALID_PILLAR_KEYS.has(p.key))
    .map((p) => {
      const score = clamp(toNumber(p.score, 50), 0, 100);
      // ALWAYS derive status from score — never trust the LLM label
      const status: "strong" | "moderate" | "weak" =
        score >= 70 ? "strong" : score >= 40 ? "moderate" : "weak";

      return {
        key: p.key!,
        score,
        status,
        summary: toText(p.summary, ""),
        advice: toStringArray(p.advice, 3),
        evidence: toStringArray(p.evidence, 3),
      };
    });

  if (pillars.length < 3) {
    return null;
  }

  return {
    pillars,
    constructiveVerdict: typeof raw.constructiveVerdict === "string" ? raw.constructiveVerdict : null,
    pathForward: typeof raw.pathForward === "string" ? raw.pathForward : null,
    nextExperiments: toStringArray(raw.nextExperiments, 5),
  };
}

function buildFrameworkReport(
  raw: RawAIAnalysis,
  gates: SimplifiedGateResult[],
  weightedScore: number,
  decision: FrameworkDecision,
  businessModelScore: number
): SimplifiedFrameworkReport {
  const problemDemand = raw.problemDemand ?? {};
  const primarySegment = raw.primarySegment ?? {};
  const segmentScores = primarySegment.scores ?? {};
  const solutionValidation = raw.solutionValidation ?? {};
  const marketValidation = raw.marketValidation ?? {};
  const businessModelValidation = raw.businessModelValidation ?? {};
  const operationalValidation = raw.operationalValidation ?? {};

  return {
    oneLineSummary: toText(raw.summary?.oneLiner, ""),
    missingInfo: toStringArray(raw.missingInfo, 6),
    assumptions: toStringArray(raw.assumptions, 5),
    problemDemand: {
      painLevel: clamp(toNumber(problemDemand.painLevel, 0), 0, 5),
      demandFrequency: clamp(toNumber(problemDemand.demandFrequency, 0), 0, 5),
      marketCoverage: clamp(toNumber(problemDemand.marketCoverage, 0), 0, 5),
      currentGap: clamp(toNumber(problemDemand.currentGap, 0), 0, 5),
      total: clamp(toNumber(problemDemand.total, 0), 0, 20),
      passGate1: !!problemDemand.passGate1,
      keyInsight: toText(problemDemand.keyInsight, ""),
    },
    primarySegment: {
      name: toText(primarySegment.name, "Primary segment"),
      who: toText(primarySegment.who, "Target customer"),
      jobToBeDone: toText(primarySegment.jobToBeDone, "Solve a clear problem"),
      currentPain: toText(primarySegment.currentPain, "Pain point needs validation"),
      willingnessToPay: toText(primarySegment.willingnessToPay, "Unknown"),
      reachChannels: toStringArray(primarySegment.reachChannels, 5),
      scores: {
        reachability: clamp(toNumber(segmentScores.reachability, 0), 0, 5),
        painLevel: clamp(toNumber(segmentScores.painLevel, 0), 0, 5),
        payingCapability: clamp(toNumber(segmentScores.payingCapability, 0), 0, 5),
        total: clamp(toNumber(segmentScores.total, 0), 0, 15),
      },
    },
    solutionValidation: {
      painCoverage: clamp(toNumber(solutionValidation.painCoverage, 0), 0, 5),
      differentiation: clamp(toNumber(solutionValidation.differentiation, 0), 0, 5),
      adoptionFriction: clamp(toNumber(solutionValidation.adoptionFriction, 0), 0, 5),
      score: clamp(toNumber(solutionValidation.score, 0), 0, 5),
      passGate3: !!solutionValidation.passGate3,
    },
    marketValidation: {
      tam: Math.max(0, Math.round(toNumber(marketValidation.tam, 0))),
      sam: Math.max(0, Math.round(toNumber(marketValidation.sam, 0))),
      som: Math.max(0, Math.round(toNumber(marketValidation.som, 0))),
      confidence: clamp(toNumber(marketValidation.confidence, 0), 0, 1),
      passGate4: !!marketValidation.passGate4,
    },
    businessModelValidation: {
      model: toText(businessModelValidation.model, "Not specified"),
      entryPrice: Math.max(0, toNumber(businessModelValidation.entryPrice, 0)),
      anchorPrice: Math.max(0, toNumber(businessModelValidation.anchorPrice, 0)),
      margin: clamp(toNumber(businessModelValidation.margin, 0), 0, 100),
      passGate4: !!businessModelValidation.passGate4,
    },
    operationalValidation: {
      score: clamp(toNumber(operationalValidation.score, 0), 0, 5),
      passGate5: !!operationalValidation.passGate5,
      keyConstraints: toStringArray(operationalValidation.keyConstraints, 5),
    },
    weightedScore,
    decision,
    gates,
  };
}

export async function analyzeBusinessIdeaWithAI(
  context: AIValidationContext
): Promise<DynamicValidationResult> {
  const DEBUG = process.env.VALIDATION_DEBUG === "true";
  const prompt = buildPrompt(context);
  
  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][AI] Input idea: "${context.input.idea?.slice(0, 100)}..."`);
    console.log(`[VALIDATION_DEBUG][AI] Framework guide: ${context.frameworkGuide.id}`);
    console.log(`[VALIDATION_DEBUG][AI] Category: ${context.category}`);
    console.log(`[VALIDATION_DEBUG][AI] Subcategory: ${context.businessModel?.subcategory ?? "none"}`);
    console.log(`[VALIDATION_DEBUG][AI] BusinessModelType: ${context.businessModel?.businessModelType ?? "none"}`);
    console.log(`[VALIDATION_DEBUG][AI] Segment: ${context.businessModel?.segment ?? "none"}`);
    console.log(`[VALIDATION_DEBUG][AI] Prompt length: ${prompt.length} chars`);
  }
  
  const { parsed: raw } = await requestStructuredFromProviders(
    prompt,
    "business validation analysis",
    extractJsonObject
  );
  
  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][AI] Raw AI weightedScore: ${raw.weightedScore}`);
    console.log(`[VALIDATION_DEBUG][AI] Raw AI decision: ${raw.decision}`);
    console.log(`[VALIDATION_DEBUG][AI] Raw AI summary: ${raw.summary?.oneLiner?.slice(0, 80)}...`);
  }
  
  const criteria = buildCriteria(raw, context.framework);
  const weightedScore = clamp(
    Math.round(
      typeof raw.weightedScore === "number" ? raw.weightedScore : computeWeightedScore(criteria, context.framework)
    ),
    0,
    100
  );
  const businessModelScore = clamp(toNumber(raw.businessModelValidation?.score, 0), 0, 5);
  const gates = normalizeGates(raw, businessModelScore);

  // ALWAYS derive decision from score to ensure consistency
  const derivedDecision = deriveDecision(weightedScore, gates);
  const decision = derivedDecision;

  const overallScore = toScoreBand(weightedScore / 20);
  const failureRisks = buildFailureRisks(raw, criteria);
  const fixes = buildFixes(raw, criteria);
  const alternatives = decision !== "GO" ? buildAlternatives(raw, context.framework) : [];
  const frameworkReport = buildFrameworkReport(raw, gates, weightedScore, decision, businessModelScore);
  const buildResult = triggerBuildFlow({
    category: context.category,
    countryCode: context.country.code,
    locale: context.locale,
    ideaSummary: toText(raw.summary?.oneLiner, context.input.idea).slice(0, 140),
  });

  // Extract AI-generated pillar data from deep analysis
  const aiPillarData = extractAIPillarData(raw);

  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][AI] AI pillar data available: ${aiPillarData !== null}`);
    if (aiPillarData) {
      console.log(`[VALIDATION_DEBUG][AI] AI pillars: ${aiPillarData.pillars.map(p => `${p.key}:${p.score}`).join(", ")}`);
      console.log(`[VALIDATION_DEBUG][AI] AI verdict: ${aiPillarData.constructiveVerdict}`);
    }
  }

  return {
    status: toStatus(decision),
    category: context.category,
    framework: {
      archetype: toText(raw.framework?.archetype, context.framework.category),
      label: toText(raw.framework?.label, context.framework.displayName),
    },
    country: context.country,
    language: context.locale,
    overallScore,
    verdict: toVerdict(overallScore),
    summary: {
      oneLiner: toText(raw.summary?.oneLiner, ""),
      topOpportunities: toStringArray(raw.summary?.topOpportunities, 3),
      biggestRisks: toStringArray(raw.summary?.biggestRisks, 3),
    },
    failureRisks,
    fixes,
    alternatives,
    nextActions: toStringArray(raw.nextActions, 5).length
      ? toStringArray(raw.nextActions, 5)
      : fixes.map((fix) => fix.action).slice(0, 5),
    criteria,
    assumptions: toStringArray(raw.assumptions, 5),
    missingInfo: toStringArray(raw.missingInfo, 6),
    buildTriggered: buildResult.triggered,
    buildJobs: buildResult.jobs,
    frameworkReport,
    frameworkUsed: context.frameworkGuide.id,
    inferredBusinessModel: {
      primaryCategory: context.frameworkGuide.publicCategory,
      subcategory: context.businessModel?.subcategory ?? context.frameworkGuide.subcategory,
      businessModelType: context.businessModel?.businessModelType ?? context.frameworkGuide.businessModelType,
      segment: context.businessModel?.segment,
      frameworkId: context.frameworkGuide.id,
      confidence: Math.round(clamp(context.categoryClassification.confidence * 100, 0, 100)),
      evidence: context.categoryClassification.evidence,
    },
    aiPillarData: aiPillarData ?? undefined,
    meta: {
      version: ENGINE_VERSION,
      iterationCount: 1,
      generatedAt: new Date().toISOString(),
    },
  };
}

export async function resolveValidationContext(
  input: ValidationInput,
  locale: Locale
): Promise<AIResolvedContext> {
  return inferBusinessContextWithAI(input, locale);
}
