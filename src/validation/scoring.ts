import type { CriterionResult, ScoreBand, Verdict } from "./types";
import { VERDICT_THRESHOLDS } from "./constants";

export function clampScore(value: number): ScoreBand {
  const rounded = Math.round(value);
  return Math.min(5, Math.max(1, rounded)) as ScoreBand;
}

export function computeOverallScore(criteria: CriterionResult[]): ScoreBand {
  const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0) || 1;
  const weighted =
    criteria.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight;
  return clampScore(weighted);
}

export function scoreToVerdict(score: number): Verdict {
  for (const threshold of VERDICT_THRESHOLDS) {
    if (score >= threshold.min) {
      return threshold.verdict;
    }
  }
  return "no-go";
}
