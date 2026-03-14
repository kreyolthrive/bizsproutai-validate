import type {
  DynamicValidationResult,
  Locale,
  ValidationCategoryRouting,
  ValidationInput,
  PillarResult,
  PillarBasedValidation,
  ConstructiveVerdict,
  PillarKey,
} from "../types";
import {
  finalVerdictFromOverallScore,
  frameworkDecisionFromOverallScore,
  statusFromFrameworkDecision,
  verdictFromOverallScore,
} from "../decision";
import { validateIdeaDynamic } from "./orchestrator";
import {
  buildValidationCtas,
  buildValidationModelRouting,
  buildValidationResearch,
  inferValidationBusinessModel,
  routeBusinessCategory,
  scoreBusinessValidation,
  selectValidationFramework,
} from "./businessValidationSystem";
import {
  getPillarFramework,
  getConstructiveVerdict,
  getVerdictLabel,
  getPillarStatus,
  PILLAR_KEYS,
  PILLAR_LABELS,
} from "../pillarFrameworks";

type BusinessValidationPipelineOutput = DynamicValidationResult & {
  validationIdea: string;
};

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

/**
 * Generate pillar-based validation from AI-generated pillar data (preferred) or fallback to scoring mapping.
 * When the LLM returns deep 6-pillar analysis, we use it directly for richer, idea-specific insights.
 * Falls back to the static score mapping only when AI pillar data is not available.
 */
function generatePillarValidation(
  input: ValidationInput,
  scoring: {
    overallScore: number;
    scores: { market_demand: number; monetization: number; competition: number; acquisition: number; execution_feasibility: number; differentiation: number; risk: number };
    strengths: string[];
    weaknesses: string[];
    keyRisks: string[];
    recommendedTests: string[];
    recommendedNextSteps: string[];
  },
  category: string,
  baseResult: DynamicValidationResult
): PillarBasedValidation {
  const framework = getPillarFramework(category);
  const aiPillarData = baseResult.aiPillarData;
  const finalOverallScore = scoring.overallScore;

  // ---- AI-generated pillar data path (deep LLM reasoning) ----
  if (aiPillarData && aiPillarData.pillars.length >= 3) {
    const aiPillarMap = new Map(aiPillarData.pillars.map((p) => [p.key, p]));

    const pillars: PillarResult[] = PILLAR_KEYS.map((key) => {
      const aiPillar = aiPillarMap.get(key);
      const pillarFramework = framework.pillars.find((p) => p.key === key);

      if (aiPillar && aiPillar.summary) {
        // Use AI-generated data directly - this is the deep LLM analysis
        return {
          key,
          label: PILLAR_LABELS[key],
          score: aiPillar.score,
          status: aiPillar.status as PillarResult["status"],
          summary: aiPillar.summary,
          advice: aiPillar.advice.length > 0
            ? aiPillar.advice
            : getFallbackAdvice(pillarFramework, aiPillar.status),
          questions: pillarFramework?.questions.map((q) => q.question) ?? [],
          evidence: aiPillar.evidence,
        };
      }

      // Fallback for any missing pillar - use scoring data
      return buildFallbackPillar(key, scoring, framework, pillarFramework);
    });

    const overallScore = finalOverallScore;
    const verdict = getConstructiveVerdict(overallScore);
    const verdictLabel = getVerdictLabel(verdict);

    // Use AI-generated experiments and path forward when available
    const nextExperiments = aiPillarData.nextExperiments.length >= 3
      ? aiPillarData.nextExperiments.slice(0, 5)
      : scoring.recommendedTests.length >= 3
        ? scoring.recommendedTests.slice(0, 5)
        : [
            ...(aiPillarData.nextExperiments.length > 0 ? aiPillarData.nextExperiments : []),
            ...(scoring.recommendedTests.length > 0 ? scoring.recommendedTests : []),
            "Interview 5 potential customers about their current solutions.",
            "Create a simple landing page to test interest.",
            "Run a pricing survey with 20 potential customers.",
          ].slice(0, 5);

    const pathForward = aiPillarData.pathForward || buildFallbackPathForward(verdict, pillars);

    return {
      pillars,
      overallScore,
      verdict,
      verdictLabel,
      nextExperiments,
      pathForward,
    };
  }

  // ---- Fallback path: static score mapping (no AI pillar data) ----
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const pillarScoreMapping: Record<PillarKey, number> = {
    problem_demand: clamp(scoring.scores.market_demand),
    customer_context_fit: clamp((scoring.scores.market_demand + scoring.scores.acquisition) / 2),
    competition_differentiation: clamp((scoring.scores.competition + scoring.scores.differentiation) / 2),
    business_model_money: clamp(scoring.scores.monetization),
    acquisition_channels: clamp(scoring.scores.acquisition),
    execution_founder_fit: clamp(scoring.scores.execution_feasibility),
  };

  const pillars: PillarResult[] = PILLAR_KEYS.map((key) => {
    const pillarFramework = framework.pillars.find((p) => p.key === key);
    const score = pillarScoreMapping[key] ?? 50;
    const status = getPillarStatus(score);

    return {
      key,
      label: PILLAR_LABELS[key],
      score,
      status,
      summary: buildFallbackSummary(key, score, status, scoring),
      advice: getFallbackAdvice(pillarFramework, status),
      questions: pillarFramework?.questions.map((q) => q.question) ?? [],
      evidence: [],
    };
  });

  const overallScore = finalOverallScore;
  const verdict = getConstructiveVerdict(overallScore);
  const verdictLabel = getVerdictLabel(verdict);

  const nextExperiments = scoring.recommendedTests.length >= 3
    ? scoring.recommendedTests.slice(0, 5)
    : [
        ...(scoring.recommendedTests.length > 0 ? scoring.recommendedTests : []),
        "Interview 5 potential customers about their current solutions.",
        "Create a simple landing page to test interest.",
        "Run a pricing survey with 20 potential customers.",
        "Find 3 early adopters for a pilot program.",
      ].slice(0, 5);

  const pathForward = buildFallbackPathForward(verdict, pillars);

  return {
    pillars,
    overallScore,
    verdict,
    verdictLabel,
    nextExperiments,
    pathForward,
  };
}

