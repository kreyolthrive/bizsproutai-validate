/**
 * Pillar-based AI Validation System
 * 
 * This module extends the existing validation system to use the 6-pillar framework
 * with AI + LLM reasoning. Every validation uses fresh AI analysis specific to the idea.
 * 
 * NEVER uses:
 * - Shallow keyword matching or static category rules as main logic
 * - Cached text, stale reasoning, or prompt fragments from previous validations
 * - Hard labels like "GO" or "NO GO"
 * 
 * ALWAYS provides:
 * - Constructive verdicts with a path forward
 * - Specific, actionable advice for each pillar
 * - At least 3 concrete experiments the founder can run
 */

import type {
  ConstructiveVerdict,
  PillarKey,
  PillarResult,
  PillarBasedValidation,
  PillarStatus,
  ValidationInput,
  Locale,
  Category,
} from "../types";
import {
  getPillarFramework,
  getConstructiveVerdict,
  getVerdictLabel,
  getPillarStatus,
  PILLAR_KEYS,
  PILLAR_LABELS,
  type CategoryFramework,
  type PillarFrameworkDefinition,
} from "../pillarFrameworks";

// Raw AI response types for pillar-based analysis
export type RawPillarAnalysis = {
  key: string;
  score: number;
  status?: string;
  summary?: string;
  advice?: string[];
  evidence?: string[];
};

export type RawPillarBasedResponse = {
  pillars?: RawPillarAnalysis[];
  overallScore?: number;
  verdict?: string;
  verdictLabel?: string;
  nextExperiments?: string[];
  pathForward?: string;
  category?: string;
  framework?: string;
};

/**
 * Build the pillar-based validation prompt for AI analysis
 */
