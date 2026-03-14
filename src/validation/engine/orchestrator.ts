import type {
  ValidationInput,
  DynamicValidationResult,
  ValidationStatus,
  Locale,
  Category,
  Verdict,
  ScoreBand,
  FrameworkDecision,
  FailureRisk,
  CriterionResult,
  FixSuggestion,
  SimplifiedFrameworkReport,
  SimplifiedGateResult,
} from "../types";
import { ENGINE_VERSION } from "../constants";
import { getDefaultFrameworkGuideId, getFrameworkGuide } from "../frameworkGuides";
import { loadFramework, type LoadedFramework } from "./loadFramework";
import { sortRisksBySeverity } from "./evaluateRisks";
import { suggestAlternatives } from "./suggestAlternatives";
import { triggerBuildFlow } from "./triggerBuildFlow";
import { analyzeBusinessIdeaWithAI, resolveValidationContext } from "./aiValidation";
import { hasInPersonWellnessServiceSignals, hasPhysicalProductSubscriptionSignals, hasVerticalSaasSignals } from "./classifyCategory";

const SCORING_WEIGHTS = {
  problemStrength: 0.3,
  customerValidation: 0.25,
  solutionFit: 0.2,
  marketOpportunity: 0.15,
  businessModel: 0.1,
} as const;

const CATEGORY_MARKET_BASELINES: Record<
  Category,
  {
    tamCustomers: number;
    annualRevenuePerCustomer: number;
    earlyAdopterShare: number;
    obtainableShare: number;
    directCompetitors: string[];
    indirectAlternatives: string[];
  }
> = {
  ecommerce: {
    tamCustomers: 1800000,
    annualRevenuePerCustomer: 420,
    earlyAdopterShare: 0.2,
    obtainableShare: 0.006,
    directCompetitors: ["Amazon", "Shopify brands", "Etsy stores"],
    indirectAlternatives: ["Retail stores", "Facebook Marketplace", "Manual sales"],
  },
  coaching: {
    tamCustomers: 1200000,
    annualRevenuePerCustomer: 960,
    earlyAdopterShare: 0.18,
    obtainableShare: 0.01,
    directCompetitors: ["Independent coaches", "Kajabi creators", "Skool communities"],
    indirectAlternatives: ["YouTube", "Free communities", "Books and courses"],
  },
  consulting: {
    tamCustomers: 850000,
    annualRevenuePerCustomer: 3200,
    earlyAdopterShare: 0.16,
    obtainableShare: 0.012,
    directCompetitors: ["Boutique agencies", "Independent consultants", "Fractional teams"],
    indirectAlternatives: ["In-house teams", "Freelancers", "DIY templates"],
  },
  finance: {
    tamCustomers: 950000,
    annualRevenuePerCustomer: 1100,
    earlyAdopterShare: 0.12,
    obtainableShare: 0.007,
    directCompetitors: ["Legacy banks", "Fintech apps", "Brokerage tools"],
    indirectAlternatives: ["Cash-based systems", "Spreadsheets", "Traditional advisors"],
  },
  tech: {
    tamCustomers: 1500000,
    annualRevenuePerCustomer: 780,
    earlyAdopterShare: 0.2,
    obtainableShare: 0.009,
    directCompetitors: ["Niche SaaS tools", "No-code products", "Productized services"],
    indirectAlternatives: ["Manual workflows", "Google Sheets", "Email + docs"],
  },
  local_service: {
    tamCustomers: 2200000,
    annualRevenuePerCustomer: 540,
    earlyAdopterShare: 0.25,
    obtainableShare: 0.014,
    directCompetitors: ["Local incumbents", "Franchise operators", "Solo providers"],
    indirectAlternatives: ["DIY", "Friends/referrals", "Gig apps"],
  },
  saas: {
    tamCustomers: 1000000,
    annualRevenuePerCustomer: 1200,
    earlyAdopterShare: 0.18,
    obtainableShare: 0.01,
    directCompetitors: ["Vertical SaaS", "Horizontal SaaS", "All-in-one platforms"],
    indirectAlternatives: ["Spreadsheets", "Notion", "Manual admin"],
  },
  marketplace: {
    tamCustomers: 1300000,
    annualRevenuePerCustomer: 860,
    earlyAdopterShare: 0.15,
    obtainableShare: 0.007,
    directCompetitors: ["Vertical marketplaces", "Aggregator apps", "Classified platforms"],
    indirectAlternatives: ["Direct sales", "WhatsApp groups", "Offline brokers"],
  },
  health_wellness: {
    tamCustomers: 1700000,
    annualRevenuePerCustomer: 650,
    earlyAdopterShare: 0.2,
    obtainableShare: 0.01,
    directCompetitors: ["Fitness brands", "Wellness subscriptions", "Local studios"],
    indirectAlternatives: ["Free YouTube workouts", "Gyms", "Self-managed routines"],
  },
  edtech: {
    tamCustomers: 1400000,
    annualRevenuePerCustomer: 390,
    earlyAdopterShare: 0.17,
    obtainableShare: 0.009,
    directCompetitors: ["Course marketplaces", "Bootcamps", "Tutoring platforms"],
    indirectAlternatives: ["Free tutorials", "Peer communities", "Books"],
  },
  legal_law: {
    tamCustomers: 600000,
    annualRevenuePerCustomer: 2100,
    earlyAdopterShare: 0.12,
    obtainableShare: 0.01,
    directCompetitors: ["Law firms", "Legal tech tools", "Compliance services"],
    indirectAlternatives: ["Self-service forms", "Informal advisors", "Template packs"],
  },
};

const CATEGORY_PRICING_BASELINES: Record<
  Category,
  {
    model: string;
    entryPrice: number;
    anchorPrice: number;
    costRatio: number;
  }
> = {
  ecommerce: { model: "Product sales", entryPrice: 39, anchorPrice: 89, costRatio: 0.34 },
  coaching: { model: "Monthly coaching membership", entryPrice: 79, anchorPrice: 249, costRatio: 0.18 },
  consulting: { model: "Retainer consulting", entryPrice: 1500, anchorPrice: 4500, costRatio: 0.24 },
  finance: { model: "Subscription + transaction fees", entryPrice: 49, anchorPrice: 199, costRatio: 0.22 },
  tech: { model: "Subscription", entryPrice: 29, anchorPrice: 99, costRatio: 0.2 },
  local_service: { model: "Service packages", entryPrice: 129, anchorPrice: 399, costRatio: 0.33 },
  saas: { model: "Team subscription", entryPrice: 29, anchorPrice: 99, costRatio: 0.15 },
  marketplace: { model: "Take-rate marketplace", entryPrice: 59, anchorPrice: 199, costRatio: 0.25 },
  health_wellness: { model: "Program membership", entryPrice: 49, anchorPrice: 149, costRatio: 0.21 },
  edtech: { model: "Course + subscription hybrid", entryPrice: 39, anchorPrice: 129, costRatio: 0.2 },
  legal_law: { model: "Advisory packages", entryPrice: 199, anchorPrice: 699, costRatio: 0.27 },
};

const REGION_MARKET_MULTIPLIER: Record<string, number> = {
  north_america: 1,
  europe: 0.9,
  asia: 0.85,
  latin_america: 0.62,
  caribbean: 0.42,
  africa: 0.5,
};

type FrameworkArchetype =
  | "general"
  | "ecommerce_product"
  | "restaurant"
  | "food_truck"
  | "marketing_agency"
  | "saas_product"
  | "local_service_business"
  | "online_education_coaching";

type FrameworkProfile = {
  id: FrameworkArchetype;
  label: string;
  preferredCategory?: Category;
  gate1Threshold: number;
  gate2Threshold: number;
  gate4SomThreshold: number;
  gate4MarginThreshold: number;
  gate5OpsThreshold: number;
  directCompetitors?: string[];
  indirectAlternatives?: string[];
  statusQuo?: string[];
  modelOverride?: string;
  costRatioOverride?: number;
  gate1Signals: {
    painLevel: RegExp[];
    demandFrequency: RegExp[];
    marketCoverage: RegExp[];
    currentGap: RegExp[];
  };
  gate1Boost?: Partial<Record<"painLevel" | "demandFrequency" | "marketCoverage" | "currentGap", number>>;
  gate2Signals: {
    reachability: RegExp[];
    locationFit: RegExp[];
    payerFit: RegExp[];
  };
  gate3Signals: {
    competition: RegExp[];
    differentiation: RegExp[];
  };
  gate4Signals: {
    pricingModel: RegExp[];
    unitEconomics: RegExp[];
    recurringRevenue: RegExp[];
  };
  gate5Signals: {
    operations: RegExp[];
    regulatory: RegExp[];
    execution: RegExp[];
  };
};

