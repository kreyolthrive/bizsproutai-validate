import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const coachingFramework: FrameworkDefinition = {
  category: "coaching",
  displayName: "Coaching",
  criteriaTemplate: [
    { key: "niche", label: "Niche clarity", weight: 0.25 },
    { key: "offer", label: "Offer & transformation", weight: 0.25 },
    { key: "trust", label: "Trust & proof", weight: 0.20 },
    { key: "acquisition", label: "Client acquisition", weight: 0.20 },
    { key: "delivery", label: "Delivery & scalability", weight: 0.10 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(coachingFramework.criteriaTemplate);

    criteria.find(c => c.key === "offer")!.recommendations.push("Package the outcome: who → result → timeframe → method.");
    criteria.find(c => c.key === "trust")!.risks.push("Without proof (testimonials/case studies), conversion may be low early.");

    const missingInfo = [
      "Who exactly is your ideal client (job, stage, biggest pain)?",
      "What measurable result do you help them achieve?",
      "What proof can you show (experience, story, results, credentials)?"
    ];

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "coaching",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial coaching validation completed.",
        topOpportunities: ["Strong coaching businesses win with a specific niche + specific outcome."],
        biggestRisks: ["If niche and proof are vague, marketing costs time and trust."]
      },
      nextSteps: [
        "Write a sharp ICP statement and a single transformation promise.",
        "Create a simple offer (1:1 or group) with clear deliverables.",
        "Run a 14-day content + DM outreach test to book 3 discovery calls."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
