import type { ValidationInput, FailureRisk, FixSuggestion, Category } from "../types";

// Claude provider for failure reasoning, risk logic, and verdict narrative

export interface ClaudeConfig {
  apiKey?: string;
  model?: string;
}

export interface FailureAnalysisRequest {
  idea: string;
  category: Category;
  existingRisks: FailureRisk[];
}

export interface FailureAnalysisResponse {
  enhancedRisks: FailureRisk[];
  narrative: string;
  confidenceScore: number;
}

export interface VerdictNarrativeRequest {
  idea: string;
  category: Category;
  score: number;
  risks: FailureRisk[];
  fixes: FixSuggestion[];
}

export interface VerdictNarrativeResponse {
  narrative: string;
  keyInsights: string[];
  actionableAdvice: string[];
}

// Check if Claude is available
export function isClaudeAvailable(config?: ClaudeConfig): boolean {
  return !!(config?.apiKey || process.env.ANTHROPIC_API_KEY);
}

// Get Claude API key
function getApiKey(config?: ClaudeConfig): string | undefined {
  return config?.apiKey || process.env.ANTHROPIC_API_KEY;
}

// Analyze failures using Claude (or fallback to heuristic)
export async function analyzeFailures(
  request: FailureAnalysisRequest,
  config?: ClaudeConfig
): Promise<FailureAnalysisResponse> {
  const apiKey = getApiKey(config);

  // If no API key, use heuristic fallback
  if (!apiKey) {
    return analyzeFailuresHeuristic(request);
  }

  try {
    // TODO: Implement actual Claude API call
    // For now, use enhanced heuristic
    return analyzeFailuresHeuristic(request);
  } catch (error) {
    console.error("Claude API error, falling back to heuristic:", error);
    return analyzeFailuresHeuristic(request);
  }
}

// Generate verdict narrative using Claude (or fallback)
export async function generateVerdictNarrative(
  request: VerdictNarrativeRequest,
  config?: ClaudeConfig
): Promise<VerdictNarrativeResponse> {
  const apiKey = getApiKey(config);

  // If no API key, use heuristic fallback
  if (!apiKey) {
    return generateVerdictNarrativeHeuristic(request);
  }

  try {
    // TODO: Implement actual Claude API call
    // For now, use enhanced heuristic
    return generateVerdictNarrativeHeuristic(request);
  } catch (error) {
    console.error("Claude API error, falling back to heuristic:", error);
    return generateVerdictNarrativeHeuristic(request);
  }
}

// Heuristic fallback for failure analysis
function analyzeFailuresHeuristic(
  request: FailureAnalysisRequest
): FailureAnalysisResponse {
  const { idea, category, existingRisks } = request;
  const ideaLower = idea.toLowerCase();

  // Enhance existing risks with more context
  const enhancedRisks: FailureRisk[] = existingRisks.map(risk => ({
    ...risk,
    reason: enhanceRiskReason(risk, category),
  }));

  // Add category-specific insights
  const categoryInsights = getCategoryInsights(category, ideaLower);
  for (const insight of categoryInsights) {
    if (!enhancedRisks.some(r => r.criterion === insight.criterion)) {
      enhancedRisks.push(insight);
    }
  }

  // Generate narrative
  const narrative = generateFailureNarrative(enhancedRisks, category);

  return {
    enhancedRisks,
    narrative,
    confidenceScore: 0.7, // Heuristic confidence
  };
}