const FRAMEWORK_PROFILES: Record<FrameworkArchetype, FrameworkProfile> = {
  general: {
    id: "general",
    label: "General",
    gate1Threshold: 9.5,
    gate2Threshold: 12,
    gate4SomThreshold: 1000000,
    gate4MarginThreshold: 70,
    gate5OpsThreshold: 3,
    gate1Signals: {
      painLevel: [],
      marketCoverage: [],
      currentGap: [],
      demandFrequency: [],
    },
    gate2Signals: {
      reachability: [/linkedin|instagram|google|whatsapp|referral|community/i],
      locationFit: [/city|market|neighborhood|region|target/i],
      payerFit: [/budget|price|pay|retainer|subscription/i],
    },
    gate3Signals: {
      competition: [/competitor|alternative|existing tools|saturated/i],
      differentiation: [/unique|niche|faster|cheaper|premium|local/i],
    },
    gate4Signals: {
      pricingModel: [/subscription|retainer|per job|transaction|membership/i],
      unitEconomics: [/margin|cost|cac|ltv|break-even|profit/i],
      recurringRevenue: [/recurring|repeat|retention|renewal/i],
    },
    gate5Signals: {
      operations: [/team|process|ops|delivery|capacity|timeline/i],
      regulatory: [/license|permit|compliance|inspection|tax/i],
      execution: [/experience|skills|partner|supplier|contingency/i],
    },
  },
  ecommerce_product: {
    id: "ecommerce_product",
    label: "Ecommerce / Physical Product",
    preferredCategory: "ecommerce",
    gate1Threshold: 9.5,
    gate2Threshold: 11,
    gate4SomThreshold: 400000,
    gate4MarginThreshold: 45,
    gate5OpsThreshold: 3,
    directCompetitors: ["DTC brands", "Amazon sellers", "Subscription-box brands"],
    indirectAlternatives: ["Retail stores", "Supermarkets", "Generic marketplaces"],
    statusQuo: ["Buying one-off products online", "Buying from local retail shelves"],
    modelOverride: "Direct-to-consumer ecommerce with repeat purchase or subscription revenue",
    costRatioOverride: 0.38,
    gate1Signals: {
      painLevel: [/convenience|discovery|quality|gift|curation|freshness/i],
      marketCoverage: [/consumers|households|enthusiasts|gift buyers|online shoppers/i],
      currentGap: [/generic options|low quality|hard to find|lack of variety|poor curation/i],
      demandFrequency: [/repeat purchase|subscription|monthly|shipping cadence|churn/i],
    },
    gate1Boost: { painLevel: 0.2, demandFrequency: 0.3 },
    gate2Signals: {
      reachability: [/instagram|tiktok|email|influencers|creators|search/i],
      locationFit: [/shipping|delivery|warehouse|fulfillment|nationwide|cross-border/i],
      payerFit: [/aov|price point|gross margin|willing to pay|giftable/i],
    },
    gate3Signals: {
      competition: [/amazon|shopify brands|subscription boxes|retail alternatives/i],
      differentiation: [/curation|exclusive|origin|premium|brand|packaging|storytelling/i],
    },
    gate4Signals: {
      pricingModel: [/subscription box|monthly box|one-time purchase|bundles|gift subscription/i],
      unitEconomics: [/gross margin|shipping cost|cogs|inventory|repeat purchase|returns/i],
      recurringRevenue: [/subscriptions?|reorders|retention|repeat buyers/i],
    },
    gate5Signals: {
      operations: [/inventory|supplier|roaster|packaging|shipping|fulfillment|ops/i],
      regulatory: [/food safety|labeling|import|customs|shelf life/i],
      execution: [/supplier reliability|forecasting|stockouts|customer support/i],
    },
  },
  restaurant: {
    id: "restaurant",
    label: "Restaurant",
    preferredCategory: "local_service",
    gate1Threshold: 10,
    gate2Threshold: 11.5,
    gate4SomThreshold: 300000,
    gate4MarginThreshold: 55,
    gate5OpsThreshold: 3.2,
    directCompetitors: ["Nearby restaurants (1-3km)", "Same cuisine players", "Delivery-first kitchens"],
    indirectAlternatives: ["Home cooking", "Supermarket prepared food", "Fast food chains"],
    statusQuo: ["Current favorite local spots", "Takeout habits"],
    modelOverride: "Dine-in + takeaway + delivery mix",
    costRatioOverride: 0.42,
    gate1Signals: {
      painLevel: [/lunch|dinner|hungry|quick meal|food near/i],
      marketCoverage: [/office district|residential|campus|tourists|families/i],
      currentGap: [/no good option|limited menu|long wait|poor hygiene/i],
      demandFrequency: [/delivery delays|inconsistent quality|high app fees/i],
    },
    gate1Boost: { painLevel: 0.2, marketCoverage: 0.3 },
    gate2Signals: {
      reachability: [/office workers|families|students|tourists/i],
      locationFit: [/office district|residential|nightlife|mall|foot traffic|rent/i],
      payerFit: [/ticket size|price point|local income|covers/i],
    },
    gate3Signals: {
      competition: [/1-3 km|nearby restaurant|price comparison|delivery-first kitchen/i],
      differentiation: [/faster|healthier|cheaper|premium|cuisine|experience/i],
    },
    gate4Signals: {
      pricingModel: [/dine-in|takeaway|takeout|delivery|app fees/i],
      unitEconomics: [/average ticket|break-even covers|food cost|rent|labor/i],
      recurringRevenue: [/repeat customers|loyalty|catering|subscriptions?/i],
    },
    gate5Signals: {
      operations: [/kitchen|chef|staff|utilities|ingredients|supply chain/i],
      regulatory: [/license|health inspection|food permit|sanitation/i],
      execution: [/f&b experience|restaurant experience|hiring|training/i],
    },
  },
  food_truck: {
    id: "food_truck",
    label: "Food Truck / Street Food",
    preferredCategory: "local_service",
    gate1Threshold: 9.5,
    gate2Threshold: 11,
    gate4SomThreshold: 150000,
    gate4MarginThreshold: 50,
    gate5OpsThreshold: 3,
    directCompetitors: ["Nearby food trucks/stalls", "Street vendors", "Convenience meal options"],
    indirectAlternatives: ["Fast food chains", "Home-packed meals", "Delivery apps"],
    statusQuo: ["Nearby stalls people already trust", "Cafeteria options"],
    modelOverride: "High-turnover street food + event catering",
    costRatioOverride: 0.45,
    gate1Signals: {
      painLevel: [/quick|fast|grab and go|late night/i],
      marketCoverage: [/campus|market|festival|event|nightlife|office zone/i],
      currentGap: [/long line|limited options|expensive meals/i],
      demandFrequency: [/weather|permit|parking|location restrictions/i],
    },
    gate1Boost: { painLevel: 0.4, currentGap: 0.2 },
    gate2Signals: {
      reachability: [/office zones|campus|markets|nightlife|events|festivals/i],
      locationFit: [/breakfast|lunch|late night|rotating spots|mobility/i],
      payerFit: [/street food value|affordable|daily volume|price point/i],
    },
    gate3Signals: {
      competition: [/other trucks|stalls|vendors|nearby options/i],
      differentiation: [/menu|speed|hygiene|branding|digital ordering/i],
    },
    gate4Signals: {
      pricingModel: [/low fixed cost|event catering|street pricing/i],
      unitEconomics: [/daily volume|unit volume|gross margin|food cost/i],
      recurringRevenue: [/event contracts|corporate lunches|repeat spots/i],
    },
    gate5Signals: {
      operations: [/simple menu|prep time|weather backup|lean ops/i],
      regulatory: [/permit|parking|spot permissions?|vendor license/i],
      execution: [/driver|crew|setup time|service speed/i],
    },
  },
  marketing_agency: {
    id: "marketing_agency",
    label: "Marketing Agency / Freelancer",
    preferredCategory: "consulting",
    gate1Threshold: 9.5,
    gate2Threshold: 11.5,
    gate4SomThreshold: 250000,
    gate4MarginThreshold: 60,
    gate5OpsThreshold: 3.2,
    directCompetitors: ["Local agencies", "Freelancers", "In-house marketers"],
    indirectAlternatives: ["DIY marketing", "Template content tools", "Founder-led posting"],
    statusQuo: ["Word-of-mouth client acquisition", "Inconsistent ad spend"],
    modelOverride: "Retainer + project upsell",
    costRatioOverride: 0.3,
    gate1Signals: {
      painLevel: [/need more clients|no leads|low sales|pipeline/i],
      marketCoverage: [/small business|local business|realtor|coach|shop/i],
      currentGap: [/generic agency|poor communication|no results|no reporting/i],
      demandFrequency: [/platform changes|ad account bans|algorithm changes/i],
    },
    gate1Boost: { painLevel: 0.2, currentGap: -0.1 },
    gate2Signals: {
      reachability: [/whatsapp|linkedin|local network|decision-makers/i],
      locationFit: [/restaurants|real estate|coaches|local shops|niche/i],
      payerFit: [/monthly retainers?|retainer|client budget|pay monthly/i],
    },
    gate3Signals: {
      competition: [/agencies|freelancers|in-house|do socials/i],
      differentiation: [/specialization|performance|ads \+ content|funnels|roi/i],
    },
    gate4Signals: {
      pricingModel: [/monthly retainer|project|performance/i],
      unitEconomics: [/clients x|average retainer|target income|margin/i],
      recurringRevenue: [/retainer|upsell|renewal|recurring clients/i],
    },
    gate5Signals: {
      operations: [/copy|design|ads|strategy|capacity|client load/i],
      regulatory: [/platform policy|ad account bans|country restrictions/i],
      execution: [/case study|proof|deliverables|reporting cadence/i],
    },
  },
  saas_product: {
    id: "saas_product",
    label: "SaaS / Software",
    preferredCategory: "saas",
    gate1Threshold: 10.5,
    gate2Threshold: 12,
    gate4SomThreshold: 1000000,
    gate4MarginThreshold: 70,
    gate5OpsThreshold: 3.1,
    directCompetitors: ["Vertical SaaS incumbents", "Horizontal tools", "All-in-one suites"],
    indirectAlternatives: ["Spreadsheets", "Notion/Docs", "Manual workflows"],
    statusQuo: ["Workarounds using multiple tools", "Status quo inertia"],
    modelOverride: "Subscription (per user/account/usage)",
    gate1Signals: {
      painLevel: [/daily workflow|manual process|time-consuming|errors/i],
      marketCoverage: [/teams|operations|finance teams|sales teams|support teams/i],
      currentGap: [/too complex|too expensive|missing integration|poor localization/i],
      demandFrequency: [/churn|onboarding friction|switching cost|compliance/i],
    },
    gate1Boost: { currentGap: 0.2, demandFrequency: 0.2 },
    gate2Signals: {
      reachability: [/icp|role|industry|company size|geography/i],
      locationFit: [/cards|wallets|bank transfer|payment readiness|tech readiness/i],
      payerFit: [/budget owner|buyer|procurement|willing to pay/i],
    },
    gate3Signals: {
      competition: [/existing tools|competitors|incumbents|alternatives/i],
      differentiation: [/localized workflows|language|pricing|offline features|usp/i],
    },
    gate4Signals: {
      pricingModel: [/per user|per account|per transaction|usage-based|subscription/i],
      unitEconomics: [/churn|cac|ltv|payback|gross margin/i],
      recurringRevenue: [/arr|mrr|renewal|expansion/i],
    },
    gate5Signals: {
      operations: [/integration|api|security|data|compliance|infrastructure/i],
      regulatory: [/gdpr|hipaa|data compliance|privacy/i],
      execution: [/self-serve|outbound|reseller|implementation plan/i],
    },
  },
  local_service_business: {
    id: "local_service_business",
    label: "Local Service Business",
    preferredCategory: "local_service",
    gate1Threshold: 9,
    gate2Threshold: 11,
    gate4SomThreshold: 250000,
    gate4MarginThreshold: 45,
    gate5OpsThreshold: 3,
    directCompetitors: ["Local providers", "Independent operators", "Gig workers"],
    indirectAlternatives: ["DIY", "Informal referrals", "Family/friends"],
    statusQuo: ["Existing neighborhood providers", "Irregular service quality"],
    modelOverride: "Per-job + recurring packages",
    costRatioOverride: 0.4,
    gate1Signals: {
      painLevel: [/same day|emergency|urgent|busy professionals/i],
      marketCoverage: [/neighborhood|city|homes|small businesses|families/i],
      currentGap: [/unreliable|late|no-shows|poor quality/i],
      demandFrequency: [/traffic|fuel|staffing|travel radius/i],
    },
    gate1Boost: { painLevel: 0.4, marketCoverage: 0.2 },
    gate2Signals: {
      reachability: [/neighborhood|zone|city|local customers|travel radius/i],
      locationFit: [/traffic|fuel|logistics|distance|service area/i],
      payerFit: [/per job|subscription|recurring clients|margin after travel/i],
    },
    gate3Signals: {
      competition: [/local providers|informal competitors|gig workers/i],
      differentiation: [/reliability|speed|specialization|professionalism|for women by women/i],
    },
    gate4Signals: {
      pricingModel: [/per job|package|maintenance plan|subscription/i],
      unitEconomics: [/supplies|helpers|travel cost|per-job margin|break-even/i],
      recurringRevenue: [/recurring clients|contracts|subscriptions?/i],
    },
    gate5Signals: {
      operations: [/tools|safety|team|hiring|training|capacity/i],
      regulatory: [/license|insurance|permit|legal requirements/i],
      execution: [/founder dependent|small team|standard operating procedures/i],
    },
  },
  online_education_coaching: {
    id: "online_education_coaching",
    label: "Online Education / Coaching",
    preferredCategory: "edtech",
    gate1Threshold: 9.5,
    gate2Threshold: 11.5,
    gate4SomThreshold: 500000,
    gate4MarginThreshold: 65,
    gate5OpsThreshold: 3.1,
    directCompetitors: ["Course creators", "Coaches", "Tutoring platforms"],
    indirectAlternatives: ["YouTube", "MOOCs", "Free communities"],
    statusQuo: ["Self-learning without accountability", "Pirated/free material"],
    modelOverride: "Cohort + course + coaching hybrid",
    costRatioOverride: 0.28,
    gate1Signals: {
      painLevel: [/exam|promotion|income|career switch|weight loss/i],
      marketCoverage: [/students|professionals|parents|job seekers/i],
      currentGap: [/generic course|not localized|no accountability/i],
      demandFrequency: [/drop-off|completion|engagement|low internet/i],
    },
    gate1Boost: { painLevel: 0.2, currentGap: 0.2 },
    gate2Signals: {
      reachability: [/students|parents|professionals|target region|internet access/i],
      locationFit: [/device access|attention span|cultural attitude|local language/i],
      payerFit: [/pricing vs local income|pay for education|cohort seats|hours per week/i],
    },
    gate3Signals: {
      competition: [/youtube|moocs?|free alternatives|local competitors/i],
      differentiation: [/accountability|live sessions|local context|language support/i],
    },
    gate4Signals: {
      pricingModel: [/cohort|1-1 coaching|course|subscription/i],
      unitEconomics: [/seat capacity|hours per week|completion rate|refund risk/i],
      recurringRevenue: [/renewals|upsells|membership|community/i],
    },
    gate5Signals: {
      operations: [/delivery consistency|schedule|tech setup|content production/i],
      regulatory: [/certification|claims|education policy|compliance/i],
      execution: [/creator capacity|content creation time|burnout risk/i],
    },
  },
};