export function buildPillarPrompt(
  input: ValidationInput,
  locale: Locale,
  category: Category,
  framework: CategoryFramework
): string {
  const pillarsSpec = framework.pillars.map((pillar) => ({
    key: pillar.key,
    label: pillar.label,
    weight: pillar.weight,
    questions: pillar.questions.map((q) => ({
      question: q.question,
      followUp: q.followUp,
    })),
  }));

  return JSON.stringify(
    {
      task: "Analyze this business idea using BizSproutAI's 6-pillar validation framework. Return JSON only.",
      systemRole: `You are BizSproutAI, an AI business validation assistant.
Your job is to evaluate a single business idea in depth and give constructive, category-aware feedback and next steps.

You must:
- Use AI + LLM reasoning to analyze this specific idea, its context, and its market.
- Reason step by step using each of the 6 pillars.
- Generate scores (0-100) and insights specific to THIS idea.
- Base your analysis on the current idea and context only, not on previous users or previous validations.

You must NOT:
- Use shallow keyword matching or static rules as the main logic.
- Reuse cached text, stale reasoning, or prompt fragments.
- Output hard labels like "GO" or "NO GO".

Output style:
- For each pillar, include: score (0-100), status (strong/moderate/weak), summary (1-2 sentences), advice (2-3 suggestions).
- Provide an overall verdict: "promising_execution", "promising_needs_validation", or "high_risk_improve_or_pivot".
- Always give at least 3 concrete experiments or next steps.
- Be honest but encouraging: highlight risks, then immediately show how to reduce them.`,
      outputRequirements: {
        pillarScoreRange: "0-100 integer",
        pillarStatuses: ["strong", "moderate", "weak"],
        verdictOptions: [
          "promising_execution",
          "promising_needs_validation",
          "high_risk_improve_or_pivot",
        ],
        verdictLabels: {
          promising_execution: "Promising — focus on execution and testing",
          promising_needs_validation: "Promising — but needs more validation work",
          high_risk_improve_or_pivot: "High risk in current form — here's how to improve or pivot",
        },
        minAdvicePerPillar: 2,
        maxAdvicePerPillar: 3,
        minExperiments: 3,
      },
      businessIdea: {
        idea: input.idea,
        locale,
        category,
        targetCustomer: input.targetCustomer ?? null,
        targetMarket: input.targetMarket ?? null,
        location: input.location ?? null,
        offer: input.offer ?? null,
        problem: input.problem ?? null,
        pricingIdea: input.pricingIdea ?? null,
        budgetUsd: input.budgetUsd ?? null,
        skillSummary: input.skillSummary ?? null,
        channels: input.channels ?? [],
        timelineDays: input.timelineDays ?? null,
        experienceLevel: input.experienceLevel ?? null,
      },
      framework: {
        category: framework.category,
        displayName: framework.displayName,
        description: framework.description,
        pillars: pillarsSpec,
      },
      verdictExamples: framework.verdictExamples,
      instructions: [
        "Analyze each pillar in sequence, considering the specific questions provided.",
        "For each pillar:",
        "  1. Answer the key questions based on the business idea.",
        "  2. Assign a score from 0-100 based on how well the idea addresses this pillar.",
        "  3. Determine status: 'strong' (70-100), 'moderate' (40-69), 'weak' (0-39).",
        "  4. Write a 1-2 sentence summary in plain language explaining your assessment.",
        "  5. Provide 2-3 specific suggestions to improve or pivot.",
        `Use the ${framework.displayName} framework for category-specific analysis.`,
        "SCORING CALIBRATION:",
        "- 80-100: Strong, validated, ready to execute.",
        "- 60-79: Promising, some gaps to address.",
        "- 40-59: Needs work, significant validation required.",
        "- 20-39: Risky, major concerns but salvageable with pivots.",
        "- 0-19: Fundamental concerns, consider major repositioning.",
        "CRITICAL: Give SPECIFIC scores based on THIS idea. Avoid default/generic scores.",
        "CRITICAL: Advice must be actionable and specific to the idea's niche.",
        "NEVER say 'NO GO'. Always couple problems with solutions or pivots.",
        "In nextExperiments, provide at least 3 concrete tests the founder can run in <1 week with <$100.",
        "In pathForward, always provide a constructive direction even for weak ideas.",
        "QUALITY RULES:",
        "- Pillar evidence must be idea-specific. Do NOT cite generic macro facts (global market sizes, '$300B market', 'economic cycles', names of large firms).",
        "- Do NOT use formulaic template phrases that apply to any SaaS/service (e.g., 'A focused vertical tool can feel more relevant', 'Recurring workflow usage can create retention', 'A narrow MVP around one workflow'). Instead, reference THIS idea's specific product, customer, or workflow.",
        "- Advice items must be actionable and specific to THIS idea's niche, not generic platitudes.",
        "- Evidence should reference concrete aspects of the idea, target customer, or competitive landscape — not broad industry statistics.",
        "- For Customer & Context Fit: assess weakness based on BUDGET CONSTRAINTS, SWITCHING COSTS, and EXISTING ALTERNATIVES — not 'technical sophistication'. Small business owners can use apps; the barrier is whether they see enough value to pay and switch.",
        "Return one JSON object only. No markdown or commentary outside the JSON.",
      ],
      expectedOutputStructure: {
        pillars: [
          {
            key: "pillar_key",
            score: "0-100 integer",
            status: "strong | moderate | weak",
            summary: "1-2 sentence plain language summary",
            advice: ["specific suggestion 1", "specific suggestion 2"],
            evidence: ["evidence from the idea supporting this assessment"],
          },
        ],
        overallScore: "0-100 integer (weighted average of pillar scores)",
        verdict: "promising_execution | promising_needs_validation | high_risk_improve_or_pivot",
        verdictLabel: "Human-readable verdict label",
        nextExperiments: ["experiment 1", "experiment 2", "experiment 3"],
        pathForward: "Constructive guidance for next steps",
      },
    },
    null,
    2
  );
}

/**
 * Parse and normalize pillar results from AI response
 */
