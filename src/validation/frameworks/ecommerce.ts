import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const ecommerceFramework: FrameworkDefinition = {
  category: "ecommerce",
  displayName: "Ecommerce",
  criteriaTemplate: [
    { key: "demand", label: "Demand & intent", weight: 0.25 },
    { key: "differentiation", label: "Differentiation", weight: 0.20 },
    { key: "unit_economics", label: "Unit economics", weight: 0.25 },
    { key: "ops", label: "Operations & fulfillment", weight: 0.15 },
    { key: "distribution", label: "Distribution channels", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(ecommerceFramework.criteriaTemplate);

    const missingInfo = [
      "What is your target price, COGS, and shipping cost?",
      "What makes this product clearly different from Amazon alternatives?",
      "Which single channel will you use first (UGC, SEO, ads, partners)?"
    ];

    criteria.find(c => c.key === "unit_economics")!.risks.push("Margins/returns are unknown until COGS + shipping are estimated.");
    criteria.find(c => c.key === "ops")!.recommendations.push("Define your fulfillment plan: in-house, 3PL, dropship, or wholesale.");

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "ecommerce",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial ecommerce validation completed.",
        topOpportunities: ["Pick a tight niche and a clear product promise."],
        biggestRisks: ["Margins and fulfillment complexity are not yet proven."]
      },
      nextSteps: [
        "Estimate COGS + shipping + returns and compute target margin.",
        "Write a one-sentence differentiation statement.",
        "Run a 7-day demand test (UGC or search validation) before buying inventory."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