function detectFrameworkProfile(idea: string, category: Category): FrameworkProfile {
  const text = idea.toLowerCase();

  if (hasPhysicalProductSubscriptionSignals(text) || /\bstore|shop|e-?commerce|inventory|shipping|fulfillment|shopify|amazon\b/i.test(text)) {
    return FRAMEWORK_PROFILES.ecommerce_product;
  }

  if (/\bfood truck|street food|kiosk|stall|cart\b/i.test(text)) {
    return FRAMEWORK_PROFILES.food_truck;
  }

  if (/\brestaurant|dine[- ]?in|takeaway|take[- ]?out|cafe|bistro|menu\b/i.test(text)) {
    return FRAMEWORK_PROFILES.restaurant;
  }

  if (/\bagency|freelancer|social media manager|marketing consultant|creative studio\b/i.test(text)) {
    return FRAMEWORK_PROFILES.marketing_agency;
  }

  // Check for vertical SaaS BEFORE generic SaaS or local service
  // This is CRITICAL: software built FOR local service operators is SaaS, not local service
  if (category === "saas") {
    return FRAMEWORK_PROFILES.saas_product;
  }

  if (/\bsaas|software|app|platform|dashboard|api|automation|workflow\b/i.test(text)) {
    return FRAMEWORK_PROFILES.saas_product;
  }

  if (hasInPersonWellnessServiceSignals(text)) {
    return FRAMEWORK_PROFILES.local_service_business;
  }

  if (/\bcourse|cohort|tutoring|bootcamp|online class|exam prep|coaching\b/i.test(text)) {
    if (/\bcoach|coaching|mentor\b/i.test(text)) {
      return {
        ...FRAMEWORK_PROFILES.online_education_coaching,
        preferredCategory: "coaching",
      };
    }
    return FRAMEWORK_PROFILES.online_education_coaching;
  }

  // Only match local service if NOT building software for them
  // "Build app for barber" = SaaS, "I am a barber starting a business" = local service
  if (/\bcleaning|plumbing|detailing|car wash|salon|barber|repair|real estate agent|realtor|homebuyers|tutoring\b/i.test(text)) {
    // Check if this is actually about building software for these operators
    if (!hasVerticalSaasSignals(text)) {
      return FRAMEWORK_PROFILES.local_service_business;
    }
    // If vertical SaaS signals detected, don't fall into local service - will be handled by saas check above
  }

  if (category === "saas") return FRAMEWORK_PROFILES.saas_product;
  if (category === "consulting") return FRAMEWORK_PROFILES.marketing_agency;
  if (category === "local_service") {
    // Double-check it's not vertical SaaS that was miscategorized
    if (!hasVerticalSaasSignals(text)) {
      return FRAMEWORK_PROFILES.local_service_business;
    }
    // If it's actually vertical SaaS, use saas profile
    return FRAMEWORK_PROFILES.saas_product;
  }
  if (category === "health_wellness" && hasInPersonWellnessServiceSignals(text)) {
    return FRAMEWORK_PROFILES.local_service_business;
  }
  if (category === "coaching" || category === "edtech") return FRAMEWORK_PROFILES.online_education_coaching;

  return FRAMEWORK_PROFILES.general;
}

type IdeaComponents = {
  problem: string | null;
  solution: string | null;
  customers: string | null;
  revenue: string | null;
  distribution: string | null;
};

type IdeaClarification = {
  components: IdeaComponents;
  restatement: string;
  missingInfo: string[];
  assumptions: string[];
};

type ProblemDemandResult = {
  painLevel: number;
  marketCoverage: number;
  currentGap: number;
  demandFrequency: number;
  total: number;
  passGate1: boolean;
  keyInsight: string;
  reasoning: string;
};

type CustomerSegment = {
  name: string;
  who: string;
  jobToBeDone: string;
  currentPain: string;
  willingnessToPay: string;
  reachChannels: string[];
  reachability: number;
  painLevel: number;
  payingCapability: number;
  totalScore: number;
};

type CustomerValidationResult = {
  segments: CustomerSegment[];
  primarySegment: CustomerSegment;
  passGate2: boolean;
  gateScore: number;
  reasoning: string;
};

type SolutionValidationResult = {
  painCoverage: number;
  differentiation: number;
  adoptionFriction: number;
  totalScore: number;
  passGate3: boolean;
  reasoning: string;
};

type MarketValidationResult = {
  totalAddressableMarket: number;
  serviceableAddressableMarket: number;
  serviceableObtainableMarket: number;
  confidence: number;
  marketScore: number;
  passGate4: boolean;
  competition: {
    direct: string[];
    indirect: string[];
    statusQuo: string[];
  };
  reasoning: string;
};

type BusinessModelResult = {
  model: string;
  entryPrice: number;
  anchorPrice: number;
  margin: number;
  businessModelScore: number;
  passGate4: boolean;
  reasoning: string;
};

