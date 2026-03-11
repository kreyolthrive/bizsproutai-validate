import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const techFramework: FrameworkDefinition = {
  category: "tech",
  displayName: "Tech / Product",
  criteriaTemplate: [
    { key: "pain", label: "Pain severity & urgency", weight: 0.25 },
    { key: "mvp", label: "MVP feasibility", weight: 0.20 },
    { key: "differentiation", label: "Differentiation", weight: 0.20 },
    { key: "gtm", label: "Go-to-market", weight: 0.20 },
    { key: "retention", label: "Retention & stickiness", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(techFramework.criteriaTemplate);

    criteria.find(c => c.key === "mvp")!.recommendations.push("Scope the MVP to one core workflow and one user type.");
    criteria.find(c => c.key === "gtm")!.risks.push("Tech ideas fail when distribution is an afterthought.");

    const missingInfo = [
      "Who is the user and what workflow do you improve?",
      "What will the first MVP do in 1–2 weeks?",
      "What channel will get your first 20 users?"
    ];

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "tech",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial tech validation completed.",
        topOpportunities: ["Tight MVP + clear distribution can validate fast."],
        biggestRisks: ["Overbuilding before confirming demand and onboarding."]
      },
      nextSteps: [
        "Write the core user, pain, and promised outcome in 1 sentence.",
        "Build a 1-feature MVP and ship in 7–14 days.",
        "Run a simple acquisition test to get 10–20 active users."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
