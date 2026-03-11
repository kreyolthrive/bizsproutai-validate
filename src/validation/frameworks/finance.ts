import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const financeFramework: FrameworkDefinition = {
  category: "finance",
  displayName: "Finance",
  criteriaTemplate: [
    { key: "compliance", label: "Compliance & disclaimers", weight: 0.30 },
    { key: "trust", label: "Trust signals", weight: 0.20 },
    { key: "value", label: "Clear value proposition", weight: 0.20 },
    { key: "distribution", label: "Distribution", weight: 0.15 },
    { key: "risk", label: "Risk management", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(financeFramework.criteriaTemplate);

    criteria.find(c => c.key === "compliance")!.recommendations.push("Add clear disclaimers and avoid guaranteed income claims.");
    criteria.find(c => c.key === "risk")!.risks.push("Financial products/services may require licensing depending on jurisdiction.");

    const missingInfo = [
      "Which country/state will you operate in?",
      "Is this education/coaching or regulated advice/services?",
      "How will you protect users from harmful decisions (guardrails)?"
    ];

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "finance",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial finance validation completed (with compliance caution).",
        topOpportunities: ["Finance brands can grow fast when built on trust + education."],
        biggestRisks: ["Compliance and liability risks must be handled upfront."]
      },
      nextSteps: [
        "Define exactly what you do (education vs advisory) and add disclaimers.",
        "Confirm licensing requirements for your region.",
        "Build trust assets: transparent methodology, testimonials, and clear boundaries."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
