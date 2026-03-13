import type {
  Category,
  DynamicValidationResult,
  FinalValidationVerdict,
  Locale,
  ValidationCategoryRouting,
  ValidationCta,
  ValidationFrameworkSelection,
  ValidationInput,
  ValidationModelRouting,
  ValidationResearchSummary,
  ValidationScoreBreakdown,
} from "../types";
import { loadFramework } from "./loadFramework";
import { classifyCategory } from "./classifyCategory";
import { validateIdeaDynamic } from "./orchestrator";
import { analyzeCompetitors, conductMarketResearch } from "../providers/perplexity";
import { getProviderForTask } from "../providers/router";

type BusinessValidationPipelineOutput = DynamicValidationResult & {
  validationIdea: string;
};

const PUBLIC_CATEGORY_MAP: Record<Category, string> = {
  ecommerce: "ecommerce",
  coaching: "coaching_consulting",
  consulting: "coaching_consulting",
  finance: "finance",
  tech: "mobile_web_app",
  local_service: "local_service",
  saas: "saas",
  marketplace: "marketplace",
  health_wellness: "health_wellness",
  edtech: "edtech",
  legal_law: "legal_law",
};

const CATEGORY_LABELS: Record<Category, string> = {
  ecommerce: "Ecommerce",
  coaching: "Coaching",
  consulting: "Consulting",
  finance: "Finance",
  tech: "Mobile / Web App",
  local_service: "Local Service",
  saas: "SaaS",
  marketplace: "Marketplace",
  health_wellness: "Health & Wellness",
  edtech: "EdTech",
  legal_law: "Legal / Law",
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function unique(items: Array<string | undefined | null>, limit = 6): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item?.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= limit) break;
  }

  return result;
}

function toScore100(value: number | undefined | null, max = 5): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(clamp((value / max) * 100, 0, 100));
}

function toOverallScore100(result: DynamicValidationResult): number {
  if (typeof result.frameworkReport?.weightedScore === "number") {
    return Math.round(clamp(result.frameworkReport.weightedScore, 0, 100));
  }
  return Math.round(clamp(Number(result.overallScore) * 20, 0, 100));
}

function riskSeverityPenalty(result: DynamicValidationResult): number {
  const severityWeight = {
    critical: 28,
    high: 18,
    medium: 10,
    low: 5,
  } as const;

  const penalty = (result.failureRisks ?? []).reduce((total, risk) => {
    return total + severityWeight[risk.severity];
  }, 0);

  return clamp(100 - penalty, 15, 95);
}

function scoreFromCriterion(result: DynamicValidationResult, matcher: RegExp): number {
  const match = result.criteria.find((criterion) => matcher.test(criterion.key) || matcher.test(criterion.label));
  return toScore100(match?.score);
}

function deriveScores(result: DynamicValidationResult): ValidationScoreBreakdown {
  const monetizationScore =
    typeof result.frameworkReport?.businessModelValidation.margin === "number"
      ? Math.round(clamp(result.frameworkReport.businessModelValidation.margin, 0, 100))
      : scoreFromCriterion(result, /pricing|revenue|business_model|monet/i);

  const competitionScore =
    typeof result.frameworkReport?.solutionValidation.differentiation === "number"
      ? toScore100(result.frameworkReport.solutionValidation.differentiation)
      : scoreFromCriterion(result, /competition|different/i);

  const acquisitionScore =
    typeof result.frameworkReport?.primarySegment?.scores?.reachability === "number"
      ? toScore100(result.frameworkReport.primarySegment.scores.reachability)
      : scoreFromCriterion(result, /distribution|acquisition|market_access|reach/i);

  const executionScore =
    typeof result.frameworkReport?.operationalValidation.score === "number"
      ? toScore100(result.frameworkReport.operationalValidation.score)
      : scoreFromCriterion(result, /execution|delivery|operation/i);

  return {
    market_demand:
      typeof result.frameworkReport?.problemDemand.total === "number"
        ? toScore100(result.frameworkReport.problemDemand.total, 20)
        : scoreFromCriterion(result, /problem|demand|market/i),
    monetization: monetizationScore,
    competition: competitionScore,
    acquisition: acquisitionScore,
    execution_feasibility: executionScore,
    differentiation:
      typeof result.frameworkReport?.solutionValidation.differentiation === "number"
        ? toScore100(result.frameworkReport.solutionValidation.differentiation)
        : competitionScore,
    risk: riskSeverityPenalty(result),
  };
}

function deriveFinalVerdict(overallScore: number): FinalValidationVerdict {
  if (overallScore >= 80) return "strong_validation";
  if (overallScore >= 65) return "promising_but_needs_proof";
  if (overallScore >= 50) return "risky_requires_refinement";
  return "weak_validation_major_changes_needed";
}