export function normalizePillarResults(
  raw: RawPillarBasedResponse,
  framework: CategoryFramework
): PillarResult[] {
  const rawPillars = raw.pillars ?? [];
  
  return PILLAR_KEYS.map((key) => {
    const pillarFramework = framework.pillars.find((p) => p.key === key);
    const rawPillar = rawPillars.find(
      (p) => p.key === key || p.key?.toLowerCase().replace(/[^a-z_]/g, "_") === key
    );
    
    const score = typeof rawPillar?.score === "number" 
      ? Math.max(0, Math.min(100, Math.round(rawPillar.score)))
      : 50;
    
    const status = getPillarStatus(score);
    
    // Get advice based on status
    let defaultAdvice: string[] = [];
    if (pillarFramework) {
      if (status === "weak") {
        defaultAdvice = pillarFramework.weakAdvice.map((a) => a.advice).slice(0, 3);
      } else if (status === "moderate") {
        defaultAdvice = pillarFramework.moderateAdvice.map((a) => a.advice).slice(0, 3);
      } else {
        defaultAdvice = pillarFramework.strongAdvice.map((a) => a.advice).slice(0, 3);
      }
    }
    
    return {
      key,
      label: PILLAR_LABELS[key],
      score,
      status,
      summary: rawPillar?.summary ?? `Analysis for ${PILLAR_LABELS[key]} completed.`,
      advice: Array.isArray(rawPillar?.advice) && rawPillar.advice.length > 0
        ? rawPillar.advice.slice(0, 3)
        : defaultAdvice,
      questions: pillarFramework?.questions.map((q) => q.question) ?? [],
      evidence: Array.isArray(rawPillar?.evidence) ? rawPillar.evidence.slice(0, 3) : [],
    };
  });
}

/**
 * Calculate overall score from pillar scores
 */
export function calculateOverallScore(
  pillars: PillarResult[],
  framework: CategoryFramework
): number {
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const pillar of pillars) {
    const pillarFramework = framework.pillars.find((p) => p.key === pillar.key);
    const weight = pillarFramework?.weight ?? (1 / 6);
    totalWeight += weight;
    weightedSum += pillar.score * weight;
  }
  
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
}

/**
 * Normalize pillar-based validation result from AI response
 */
export function normalizePillarValidation(
  raw: RawPillarBasedResponse,
  framework: CategoryFramework
): PillarBasedValidation {
  const pillars = normalizePillarResults(raw, framework);
  
  // Calculate overall score, preferring AI's if reasonable
  let overallScore = typeof raw.overallScore === "number"
    ? Math.max(0, Math.min(100, Math.round(raw.overallScore)))
    : calculateOverallScore(pillars, framework);
  
  // Derive verdict from score to ensure consistency
  const verdict = getConstructiveVerdict(overallScore);
  const verdictLabel = getVerdictLabel(verdict);
  
  // Ensure we have at least 3 experiments
  const defaultExperiments = [
    "Interview 5 potential customers about their current solutions and pain points.",
    "Create a simple landing page describing your offer and measure sign-up interest.",
    "Test pricing by asking 10 prospects what they would expect to pay for this solution.",
  ];
  
  const nextExperiments = Array.isArray(raw.nextExperiments) && raw.nextExperiments.length >= 3
    ? raw.nextExperiments.slice(0, 5)
    : [...(raw.nextExperiments ?? []), ...defaultExperiments].slice(0, 5);
  
  // Generate path forward based on verdict
  let pathForward = raw.pathForward;
  if (!pathForward || typeof pathForward !== "string") {
    if (verdict === "promising_execution") {
      pathForward = "Your idea shows strong potential. Focus on execution and early customer acquisition while validating your key assumptions through real market tests.";
    } else if (verdict === "promising_needs_validation") {
      pathForward = "Your idea has promise but needs more validation. Run the suggested experiments to build confidence in your market fit before investing heavily in building.";
    } else {
      pathForward = "Your idea faces significant challenges in its current form, but the core insight may be valuable. Consider the pivot suggestions and address the key weaknesses before proceeding.";
    }
  }
  
  return {
    pillars,
    overallScore,
    verdict,
    verdictLabel,
    nextExperiments,
    pathForward,
  };
}

/**
 * Get default experiments for a category
 */
