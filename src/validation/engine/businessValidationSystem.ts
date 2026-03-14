import type {
  Category,
  DynamicValidationResult,
  FinalValidationVerdict,
  Locale,
  ValidationBusinessModel,
  ValidationCategoryRouting,
  ValidationCta,
  ValidationFrameworkSelection,
  ValidationInput,
  ValidationModelRouting,
  ValidationResearchSummary,
  ValidationScoreBreakdown,
} from "../types";
import { getDefaultFrameworkGuideId, getFrameworkGuide } from "../frameworkGuides";
import { loadFramework, type LoadedFramework } from "./loadFramework";
import { classifyCategory } from "./classifyCategory";
import { analyzeCompetitors, conductMarketResearch } from "../providers/perplexity";
import { getProviderForTask } from "../providers/router";

type ScoreKey = keyof ValidationScoreBreakdown;

type FrameworkProfile = {
  frameworkName: string;
  frameworkLabel: string;
  version: string;
  weights: Record<ScoreKey, number>;
  recommendedTests: Partial<Record<ScoreKey, string[]>>;
  defaultNextSteps: string[];
};

type ValidationSpecialization = {
  primaryCategory: string;
  subcategory?: string;
  businessModelType?: string;
  segment?: string;
  frameworkName?: string;
  frameworkLabel?: string;
  criteria?: string[];
  reason?: string;
  evidence: string[];
  scoreAdjustments?: Partial<Record<ScoreKey, number>>;
  strengths?: string[];
  weaknesses?: string[];
  keyRisks?: string[];
  assumptions?: string[];
  recommendedTests?: Partial<Record<ScoreKey, string[]>>;
  defaultNextSteps?: string[];
};

type ResearchAgentOutput = {
  summary: ValidationResearchSummary;
  evidenceByArea: Record<ScoreKey, string[]>;
  coverageScore: number;
};

type ValidationScoringOutput = {
  overallScore: number;
  confidenceScore: number;
  scores: ValidationScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  keyRisks: string[];
  assumptionsToTest: string[];
  missingProof: string[];
  recommendedTests: string[];
  recommendedNextSteps: string[];
  finalVerdict: FinalValidationVerdict;
};

const PUBLIC_CATEGORY_MAP: Record<Category, string> = {
  ecommerce: "ecommerce",
  coaching: "coaching_consulting",
  consulting: "coaching_consulting",
  finance: "finance",
  tech: "mobile_web_app",
  local_service: "local_service",
  saas: "saas",
  marketplace: "marketplace",
  health_wellness: "health_wellness",
  edtech: "edtech",
  legal_law: "legal_law",
};

const CATEGORY_LABELS: Record<Category, string> = {
  ecommerce: "Ecommerce",
  coaching: "Coaching / Consulting",
  consulting: "Coaching / Consulting",
  finance: "Finance",
  tech: "Mobile / Web App",
  local_service: "Local Service",
  saas: "SaaS",
  marketplace: "Marketplace",
  health_wellness: "Health & Wellness",
  edtech: "EdTech",
  legal_law: "Legal / Law",
};

const SCORE_LABELS: Record<ScoreKey, string> = {
  market_demand: "market demand",
  monetization: "monetization",
  competition: "competitive position",
  acquisition: "customer acquisition",
  execution_feasibility: "execution feasibility",
  differentiation: "differentiation",
  risk: "risk profile",
};

const REAL_ESTATE_AGENT_REGEX =
  /\b(real estate|real-estate|realtor|realty|brokerage|broker|buyer agent|listing agent|open house|mls|closing|homebuyer|homebuyers|first-time homebuyer|first time homebuyer|mortgage pre-approval)\b/i;
const FIRST_TIME_HOMEBUYER_REGEX =
  /\b(first-time homebuyer|first time homebuyer|new homebuyer|starter home|home buying guidance|buying first home)\b/i;
const POSTPARTUM_FITNESS_REGEX =
  /\b(postpartum|post-partum|postnatal|post-natal|new moms?|new mothers?|after pregnancy|after birth|pregnancy recovery|pelvic floor|diastasis recti|c-section recovery)\b/i;
const REMOTE_COACHING_REGEX =
  /\b(remote|online|virtual|zoom|membership|community|program|coach|coaching|1:1|1-on-1|subscription|digital service)\b/i;
const FITNESS_WELLNESS_COACHING_REGEX =
  /\b(fitness|wellness|workout|exercise|strength|mobility|nutrition|recovery|personal trainer|fitness coach|wellness coach)\b/i;
const SOFTWARE_PRODUCT_REGEX =
  /\b(saas|software|app|platform|tool|system|dashboard|crm|automation|workflow|portal|booking software|scheduling software|appointment booking|appointment scheduling|client management)\b/i;
const BARBER_SEGMENT_REGEX = /\b(barber|barbers|barbershop|barber shop)\b/i;
const APPOINTMENT_BASED_OPERATOR_REGEX =
  /\b(barber|barbershop|salon|spa|medspa|med spa|esthetician|nail salon|massage therapist|clinic|dentist|dental practice|tattoo shop|pet groomer|appointment-based local businesses?)\b/i;
const BOOKING_WORKFLOW_REGEX =
  /\b(booking|appointment|appointments|scheduling|calendar|time slots?|confirmation screen|rebooking|no-shows?)\b/i;

// CRM / workflow tool detection - distinct from booking/scheduling tools
const CRM_WORKFLOW_REGEX =
  /\b(crm|pipeline|lead management|lead tracking|project status|project management|project tracker|task management|client management|contact management|contacts|deals?|proposals?|invoicing|workflow management)\b/i;
const FREELANCE_CREATIVE_SEGMENT_REGEX =
  /\b(freelance|freelancer|freelancers|designer|designers|creative|creatives|photographer|photographers|videographer|videographers|illustrator|illustrators|copywriter|copywriters|consultant|consultants|agency|agencies|solopreneur|independent contractor)\b/i;

// Agency / service business onboarding and operations detection
const AGENCY_SERVICE_SEGMENT_REGEX =
  /\b(agency|agencies|studio|studios|firm|firms|consultancy|consultancies|service business|service businesses|client service|client services|professional service|professional services)\b/i;
const ONBOARDING_WORKFLOW_REGEX =
  /\b(onboarding|kickoff|kick-off|client intake|new client|new customer|welcome flow|setup process|getting started|handoff|hand-off|requirements gather|requirements receive|contract sign|invoice paid|first call|discovery call|project start|client success)\b/i;
const CHECKLIST_TASK_REGEX =
  /\b(checklist|task list|tasks|to-?do|step-?by-?step|workflow steps|process steps|milestones|stages|phases|status tracking|progress tracking)\b/i;
const B2B_SERVICE_OPS_REGEX =
  /\b(client relationship|client communication|client portal|project handoff|deliverable|deliverables|scope|timeline|deadline|kickoff call|wrap-?up|retainer|engagement|sow|statement of work)\b/i;

type VerticalSaasSegmentContext = {
  segment: string;
  audienceLabel: string;
  workflowLabel: string;
  acquisitionLabel: string;
  differentiationLabel: string;
  toolType: "booking" | "crm" | "workflow" | "generic";
};

function resolveVerticalSaasSegment(text: string): VerticalSaasSegmentContext | null {
  if (BARBER_SEGMENT_REGEX.test(text)) {
    return {
      segment: "barbers_barbershops",
      audienceLabel: "barbers and barbershops",
      workflowLabel: "appointment scheduling, client notes, confirmations, and repeat rebooking for barbers",
      acquisitionLabel: "direct outreach, barber communities, Instagram/TikTok, industry partnerships, and POS ecosystem referrals",
      differentiationLabel: "barber-specific workflows such as chair calendars, repeat-client rebooking, and lightweight client history",
      toolType: "booking",
    };
  }

  if (APPOINTMENT_BASED_OPERATOR_REGEX.test(text)) {
    return {
      segment: "appointment_based_local_businesses",
      audienceLabel: "appointment-based local businesses",
      workflowLabel: "scheduling, confirmations, client records, and no-show reduction for local operators",
      acquisitionLabel: "outbound outreach, vertical communities, referrals, and partner channels that already serve SMB operators",
      differentiationLabel: "workflow depth for one operator niche, not a generic all-in-one feature list",
      toolType: "booking",
    };
  }

  return null;
}

function resolveCrmWorkflowSegment(text: string): VerticalSaasSegmentContext | null {
  // Detect agency onboarding / service operations tools - most specific first
  if (AGENCY_SERVICE_SEGMENT_REGEX.test(text) && (ONBOARDING_WORKFLOW_REGEX.test(text) || CHECKLIST_TASK_REGEX.test(text))) {
    const hasOnboarding = ONBOARDING_WORKFLOW_REGEX.test(text);
    const hasChecklist = CHECKLIST_TASK_REGEX.test(text);
    const hasB2BOps = B2B_SERVICE_OPS_REGEX.test(text);

    let segment = "agency_service_operations";
    let audienceLabel = "agencies and service businesses";
    let workflowLabel = "client onboarding, project kickoff, and service delivery workflows";
    let differentiationLabel = "agency-specific onboarding templates and client handoff workflows vs. generic project management";

    if (hasOnboarding && hasChecklist) {
      segment = "agency_client_onboarding";
      workflowLabel = "client onboarding checklists, kickoff workflows, contract/invoice tracking, and requirements gathering";
      differentiationLabel = "streamlined onboarding flow for agencies vs. heavyweight project management or CRM tools";
    } else if (hasOnboarding) {
      segment = "agency_client_onboarding";
      workflowLabel = "client intake, kickoff calls, contract signing, and project handoffs";
    } else if (hasChecklist && hasB2BOps) {
      segment = "agency_operations";
      workflowLabel = "task checklists, milestone tracking, and client project operations";
    }

    return {
      segment,
      audienceLabel,
      workflowLabel,
      acquisitionLabel: "agency owner communities, Twitter/X, LinkedIn, ProductHunt, Slack communities (e.g., Agency Collective), and content marketing for service business operators",
      differentiationLabel,
      toolType: "workflow",
    };
  }

  // Detect freelance/creative professionals using CRM/workflow tools
  if (FREELANCE_CREATIVE_SEGMENT_REGEX.test(text) && CRM_WORKFLOW_REGEX.test(text)) {
    const isDesigner = /\bdesigner|designers\b/i.test(text);
    const isPhotographer = /\bphotographer|photographers\b/i.test(text);
    const isCreative = /\bcreative|creatives\b/i.test(text);
    const isConsultant = /\bconsultant|consultants\b/i.test(text);
    const isAgency = /\bagency|agencies\b/i.test(text);

    let segment = "freelancers_creatives";
    let audienceLabel = "freelancers and creative professionals";
    
    if (isDesigner) {
      segment = "freelance_designers";
      audienceLabel = "freelance designers";
    } else if (isPhotographer) {
      segment = "freelance_photographers";
      audienceLabel = "freelance photographers and videographers";
    } else if (isConsultant) {
      segment = "independent_consultants";
      audienceLabel = "independent consultants";
    } else if (isAgency) {
      segment = "small_agencies";
      audienceLabel = "small agencies and studios";
    } else if (isCreative) {
      segment = "creative_professionals";
      audienceLabel = "creative professionals";
    }

    return {
      segment,
      audienceLabel,
      workflowLabel: "client pipeline management, project tracking, proposal workflows, and contact organization",
      acquisitionLabel: "freelance communities, design forums, Twitter/X, Product Hunt, content marketing, and word-of-mouth referrals",
      differentiationLabel: "workflow simplicity for solo operators vs. enterprise complexity, niche-specific templates, and fast onboarding",
      toolType: "crm",
    };
  }

  // Generic CRM/workflow tool detection without a specific segment
  if (CRM_WORKFLOW_REGEX.test(text) && SOFTWARE_PRODUCT_REGEX.test(text)) {
    return {
      segment: "small_business_operators",
      audienceLabel: "small business operators and solo professionals",
      workflowLabel: "client relationship management, pipeline tracking, and project workflows",
      acquisitionLabel: "niche communities, content marketing, Product Hunt, and design-partner relationships",
      differentiationLabel: "simplicity and speed for the target niche vs. generic horizontal tools",
      toolType: "crm",
    };
  }

  return null;
}

