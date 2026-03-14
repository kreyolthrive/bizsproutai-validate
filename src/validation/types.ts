export type Locale = "en" | "fr" | "ht" | "es";

export type Category =
  | "ecommerce"
  | "coaching"
  | "consulting"
  | "finance"
  | "tech"
  | "local_service"
  | "saas"
  | "marketplace"
  | "health_wellness"
  | "edtech"
  | "legal_law";

export type Region =
  | "north_america"
  | "caribbean"
  | "latin_america"
  | "africa"
  | "europe"
  | "asia";

export type CountryCode = string; // ISO 3166-1 alpha-2

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type ValidationInput = {
  category?: Category; // Now optional - can be auto-classified
  locale?: Locale;
  idea: string;
  targetCustomer?: string;
  targetMarket?: string;
  location?: string;
  offer?: string;
  problem?: string;
  pricingIdea?: string;
  budgetUsd?: number;
  skillSummary?: string;
  channels?: string[];
  timelineDays?: number;
  experienceLevel?: ExperienceLevel;
};

export type ScoreBand = 1 | 2 | 3 | 4 | 5;

export type Verdict = "go" | "caution" | "pivot";

// New: Dynamic status for FIX loop and alternatives
export type ValidationStatus = "GO" | "FIX" | "REFINE";
export type FrameworkDecision = "GO" | "CONDITIONAL_GO" | "NEED_WORK" | "PIVOT_RECOMMENDED";
export type FinalValidationVerdict =
  | "strong_validation"
  | "promising_but_needs_proof"
  | "risky_requires_refinement"
  | "pivot_or_reposition_recommended";

// New: Constructive verdict system (never "NO GO")
export type ConstructiveVerdict =
  | "promising_execution"         // Promising — focus on execution and testing
  | "promising_needs_validation"  // Promising — but needs more validation work
  | "high_risk_improve_or_pivot"; // High risk in current form — here's how to improve or pivot

// New: Pillar-based validation structure (6 pillars for all categories)
export type PillarKey =
  | "problem_demand"
  | "customer_context_fit"
  | "competition_differentiation"
  | "business_model_money"
  | "acquisition_channels"
  | "execution_founder_fit";

export type PillarStatus = "strong" | "moderate" | "weak";

export type PillarResult = {
  key: PillarKey;
  label: string;
  score: number; // 0-100
  status: PillarStatus;
  summary: string; // 1-2 sentences in plain language
  advice: string[]; // 2-3 specific suggestions to improve or pivot
  questions: string[]; // Key questions for this pillar
  evidence?: string[]; // Supporting evidence from the idea
};

export type PillarBasedValidation = {
  pillars: PillarResult[];
  overallScore: number; // 0-100
  verdict: ConstructiveVerdict;
  verdictLabel: string;
  nextExperiments: string[]; // At least 3 concrete experiments
  pathForward: string; // Always provide a constructive path
};

export type CriterionKey = string;

export type CriterionDefinition = {
  key: CriterionKey;
  label: string;
  weight: number;
  description?: string;
};

export type CriterionResult = {
  key: CriterionKey;
  label: string;
  weight: number;
  score: ScoreBand;
  evidence: string[];
  risks: string[];
  recommendations: string[];
};

// New: Risk with severity
export type FailureRisk = {
  criterion: string;
  score: ScoreBand;
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
};

// New: Fix suggestion
export type FixSuggestion = {
  issue: string;
  action: string;
  expectedImpact: string;
};

// New: Alternative business model
export type AlternativeModel = {
  model: string;
  reason: string;
  viability: ScoreBand;
};

// New: Country detection result
export type CountryDetection = {
  code: CountryCode;
  region: Region;
  confidence: number;
  evidence: string[];
};

// New: Build job for GO status
export type BuildJob = {
  type: "brand" | "website" | "content" | "social";
  status: "queued" | "pending";
};

// Legacy result type (kept for backward compatibility)
export type ValidationResult = {
  category: Category;
  locale: Locale;
  overallScore: ScoreBand;
  verdict: Verdict;
  summary: {
    oneLiner: string;
    topOpportunities: string[];
    biggestRisks: string[];
  };
  nextSteps: string[];
  criteria: CriterionResult[];
  assumptions: string[];
  missingInfo: string[];
  meta: {
    version: string;
    generatedAt: string;
  };
};