function buildValidationIdea(input: ValidationInput): string {
  const parts = [
    input.idea.trim(),
    input.targetCustomer ? `Target customer: ${input.targetCustomer.trim()}` : null,
    input.targetMarket ? `Target market: ${input.targetMarket.trim()}` : null,
    input.location ? `Location/market: ${input.location.trim()}` : null,
    input.offer ? `Offer: ${input.offer.trim()}` : null,
    input.problem ? `Problem being solved: ${input.problem.trim()}` : null,
    input.pricingIdea ? `Pricing idea: ${input.pricingIdea.trim()}` : null,
    typeof input.budgetUsd === "number" ? `Budget: $${Math.round(input.budgetUsd)}` : null,
    input.skillSummary ? `Relevant skills: ${input.skillSummary.trim()}` : null,
    typeof input.timelineDays === "number" ? `Timeline: ${Math.round(input.timelineDays)} days` : null,
  ];

  return parts.filter((part): part is string => Boolean(part)).join("\n");
}

function toPublicCategory(category: Category): string {
  return PUBLIC_CATEGORY_MAP[category] ?? category;
}

function frameworkVersionName(category: Category): string {
  if (category === "tech") return "mobile_web_app_v1";
  if (category === "coaching" || category === "consulting") return `${category}_v1`;
  return `${toPublicCategory(category)}_v1`;
}

function buildCategoryRouting(input: ValidationInput, validationIdea: string): ValidationCategoryRouting {
  const classification = classifyCategory({
    idea: validationIdea,
    explicitCategory: input.category,
  });

  return {
    businessCategory: toPublicCategory(classification.category),
    confidence: Math.round(clamp(classification.confidence * 100, 0, 100)),
    alternateCategories: classification.alternativeCategories.map((item) => toPublicCategory(item.category)),
    evidence: classification.evidence.slice(0, 4),
  };
}

function buildFrameworkSelection(
  category: Category,
  result: DynamicValidationResult
): ValidationFrameworkSelection {
  const framework = loadFramework({
    category,
    countryCode: result.country.code,
  });

  return {
    frameworkName: frameworkVersionName(category),
    frameworkLabel: result.framework?.label ?? framework.displayName ?? CATEGORY_LABELS[category],
    version: "v1",
    criteria: framework.criteria.map((criterion) => criterion.label),
  };
}

async function buildResearchSummary(
  input: ValidationInput,
  result: DynamicValidationResult
): Promise<ValidationResearchSummary> {
  const marketResearch = await conductMarketResearch({
    idea: input.idea,
    category: result.category,
    countryCode: result.country.code,
    targetMarket: input.targetMarket,
  });

  const competitorAnalysis = await analyzeCompetitors({
    idea: input.idea,
    category: result.category,
    countryCode: result.country.code,
  });

  const competitionNotes = competitorAnalysis.competitors.map((competitor) => {
    const strengths = competitor.strengths.slice(0, 2).join(", ");
    return `${competitor.name}: ${competitor.description}${strengths ? ` Strengths: ${strengths}.` : ""}`;
  });

  const monetizationNotes = unique([
    result.frameworkReport?.businessModelValidation.model
      ? `Primary revenue model: ${result.frameworkReport.businessModelValidation.model}.`
      : null,
    typeof result.frameworkReport?.businessModelValidation.margin === "number"
      ? `Estimated gross margin signal: ${Math.round(result.frameworkReport.businessModelValidation.margin)}%.`
      : null,
    result.summary.topOpportunities[0],
  ], 3);

  const acquisitionChallenges = unique([
    ...(result.failureRisks ?? [])
      .filter((risk) => /acquisition|distribution|reach|customer/i.test(risk.criterion) || /acquisition|reach/i.test(risk.reason))
      .map((risk) => risk.reason),
    ...(result.criteria ?? [])
      .filter((criterion) => /distribution|acquisition|market_access|reach/i.test(criterion.key))
      .flatMap((criterion) => criterion.risks),
  ], 3);

  return {
    demandSignals: unique([
      marketResearch.marketSize ? `Market signal: ${marketResearch.marketSize}.` : null,
      marketResearch.opportunities[0],
      result.frameworkReport?.problemDemand.keyInsight,
      result.summary.topOpportunities[0],
    ], 4),
    competitionNotes: unique(competitionNotes, 4),
    marketTrends: unique([
      marketResearch.growthTrend !== "unknown" ? `Market trend looks ${marketResearch.growthTrend}.` : null,
      marketResearch.opportunities[1],
      marketResearch.threats[0],
    ], 3),
    monetizationNotes,
    acquisitionChallenges,
    differentiationOpportunities: unique([
      ...competitorAnalysis.gaps,
      ...competitorAnalysis.competitiveAdvantages,
      result.criteria.find((criterion) => /different/i.test(criterion.key))?.recommendations[0],
    ], 4),
    riskFactors: unique([
      ...marketResearch.threats,
      ...result.failureRisks.map((risk) => risk.reason),
      ...result.summary.biggestRisks,
    ], 5),
    sources: unique(marketResearch.sources, 4),
  };
}