type OperationalFeasibilityResult = {
  score: number;
  passGate5: boolean;
  keyConstraints: string[];
  reasoning: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clampZeroToFive(value: number): number {
  return round1(clamp(value, 0, 5));
}

function toScoreBand(value: number): ScoreBand {
  return clamp(Math.round(value), 1, 5) as ScoreBand;
}

function scoreToVerdict(score: number): Verdict {
  if (score >= 4) return "go";
  if (score >= 3) return "caution";
  return "no-go";
}

function decisionToStatus(decision: FrameworkDecision): ValidationStatus {
  if (decision === "GO") return "GO";
  if (decision === "NO_GO") return "STOP";
  return "FIX";
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function extractProblem(description: string): string | null {
  return firstMatch(description, [
    /(?:solve|fix|address|reduce|eliminate)\s+(.+?)(?:\.|,|;|$)/i,
    /(?:for|who)\s+.+?\s+(?:with|facing|struggling with)\s+(.+?)(?:\.|,|;|$)/i,
    /(?:problem|challenge|pain point)\s*(?:is|:)\s*(.+?)(?:\.|,|;|$)/i,
  ]);
}

function extractSolution(description: string): string | null {
  return firstMatch(description, [
    /^(?:an?|the)\s+(.+?)\s+(?:for|that helps|that|which)/i,
    /(?:build|create|launch|start|offer)\s+(?:an?|the)?\s*(.+?)(?:\.|,|;|$)/i,
    /(?:business|service|platform|app)\s+(?:that|which)?\s*(.+?)(?:\.|,|;|$)/i,
  ]);
}

function extractCustomers(description: string): string | null {
  return firstMatch(description, [
    /(?:for|targeting|helps?)\s+(.+?)(?:\s+(?:with|who|in|to|by)\b|\.|,|;|$)/i,
    /(?:customers?|clients?|users?)\s*(?:are|include|:)?\s*(.+?)(?:\.|,|;|$)/i,
  ]);
}

function extractRevenueModel(description: string): string | null {
  return firstMatch(description, [
    /(?:charge|pricing|subscription|membership|fee|commission|take rate)\s+(.+?)(?:\.|,|;|$)/i,
    /(?:\$\d+[^\s,.;]*)/i,
  ]);
}

function extractDistribution(description: string): string | null {
  return firstMatch(description, [
    /(?:through|via|using|on)\s+(linkedin|instagram|facebook|youtube|tiktok|google ads|seo|email|community)\b/i,
    /(?:discover|acquire|reach)\s+customers\s+(?:through|via)\s+(.+?)(?:\.|,|;|$)/i,
  ]);
}

function clarifyIdea(description: string): IdeaClarification {
  const normalized = description.replace(/\s+/g, " ").trim();

  const components: IdeaComponents = {
    problem: extractProblem(normalized),
    solution: extractSolution(normalized),
    customers: extractCustomers(normalized),
    revenue: extractRevenueModel(normalized),
    distribution: extractDistribution(normalized),
  };

  const missingInfo: string[] = [];

  if (!components.problem) {
    missingInfo.push("What specific problem does this solve?");
  }
  if (!components.customers) {
    missingInfo.push("Who are your target customers?");
  }
  if (!components.solution) {
    missingInfo.push("What is your proposed solution?");
  }
  if (!components.distribution) {
    missingInfo.push("How will customers discover your solution?");
  }

  const assumptions: string[] = [];
  if (!components.problem) {
    assumptions.push("Customers experience this problem often enough to pay for a better solution.");
  }
  if (!components.revenue) {
    assumptions.push("The pricing model can support healthy margins.");
  }
  if (!components.distribution) {
    assumptions.push("There is at least one repeatable channel to reach early adopters.");
  }
  if (assumptions.length === 0) {
    assumptions.push("Customers are willing to switch from current alternatives.");
  }

  const solutionPhrase = components.solution ?? "solution";
  const customerPhrase = components.customers ?? "a clear target customer";
  const problemPhrase = components.problem ?? "a meaningful problem";
  const methodPhrase = components.distribution ?? "a focused delivery method";

  return {
    components,
    restatement: `A ${solutionPhrase} that helps ${customerPhrase} solve ${problemPhrase} by ${methodPhrase}.`,
    missingInfo,
    assumptions,
  };
}

function evaluateProblemDemand(
  idea: string,
  clarification: IdeaClarification,
  profile: FrameworkProfile
): ProblemDemandResult {
  const text = idea.toLowerCase();

  const painSignals = [
    /urgent|critical|immediate|must/i,
    /expensive|costly|losing|wasting|slow/i,
    /frustrat|pain|struggl|stress/i,
    /busy|time-constrained|overwhelmed/i,
  ];
  const lowPainSignals = [/nice to have|someday|maybe|hobby|optional/i];

  const frequencySignals = [
    /daily|every day|every week|constantly|frequent|repeat/i,
    /subscription|recurring|retainer|repeat customers/i,
    /events|lunch rush|dinner rush|peak hours/i,
  ];
  const lowFrequencySignals = [/one-time|rarely|occasional|once in a while/i];

  const coverageSignals = [
    /small business|parents|students|professionals|teams|homeowners|restaurants/i,
    /in\s+[a-z\s]+/i,
    /target/i,
  ];
  const weakCoverageSignals = [/everyone|anyone|all people|for all/i];

  const gapSignals = [
    /not enough|lack|gap|missing/i,
    /too expensive|too complex|slow|manual|spreadsheet/i,
    /no good option|no solution|hard to find/i,
    /inconsistent|unreliable|long wait|poor quality/i,
  ];
  let painLevel = 1;
  painLevel += countMatches(text, painSignals) * 1.1;
  painLevel += countMatches(text, profile.gate1Signals.painLevel) * 0.9;
  if (clarification.components.problem) painLevel += 0.8;
  if (clarification.components.solution && clarification.components.customers) painLevel += 0.5;
  if (hasAny(text, lowPainSignals)) painLevel -= 1.2;
  painLevel += profile.gate1Boost?.painLevel ?? 0;

  let demandFrequency = 1;
  demandFrequency += countMatches(text, frequencySignals) * 1;
  demandFrequency += countMatches(text, profile.gate1Signals.demandFrequency) * 0.9;
  if (clarification.components.problem) demandFrequency += 0.3;
  if (hasAny(text, lowFrequencySignals)) demandFrequency -= 1;
  demandFrequency += profile.gate1Boost?.demandFrequency ?? 0;

  let marketCoverage = 1;
  marketCoverage += countMatches(text, coverageSignals) * 0.8;
  marketCoverage += countMatches(text, profile.gate1Signals.marketCoverage) * 0.9;
  if (clarification.components.customers) marketCoverage += 1;
  if (/in\s+[a-z\s]+|targeting|for\s+[a-z\s]+/i.test(text)) marketCoverage += 0.6;
  if (hasAny(text, weakCoverageSignals)) marketCoverage -= 1;
  marketCoverage += profile.gate1Boost?.marketCoverage ?? 0;

  let currentGap = 1;
  currentGap += countMatches(text, gapSignals) * 1;
  currentGap += countMatches(text, profile.gate1Signals.currentGap) * 1;
  if (clarification.components.solution && /different|unique|specialized|focused|faster|simpler/i.test(text)) {
    currentGap += 0.9;
  }
  if (/already works perfectly|well served/i.test(text)) {
    currentGap -= 1.2;
  }
  currentGap += profile.gate1Boost?.currentGap ?? 0;

  painLevel = clampZeroToFive(painLevel);
  demandFrequency = clampZeroToFive(demandFrequency);
  marketCoverage = clampZeroToFive(marketCoverage);
  currentGap = clampZeroToFive(currentGap);

  const total = round1(painLevel + demandFrequency + marketCoverage + currentGap);
  const passGate1 = total >= profile.gate1Threshold;

  const ranked: Array<[string, number]> = (
    [
      ["Pain level", painLevel] as [string, number],
      ["Demand frequency", demandFrequency] as [string, number],
      ["Market coverage", marketCoverage] as [string, number],
      ["Current gap", currentGap] as [string, number],
    ]
  ).sort((a, b) => b[1] - a[1]);

  const keyInsight =
    ranked[0][1] >= 3
      ? `${ranked[0][0]} and ${ranked[1][0]} are your strongest problem signals.`
      : "Problem signals are weak and need stronger customer evidence.";

  const reasoning = passGate1
    ? `Gate 1 passed on the ${profile.label} framework with strong problem-demand evidence.`
    : `Gate 1 failed on the ${profile.label} framework because problem-demand evidence is below threshold.`;

  return {
    painLevel,
    demandFrequency,
    marketCoverage,
    currentGap,
    total,
    passGate1,
    keyInsight,
    reasoning,
  };
}

function buildSegmentLibrary(
  category: Category,
  customers: string | null,
  locationHint: string | undefined,
  profile: FrameworkProfile
): CustomerSegment[] {
  const location = locationHint?.trim() || "your market";
  const inferred = customers ? customers.replace(/\.$/, "") : "early adopters";

  const archetypeSpecific: Partial<
    Record<Category | FrameworkArchetype, Omit<CustomerSegment, "reachability" | "painLevel" | "payingCapability" | "totalScore">[]>
  > = {
    restaurant: [
      {
        name: `Office workers in ${location}`,
        who: "Workers seeking quick lunch options",
        jobToBeDone: "Get consistent and fast meals during work hours",
        currentPain: "Long wait times or weak value near offices",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Google Maps", "Walk-in visibility", "Delivery apps"],
      },
      {
        name: `Families in ${location}`,
        who: "Families choosing reliable dinner options",
        jobToBeDone: "Eat affordably in a comfortable setting",
        currentPain: "Few quality options at desired price point",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Facebook groups", "Local influencer pages", "Referrals"],
      },
      {
        name: "Tourists and visitors",
        who: "Visitors wanting local cuisine experiences",
        jobToBeDone: "Find memorable food quickly",
        currentPain: "Hard to identify trustworthy spots",
        willingnessToPay: "HIGH",
        reachChannels: ["Google reviews", "TikTok/Instagram", "Hotel referrals"],
      },
    ],
    food_truck: [
      {
        name: `Lunch crowd in ${location}`,
        who: "People needing quick meals in high-traffic zones",
        jobToBeDone: "Buy fast and affordable food without long waits",
        currentPain: "Limited quality grab-and-go options",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Street visibility", "WhatsApp status", "Instagram stories"],
      },
      {
        name: "Event and festival attendees",
        who: "People at events needing convenient food options",
        jobToBeDone: "Eat quickly while staying at the event",
        currentPain: "Overpriced or low-quality event food",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Event organizers", "Geo-targeted posts", "Word of mouth"],
      },
      {
        name: "Late-night buyers",
        who: "Nightlife crowd and shift workers",
        jobToBeDone: "Get reliable food after regular hours",
        currentPain: "Few good options open late",
        willingnessToPay: "LOW",
        reachChannels: ["Location partnerships", "TikTok", "Maps"],
      },
    ],
    marketing_agency: [
      {
        name: "Niche local businesses",
        who: inferred,
        jobToBeDone: "Acquire qualified leads consistently",
        currentPain: "Inconsistent marketing and unclear ROI",
        willingnessToPay: "MEDIUM",
        reachChannels: ["LinkedIn", "WhatsApp intros", "Local business groups"],
      },
      {
        name: "Service founders scaling revenue",
        who: "Founders with some traction but no repeatable funnel",
        jobToBeDone: "Build a predictable client pipeline",
        currentPain: "Random referrals and inconsistent inbound",
        willingnessToPay: "HIGH",
        reachChannels: ["Founder communities", "Partnerships", "Referral loops"],
      },
      {
        name: "Professionals with weak online presence",
        who: "Realtors, coaches, and consultants",
        jobToBeDone: "Convert visibility into booked calls",
        currentPain: "Posting content without conversion",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Instagram DMs", "Email outbound", "LinkedIn"],
      },
    ],
    online_education_coaching: [
      {
        name: "Outcome-driven learners",
        who: inferred,
        jobToBeDone: "Achieve a concrete result quickly",
        currentPain: "Generic courses without accountability",
        willingnessToPay: "MEDIUM",
        reachChannels: ["YouTube", "Community groups", "Webinars"],
      },
      {
        name: "Career switchers and upskillers",
        who: "Adults seeking higher income skills",
        jobToBeDone: "Learn practical skills that improve earnings",
        currentPain: "Too much theory and low completion support",
        willingnessToPay: "HIGH",
        reachChannels: ["LinkedIn", "Bootcamp communities", "Email"],
      },
      {
        name: "Parents/students preparing exams",
        who: "Families paying for measurable learning outcomes",
        jobToBeDone: "Improve exam or school performance",
        currentPain: "Inconsistent tutoring quality",
        willingnessToPay: "MEDIUM",
        reachChannels: ["School groups", "Local communities", "WhatsApp"],
      },
    ],
  };

  const profileSegments = archetypeSpecific[profile.id];
  if (profileSegments && profileSegments.length > 0) {
    return profileSegments.map((segment) => ({
      ...segment,
      reachability: 0,
      painLevel: 0,
      payingCapability: 0,
      totalScore: 0,
    }));
  }

  const defaults: Record<Category, Omit<CustomerSegment, "reachability" | "painLevel" | "payingCapability" | "totalScore">[]> = {
    ecommerce: [
      {
        name: `Niche buyers (${inferred})`,
        who: inferred,
        jobToBeDone: "Buy a better-fit product with less search effort",
        currentPain: "Generic stores do not match their exact needs",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Instagram", "TikTok", "Search"],
      },
      {
        name: "Repeat buyers",
        who: "Customers with recurring product needs",
        jobToBeDone: "Reorder quickly from trusted brands",
        currentPain: "Inconsistent quality and shipping issues",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Email", "SMS", "Retargeting"],
      },
      {
        name: "Gift purchasers",
        who: "People buying for others",
        jobToBeDone: "Find relevant gifts fast",
        currentPain: "Too many options and unclear quality",
        willingnessToPay: "LOW",
        reachChannels: ["Pinterest", "Search", "Influencers"],
      },
    ],
    coaching: [
      {
        name: "Outcome-focused clients",
        who: inferred,
        jobToBeDone: "Reach a specific transformation with accountability",
        currentPain: "Free content lacks structure and accountability",
        willingnessToPay: "MEDIUM",
        reachChannels: ["LinkedIn", "Instagram", "Community referrals"],
      },
      {
        name: "Corporate professionals",
        who: "Managers and leaders needing performance support",
        jobToBeDone: "Improve leadership and outcomes",
        currentPain: "No personalized coaching support",
        willingnessToPay: "HIGH",
        reachChannels: ["LinkedIn", "Podcasts", "Partnerships"],
      },
      {
        name: "Group program participants",
        who: "People seeking affordable coaching",
        jobToBeDone: "Get guided support in a peer setting",
        currentPain: "One-on-one coaching is expensive",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Webinars", "Email", "Online communities"],
      },
    ],
    consulting: [
      {
        name: "SMB decision makers",
        who: inferred,
        jobToBeDone: "Fix business bottlenecks with expert guidance",
        currentPain: "Lack internal expertise and execution clarity",
        willingnessToPay: "HIGH",
        reachChannels: ["LinkedIn", "Referrals", "Industry groups"],
      },
      {
        name: "Growth-stage founders",
        who: "Founders with early traction",
        jobToBeDone: "Scale operations without breaking quality",
        currentPain: "Team constraints and strategic blind spots",
        willingnessToPay: "HIGH",
        reachChannels: ["Founder communities", "Podcasts", "Events"],
      },
      {
        name: "Ops leaders",
        who: "Operators responsible for delivery",
        jobToBeDone: "Standardize process and improve performance",
        currentPain: "Fragmented systems and ad hoc workflows",
        willingnessToPay: "MEDIUM",
        reachChannels: ["LinkedIn", "Partner agencies", "Newsletters"],
      },
    ],
    finance: [
      {
        name: "Underserved consumers",
        who: inferred,
        jobToBeDone: "Access safer and clearer financial tools",
        currentPain: "High fees, low trust, poor guidance",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Influencers", "Search", "Community partnerships"],
      },
      {
        name: "Small business owners",
        who: "Owners needing better cashflow tools",
        jobToBeDone: "Manage money and decisions faster",
        currentPain: "Manual bookkeeping and fragmented systems",
        willingnessToPay: "HIGH",
        reachChannels: ["Accountant referrals", "LinkedIn", "Local business groups"],
      },
      {
        name: "New-to-finance users",
        who: "People with low confidence in financial products",
        jobToBeDone: "Learn and act with confidence",
        currentPain: "Complex products and poor onboarding",
        willingnessToPay: "LOW",
        reachChannels: ["YouTube", "Community orgs", "Email"],
      },
    ],
    tech: [
      {
        name: `Operational teams (${inferred})`,
        who: inferred,
        jobToBeDone: "Automate a repeated workflow",
        currentPain: "Manual repetitive work and tool sprawl",
        willingnessToPay: "MEDIUM",
        reachChannels: ["LinkedIn", "Product Hunt", "Communities"],
      },
      {
        name: "Founder-led teams",
        who: "Small startup teams",
        jobToBeDone: "Move faster with less overhead",
        currentPain: "Time wasted across disconnected tools",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Twitter/X", "Slack groups", "Cold outbound"],
      },
      {
        name: "Ops freelancers",
        who: "Freelancers delivering repeatable services",
        jobToBeDone: "Standardize and speed up delivery",
        currentPain: "Too much manual back-office work",
        willingnessToPay: "LOW",
        reachChannels: ["Upwork", "LinkedIn", "Creator communities"],
      },
    ],
    local_service: [
      {
        name: `${inferred} in ${location}`,
        who: inferred,
        jobToBeDone: "Get reliable local service without hassle",
        currentPain: "Unreliable providers and inconsistent quality",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Google Business", "Local Facebook groups", "Referrals"],
      },
      {
        name: "Property managers",
        who: "Managers with recurring service needs",
        jobToBeDone: "Maintain units consistently and quickly",
        currentPain: "Hard to find dependable vendors",
        willingnessToPay: "HIGH",
        reachChannels: ["Local networking", "Direct outreach", "Partnerships"],
      },
      {
        name: "Busy professionals",
        who: "Time-constrained households",
        jobToBeDone: "Outsource recurring tasks with trust",
        currentPain: "Limited time and inconsistent provider quality",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Neighborhood apps", "Google Maps", "Instagram"],
      },
    ],
    saas: [
      {
        name: `SMB teams (${inferred})`,
        who: inferred,
        jobToBeDone: "Solve one painful workflow in one place",
        currentPain: "Existing software is overbuilt or fragmented",
        willingnessToPay: "MEDIUM",
        reachChannels: ["LinkedIn", "Search", "Partner channels"],
      },
      {
        name: "Agency operators",
        who: "Agencies managing many client projects",
        jobToBeDone: "Increase delivery speed and consistency",
        currentPain: "Too much context switching and manual updates",
        willingnessToPay: "HIGH",
        reachChannels: ["Communities", "Webinars", "Outbound"],
      },
      {
        name: "Solo founders",
        who: "Operators wanting leverage",
        jobToBeDone: "Run operations with fewer tools",
        currentPain: "Complex stacks are expensive and slow",
        willingnessToPay: "LOW",
        reachChannels: ["Indie communities", "Twitter/X", "Product directories"],
      },
    ],
    marketplace: [
      {
        name: `Supply providers (${inferred})`,
        who: inferred,
        jobToBeDone: "Find demand reliably with less marketing effort",
        currentPain: "Inconsistent lead flow and low trust channels",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Industry communities", "Partner networks", "Direct outreach"],
      },
      {
        name: "Demand-side buyers",
        who: "Buyers seeking vetted options",
        jobToBeDone: "Choose quickly with confidence",
        currentPain: "Quality uncertainty and search overload",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Search", "Content", "SEO"],
      },
      {
        name: "Power users",
        who: "Frequent transactors in the category",
        jobToBeDone: "Save time and reduce transaction risk",
        currentPain: "Low trust and poor matching",
        willingnessToPay: "HIGH",
        reachChannels: ["Referral loops", "Email", "CRM"],
      },
    ],
    health_wellness: [
      {
        name: `Health-focused consumers (${inferred})`,
        who: inferred,
        jobToBeDone: "Improve health outcomes consistently",
        currentPain: "Fragmented advice and low accountability",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Instagram", "YouTube", "Community groups"],
      },
      {
        name: "Program completers",
        who: "People who pay for structure and support",
        jobToBeDone: "Follow a clear plan with accountability",
        currentPain: "Most plans are generic and hard to sustain",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Email", "Partnerships", "Webinars"],
      },
      {
        name: "Corporate wellness buyers",
        who: "Employers offering wellness benefits",
        jobToBeDone: "Improve employee wellbeing and retention",
        currentPain: "Low engagement in current programs",
        willingnessToPay: "HIGH",
        reachChannels: ["LinkedIn", "HR networks", "B2B partnerships"],
      },
    ],
    edtech: [
      {
        name: `Skill-seeking learners (${inferred})`,
        who: inferred,
        jobToBeDone: "Gain a practical skill fast",
        currentPain: "Courses are long and outcomes are unclear",
        willingnessToPay: "MEDIUM",
        reachChannels: ["YouTube", "Search", "Communities"],
      },
      {
        name: "Career switchers",
        who: "Adults needing proof of job-ready skills",
        jobToBeDone: "Transition careers with confidence",
        currentPain: "Too much theory and little real-world guidance",
        willingnessToPay: "HIGH",
        reachChannels: ["LinkedIn", "Bootcamp communities", "Newsletter sponsorships"],
      },
      {
        name: "Institutional buyers",
        who: "Schools and training centers",
        jobToBeDone: "Improve completion and outcomes",
        currentPain: "Low student engagement and completion",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Partnerships", "Conferences", "Direct outreach"],
      },
    ],
    legal_law: [
      {
        name: `SMB legal clients (${inferred})`,
        who: inferred,
        jobToBeDone: "Resolve legal needs with clarity and speed",
        currentPain: "Legal help feels expensive and confusing",
        willingnessToPay: "HIGH",
        reachChannels: ["Referrals", "Local networks", "Search"],
      },
      {
        name: "Compliance-sensitive teams",
        who: "Teams with recurring regulatory obligations",
        jobToBeDone: "Stay compliant without excessive overhead",
        currentPain: "Rules are complex and changing",
        willingnessToPay: "HIGH",
        reachChannels: ["LinkedIn", "Industry associations", "Partner channels"],
      },
      {
        name: "Early-stage founders",
        who: "Founders setting up legal foundations",
        jobToBeDone: "Set up legal basics quickly",
        currentPain: "Unclear legal priorities and sequencing",
        willingnessToPay: "MEDIUM",
        reachChannels: ["Founder communities", "Accelerators", "Content"],
      },
    ],
  };

  return defaults[category].map((segment) => ({
    ...segment,
    reachability: 0,
    painLevel: 0,
    payingCapability: 0,
    totalScore: 0,
  }));
}

function scoreWillingness(level: string): number {
  if (level === "HIGH") return 4.5;
  if (level === "MEDIUM") return 3.5;
  return 2.5;
}

function analyzeCustomerSegments(
  input: ValidationInput,
  category: Category,
  problemDemand: ProblemDemandResult,
  clarification: IdeaClarification,
  gate1Passed: boolean,
  profile: FrameworkProfile
): CustomerValidationResult {
  const segments = buildSegmentLibrary(category, clarification.components.customers, input.location, profile);

  const text = input.idea.toLowerCase();
  const channelSignals = [/linkedin|instagram|facebook|youtube|tiktok|google|seo|community|email|referral/i];
  const b2bSignals = /b2b|business|companies|teams|agency|enterprise/i.test(text);

  const scoredSegments = segments.map((segment) => {
    let reachability = 2;
    reachability += Math.min(2, segment.reachChannels.length / 2);
    if (hasAny(text, channelSignals)) reachability += 0.7;
    reachability += countMatches(text, profile.gate2Signals.reachability) * 0.3;
    reachability += countMatches(text, profile.gate2Signals.locationFit) * 0.25;
    if (/local|miami|atlanta|brooklyn|city|neighborhood|district|market/i.test(text) && category === "local_service") {
      reachability += 0.5;
    }
    if (/whatsapp|google maps|referral|walk-in/i.test(text) && profile.id === "local_service_business") {
      reachability += 0.4;
    }
    if (/festival|event|campus|nightlife/i.test(text) && profile.id === "food_truck") {
      reachability += 0.5;
    }

    const painLevel = clampZeroToFive(
      (problemDemand.painLevel + problemDemand.demandFrequency) / 2 + (gate1Passed ? 0.3 : -0.7)
    );

    let payingCapability = scoreWillingness(segment.willingnessToPay);
    if (b2bSignals) payingCapability += 0.3;
    payingCapability += countMatches(text, profile.gate2Signals.payerFit) * 0.35;
    if (/niche|for .*?(realtors|restaurants|coaches|lawyers)/i.test(text) && profile.id === "marketing_agency") {
      payingCapability += 0.4;
    }

    reachability = clampZeroToFive(reachability);
    payingCapability = clampZeroToFive(payingCapability);

    const totalScore = round1(reachability + painLevel + payingCapability);

    return {
      ...segment,
      reachability,
      painLevel,
      payingCapability,
      totalScore,
    };
  });

  const ranked = scoredSegments.sort((a, b) => b.totalScore - a.totalScore);
  const primarySegment = ranked[0];
  const passGate2 = primarySegment.totalScore >= profile.gate2Threshold;
  const gateScore = clampZeroToFive(primarySegment.totalScore / 3);
  const reasoning = passGate2
    ? `Gate 2 passed on the ${profile.label} framework because the primary segment is reachable, painful, and willing to pay.`
    : `Gate 2 failed on the ${profile.label} framework because the best segment is still weak on reachability, pain intensity, or payment strength.`;

  return {
    segments: ranked,
    primarySegment,
    passGate2,
    gateScore,
    reasoning,
  };
}

function validateSolutionFit(
  input: ValidationInput,
  clarification: IdeaClarification,
  problemDemand: ProblemDemandResult,
  customerValidation: CustomerValidationResult,
  categoryConfidence: number,
  profile: FrameworkProfile
): SolutionValidationResult {
  const text = input.idea.toLowerCase();

  let painCoverage = 0.8;
  if (clarification.components.problem) painCoverage += 1.3;
  if (clarification.components.solution) painCoverage += 1.3;
  if (clarification.components.customers) painCoverage += 0.8;
  painCoverage += clamp((problemDemand.painLevel + problemDemand.demandFrequency) / 10, 0, 1);
  if (/specific|clear offer|single service|focused package/i.test(text)) painCoverage += 0.4;
  if (profile.id === "food_truck" && /simple menu|limited menu|high traffic|events?/i.test(text)) painCoverage += 0.4;
  if (profile.id === "restaurant" && /cuisine|price point|experience|delivery/i.test(text)) painCoverage += 0.4;
  if (profile.id === "marketing_agency" && /niche|industry-specific|lead generation|performance/i.test(text)) painCoverage += 0.4;
  if (profile.id === "online_education_coaching" && /outcome|accountability|live|cohort|exam/i.test(text)) {
    painCoverage += 0.4;
  }
  painCoverage += countMatches(text, profile.gate3Signals.competition) * 0.15;
  painCoverage += countMatches(text, profile.gate3Signals.differentiation) * 0.25;

  let differentiation = 1;
  if (/unique|different|specialized|focused|niche|local-first|faster|simpler/i.test(text)) differentiation += 1.4;
  if (problemDemand.currentGap >= 3) differentiation += 1.1;
  if (categoryConfidence >= 0.7) differentiation += 0.4;
  if (/like amazon|like uber|like facebook/i.test(text)) differentiation -= 1;
  if (profile.id === "saas_product" && /localized|payment methods|offline|language/i.test(text)) differentiation += 0.5;
  if (profile.id === "local_service_business" && /reliable|same-day|certified|for women by women/i.test(text)) {
    differentiation += 0.4;
  }
  differentiation += countMatches(text, profile.gate3Signals.differentiation) * 0.35;
  if (countMatches(text, profile.gate3Signals.competition) > 0) differentiation += 0.2;

  let adoptionFriction = 2.2;
  if (/license|compliance|hardware|multi-sided|complex integration|regulatory/i.test(text)) adoptionFriction += 1.2;
  if (/manual onboarding|custom setup|long setup/i.test(text)) adoptionFriction += 0.8;
  if (/no-code|simple|plug and play|done-for-you|mobile/i.test(text)) adoptionFriction -= 0.7;
  if (customerValidation.primarySegment.reachability >= 4) adoptionFriction -= 0.2;
  if (profile.id === "food_truck" && /permit|parking|weather/i.test(text)) adoptionFriction += 0.5;
  if (profile.id === "restaurant" && /licenses?|utilities|inspection/i.test(text)) adoptionFriction += 0.4;
  if (profile.id === "marketing_agency" && /solo|freelancer/i.test(text)) adoptionFriction += 0.2;
  if (profile.id === "online_education_coaching" && /low internet|device access|drop off/i.test(text)) {
    adoptionFriction += 0.5;
  }

  painCoverage = clampZeroToFive(painCoverage);
  differentiation = clampZeroToFive(differentiation);
  adoptionFriction = clampZeroToFive(adoptionFriction);

  const totalScore = round1((painCoverage + differentiation + (5 - adoptionFriction)) / 3);
  const passGate3 = painCoverage >= 3 && differentiation >= 3;

  const reasoning = passGate3
    ? `Gate 3 passed on the ${profile.label} framework because the solution covers major pains and has clear differentiation.`
    : `Gate 3 failed on the ${profile.label} framework because pain coverage or differentiation is below the minimum threshold.`;

  return {
    painCoverage,
    differentiation,
    adoptionFriction,
    totalScore,
    passGate3,
    reasoning,
  };
}

function analyzeMarket(
  category: Category,
  countryRegion: string,
  customerValidation: CustomerValidationResult,
  solutionValidation: SolutionValidationResult,
  profile: FrameworkProfile
): MarketValidationResult {
  const baseline = CATEGORY_MARKET_BASELINES[category];
  const regionMultiplier = REGION_MARKET_MULTIPLIER[countryRegion] ?? 0.7;

  const tam = Math.round(baseline.tamCustomers * baseline.annualRevenuePerCustomer * regionMultiplier);

  const segmentStrength = clamp(customerValidation.primarySegment.totalScore / 15, 0.2, 1);
  const sam = Math.round(tam * baseline.earlyAdopterShare * segmentStrength);

  const obtainBoost = (customerValidation.primarySegment.reachability >= 4 ? 0.002 : 0) +
    (solutionValidation.differentiation >= 4 ? 0.002 : 0);
  const somShare = baseline.obtainableShare + obtainBoost;
  const som = Math.round(sam * somShare);

  const confidence = clampZeroToFive(2.5 + segmentStrength * 1.4 + (solutionValidation.differentiation >= 3 ? 0.6 : -0.4));

  let marketScore = 1;
  const thresholdRatio = som / profile.gate4SomThreshold;
  if (thresholdRatio >= 2.5) marketScore = 5;
  else if (thresholdRatio >= 1) marketScore = 4;
  else if (thresholdRatio >= 0.6) marketScore = 3;
  else if (thresholdRatio >= 0.3) marketScore = 2;

  marketScore = clampZeroToFive(marketScore + (solutionValidation.differentiation >= 4 ? 0.4 : 0));

  const passGate4 = som >= profile.gate4SomThreshold;
  const reasoning = passGate4
    ? `Gate 4 passed on the ${profile.label} framework because Serviceable Obtainable Market exceeds ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(profile.gate4SomThreshold)}.`
    : `Gate 4 failed on the ${profile.label} framework because obtainable market is below ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(profile.gate4SomThreshold)}; tighten niche or pricing model.`;

  return {
    totalAddressableMarket: tam,
    serviceableAddressableMarket: sam,
    serviceableObtainableMarket: som,
    confidence,
    marketScore,
    passGate4,
    competition: {
      direct: profile.directCompetitors ?? baseline.directCompetitors,
      indirect: profile.indirectAlternatives ?? baseline.indirectAlternatives,
      statusQuo: profile.statusQuo ?? ["Manual workflows", "Spreadsheets", "Status quo behavior"],
    },
    reasoning,
  };
}

function parsePriceFromIdea(idea: string): number | null {
  const normalized = idea.replace(/,/g, "");
  const match = normalized.match(/\$\s*(\d+(?:\.\d+)?)/i) ?? normalized.match(/(\d+(?:\.\d+)?)\s*(?:usd|dollars|\/month|per month|monthly)/i);
  if (!match?.[1]) return null;
  const value = Number.parseFloat(match[1]);
  if (Number.isNaN(value) || value <= 0) return null;
  return value;
}

function analyzeBusinessModel(
  category: Category,
  input: ValidationInput,
  problemDemand: ProblemDemandResult,
  profile: FrameworkProfile
): BusinessModelResult {
  const baseline = CATEGORY_PRICING_BASELINES[category];
  const parsedPrice = parsePriceFromIdea(input.idea);

  const entryPrice = parsedPrice ?? baseline.entryPrice;
  const anchorPrice = Math.max(entryPrice * 2.2, baseline.anchorPrice);
  const costRatio = profile.costRatioOverride ?? baseline.costRatio;
  const estimatedCost = entryPrice * costRatio;
  const margin = Math.round(((entryPrice - estimatedCost) / entryPrice) * 100);

  const estimatedValue = Math.max(
    80,
    Math.round(120 + problemDemand.painLevel * 80 + problemDemand.demandFrequency * 60)
  );
  const valueCapture = (entryPrice / estimatedValue) * 100;

  let businessModelScore = 1;
  if (margin >= profile.gate4MarginThreshold + 20) businessModelScore = 5;
  else if (margin >= profile.gate4MarginThreshold + 10) businessModelScore = 4;
  else if (margin >= profile.gate4MarginThreshold) businessModelScore = 3;
  else if (margin >= profile.gate4MarginThreshold - 10) businessModelScore = 2;

  const text = input.idea.toLowerCase();
  businessModelScore += countMatches(text, profile.gate4Signals.pricingModel) * 0.2;
  businessModelScore += countMatches(text, profile.gate4Signals.unitEconomics) * 0.3;
  businessModelScore += countMatches(text, profile.gate4Signals.recurringRevenue) * 0.2;

  if (valueCapture >= 3 && valueCapture <= 15) businessModelScore += 0.5;
  if (valueCapture > 30) businessModelScore -= 0.6;

  businessModelScore = clampZeroToFive(businessModelScore);

  const passGate4 = margin >= profile.gate4MarginThreshold && businessModelScore >= 2.8;
  const reasoning = passGate4
    ? `Gate 4 passed on the ${profile.label} framework because the unit economics are viable and margin clears ${profile.gate4MarginThreshold}%.`
    : `Gate 4 failed on the ${profile.label} framework because unit economics are not yet strong enough; tighten pricing, costs, and revenue model.`;

  return {
    model: profile.modelOverride ?? baseline.model,
    entryPrice: Math.round(entryPrice),
    anchorPrice: Math.round(anchorPrice),
    margin,
    businessModelScore,
    passGate4,
    reasoning,
  };
}

function evaluateOperationalFeasibility(
  input: ValidationInput,
  profile: FrameworkProfile
): OperationalFeasibilityResult {
  const text = input.idea.toLowerCase();

  let score = 1.6;
  score += countMatches(text, profile.gate5Signals.operations) * 0.5;
  score += countMatches(text, profile.gate5Signals.execution) * 0.4;

  const regulatoryHits = countMatches(text, profile.gate5Signals.regulatory);
  if (regulatoryHits > 0) {
    score += 0.3;
  }

  if (/team|hiring|staff|partner|supplier|process|sop|plan/i.test(text)) {
    score += 0.5;
  }

  if (/license|permit|inspection|compliance|insurance|legal/i.test(text)) {
    score += 0.4;
  }

  if (/weather|traffic|fuel|delivery delays|low internet|device access|integration/i.test(text)) {
    score -= 0.4;
  }

  if (/solo|alone|myself only/i.test(text)) {
    score -= 0.3;
  }

  score = clampZeroToFive(score);
  const passGate5 = score >= profile.gate5OpsThreshold;

  const keyConstraints: string[] = [];
  if (!/license|permit|inspection|compliance|insurance|legal/i.test(text)) {
    keyConstraints.push("Regulatory and permit path is still unclear.");
  }
  if (!/team|partner|supplier|staff|hiring|training|process|sop/i.test(text)) {
    keyConstraints.push("Execution capacity and operating process need definition.");
  }
  if (/weather|traffic|fuel|low internet|integration|compliance/i.test(text)) {
    keyConstraints.push("Local operating constraints are present and need mitigation.");
  }

  const reasoning = passGate5
    ? `Gate 5 passed on the ${profile.label} framework with sufficient operational readiness.`
    : `Gate 5 failed on the ${profile.label} framework because operational feasibility is below threshold.`;

  return {
    score,
    passGate5,
    keyConstraints: keyConstraints.slice(0, 3),
    reasoning,
  };
}

function mapCriterionScore(
  key: string,
  componentScores: {
    problemStrength: number;
    customerValidation: number;
    solutionFit: number;
    marketOpportunity: number;
    businessModel: number;
  }
): number {
  if (/demand|problem|willingness/.test(key)) {
    return (componentScores.problemStrength + componentScores.customerValidation) / 2;
  }

  if (/differentiation|offer|trust|service_scope|content|mvp|technical|outcome/.test(key)) {
    return componentScores.solutionFit;
  }

  if (/operations|distribution|acquisition|retention|network|engagement|capacity|ops/.test(key)) {
    return (componentScores.customerValidation + componentScores.solutionFit) / 2;
  }

  if (/pricing|economics|monetization|take_rate|unit/.test(key)) {
    return componentScores.businessModel;
  }

  if (/regulatory|compliance/.test(key)) {
    return Math.max(1.5, componentScores.solutionFit - 0.4);
  }

  return (
    componentScores.problemStrength +
    componentScores.customerValidation +
    componentScores.solutionFit +
    componentScores.marketOpportunity +
    componentScores.businessModel
  ) / 5;
}

function buildCriteria(
  framework: LoadedFramework,
  componentScores: {
    problemStrength: number;
    customerValidation: number;
    solutionFit: number;
    marketOpportunity: number;
    businessModel: number;
  },
  gateResults: SimplifiedGateResult[]
): CriterionResult[] {
  return framework.criteria.map((criterionDef) => {
    const mapped = mapCriterionScore(criterionDef.key.toLowerCase(), componentScores);
    const scoreBand = toScoreBand(mapped);

    const strongestGate = gateResults
      .filter((gate) => gate.passed)
      .sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)[0];

    const evidence = strongestGate
      ? [`${strongestGate.name} supports this criterion.`]
      : ["Additional validation evidence is required."];

    const risks = scoreBand <= 2 ? [`${criterionDef.label} is currently weak.`] : [];

    const recommendations = scoreBand <= 2
      ? criterionDef.fixSuggestions.slice(0, 2)
      : criterionDef.fixSuggestions.slice(0, 1);

    return {
      key: criterionDef.key,
      label: criterionDef.label,
      weight: criterionDef.weight,
      score: scoreBand,
      evidence,
      risks,
      recommendations,
    };
  });
}

function severityFromGate(gate: SimplifiedGateResult): FailureRisk["severity"] {
  if (gate.gate === 1 || gate.gate === 4) return "critical";
  if (gate.gate === 2 || gate.gate === 3) return "high";
  return "medium";
}

function buildFailureRisks(
  gateResults: SimplifiedGateResult[],
  criteria: CriterionResult[]
): FailureRisk[] {
  const risks: FailureRisk[] = [];

  for (const gate of gateResults) {
    if (gate.status === "FAIL") {
      risks.push({
        criterion: `gate_${gate.gate}`,
        score: toScoreBand(Math.max(1, gate.score)),
        reason: `${gate.name}: ${gate.reasoning}`,
        severity: severityFromGate(gate),
      });
    }
  }

  for (const criterion of criteria) {
    if (criterion.score <= 2) {
      risks.push({
        criterion: criterion.key,
        score: criterion.score,
        reason: `${criterion.label} needs work: ${criterion.recommendations[0] ?? "Add more validation evidence."}`,
        severity: criterion.score <= 1 ? "high" : "medium",
      });
    }
  }

  const deduped: FailureRisk[] = [];
  const seen = new Set<string>();
  for (const risk of risks) {
    const key = `${risk.criterion}:${risk.reason}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(risk);
  }

  return sortRisksBySeverity(deduped).slice(0, 8);
}

function buildFixes(
  gateResults: SimplifiedGateResult[],
  criteria: CriterionResult[],
  profile: FrameworkProfile
): FixSuggestion[] {
  const fixes: FixSuggestion[] = [];

  for (const gate of gateResults) {
    if (gate.status !== "FAIL") continue;

    if (gate.gate === 1) {
      fixes.push({
        issue: "Problem strength is weak",
        action: "Interview 10 target customers and quantify urgency, frequency, and current workaround pain.",
        expectedImpact: "Improves problem-demand evidence and reduces false positives.",
      });
    } else if (gate.gate === 2) {
      fixes.push({
        issue: "Customer segment is not sharp enough",
        action: "Narrow to one early-adopter segment with clear access channels and buying authority.",
        expectedImpact: "Improves reachability and willingness-to-pay confidence.",
      });
    } else if (gate.gate === 3) {
      fixes.push({
        issue: "Solution fit is weak",
        action: "Map top 3 pains to top 3 features and remove non-essential complexity from V1.",
        expectedImpact: "Increases pain coverage and differentiation.",
      });
    } else if (gate.gate === 4) {
      fixes.push({
        issue: "Business model and unit economics are weak",
        action: `Adjust pricing tiers, reduce delivery cost, and target ${profile.gate4MarginThreshold}%+ gross margin for this framework.`,
        expectedImpact: "Improves sustainability and confidence in the revenue model.",
      });
    } else if (gate.gate === 5) {
      fixes.push({
        issue: "Operational readiness is too low",
        action: "Document permits/compliance, key suppliers, staffing plan, and one fallback execution plan before launch.",
        expectedImpact: "Reduces operational failure risk during the first 30 days.",
      });
    }
  }

  for (const criterion of criteria.filter((criterion) => criterion.score <= 2)) {
    const recommendation = criterion.recommendations[0];
    if (!recommendation) continue;
    fixes.push({
      issue: criterion.label,
      action: recommendation,
      expectedImpact: `Improves ${criterion.label.toLowerCase()} signal and total score.`,
    });
  }

  const deduped: FixSuggestion[] = [];
  const seen = new Set<string>();
  for (const fix of fixes) {
    const key = `${fix.issue}:${fix.action}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(fix);
  }

  return deduped.slice(0, 8);
}

function buildSummary(
  decision: FrameworkDecision,
  category: Category,
  gateResults: SimplifiedGateResult[],
  risks: FailureRisk[],
  profile: FrameworkProfile
): DynamicValidationResult["summary"] {
  let oneLiner = "";

  if (decision === "GO") {
    oneLiner = `Your ${profile.label.toLowerCase()} idea is a strong opportunity with all critical gates passing.`;
  } else if (decision === "CONDITIONAL_GO") {
    oneLiner = `Your ${profile.label.toLowerCase()} idea is promising, but a few weak gates need attention before scaling.`;
  } else if (decision === "NEED_WORK") {
    oneLiner = `Your ${profile.label.toLowerCase()} idea has potential, but significant refinement is needed before launch.`;
  } else {
    oneLiner = `Your ${profile.label.toLowerCase()} idea currently has fundamental validation gaps; a pivot is recommended.`;
  }

  const topOpportunities = gateResults
    .filter((gate) => gate.status === "PASS")
    .sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)
    .slice(0, 3)
    .map((gate) => `${gate.name} is a current strength`);

  const biggestRisks = [
    ...gateResults
      .filter((gate) => gate.status === "FAIL")
      .slice(0, 2)
      .map((gate) => `${gate.name} is below threshold`),
    ...risks.slice(0, 2).map((risk) => risk.reason),
  ].slice(0, 3);

  if (topOpportunities.length === 0) {
    topOpportunities.push("You have room to differentiate with sharper positioning.");
  }

  if (biggestRisks.length === 0) {
    biggestRisks.push("Keep validating assumptions with real customers before building.");
  }

  return {
    oneLiner: `${oneLiner} (Category: ${category})`,
    topOpportunities,
    biggestRisks,
  };
}

