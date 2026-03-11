import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const healthWellnessFramework: FrameworkDefinition = {
  category: "health_wellness",
  displayName: "Health & Wellness",
  criteriaTemplate: [
    { key: "outcome_clarity", label: "Outcome clarity & measurability", weight: 0.25 },
    { key: "trust_credibility", label: "Trust & credibility", weight: 0.25 },
    { key: "regulatory_compliance", label: "Regulatory compliance", weight: 0.15 },
    { key: "retention_habits", label: "Retention & habit formation", weight: 0.20 },
    { key: "pricing_accessibility", label: "Pricing & accessibility", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(healthWellnessFramework.criteriaTemplate);

    const missingInfo = [
      "What specific health outcome will your service/product deliver?",
      "What credentials or certifications do you have to build trust?",
      "Are there regulatory requirements (FDA, health claims, licensing) you need to meet?"
    ];

    criteria.find(c => c.key === "trust_credibility")!.risks.push("Health decisions require high trust—credentials and testimonials are critical.");
    criteria.find(c => c.key === "regulatory_compliance")!.risks.push("Health claims without proper backing can lead to legal issues.");
    criteria.find(c => c.key === "retention_habits")!.recommendations.push("Build accountability mechanisms to help clients maintain habits.");

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "health_wellness",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial health & wellness validation completed.",
        topOpportunities: ["Health/wellness has strong emotional drivers and recurring revenue potential."],
        biggestRisks: ["Trust barriers are high—people are skeptical of health promises."]
      },
      nextSteps: [
        "Define one clear, measurable outcome your service delivers.",
        "Document your credentials and gather 3-5 transformation testimonials.",
        "Research regulatory requirements for health claims in your market."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
