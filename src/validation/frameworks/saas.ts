import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const saasFramework: FrameworkDefinition = {
  category: "saas",
  displayName: "SaaS",
  criteriaTemplate: [
    { key: "problem_severity", label: "Problem severity & urgency", weight: 0.25 },
    { key: "willingness_to_pay", label: "Willingness to pay", weight: 0.20 },
    { key: "retention", label: "Retention & stickiness", weight: 0.20 },
    { key: "acquisition", label: "Customer acquisition", weight: 0.20 },
    { key: "technical_feasibility", label: "Technical feasibility", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(saasFramework.criteriaTemplate);

    const missingInfo = [
      "What specific pain point does your SaaS solve, and how often do users experience it?",
      "What is your target monthly price and how did you validate willingness to pay?",
      "What is your primary acquisition channel (content, ads, outbound, product-led)?"
    ];

    criteria.find(c => c.key === "problem_severity")!.risks.push("Problem urgency determines if users will pay monthly vs use free alternatives.");
    criteria.find(c => c.key === "retention")!.recommendations.push("Define your core habit loop: what brings users back daily/weekly?");
    criteria.find(c => c.key === "acquisition")!.recommendations.push("Focus on one acquisition channel first before diversifying.");

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "saas",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial SaaS validation completed.",
        topOpportunities: ["SaaS has strong unit economics if retention is high."],
        biggestRisks: ["Churn risk is critical—validate stickiness before building."]
      },
      nextSteps: [
        "Interview 10 potential users about their current solution and pain frequency.",
        "Test willingness to pay with a landing page + waitlist or pre-sale.",
        "Build the smallest MVP that demonstrates core value in under 2 weeks."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