export function getDefaultExperiments(category: Category): string[] {
  const experiments: Record<Category, string[]> = {
    saas: [
      "Interview 10 potential users about their current solution and pain frequency.",
      "Create a simple landing page with value proposition and collect email sign-ups.",
      "Test willingness to pay with a pre-sale or pricing survey.",
      "Build a minimal prototype (even a Figma mockup) and get feedback.",
      "Find 3 early adopters willing to use a beta version.",
    ],
    tech: [
      "Interview 10 potential users about their current solution and pain frequency.",
      "Create a simple landing page with value proposition and collect email sign-ups.",
      "Test willingness to pay with a pre-sale or pricing survey.",
    ],
    local_service: [
      "Talk to 10 neighbors or local businesses about how they solve this today.",
      "Offer free or discounted service to 3 people to get testimonials.",
      "Post in local Facebook groups or WhatsApp to gauge interest.",
      "Survey 20 potential customers about frequency and budget.",
      "Check local regulations and licensing requirements.",
    ],
    consulting: [
      "Send 20 cold outreach messages to potential clients in your niche.",
      "Offer a free audit or consultation to build case studies.",
      "Create valuable content for your niche and measure engagement.",
      "Interview 5 potential clients about their last 3-6 months of spending.",
      "Test different pricing models with your next 3 proposals.",
    ],
    coaching: [
      "Conduct 5 free coaching sessions to test your approach.",
      "Pre-sell a small cohort before building full program.",
      "Host a free workshop to build audience and test interest.",
      "Interview 10 potential students about their goals and obstacles.",
      "Create one piece of valuable content and measure engagement.",
    ],
    ecommerce: [
      "Survey 30 potential customers about buying habits and preferences.",
      "Create a simple product listing and measure add-to-cart rate.",
      "Test pricing with different landing page variants.",
      "Research supplier reliability and margins for your products.",
      "Validate shipping costs and delivery times.",
    ],
    marketplace: [
      "Talk to 10 potential sellers about their current challenges.",
      "Talk to 10 potential buyers about their current alternatives.",
      "Build a simple MVP with manual matching to test demand.",
      "Calculate unit economics for your take rate model.",
      "Identify initial supply constraints and how to overcome them.",
    ],
    health_wellness: [
      "Offer 5 free sessions to get testimonials and feedback.",
      "Survey 20 potential clients about their wellness spending.",
      "Test your unique approach with a small pilot group.",
      "Research required certifications and liability coverage.",
      "Build a simple online presence and measure inquiries.",
    ],
    edtech: [
      "Pre-sell a small cohort with a clear curriculum and date.",
      "Host a free workshop or challenge as a feeder.",
      "Interview 10 potential students about learning preferences.",
      "Research existing courses and identify differentiation.",
      "Test pricing with early-bird offers.",
    ],
    finance: [
      "Interview 10 potential users about current pain points.",
      "Research compliance and licensing requirements thoroughly.",
      "Build a simple prototype to demonstrate value proposition.",
      "Test willingness to pay with surveys or pre-registration.",
      "Map competitor landscape and identify gaps.",
    ],
    legal_law: [
      "Interview 10 potential clients about their legal needs.",
      "Research bar requirements and liability coverage.",
      "Offer free consultations to build case studies.",
      "Test positioning with potential referral partners.",
      "Create educational content to establish expertise.",
    ],
  };
  
  return experiments[category] ?? experiments.saas;
}

/**
 * Generate constructive path forward based on pillar analysis
 */
export function generatePathForward(
  pillars: PillarResult[],
  verdict: ConstructiveVerdict,
  category: Category
): string {
  const weakPillars = pillars.filter((p) => p.status === "weak");
  const strongPillars = pillars.filter((p) => p.status === "strong");
  
  if (verdict === "promising_execution") {
    if (strongPillars.length >= 4) {
      return `Your idea shows strong validation across ${strongPillars.length} pillars. Focus on execution and rapid iteration. ${weakPillars.length > 0 ? `Address the areas needing work: ${weakPillars.map((p) => p.label).join(", ")}.` : ""}`;
    }
    return "Your idea is ready for focused execution. Start with a minimal viable version and iterate based on real customer feedback.";
  }
  
  if (verdict === "promising_needs_validation") {
    const focusAreas = weakPillars.length > 0 
      ? weakPillars.map((p) => p.label).slice(0, 2).join(" and ")
      : "key assumptions";
    return `Your idea has promise but needs validation in ${focusAreas}. Run the suggested experiments before investing heavily in building.`;
  }
  
  // high_risk_improve_or_pivot
  if (weakPillars.length >= 3) {
    return `Your idea faces significant challenges across multiple areas. Consider these pivots: (1) Narrow your target customer, (2) Simplify your initial offering, (3) Validate demand with a manual service first. The core insight may be valuable with repositioning.`;
  }
  
  const primaryWeakness = weakPillars[0]?.label ?? "key areas";
  return `Your idea has potential but ${primaryWeakness} needs significant work. Focus on validating this area first, or consider pivoting to address the underlying weakness.`;
}
