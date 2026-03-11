import type { Category, CountryCode, CategorySchema, CountrySchema, Region } from "../types";
import { getCategorySchema, getCountrySchema, getRegionSchema } from "../schemas";

export interface LoadedFramework {
  category: Category;
  displayName: string;
  criteria: Array<{
    key: string;
    label: string;
    weight: number;
    description?: string;
    riskIndicators: string[];
    fixSuggestions: string[];
  }>;
  failurePatterns: Array<{
    pattern: string;
    severity: "critical" | "high" | "medium" | "low";
    description: string;
  }>;
  alternativeModels: string[];
  countryAdjustments: {
    applied: boolean;
    country?: CountryCode;
    weightMultipliers: Record<string, number>;
    warnings: string[];
    marketNotes: string[];
    paymentRails: string[];
  };
  regionContext: {
    region?: Region;
    challenges: string[];
    paymentNotes: string[];
  };
}

export interface LoadFrameworkInput {
  category: Category;
  countryCode?: CountryCode;
}

export function loadFramework(input: LoadFrameworkInput): LoadedFramework {
  const categorySchema = getCategorySchema(input.category);

  if (!categorySchema) {
    throw new Error(`Unknown category: ${input.category}`);
  }

  // Start with base framework
  const framework: LoadedFramework = {
    category: categorySchema.category,
    displayName: categorySchema.displayName,
    criteria: categorySchema.criteria.map(c => ({ ...c })), // Deep copy
    failurePatterns: [...categorySchema.failurePatterns],
    alternativeModels: [...categorySchema.alternativeModels],
    countryAdjustments: {
      applied: false,
      weightMultipliers: {},
      warnings: [],
      marketNotes: [],
      paymentRails: [],
    },
    regionContext: {
      challenges: [],
      paymentNotes: [],
    },
  };

  // Apply country adjustments if provided
  if (input.countryCode) {
    const countrySchema = getCountrySchema(input.countryCode);

    if (countrySchema) {
      framework.countryAdjustments = {
        applied: true,
        country: input.countryCode,
        weightMultipliers: Object.entries(countrySchema.adjustments).reduce((acc, [key, value]) => {
          acc[key] = value.weightMultiplier;
          return acc;
        }, {} as Record<string, number>),
        warnings: [...countrySchema.warnings],
        marketNotes: [...countrySchema.marketNotes],
        paymentRails: [...countrySchema.paymentRails],
      };

      // Apply weight adjustments to criteria
      for (const criterion of framework.criteria) {
        const adjustment = countrySchema.adjustments[criterion.key];
        if (adjustment) {
          criterion.weight *= adjustment.weightMultiplier;
          if (adjustment.reason) {
            criterion.description = criterion.description
              ? `${criterion.description} (${adjustment.reason})`
              : adjustment.reason;
          }
        }
      }

      // Normalize weights to sum to 1.0
      const totalWeight = framework.criteria.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight > 0) {
        for (const criterion of framework.criteria) {
          criterion.weight = criterion.weight / totalWeight;
        }
      }

      // Add region context
      const regionSchema = getRegionSchema(countrySchema.region);
      if (regionSchema) {
        framework.regionContext = {
          region: countrySchema.region,
          challenges: [...regionSchema.commonChallenges],
          paymentNotes: [...regionSchema.paymentNotes],
        };
      }

      // Add payment-related warnings for ecommerce/finance categories
      if (input.category === "ecommerce" || input.category === "finance" || input.category === "marketplace") {
        const paymentWarning = `Primary payment methods in ${countrySchema.name}: ${countrySchema.paymentRails.slice(0, 3).join(", ")}`;
        if (!framework.countryAdjustments.warnings.includes(paymentWarning)) {
          framework.countryAdjustments.warnings.push(paymentWarning);
        }
      }
    }
  }

  return framework;
}

// Helper to get a human-readable summary of adjustments
export function summarizeAdjustments(framework: LoadedFramework): string[] {
  const summary: string[] = [];

  if (framework.countryAdjustments.applied && framework.countryAdjustments.country) {
    summary.push(`Framework adjusted for ${framework.countryAdjustments.country}`);
  }

  if (framework.countryAdjustments.warnings.length > 0) {
    summary.push(...framework.countryAdjustments.warnings);
  }

  if (framework.regionContext.region) {
    summary.push(`Regional context: ${framework.regionContext.region}`);
  }

  return summary;
}