function buildNextActions(decision: FrameworkDecision, fixes: FixSuggestion[], profile: FrameworkProfile): string[] {
  const archetypeActions: Record<FrameworkArchetype, string[]> = {
    general: [
      "Interview 10 target customers to validate the highest pain point.",
      "Create a landing page and test demand with a clear call to action.",
      "Test pricing with at least 5 potential buyers.",
    ],
    restaurant: [
      "Count foot traffic in 2-3 candidate locations at lunch and dinner for 5 days.",
      "Estimate break-even covers per day using rent, labor, and food cost assumptions.",
      "Pilot a small menu and validate average ticket size before committing full setup.",
    ],
    food_truck: [
      "Secure 2 high-traffic spots and validate lunch + evening demand windows.",
      "Confirm permits, parking rules, and weather backup plan for each location.",
      "Run a lean menu test for one week and track daily unit volume.",
    ],
    marketing_agency: [
      "Choose one niche and define one clear offer with deliverables and price.",
      "Outreach to 20 ideal clients with one message and track reply rate.",
      "Close 1-2 pilot clients and convert outcomes into case studies.",
    ],
    saas_product: [
      "Interview 10 ICP users and document current manual workaround pain.",
      "Build a single-workflow MVP and test onboarding completion.",
      "Validate willingness to pay with 5 buyer calls before adding features.",
    ],
    ecommerce_product: [
      "Validate product demand with a lean landing page and 3-5 creative angles.",
      "Confirm gross margin after product cost, shipping, and returns assumptions.",
      "Test one hero product before expanding into a broader catalog.",
    ],
    local_service_business: [
      "Pick one neighborhood and validate demand through 20 direct conversations.",
      "Price one core package with travel, supplies, and helper costs included.",
      "Secure 3 recurring clients to de-risk revenue before expanding.",
    ],
    online_education_coaching: [
      "Define one measurable outcome and position the program around it.",
      "Run a pilot cohort with 5-10 students and track completion and feedback.",
      "Test local pricing and payment options with your target audience.",
    ],
  };

  const profileActions = archetypeActions[profile.id];

  if (decision === "GO") {
    return [
      ...profileActions,
      "Build a simple 30-day launch sprint and execute daily.",
    ];
  }

  if (decision === "CONDITIONAL_GO") {
    return [
      "Run a focused 10-day validation sprint on failed gates.",
      ...profileActions.slice(0, 2),
      ...fixes.slice(0, 3).map((fix) => fix.action),
      "Re-run validation after applying improvements.",
    ].slice(0, 5);
  }

  if (decision === "NEED_WORK") {
    return [
      "Narrow the business idea to one segment and one problem.",
      ...profileActions.slice(0, 2),
      ...fixes.slice(0, 3).map((fix) => fix.action),
      "Retest with customer interviews before investing in product build.",
    ].slice(0, 5);
  }

  return [
    "Pause execution on the current version of this idea.",
    "Review alternative business models below.",
    "Interview customers in an adjacent niche before choosing a pivot.",
    "Select one pivot with stronger demand signals and rerun validation.",
  ];
}