// New: Enhanced validation result with dynamic framework features
export type DynamicValidationResult = {
  status: ValidationStatus;
  category: Category;
  framework?: {
    archetype: string;
    label: string;
  };
  country: CountryDetection;
  language: Locale;
  overallScore: ScoreBand;
  verdict: Verdict;
  summary: {
    oneLiner: string;
    topOpportunities: string[];
    biggestRisks: string[];
  };
  failureRisks: FailureRisk[];
  fixes: FixSuggestion[];
  alternatives: AlternativeModel[];
  nextActions: string[];
  criteria: CriterionResult[];
  assumptions: string[];
  missingInfo: string[];
  buildTriggered: boolean;
  buildJobs: BuildJob[];
  frameworkReport?: SimplifiedFrameworkReport;
  submittedContext?: SubmittedValidationContext;
  businessCategory?: string;
  frameworkUsed?: string;
  confidenceScore?: number;
  scores?: ValidationScoreBreakdown;
  strengths?: string[];
  weaknesses?: string[];
  keyRisks?: string[];
  assumptionsToTest?: string[];
  missingProof?: string[];
  recommendedTests?: string[];
  recommendedNextSteps?: string[];
  finalVerdict?: FinalValidationVerdict;
  inferredBusinessModel?: ValidationBusinessModel;
  categoryRouting?: ValidationCategoryRouting;
  selectedFramework?: ValidationFrameworkSelection;
  researchSummary?: ValidationResearchSummary;
  modelRouting?: ValidationModelRouting;
  nextActionCtas?: ValidationCta[];
  business_category?: string;
  framework_used?: string;
  overall_score?: number;
  confidence_score?: number;
  key_risks?: string[];
  assumptions_to_test?: string[];
  missing_proof?: string[];
  recommended_tests?: string[];
  recommended_next_steps?: string[];
  final_verdict?: FinalValidationVerdict;
  // Pillar-based validation (new 6-pillar framework)
  pillarValidation?: PillarBasedValidation;
  constructiveVerdict?: ConstructiveVerdict;
  constructiveVerdictLabel?: string;
  // AI-generated pillar data (raw from LLM deep analysis)
  aiPillarData?: {
    pillars: Array<{
      key: string;
      score: number;
      status: "strong" | "moderate" | "weak";
      summary: string;
      advice: string[];
      evidence: string[];
    }>;
    constructiveVerdict: string | null;
    pathForward: string | null;
    nextExperiments: string[];
  };
  meta: {
    version: string;
    iterationCount: number;
    generatedAt: string;
  };
};

export type SubmittedValidationContext = {
  idea: string;
  targetCustomer?: string;
  targetMarket?: string;
  location?: string;
  offer?: string;
  problem?: string;
  pricingIdea?: string;
  budgetUsd?: number;
  skillSummary?: string;
  channels?: string[];
  timelineDays?: number;
  experienceLevel?: ExperienceLevel;
};

export type ValidationScoreBreakdown = {
  market_demand: number;
  monetization: number;
  competition: number;
  acquisition: number;
  execution_feasibility: number;
  differentiation: number;
  risk: number;
};

export type ValidationCategoryRouting = {
  businessCategory: string;
  confidence: number;
  alternateCategories: string[];
  subcategory?: string;
  businessModelType?: string;
  segment?: string;
  frameworkId?: string;
  evidence: string[];
};

export type ValidationFrameworkSelection = {
  frameworkName: string;
  frameworkLabel: string;
  version: string;
  criteria: string[];
  specialization?: string;
  reason?: string;
};

export type ValidationBusinessModel = {
  primaryCategory: string;
  subcategory?: string;
  businessModelType?: string;
  segment?: string;
  frameworkId?: string;
  confidence?: number;
  evidence?: string[];
};

export type ValidationResearchSummary = {
  demandSignals: string[];
  competitionNotes: string[];
  marketTrends: string[];
  monetizationNotes: string[];
  acquisitionChallenges: string[];
  differentiationOpportunities: string[];
  riskFactors: string[];
  sources: string[];
};

export type ValidationModelRouting = {
  researchModel: string;
  reasoningModel: string;
  formatterModel: string;
};

export type ValidationCta = {
  key: string;
  label: string;
  href: string;
};

export type SimplifiedGateResult = {
  gate: 1 | 2 | 3 | 4 | 5;
  name: string;
  score: number;
  maxScore: number;
  passed: boolean;
  status: "PASS" | "FAIL" | "BLOCKED";
  blockedByGate?: 1 | 2 | 3 | 4 | 5;
  reasoning: string;
};

export type SimplifiedFrameworkReport = {
  oneLineSummary: string;
  missingInfo: string[];
  assumptions: string[];
  problemDemand: {
    painLevel: number;
    demandFrequency: number;
    marketCoverage: number;
    currentGap: number;
    total: number;
    passGate1: boolean;
    keyInsight: string;
  };
  primarySegment: {
    name: string;
    who: string;
    jobToBeDone: string;
    currentPain: string;
    willingnessToPay: string;
    reachChannels: string[];
    scores: {
      reachability: number;
      painLevel: number;
      payingCapability: number;
      total: number;
    };
  };
  solutionValidation: {
    painCoverage: number;
    differentiation: number;
    adoptionFriction: number;
    score: number;
    passGate3: boolean;
  };
  marketValidation: {
    tam: number;
    sam: number;
    som: number;
    confidence: number;
    passGate4: boolean;
  };
  businessModelValidation: {
    model: string;
    entryPrice: number;
    anchorPrice: number;
    margin: number;
    passGate4: boolean;
  };
  operationalValidation: {
    score: number;
    passGate5: boolean;
    keyConstraints: string[];
  };
  weightedScore: number;
  decision: FrameworkDecision;
  gates: SimplifiedGateResult[];
};

export type Framework = (input: ValidationInput) => Promise<ValidationResult>;

export type FrameworkDefinition = {
  category: Category;
  displayName: string;
  criteriaTemplate: Array<{
    key: string;
    label: string;
    weight: number;
  }>;
  run: Framework;
};

// New: JSON Schema types for dynamic frameworks
export type CategorySchema = {
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
};

export type RegionSchema = {
  region: Region;
  displayName: string;
  countries: CountryCode[];
  commonChallenges: string[];
  paymentNotes: string[];
};

export type CountrySchema = {
  country: CountryCode;
  region: Region;
  name: string;
  currency: string;
  paymentRails: string[];
  adjustments: Record<string, { weightMultiplier: number; reason?: string }>;
  warnings: string[];
  marketNotes: string[];
};
