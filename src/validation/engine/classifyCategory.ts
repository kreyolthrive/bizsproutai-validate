import type { Category } from "../types";

const PHYSICAL_PRODUCT_SUBSCRIPTION_REGEX =
  /\b(subscription box|subscription service|subscribers?|monthly subscription|recurring delivery|deliver(?:ing|ed|y)|ship(?:ping|ped)?|fulfillment|inventory|physical product|consumer product|consumer goods|boxed|package|packaging|beans?|coffee|tea|snack|skincare|candle|gift box|variet(?:y|ies)|tasting notes?|brewing guides?|roaster|roast)\b/i;

const DIGITAL_SAAS_REGEX =
  /\b(saas|software|app|platform|dashboard|api|automation|workflow|crm|erp|analytics|per user|user seats|cloud)\b/i;
const CONSULTING_SERVICE_REGEX =
  /\b(consult|consulting|consultant|advisory|advisor|fractional|retainer|agency|freelancer|professional services)\b/i;
const NON_LEGAL_SERVICE_FUNCTION_REGEX =
  /\b(marketing|brand|sales|lead generation|growth|operations|strategy|creative|social media|content|ads|reporting)\b/i;
const IN_PERSON_WELLNESS_SERVICE_REGEX =
  /\b(wellness studio|studio|yoga|pilates|massage|facial|spa|sauna|medspa|med spa|nutrition coaching|nutritionist|breathwork|appointment|appointments|bookings?|classes?|memberships?|drop-in|in-person|physical location)\b/i;
const WELLNESS_MODALITY_REGEX =
  /\b(yoga|pilates|massage|nutrition|wellness|fitness|holistic|mindbody|breathwork|recovery)\b/i;
const PHYSICAL_SERVICE_MODEL_REGEX =
  /\b(studio|spa|clinic|center|appointments?|bookings?|classes?|memberships?|drop-in|in-person|physical location|walk-in)\b/i;
const POSTPARTUM_FITNESS_COACHING_REGEX =
  /\b(postpartum|post-partum|postnatal|post-natal|new moms?|new mothers?|after pregnancy|after birth|pregnancy recovery|pelvic floor|diastasis recti|c-section recovery)\b/i;
const REMOTE_WELLNESS_COACHING_REGEX =
  /\b(remote|online|virtual|zoom|membership|community|program|coach|coaching|1:1|1-on-1|digital service)\b/i;
const SOFTWARE_PRODUCT_REGEX =
  /\b(saas|software|app|platform|tool|system|dashboard|crm|automation|workflow|portal|booking software|scheduling software|appointment booking|appointment scheduling|client management|booking app|scheduling app|booking tool|scheduling tool|booking system|scheduling system|patient management|booking platform|scheduling platform)\b/i;
const PRODUCT_BUILD_INTENT_REGEX = /\b(build|create|develop|launch|make|building|creating|developing|launching|making|want to build|trying to build|planning to build)\b/i;
const LOCAL_OPERATOR_SEGMENT_REGEX =
  /\b(barber|barbers|barbershop|barber shop|salon|salons|spa|spas|medspa|med spa|esthetician|nail salon|massage therapist|clinic|clinics|dentist|dentists|dental practice|dental clinic|tattoo shop|pet groomer|local service operators?|appointment-based local businesses?|beauty shop|hair salon|nail technician|fitness studio|yoga studio|pilates studio|gym|gyms|personal trainer|therapist|chiropractor|optometrist|veterinarian|vet clinic|auto shop|mechanic|car wash|cleaning service|plumber|electrician)\b/i;
const SOFTWARE_FOR_LOCAL_OPERATOR_REGEX =
  /\b(app|software|saas|platform|tool|system|dashboard|booking software|scheduling software|appointment booking|appointment scheduling|client management|booking app|scheduling app)\b[\s\S]{0,80}\b(for|serving|used by|helps?|designed for|sold to)\b[\s\S]{0,40}\b(barber|barbers|barbershop|barber shop|salon|spa|clinic|dentist|tattoo shop|local service operators?|appointment-based local businesses?)\b/i;
// Additional pattern: "build/create [noun] app/software for [operator]" or "[noun] for [operator]"
const BUILD_SOFTWARE_FOR_OPERATOR_REGEX =
  /\b(build|create|develop|launch|make|building|creating|developing)\b[\s\S]{0,60}\b(booking|scheduling|appointment|client management|time slot)\b[\s\S]{0,30}\b(app|software|tool|system|platform)\b[\s\S]{0,80}\b(for|serving)\b[\s\S]{0,40}\b(barber|barbers|barbershop|barber shop|salon|spa|clinic|dentist|tattoo shop|local service|small business)\b/i;