function buildFrameworkReport(input: {
  clarification: IdeaClarification;
  problemDemand: ProblemDemandResult;
  customerValidation: CustomerValidationResult;
  solutionValidation: SolutionValidationResult;
  marketValidation: MarketValidationResult;
  businessModel: BusinessModelResult;
  operationalValidation: OperationalFeasibilityResult;
  weightedScore: number;
  decision: FrameworkDecision;
  gates: SimplifiedGateResult[];
}): SimplifiedFrameworkReport {
  return {
    oneLineSummary: input.clarification.restatement,
    missingInfo: input.clarification.missingInfo,
    assumptions: input.clarification.assumptions,
    problemDemand: {
      painLevel: input.problemDemand.painLevel,
      marketCoverage: input.problemDemand.marketCoverage,
      currentGap: input.problemDemand.currentGap,
      demandFrequency: input.problemDemand.demandFrequency,
      total: input.problemDemand.total,
      passGate1: input.problemDemand.passGate1,
      keyInsight: input.problemDemand.keyInsight,
    },
    primarySegment: {
      name: input.customerValidation.primarySegment.name,
      who: input.customerValidation.primarySegment.who,
      jobToBeDone: input.customerValidation.primarySegment.jobToBeDone,
      currentPain: input.customerValidation.primarySegment.currentPain,
      willingnessToPay: input.customerValidation.primarySegment.willingnessToPay,
      reachChannels: input.customerValidation.primarySegment.reachChannels,
      scores: {
        reachability: input.customerValidation.primarySegment.reachability,
        painLevel: input.customerValidation.primarySegment.painLevel,
        payingCapability: input.customerValidation.primarySegment.payingCapability,
        total: input.customerValidation.primarySegment.totalScore,
      },
    },
    solutionValidation: {
      painCoverage: input.solutionValidation.painCoverage,
      differentiation: input.solutionValidation.differentiation,
      adoptionFriction: input.solutionValidation.adoptionFriction,
      score: input.solutionValidation.totalScore,
      passGate3: input.solutionValidation.passGate3,
    },
    marketValidation: {
      tam: input.marketValidation.totalAddressableMarket,
      sam: input.marketValidation.serviceableAddressableMarket,
      som: input.marketValidation.serviceableObtainableMarket,
      confidence: input.marketValidation.confidence,
      passGate4: input.marketValidation.passGate4,
    },
    businessModelValidation: {
      model: input.businessModel.model,
      entryPrice: input.businessModel.entryPrice,
      anchorPrice: input.businessModel.anchorPrice,
      margin: input.businessModel.margin,
      passGate4: input.businessModel.passGate4,
    },
    operationalValidation: {
      score: input.operationalValidation.score,
      passGate5: input.operationalValidation.passGate5,
      keyConstraints: input.operationalValidation.keyConstraints,
    },
    weightedScore: input.weightedScore,
    decision: input.decision,
    gates: input.gates,
  };
}