// Heuristic fallback for verdict narrative
function generateVerdictNarrativeHeuristic(
  request: VerdictNarrativeRequest
): VerdictNarrativeResponse {
  const { category, score, risks, fixes } = request;

  let narrative: string;
  const keyInsights: string[] = [];
  const actionableAdvice: string[] = [];

  if (score >= 4.0) {
    narrative = `Your ${category} idea shows strong fundamentals. The validation indicates good potential for success, though continued attention to identified areas will be important.`;
    keyInsights.push("Core value proposition is clear");
    keyInsights.push("Market opportunity appears viable");
    actionableAdvice.push("Move forward with building your MVP");
    actionableAdvice.push("Focus on acquiring your first 10 customers");
  } else if (score >= 3.0) {
    narrative = `Your ${category} idea has potential but faces some challenges that should be addressed. With targeted improvements, this could become a viable business.`;
    keyInsights.push("Foundation is present but needs strengthening");
    for (const risk of risks.slice(0, 2)) {
      keyInsights.push(`Address: ${risk.reason}`);
    }
    for (const fix of fixes.slice(0, 2)) {
      actionableAdvice.push(fix.action);
    }
  } else {
    narrative = `Your ${category} idea faces significant obstacles in its current form. Consider the alternative approaches suggested, or make substantial pivots to address the core issues.`;
    keyInsights.push("Current approach has fundamental challenges");
    for (const risk of risks.filter(r => r.severity === "critical").slice(0, 2)) {
      keyInsights.push(`Critical: ${risk.reason}`);
    }
    actionableAdvice.push("Review alternative business models");
    actionableAdvice.push("Validate core assumptions before proceeding");
  }

  return {
    narrative,
    keyInsights: keyInsights.slice(0, 4),
    actionableAdvice: actionableAdvice.slice(0, 3),
  };
}

// Helper: Enhance risk reason with more context
function enhanceRiskReason(risk: FailureRisk, category: Category): string {
  const categoryContext: Record<Category, string> = {
    ecommerce: "In ecommerce, this typically leads to margin pressure and customer acquisition challenges.",
    coaching: "For coaching businesses, this can limit client acquisition and retention.",
    consulting: "In consulting, this may restrict your ability to command premium rates.",
    finance: "In financial services, this could create regulatory or trust barriers.",
    tech: "For tech products, this often results in slow adoption or market fit issues.",
    saas: "In SaaS, this typically manifests as churn or CAC/LTV imbalance.",
    marketplace: "For marketplaces, this makes solving the chicken-and-egg problem harder.",
    local_service: "For local services, this limits geographic expansion and scalability.",
    health_wellness: "In health/wellness, this can create credibility or compliance challenges.",
    edtech: "For education products, this often leads to low completion rates or engagement.",
    legal_law: "In legal services, this may create liability or regulatory exposure.",
  };

  const context = categoryContext[category] || "";
  return `${risk.reason} ${context}`;
}

// Helper: Get category-specific insights
function getCategoryInsights(category: Category, ideaLower: string): FailureRisk[] {
  const insights: FailureRisk[] = [];

  // Add category-specific risks if certain keywords are detected
  const categoryChecks: Record<Category, Array<{ keyword: string; risk: FailureRisk }>> = {
    ecommerce: [
      {
        keyword: "amazon",
        risk: {
          criterion: "differentiation",
          score: 2,
          reason: "Competing directly with Amazon is extremely difficult without clear differentiation",
          severity: "critical",
        },
      },
    ],
    marketplace: [
      {
        keyword: "both sides",
        risk: {
          criterion: "chicken_egg",
          score: 2,
          reason: "Building both supply and demand simultaneously is the hardest marketplace challenge",
          severity: "high",
        },
      },
    ],
    finance: [
      {
        keyword: "money",
        risk: {
          criterion: "regulatory_compliance",
          score: 2,
          reason: "Handling money requires licenses and compliance frameworks",
          severity: "high",
        },
      },
    ],
    coaching: [],
    consulting: [],
    tech: [],
    saas: [],
    local_service: [],
    health_wellness: [],
    edtech: [],
    legal_law: [],
  };

  const checks = categoryChecks[category] || [];
  for (const check of checks) {
    if (ideaLower.includes(check.keyword)) {
      insights.push(check.risk);
    }
  }

  return insights;
}

// Helper: Generate failure narrative
function generateFailureNarrative(risks: FailureRisk[], category: Category): string {
  const criticalCount = risks.filter(r => r.severity === "critical").length;
  const highCount = risks.filter(r => r.severity === "high").length;

  if (criticalCount > 0) {
    return `This ${category} idea has ${criticalCount} critical issue(s) that must be addressed. Without resolving these, the business faces significant risk of failure.`;
  }

  if (highCount > 0) {
    return `This ${category} idea has ${highCount} high-priority concern(s) that should be addressed. These issues could limit growth or profitability if not resolved.`;
  }

  return `This ${category} idea has some areas for improvement, but no critical blockers were identified.`;
}