// Reverse pattern: "app for barber with booking/scheduling features"
const APP_FOR_OPERATOR_WITH_FEATURES_REGEX =
  /\b(app|software|tool|system|platform)\b[\s\S]{0,40}\b(for)\b[\s\S]{0,30}\b(barber|barbers|barbershop|barber shop|salon|spa|clinic|dentist|tattoo shop)\b[\s\S]{0,80}\b(time slot|booking|scheduling|appointment|client info|client management|confirmation)\b/i;

export function hasVerticalSaasSignals(idea: string): boolean {
  const normalized = idea.toLowerCase();
  
  // Check for explicit "software for local operator" patterns
  if (SOFTWARE_FOR_LOCAL_OPERATOR_REGEX.test(normalized)) {
    return true;
  }
  
  // Check for "build [feature] app for [operator]" pattern
  if (BUILD_SOFTWARE_FOR_OPERATOR_REGEX.test(normalized)) {
    return true;
  }
  
  // Check for "app for [operator] with [features]" pattern
  if (APP_FOR_OPERATOR_WITH_FEATURES_REGEX.test(normalized)) {
    return true;
  }
  
  // General check: software product being built for local operators
  const hasSoftwareProduct =
    SOFTWARE_PRODUCT_REGEX.test(normalized) &&
    (PRODUCT_BUILD_INTENT_REGEX.test(normalized) || /\bsoftware|app|saas|platform|tool|booking|scheduling\b/i.test(normalized));
  const targetsLocalOperators =
    (LOCAL_OPERATOR_SEGMENT_REGEX.test(normalized) && /\bfor\b/i.test(normalized));
  
  // Additional check: booking/scheduling app + operator mention (even without explicit "for")
  const hasBookingFeatures = /\b(time slot|booking|scheduling|appointment|client info|client management|confirmation screen|calendar)\b/i.test(normalized);
  const hasOperatorMention = LOCAL_OPERATOR_SEGMENT_REGEX.test(normalized);
  const hasBuildIntent = PRODUCT_BUILD_INTENT_REGEX.test(normalized);
  const hasAppMention = /\b(app|software|tool|system|platform)\b/i.test(normalized);
  
  // "Build a booking app for a barber" should match
  if (hasBuildIntent && hasAppMention && hasBookingFeatures && hasOperatorMention) {
    return true;
  }

  return hasSoftwareProduct && targetsLocalOperators;
}

export function hasPhysicalProductSubscriptionSignals(idea: string): boolean {
  const normalized = idea.toLowerCase();
  const hasRecurringSignal = /\b(subscription|subscribers?|monthly|recurring|membership)\b/i.test(normalized);
  const hasPhysicalSignal = PHYSICAL_PRODUCT_SUBSCRIPTION_REGEX.test(normalized);

  return hasRecurringSignal && hasPhysicalSignal;
}

export function hasInPersonWellnessServiceSignals(idea: string): boolean {
  const normalized = idea.toLowerCase();
  return IN_PERSON_WELLNESS_SERVICE_REGEX.test(normalized) &&
    (WELLNESS_MODALITY_REGEX.test(normalized) || PHYSICAL_SERVICE_MODEL_REGEX.test(normalized));
}

