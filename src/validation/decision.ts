import type {
  DynamicValidationResult,
  FinalValidationVerdict,
  FrameworkDecision,
  ValidationStatus,
  Verdict,
} from "./types";

export function finalVerdictFromOverallScore(overallScore: number): FinalValidationVerdict {
  if (overallScore >= 75) return "strong_validation";
  if (overallScore >= 55) return "promising_but_needs_proof";
  if (overallScore >= 32) return "risky_requires_refinement";
  return "pivot_or_reposition_recommended";
}

export function frameworkDecisionFromOverallScore(overallScore: number): FrameworkDecision {
  // Aligned with deriveDecision in aiValidation.ts
  if (overallScore >= 75) return "GO";
  if (overallScore >= 55) return "CONDITIONAL_GO";
  if (overallScore >= 32) return "NEED_WORK";
  return "PIVOT_RECOMMENDED";
}

export function verdictFromOverallScore(overallScore: number): Verdict {
  if (overallScore >= 75) return "go";
  if (overallScore >= 32) return "caution";
  return "pivot";
}

export function statusFromFrameworkDecision(decision: FrameworkDecision): ValidationStatus {
  if (decision === "GO") return "GO";
  if (decision === "PIVOT_RECOMMENDED") return "REFINE";
  return "FIX";
}

export function resolveOverallScore100(result: DynamicValidationResult): number {
  if (typeof result.overall_score === "number") {
    return Math.max(0, Math.min(100, Math.round(result.overall_score)));
  }
  if (typeof result.frameworkReport?.weightedScore === "number") {
    return Math.max(0, Math.min(100, Math.round(result.frameworkReport.weightedScore)));
  }
  return Math.round(Math.max(0, Math.min(100, result.overallScore * 20)));
}

export function resolveFrameworkDecision(result: DynamicValidationResult): FrameworkDecision {
  const score = resolveOverallScore100(result);
  return frameworkDecisionFromOverallScore(score);
}
