import type { ScoreBand, CriterionResult, FailureRisk, ValidationInput, Category } from "../types";
import type { LoadedFramework } from "./loadFramework";

export interface RiskEvaluation {
  criteria: CriterionResult[];
  failureRisks: FailureRisk[];
  overallScore: ScoreBand;
  hasCriticalRisks: boolean;
  hasHighRisks: boolean;
}

// Idea analysis result
interface IdeaAnalysis {
  hasTargetAudience: boolean;
  hasProblemStatement: boolean;
  hasSolution: boolean;
  hasRevenueModel: boolean;
  hasDifferentiator: boolean;
  hasValidation: boolean;
  hasExperience: boolean;
  wordCount: number;
  specificity: "vague" | "moderate" | "detailed";
  detectedElements: string[];
  audienceDetails: string | null;
  solutionDetails: string | null;
}

// Analyze the idea text to extract business elements
function analyzeIdea(idea: string): IdeaAnalysis {
  const ideaLower = idea.toLowerCase();
  const words = idea.split(/\s+/);
  const wordCount = words.length;

  const analysis: IdeaAnalysis = {
    hasTargetAudience: false,
    hasProblemStatement: false,
    hasSolution: false,
    hasRevenueModel: false,
    hasDifferentiator: false,
    hasValidation: false,
    hasExperience: false,
    wordCount,
    specificity: wordCount < 20 ? "vague" : wordCount < 50 ? "moderate" : "detailed",
    detectedElements: [],
    audienceDetails: null,
    solutionDetails: null,
  };

  // Target audience indicators
  const audiencePatterns = [
    /for ([\w\s]+?) (who|that|looking|in|with)/i,
    /targeting ([\w\s]+)/i,
    /(small business|entrepreneurs|parents|students|professionals|freelancers|companies|startups|restaurants|hotels|shops|stores)/i,
    /(women|men|young|old|senior|teen|millennial|gen z|children|kids|adults)/i,
    /people (who|that|in|with)/i,
    /customers (who|that|in)/i,
    /(tourists|travelers|visitors|locals|residents|community)/i,
    /(farmers|artisans|vendors|merchants|traders)/i,
  ];
  for (const pattern of audiencePatterns) {
    const match = idea.match(pattern);
    if (match) {
      analysis.hasTargetAudience = true;
      analysis.detectedElements.push("target_audience");
      analysis.audienceDetails = match[1] || match[0];
      break;
    }
  }

  // Problem statement indicators
  const problemPatterns = [
    /(problem|struggle|challenge|pain|frustrat|difficult|hard to|can't|cannot|don't have|lack)/i,
    /(need|want|looking for|searching for|require|missing)/i,
    /(solve|fix|help|address|improve|make easier)/i,
    /(expensive|costly|time-consuming|inefficient|complicated)/i,
  ];
  let problemMatches = 0;
  for (const pattern of problemPatterns) {
    if (pattern.test(idea)) problemMatches++;
  }
  if (problemMatches >= 1) {
    analysis.hasProblemStatement = true;
    analysis.detectedElements.push("problem_statement");
  }

  // Solution indicators
  const solutionPatterns = [
    /(platform|app|application|service|tool|product|system|software|website|marketplace)/i,
    /(provide|offer|deliver|create|build|make|develop|launch|start)/i,
    /(connect|match|enable|allow|help|teach|train|coach)/i,
    /(sell|rent|lease|subscribe|license|distribute|export|import)/i,
    /(shop|store|boutique|restaurant|cafe|salon|clinic|studio)/i,
  ];
  let solutionMatches = 0;
  for (const pattern of solutionPatterns) {
    const match = idea.match(pattern);
    if (match) {
      solutionMatches++;
      if (!analysis.solutionDetails) {
        analysis.solutionDetails = match[0];
      }
    }
  }
  if (solutionMatches >= 1) {
    analysis.hasSolution = true;
    analysis.detectedElements.push("solution");
  }

  // Revenue model indicators
  const revenuePatterns = [
    /(charge|price|fee|cost|subscription|monthly|annual|per|rate)/i,
    /(\$|usd|eur|dollar|euro|htg|gourde|\d+\s*(k|thousand|hundred))/i,
    /(commission|markup|margin|revenue|income|profit)/i,
    /(freemium|premium|tier|plan|package|membership)/i,
    /(pay|buy|purchase|order)/i,
  ];
  let revenueMatches = 0;
  for (const pattern of revenuePatterns) {
    if (pattern.test(idea)) revenueMatches++;
  }
  if (revenueMatches >= 1) {
    analysis.hasRevenueModel = true;
    analysis.detectedElements.push("revenue_model");
  }

  // Differentiator indicators
  const diffPatterns = [
    /(unique|different|unlike|better than|first|only|new approach|innovative)/i,
    /(no one else|competitors don't|gap in|missing from|underserved)/i,
    /(patent|proprietary|exclusive|specialized|custom|handmade|artisan)/i,
    /(instead of|rather than|alternative to|compared to)/i,
    /(local|authentic|traditional|organic|sustainable|eco-friendly)/i,
  ];
  for (const pattern of diffPatterns) {
    if (pattern.test(idea)) {
      analysis.hasDifferentiator = true;
      analysis.detectedElements.push("differentiator");
      break;
    }
  }

  // Validation indicators
  const validationPatterns = [
    /(already have|current customers|existing clients|feedback|tested)/i,
    /(sold|revenue|paying customers|pre-orders|waitlist|orders)/i,
    /(interviewed|surveyed|research|validated|proven|confirmed)/i,
    /(demand|interest|requests|inquiries|asked for)/i,
  ];
  for (const pattern of validationPatterns) {
    if (pattern.test(idea)) {
      analysis.hasValidation = true;
      analysis.detectedElements.push("validation");
      break;
    }
  }

  // Experience indicators
  const expPatterns = [
    /(years? (of )?experience|background in|worked in|expert in)/i,
    /(certified|degree|trained|professional|specialist)/i,
    /(built before|previous|successfully|track record|portfolio)/i,
    /(know how|skilled|expertise|knowledge)/i,
  ];
  for (const pattern of expPatterns) {
    if (pattern.test(idea)) {
      analysis.hasExperience = true;
      analysis.detectedElements.push("experience");
      break;
    }
  }

  return analysis;
}

// Map criterion keys to analysis elements
const criterionToElement: Record<string, string[]> = {
  // Demand-related
  demand: ["target_audience", "problem_statement", "validation"],
  local_demand: ["target_audience", "problem_statement", "validation"],
  problem_severity: ["problem_statement", "validation"],
  willingness_to_pay: ["revenue_model", "validation"],
  supply_liquidity: ["solution", "target_audience"],
  demand_liquidity: ["target_audience", "validation"],
  learning_outcome: ["solution", "problem_statement"],
  outcome_clarity: ["solution", "problem_statement"],

  // Solution-related
  differentiation: ["differentiator", "solution"],
  service_scope: ["solution", "differentiator"],
  content_quality: ["solution", "differentiator"],
  technical_feasibility: ["solution"],

  // Economics
  unit_economics: ["revenue_model"],
  pricing_margins: ["revenue_model"],
  pricing_model: ["revenue_model"],
  pricing_accessibility: ["revenue_model", "target_audience"],
  take_rate: ["revenue_model"],
  monetization: ["revenue_model"],

  // Operations
  ops: ["solution"],
  operations: ["solution"],
  service_capacity: ["solution"],
  distribution: ["solution", "target_audience"],
  accessibility: ["solution", "target_audience"],
  acquisition: ["target_audience"],
  client_acquisition: ["target_audience"],

  // Trust & Credibility
  credibility: ["experience", "validation"],
  trust_credibility: ["experience", "validation"],
  trust_authority: ["experience", "validation"],
  trust_safety: ["solution"],
  trust_reputation: ["validation", "experience"],

  // Other
  retention: ["solution", "differentiator"],
  retention_habits: ["solution", "differentiator"],
  engagement_completion: ["solution"],
  network_effects: ["solution", "target_audience"],
  regulatory_compliance: ["experience"],
};

// Risk keywords with severity
const riskKeywords: Record<string, { severity: "critical" | "high" | "medium"; message: string }> = {
  "everyone": { severity: "high", message: "Targeting 'everyone' usually means targeting no one. Define a specific audience." },
  "all people": { severity: "high", message: "Too broad a target market. Narrow your focus." },
  "for anyone": { severity: "high", message: "Too broad a target market. Who specifically needs this most?" },
  "like amazon": { severity: "critical", message: "Competing with Amazon requires massive capital and differentiation." },
  "like uber": { severity: "critical", message: "Marketplace plays require solving chicken-and-egg problems." },
  "like facebook": { severity: "critical", message: "Social networks face extreme network effect barriers." },
  "no experience": { severity: "medium", message: "Lack of domain experience increases execution risk." },
  "first time": { severity: "medium", message: "First-time founders face steeper learning curves." },
  "i think": { severity: "medium", message: "Assumptions should be validated with real customers." },
  "maybe": { severity: "medium", message: "Uncertainty suggests need for more validation." },
  "probably": { severity: "medium", message: "Assumptions should be tested, not assumed." },
};

// Positive signals
const positiveSignals: Record<string, { patterns: RegExp[]; message: string }> = {
  validation: {
    patterns: [/customers waiting/i, /pre-orders/i, /waitlist/i, /already selling/i, /paying customers/i],
    message: "Evidence of market validation detected.",
  },
  differentiation: {
    patterns: [/unique/i, /only one/i, /patent/i, /proprietary/i, /first to/i],
    message: "Clear differentiation strategy identified.",
  },
  experience: {
    patterns: [/years of experience/i, /certified/i, /expert/i, /built before/i, /track record/i],
    message: "Relevant experience increases credibility.",
  },
};

export function evaluateRisks(
  framework: LoadedFramework,
  input: ValidationInput
): RiskEvaluation {
  const ideaLower = input.idea.toLowerCase();
  const analysis = analyzeIdea(input.idea);
  const criteria: CriterionResult[] = [];
  const failureRisks: FailureRisk[] = [];

  // Add specificity-based risk if idea is too vague
  if (analysis.specificity === "vague") {
    failureRisks.push({
      criterion: "description_quality",
      score: 2,
      reason: "Idea description is too brief. Add more details about your target customer, solution, and how you'll make money.",
      severity: "high",
    });
  }

  // Check for risk keywords
  for (const [keyword, riskInfo] of Object.entries(riskKeywords)) {
    if (ideaLower.includes(keyword)) {
      failureRisks.push({
        criterion: "risk_signal",
        score: riskInfo.severity === "critical" ? 1 : 2,
        reason: riskInfo.message,
        severity: riskInfo.severity,
      });
    }
  }

  // Evaluate each criterion based on idea analysis
  for (const criterionDef of framework.criteria) {
    const evidence: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    // Determine base score based on relevant elements
    const relevantElements = criterionToElement[criterionDef.key] || [];
    let elementScore = 0;
    let elementCount = 0;

    for (const element of relevantElements) {
      elementCount++;
      if (analysis.detectedElements.includes(element)) {
        elementScore++;
      }
    }

    // Calculate score based on how many relevant elements were found
    let score: ScoreBand;
    if (elementCount === 0) {
      // No mapping, use specificity-based default
      score = analysis.specificity === "detailed" ? 3 : analysis.specificity === "moderate" ? 2 : 2;
    } else {
      const ratio = elementScore / elementCount;
      if (ratio >= 0.8) {
        score = 4;
        evidence.push(`Strong coverage of ${criterionDef.label.toLowerCase()} factors`);
      } else if (ratio >= 0.5) {
        score = 3;
        evidence.push(`Partial coverage of ${criterionDef.label.toLowerCase()} factors`);
      } else if (ratio > 0) {
        score = 2;
        risks.push(`Limited information about ${criterionDef.label.toLowerCase()}`);
      } else {
        score = 2;
        risks.push(`No clear ${criterionDef.label.toLowerCase()} strategy defined`);
      }
    }

    // Check for positive signals
    for (const [signalType, signalInfo] of Object.entries(positiveSignals)) {
      for (const pattern of signalInfo.patterns) {
        if (pattern.test(input.idea)) {
          if (relevantElements.includes(signalType) || criterionDef.key.includes(signalType)) {
            score = Math.min(5, score + 1) as ScoreBand;
            evidence.push(signalInfo.message);
            break;
          }
        }
      }
    }

    // Apply country adjustment multiplier
    const adjustment = framework.countryAdjustments.weightMultipliers[criterionDef.key];
    if (adjustment && adjustment > 1) {
      // Higher weight means this criterion is more critical - lower scores hurt more
      if (score <= 2) {
        recommendations.push(`Critical in your market: ${criterionDef.label}`);
      }
    }

    // Add fix suggestions if score is low
    if (score <= 2 && criterionDef.fixSuggestions.length > 0) {
      recommendations.push(...criterionDef.fixSuggestions.slice(0, 2));

      // Add to failure risks
      failureRisks.push({
        criterion: criterionDef.key,
        score,
        reason: `${criterionDef.label} needs attention: ${criterionDef.fixSuggestions[0]}`,
        severity: score === 1 ? "high" : "medium",
      });
    }

    // Add country warnings for relevant criteria
    if (framework.countryAdjustments.applied) {
      const paymentKeys = ["payment", "trust", "payment_trust", "unit_economics", "pricing"];
      const opsKeys = ["ops", "operations", "distribution", "logistics"];

      if (paymentKeys.some(k => criterionDef.key.includes(k))) {
        recommendations.push(...framework.countryAdjustments.warnings.filter(w =>
          w.toLowerCase().includes("payment") || w.toLowerCase().includes("money") || w.toLowerCase().includes("cash")
        ).slice(0, 1));
      }
      if (opsKeys.some(k => criterionDef.key.includes(k))) {
        recommendations.push(...framework.countryAdjustments.warnings.filter(w =>
          w.toLowerCase().includes("logistics") || w.toLowerCase().includes("delivery") || w.toLowerCase().includes("infrastructure")
        ).slice(0, 1));
      }
    }

    criteria.push({
      key: criterionDef.key,
      label: criterionDef.label,
      weight: criterionDef.weight,
      score,
      evidence,
      risks,
      recommendations: [...new Set(recommendations)], // Dedupe
    });
  }

  // Check for failure patterns from framework
  for (const pattern of framework.failurePatterns) {
    const patternWords = pattern.description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const ideaWords = ideaLower.split(/\s+/);
    const matchCount = patternWords.filter(w => ideaWords.some(iw => iw.includes(w) || w.includes(iw))).length;

    if (matchCount >= 2 || (patternWords.length <= 3 && matchCount >= 1)) {
      failureRisks.push({
        criterion: pattern.pattern,
        score: 2,
        reason: pattern.description,
        severity: pattern.severity,
      });
    }
  }

  // Calculate overall score with weighted average
  let weightedSum = 0;
  let totalWeight = 0;

  for (const criterion of criteria) {
    const adjustment = framework.countryAdjustments.weightMultipliers[criterion.key] || 1;
    const adjustedWeight = criterion.weight * adjustment;
    weightedSum += criterion.score * adjustedWeight;
    totalWeight += adjustedWeight;
  }

  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 2.5;

  // Apply specificity penalty/bonus
  let finalScore = rawScore;
  if (analysis.specificity === "vague") {
    finalScore = Math.max(1, finalScore - 0.5);
  } else if (analysis.specificity === "detailed" && analysis.detectedElements.length >= 4) {
    finalScore = Math.min(5, finalScore + 0.3);
  }

  const overallScore = Math.round(Math.max(1, Math.min(5, finalScore))) as ScoreBand;

  // Check for critical and high risks
  const hasCriticalRisks = failureRisks.some(r => r.severity === "critical");
  const hasHighRisks = failureRisks.some(r => r.severity === "high");

  return {
    criteria,
    failureRisks,
    overallScore,
    hasCriticalRisks,
    hasHighRisks,
  };
}

// Helper to get severity weight for sorting
export function getSeverityWeight(severity: FailureRisk["severity"]): number {
  switch (severity) {
    case "critical": return 4;
    case "high": return 3;
    case "medium": return 2;
    case "low": return 1;
    default: return 0;
  }
}

// Sort failure risks by severity
export function sortRisksBySeverity(risks: FailureRisk[]): FailureRisk[] {
  return [...risks].sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity));
}
