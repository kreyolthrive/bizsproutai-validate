import type { FrameworkDefinition, ValidationInput, CriterionResult } from "../types";
import { computeOverallScore, scoreToVerdict } from "../scoring";
import { ENGINE_VERSION } from "../constants";

function baseCriteria(tpl: FrameworkDefinition["criteriaTemplate"]): CriterionResult[] {
  return tpl.map(c => ({ ...c, score: 3, evidence: [], risks: [], recommendations: [] }));
}

export const legalLawFramework: FrameworkDefinition = {
  category: "legal_law",
  displayName: "Legal & Law",
  criteriaTemplate: [
    { key: "regulatory_compliance", label: "Regulatory & licensing compliance", weight: 0.25 },
    { key: "trust_authority", label: "Trust & authority positioning", weight: 0.25 },
    { key: "service_scope", label: "Service scope & specialization", weight: 0.20 },
    { key: "client_acquisition", label: "Client acquisition channels", weight: 0.15 },
    { key: "pricing_model", label: "Pricing model & margins", weight: 0.15 }
  ],
  async run(input: ValidationInput) {
    const criteria = baseCriteria(legalLawFramework.criteriaTemplate);

    const missingInfo = [
      "What specific legal service or niche will you focus on?",
      "Do you have the required licenses/bar membership to practice in your jurisdiction?",
      "How will you build trust with clients who need legal help?"
    ];

    criteria.find(c => c.key === "regulatory_compliance")!.risks.push("Legal services require proper licensing—unauthorized practice of law is illegal.");
    criteria.find(c => c.key === "trust_authority")!.recommendations.push("Build authority through content, speaking, and case studies (respecting confidentiality).");
    criteria.find(c => c.key === "service_scope")!.recommendations.push("Specialize in a niche (immigration, small business, family law) rather than being a generalist.");

    const overallScore = computeOverallScore(criteria);
    const verdict = scoreToVerdict(overallScore);

    return {
      category: "legal_law",
      locale: input.locale ?? "en",
      overallScore,
      verdict,
      summary: {
        oneLiner: "Initial legal/law business validation completed.",
        topOpportunities: ["Legal services have high margins and strong demand for specialized expertise."],
        biggestRisks: ["Licensing requirements and trust barriers are significant entry hurdles."]
      },
      nextSteps: [
        "Verify all licensing requirements for your jurisdiction and practice area.",
        "Choose a narrow specialization where you can become the go-to expert.",
        "Build a referral network with complementary professionals (accountants, advisors)."
      ],
      criteria,
      assumptions: [],
      missingInfo,
      meta: { version: ENGINE_VERSION, generatedAt: new Date().toISOString() }
    };
  }
};
