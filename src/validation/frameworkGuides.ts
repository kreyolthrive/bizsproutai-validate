import type { Category } from "./types";

export type FrameworkGuide = {
  id: string;
  label: string;
  category: Category;
  publicCategory: string;
  subcategory?: string;
  businessModelType?: string;
  criteria: string[];
  cues: string[];
  analysisInstructions: string[];
};

const FRAMEWORK_GUIDES: FrameworkGuide[] = [
  {
    id: "local_service_v1",
    label: "Local Service Framework",
    category: "local_service",
    publicCategory: "local_service",
    businessModelType: "local_service_business",
    criteria: [
      "Local demand",
      "Differentiation",
      "Operational ease",
      "Pricing and profitability",
      "Customer acquisition",
    ],
    cues: ["appointments", "local area", "repeat service", "service delivery"],
    analysisInstructions: [
      "Evaluate whether the business can win locally with a clear offer and repeatable acquisition.",
      "Look for service-area constraints, staffing, trust, and local demand signals.",
    ],
  },
  {
    id: "coaching_consulting_v1",
    label: "Coaching / Consulting Framework",
    category: "consulting",
    publicCategory: "coaching_consulting",
    businessModelType: "expert_service_business",
    criteria: [
      "Niche clarity",
      "Problem value",
      "Market access",
      "Delivery model",
      "Pricing power",
    ],
    cues: ["advisory", "retainer", "specialist", "expertise"],
    analysisInstructions: [
      "Judge the business on niche positioning, expertise, and ability to reach and close qualified clients.",
      "Focus on authority, problem urgency, and delivery economics rather than generic local-service logic.",
    ],
  },
  {
    id: "wellness_coaching_v1",
    label: "Wellness Coaching Framework",
    category: "health_wellness",
    publicCategory: "coaching_wellness_service",
    businessModelType: "remote_coaching_service",
    criteria: [
      "Problem urgency",
      "Trust and credentials",
      "Willingness to pay",
      "Retention and accountability",
      "Acquisition channels",
      "Safety and liability",
      "Differentiation from free content",
    ],
    cues: ["coach", "fitness", "wellness", "nutrition", "virtual"],
    analysisInstructions: [
      "Treat this as a coaching-led health and wellness service, not an education or curriculum business.",
      "Focus on trust, transformation outcomes, retention, safety, and channel fit for a remote coaching model.",
    ],
  },
  {
    id: "postpartum_fitness_coaching_v1",
    label: "Postpartum Fitness Coaching Framework",
    category: "health_wellness",
    publicCategory: "coaching_wellness_service",
    subcategory: "postpartum_fitness_coaching",
    businessModelType: "remote_coaching_digital_service",
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
    cues: ["postpartum", "new moms", "postnatal", "fitness coach", "remote coaching"],
    analysisInstructions: [
      "Treat this as a health and wellness coaching service for new mothers, not edtech.",
      "Evaluate postpartum pain points, trust, safety, credentials, and the practicality of remote coaching for time-constrained moms.",
      "Assess whether community, accountability, and personalized recovery guidance create enough differentiation from free fitness content.",
    ],
  },
  {
    id: "real_estate_agent_v1",
    label: "Real Estate Agent Framework",
    category: "local_service",
    publicCategory: "professional_local_service",
    subcategory: "real_estate_agent",
    businessModelType: "trust_based_high_ticket_local_service",
    criteria: [
      "Local housing demand",
      "Lead generation difficulty",
      "Trust and reputation requirements",
      "Licensing and brokerage setup",
      "Sales-cycle length and conversion to close",
      "Niche strength",
      "Competition from established agents",
      "Education-based acquisition opportunity",
    ],
    cues: ["real estate", "realtor", "homebuyers", "brokerage", "mortgage", "closing"],
    analysisInstructions: [
      "Treat this as a regulated, trust-heavy, high-ticket local professional service, not a generic local service.",
      "Evaluate licensing, brokerage alignment, referrals, lead generation, trust building, financing friction, and local housing dynamics.",
      "If the segment is first-time buyers, assess whether education-first positioning can drive consultations and signed clients.",
    ],
  },
  {
    id: "vertical_saas_v1",
    label: "Vertical SaaS / SMB Software Framework",
    category: "saas",
    publicCategory: "saas",
    subcategory: "vertical_saas",
    businessModelType: "vertical_saas_workflow_software",
    criteria: [
      "Problem urgency for the operator",
      "Willingness to pay for software",
      "Switching friction and migration cost",
      "Workflow depth for the niche",
      "Acquisition channels to SMB operators",
      "Retention and churn risk",
      "Simplicity vs feature bloat",
      "Competitive alternatives in the niche",
    ],
    cues: [
      "software for",
      "app for",
      "booking software",
      "booking app",
      "scheduling software",
      "scheduling app",
      "client management",
      "vertical saas",
      "appointment booking",
      "time slots",
      "confirmation screen",
      "for barber",
      "for salon",
      "for spa",
      "for clinic",
      "for dentist",
      "for local service",
    ],
    analysisInstructions: [
      "CRITICAL: This is a SOFTWARE PRODUCT being built. The business model is SaaS, NOT a local service business.",
      "Separate what is being built (software product) from who it serves (barbers, salons, etc.). The customer segment defines the vertical niche, not the business category.",
      "Evaluate whether the target operators (e.g., barbers) will actually pay monthly for this software instead of using free alternatives or manual methods.",
      "Assess willingness to pay: Do these operators already pay for software? What is their tech adoption level? What is their budget for tools?",
      "Evaluate switching friction: Are operators locked into existing solutions like Square, Acuity, Calendly, or manual booking?",
      "Assess acquisition difficulty: How will you reach these operators? Are they reachable via Instagram, Google, trade associations, or cold outreach?",
      "Evaluate workflow depth: Does the product solve enough daily pain to become sticky, or is it a nice-to-have?",
      "Assess competitive landscape: What existing booking/scheduling tools target this niche? How is this different?",
      "Look for evidence of problem frequency and urgency specific to the niche (e.g., no-shows, double-bookings, manual SMS confirmations).",
      "Do not use local-service logic. This is about selling software TO local services, not operating a local service.",
    ],
  },
  {
    id: "saas_v1",
    label: "SaaS Framework",
    category: "saas",
    publicCategory: "saas",
    businessModelType: "software_subscription",
    criteria: [
      "Problem urgency",
      "Willingness to pay",
      "Retention potential",
      "Acquisition economics",
      "Competitive moat",
    ],
    cues: ["software", "subscription", "workflow", "dashboard"],
    analysisInstructions: [
      "Evaluate recurring software value, retention, and acquisition economics.",
      "Differentiate between a painkiller workflow product and a shallow feature idea.",
    ],
  },
  {
    id: "ecommerce_v1",
    label: "Ecommerce Framework",
    category: "ecommerce",
    publicCategory: "ecommerce",
    businessModelType: "product_business",
    criteria: [
      "Product demand",
      "Margin potential",
      "Differentiation",
      "CAC risk",
      "Inventory or logistics complexity",
    ],
    cues: ["inventory", "shipping", "shop", "product"],
    analysisInstructions: [
      "Evaluate demand, margins, brandability, shipping, and acquisition cost.",
      "Do not use SaaS logic for physical-product businesses.",
    ],
  },
  {
    id: "mobile_web_app_v1",
    label: "Mobile / Web App Framework",
    category: "tech",
    publicCategory: "mobile_web_app",
    businessModelType: "digital_product",
    criteria: [
      "User pain",
      "Adoption path",
      "Technical scope",
      "Differentiation",
      "Monetization path",
    ],
    cues: ["app", "mobile", "web app", "product"],
    analysisInstructions: [
      "Evaluate whether the app solves a sharp enough problem and can be tested without full build-out.",
    ],
  },
  {
    id: "marketplace_v1",
    label: "Marketplace Framework",
    category: "marketplace",
    publicCategory: "marketplace",
    businessModelType: "two_sided_marketplace",
    criteria: [
      "Supply-side difficulty",
      "Demand-side difficulty",
      "Liquidity risk",
      "Trust and safety",
      "Monetization timing",
    ],
    cues: ["buyers", "sellers", "connect", "two-sided"],
    analysisInstructions: [
      "Evaluate both sides of the market and the path to liquidity before praising the idea.",
    ],
  },
];

const FRAMEWORK_GUIDE_BY_ID = new Map(FRAMEWORK_GUIDES.map((guide) => [guide.id, guide]));

const DEFAULT_FRAMEWORK_BY_CATEGORY: Record<Category, string> = {
  ecommerce: "ecommerce_v1",
  coaching: "coaching_consulting_v1",
  consulting: "coaching_consulting_v1",
  finance: "coaching_consulting_v1",
  tech: "mobile_web_app_v1",
  local_service: "local_service_v1",
  saas: "saas_v1",
  marketplace: "marketplace_v1",
  health_wellness: "wellness_coaching_v1",
  edtech: "coaching_consulting_v1",
  legal_law: "coaching_consulting_v1",
};

export function getFrameworkGuideCatalog(): FrameworkGuide[] {
  return FRAMEWORK_GUIDES;
}

export function getFrameworkGuide(id: string | undefined | null): FrameworkGuide | null {
  if (!id) return null;
  return FRAMEWORK_GUIDE_BY_ID.get(id) ?? null;
}

export function getDefaultFrameworkGuideId(category: Category): string {
  return DEFAULT_FRAMEWORK_BY_CATEGORY[category];
}