function detectVerticalSaasContext(text: string): VerticalSaasSegmentContext | null {
  // First check for CRM/workflow tools - these are NOT booking software
  const crmContext = resolveCrmWorkflowSegment(text);
  if (crmContext) return crmContext;

  // Then check for booking/scheduling software
  if (!SOFTWARE_PRODUCT_REGEX.test(text) || !BOOKING_WORKFLOW_REGEX.test(text)) {
    return null;
  }

  return resolveVerticalSaasSegment(text);
}

const FRAMEWORK_PROFILES: Record<Category, FrameworkProfile> = {
  local_service: {
    frameworkName: "local_service_v1",
    frameworkLabel: "Local Service Framework",
    version: "v1",
    weights: {
      market_demand: 0.2,
      monetization: 0.16,
      competition: 0.12,
      acquisition: 0.16,
      execution_feasibility: 0.18,
      differentiation: 0.08,
      risk: 0.1,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 local buyers in {market} to confirm urgency and buying triggers.",
        "Run a booking-interest or waitlist test for {offer} in {market}.",
      ],
      monetization: [
        "Test 3 service packages and price anchors before buying more equipment or inventory.",
      ],
      acquisition: [
        "Launch one local Google/Facebook ad and measure cost per qualified lead.",
        "Set up a referral loop with one complementary local business.",
      ],
      differentiation: [
        "Narrow the niche so the offer is clearly better for a specific customer group.",
      ],
    },
    defaultNextSteps: [
      "Validate local demand before expanding the service footprint.",
      "Keep the launch offer narrow enough to test fast.",
    ],
  },
  saas: {
    frameworkName: "saas_v1",
    frameworkLabel: "SaaS Framework",
    version: "v1",
    weights: {
      market_demand: 0.2,
      monetization: 0.17,
      competition: 0.12,
      acquisition: 0.14,
      execution_feasibility: 0.15,
      differentiation: 0.12,
      risk: 0.1,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 target users about how often this problem happens and what they use now.",
      ],
      monetization: [
        "Pre-sell 3 design-partner seats or test two pricing tiers on a landing page.",
      ],
      acquisition: [
        "Run a cold outreach or waitlist experiment to measure reply and conversion rates.",
      ],
      differentiation: [
        "Position the product around one painful workflow and one buyer persona.",
      ],
    },
    defaultNextSteps: [
      "Reduce the MVP to one painful workflow before building more features.",
      "Use buyer interviews and pre-sales to prove demand before a larger build.",
    ],
  },
  ecommerce: {
    frameworkName: "ecommerce_v1",
    frameworkLabel: "Ecommerce Framework",
    version: "v1",
    weights: {
      market_demand: 0.18,
      monetization: 0.18,
      competition: 0.13,
      acquisition: 0.15,
      execution_feasibility: 0.14,
      differentiation: 0.12,
      risk: 0.1,
    },
    recommendedTests: {
      market_demand: [
        "Run a landing page or preorder test before committing to inventory.",
      ],
      monetization: [
        "Validate unit economics with shipping, packaging, and returns included.",
      ],
      acquisition: [
        "Test one paid acquisition channel and track CAC against expected margin.",
      ],
      differentiation: [
        "Refine the product story so buyers understand why this brand is distinct.",
      ],
    },
    defaultNextSteps: [
      "Validate demand with a lightweight store or preorder page first.",
      "Prove margin and repeat purchase potential before scaling ads.",
    ],
  },
  coaching: {
    frameworkName: "coaching_consulting_v1",
    frameworkLabel: "Coaching / Consulting Framework",
    version: "v1",
    weights: {
      market_demand: 0.19,
      monetization: 0.17,
      competition: 0.12,
      acquisition: 0.16,
      execution_feasibility: 0.14,
      differentiation: 0.12,
      risk: 0.1,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 ideal clients to validate the urgency of the problem and desired outcome.",
      ],
      monetization: [
        "Test 3 offer packages and price anchors with real prospects before expanding delivery.",
      ],
      acquisition: [
        "Launch one lead magnet, webinar, or outbound campaign to measure qualified demand.",
      ],
      differentiation: [
        "Sharpen the niche and promise so the offer feels specific, not generic.",
      ],
    },
    defaultNextSteps: [
      "Start with one narrow niche and one clear promise.",
      "Package the offer before investing in a full funnel.",
    ],
  },
  consulting: {
    frameworkName: "coaching_consulting_v1",
    frameworkLabel: "Coaching / Consulting Framework",
    version: "v1",
    weights: {
      market_demand: 0.19,
      monetization: 0.17,
      competition: 0.12,
      acquisition: 0.16,
      execution_feasibility: 0.14,
      differentiation: 0.12,
      risk: 0.1,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 ideal clients to validate the urgency of the problem and desired outcome.",
      ],
      monetization: [
        "Test 3 offer packages and price anchors with real prospects before expanding delivery.",
      ],
      acquisition: [
        "Launch one lead magnet, webinar, or outbound campaign to measure qualified demand.",
      ],
      differentiation: [
        "Sharpen the niche and promise so the offer feels specific, not generic.",
      ],
    },
    defaultNextSteps: [
      "Start with one narrow niche and one clear promise.",
      "Package the offer before investing in a full funnel.",
    ],
  },
  tech: {
    frameworkName: "mobile_web_app_v1",
    frameworkLabel: "Mobile / Web App Framework",
    version: "v1",
    weights: {
      market_demand: 0.19,
      monetization: 0.15,
      competition: 0.12,
      acquisition: 0.14,
      execution_feasibility: 0.17,
      differentiation: 0.13,
      risk: 0.1,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 target users and validate whether the problem is painful enough for a new app.",
      ],
      acquisition: [
        "Run a landing page, waitlist, or prototype test before building the full product.",
      ],
      execution_feasibility: [
        "Reduce the first release to the smallest testable user journey.",
      ],
      differentiation: [
        "Position around one use case or one underserved segment before adding more features.",
      ],
    },
    defaultNextSteps: [
      "Validate one wedge use case before building a broader app.",
      "Use a clickable prototype or thin MVP to test adoption fast.",
    ],
  },
  marketplace: {
    frameworkName: "marketplace_v1",
    frameworkLabel: "Marketplace Framework",
    version: "v1",
    weights: {
      market_demand: 0.18,
      monetization: 0.13,
      competition: 0.12,
      acquisition: 0.18,
      execution_feasibility: 0.14,
      differentiation: 0.12,
      risk: 0.13,
    },
    recommendedTests: {
      market_demand: [
        "Interview both demand-side and supply-side users before building liquidity features.",
      ],
      acquisition: [
        "Manually match a small group of buyers and sellers to test marketplace pull.",
      ],
      risk: [
        "Validate trust, safety, and disintermediation risk before investing in a two-sided product.",
      ],
    },
    defaultNextSteps: [
      "Prove supply and demand can be activated in one niche or geography first.",
      "Use manual ops to test liquidity before building a full marketplace.",
    ],
  },
  finance: {
    frameworkName: "finance_v1",
    frameworkLabel: "Finance Framework",
    version: "v1",
    weights: {
      market_demand: 0.18,
      monetization: 0.15,
      competition: 0.11,
      acquisition: 0.13,
      execution_feasibility: 0.14,
      differentiation: 0.11,
      risk: 0.18,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 target users to validate trust barriers and urgency around the problem.",
      ],
      risk: [
        "Validate compliance, payment rail, and trust assumptions before scaling distribution.",
      ],
      monetization: [
        "Test willingness to pay with one simple pricing model before adding more features.",
      ],
    },
    defaultNextSteps: [
      "Prioritize trust, compliance, and payment flow validation early.",
      "Keep the first offer narrow enough to manage operational and regulatory risk.",
    ],
  },
  health_wellness: {
    frameworkName: "health_wellness_v1",
    frameworkLabel: "Health & Wellness Framework",
    version: "v1",
    weights: {
      market_demand: 0.2,
      monetization: 0.14,
      competition: 0.11,
      acquisition: 0.14,
      execution_feasibility: 0.14,
      differentiation: 0.12,
      risk: 0.15,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 target users about urgency, trust, and desired outcomes.",
      ],
      acquisition: [
        "Run one audience test to measure qualified lead intent before expanding the offer.",
      ],
      risk: [
        "Validate claims, certifications, and trust signals before scaling marketing.",
      ],
    },
    defaultNextSteps: [
      "Lead with trust and outcome clarity before expanding the program or service line.",
      "Keep the first offer narrow enough to produce a credible result.",
    ],
  },
  edtech: {
    frameworkName: "edtech_v1",
    frameworkLabel: "EdTech Framework",
    version: "v1",
    weights: {
      market_demand: 0.19,
      monetization: 0.15,
      competition: 0.11,
      acquisition: 0.15,
      execution_feasibility: 0.14,
      differentiation: 0.13,
      risk: 0.13,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 learners or buyers to validate the job-to-be-done and urgency.",
      ],
      monetization: [
        "Test one cohort, workshop, or pilot pricing offer before producing a full curriculum.",
      ],
      acquisition: [
        "Run one waitlist or workshop signup experiment to measure real interest.",
      ],
    },
    defaultNextSteps: [
      "Validate one learning outcome before building a broad curriculum.",
      "Prove completion and willingness to pay before scaling content production.",
    ],
  },
  legal_law: {
    frameworkName: "legal_law_v1",
    frameworkLabel: "Legal / Law Framework",
    version: "v1",
    weights: {
      market_demand: 0.18,
      monetization: 0.15,
      competition: 0.1,
      acquisition: 0.11,
      execution_feasibility: 0.14,
      differentiation: 0.1,
      risk: 0.22,
    },
    recommendedTests: {
      market_demand: [
        "Interview 10 target clients to validate urgency, trust needs, and buying triggers.",
      ],
      risk: [
        "Validate regulatory, licensing, and compliance requirements before scaling the offer.",
      ],
      acquisition: [
        "Test one narrow positioning message with one qualified acquisition channel first.",
      ],
    },
    defaultNextSteps: [
      "Make trust and compliance part of the first validation sprint.",
      "Start with one narrow use case before broadening the service.",
    ],
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function unique(items: Array<string | undefined | null>, limit = 6): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item?.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= limit) break;
  }

  return result;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toScore100(value: number | undefined | null, max = 5): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(clamp((value / max) * 100, 0, 100));
}

