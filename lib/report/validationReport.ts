import type {
  DynamicValidationResult,
  FrameworkDecision,
  Locale,
} from "@/src/validation/types";
import {
  resolveFrameworkDecision,
  resolveOverallScore100,
} from "@/src/validation/decision";

export type ValidationReportDocument = {
  filename: string;
  generatedAt: string;
  text: string;
};

type ValidationReportInput = {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
};

function decisionLabel(decision: FrameworkDecision): string {
  if (decision === "GO") return "Promising — Ready to Execute";
  if (decision === "CONDITIONAL_GO") return "Promising — Needs Validation";
  if (decision === "NEED_WORK") return "Early Stage — Validate Before Building";
  return "High Risk — Improve or Pivot";
}

function safeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function linesWithFallback(title: string, lines: string[]): string[] {
  if (lines.length === 0) return [title, "- n/a"];
  return [title, ...lines.map((line) => `- ${line}`)];
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function resolveCategory(result: DynamicValidationResult): string {
  return (
    result.businessCategory ??
    result.business_category ??
    result.category ??
    "n/a"
  );
}

function resolveFramework(result: DynamicValidationResult): string {
  return (
    result.frameworkUsed ??
    result.framework_used ??
    result.selectedFramework?.frameworkLabel ??
    result.framework?.label ??
    "General"
  );
}

function resolveCountry(result: DynamicValidationResult): string {
  return result.country?.code ?? result.country?.name ?? "n/a";
}

function resolveConfidence(result: DynamicValidationResult): string {
  const value = result.confidenceScore ?? result.confidence_score;
  return typeof value === "number" ? `${value}/100` : "n/a";
}

export function buildValidationReportDocument(
  input: ValidationReportInput
): ValidationReportDocument {
  const generatedAt = new Date().toISOString();
  const shortIdea = input.idea.split(/\s+/).slice(0, 6).join("-");
  const filename = `bizsproutai-validation-${safeSegment(
    shortIdea || "report"
  )}.txt`;

  const decision = decisionLabel(resolveFrameworkDecision(input.result));
  const reportScore = resolveOverallScore100(input.result);

  const strengths = normalizeStringArray(
    input.result.strengths ?? input.result.summary?.topOpportunities ?? []
  );
  const weaknesses = normalizeStringArray(input.result.weaknesses ?? []);
  const keyRisks = normalizeStringArray(
    input.result.keyRisks ??
      input.result.key_risks ??
      input.result.summary?.biggestRisks ??
      []
  );
  const assumptionsToTest = normalizeStringArray(
    input.result.assumptionsToTest ??
      input.result.assumptions_to_test ??
      input.result.assumptions ??
      []
  );
  const nextSteps = normalizeStringArray(
    input.result.recommendedNextSteps ??
      input.result.recommended_next_steps ??
      input.result.nextActions ??
      []
  ).slice(0, 10);

  const pillarValidation = input.result.pillarValidation;
  const gates = input.result.frameworkReport?.gates ?? [];

  const scoreLines = [
    `Overall Score: ${reportScore}/100`,
    `Market Demand: ${input.result.scores?.market_demand ?? "n/a"}`,
    `Monetization: ${input.result.scores?.monetization ?? "n/a"}`,
    `Competition: ${input.result.scores?.competition ?? "n/a"}`,
    `Acquisition: ${input.result.scores?.acquisition ?? "n/a"}`,
    `Execution Feasibility: ${input.result.scores?.execution_feasibility ?? "n/a"}`,
    `Differentiation: ${input.result.scores?.differentiation ?? "n/a"}`,
    `Risk: ${input.result.scores?.risk ?? "n/a"}`,
  ];

  const researchSignals = [
    ...normalizeStringArray(input.result.researchSummary?.demandSignals ?? []),
    ...normalizeStringArray(input.result.researchSummary?.marketTrends ?? []),
    ...normalizeStringArray(input.result.researchSummary?.monetizationNotes ?? []),
  ].slice(0, 8);

  const reportLines: string[] = [
    "BizSproutAI Validation Report",
    "============================",
    `Generated: ${generatedAt}`,
    `Locale: ${input.locale}`,
    `Email: ${input.email ?? "not provided"}`,
    "",
    "Submitted Idea",
    "--------------",
    input.idea,
    "",
    "Decision",
    "--------",
    `${decision} (${reportScore}/100)`,
    "",
    "Context",
    "-------",
    `Category: ${resolveCategory(input.result)}`,
    `Country: ${resolveCountry(input.result)}`,
    `Framework: ${resolveFramework(input.result)}`,
    `Confidence: ${resolveConfidence(input.result)}`,
    "",
    "One-Line Summary",
    "----------------",
    input.result.summary?.oneLiner ?? "Validation completed.",
    "",
    "Score Breakdown",
    "---------------",
    ...scoreLines,
    "",
    ...linesWithFallback("Strengths", strengths),
    "",
    ...linesWithFallback("Weaknesses", weaknesses),
    "",
    ...linesWithFallback("Key Risks", keyRisks),
    "",
    ...linesWithFallback("Assumptions To Test", assumptionsToTest),
    "",
    ...linesWithFallback("Next Steps", nextSteps),
    "",
    ...linesWithFallback("Research Signals", researchSignals),
    "",
    ...(pillarValidation && pillarValidation.pillars.length > 0
      ? [
          "Six-Pillar Validation",
          "---------------------",
          `Verdict: ${pillarValidation.verdictLabel}`,
          `Overall Score: ${pillarValidation.overallScore}/100`,
          "",
          ...pillarValidation.pillars.flatMap((pillar) => [
            `${pillar.label} (${pillar.score}/100 — ${pillar.status})`,
            pillar.summary ? `  ${pillar.summary}` : "",
            ...(pillar.advice.length > 0
              ? ["  How to improve:", ...pillar.advice.map((a) => `    - ${a}`)]
              : []),
            "",
          ]),
          ...(pillarValidation.pathForward
            ? ["Path Forward", "------------", pillarValidation.pathForward, ""]
            : []),
          ...(pillarValidation.nextExperiments.length > 0
            ? [
                "Next Experiments",
                "----------------",
                ...pillarValidation.nextExperiments.map((e) => `- ${e}`),
                "",
              ]
            : []),
        ]
      : []),
    "Gate Analysis",
    "-------------",
    ...(gates.length
      ? gates.map((gate) => {
          if (gate.status === "BLOCKED") {
            return `- Gate ${gate.gate} ${gate.name}: BLOCKED (waiting for Gate ${gate.blockedByGate})`;
          }
          return `- Gate ${gate.gate} ${gate.name}: ${gate.status} (${gate.score}/${gate.maxScore})`;
        })
      : ["- n/a"]),
    "",
    "Generated by BizSproutAI",
  ];

  return {
    filename,
    generatedAt,
    text: reportLines.join("\n"),
  };
}