function resolveGateStatus(
  upstreamPassed: boolean,
  rawPass: boolean,
  blockedByGate: 1 | 2 | 3 | 4 | 5
): Pick<SimplifiedGateResult, "passed" | "status" | "blockedByGate"> {
  if (!upstreamPassed) {
    return {
      passed: false,
      status: "BLOCKED",
      blockedByGate,
    };
  }

  return {
    passed: rawPass,
    status: rawPass ? "PASS" : "FAIL",
  };
}

async function validateIdeaWithHeuristics(
  input: ValidationInput,
  context: {
    locale: Locale;
    country: DynamicValidationResult["country"];
    category: Category;
    categoryConfidence: number;
    framework: LoadedFramework;
  }
): Promise<DynamicValidationResult> {
  const { locale, country, category, categoryConfidence, framework } = context;
  const profile = detectFrameworkProfile(input.idea, category);

  const clarification = clarifyIdea(input.idea);
  const problemDemand = evaluateProblemDemand(input.idea, clarification, profile);

  const gate1: SimplifiedGateResult = {
    gate: 1,
    name: "Problem & Demand",
    score: problemDemand.total,
    maxScore: 20,
    passed: problemDemand.passGate1,
    status: problemDemand.passGate1 ? "PASS" : "FAIL",
    reasoning: problemDemand.reasoning,
  };

  let customerValidation: CustomerValidationResult = {
    segments: [],
    primarySegment: {
      name: "Not evaluated",
      who: "Not evaluated",
      jobToBeDone: "Not evaluated",
      currentPain: "Not evaluated",
      willingnessToPay: "LOW",
      reachChannels: [],
      reachability: 0,
      painLevel: 0,
      payingCapability: 0,
      totalScore: 0,
    },
    passGate2: false,
    gateScore: 0,
    reasoning: "Gate 2 not evaluated yet.",
  };

  let solutionValidation: SolutionValidationResult = {
    painCoverage: 0,
    differentiation: 0,
    adoptionFriction: 0,
    totalScore: 0,
    passGate3: false,
    reasoning: "Gate 3 not evaluated yet.",
  };

  let marketValidation: MarketValidationResult = {
    totalAddressableMarket: 0,
    serviceableAddressableMarket: 0,
    serviceableObtainableMarket: 0,
    confidence: 0,
    marketScore: 0,
    passGate4: false,
    competition: {
      direct: [],
      indirect: [],
      statusQuo: [],
    },
    reasoning: "Gate 4 not evaluated yet.",
  };

  let businessModel: BusinessModelResult = {
    model: CATEGORY_PRICING_BASELINES[category].model,
    entryPrice: 0,
    anchorPrice: 0,
    margin: 0,
    businessModelScore: 0,
    passGate4: false,
    reasoning: "Gate 4 not evaluated yet.",
  };

  let operationalValidation: OperationalFeasibilityResult = {
    score: 0,
    passGate5: false,
    keyConstraints: [],
    reasoning: "Gate 5 not evaluated yet.",
  };

  const gates: SimplifiedGateResult[] = [gate1];

  customerValidation = analyzeCustomerSegments(
    input,
    category,
    problemDemand,
    clarification,
    gate1.passed,
    profile
  );
  const gate2Passed = gate1.passed && customerValidation.passGate2;
  const gate2Status = resolveGateStatus(gate1.passed, customerValidation.passGate2, 1);
  gates.push({
    gate: 2,
    name: "Customer & Location Fit",
    score: customerValidation.primarySegment.totalScore,
    maxScore: 15,
    passed: gate2Status.passed,
    status: gate2Status.status,
    blockedByGate: gate2Status.blockedByGate,
    reasoning: gate1.passed
      ? customerValidation.reasoning
      : "Gate 2 is blocked until Gate 1 passes.",
  });

  solutionValidation = validateSolutionFit(
    input,
    clarification,
    problemDemand,
    customerValidation,
    categoryConfidence,
    profile
  );
  const gate3Passed = gate2Passed && solutionValidation.passGate3;
  const gate3Status = resolveGateStatus(gate2Passed, solutionValidation.passGate3, 2);
  gates.push({
    gate: 3,
    name: "Competition & Differentiation",
    score: solutionValidation.totalScore,
    maxScore: 5,
    passed: gate3Status.passed,
    status: gate3Status.status,
    blockedByGate: gate3Status.blockedByGate,
    reasoning: gate2Passed
      ? solutionValidation.reasoning
      : "Gate 3 is blocked until Gate 2 passes.",
  });

  marketValidation = analyzeMarket(
    category,
    country.region,
    customerValidation,
    solutionValidation,
    profile
  );
  const gate4CanRun = gate3Passed;
  businessModel = analyzeBusinessModel(
    category,
    input,
    problemDemand,
    profile
  );
  const gate4Passed = gate4CanRun && businessModel.passGate4;
  const gate4Status = resolveGateStatus(gate4CanRun, businessModel.passGate4, 3);
  gates.push({
    gate: 4,
    name: "Business Model & Unit Economics",
    score: businessModel.businessModelScore,
    maxScore: 5,
    passed: gate4Status.passed,
    status: gate4Status.status,
    blockedByGate: gate4Status.blockedByGate,
    reasoning: gate4CanRun
      ? businessModel.reasoning
      : "Gate 4 is blocked until Gate 3 passes.",
  });

  operationalValidation = evaluateOperationalFeasibility(input, profile);
  const gate5Passed = gate4Passed && operationalValidation.passGate5;
  const gate5Status = resolveGateStatus(gate4Passed, operationalValidation.passGate5, 4);
  gates.push({
    gate: 5,
    name: "Operational Feasibility",
    score: operationalValidation.score,
    maxScore: 5,
    passed: gate5Status.passed,
    status: gate5Status.status,
    blockedByGate: gate5Status.blockedByGate,
    reasoning: gate4Passed
      ? operationalValidation.reasoning
      : "Gate 5 is blocked until Gate 4 passes.",
  });

  const componentScores = {
    problemStrength: clampZeroToFive(problemDemand.total / 4),
    customerValidation: customerValidation.gateScore,
    solutionFit: solutionValidation.totalScore,
    marketOpportunity: marketValidation.marketScore,
    businessModel: businessModel.businessModelScore,
  };

  const weighted =
    componentScores.problemStrength * SCORING_WEIGHTS.problemStrength +
    componentScores.customerValidation * SCORING_WEIGHTS.customerValidation +
    componentScores.solutionFit * SCORING_WEIGHTS.solutionFit +
    componentScores.marketOpportunity * SCORING_WEIGHTS.marketOpportunity +
    componentScores.businessModel * SCORING_WEIGHTS.businessModel;

  const weightedScore = Math.round(weighted * 20);
  const passedGateCount = gates.filter((gate) => gate.passed).length;

  let decision: FrameworkDecision;
  if (weightedScore >= 75 && gates.every((gate) => gate.passed)) {
    decision = "GO";
  } else if (weightedScore >= 60 && passedGateCount >= 4) {
    decision = "CONDITIONAL_GO";
  } else if (weightedScore >= 40) {
    decision = "NEED_WORK";
  } else {
    decision = "NO_GO";
  }

  const status = decisionToStatus(decision);
  const overallScore = toScoreBand(weighted / 1);

  const criteria = buildCriteria(framework, componentScores, gates);
  const failureRisks = buildFailureRisks(gates, criteria);
  const fixes = buildFixes(gates, criteria, profile);

  const alternativeSuggestion = suggestAlternatives(framework, failureRisks, overallScore);
  const alternatives = status === "STOP" ? alternativeSuggestion.alternatives : [];

  const buildResult = triggerBuildFlow({
    category,
    countryCode: country.code,
    locale,
    ideaSummary: clarification.restatement.slice(0, 140),
  });

  const summary = buildSummary(decision, category, gates, failureRisks, profile);
  const nextActions = buildNextActions(decision, fixes, profile);

  const missingInfo = [
    ...clarification.missingInfo,
    ...criteria
      .filter((criterion) => criterion.score <= 2)
      .map((criterion) => `For ${criterion.label}: ${criterion.recommendations[0] ?? "Add stronger evidence."}`),
  ].slice(0, 8);

  const frameworkReport = buildFrameworkReport({
    clarification,
    problemDemand,
    customerValidation,
    solutionValidation,
    marketValidation,
    businessModel,
    operationalValidation,
    weightedScore,
    decision,
    gates,
  });

  return {
    status,
    category,
    framework: {
      archetype: profile.id,
      label: profile.label,
    },
    country,
    language: locale,
    overallScore,
    verdict: scoreToVerdict(overallScore),
    summary,
    failureRisks,
    fixes,
    alternatives,
    nextActions,
    criteria,
    assumptions: clarification.assumptions,
    missingInfo,
    buildTriggered: buildResult.triggered,
    buildJobs: buildResult.jobs,
    frameworkReport,
    meta: {
      version: ENGINE_VERSION,
      iterationCount: 1,
      generatedAt: new Date().toISOString(),
    },
  };
}