function buildStrengths(result: DynamicValidationResult, researchSummary: ValidationResearchSummary): string[] {
  return unique([
    ...result.summary.topOpportunities,
    ...result.criteria.filter((criterion) => criterion.score >= 4).flatMap((criterion) => criterion.evidence),
    ...researchSummary.demandSignals,
  ], 4);
}

function buildWeaknesses(result: DynamicValidationResult): string[] {
  return unique([
    ...result.criteria.filter((criterion) => criterion.score <= 3).flatMap((criterion) => criterion.risks),
    ...result.missingInfo,
  ], 4);
}

function buildRecommendedTests(result: DynamicValidationResult): string[] {
  return unique([
    ...result.criteria.flatMap((criterion) => criterion.recommendations),
    ...result.nextActions,
  ]).filter((item) => /interview|test|waitlist|pilot|pre-sell|pricing|landing page|survey|ad/i.test(item)).slice(0, 5);
}

function buildNextSteps(result: DynamicValidationResult, recommendedTests: string[]): string[] {
  return unique([
    ...result.nextActions,
    ...recommendedTests,
    ...result.fixes.map((fix) => fix.action),
  ], 5);
}

function buildModelRouting(): ValidationModelRouting {
  return {
    researchModel: getProviderForTask("market_research"),
    reasoningModel: getProviderForTask("business_validation"),
    formatterModel: getProviderForTask("verdict_narrative"),
  };
}

function buildCtas(locale: Locale): ValidationCta[] {
  return [
    { key: "build_landing_page", label: "Build landing page", href: `/${locale}/website-builder` },
    { key: "create_sprint_plan", label: "Create sprint plan", href: `/${locale}/launch-kit` },
    { key: "improve_idea", label: "Improve idea", href: `/${locale}#validation` },
    { key: "generate_brand_kit", label: "Generate brand kit", href: `/${locale}/brand-kit` },
    { key: "test_pricing", label: "Test pricing", href: `/${locale}/launch-kit` },
    { key: "launch_validation_campaign", label: "Launch validation campaign", href: `/${locale}/waitlist` },
  ];
}

export async function runBusinessValidationPipeline(
  input: ValidationInput
): Promise<BusinessValidationPipelineOutput> {
  const locale: Locale = input.locale ?? "en";
  const validationIdea = buildValidationIdea(input);
  const detectedRouting = buildCategoryRouting(input, validationIdea);
  const baseResult = await validateIdeaDynamic({
    ...input,
    idea: validationIdea,
    locale,
  });
  const overallScore = toOverallScore100(baseResult);
  const scores = deriveScores(baseResult);
  const selectedFramework = buildFrameworkSelection(baseResult.category, baseResult);
  const researchSummary = await buildResearchSummary(input, baseResult);
  const strengths = buildStrengths(baseResult, researchSummary);
  const weaknesses = buildWeaknesses(baseResult);
  const keyRisks = unique([
    ...baseResult.failureRisks.map((risk) => risk.reason),
    ...baseResult.summary.biggestRisks,
    ...researchSummary.riskFactors,
  ], 5);
  const assumptionsToTest = unique(baseResult.assumptions, 5);
  const missingProof = unique(baseResult.missingInfo, 5);
  const recommendedTests = buildRecommendedTests(baseResult);
  const recommendedNextSteps = buildNextSteps(baseResult, recommendedTests);
  const finalVerdict = deriveFinalVerdict(overallScore);
  const modelRouting = buildModelRouting();
  const publicCategory = toPublicCategory(baseResult.category);
  const categoryRouting: ValidationCategoryRouting = {
    ...detectedRouting,
    businessCategory: publicCategory,
  };

  return {
    ...baseResult,
    validationIdea,
    submittedContext: {
      idea: input.idea,
      targetCustomer: input.targetCustomer,
      targetMarket: input.targetMarket,
      location: input.location,
      offer: input.offer,
      problem: input.problem,
      pricingIdea: input.pricingIdea,
      budgetUsd: input.budgetUsd,
      skillSummary: input.skillSummary,
      channels: input.channels,
      timelineDays: input.timelineDays,
      experienceLevel: input.experienceLevel,
    },
    businessCategory: publicCategory,
    frameworkUsed: selectedFramework.frameworkName,
    confidenceScore: categoryRouting.confidence,
    scores,
    strengths,
    weaknesses,
    keyRisks,
    assumptionsToTest,
    missingProof,
    recommendedTests,
    recommendedNextSteps,
    finalVerdict,
    categoryRouting,
    selectedFramework,
    researchSummary,
    modelRouting,
    nextActionCtas: buildCtas(locale),
    business_category: publicCategory,
    framework_used: selectedFramework.frameworkName,
    overall_score: overallScore,
    confidence_score: categoryRouting.confidence,
    key_risks: keyRisks,
    assumptions_to_test: assumptionsToTest,
    missing_proof: missingProof,
    recommended_tests: recommendedTests,
    recommended_next_steps: recommendedNextSteps,
    final_verdict: finalVerdict,
  };
}