function listSignalScore(items: string[]): number {
  const count = items.filter(Boolean).length;
  if (count >= 4) return 86;
  if (count === 3) return 78;
  if (count === 2) return 69;
  if (count === 1) return 60;
  return 45;
}

function trendScore(trends: string[]): number {
  const joined = trends.join(" ").toLowerCase();
  if (!joined) return 55;
  if (joined.includes("growing")) return 82;
  if (joined.includes("stable")) return 67;
  if (joined.includes("declining")) return 38;
  return 58;
}

function presenceScore(value: unknown, present = 78, missing = 52): number {
  if (typeof value === "number") return Number.isFinite(value) ? present : missing;
  if (typeof value === "string") return value.trim() ? present : missing;
  if (Array.isArray(value)) return value.length ? present : missing;
  return value ? present : missing;
}

function inputCompleteness(input: ValidationInput): number {
  const optionalFields = [
    input.targetCustomer,
    input.targetMarket,
    input.location,
    input.offer,
    input.problem,
    input.pricingIdea,
    input.budgetUsd,
    input.skillSummary,
    input.timelineDays,
  ];
  const completed = optionalFields.filter((value) => {
    if (typeof value === "number") return true;
    if (typeof value === "string") return value.trim().length > 0;
    return Boolean(value);
  }).length;

  return Math.round((completed / optionalFields.length) * 100);
}

function fillTemplate(template: string, input: ValidationInput): string {
  const market = input.location?.trim() || input.targetMarket?.trim() || "your target market";
  const customer = input.targetCustomer?.trim() || "your target customers";
  const offer = input.offer?.trim() || input.idea.trim();

  return template
    .replaceAll("{market}", market)
    .replaceAll("{customer}", customer)
    .replaceAll("{offer}", offer);
}

function toPublicCategory(category: Category): string {
  return PUBLIC_CATEGORY_MAP[category] ?? category;
}