// Helper: get advice from framework definition based on status
function getFallbackAdvice(
  pillarFramework: ReturnType<typeof getPillarFramework>["pillars"][number] | undefined,
  status: string
): string[] {
  if (!pillarFramework) return [];
  if (status === "weak") return pillarFramework.weakAdvice.slice(0, 3).map((a) => a.advice);
  if (status === "moderate") return pillarFramework.moderateAdvice.slice(0, 3).map((a) => a.advice);
  return pillarFramework.strongAdvice.slice(0, 3).map((a) => a.advice);
}

// Helper: build summary from scoring data when AI doesn't provide one
function buildFallbackSummary(
  key: PillarKey,
  score: number,
  status: string,
  scoring: { strengths: string[]; weaknesses: string[]; keyRisks: string[] }
): string {
  const keyWords = key.replace(/_/g, " ").split(" ");
  const relevantStrengths = scoring.strengths.filter((s) =>
    keyWords.some((w) => s.toLowerCase().includes(w))
  );
  const relevantWeaknesses = scoring.weaknesses.filter((w) =>
    keyWords.some((kw) => w.toLowerCase().includes(kw))
  );
  const relevantRisks = scoring.keyRisks.filter((r) =>
    keyWords.some((kw) => r.toLowerCase().includes(kw))
  );

  if (status === "strong" && relevantStrengths.length > 0) return relevantStrengths[0];
  if (status === "weak" && relevantWeaknesses.length > 0) return relevantWeaknesses[0];
  if (status === "weak" && relevantRisks.length > 0) return relevantRisks[0];
  if (relevantStrengths.length > 0) return relevantStrengths[0];
  if (relevantWeaknesses.length > 0) return relevantWeaknesses[0];

  const pillarLabel = PILLAR_LABELS[key];
  if (status === "strong") return `${pillarLabel} scores well (${score}/100). This aspect of your business shows readiness.`;
  if (status === "moderate") return `${pillarLabel} shows potential (${score}/100) but needs more validation to reduce uncertainty.`;
  return `${pillarLabel} is currently a weak point (${score}/100). Focus here before scaling.`;
}

