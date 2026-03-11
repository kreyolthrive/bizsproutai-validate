import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const localServiceFramework: FrameworkDefinition = {
  category: "local_service",
  displayName: "Local Service",
  criteriaTemplate: [
    { key: "local_demand", label: "Local demand & repeat potential", weight: 0.25 },
    { key: "service_capacity", label: "Service capacity & scalability", weight: 0.20 },
    { key: "pricing_margins", label: "Pricing & margins", weight: 0.20 },
    { key: "trust_reputation", label: "Trust & local reputation", weight: 0.20 },
    { key: "accessibility", label: "Accessibility & convenience", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(localServiceFramework.criteriaTemplate);

    const missingInfo = [
      "What geographic area will you serve and what is the population density?",
      "How will customers find you (referrals, Google Maps, social media, flyers)?",
      "What is your capacity per day/week and how will you scale if demand grows?"
    ];

    criteria.find(c => c.key === "local_demand")!.risks.push("Local services live or die by word-of-mouth reputation.");
    criteria.find(c => c.key === "service_capacity")!.recommendations.push("Start by serving a small area well before expanding territory.");
    criteria.find(c => c.key === "trust_reputation")!.recommendations.push("Collect reviews/testimonials from first 10 customers for social proof.");

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "local_service",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial local service validation completed.",
        topOpportunities: ["Local services build strong recurring revenue through relationships."],
        biggestRisks: ["Scaling is limited by geography and personal capacity."]
      },
      nextSteps: [
        "Define your exact service area and ideal customer profile.",
        "Get your first 3 paying customers through personal network or door-to-door.",
        "Set up Google Business Profile and WhatsApp Business for discoverability."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
