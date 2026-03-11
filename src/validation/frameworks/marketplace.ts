import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const marketplaceFramework: FrameworkDefinition = {
  category: "marketplace",
  displayName: "Marketplace",
  criteriaTemplate: [
    { key: "supply_liquidity", label: "Supply acquisition & liquidity", weight: 0.25 },
    { key: "demand_liquidity", label: "Demand acquisition & match rate", weight: 0.25 },
    { key: "trust_safety", label: "Trust & safety mechanisms", weight: 0.15 },
    { key: "take_rate", label: "Take rate & unit economics", weight: 0.20 },
    { key: "network_effects", label: "Network effects potential", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(marketplaceFramework.criteriaTemplate);

    const missingInfo = [
      "Which side will you focus on first—supply or demand?",
      "What is your planned take rate and how does it compare to alternatives?",
      "How will you ensure trust between strangers transacting on your platform?"
    ];

    criteria.find(c => c.key === "supply_liquidity")!.risks.push("Marketplaces fail when they can't attract enough quality supply.");
    criteria.find(c => c.key === "trust_safety")!.recommendations.push("Plan for reviews, verification, and dispute resolution from day one.");
    criteria.find(c => c.key === "network_effects")!.recommendations.push("Start with a constrained geo or vertical to reach critical mass faster.");

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "marketplace",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial marketplace validation completed.",
        topOpportunities: ["Marketplaces create defensible network effects when liquidity is achieved."],
        biggestRisks: ["Chicken-and-egg problem: need both supply and demand simultaneously."]
      },
      nextSteps: [
        "Choose supply-first or demand-first strategy based on which is harder to get.",
        "Launch in a single neighborhood/vertical to prove liquidity before expanding.",
        "Manually match early transactions to validate the match quality and take rate."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
