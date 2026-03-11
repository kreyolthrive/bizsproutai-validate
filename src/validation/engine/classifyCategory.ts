import type { Category } from "../types";

// Keyword patterns for each category
const categoryPatterns: Record<Category, { keywords: string[]; phrases: string[] }> = {
  ecommerce: {
    keywords: [
      "sell", "selling", "shop", "store", "product", "products", "dropship", "dropshipping",
      "inventory", "shipping", "fulfillment", "amazon", "shopify", "retail", "wholesale",
      "merchandise", "goods", "cart", "checkout", "ecommerce", "e-commerce"
    ],
    phrases: [
      "online store", "online shop", "sell products", "physical products", "sell online",
      "drop shipping", "print on demand", "private label", "white label", "sell merchandise"
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
      "saas", "subscription", "recurring", "mrr", "arr", "b2b software", "cloud",
      "dashboard", "analytics", "crm", "erp", "project management", "workflow", "user seats", "per user"
    ],
    phrases: [
      "saas product", "saas business", "subscription software", "b2b saas",
      "software as a service", "recurring revenue", "monthly subscription"
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
      "realtor", "real estate", "real-estate", "agent", "broker", "homebuyer", "homebuyers",
      "dine-in", "takeaway", "take out", "kiosk", "street food", "stall"
    ],
    phrases: [
      "local business", "local service", "home service", "cleaning service",
      "repair service", "maintenance service", "in my city", "in my area",
      "mobile car detailing", "car detailing", "food truck", "real estate agent",
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
  const saasSignals = /\bsaas|software|platform|dashboard|api|automation|workflow\b/i;
  const coachingSignals = /\bcoach|coaching|mentor|accountability\b/i;
  const educationSignals = /\bcourse|cohort|tutoring|bootcamp|exam prep|online class\b/i;

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
  if (coachingSignals.test(ideaLower)) {
    scores.coaching += 4;
  }
  if (educationSignals.test(ideaLower)) {
    scores.edtech += 4;
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