// Helper: build a fallback pillar result from scoring data
function buildFallbackPillar(
  key: PillarKey,
  scoring: {
    overallScore: number;
    scores: { market_demand: number; monetization: number; competition: number; acquisition: number; execution_feasibility: number; differentiation: number; risk: number };
    strengths: string[];
    weaknesses: string[];
    keyRisks: string[];
  },
  framework: ReturnType<typeof getPillarFramework>,
  pillarFramework: ReturnType<typeof getPillarFramework>["pillars"][number] | undefined
): PillarResult {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const pillarScoreMapping: Record<PillarKey, number> = {
    problem_demand: clamp(scoring.scores.market_demand),
    customer_context_fit: clamp((scoring.scores.market_demand + scoring.scores.acquisition) / 2),
    competition_differentiation: clamp((scoring.scores.competition + scoring.scores.differentiation) / 2),
    business_model_money: clamp(scoring.scores.monetization),
    acquisition_channels: clamp(scoring.scores.acquisition),
    execution_founder_fit: clamp(scoring.scores.execution_feasibility),
  };
  const score = pillarScoreMapping[key] ?? 50;
  const status = getPillarStatus(score);

  return {
    key,
    label: PILLAR_LABELS[key],
    score,
    status,
    summary: buildFallbackSummary(key, score, status, scoring),
    advice: getFallbackAdvice(pillarFramework, status),
    questions: pillarFramework?.questions.map((q) => q.question) ?? [],
    evidence: [],
  };
}

// Helper: build path forward text from verdict and pillar results
function buildFallbackPathForward(verdict: ConstructiveVerdict, pillars: PillarResult[]): string {
  const weakPillars = pillars.filter((p) => p.status === "weak");

  if (verdict === "promising_execution") {
    return "Your idea shows strong potential. Focus on execution and building your first version while continuing to validate with real customers.";
  }
  if (verdict === "promising_needs_validation") {
    if (weakPillars.length > 0) {
      return `Your idea is promising but needs validation in ${weakPillars.map((p) => p.label.toLowerCase()).join(" and ")}. Run the suggested experiments before heavy investment.`;
    }
    return "Your idea has promise. Validate key assumptions through customer interviews and small experiments before building.";
  }
  if (weakPillars.length >= 3) {
    return "Consider narrowing your target customer, simplifying your offering, or testing demand with a manual service first. The core insight may be valuable with repositioning.";
  }
  return `Address the key weakness in ${weakPillars[0]?.label.toLowerCase() ?? "identified areas"} before proceeding. Consider pivoting to a more focused approach.`;
}