// Keyword patterns for each category
const categoryPatterns: Record<Category, { keywords: string[]; phrases: string[] }> = {
  ecommerce: {
    keywords: [
      "sell", "selling", "shop", "store", "product", "products", "dropship", "dropshipping",
      "inventory", "shipping", "fulfillment", "amazon", "shopify", "retail", "wholesale",
      "merchandise", "goods", "cart", "checkout", "ecommerce", "e-commerce", "subscription box",
      "box", "deliver", "delivering", "delivery", "ship", "shipped", "subscription", "subscribers",
      "physical", "package", "beans", "coffee", "tea", "snack", "skincare", "varieties", "roaster"
    ],
    phrases: [
      "online store", "online shop", "sell products", "physical products", "sell online",
      "drop shipping", "print on demand", "private label", "white label", "sell merchandise",
      "subscription box", "monthly box", "monthly delivery", "coffee subscription", "product subscription",
      "physical subscription", "delivering products"
    ]
  },
  coaching: {
    keywords: [
      "coach", "coaching", "mentor", "mentoring", "transform", "transformation",
      "mindset", "breakthrough", "accountability", "1on1", "one-on-one", "personal development",
      "life coach", "executive coach", "career coach", "cohort", "group program", "masterclass"
    ],
    phrases: [
      "help people", "transform lives", "coaching business", "coaching practice",
      "personal coaching", "group coaching", "coaching program", "help clients"
    ]
  },
  consulting: {
    keywords: [
      "consult", "consulting", "consultant", "advisory", "advisor", "strategy", "strategic",
      "expertise", "fractional", "b2b", "enterprise", "implementation", "professional services",
      "agency", "freelancer", "creative studio", "marketing agency", "social media manager"
    ],
    phrases: [
      "consulting business", "help companies", "help businesses", "strategic advice",
      "business consulting", "management consulting", "advisory services", "fractional executive"
    ]
  },
  finance: {
    keywords: [
      "finance", "financial", "fintech", "banking", "bank", "payment", "payments",
      "lending", "loan", "loans", "invest", "investing", "investment", "insurance",
      "credit", "money", "wealth", "trading", "crypto", "cryptocurrency", "blockchain"
    ],
    phrases: [
      "financial services", "payment processing", "money transfer", "mobile money",
      "financial technology", "banking app", "investment platform", "trading platform"
    ]
  },
  tech: {
    keywords: [
      "app", "application", "software", "platform", "tech", "technology", "mobile app",
      "web app", "build", "develop", "code", "ai", "artificial intelligence", "machine learning",
      "api", "tool", "automation", "prototype"
    ],
    phrases: [
      "build an app", "create an app", "mobile application", "web application",
      "tech startup", "tech product", "software product", "ai tool"
    ]
  },
  saas: {
    keywords: [
      "saas", "mrr", "arr", "b2b software", "cloud",
      "dashboard", "analytics", "crm", "erp", "project management", "workflow", "user seats", "per user"
    ],
    phrases: [
      "saas product", "saas business", "subscription software", "b2b saas",
      "software as a service", "recurring revenue"
    ]
  },
  marketplace: {
    keywords: [
      "marketplace", "platform", "connect", "matching", "two-sided", "network",
      "buyers", "sellers", "supply", "demand", "freelance", "gig"
    ],
    phrases: [
      "connect buyers", "connect sellers", "matching platform", "two-sided marketplace",
      "freelance marketplace", "service marketplace", "rental marketplace"
    ]
  },
  local_service: {
    keywords: [
      "local", "service", "services", "cleaning", "plumbing", "electrician", "handyman",
      "landscaping", "lawn", "repair", "maintenance", "home", "restaurant", "salon",
      "barbershop", "spa", "gym", "studio", "detailing", "car wash", "food truck",
      "massage", "appointments", "appointment", "class", "classes", "membership", "memberships",
      "realtor", "real estate", "real-estate", "agent", "broker", "homebuyer", "homebuyers",
      "dine-in", "takeaway", "take out", "kiosk", "street food", "stall"
    ],
    phrases: [
      "local business", "local service", "home service", "cleaning service",
      "repair service", "maintenance service", "in my city", "in my area",
      "mobile car detailing", "car detailing", "food truck", "real estate agent",
      "wellness studio", "yoga studio", "massage studio", "in-person classes",
      "appointment-based business", "membership-based studio",
      "first-time homebuyers", "first time homebuyers"
    ]
  },
  health_wellness: {
    keywords: [
      "health", "wellness", "fitness", "nutrition", "diet", "workout", "exercise",
      "yoga", "meditation", "mental health", "therapy", "supplement", "supplements",
      "weight loss", "healthy", "wellbeing", "holistic"
    ],
    phrases: [
      "health and wellness", "fitness program", "nutrition coaching", "meal plan",
      "workout program", "wellness brand", "health products", "mental wellness"
    ]
  },
  edtech: {
    keywords: [
      "education", "learning", "course", "courses", "teach", "teaching", "training",
      "tutorial", "tutoring", "school", "academy", "certification", "bootcamp",
      "e-learning", "online course", "curriculum", "exam prep", "cohort-based"
    ],
    phrases: [
      "online course", "teach people", "education platform", "learning platform",
      "online education", "skill training", "professional training", "bootcamp"
    ]
  },
  legal_law: {
    keywords: [
      "legal", "law", "lawyer", "attorney", "contract", "contracts", "compliance",
      "trademark", "patent", "intellectual property", "litigation", "court",
      "notary", "paralegal"
    ],
    phrases: [
      "legal services", "legal tech", "contract management", "legal documents",
      "legal advice", "law firm", "legal platform"
    ]
  }
};

