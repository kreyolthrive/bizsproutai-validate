import type {
  DynamicValidationResult,
  Locale,
  ValidationCategoryRouting,
  ValidationInput,
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

export async function runBusinessValidationPipeline(
  input: ValidationInput
): Promise<BusinessValidationPipelineOutput> {
  const locale: Locale = input.locale ?? "en";
  const validationIdea = buildValidationIdea(input);
  const baseResult = await validateIdeaDynamic({
    ...input,
    idea: validationIdea,
    locale,
  });

  const categoryRouting = routeBusinessCategory(input, validationIdea, baseResult);
  const selectedFramework = selectValidationFramework(input, baseResult.category, baseResult);
  const research = await buildValidationResearch(input, baseResult);
  const scoring = scoreBusinessValidation({
    input,
    result: baseResult,
    routing: categoryRouting,
    framework: selectedFramework.profile,
    research,
    specialization: selectedFramework.resolvedSpecialization,
  });
  const stabilizedOverallScore = scoring.overallScore;
  const stabilizedFinalVerdict = finalVerdictFromOverallScore(stabilizedOverallScore);
  const stabilizedDecision = frameworkDecisionFromOverallScore(stabilizedOverallScore);
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
  };
}
