import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const edtechFramework: FrameworkDefinition = {
  category: "edtech",
  displayName: "EdTech",
  criteriaTemplate: [
    { key: "learning_outcome", label: "Learning outcome clarity", weight: 0.25 },
    { key: "engagement_completion", label: "Engagement & completion rates", weight: 0.25 },
    { key: "monetization", label: "Monetization model", weight: 0.20 },
    { key: "content_quality", label: "Content quality & differentiation", weight: 0.15 },
    { key: "distribution", label: "Distribution & discovery", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(edtechFramework.criteriaTemplate);

    const missingInfo = [
      "What specific skill or knowledge will learners gain, and how will you measure it?",
      "Who pays—the learner, their employer, or an institution?",
      "How will you keep learners engaged and completing the course/program?"
    ];

    criteria.find(c => c.key === "engagement_completion")!.risks.push("Most online courses have <10% completion—engagement design is critical.");
    criteria.find(c => c.key === "monetization")!.recommendations.push("Consider B2B sales to employers/institutions for more predictable revenue.");
    criteria.find(c => c.key === "learning_outcome")!.recommendations.push("Promise a specific transformation: 'Learn X to do Y in Z weeks.'");

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "edtech",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial edtech validation completed.",
        topOpportunities: ["Education has strong demand, especially for career-relevant skills."],
        biggestRisks: ["Completion rates are notoriously low—design for engagement from day one."]
      },
      nextSteps: [
        "Define your exact learning outcome and how you'll prove it (certificate, portfolio, job).",
        "Create a mini-course or workshop to test engagement and completion.",
        "Identify your buyer: individual learners, employers, or institutions."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