export async function validateIdeaDynamic(input: ValidationInput): Promise<DynamicValidationResult> {
  const locale: Locale = input.locale || "en";
  const resolvedContext = await resolveValidationContext(input, locale);
  const { country, categoryClassification } = resolvedContext;
  const frameworkProfile = detectFrameworkProfile(input.idea, resolvedContext.category);
  const category =
    frameworkProfile.preferredCategory &&
    categoryClassification.category !== frameworkProfile.preferredCategory &&
    categoryClassification.confidence < 0.9
      ? frameworkProfile.preferredCategory
      : resolvedContext.category;

  const categoryConfidence =
    category === categoryClassification.category
      ? categoryClassification.confidence
      : Math.max(categoryClassification.confidence, 0.72);

  const framework = loadFramework({
    category,
    countryCode: country.code,
  });
  const frameworkGuideId = resolvedContext.frameworkHint ?? getDefaultFrameworkGuideId(category);
  const frameworkGuide = getFrameworkGuide(frameworkGuideId) ?? getFrameworkGuide(getDefaultFrameworkGuideId(category));

  const aiResult = await analyzeBusinessIdeaWithAI({
    input,
    locale,
    category,
    framework,
    frameworkGuide: frameworkGuide!,
    country,
    categoryClassification,
    businessModel: {
      subcategory: resolvedContext.subcategory,
      businessModelType: resolvedContext.businessModelType,
      segment: resolvedContext.segment,
      frameworkHint: frameworkGuideId,
    },
  });

  return {
    ...aiResult,
    frameworkUsed: aiResult.frameworkUsed ?? frameworkGuideId,
    inferredBusinessModel: {
      primaryCategory: aiResult.businessCategory ?? aiResult.business_category ?? category,
      subcategory: resolvedContext.subcategory,
      businessModelType: resolvedContext.businessModelType,
      segment: resolvedContext.segment,
      frameworkId: frameworkGuideId,
      confidence: Math.round(categoryClassification.confidence * 100),
      evidence: categoryClassification.evidence,
    },
  };
}
