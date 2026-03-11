import { clampScore, computeOverallScore, scoreToVerdict } from "../scoring";
import { translateVerdict } from "../i18n";
import { DEFAULT_LOCALE, ENGINE_VERSION } from "../constants";
import type {
  CriterionDefinition,
  CriterionResult,
  FrameworkDefinition,
  ValidationInput,
  ValidationResult
} from "../types";

type CriterionOptions = {
  boost?: number;
  evidence?: string[];
  risks?: string[];
  recommendations?: string[];
};

export function buildCriterion(
  definition: CriterionDefinition,
  input: ValidationInput,
  options: CriterionOptions = {}
): CriterionResult {
  const base = 3 + (options.boost ?? 0);
  const clarity = Math.min(0.5, (input.idea?.length ?? 0) / 200);
  const targetSignal = input.targetMarket ? 0.2 : 0;
  const channelSignal = input.channels && input.channels.length ? 0.2 : 0;
  const budgetSignal = input.budgetUsd !== undefined ? 0.2 : 0;
  const rawScore = base + clarity + targetSignal + channelSignal + budgetSignal;
  const score = clampScore(rawScore);

  const evidence: string[] = [
    `Idea length: ${input.idea?.length ?? 0} characters.`,
    input.targetMarket ? `Target market: ${input.targetMarket}.` : `${definition.label} needs a defined buyer.`
  ];

  if (input.location) {
    evidence.push(`Operating area: ${input.location}.`);
  }

  if (input.channels && input.channels.length) {
    evidence.push(`Channels mentioned: ${input.channels.join(", ")}.`);
  }

  if (input.budgetUsd !== undefined) {
    evidence.push(`Budget tracked at $${input.budgetUsd}.`);
  }

  if (options.evidence) {
    evidence.push(...options.evidence);
  }

  const risks = options.risks && options.risks.length
    ? options.risks
    : [`${definition.label} still requires validation.`];

  const recommendations = options.recommendations && options.recommendations.length
    ? options.recommendations
    : [`Clarify ${definition.label.toLowerCase()} before scaling.`];

  return {
    key: definition.key,
    label: definition.label,
    weight: definition.weight,
    score,
    evidence,
    risks,
    recommendations
  };
}

type FinalizeArgs = {
  definition: FrameworkDefinition;
  input: ValidationInput;
  criteria: CriterionResult[];
  summary: {
    oneLiner?: string;
    topOpportunities: string[];
    biggestRisks: string[];
  };
  nextSteps: string[];
  assumptions: string[];
  missingInfo: string[];
};

export function finalizeFrameworkResult({
  definition,
  input,
  criteria,
  summary,
  nextSteps,
  assumptions,
  missingInfo
}: FinalizeArgs): ValidationResult {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const overallScore = computeOverallScore(criteria);
  const verdict = scoreToVerdict(overallScore);
  const verdictMessage = translateVerdict(verdict, locale);
  const topOpportunities = summary.topOpportunities ?? [];
  const biggestRisks = summary.biggestRisks ?? [];

  return {
    category: definition.category,
    locale,
    overallScore,
    verdict,
    summary: {
      oneLiner: summary.oneLiner ?? verdictMessage,
      topOpportunities,
      biggestRisks
    },
    nextSteps,
    criteria,
    assumptions,
    missingInfo,
    meta: {
      version: ENGINE_VERSION,
      generatedAt: new Date().toISOString()
    }
  };
}
