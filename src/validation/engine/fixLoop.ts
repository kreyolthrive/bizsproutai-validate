import type { ValidationInput, FailureRisk, FixSuggestion, CriterionResult } from "../types";
import type { LoadedFramework } from "./loadFramework";
import { evaluateRisks, sortRisksBySeverity } from "./evaluateRisks";

export interface FixLoopResult {
  iterations: FixIteration[];
  finalScore: number;
  improved: boolean;
  maxIterationsReached: boolean;
  suggestedFixes: FixSuggestion[];
}

export interface FixIteration {
  iteration: number;
  score: number;
  appliedFixes: string[];
  remainingRisks: FailureRisk[];
}

const MAX_ITERATIONS = 3;

export function runFixLoop(
  framework: LoadedFramework,
  input: ValidationInput,
  initialEvaluation: ReturnType<typeof evaluateRisks>
): FixLoopResult {
  const iterations: FixIteration[] = [];
  const allSuggestedFixes: FixSuggestion[] = [];

  let currentScore: number = initialEvaluation.overallScore;
  let currentRisks = [...initialEvaluation.failureRisks];
  let currentCriteria = [...initialEvaluation.criteria];

  // First iteration is the initial evaluation
  iterations.push({
    iteration: 0,
    score: currentScore,
    appliedFixes: [],
    remainingRisks: sortRisksBySeverity(currentRisks),
  });

  // Generate fixes based on current risks
  const sortedRisks = sortRisksBySeverity(currentRisks);

  for (const risk of sortedRisks.slice(0, 5)) { // Top 5 risks
    // Find the criterion for this risk
    const criterion = currentCriteria.find(c => c.key === risk.criterion);
    const frameworkCriterion = framework.criteria.find(c => c.key === risk.criterion);

    if (frameworkCriterion && frameworkCriterion.fixSuggestions.length > 0) {
      // Pick the most relevant fix suggestion
      const fixSuggestion = frameworkCriterion.fixSuggestions[0];

      allSuggestedFixes.push({
        issue: risk.reason,
        action: fixSuggestion,
        expectedImpact: getExpectedImpact(risk.severity),
      });
    }
  }

  // Add country-specific fixes if applicable
  if (framework.countryAdjustments.applied && framework.countryAdjustments.warnings.length > 0) {
    for (const warning of framework.countryAdjustments.warnings.slice(0, 2)) {
      allSuggestedFixes.push({
        issue: `Country-specific consideration: ${framework.countryAdjustments.country}`,
        action: warning,
        expectedImpact: "Adapting to local market increases success probability",
      });
    }
  }

  // Simulate fix iterations (in a real system, this would re-run with modified input)
  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    // Simulate improvement from applying fixes
    const fixesAppliedThisRound = allSuggestedFixes.slice(0, i * 2).map(f => f.action);

    // Simulate score improvement (each fix can improve score by 0.2-0.4)
    const improvementPerFix = 0.3;
    const simulatedImprovement = fixesAppliedThisRound.length * improvementPerFix;
    const newScore = Math.min(5, currentScore + simulatedImprovement);

    // Remove some risks based on fixes applied
    const remainingRisks = currentRisks.filter((risk, idx) => idx >= fixesAppliedThisRound.length);

    iterations.push({
      iteration: i,
      score: Math.round(newScore * 10) / 10,
      appliedFixes: fixesAppliedThisRound,
      remainingRisks: sortRisksBySeverity(remainingRisks),
    });

    // Check if we've reached a passing score
    if (newScore >= 4.0) {
      break;
    }

    currentScore = newScore;
    currentRisks = remainingRisks;
  }

  const finalIteration = iterations[iterations.length - 1];

  return {
    iterations,
    finalScore: finalIteration.score,
    improved: finalIteration.score > iterations[0].score,
    maxIterationsReached: iterations.length > MAX_ITERATIONS,
    suggestedFixes: deduplicateFixes(allSuggestedFixes),
  };
}

function getExpectedImpact(severity: FailureRisk["severity"]): string {
  switch (severity) {
    case "critical":
      return "Addressing this is essential for viability";
    case "high":
      return "Significant improvement to success probability";
    case "medium":
      return "Moderate improvement to success probability";
    case "low":
      return "Minor improvement, good to address";
    default:
      return "Will improve your validation score";
  }
}

function deduplicateFixes(fixes: FixSuggestion[]): FixSuggestion[] {
  const seen = new Set<string>();
  return fixes.filter(fix => {
    const key = fix.action.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Helper to determine if FIX loop should be triggered
export function shouldTriggerFixLoop(
  overallScore: number,
  hasCriticalRisks: boolean,
  hasHighRisks: boolean
): boolean {
  // Trigger FIX loop for scores between 2.5 and 4.0 (not GO, not STOP)
  if (overallScore >= 4.0) return false; // GO - no fix needed
  if (overallScore < 2.0 && hasCriticalRisks) return false; // STOP - too many issues
  return true; // FIX - can potentially improve
}
