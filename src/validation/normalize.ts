import type { ValidationInput, ValidationResult, ScoreBand } from "./types";
import { DEFAULT_LOCALE, ENGINE_VERSION, locales } from "./constants";

function clampScore(n: number): ScoreBand {
  const v = Math.min(5, Math.max(1, Math.round(n)));
  return v as ScoreBand;
}

export function normalizeResult(result: ValidationResult, input: ValidationInput): ValidationResult {
  return {
    ...result,
    locale: result.locale ?? input.locale ?? DEFAULT_LOCALE,
    overallScore: clampScore(result.overallScore),
    criteria: (result.criteria ?? []).map((c) => ({
      ...c,
      score: clampScore(c.score),
      evidence: c.evidence ?? [],
      risks: c.risks ?? [],
      recommendations: c.recommendations ?? []
    })),
    meta: {
      version: result.meta?.version ?? ENGINE_VERSION,
      generatedAt: result.meta?.generatedAt ?? new Date().toISOString()
    }
  };
}

export function normalizeInput(input: ValidationInput): ValidationInput {
  const trimmedIdea = (input.idea ?? "").trim();
  const normalizedLocale = input.locale && locales.includes(input.locale) ? input.locale : DEFAULT_LOCALE;

  return {
    ...input,
    idea: trimmedIdea,
    locale: normalizedLocale
  };
}
