import type { Category, Locale } from "../types";

// ChatGPT provider for messaging, positioning, and content generation

export interface ChatGPTConfig {
  apiKey?: string;
  model?: string;
}

export interface PositioningRequest {
  idea: string;
  category: Category;
  targetMarket?: string;
  locale: Locale;
}

export interface PositioningResponse {
  tagline: string;
  valueProposition: string;
  differentiators: string[];
  targetAudience: string;
}

export interface LandingCopyRequest {
  idea: string;
  category: Category;
  positioning: PositioningResponse;
  locale: Locale;
}

export interface LandingCopyResponse {
  headline: string;
  subheadline: string;
  ctaText: string;
  features: Array<{ title: string; description: string }>;
  socialProof: string;
}

export interface ContentRequest {
  idea: string;
  category: Category;
  contentType: "blog" | "social" | "email" | "ad";
  locale: Locale;
}

export interface ContentResponse {
  title: string;
  body: string;
  cta: string;
}

// Check if ChatGPT is available
export function isChatGPTAvailable(config?: ChatGPTConfig): boolean {
  return !!(config?.apiKey || process.env.OPENAI_API_KEY);
}

// Get ChatGPT API key
function getApiKey(config?: ChatGPTConfig): string | undefined {
  return config?.apiKey || process.env.OPENAI_API_KEY;
}

// Generate positioning using ChatGPT (or fallback to heuristic)
export async function generatePositioning(
  request: PositioningRequest,
  config?: ChatGPTConfig
): Promise<PositioningResponse> {
  const apiKey = getApiKey(config);

  // If no API key, use heuristic fallback
  if (!apiKey) {
    return generatePositioningHeuristic(request);
  }

  try {
    // TODO: Implement actual OpenAI API call
    return generatePositioningHeuristic(request);
  } catch (error) {
    console.error("ChatGPT API error, falling back to heuristic:", error);
    return generatePositioningHeuristic(request);
  }
}

// Generate landing page copy using ChatGPT (or fallback)
export async function generateLandingCopy(
  request: LandingCopyRequest,
  config?: ChatGPTConfig
): Promise<LandingCopyResponse> {
  const apiKey = getApiKey(config);

  // If no API key, use heuristic fallback
  if (!apiKey) {
    return generateLandingCopyHeuristic(request);
  }

  try {
    // TODO: Implement actual OpenAI API call
    return generateLandingCopyHeuristic(request);
  } catch (error) {
    console.error("ChatGPT API error, falling back to heuristic:", error);
    return generateLandingCopyHeuristic(request);
  }
}

// Generate content using ChatGPT (or fallback)
export async function generateContent(
  request: ContentRequest,
  config?: ChatGPTConfig
): Promise<ContentResponse> {
  const apiKey = getApiKey(config);

  // If no API key, use heuristic fallback
  if (!apiKey) {
    return generateContentHeuristic(request);
  }

  try {
    // TODO: Implement actual OpenAI API call
    return generateContentHeuristic(request);
  } catch (error) {
    console.error("ChatGPT API error, falling back to heuristic:", error);
    return generateContentHeuristic(request);
  }
}

