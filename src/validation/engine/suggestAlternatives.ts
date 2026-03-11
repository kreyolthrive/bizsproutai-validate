import type { Category, AlternativeModel, ScoreBand, FailureRisk } from "../types";
import type { LoadedFramework } from "./loadFramework";
import { categorySchemas } from "../schemas";

export interface AlternativeSuggestion {
  alternatives: AlternativeModel[];
  reasoning: string;
  pivotDirection: "same_market" | "same_skill" | "adjacent" | "complete_pivot";
}

// Cross-category alternatives based on transferable skills/assets
const categoryAlternatives: Record<Category, { related: Category[]; reason: string }[]> = {
  ecommerce: [
    { related: ["consulting"], reason: "Your product knowledge can become consulting for other ecommerce brands" },
    { related: ["edtech"], reason: "Teach others what you learned about selling products" },
    { related: ["local_service"], reason: "Offer the product/service locally before scaling online" },
  ],
  coaching: [
    { related: ["edtech"], reason: "Package your coaching into scalable courses" },
    { related: ["consulting"], reason: "Offer strategic advice to organizations instead of individuals" },
    { related: ["health_wellness"], reason: "Focus on specific wellness transformation" },
  ],
  consulting: [
    { related: ["coaching"], reason: "Work with individuals instead of companies" },
    { related: ["saas"], reason: "Productize your methodology into software" },
    { related: ["edtech"], reason: "Teach your expertise at scale" },
  ],
  finance: [
    { related: ["edtech"], reason: "Teach financial literacy instead of handling money" },
    { related: ["consulting"], reason: "Advise on financial strategy without regulatory burden" },
    { related: ["saas"], reason: "Build tools for financial professionals" },
  ],
  tech: [
    { related: ["saas"], reason: "Focus on recurring revenue model" },
    { related: ["consulting"], reason: "Offer your technical expertise as a service" },
    { related: ["marketplace"], reason: "Connect users instead of building all features" },
  ],
  saas: [
    { related: ["consulting"], reason: "Offer done-for-you service before automating" },
    { related: ["tech"], reason: "Build a simpler tool or API" },
    { related: ["edtech"], reason: "Teach the skills your software automates" },
  ],
  marketplace: [
    { related: ["local_service"], reason: "Start with one side of the marketplace as a service" },
    { related: ["saas"], reason: "Build tools for one side of your marketplace" },
    { related: ["consulting"], reason: "Manually match buyers and sellers while learning" },
  ],
  local_service: [
    { related: ["ecommerce"], reason: "Sell products related to your service" },
    { related: ["coaching"], reason: "Teach others to do what you do" },
    { related: ["tech"], reason: "Build an app to scale your service" },
  ],
  health_wellness: [
    { related: ["coaching"], reason: "Focus on transformation coaching" },
    { related: ["edtech"], reason: "Create wellness education content" },
    { related: ["ecommerce"], reason: "Sell wellness products" },
  ],
  edtech: [
    { related: ["coaching"], reason: "Offer personalized learning experiences" },
    { related: ["consulting"], reason: "Train organizations instead of individuals" },
    { related: ["saas"], reason: "Build learning management tools" },
  ],
  legal_law: [
    { related: ["edtech"], reason: "Teach legal concepts without giving advice" },
    { related: ["saas"], reason: "Build legal tech tools" },
    { related: ["consulting"], reason: "Offer compliance consulting" },
  ],
};

export function suggestAlternatives(
  framework: LoadedFramework,
  failureRisks: FailureRisk[],
  overallScore: ScoreBand
): AlternativeSuggestion {
  const alternatives: AlternativeModel[] = [];
  let pivotDirection: AlternativeSuggestion["pivotDirection"] = "same_market";
  let reasoning = "";

  // 1. First, suggest alternatives from within the same category
  for (const model of framework.alternativeModels.slice(0, 2)) {
    alternatives.push({
      model,
      reason: "Alternative business model in the same space",
      viability: Math.min(5, overallScore + 1) as ScoreBand,
    });
  }

  // 2. Analyze failure risks to determine pivot direction
  const criticalRisks = failureRisks.filter(r => r.severity === "critical");
  const primaryRiskCriteria = criticalRisks.map(r => r.criterion);

  // Determine reasoning based on risks
  if (primaryRiskCriteria.includes("regulatory_compliance") || primaryRiskCriteria.includes("compliance_safety")) {
    reasoning = "Regulatory challenges suggest pivoting to less regulated alternatives";
    pivotDirection = "adjacent";
  } else if (primaryRiskCriteria.includes("chicken_egg") || primaryRiskCriteria.includes("cold_start_death")) {
    reasoning = "Marketplace dynamics are challenging; consider starting with one side only";
    pivotDirection = "same_skill";
  } else if (primaryRiskCriteria.includes("unit_economics") || primaryRiskCriteria.includes("cac_ltv_death")) {
    reasoning = "Economics don't work; consider higher-margin or lower-cost alternatives";
    pivotDirection = "same_market";
  } else if (primaryRiskCriteria.includes("trust_gap") || primaryRiskCriteria.includes("credibility")) {
    reasoning = "Trust is hard to build; consider proving expertise first through content or consulting";
    pivotDirection = "same_skill";
  } else {
    reasoning = "Consider related business models that leverage your existing knowledge";
    pivotDirection = "adjacent";
  }

  // 3. Add cross-category alternatives
  const categoryAlts = categoryAlternatives[framework.category] || [];
  for (const alt of categoryAlts.slice(0, 2)) {
    const altCategory = alt.related[0];
    const altSchema = categorySchemas[altCategory];

    if (altSchema) {
      // Pick a specific model from the alternative category
      const specificModel = altSchema.alternativeModels[0] || altSchema.displayName;

      alternatives.push({
        model: `${altSchema.displayName}: ${specificModel}`,
        reason: alt.reason,
        viability: Math.min(5, overallScore + 1) as ScoreBand,
      });
    }
  }

  // 4. Add country-specific alternatives if applicable
  if (framework.countryAdjustments.applied && framework.countryAdjustments.country) {
    const countryCode = framework.countryAdjustments.country;

    // Suggest diaspora-focused alternative for certain countries
    if (["HT", "NG", "KE", "MX"].includes(countryCode)) {
      alternatives.push({
        model: "Diaspora market focus",
        reason: `Target ${countryCode} diaspora abroad who have higher purchasing power and send remittances`,
        viability: 4 as ScoreBand,
      });
    }
  }

  // Limit to 4 alternatives
  const finalAlternatives = alternatives.slice(0, 4);

  return {
    alternatives: finalAlternatives,
    reasoning,
    pivotDirection,
  };
}

// Helper to format alternatives for display
export function formatAlternativesForDisplay(suggestion: AlternativeSuggestion): string[] {
  const lines: string[] = [
    `Pivot suggestion: ${suggestion.reasoning}`,
    "",
    "Alternative business models to consider:",
  ];

  for (const alt of suggestion.alternatives) {
    lines.push(`• ${alt.model} (viability: ${alt.viability}/5)`);
    lines.push(`  → ${alt.reason}`);
  }

  return lines;
}
