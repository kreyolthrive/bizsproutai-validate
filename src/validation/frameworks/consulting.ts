import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const consultingFramework: FrameworkDefinition = {
  category: "consulting",
  displayName: "Consulting",
  criteriaTemplate: [
    { key: "icp", label: "ICP & decision-maker access", weight: 0.30 },
    { key: "problem", label: "Problem tied to revenue/cost/risk", weight: 0.25 },
    { key: "proof", label: "Proof & credibility", weight: 0.20 },
    { key: "sales_cycle", label: "Sales cycle & pricing", weight: 0.15 },
    { key: "delivery", label: "Delivery capacity", weight: 0.10 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(consultingFramework.criteriaTemplate);

    criteria.find(c => c.key === "problem")!.recommendations.push("Quantify the problem in $$ or hours saved.");
    criteria.find(c => c.key === "sales_cycle")!.risks.push("Long sales cycles can delay revenue—start with a smaller entry offer.");

    const missingInfo = [
      "Which industry and company size are you targeting?",
      "What exact decision-maker do you sell to?",
      "What is the result you produce in measurable terms?"
    ];

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "consulting",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial consulting validation completed.",
        topOpportunities: ["Consulting wins when the problem is expensive and urgent."],
        biggestRisks: ["Without ICP clarity, outreach and close rates stay low."]
      },
      nextSteps: [
        "Define ICP + decision-maker in one sentence.",
        "Create a 1-page offer with outcomes, process, and price range.",
        "Build a lead list of 50 targets and run 10/day outreach for 7 days."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