// Weight for different match types
const KEYWORD_WEIGHT = 1;
const PHRASE_WEIGHT = 3;

function applyContextBoosts(ideaLower: string, scores: Record<Category, number>) {
  const restaurantSignals = /\brestaurant|dine[- ]?in|takeaway|take[- ]?out|menu|chef|cafe|bistro\b/i;
  const foodTruckSignals = /\bfood truck|street food|kiosk|stall|cart\b/i;
  const agencySignals = /\bagency|freelancer|social media manager|ads manager|creative studio|marketing consultant\b/i;
  const saasSignals = DIGITAL_SAAS_REGEX;
  const coachingSignals = /\bcoach|coaching|mentor|accountability\b/i;
  const educationSignals = /\bcourse|cohort|tutoring|bootcamp|exam prep|online class\b/i;
  const productSubscriptionSignals = hasPhysicalProductSubscriptionSignals(ideaLower);
  const inPersonWellnessSignals = hasInPersonWellnessServiceSignals(ideaLower);
  const localFulfillmentSignals = /\b(local|city|neighborhood|appointments?|bookings?|classes?|studio|spa|clinic|memberships?)\b/i;
  const postpartumSignals = POSTPARTUM_FITNESS_COACHING_REGEX;
  const remoteWellnessSignals = REMOTE_WELLNESS_COACHING_REGEX;

  if (restaurantSignals.test(ideaLower)) {
    scores.local_service += 5;
  }
  if (foodTruckSignals.test(ideaLower)) {
    scores.local_service += 6;
  }
  if (agencySignals.test(ideaLower)) {
    scores.consulting += 5;
  }
  if (saasSignals.test(ideaLower)) {
    scores.saas += 4;
    scores.tech += 2;
  }
  if (hasVerticalSaasSignals(ideaLower)) {
    scores.saas += 9;
    scores.tech += 3;
    scores.local_service = Math.max(0, scores.local_service - 5);
  }
  if (productSubscriptionSignals) {
    scores.ecommerce += 8;
    scores.saas = Math.max(0, scores.saas - 4);
  }
  if (coachingSignals.test(ideaLower)) {
    scores.coaching += 4;
  }
  if (educationSignals.test(ideaLower)) {
    scores.edtech += 4;
  }
  if (postpartumSignals.test(ideaLower) && WELLNESS_MODALITY_REGEX.test(ideaLower)) {
    scores.health_wellness += 8;
    scores.coaching += 3;
    scores.edtech = Math.max(0, scores.edtech - 5);
  }
  if (remoteWellnessSignals.test(ideaLower) && WELLNESS_MODALITY_REGEX.test(ideaLower)) {
    scores.health_wellness += 5;
    scores.coaching += 2;
    scores.edtech = Math.max(0, scores.edtech - 3);
  }
  if (inPersonWellnessSignals) {
    scores.local_service += 8;
    scores.health_wellness += 6;
    if (localFulfillmentSignals.test(ideaLower)) {
      scores.local_service += 2;
    }
    scores.coaching = Math.max(0, scores.coaching - 2);
    scores.consulting = Math.max(0, scores.consulting - 2);
    scores.edtech = Math.max(0, scores.edtech - 3);
  }
}

export interface ClassifyCategoryInput {
  idea: string;
  explicitCategory?: Category;
}

export interface CategoryClassification {
  category: Category;
  confidence: number;
  alternativeCategories: Array<{ category: Category; score: number }>;
  evidence: string[];
}

