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
  return "no-go";
}

function toStatus(decision: FrameworkDecision): DynamicValidationResult["status"] {
  if (decision === "GO") return "GO";
  if (decision === "NO_GO") return "STOP";
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

function buildPrompt(context: AIValidationContext): string {
  const { input, locale, category, framework, frameworkGuide, country, categoryClassification, businessModel } = context;

  return JSON.stringify(
    {
      task: "Analyze this business idea using the supplied BizSproutAI validation framework. Return JSON only.",
      outputRequirements: {
        decision: ["GO", "CONDITIONAL_GO", "NEED_WORK", "NO_GO"],
        weightedScore: "0-100 integer",
        criteriaScoreRange: "1-5 integer",
        gateScores: {
          gate1: "0-20",
          gate2: "0-15",
          gate3: "0-5",
          gate4: "0-5",
          gate5: "0-5",
        },
        maxItems: {
          summaryBullets: 3,
          assumptions: 5,
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
        targetMarket: input.targetMarket ?? null,
        location: input.location ?? null,
        budgetUsd: input.budgetUsd ?? null,
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
        "Use the framework criteria, risk indicators, fix suggestions, and market context as the main rubric.",
        `Use frameworkGuide.id=${frameworkGuide.id} as the primary analysis guide unless the business idea clearly contradicts it.`,
        "If the framework guide represents a professional, trust-based, or regulated service, reflect that directly in risks, assumptions, and next steps.",
        "Infer missing details conservatively and list them in missingInfo and assumptions.",
        "CRITICAL: Give quantitative scores that are SPECIFIC to this idea. Do NOT give generic default scores.",
        "Scores must reflect your analysis of THIS specific idea. A booking app for barbers has different strengths/weaknesses than a booking app for dentists.",
        "For each criterion, provide specific evidence from the idea that justifies the score.",
        "Research signals, risks, and recommendations must be specific to the idea's niche (e.g., 'barber shops' not 'SMBs'), not generic SaaS filler.",
        "If the frameworkGuide is vertical_saas_v1, focus on: target user willingness to pay, switching friction from existing tools, acquisition difficulty to reach the niche, and retention/churn risk.",
        "For vertical SaaS, evaluate: Does the target segment actually pay for software? What tools do they use now? How hard is it to reach them? What would make them switch?",
        "IMPORTANT: Vertical SaaS includes CRM/workflow tools (contacts, pipeline, projects) AND booking/scheduling tools. Analyze based on the ACTUAL tool type described in the idea.",
        "For CRM/workflow tools for freelancers or creative professionals: evaluate against Notion, Airtable, HoneyBook, Dubsado. Why would they switch from these?",
        "For booking/scheduling tools for local service operators: evaluate against Square, Acuity, Calendly. What is the switching friction?",
        "SCORING CALIBRATION GUIDE:",
        "- weightedScore 70-100: Strong idea with clear path to validation. Real demand, manageable competition, testable.",
        "- weightedScore 50-69: Promising but needs proof. Real pain exists, but competition or switching friction creates uncertainty. Still worth testing.",
        "- weightedScore 35-49: Risky but testable. Demand likely exists, but significant barriers (competition, switching cost, acquisition difficulty). Founder should validate specific assumptions before building.",
        "- weightedScore 20-34: Major concerns. Problem may not be urgent enough, or market is too saturated with no clear wedge. Needs significant pivoting.",
        "- weightedScore 0-19: Fundamentally flawed. No clear demand, or insurmountable barriers.",
        "IMPORTANT: If real workflow pain exists and the idea is testable (even with strong competition), score should be 35-55 range (NEED_WORK or CONDITIONAL_GO), NOT below 32.",
        "Do not be overly pessimistic. An idea with real demand but strong competition is RISKY, not INVALID. Reserve sub-32 scores for ideas with no clear demand or fundamental structural problems.",
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
    "You are BizSproutAI's business validation agent.",
    "Analyze startup and small-business ideas using the provided framework instead of generic advice.",
    "Use the supplied criteria, risk indicators, fix suggestions, country context, and failure patterns to drive the analysis.",
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

function deriveDecision(weightedScore: number, gates: SimplifiedGateResult[]): FrameworkDecision {
  const passedGateCount = gates.filter((gate) => gate.passed).length;

  // GO: Strong validation, all gates pass
  if (weightedScore >= 75 && gates.every((gate) => gate.passed)) return "GO";
  
  // CONDITIONAL_GO: Promising but needs proof in specific areas
  // Lowered threshold: 55+ with 3+ gates is still promising
  if (weightedScore >= 55 && passedGateCount >= 3) return "CONDITIONAL_GO";
  
  // NEED_WORK: Risky but testable - real potential exists but significant concerns
  // This is for ideas where demand exists but competition/switching friction is high
  // Lowered threshold to 32 to avoid being too harsh on testable ideas
  if (weightedScore >= 32) return "NEED_WORK";
  
  // NO_GO: Fundamentally flawed or no clear path forward
  // Only below 32 - reserved for ideas with major structural problems
  return "NO_GO";
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
      reasoning: toText(problemDemand.reasoning, "AI analysis did not provide gate reasoning."),
    },
    {
      gate: 2,
      name: "Customer & Location Fit",
      score: clamp(toNumber(primarySegment.total, 0), 0, 15),
      maxScore: 15,
      passed: clamp(toNumber(primarySegment.total, 0), 0, 15) >= 9,
      status: clamp(toNumber(primarySegment.total, 0), 0, 15) >= 9 ? "PASS" : "FAIL",
      reasoning: toText(raw.primarySegment?.reasoning, "AI analysis did not provide gate reasoning."),
    },
    {
      gate: 3,
      name: "Competition & Differentiation",
      score: clamp(toNumber(solutionValidation.score, 0), 0, 5),
      maxScore: 5,
      passed: !!solutionValidation.passGate3,
      status: solutionValidation.passGate3 ? "PASS" : "FAIL",
      reasoning: toText(solutionValidation.reasoning, "AI analysis did not provide gate reasoning."),
    },
    {
      gate: 4,
      name: "Business Model & Unit Economics",
      score: clamp(businessModelScore, 0, 5),
      maxScore: 5,
      passed: !!businessModel.passGate4,
      status: businessModel.passGate4 ? "PASS" : "FAIL",
      reasoning: toText(businessModel.reasoning, "AI analysis did not provide gate reasoning."),
    },
    {
      gate: 5,
      name: "Operational Feasibility",
      score: clamp(toNumber(operationalValidation.score, 0), 0, 5),
      maxScore: 5,
      passed: !!operationalValidation.passGate5,
      status: operationalValidation.passGate5 ? "PASS" : "FAIL",
      reasoning: toText(operationalValidation.reasoning, "AI analysis did not provide gate reasoning."),
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
        reason: toText(alternative.reason, "Alternative model suggested by the AI validator."),
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
    oneLineSummary: toText(raw.summary?.oneLiner, "AI analysis completed."),
    missingInfo: toStringArray(raw.missingInfo, 6),
    assumptions: toStringArray(raw.assumptions, 5),
    problemDemand: {
      painLevel: clamp(toNumber(problemDemand.painLevel, 0), 0, 5),
      demandFrequency: clamp(toNumber(problemDemand.demandFrequency, 0), 0, 5),
      marketCoverage: clamp(toNumber(problemDemand.marketCoverage, 0), 0, 5),
      currentGap: clamp(toNumber(problemDemand.currentGap, 0), 0, 5),
      total: clamp(toNumber(problemDemand.total, 0), 0, 20),
      passGate1: !!problemDemand.passGate1,
      keyInsight: toText(problemDemand.keyInsight, "No key insight was provided."),
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
  const prompt = buildPrompt(context);
  const { parsed: raw } = await requestStructuredFromProviders(
    prompt,
    "business validation analysis",
    extractJsonObject
  );
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
  // The AI's decision is ignored to prevent score/verdict mismatches
  const derivedDecision = deriveDecision(weightedScore, gates);
  const decision = derivedDecision;
  
  const overallScore = toScoreBand(weightedScore / 20);
  const failureRisks = buildFailureRisks(raw, criteria);
  const fixes = buildFixes(raw, criteria);
  const alternatives = decision === "NO_GO" ? buildAlternatives(raw, context.framework) : [];
  const frameworkReport = buildFrameworkReport(raw, gates, weightedScore, decision, businessModelScore);
  const buildResult = triggerBuildFlow({
    category: context.category,
    countryCode: context.country.code,
    locale: context.locale,
    ideaSummary: toText(raw.summary?.oneLiner, context.input.idea).slice(0, 140),
  });

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
      oneLiner: toText(raw.summary?.oneLiner, "AI analysis completed."),
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