// Heuristic fallback for positioning
function generatePositioningHeuristic(
  request: PositioningRequest
): PositioningResponse {
  const { category, targetMarket, locale } = request;

  // Category-specific positioning templates
  const templates: Record<Category, PositioningResponse> = {
    ecommerce: {
      tagline: "Shop smarter, not harder",
      valueProposition: "Quality products delivered to your door with exceptional service",
      differentiators: ["Curated selection", "Fast shipping", "Customer-first support"],
      targetAudience: targetMarket || "Value-conscious shoppers",
    },
    coaching: {
      tagline: "Transform your potential into results",
      valueProposition: "Personalized guidance to achieve your goals faster",
      differentiators: ["Proven methodology", "1-on-1 attention", "Measurable outcomes"],
      targetAudience: targetMarket || "Professionals seeking growth",
    },
    consulting: {
      tagline: "Strategic expertise, tangible results",
      valueProposition: "Expert guidance to solve your business challenges",
      differentiators: ["Deep industry knowledge", "Custom solutions", "ROI-focused"],
      targetAudience: targetMarket || "Growing businesses",
    },
    finance: {
      tagline: "Your money, simplified",
      valueProposition: "Financial solutions that work for your life",
      differentiators: ["Transparent pricing", "Easy to use", "Secure and trusted"],
      targetAudience: targetMarket || "Modern consumers",
    },
    tech: {
      tagline: "Technology that works for you",
      valueProposition: "Powerful tools made simple",
      differentiators: ["Intuitive design", "Reliable performance", "Great support"],
      targetAudience: targetMarket || "Tech-forward users",
    },
    saas: {
      tagline: "Work smarter with software that scales",
      valueProposition: "The platform that grows with your business",
      differentiators: ["Easy setup", "Powerful features", "Seamless integrations"],
      targetAudience: targetMarket || "Growing teams",
    },
    marketplace: {
      tagline: "Connect. Discover. Transact.",
      valueProposition: "The trusted platform connecting buyers and sellers",
      differentiators: ["Verified users", "Secure transactions", "Great selection"],
      targetAudience: targetMarket || "Buyers and sellers",
    },
    local_service: {
      tagline: "Local expertise you can trust",
      valueProposition: "Quality service from your neighborhood professionals",
      differentiators: ["Local knowledge", "Personal service", "Quick response"],
      targetAudience: targetMarket || "Local community members",
    },
    health_wellness: {
      tagline: "Your journey to better health starts here",
      valueProposition: "Holistic wellness solutions for a better life",
      differentiators: ["Evidence-based", "Personalized approach", "Supportive community"],
      targetAudience: targetMarket || "Health-conscious individuals",
    },
    edtech: {
      tagline: "Learn skills that matter",
      valueProposition: "Education that prepares you for success",
      differentiators: ["Practical curriculum", "Expert instructors", "Flexible learning"],
      targetAudience: targetMarket || "Lifelong learners",
    },
    legal_law: {
      tagline: "Legal help made accessible",
      valueProposition: "Professional legal support without the complexity",
      differentiators: ["Clear communication", "Fair pricing", "Responsive service"],
      targetAudience: targetMarket || "Individuals and small businesses",
    },
  };

  const positioning = templates[category] || templates.tech;

  // Localize if needed
  if (locale === "fr") {
    return localizePositioningFrench(positioning);
  } else if (locale === "ht") {
    return localizePositioningHaitianCreole(positioning);
  } else if (locale === "es") {
    return localizePositioningSpanish(positioning);
  }

  return positioning;
}

// Heuristic fallback for landing copy
function generateLandingCopyHeuristic(
  request: LandingCopyRequest
): LandingCopyResponse {
  const { positioning, locale } = request;

  const copy: LandingCopyResponse = {
    headline: positioning.tagline,
    subheadline: positioning.valueProposition,
    ctaText: "Get Started",
    features: positioning.differentiators.map((d, i) => ({
      title: `Feature ${i + 1}`,
      description: d,
    })),
    socialProof: "Trusted by thousands of customers",
  };

  // Localize CTA
  if (locale === "fr") {
    copy.ctaText = "Commencer";
    copy.socialProof = "Approuvé par des milliers de clients";
  } else if (locale === "ht") {
    copy.ctaText = "Kòmanse";
    copy.socialProof = "Kliyan nou yo fè nou konfyans";
  } else if (locale === "es") {
    copy.ctaText = "Comenzar";
    copy.socialProof = "Miles de clientes confían en nosotros";
  }

  return copy;
}

// Heuristic fallback for content
function generateContentHeuristic(
  request: ContentRequest
): ContentResponse {
  const { category, contentType, locale } = request;

  const contentTemplates: Record<string, ContentResponse> = {
    blog: {
      title: `How to succeed in ${category}`,
      body: `Starting a ${category} business requires focus, dedication, and the right strategy. Here's what you need to know...`,
      cta: "Learn more about our solution",
    },
    social: {
      title: "",
      body: `Ready to transform your ${category} business? We're here to help you succeed. 🚀`,
      cta: "Learn more",
    },
    email: {
      title: `Your ${category} success starts here`,
      body: `We know starting a ${category} business can be challenging. That's why we've created solutions to help you succeed faster.`,
      cta: "Get started today",
    },
    ad: {
      title: `${category} made simple`,
      body: "Stop struggling. Start succeeding.",
      cta: "Try free",
    },
  };

  return contentTemplates[contentType] || contentTemplates.blog;
}

// Localization helpers
function localizePositioningFrench(pos: PositioningResponse): PositioningResponse {
  return {
    tagline: pos.tagline, // Would need proper translation
    valueProposition: pos.valueProposition,
    differentiators: pos.differentiators,
    targetAudience: pos.targetAudience,
  };
}

function localizePositioningHaitianCreole(pos: PositioningResponse): PositioningResponse {
  return {
    tagline: pos.tagline,
    valueProposition: pos.valueProposition,
    differentiators: pos.differentiators,
    targetAudience: pos.targetAudience,
  };
}

function localizePositioningSpanish(pos: PositioningResponse): PositioningResponse {
  return {
    tagline: pos.tagline,
    valueProposition: pos.valueProposition,
    differentiators: pos.differentiators,
    targetAudience: pos.targetAudience,
  };
}
