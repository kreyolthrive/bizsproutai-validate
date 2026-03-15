import type {
  DynamicValidationResult,
  FrameworkDecision,
  Locale,
} from "@/src/validation/types";
import {
  resolveFrameworkDecision,
  resolveOverallScore100,
} from "@/src/validation/decision";

type ValidationReportInput = {
  idea: string;
  email?: string;
  locale: Locale;
  result: DynamicValidationResult;
  generatedAt?: string;
};

export type ValidationReportDocument = {
  filename: string;
  text: string;
  generatedAt: string;
};

type UnknownRecord = Record<string, unknown>;

function resolveReportScore(result: DynamicValidationResult): number {
  return resolveOverallScore100(result);
}

function decisionLabel(decision: FrameworkDecision): string {
  if (decision === "GO") return "Promising — Ready to Execute";
  if (decision === "CONDITIONAL_GO") return "Promising — Needs Validation";
  if (decision === "NEED_WORK") return "Early Stage — Validate Before Building";
  return "High Risk — Improve or Pivot";
}

function getDecision(result: DynamicValidationResult): FrameworkDecision {
  return resolveFrameworkDecision(result);
}

function safeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0
  );
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function resolveCategory(result: DynamicValidationResult): string {
  return result.businessCategory ?? result.business_category ?? result.category ?? "n/a";
}

function resolveCountry(result: DynamicValidationResult): string {
  const code = readString(result.country?.code);
  if (code) return code;

  const countryUnknown = result.country as unknown;
  if (isRecord(countryUnknown)) {
    const runtimeName =
      readString(countryUnknown["name"]) ??
      readString(countryUnknown["label"]) ??
      readString(countryUnknown["country"]);

    if (runtimeName) return runtimeName;
  }

  return "n/a";
}

function resolveFramework(result: DynamicValidationResult): string {
  return (
    result.selectedFramework?.frameworkLabel ??
    result.frameworkUsed ??
    result.framework_used ??
    result.framework?.label ??
    "General"
  );
}

function resolveSummary(result: DynamicValidationResult): string {
  return result.summary?.oneLiner ?? "Validation completed.";
}

function resolveConfidence(result: DynamicValidationResult): string {
  const candidates: unknown[] = [
    (result as UnknownRecord)["confidence"],
    (result as UnknownRecord)["confidenceScore"],
    (result as UnknownRecord)["confidence_score"],
    result.summary && isRecord(result.summary)
      ? result.summary["confidence"]
      : undefined,
  ];

  for (const value of candidates) {
    const numeric = readNumber(value);
    if (typeof numeric === "number") {
      return `${numeric}/100`;
    }

    const text = readString(value);
    if (text) return text;
  }

  return "n/a";
}

function resolveTopOpportunities(result: DynamicValidationResult): string[] {
  return normalizeStringArray(
    result.strengths ?? result.summary?.topOpportunities ?? []
  ).slice(0, 4);
}

function resolveBiggestRisks(result: DynamicValidationResult): string[] {
  return normalizeStringArray(
    result.keyRisks ?? result.key_risks ?? result.summary?.biggestRisks ?? []
  ).slice(0, 4);
}

function resolveNextActions(result: DynamicValidationResult): string[] {
  return normalizeStringArray(
    result.recommendedNextSteps ??
      result.recommended_next_steps ??
      result.nextActions ??
      []
  ).slice(0, 6);
}

function resolveScoreLines(result: DynamicValidationResult): string[] {
  const scores = result.scores;

  return [
    `Overall score: ${resolveReportScore(result)}/100`,
    `Confidence: ${resolveConfidence(result)}`,
    `Market demand: ${
      typeof scores?.market_demand === "number"
        ? `${scores.market_demand}/100`
        : "n/a"
    }`,
    `Competition: ${
      typeof scores?.competition === "number"
        ? `${scores.competition}/100`
        : "n/a"
    }`,
    `Execution feasibility: ${
      typeof scores?.execution_feasibility === "number"
        ? `${scores.execution_feasibility}/100`
        : "n/a"
    }`,
    `Monetization: ${
      typeof scores?.monetization === "number"
        ? `${scores.monetization}/100`
        : "n/a"
    }`,
    `Acquisition: ${
      typeof scores?.acquisition === "number"
        ? `${scores.acquisition}/100`
        : "n/a"
    }`,
  ];
}

function resolveGateLines(result: DynamicValidationResult): string[] {
  const gates = result.frameworkReport?.gates ?? [];

  if (!Array.isArray(gates) || gates.length === 0) {
    return ["n/a"];
  }

  return gates.map((gate) => {
    if (gate.status === "BLOCKED") {
      return `Gate ${gate.gate} ${gate.name}: BLOCKED (waiting for Gate ${gate.blockedByGate})`;
    }

    return `Gate ${gate.gate} ${gate.name}: ${gate.status} (${gate.score}/${gate.maxScore})`;
  });
}

function buildSection(title: string, lines: string[]): string {
  return [title, ...lines.map((line) => `- ${line}`), ""].join("\n");
}

export function buildValidationReportDocument(
  input: ValidationReportInput
): ValidationReportDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const decision = getDecision(input.result);
  const decisionText = decisionLabel(decision);
  const filenameIdea = input.idea.split(/\s+/).slice(0, 6).join("-");
  const filename = `bizsproutai-validation-${safeSegment(
    filenameIdea || "report"
  )}.txt`;

  const top = resolveTopOpportunities(input.result);
  const risks = resolveBiggestRisks(input.result);
  const actions = resolveNextActions(input.result);

  const text = [
    "BizSproutAI Business Validation Report",
    "=====================================",
    "",
    `Generated at: ${generatedAt}`,
    `Locale: ${input.locale}`,
    `Email: ${input.email ?? "not provided"}`,
    "",
    `Decision: ${decisionText}`,
    ...resolveScoreLines(input.result),
    "",
    buildSection("Submitted Idea", [input.idea]),
    buildSection("Summary", [resolveSummary(input.result)]),
    buildSection("Context", [
      `Category: ${resolveCategory(input.result)}`,
      `Country: ${resolveCountry(input.result)}`,
      `Framework: ${resolveFramework(input.result)}`,
    ]),
    buildSection("Top Opportunities", top.length ? top : ["n/a"]),
    buildSection("Biggest Risks", risks.length ? risks : ["n/a"]),
    buildSection("Next Actions", actions.length ? actions : ["n/a"]),
    buildSection("Gate Analysis", resolveGateLines(input.result)),
    "Generated by BizSproutAI",
    "BizSproutAI is a DBA of Kreyol Thrive Biz.",
    "",
  ].join("\n");

  return {
    filename,
    text,
    generatedAt,
  };
}