export function classifyCategory(input: ClassifyCategoryInput): CategoryClassification {
  // If explicit category provided, use it with high confidence
  if (input.explicitCategory) {
    return {
      category: input.explicitCategory,
      confidence: 1.0,
      alternativeCategories: [],
      evidence: ["Explicitly specified by user"]
    };
  }

  const ideaLower = input.idea.toLowerCase();
  if (hasPhysicalProductSubscriptionSignals(ideaLower) && !DIGITAL_SAAS_REGEX.test(ideaLower)) {
    return {
      category: "ecommerce",
      confidence: 0.94,
      alternativeCategories: [
        { category: "marketplace", score: 2 },
        { category: "local_service", score: 1 },
      ],
      evidence: [
        "Detected recurring-payment language tied to physical product delivery",
        "Found subscription-box / shipping / fulfillment signals that map to ecommerce",
      ],
    };
  }

  if (hasVerticalSaasSignals(ideaLower)) {
    return {
      category: "saas",
      confidence: 0.93,
      alternativeCategories: [
        { category: "local_service", score: 5 },
        { category: "tech", score: 4 },
      ],
      evidence: [
        "Detected a software product being built for local-service operators, so the core business model is SaaS",
        "Booking, scheduling, or client-management signals point to vertical workflow software rather than the operator's service category",
      ],
    };
  }

  if (hasInPersonWellnessServiceSignals(ideaLower)) {
    return {
      category: "local_service",
      confidence: 0.91,
      alternativeCategories: [
        { category: "health_wellness", score: 6 },
        { category: "coaching", score: 2 },
      ],
      evidence: [
        "Detected an in-person wellness service model with studio / appointment / class signals",
        "Combined wellness modalities suggest a local service business, not a coaching-only offer",
      ],
    };
  }

  if (POSTPARTUM_FITNESS_COACHING_REGEX.test(ideaLower) && WELLNESS_MODALITY_REGEX.test(ideaLower)) {
    return {
      category: "health_wellness",
      confidence: 0.93,
      alternativeCategories: [
        { category: "coaching", score: 6 },
        { category: "edtech", score: 1 },
      ],
      evidence: [
        "Detected postpartum or new-mother wellness signals tied to a fitness or recovery offer",
        "The business fits a health and wellness coaching service better than an education product",
      ],
    };
  }

  if (CONSULTING_SERVICE_REGEX.test(ideaLower) && NON_LEGAL_SERVICE_FUNCTION_REGEX.test(ideaLower)) {
    return {
      category: "consulting",
      confidence: 0.9,
      alternativeCategories: [
        { category: "coaching", score: 5 },
        { category: "legal_law", score: 3 },
      ],
      evidence: [
        "Detected a consulting-style business model with advisory / retainer language",
        "The core offer is a service function for a vertical, not a legal product or law practice",
      ],
    };
  }

  const scores: Record<Category, number> = {} as Record<Category, number>;
  const evidence: string[] = [];

  // Score each category
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    let score = 0;
    const categoryEvidence: string[] = [];

    // Check keywords
    for (const keyword of patterns.keywords) {
      if (ideaLower.includes(keyword)) {
        score += KEYWORD_WEIGHT;
        categoryEvidence.push(`keyword: ${keyword}`);
      }
    }

    // Check phrases (stronger signal)
    for (const phrase of patterns.phrases) {
      if (ideaLower.includes(phrase)) {
        score += PHRASE_WEIGHT;
        categoryEvidence.push(`phrase: ${phrase}`);
      }
    }

    scores[category as Category] = score;

    if (categoryEvidence.length > 0) {
      evidence.push(`${category}: ${categoryEvidence.slice(0, 3).join(", ")}`);
    }
  }

  applyContextBoosts(ideaLower, scores);

  // Sort categories by score
  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([category, score]) => ({ category: category as Category, score }));

  const bestCategory = sortedCategories[0];
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  // Calculate confidence based on how much the top category dominates
  let confidence = 0.5; // Default moderate confidence
  if (totalScore > 0) {
    confidence = Math.min(bestCategory.score / (totalScore * 0.5), 1);
  }

  // If no strong signals, default to tech
  if (bestCategory.score === 0) {
    return {
      category: "tech",
      confidence: 0.3,
      alternativeCategories: [],
      evidence: ["No clear category signals, defaulting to tech"]
    };
  }

  // Get alternative categories (score > 0 and not the best)
  const alternativeCategories = sortedCategories
    .slice(1)
    .filter(c => c.score > 0)
    .slice(0, 3);

  return {
    category: bestCategory.category,
    confidence: Math.max(confidence, 0.4),
    alternativeCategories,
    evidence
  };
}

// Utility to check if a category is valid
export function isValidCategory(category: string): category is Category {
  return Object.keys(categoryPatterns).includes(category);
}

// Get all available categories
export function getAllCategories(): Category[] {
  return Object.keys(categoryPatterns) as Category[];
}
