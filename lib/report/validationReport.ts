import type { DynamicValidationResult, FrameworkDecision, Locale } from "@/src/validation/types";
import { resolveFrameworkDecision, resolveOverallScore100 } from "@/src/validation/decision";

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

function toIntegerScore(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value * 20)));
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

export function buildValidationReportDocument(input: ValidationReportInput): ValidationReportDocument {
  const generatedAt = new Date().toISOString();
  const shortIdea = input.idea.split(/\s+/).slice(0, 6).join("-");
  const filename = `bizsproutai-validation-${safeSegment(shortIdea || "report")}.txt`;

  const decision = decisionLabel(resolveFrameworkDecision(input.result));

  const demand = input.result.frameworkReport?.problemDemand.total;
  const competition = input.result.frameworkReport?.solutionValidation.differentiation;
  const modelMargin = input.result.frameworkReport?.businessModelValidation.margin;
  const gates = input.result.frameworkReport?.gates ?? [];
  const reportScore = resolveOverallScore100(input.result);
  const structuredScores = input.result.scores;
  const strengths = input.result.strengths ?? input.result.summary.topOpportunities;
  const weaknesses = input.result.weaknesses ?? [];
  const keyRisks = input.result.keyRisks ?? input.result.summary.biggestRisks;
  const assumptionsToTest = input.result.assumptionsToTest ?? input.result.assumptions;
  const nextSteps = input.result.recommendedNextSteps ?? input.result.nextActions;
  const pillarValidation = input.result.pillarValidation;

  const reportLines: string[] = [
    "BizSproutAI Validation Report",
    "============================",
    "Brand: BizSproutAI (logo is embedded in the PDF report version)",
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
    `Category: ${input.result.businessCategory ?? input.result.category}`,
    `Country: ${input.result.country.code}`,
    `Framework: ${input.result.frameworkUsed ?? input.result.framework?.label ?? "General"}`,
    `Confidence: ${input.result.confidenceScore ?? input.result.confidence_score ?? "n/a"}/100`,
    "",
    "One-Line Summary",
    "----------------",
    input.result.summary.oneLiner,
    "",
    "Score Breakdown",
    "---------------",
    `Overall Score: ${reportScore}/100`,
    `Market Demand: ${structuredScores?.market_demand ?? (typeof demand === "number" ? toIntegerScore(demand / 4) : "n/a")}`,
    `Monetization: ${structuredScores?.monetization ?? (typeof modelMargin === "number" ? Math.round(modelMargin) : "n/a")}`,
    `Competition: ${structuredScores?.competition ?? (typeof competition === "number" ? toIntegerScore(competition) : "n/a")}`,
    `Acquisition: ${structuredScores?.acquisition ?? "n/a"}`,
    `Execution Feasibility: ${structuredScores?.execution_feasibility ?? "n/a"}`,
    `Differentiation: ${structuredScores?.differentiation ?? "n/a"}`,
    `Risk: ${structuredScores?.risk ?? "n/a"}`,
    "",
    ...linesWithFallback("Strengths", strengths),
    "",
    ...linesWithFallback("Weaknesses", weaknesses),
    "",
    ...linesWithFallback("Key Risks", keyRisks),
    "",
    ...linesWithFallback("Assumptions To Test", assumptionsToTest),
    "",
    ...linesWithFallback("Next Steps", nextSteps.slice(0, 10)),
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
              ? ["  How to improve or pivot:", ...pillar.advice.map((a) => `    - ${a}`)]
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
      ? gates.map(
          (gate) => {
            if (gate.status === "BLOCKED") {
              return `- Gate ${gate.gate} ${gate.name}: BLOCKED (waiting for Gate ${gate.blockedByGate})`;
            }
            return `- Gate ${gate.gate} ${gate.name}: ${gate.status} (${gate.score}/${gate.maxScore})`;
          }
        )
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