function buildCombinedInputText(input: ValidationInput, result?: DynamicValidationResult): string {
  return [
    input.idea,
    input.targetCustomer,
    input.targetMarket,
    input.location,
    input.offer,
    input.problem,
    input.pricingIdea,
    result?.summary?.oneLiner,
    result?.framework?.archetype,
    result?.framework?.label,
    result?.frameworkReport?.primarySegment?.name,
    result?.frameworkReport?.primarySegment?.who,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n");
}

function detectValidationSpecialization(
  input: ValidationInput,
  result?: DynamicValidationResult
): ValidationSpecialization | null {
  const selectedFrameworkId = result?.inferredBusinessModel?.frameworkId ?? result?.frameworkUsed ?? result?.framework_used;
  const text = buildCombinedInputText(input, result);
  const verticalSaasContext = detectVerticalSaasContext(text);

  if (selectedFrameworkId === "vertical_saas_v1" || verticalSaasContext) {
    const context = verticalSaasContext ?? {
      segment: result?.inferredBusinessModel?.segment ?? "small_business_operators",
      audienceLabel: "target users",
      workflowLabel: "one high-frequency workflow",
      acquisitionLabel: "direct outreach, niche communities, and ecosystem partnerships",
      differentiationLabel: "niche-specific workflow depth and a faster setup experience",
      toolType: "generic" as const,
    };

    const isCrmTool = context.toolType === "crm";
    const isBookingTool = context.toolType === "booking";
    const isWorkflowTool = context.toolType === "workflow";

    // Agency onboarding / service operations workflow tool specific content
    if (isWorkflowTool) {
      const isAgencyOnboarding = context.segment.includes("onboarding") || context.segment.includes("agency");
      
      return {
        primaryCategory: "saas",
        subcategory: "agency_operations_workflow",
        businessModelType: "vertical_saas_service_ops",
        segment: context.segment,
        frameworkName: "vertical_saas_v1",
        frameworkLabel: "Agency / Service Operations SaaS Framework",
        criteria: [
          "Onboarding workflow pain severity",
          "Willingness to pay for workflow tooling",
          "Switching friction from current methods",
          "Depth of workflow coverage needed",
          "Acquisition channels to agency operators",
          "Retention through operational embedding",
          "Wedge strength vs. existing tools",
          "Feature scope risk (too thin vs. too broad)",
        ],
        reason:
          "This idea is a workflow tool for agencies or service businesses, so the framework evaluates client onboarding, service delivery operations, and whether the wedge is strong enough vs. existing tools.",
        evidence: unique([
          "The idea describes software for managing client onboarding, project workflows, or service delivery operations.",
          `The target segment is ${context.audienceLabel}.`,
          `The workflow centers on ${context.workflowLabel}.`,
          "Framework selection evaluates service operations workflow pain and existing tool substitution.",
        ], 4),
        scoreAdjustments: {
          market_demand: 5,
          monetization: 2,
          competition: -10,
          acquisition: -5,
          execution_feasibility: -3,
          differentiation: 6,
          risk: -8,
        },
        strengths: [
          `${isAgencyOnboarding ? "Agency onboarding is a real pain point" : "Workflow standardization is valuable"} that can create immediate value if the tool reduces manual coordination.`,
          "Agencies and service businesses have recurring client cycles, so a good onboarding tool can become operationally embedded.",
          "A focused MVP around one workflow step (e.g., just onboarding checklists) is easier to validate than a full client management platform.",
        ],
        weaknesses: [
          `${context.audienceLabel} already use tools like Notion, ClickUp, Asana, Airtable, HoneyBook, Dubsado, or HubSpot that often include onboarding and checklist features.`,
          "A checklist-only tool may be too thin to justify a standalone subscription unless it has automation, client visibility, or handoff features.",
          "Agency operators are notoriously tool-fatigued and skeptical of adding another dashboard to their stack.",
          "Switching costs are low for checklists, making retention fragile if the tool doesn't become part of daily operations.",
        ],
        keyRisks: [
          "Competition from existing project management, CRM, and client portal tools that already serve agency workflows.",
          "The wedge may be too narrow: agencies can build equivalent checklists in Notion, Asana, or ClickUp in 30 minutes.",
          "Retention will suffer without stickiness beyond basic checklists (e.g., automation, reminders, client-facing visibility, integrations).",
          "Acquisition can be expensive if the product cannot demonstrate clear ROI over free alternatives or existing tools.",
        ],
        assumptions: [
          `${context.audienceLabel} have painful enough onboarding or workflow problems that they would pay for a dedicated tool instead of using existing project management software.`,
          "A narrow checklist or onboarding tool can differentiate from Notion/Asana/ClickUp through simplicity, templates, or automation.",
          "Agency operators will adopt a new tool without excessive onboarding or migration friction.",
          `${context.differentiationLabel} is strong enough to justify a standalone product.`,
        ],
        recommendedTests: {
          market_demand: [
            `Interview 10 ${context.audienceLabel} about their current onboarding process, what tools they use, what's frustrating, and whether they'd pay for something better.`,
            "Ask specifically: What do you use for client onboarding today? What's broken about it? Would you pay $X/month for a better tool?",
          ],
          monetization: [
            "Test willingness to pay with a specific price point before building. If agencies won't pre-commit to $20-50/month, the wedge may be too thin.",
          ],
          acquisition: [
            `Test acquisition through ${context.acquisitionLabel}.`,
            "Try posting in agency communities (Agency Collective, Slack groups) to gauge interest before building.",
          ],
          differentiation: [
            `Define the wedge around ${context.differentiationLabel}.`,
            "Identify: Is the value in simplicity, templates, automation, client visibility, integrations, or something else? A checklist alone is not enough.",
            "Answer: Why wouldn't an agency just use a Notion template or Asana project for this?",
          ],
          risk: [
            "Validate whether agencies will actually switch by asking 5 to adopt a beta. If they say 'we already use X for that', the wedge is weak.",
          ],
        },
        defaultNextSteps: [
          "Interview agency owners to validate onboarding workflow pain and current tool frustration before building anything.",
          "Define the sharp wedge: Is it templates, automation, client-facing visibility, reminders, integrations, or something else? Checklist-only is likely too thin.",
          "Test willingness to pay explicitly before building. If agencies won't pre-commit, the idea needs a stronger wedge.",
          "Use 3-5 design partners to validate retention and daily usage before scaling the feature set.",
        ],
      };
    }

    // CRM / workflow tool specific content
    if (isCrmTool) {
      return {
        primaryCategory: "saas",
        subcategory: "crm_workflow",
        businessModelType: "vertical_saas_crm_workflow",
        segment: context.segment,
        frameworkName: "vertical_saas_v1",
        frameworkLabel: "CRM / Workflow SaaS Framework",
        criteria: [
          "Workflow pain urgency for target users",
          "Willingness to pay vs. free alternatives",
          "Switching friction from current tools",
          "Depth of workflow coverage",
          "Acquisition channels to target segment",
          "Retention through daily usage",
          "Simplicity vs. feature bloat",
          "Differentiation vs. horizontal tools",
        ],
        reason:
          "This idea is a CRM or workflow tool for a specific professional segment, so the framework should evaluate pipeline management, project tracking, and client workflows rather than scheduling or booking.",
        evidence: unique([
          "The idea describes software for managing clients, projects, contacts, or pipelines.",
          context.audienceLabel !== "target users"
            ? `The served customer segment is ${context.audienceLabel}, which defines the vertical niche.`
            : null,
          `The workflow centers on ${context.workflowLabel}.`,
          "Framework selection should evaluate CRM and workflow pain, not scheduling or appointment software.",
        ], 4),
        scoreAdjustments: {
          market_demand: 6,
          monetization: 3,
          competition: -8,
          acquisition: -4,
          execution_feasibility: -2,
          differentiation: 8,
          risk: -6,
        },
        strengths: [
          `A focused CRM/workflow tool can feel more relevant to ${context.audienceLabel} than generic horizontal tools like Notion, Airtable, or Trello.`,
          "If the tool becomes part of daily workflow habits, retention can be strong due to switching costs and data lock-in.",
          "A narrow MVP around one painful workflow is easier to validate than a full-featured CRM suite.",
        ],
        weaknesses: [
          `${context.audienceLabel} may already use spreadsheets, Notion, Airtable, HoneyBook, Dubsado, or other tools that are 'good enough' for their current workflow.`,
          "Switching costs can work against adoption if migration from existing tools feels heavy.",
          "A thin feature wedge can be ignored if the product does not solve a painful daily workflow better than existing alternatives.",
        ],
        keyRisks: [
          `Competition is likely intense from established CRM, project management, and productivity tools already used by ${context.audienceLabel}.`,
          "Retention will suffer if the product adds another dashboard without becoming part of the user's daily workflow.",
          "Feature sprawl can slow the build and weaken differentiation before the core wedge is proven.",
          "Acquisition can be expensive without organic channels, community presence, or design-partner relationships.",
        ],
        assumptions: [
          `${context.audienceLabel} have painful enough workflow or client management problems to pay for a better tool.`,
          "The product can reduce friction enough that users will switch from current tools, spreadsheets, or manual habits.",
          `${context.differentiationLabel} is strong enough to justify adoption despite established alternatives.`,
        ],
        recommendedTests: {
          market_demand: [
            `Interview 10 ${context.audienceLabel} about workflow pain, current tools, what's frustrating, and willingness to pay for something better.`,
            `Run a landing-page or waitlist test focused on ${context.workflowLabel}.`,
          ],
          monetization: [
            `Test whether ${context.audienceLabel} will pre-commit to a simple monthly price before adding more features.`,
          ],
          acquisition: [
            `Test acquisition through ${context.acquisitionLabel}.`,
            "Try a design-partner offer for 3 pilot users before scaling paid acquisition.",
          ],
          differentiation: [
            `Define the wedge around ${context.differentiationLabel}, not generic CRM language.`,
            "Identify what makes this meaningfully simpler or faster than Notion, Airtable, HoneyBook, or Dubsado for the target segment.",
          ],
          risk: [
            "Validate switching friction by asking pilots to migrate real client data or project records.",
          ],
        },
        defaultNextSteps: [
          "Interview target users to validate workflow pain and current tool frustration before building.",
          "Keep the MVP focused on one painful workflow step before expanding into a full CRM suite.",
          "Use design partners to validate willingness to pay and retention before broadening the roadmap.",
        ],
      };
    }

    // Booking / scheduling tool specific content
    if (isBookingTool) {
      return {
        primaryCategory: "saas",
        subcategory: "vertical_saas",
        businessModelType: "vertical_saas_workflow_software",
        segment: context.segment,
        frameworkName: "vertical_saas_v1",
        frameworkLabel: "Vertical SaaS / SMB Software Framework",
        criteria: [
          "Problem urgency for the operator",
          "Willingness to pay",
          "Switching friction and migration",
          "Workflow depth for the niche",
          "Acquisition channels to SMB operators",
          "Retention and churn risk",
          "Simplicity vs feature bloat",
          "Operational support burden",
        ],
        reason:
          "This idea is software for a local-service niche, so the core business model is vertical SaaS rather than the operator's local service business.",
        evidence: unique([
          "What is being built is a software product, not the operator's local service operation.",
          context.audienceLabel !== "target users"
            ? `The served customer segment is ${context.audienceLabel}, which defines the vertical rather than the core business model.`
            : null,
          `The workflow centers on ${context.workflowLabel}.`,
          "Framework selection should follow the product model first, then layer in the served-customer context.",
        ], 4),
        scoreAdjustments: {
          market_demand: 6,
          monetization: 4,
          competition: -6,
          acquisition: -4,
          execution_feasibility: -2,
          differentiation: 8,
          risk: -8,
        },
        strengths: [
          `A focused vertical can make the product feel more relevant than generic scheduling software for ${context.audienceLabel}.`,
          "Recurring workflow usage can create better retention than one-off project software if the tool becomes operationally embedded.",
          "A narrow MVP around one painful workflow is easier to validate than a broad all-in-one SMB suite.",
        ],
        weaknesses: [
          "SMB buyers often expect low pricing and fast setup, which can compress willingness to pay.",
          "Switching from incumbents or spreadsheets can be hard if migration and onboarding feel heavy.",
          "A thin feature wedge can be ignored if the product does not solve a painful daily workflow better than existing tools.",
        ],
        keyRisks: [
          `Competition is likely intense from incumbent booking and business-management tools already selling to ${context.audienceLabel}.`,
          "Retention will suffer if the product adds another dashboard without becoming part of the operator's daily workflow.",
          "Feature sprawl can slow the build and weaken differentiation before the core scheduling wedge is proven.",
          "Acquisition can be expensive if the team cannot reach operators through niche channels or design-partner relationships.",
        ],
        assumptions: [
          `${context.audienceLabel} have a painful enough scheduling or client-management problem to pay for a better workflow tool.`,
          "The product can reduce friction enough that operators will switch from current tools, spreadsheets, or manual booking habits.",
          `${context.differentiationLabel} is strong enough to justify adoption despite incumbent alternatives.`,
        ],
        recommendedTests: {
          market_demand: [
            `Interview 10 ${context.audienceLabel} about scheduling pain, no-shows, client management gaps, and what they use today.`,
            `Run a landing-page or waitlist test focused on ${context.workflowLabel}.`,
          ],
          monetization: [
            `Test whether ${context.audienceLabel} will pre-commit to a simple monthly price for a narrower workflow tool before adding more features.`,
          ],
          acquisition: [
            `Test acquisition through ${context.acquisitionLabel}.`,
            "Try a design-partner offer for 3 pilot customers before scaling paid acquisition.",
          ],
          differentiation: [
            `Define the wedge around ${context.differentiationLabel}, not generic appointment software language.`,
          ],
          risk: [
            "Validate switching friction by asking pilots to migrate a real week of bookings or client records.",
          ],
        },
        defaultNextSteps: [
          "Keep the MVP focused on one painful workflow before expanding into a full business-management suite.",
          "Use design partners to validate willingness to pay, migration friction, and retention before broadening the roadmap.",
        ],
      };
    }

    // Generic vertical SaaS fallback - no scheduling/booking references
    return {
      primaryCategory: "saas",
      subcategory: "vertical_saas",
      businessModelType: "vertical_saas_workflow_software",
      segment: context.segment,
      frameworkName: "vertical_saas_v1",
      frameworkLabel: "Vertical SaaS Framework",
      criteria: [
        "Problem urgency for target users",
        "Willingness to pay",
        "Switching friction and migration",
        "Workflow depth for the niche",
        "Acquisition channels to target segment",
        "Retention and churn risk",
        "Simplicity vs feature bloat",
        "Operational support burden",
      ],
      reason:
        "This idea is software for a specific niche, so the framework evaluates vertical SaaS dynamics.",
      evidence: unique([
        "The idea describes software, an app, or a tool for a specific professional segment.",
        context.audienceLabel !== "target users"
          ? `The served customer segment is ${context.audienceLabel}.`
          : null,
        `The workflow centers on ${context.workflowLabel}.`,
        "Framework selection should evaluate product-market fit for the target niche.",
      ], 4),
      scoreAdjustments: {
        market_demand: 5,
        monetization: 3,
        competition: -6,
        acquisition: -4,
        execution_feasibility: -2,
        differentiation: 7,
        risk: -6,
      },
      strengths: [
        `A focused vertical tool can feel more relevant to ${context.audienceLabel} than generic horizontal software.`,
        "Recurring workflow usage can create retention if the tool becomes embedded in daily operations.",
        "A narrow MVP around one workflow is easier to validate than a broad feature suite.",
      ],
      weaknesses: [
        "Target users may expect low pricing and fast setup.",
        "Switching from existing tools can be hard if migration feels heavy.",
        "A thin feature wedge can be ignored if it doesn't solve a painful workflow better than alternatives.",
      ],
      keyRisks: [
        `Competition is likely from established tools already serving ${context.audienceLabel}.`,
        "Retention depends on becoming part of the user's daily workflow.",
        "Feature sprawl can weaken differentiation before the core wedge is proven.",
        "Acquisition can be expensive without organic channels or design-partner relationships.",
      ],
      assumptions: [
        `${context.audienceLabel} have painful enough workflow problems to pay for a better tool.`,
        "Users will switch from current tools if the product reduces friction meaningfully.",
        `${context.differentiationLabel} is strong enough to justify adoption.`,
      ],
      recommendedTests: {
        market_demand: [
          `Interview 10 ${context.audienceLabel} about workflow pain, current tools, and willingness to pay.`,
          `Run a landing-page or waitlist test focused on ${context.workflowLabel}.`,
        ],
        monetization: [
          `Test whether ${context.audienceLabel} will pre-commit to a price before adding more features.`,
        ],
        acquisition: [
          `Test acquisition through ${context.acquisitionLabel}.`,
          "Try a design-partner offer for pilot users before scaling acquisition.",
        ],
        differentiation: [
          `Define the wedge around ${context.differentiationLabel}.`,
        ],
        risk: [
          "Validate switching friction by asking pilots to migrate real data.",
        ],
      },
      defaultNextSteps: [
        "Interview target users to validate workflow pain before building.",
        "Keep the MVP focused on one painful workflow before expanding.",
        "Use design partners to validate willingness to pay and retention.",
      ],
    };
  }

  if (
    selectedFrameworkId === "postpartum_fitness_coaching_v1" ||
    (POSTPARTUM_FITNESS_REGEX.test(text) && FITNESS_WELLNESS_COACHING_REGEX.test(text))
  ) {
    return {
      primaryCategory: "coaching_wellness_service",
      subcategory: "postpartum_fitness_coaching",
      businessModelType: "remote_coaching_digital_service",
      segment: "new_moms",
      frameworkName: "postpartum_fitness_coaching_v1",
      frameworkLabel: "Postpartum Fitness Coaching Framework",
      criteria: [
        "Postpartum demand",
        "Trust and credentials",
        "Safety and liability",
        "Willingness to pay",
        "Time constraints for new moms",
        "Retention and accountability",
        "Differentiation from free content",
        "Acquisition channels",
      ],
      reason:
        "This is a remote health and wellness coaching service for postpartum mothers, not an edtech or generic course business.",
      evidence: unique([
        "The audience is postpartum women or new moms with specific recovery and fitness needs.",
        REMOTE_COACHING_REGEX.test(text)
          ? "The delivery model is remote coaching or a digital service rather than an in-person studio."
          : null,
        "Trust, safety, and credentials matter more than curriculum or career outcomes.",
        "Retention depends on accountability, community, and practical fit for time-constrained moms.",
      ], 4),
      scoreAdjustments: {
        market_demand: 8,
        monetization: 5,
        competition: -4,
        acquisition: -6,
        execution_feasibility: -5,
        differentiation: 9,
        risk: -10,
      },
      strengths: [
        "The target audience is specific and emotionally salient, which can support clearer positioning than general fitness coaching.",
        "A remote coaching format can fit the schedule constraints of new moms better than an in-person service.",
        "Personalized recovery guidance, accountability, and community can differentiate the offer from free generic workouts.",
      ],
      weaknesses: [
        "Trust and credential barriers are meaningful in postpartum fitness because safety concerns are high.",
        "Time constraints and inconsistent routines can make retention harder even when demand is real.",
        "The business must prove why moms should pay instead of using free postpartum content online.",
      ],
      keyRisks: [
        "Weak credentials or unclear safety boundaries could reduce trust and create liability concerns.",
        "Acquisition may be difficult without a strong channel strategy through content, communities, or partnerships.",
        "Retention may drop if the program is not flexible enough for sleep disruption, childcare demands, and recovery variability.",
        "The offer may blend into free postpartum fitness content unless the coaching promise is clearly different.",
      ],
      assumptions: [
        "New moms want more personalized accountability and recovery guidance than free content provides.",
        "A remote coaching model can fit postpartum schedules well enough to sustain engagement and retention.",
        "The target audience will trust the coach enough to pay for a safety-conscious postpartum program.",
      ],
      recommendedTests: {
        market_demand: [
          "Interview 10 new moms about postpartum fitness pain points, safety concerns, and what support they still feel is missing.",
          "Survey postpartum women on recovery goals, scheduling constraints, and willingness to pay for guided coaching.",
        ],
        acquisition: [
          "Build a focused landing page for postpartum fitness coaching and test a lead magnet such as a recovery checklist or safe core-rebuild guide.",
          "Validate acquisition channels through Instagram, parenting communities, OB-GYN or pelvic-floor referrals, and mom-focused newsletters.",
        ],
        execution_feasibility: [
          "Clarify credentials, safety boundaries, disclaimers, and the delivery workflow before scaling client acquisition.",
        ],
        differentiation: [
          "Define why the program is meaningfully safer, more accountable, or more personalized than free postpartum workouts.",
        ],
        risk: [
          "Test a consultation funnel to learn whether postpartum moms trust the positioning enough to book a call.",
        ],
      },
      defaultNextSteps: [
        "Define the niche promise around one postpartum outcome first, such as safe core recovery or rebuilding strength after birth.",
        "Start with a remote coaching or pilot membership offer before expanding into a broader program library.",
      ],
    };
  }

  if (selectedFrameworkId === "real_estate_agent_v1") {
    const segment =
      result?.inferredBusinessModel?.segment ??
      (FIRST_TIME_HOMEBUYER_REGEX.test(text) ? "first_time_homebuyers" : undefined);

    return {
      primaryCategory: "professional_local_service",
      subcategory: "real_estate_agent",
      businessModelType:
        result?.inferredBusinessModel?.businessModelType ?? "trust_based_high_ticket_local_service",
      segment,
      frameworkName: "real_estate_agent_v1",
      frameworkLabel: "Real Estate Agent Framework",
      criteria: [
        "Local housing demand",
        "Lead generation difficulty",
        "Trust and reputation requirements",
        "Licensing and brokerage setup",
        "Long sales cycle and conversion to close",
        "Niche strength for first-time buyers",
        "Competition from established agents",
        "Education-based acquisition opportunity",
      ],
      reason:
        "The AI-selected framework indicates a real estate agent business model rather than a generic local service.",
      evidence: unique([
        ...(result?.inferredBusinessModel?.evidence ?? []),
        "The selected framework is real_estate_agent_v1.",
      ], 4),
      scoreAdjustments: {
        market_demand: segment === "first_time_homebuyers" ? 9 : 6,
        monetization: 7,
        competition: -8,
        acquisition: -10,
        execution_feasibility: -7,
        differentiation: segment === "first_time_homebuyers" ? 10 : 5,
        risk: -12,
      },
      strengths: [
        "A clear niche audience makes the positioning more specific than a generalist real estate practice.",
        "The business has a high-value transaction model if trust and lead flow are proven.",
        "An education-first approach for first-time buyers can create a differentiated content and consultation funnel.",
      ],
      weaknesses: [
        "A new agent still faces a trust and credibility gap versus established local agents.",
        "The sales cycle is long, so lead generation and follow-up discipline matter early.",
        "The model depends on sustainable local acquisition channels before referrals compound.",
      ],
      keyRisks: [
        "Licensing, brokerage alignment, and compliance can slow launch if not clarified early.",
        "Competition from established agents with stronger reviews, referrals, and local brand recognition is intense.",
        "First-time buyers may have financing friction, low urgency, or long decision timelines that delay conversion.",
        "Lead generation costs can become unsustainable if the education funnel does not convert into consultations.",
      ],
      assumptions: [
        "First-time homebuyers in the target market want more guidance than current agents provide.",
        "An education-first niche can convert trust into consultations and eventually signed clients.",
        "Acquisition cost for content, referral, or partnership channels can stay below the value of a closed transaction.",
      ],
      recommendedTests: {
        market_demand: [
          "Interview 10 first-time homebuyers in {market} about confusion, trust gaps, and what they wish agents explained better.",
          "Survey renters planning to buy within 12 months to validate the pain points around financing, timing, and choosing an agent.",
        ],
        acquisition: [
          "Build a focused landing page for first-time homebuyer guidance and test a lead magnet such as a buyer checklist or financing guide.",
          "Test acquisition channels across local content, Instagram/TikTok, referral partners, and lender relationships before scaling ad spend.",
        ],
        execution_feasibility: [
          "Clarify the licensing, brokerage, CRM, and follow-up workflow required to move a lead from consultation to close.",
        ],
        differentiation: [
          "Define a sharper niche promise around first-time buyer education, not just general real estate support.",
        ],
        risk: [
          "Run a consultation or waitlist test to measure whether first-time buyers trust the education-first positioning enough to book a call.",
        ],
      },
      defaultNextSteps: [
        "Define the niche positioning around first-time homebuyers in one neighborhood or market segment first.",
        "Launch an education-first funnel before trying to compete broadly with established agents.",
      ],
    };
  }

  if (
    REAL_ESTATE_AGENT_REGEX.test(text) ||
    /real_estate_agent|professional_local_service/i.test(result?.framework?.archetype ?? "")
  ) {
    const segment = FIRST_TIME_HOMEBUYER_REGEX.test(text)
      ? "first_time_homebuyers"
      : /investor|investment property/i.test(text)
        ? "property_investors"
        : /seller|listing/i.test(text)
          ? "home_sellers"
          : undefined;

    return {
      primaryCategory: "professional_local_service",
      subcategory: "real_estate_agent",
      businessModelType: "trust_based_high_ticket_local_service",
      segment,
      frameworkName: "real_estate_agent_v1",
      frameworkLabel: "Real Estate Agent Framework",
      criteria: [
        "Local housing demand",
        "Lead generation difficulty",
        "Trust and reputation requirements",
        "Licensing and brokerage setup",
        "Long sales cycle and conversion to close",
        "Niche strength for first-time buyers",
        "Competition from established agents",
        "Education-based acquisition opportunity",
      ],
      reason:
        "This is a local professional service with a regulated, trust-heavy, high-ticket transaction model rather than a generic local service business.",
      evidence: unique([
        "The idea centers on a real estate agent business model, not a generic service offer.",
        segment === "first_time_homebuyers"
          ? "The target segment is first-time homebuyers, which implies education-led trust building and financing friction."
          : null,
        input.location ? `The business is tied to local housing-market dynamics in ${input.location}.` : null,
        "Conversion depends on credibility, referrals, and lead-to-close execution over a longer buying cycle.",
      ], 4),
      scoreAdjustments: {
        market_demand: segment === "first_time_homebuyers" ? 9 : 6,
        monetization: 7,
        competition: -8,
        acquisition: -10,
        execution_feasibility: -7,
        differentiation: segment === "first_time_homebuyers" ? 10 : 5,
        risk: -12,
      },
      strengths: [
        "A clear niche audience makes the positioning more specific than a generalist real estate practice.",
        "The business has a high-value transaction model if trust and lead flow are proven.",
        "An education-first approach for first-time buyers can create a differentiated content and consultation funnel.",
      ],
      weaknesses: [
        "A new agent still faces a trust and credibility gap versus established local agents.",
        "The sales cycle is long, so lead generation and follow-up discipline matter early.",
        "The model depends on sustainable local acquisition channels before referrals compound.",
      ],
      keyRisks: [
        "Licensing, brokerage alignment, and compliance can slow launch if not clarified early.",
        "Competition from established agents with stronger reviews, referrals, and local brand recognition is intense.",
        "First-time buyers may have financing friction, low urgency, or long decision timelines that delay conversion.",
        "Lead generation costs can become unsustainable if the education funnel does not convert into consultations.",
      ],
      assumptions: [
        "First-time homebuyers in the target market want more guidance than current agents provide.",
        "An education-first niche can convert trust into consultations and eventually signed clients.",
        "Acquisition cost for content, referral, or partnership channels can stay below the value of a closed transaction.",
      ],
      recommendedTests: {
        market_demand: [
          "Interview 10 first-time homebuyers in {market} about confusion, trust gaps, and what they wish agents explained better.",
          "Survey renters planning to buy within 12 months to validate the pain points around financing, timing, and choosing an agent.",
        ],
        acquisition: [
          "Build a focused landing page for first-time homebuyer guidance and test a lead magnet such as a buyer checklist or financing guide.",
          "Test acquisition channels across local content, Instagram/TikTok, referral partners, and lender relationships before scaling ad spend.",
        ],
        execution_feasibility: [
          "Clarify the licensing, brokerage, CRM, and follow-up workflow required to move a lead from consultation to close.",
        ],
        differentiation: [
          "Define a sharper niche promise around first-time buyer education, not just general real estate support.",
        ],
        risk: [
          "Run a consultation or waitlist test to measure whether first-time buyers trust the education-first positioning enough to book a call.",
        ],
      },
      defaultNextSteps: [
        "Define the niche positioning around first-time homebuyers in one neighborhood or market segment first.",
        "Launch an education-first funnel before trying to compete broadly with established agents.",
      ],
    };
  }

  return null;
}

export function inferValidationBusinessModel(
  input: ValidationInput,
  result?: DynamicValidationResult
): ValidationBusinessModel {
  const fallbackCategory = classifyCategory({ idea: input.idea, explicitCategory: input.category }).category;
  const specialization = detectValidationSpecialization(input, result);
  const primaryCategory =
    specialization?.primaryCategory ??
    (result?.businessCategory || result?.business_category) ??
    toPublicCategory(result?.category ?? fallbackCategory);
  const confidence =
    typeof result?.confidenceScore === "number"
      ? result.confidenceScore
      : typeof result?.confidence_score === "number"
        ? result.confidence_score
        : undefined;

  return {
    primaryCategory,
    subcategory: specialization?.subcategory ?? result?.inferredBusinessModel?.subcategory,
    businessModelType: specialization?.businessModelType ?? result?.inferredBusinessModel?.businessModelType,
    segment: specialization?.segment ?? result?.inferredBusinessModel?.segment,
    frameworkId:
      specialization?.frameworkName ??
      result?.inferredBusinessModel?.frameworkId ??
      result?.frameworkUsed ??
      result?.framework_used ??
      getDefaultFrameworkGuideId(result?.category ?? fallbackCategory),
    confidence,
    evidence: specialization?.evidence ?? result?.summary.topOpportunities ?? [],
  };
}

function baselineScoresFromResult(result: DynamicValidationResult): ValidationScoreBreakdown {
  const criteria = result.criteria ?? [];
  const scoreFromCriterion = (matcher: RegExp): number => {
    const match = criteria.find((criterion) => matcher.test(criterion.key) || matcher.test(criterion.label));
    return toScore100(match?.score);
  };

  const severityWeight = {
    critical: 28,
    high: 18,
    medium: 10,
    low: 5,
  } as const;

  const riskPenalty = (result.failureRisks ?? []).reduce((total, risk) => {
    return total + severityWeight[risk.severity];
  }, 0);

  const competitionScore =
    typeof result.frameworkReport?.solutionValidation.differentiation === "number"
      ? toScore100(result.frameworkReport.solutionValidation.differentiation)
      : scoreFromCriterion(/competition|different|moat/i);

  return {
    market_demand:
      typeof result.frameworkReport?.problemDemand.total === "number"
        ? toScore100(result.frameworkReport.problemDemand.total, 20)
        : scoreFromCriterion(/problem|demand|market|urgency/i),
    monetization:
      typeof result.frameworkReport?.businessModelValidation.margin === "number"
        ? Math.round(clamp(result.frameworkReport.businessModelValidation.margin, 0, 100))
        : scoreFromCriterion(/pricing|revenue|business_model|monet|willingness/i),
    competition: competitionScore,
    acquisition:
      typeof result.frameworkReport?.primarySegment?.scores?.reachability === "number"
        ? toScore100(result.frameworkReport.primarySegment.scores.reachability)
        : scoreFromCriterion(/distribution|acquisition|market_access|reach/i),
    execution_feasibility:
      typeof result.frameworkReport?.operationalValidation.score === "number"
        ? toScore100(result.frameworkReport.operationalValidation.score)
        : scoreFromCriterion(/execution|delivery|operation|retention|onboarding|technical/i),
    differentiation: competitionScore,
    risk: clamp(100 - riskPenalty, 15, 95),
  };
}

function buildEvidenceByArea(
  input: ValidationInput,
  result: DynamicValidationResult,
  researchSummary: ValidationResearchSummary
): Record<ScoreKey, string[]> {
  const criteria = result.criteria ?? [];

  return {
    market_demand: unique([
      researchSummary.demandSignals[0],
      researchSummary.marketTrends[0],
      result.frameworkReport?.problemDemand.keyInsight,
      criteria.find((criterion) => /problem|demand|market|urgency/i.test(criterion.key))?.evidence[0],
      input.problem ? `Problem statement provided: ${input.problem}` : null,
    ], 4),
    monetization: unique([
      researchSummary.monetizationNotes[0],
      input.pricingIdea ? `Pricing concept: ${input.pricingIdea}` : null,
      result.frameworkReport?.businessModelValidation.model
        ? `Business model signal: ${result.frameworkReport.businessModelValidation.model}.`
        : null,
      criteria.find((criterion) => /pricing|revenue|business_model|willingness/i.test(criterion.key))?.evidence[0],
    ], 4),
    competition: unique([
      researchSummary.competitionNotes[0],
      researchSummary.differentiationOpportunities[0],
      criteria.find((criterion) => /competition|competitive/i.test(criterion.key))?.risks[0],
      result.summary.biggestRisks[0],
    ], 4),
    acquisition: unique([
      criteria.find((criterion) => /distribution|acquisition|reach|market_access/i.test(criterion.key))?.evidence[0],
      researchSummary.acquisitionChallenges[0],
      input.targetCustomer ? `Target customer is specified as ${input.targetCustomer}.` : null,
      input.location ? `Market/location context provided: ${input.location}.` : null,
    ], 4),
    execution_feasibility: unique([
      result.frameworkReport?.operationalValidation.keyConstraints[0],
      criteria.find((criterion) => /execution|operation|delivery|technical|retention/i.test(criterion.key))?.evidence[0],
      input.skillSummary ? `Founder/team skills: ${input.skillSummary}.` : null,
      typeof input.budgetUsd === "number" ? `Budget signal: $${Math.round(input.budgetUsd)}.` : null,
    ], 4),
    differentiation: unique([
      researchSummary.differentiationOpportunities[0],
      criteria.find((criterion) => /different|moat|niche/i.test(criterion.key))?.evidence[0],
      input.offer ? `Offer definition: ${input.offer}.` : null,
      result.summary.topOpportunities[0],
    ], 4),
    risk: unique([
      researchSummary.riskFactors[0],
      result.failureRisks[0]?.reason,
      result.summary.biggestRisks[0],
      criteria.flatMap((criterion) => criterion.risks)[0],
    ], 4),
  };
}

function buildAreaWeakness(area: ScoreKey, evidenceByArea: Record<ScoreKey, string[]>): string {
  const evidence = evidenceByArea[area][0];
  if (evidence && !isGenericFiller(evidence)) return evidence;
  // Skip generic fallbacks — only return idea-specific weaknesses
  return "";
}

function buildAreaStrength(area: ScoreKey, evidenceByArea: Record<ScoreKey, string[]>): string {
  const evidence = evidenceByArea[area][0];
  if (evidence && !isGenericFiller(evidence)) return evidence;
  // Skip generic fallbacks — only return idea-specific strengths
  return "";
}

/** Detect entries that read like action items / advice rather than actual risks or assumptions */
function isActionItemNotRisk(text: string): boolean {
  const trimmed = text.trim();
  // Risks and assumptions should describe what could go wrong or what needs to be true,
  // not tell the founder what to do
  const actionPatterns = [
    // Starts with an imperative verb → it's an instruction, not a hypothesis
    /^(pick|choose|select|define|plan|create|design|build|interview|test|offer|host|run|send|start|post|launch|survey|shadow|map|talk\s+to|reach\s+out|sign\s+up|pre-sell|attend|join|set\s+up|write|publish|schedule|contact|network|partner|collaborate|volunteer|cold[\s-]?(call|outreach|email))\s/i,
    // Advisory language
    /\b(you should|try to|consider\b|make sure|aim for|plan a|go to)\b/i,
    // Experiment / test format
    /^(mvp|waitlist|landing\s+page|pricing|bootcamp|workshop|webinar|newsletter|checklist|lead\s+magnet)\s+(test|experiment|sprint)/i,
    // Numbered action items: "Interview 10-20..." or "Create a..."
    /^(interview|survey|talk to|shadow|attend|join|visit|contact|email|call|dm|message)\s+\d+/i,
    // "Create a X" / "Start a Y" / "Launch a Z"
    /^(create|start|launch|build|set\s+up|begin|establish)\s+(a|an|the|your|weekly|monthly|bi-?weekly)\s/i,
  ];
  return actionPatterns.some((pattern) => pattern.test(trimmed));
}

/** Detect generic macro facts and filler that don't help the founder */
function isGenericFiller(text: string): boolean {
  const fillerPatterns = [
    /\$\d+[\+]?\s*(trillion|billion)\s*(globally|worldwide|market)/i,
    /\b(McKinsey|BCG|Deloitte|Bain|Accenture)\b/i,
    /\bglobal\s+(consulting|market|industry)\s+(market|size|revenue)/i,
    /\beconomic\s+cycles?\b/i,
    /\bSMB\s+market\b/i,
    /\bmarket\s+signal:\s*$/i,
    /\bthe idea shows a relatively stronger signal\b/i,
    /\bthe .+ case is still weak or under-proven\b/i,
    /\banalysis for .+ completed\b/i,
    /\bfractional executives?\b(?!.*\b(for|to|help|serve)\b)/i,
    // Template residue: "Name: Description Strengths: X, Y." pattern from competitor heuristics
    /^[A-Z][^:]+:\s+[A-Z][^:]+\s+Strengths:\s+/,
    // Very short generic filler
    /^(varies|n\/a|unknown|tbd|none)$/i,
    // Formulaic template phrases that apply to any SaaS and add no idea-specific value
    /^a focused vertical tool can feel more relevant/i,
    /^recurring workflow usage can create retention/i,
    /^a narrow mvp around one workflow/i,
    /\bthey may lack technical sophistication\b/i,
  ];
  return fillerPatterns.some((pattern) => pattern.test(text));
}

export function routeBusinessCategory(
  input: ValidationInput,
  validationIdea: string,
  result?: DynamicValidationResult
): ValidationCategoryRouting {
  const classification = classifyCategory({
    idea: validationIdea,
    explicitCategory: input.category,
  });
  const specialization = detectValidationSpecialization(input, result);
  const businessCategory =
    specialization?.primaryCategory ??
    (result?.businessCategory || result?.business_category) ??
    toPublicCategory(result?.category ?? classification.category);

  return {
    businessCategory,
    confidence: Math.round(
      clamp(
        typeof result?.confidenceScore === "number"
          ? result.confidenceScore
          : typeof result?.confidence_score === "number"
            ? result.confidence_score
            : classification.confidence * 100,
        0,
        100
      )
    ),
    alternateCategories: classification.alternativeCategories.map((item) => toPublicCategory(item.category)),
    subcategory: specialization?.subcategory ?? result?.inferredBusinessModel?.subcategory,
    businessModelType: specialization?.businessModelType ?? result?.inferredBusinessModel?.businessModelType,
    segment: specialization?.segment ?? result?.inferredBusinessModel?.segment,
    frameworkId:
      specialization?.frameworkName ??
      result?.inferredBusinessModel?.frameworkId ??
      result?.frameworkUsed ??
      result?.framework_used,
    evidence: unique([
      ...(specialization?.evidence ?? []),
      ...classification.evidence,
      ...(result?.summary.topOpportunities ?? []),
    ], 4),
  };
}

export function selectValidationFramework(
  input: ValidationInput,
  category: Category,
  result: DynamicValidationResult
): ValidationFrameworkSelection & { loadedFramework: LoadedFramework; profile: FrameworkProfile; resolvedSpecialization: ValidationSpecialization | null } {
  const loadedFramework = loadFramework({
    category,
    countryCode: result.country.code,
  });
  const profile = FRAMEWORK_PROFILES[category];
  const specialization = detectValidationSpecialization(input, result);
  const selectedFrameworkId =
    specialization?.frameworkName ??
    result.inferredBusinessModel?.frameworkId ??
    result.frameworkUsed ??
    result.framework_used ??
    profile.frameworkName;
  const selectedGuide = getFrameworkGuide(selectedFrameworkId);

  return {
    frameworkName: selectedFrameworkId,
    frameworkLabel:
      specialization?.frameworkLabel ??
      selectedGuide?.label ??
      profile.frameworkLabel ??
      result.framework?.label ??
      CATEGORY_LABELS[category],
    version: selectedFrameworkId.endsWith("_v1") ? "v1" : profile.version,
    criteria: specialization?.criteria ?? selectedGuide?.criteria ?? loadedFramework.criteria.map((criterion) => criterion.label),
    specialization: specialization?.subcategory,
    reason: specialization?.reason,
    loadedFramework,
    profile,
    resolvedSpecialization: specialization,
  };
}

export async function buildValidationResearch(
  input: ValidationInput,
  result: DynamicValidationResult
): Promise<ResearchAgentOutput> {
  const specialization = detectValidationSpecialization(input, result);
  const verticalSaasContext =
    specialization?.frameworkName === "vertical_saas_v1"
      ? detectVerticalSaasContext(buildCombinedInputText(input, result))
      : null;
  const researchCategory: Category =
    specialization?.frameworkName === "postpartum_fitness_coaching_v1" ? "health_wellness" : result.category;
  const marketResearch = await conductMarketResearch({
    idea: input.idea,
    category: researchCategory,
    countryCode: result.country.code,
    targetMarket: input.targetMarket,
  });

  const competitorAnalysis = await analyzeCompetitors({
    idea: input.idea,
    category: researchCategory,
    countryCode: result.country.code,
  });

  const competitionNotes = competitorAnalysis.competitors.map((competitor) => {
    const strengths = competitor.strengths.slice(0, 2).join(", ");
    return `${competitor.name}: ${competitor.description}${strengths ? ` Strengths: ${strengths}.` : ""}`;
  });

  const summary: ValidationResearchSummary = {
    demandSignals: unique([
      specialization?.frameworkName === "vertical_saas_v1" && verticalSaasContext
        ? verticalSaasContext.toolType === "crm" || verticalSaasContext.toolType === "workflow"
          ? `Demand depends on whether ${verticalSaasContext.audienceLabel} feel enough pain managing ${verticalSaasContext.workflowLabel} to switch from current tools or manual processes.`
          : `Demand depends on whether ${verticalSaasContext.audienceLabel} feel enough scheduling and client-management pain to switch from current tools or manual workflows.`
        : null,
      specialization?.subcategory === "postpartum_fitness_coaching"
        ? "Demand depends on whether postpartum mothers feel underserved by generic fitness content and want safer guided recovery support."
        : null,
      specialization?.subcategory === "real_estate_agent" && input.location
        ? `Demand depends on the local housing market, financing conditions, and buyer activity in ${input.location}.`
        : null,
      marketResearch.marketSize && !isGenericFiller(`Market signal: ${marketResearch.marketSize}`)
        ? `Market signal: ${marketResearch.marketSize}.`
        : null,
      result.frameworkReport?.problemDemand.keyInsight,
      result.summary.topOpportunities[0],
      input.problem ? `Customer pain described as: ${input.problem}.` : null,
    ], 4),
    competitionNotes: unique([
      specialization?.frameworkName === "vertical_saas_v1" && verticalSaasContext
        ? verticalSaasContext.toolType === "crm" || verticalSaasContext.toolType === "workflow"
          ? `Competition includes existing CRM, project management, and workflow tools, so differentiation must come from ${verticalSaasContext.differentiationLabel}.`
          : `Competition includes incumbent booking and appointment tools, so differentiation must come from ${verticalSaasContext.differentiationLabel}.`
        : null,
      ...competitionNotes,
    ], 4),
    marketTrends: unique([
      specialization?.frameworkName === "vertical_saas_v1" && verticalSaasContext
        ? `Vertical SaaS for ${verticalSaasContext.audienceLabel} works best when it replaces a painful daily workflow without adding setup complexity.`
        : null,
      specialization?.subcategory === "postpartum_fitness_coaching"
        ? "Remote wellness and niche coaching models benefit when moms seek flexible, personalized support outside rigid studio schedules."
        : null,
      specialization?.subcategory === "real_estate_agent"
        ? "Market trend depends on mortgage rates, inventory, and affordability for first-time buyers."
        : null,
      marketResearch.growthTrend !== "unknown" && marketResearch.growthTrend !== "stable"
        ? `Market trend for this niche looks ${marketResearch.growthTrend}.`
        : null,
      marketResearch.opportunities[0],
      marketResearch.threats[0],
    ], 3),
    monetizationNotes: unique([
      specialization?.frameworkName === "vertical_saas_v1" && verticalSaasContext
        ? verticalSaasContext.toolType === "crm" || verticalSaasContext.toolType === "workflow"
          ? `Monetization depends on whether ${verticalSaasContext.audienceLabel} will pay for a simpler, niche-specific tool instead of sticking with generic platforms, spreadsheets, or manual tracking.`
          : `Monetization depends on whether ${verticalSaasContext.audienceLabel} will pay for a simpler, more niche workflow tool instead of sticking with incumbent platforms, spreadsheets, or manual booking.`
        : null,
      specialization?.subcategory === "postpartum_fitness_coaching"
        ? "Monetization depends on whether personalized coaching, accountability, and community justify paid conversion over free postpartum content."
        : null,
      specialization?.subcategory === "real_estate_agent"
        ? "Monetization comes from high-ticket commissions, but revenue arrives only after long trust and transaction cycles."
        : null,
      result.frameworkReport?.businessModelValidation.model
        ? `Primary revenue model: ${result.frameworkReport.businessModelValidation.model}.`
        : null,
      typeof result.frameworkReport?.businessModelValidation.margin === "number"
        ? `Estimated gross margin signal: ${Math.round(result.frameworkReport.businessModelValidation.margin)}%.`
        : null,
      input.pricingIdea ? `Founder pricing hypothesis: ${input.pricingIdea}.` : null,
    ], 4),
    acquisitionChallenges: unique([
      specialization?.frameworkName === "vertical_saas_v1" && verticalSaasContext
        ? `Acquisition depends on reaching ${verticalSaasContext.audienceLabel} through ${verticalSaasContext.acquisitionLabel}.`
        : null,
      specialization?.subcategory === "postpartum_fitness_coaching"
        ? "Acquisition depends on trusted channels such as creator content, mom communities, referrals, and health-adjacent partners."
        : null,
      specialization?.subcategory === "real_estate_agent"
        ? "Acquisition depends on consistent lead generation, trust-building content, and referral or partner channels."
        : null,
      ...(result.failureRisks ?? [])
        .filter((risk) => /acquisition|distribution|reach|customer/i.test(risk.criterion) || /acquisition|reach/i.test(risk.reason))
        .map((risk) => risk.reason),
      ...(result.criteria ?? [])
        .filter((criterion) => /distribution|acquisition|market_access|reach/i.test(criterion.key))
        .flatMap((criterion) => criterion.risks),
      input.targetCustomer ? `Acquisition depends on reaching ${input.targetCustomer}.` : null,
    ], 4),
    differentiationOpportunities: unique([
      specialization?.frameworkName === "vertical_saas_v1" && verticalSaasContext
        ? `Differentiate through ${verticalSaasContext.differentiationLabel} and a faster setup path than generic all-in-one tools.`
        : null,
      specialization?.subcategory === "postpartum_fitness_coaching"
        ? "Differentiate through safety-conscious postpartum guidance, flexible scheduling, accountability, and community support for new moms."
        : null,
      specialization?.subcategory === "real_estate_agent" && specialization.segment === "first_time_homebuyers"
        ? "Own the first-time buyer journey with education, financing guidance, and neighborhood-specific support."
        : null,
      ...competitorAnalysis.gaps,
      ...competitorAnalysis.competitiveAdvantages,
      result.criteria.find((criterion) => /different|moat|niche/i.test(criterion.key))?.recommendations[0],
    ], 4),
    riskFactors: unique([
      specialization?.frameworkName === "vertical_saas_v1" && verticalSaasContext
        ? "Risk rises if switching friction is high, incumbent tools are entrenched, or the MVP expands into feature bloat before the core workflow is proven."
        : null,
      specialization?.subcategory === "postpartum_fitness_coaching"
        ? "Credentials, safety boundaries, liability, and inconsistent retention from overwhelmed new moms raise execution risk."
        : null,
      specialization?.subcategory === "real_estate_agent"
        ? "Brokerage setup, licensing, financing constraints, and long lead-to-close timelines raise execution risk."
        : null,
      ...marketResearch.threats,
      ...result.failureRisks.map((risk) => risk.reason),
      ...result.summary.biggestRisks,
    ], 5),
    sources: unique([
      ...marketResearch.sources,
      specialization?.frameworkName === "vertical_saas_v1" ? "AI framework analysis" : null,
    ], 5),
  };

  const evidenceByArea = buildEvidenceByArea(input, result, summary);
  const coverageScore = Math.round(
    average(
      Object.values(evidenceByArea).map((items) => clamp(listSignalScore(items), 0, 100))
    )
  );

  return {
    summary,
    evidenceByArea,
    coverageScore,
  };
}

export function scoreBusinessValidation(params: {
  input: ValidationInput;
  result: DynamicValidationResult;
  routing: ValidationCategoryRouting;
  framework: FrameworkProfile;
  research: ResearchAgentOutput;
  specialization?: ValidationSpecialization | null;
}): ValidationScoringOutput {
  const { input, result, routing, framework, research, specialization } = params;
  const baseline = baselineScoresFromResult(result);

  const scores: ValidationScoreBreakdown = {
    market_demand: clamp(
      Math.round(
        baseline.market_demand * 0.62 +
          listSignalScore(research.summary.demandSignals) * 0.18 +
          trendScore(research.summary.marketTrends) * 0.1 +
          presenceScore(input.problem, 80, 50) * 0.05 +
          presenceScore(input.targetCustomer, 76, 48) * 0.05
      ),
      0,
      100
    ),
    monetization: clamp(
      Math.round(
        baseline.monetization * 0.62 +
          listSignalScore(research.summary.monetizationNotes) * 0.18 +
          presenceScore(input.pricingIdea, 82, 52) * 0.12 +
          presenceScore(input.offer, 74, 55) * 0.08
      ),
      0,
      100
    ),
    competition: clamp(
      Math.round(
        baseline.competition * 0.58 +
          listSignalScore(research.summary.differentiationOpportunities) * 0.24 +
          (100 - listSignalScore(research.summary.competitionNotes)) * 0.08 +
          presenceScore(input.offer, 74, 54) * 0.1
      ),
      0,
      100
    ),
    acquisition: clamp(
      Math.round(
        baseline.acquisition * 0.58 +
          presenceScore(input.targetCustomer, 80, 45) * 0.14 +
          presenceScore(input.location || input.targetMarket, 76, 46) * 0.12 +
          (100 - listSignalScore(research.summary.acquisitionChallenges)) * 0.16
      ),
      0,
      100
    ),
    execution_feasibility: clamp(
      Math.round(
        baseline.execution_feasibility * 0.58 +
          presenceScore(input.skillSummary, 78, 52) * 0.14 +
          presenceScore(input.budgetUsd, 74, 54) * 0.08 +
          presenceScore(input.timelineDays, 72, 56) * 0.08 +
          presenceScore(result.frameworkReport?.operationalValidation.keyConstraints, 64, 58) * 0.12
      ),
      0,
      100
    ),
    differentiation: clamp(
      Math.round(
        baseline.differentiation * 0.56 +
          listSignalScore(research.summary.differentiationOpportunities) * 0.24 +
          presenceScore(input.offer, 78, 52) * 0.1 +
          presenceScore(input.targetCustomer, 74, 56) * 0.1
      ),
      0,
      100
    ),
    risk: clamp(
      Math.round(
        baseline.risk * 0.7 +
          inputCompleteness(input) * 0.12 +
          research.coverageScore * 0.1 +
          routing.confidence * 0.08
      ),
      0,
      100
    ),
  };

  if (specialization?.scoreAdjustments) {
    for (const [key, adjustment] of Object.entries(specialization.scoreAdjustments) as Array<[ScoreKey, number]>) {
      scores[key] = clamp(scores[key] + adjustment, 0, 100);
    }
  }

  const overallScore = clamp(
    Math.round(
      Object.entries(framework.weights).reduce((total, [key, weight]) => {
        return total + scores[key as ScoreKey] * weight;
      }, 0)
    ),
    0,
    100
  );

  const confidenceScore = clamp(
    Math.round(routing.confidence * 0.5 + inputCompleteness(input) * 0.22 + research.coverageScore * 0.28),
    0,
    100
  );

  const weakestAreas = (Object.entries(scores) as Array<[ScoreKey, number]>)
    .sort((left, right) => left[1] - right[1])
    .slice(0, 3);
  const strongestAreas = (Object.entries(scores) as Array<[ScoreKey, number]>)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);

  const strengths = unique([
    ...(specialization?.strengths ?? []),
    ...strongestAreas.map(([area]) => buildAreaStrength(area, research.evidenceByArea)),
    ...result.summary.topOpportunities,
    ...result.criteria.filter((criterion) => criterion.score >= 4).flatMap((criterion) => criterion.evidence),
  ].filter((s) => s && !isGenericFiller(s)), 4);

  // Cross-section dedup: items in strengths should not appear in weaknesses or risks
  const strengthsSet = new Set(strengths.map((s) => s.toLowerCase().trim()));

  const weaknesses = unique([
    ...(specialization?.weaknesses ?? []),
    ...weakestAreas.map(([area]) => buildAreaWeakness(area, research.evidenceByArea)),
    ...result.criteria.filter((criterion) => criterion.score <= 3).flatMap((criterion) => criterion.risks),
    ...result.missingInfo,
  ].filter((s) => s && !isGenericFiller(s) && !strengthsSet.has(s.toLowerCase().trim())), 5);

  const keyRisks = unique([
    ...(specialization?.keyRisks ?? []),
    ...result.failureRisks.map((risk) => risk.reason),
    ...research.summary.riskFactors,
  ].filter((s) => s && !isGenericFiller(s) && !isActionItemNotRisk(s) && !strengthsSet.has(s.toLowerCase().trim())), 5);

  // Cross-section dedup: assumptions should not duplicate risks
  const risksSet = new Set(keyRisks.map((s) => s.toLowerCase().trim()));

  const assumptionsToTest = unique([
    ...(specialization?.assumptions ?? []),
    ...result.assumptions,
    // Meaningful hypotheses when info is missing
    !input.targetCustomer ? "Narrowing to one specific customer segment will make it easier to win clients and charge higher prices." : null,
    !input.pricingIdea ? "Your target customers will pay enough for this service to sustain healthy margins." : null,
    !input.offer ? "You can define a specific, outcome-based offer that stands out from generic competitors." : null,
  ].filter((s) => s && !isGenericFiller(s) && !isActionItemNotRisk(s) && !risksSet.has(s.toLowerCase().trim())), 5);

  const missingProof = unique([
    ...result.missingInfo,
    // Only add source note if truly no sources found
    research.summary.sources.length === 0 ? "No external market data sources were found for this specific niche." : null,
  ].filter((s) => s && !isGenericFiller(s)), 5);

  const recommendedTests = unique([
    ...(Object.values(specialization?.recommendedTests ?? {})
      .flat()
      .map((item) => fillTemplate(item, input))),
    ...weakestAreas.flatMap(([area]) => framework.recommendedTests[area]?.map((item) => fillTemplate(item, input)) ?? []),
    ...result.criteria.flatMap((criterion) => criterion.recommendations),
    ...result.nextActions,
  ], 5).filter((item) => /interview|test|waitlist|pilot|pre-sell|pricing|landing page|survey|prototype|outreach|ad/i.test(item));
  const recommendedTestsWithFallback = recommendedTests.length
    ? recommendedTests
    : unique(
        [...Object.values(specialization?.recommendedTests ?? {}), ...Object.values(framework.recommendedTests)]
          .flat()
          .filter((item): item is string => typeof item === "string")
          .map((item) => fillTemplate(item, input))
          .filter((candidate) => /interview|test|waitlist|pilot|pre-sell|pricing|landing page|survey|prototype|outreach|ad/i.test(candidate)),
        5
      );

  const recommendedNextSteps = unique([
    ...recommendedTestsWithFallback,
    ...(specialization?.defaultNextSteps ?? []),
    ...weakestAreas.map(([area]) => `Strengthen ${SCORE_LABELS[area]} before expanding scope or spend.`),
    ...framework.defaultNextSteps,
    ...result.nextActions,
  ], 5);

  const finalVerdict = overallScore >= 80
    ? "strong_validation"
    : overallScore >= 65
      ? "promising_but_needs_proof"
      : overallScore >= 50
        ? "risky_requires_refinement"
        : "pivot_or_reposition_recommended";

  return {
    overallScore,
    confidenceScore,
    scores,
    strengths,
    weaknesses,
    keyRisks,
    assumptionsToTest,
    missingProof,
    recommendedTests: recommendedTestsWithFallback,
    recommendedNextSteps,
    finalVerdict,
  };
}

export function buildValidationModelRouting(): ValidationModelRouting {
  return {
    researchModel: getProviderForTask("market_research"),
    reasoningModel: getProviderForTask("business_validation"),
    formatterModel: getProviderForTask("verdict_narrative"),
  };
}

export function buildValidationCtas(locale: Locale): ValidationCta[] {
  return [
    { key: "build_landing_page", label: "Build landing page", href: `/${locale}/website-builder` },
    { key: "create_sprint_plan", label: "Create sprint plan", href: `/${locale}/launch-kit` },
    { key: "improve_idea", label: "Improve idea", href: `/${locale}#validation` },
    { key: "generate_brand_kit", label: "Generate brand kit", href: `/${locale}/brand-kit` },
    { key: "test_pricing", label: "Test pricing", href: `/${locale}/launch-kit` },
    { key: "launch_validation_campaign", label: "Launch validation campaign", href: `/${locale}/waitlist` },
  ];
}
