import type {
  DynamicValidationResult,
  FinalValidationVerdict,
  FrameworkDecision,
  ValidationStatus,
  Verdict,
} from "./types";

// ============================================================================
// Score → Verdict mapping (single source of truth)
//
//   0–39  → High risk — improve or pivot
//  40–69  → Early stage — validate before building
//  70+    → Promising — focus on execution and testing
// ============================================================================

export function finalVerdictFromOverallScore(overallScore: number): FinalValidationVerdict {
  if (overallScore >= 70) return "strong_validation";
  if (overallScore >= 40) return "promising_but_needs_proof";
  return "pivot_or_reposition_recommended";
}

export function frameworkDecisionFromOverallScore(overallScore: number): FrameworkDecision {
  if (overallScore >= 70) return "GO";
  if (overallScore >= 40) return "CONDITIONAL_GO";
  return "PIVOT_RECOMMENDED";
}

export function verdictFromOverallScore(overallScore: number): Verdict {
  if (overallScore >= 70) return "go";
  if (overallScore >= 40) return "caution";
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

// ============================================================================
// Pillar-level label derivation (auto-derive from numeric score)
// ============================================================================

export function pillarStatusFromScore(score: number): "strong" | "moderate" | "weak" {
  if (score >= 70) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}

// Clamp any pillar score to 0–100
export function clampPillarScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