export async function runBusinessValidationPipeline(
  input: ValidationInput
): Promise<BusinessValidationPipelineOutput> {
  // Generate a unique run ID for debug tracing
  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const DEBUG = process.env.VALIDATION_DEBUG === "true";

  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][${runId}] === NEW VALIDATION RUN ===`);
    console.log(`[VALIDATION_DEBUG][${runId}] Input idea: "${input.idea?.slice(0, 100)}..."`);
  }

  const locale: Locale = input.locale ?? "en";
  const validationIdea = buildValidationIdea(input);
  
  // Fresh orchestrator call - no state is reused from previous runs
  const baseResult = await validateIdeaDynamic({
    ...input,
    idea: validationIdea,
    locale,
  });

  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][${runId}] AI Category: ${baseResult.category}`);
    console.log(`[VALIDATION_DEBUG][${runId}] AI Framework: ${baseResult.frameworkUsed ?? baseResult.framework_used}`);
    console.log(`[VALIDATION_DEBUG][${runId}] AI Score: ${baseResult.frameworkReport?.weightedScore}`);
  }

  // Each of these functions creates fresh state, no module-level caching
  const categoryRouting = routeBusinessCategory(input, validationIdea, baseResult);
  const selectedFramework = selectValidationFramework(input, baseResult.category, baseResult);
  const research = await buildValidationResearch(input, baseResult);

  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][${runId}] Routed Category: ${categoryRouting.businessCategory}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Selected Framework: ${selectedFramework.frameworkName}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Specialization: ${selectedFramework.specialization ?? "none"}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Specialization Segment: ${selectedFramework.resolvedSpecialization?.segment ?? "none"}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Specialization BusinessModelType: ${selectedFramework.resolvedSpecialization?.businessModelType ?? "none"}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Research Sources: ${research.summary?.sources?.length ?? 0}`);
  }

  // Heuristic scoring (used as fallback when AI pillar data is not available)
  const heuristicScoring = scoreBusinessValidation({
    input,
    result: baseResult,
    routing: categoryRouting,
    framework: selectedFramework.profile,
    research,
    specialization: selectedFramework.resolvedSpecialization,
  });

  // When AI pillar data is available, derive scores FROM the AI analysis
  // This ensures the overall score matches the pillar scores users see
  const aiPillarData = baseResult.aiPillarData;
  const hasAIPillars = aiPillarData && aiPillarData.pillars.length >= 3;

  let scoring = heuristicScoring;

  if (hasAIPillars) {
    const aiPillarMap = new Map(aiPillarData.pillars.map((p) => [p.key, p]));
    const clampScore = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

    // Map 6 AI pillar scores to the 7-dimension scoring system
    const aiDerivedScores = {
      market_demand: clampScore(aiPillarMap.get("problem_demand")?.score ?? heuristicScoring.scores.market_demand),
      monetization: clampScore(aiPillarMap.get("business_model_money")?.score ?? heuristicScoring.scores.monetization),
      competition: clampScore(aiPillarMap.get("competition_differentiation")?.score ?? heuristicScoring.scores.competition),
      acquisition: clampScore(aiPillarMap.get("acquisition_channels")?.score ?? heuristicScoring.scores.acquisition),
      execution_feasibility: clampScore(aiPillarMap.get("execution_founder_fit")?.score ?? heuristicScoring.scores.execution_feasibility),
      differentiation: clampScore(aiPillarMap.get("competition_differentiation")?.score ?? heuristicScoring.scores.differentiation),
      risk: clampScore(100 - (aiPillarData.pillars.reduce((sum, p) => sum + p.score, 0) / aiPillarData.pillars.length)),
    };

    // Calculate overall score from AI pillar scores using pillar weights
    const pillarWeights: Record<string, number> = {
      problem_demand: 0.2,
      customer_context_fit: 0.15,
      competition_differentiation: 0.2,
      business_model_money: 0.2,
      acquisition_channels: 0.15,
      execution_founder_fit: 0.1,
    };
    const aiOverallScore = clampScore(
      aiPillarData.pillars.reduce((total, p) => {
        return total + p.score * (pillarWeights[p.key] ?? 0.15);
      }, 0)
    );

    // Build AI-driven scoring that replaces heuristic
    scoring = {
      ...heuristicScoring,
      overallScore: aiOverallScore,
      scores: aiDerivedScores,
      // Use AI strengths/weaknesses from pillar summaries when available
      strengths: aiPillarData.pillars
        .filter((p) => p.status === "strong" && p.summary)
        .map((p) => p.summary)
        .concat(heuristicScoring.strengths)
        .slice(0, 5),
      weaknesses: aiPillarData.pillars
        .filter((p) => p.status === "weak" && p.summary)
        .map((p) => p.summary)
        .concat(heuristicScoring.weaknesses)
        .slice(0, 5),
      keyRisks: aiPillarData.pillars
        .filter((p) => p.status === "weak")
        .flatMap((p) => p.advice.slice(0, 1).map((a) => `${p.key.replace(/_/g, " ")}: ${a}`))
        .concat(heuristicScoring.keyRisks)
        .slice(0, 5),
      recommendedTests: aiPillarData.nextExperiments.length > 0
        ? aiPillarData.nextExperiments
        : heuristicScoring.recommendedTests,
      recommendedNextSteps: aiPillarData.nextExperiments.length > 0
        ? aiPillarData.nextExperiments
        : heuristicScoring.recommendedNextSteps,
      // Replace generic assumptions with AI-derived actionable items
      assumptionsToTest: aiPillarData.pillars
        .filter((p) => p.status === "weak" || p.status === "moderate")
        .flatMap((p) => p.advice.slice(0, 1))
        .concat(heuristicScoring.assumptionsToTest.filter((a) => !a.includes("will hold once real users")))
        .slice(0, 5),
      missingProof: aiPillarData.pillars
        .filter((p) => p.status === "weak")
        .map((p) => `${p.key.replace(/_/g, " ")}: ${p.summary}`)
        .concat(heuristicScoring.missingProof.filter((m) => !m.includes("still limited")))
        .slice(0, 5),
    };

    if (DEBUG) {
      console.log(`[VALIDATION_DEBUG][${runId}] Using AI-derived scores (AI pillar data available)`);
      console.log(`[VALIDATION_DEBUG][${runId}] AI Overall Score: ${aiOverallScore} (heuristic was: ${heuristicScoring.overallScore})`);
    }
  }

  // Derive verdict directly from the final score
  const stabilizedOverallScore = scoring.overallScore;
  const stabilizedFinalVerdict = finalVerdictFromOverallScore(stabilizedOverallScore);
  const stabilizedDecision = frameworkDecisionFromOverallScore(stabilizedOverallScore);

  if (DEBUG) {
    console.log(`[VALIDATION_DEBUG][${runId}] Final Score: ${stabilizedOverallScore}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Final Verdict: ${stabilizedFinalVerdict}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Final Decision: ${stabilizedDecision}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Score Breakdown: ${JSON.stringify(scoring.scores)}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Strengths count: ${scoring.strengths.length}`);
    console.log(`[VALIDATION_DEBUG][${runId}] Weaknesses count: ${scoring.weaknesses.length}`);
    console.log(`[VALIDATION_DEBUG][${runId}] === END RUN ${runId} ===`);
  }

  const publicCategory = categoryRouting.businessCategory;
  const inferredBusinessModel = inferValidationBusinessModel(input, baseResult);
  const modelRouting = buildValidationModelRouting();
  const frameworkReport = baseResult.frameworkReport
    ? {
        ...baseResult.frameworkReport,
        decision: stabilizedDecision,
        weightedScore: stabilizedOverallScore,
      }
    : undefined;

  const nextActions = scoring.recommendedNextSteps.length
    ? scoring.recommendedNextSteps
    : baseResult.nextActions;

  // Generate pillar-based validation
  const pillarValidation = generatePillarValidation(
    input,
    scoring,
    publicCategory,
    baseResult
  );

  return {
    ...baseResult,
    status: statusFromFrameworkDecision(stabilizedDecision),
    buildTriggered: true,
    buildJobs: baseResult.buildJobs.length ? baseResult.buildJobs : [{ type: "website", status: "queued" }],
    verdict: verdictFromOverallScore(stabilizedOverallScore),
    validationIdea,
    frameworkReport,
    summary: {
      ...baseResult.summary,
      oneLiner:
        baseResult.summary.oneLiner ||
        `This idea scores ${stabilizedOverallScore}/100 as a ${publicCategory.replaceAll("_", " ")} concept.`,
    },
    nextActions,
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
    confidenceScore: scoring.confidenceScore,
    scores: scoring.scores,
    strengths: scoring.strengths,
    weaknesses: scoring.weaknesses,
    keyRisks: scoring.keyRisks,
    assumptionsToTest: scoring.assumptionsToTest,
    missingProof: scoring.missingProof,
    recommendedTests: scoring.recommendedTests,
    recommendedNextSteps: scoring.recommendedNextSteps,
    finalVerdict: stabilizedFinalVerdict,
    inferredBusinessModel,
    categoryRouting: categoryRouting as ValidationCategoryRouting,
    selectedFramework: {
      frameworkName: selectedFramework.frameworkName,
      frameworkLabel: selectedFramework.frameworkLabel,
      version: selectedFramework.version,
      criteria: selectedFramework.criteria,
      specialization: selectedFramework.specialization,
      reason: selectedFramework.reason,
    },
    researchSummary: research.summary,
    modelRouting,
    nextActionCtas: buildValidationCtas(locale),
    business_category: publicCategory,
    framework_used: selectedFramework.frameworkName,
    overall_score: stabilizedOverallScore,
    confidence_score: scoring.confidenceScore,
    key_risks: scoring.keyRisks,
    assumptions_to_test: scoring.assumptionsToTest,
    missing_proof: scoring.missingProof,
    recommended_tests: scoring.recommendedTests,
    recommended_next_steps: scoring.recommendedNextSteps,
    final_verdict: stabilizedFinalVerdict,
    // Pillar-based validation (new 6-pillar framework)
    pillarValidation,
    constructiveVerdict: pillarValidation.verdict,
    constructiveVerdictLabel: pillarValidation.verdictLabel,
  };
}
