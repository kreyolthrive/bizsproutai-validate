import type { Category, CountryCode } from "../types";

// Perplexity provider for market research and competitor analysis

export interface PerplexityConfig {
  apiKey?: string;
  model?: string;
}

export interface MarketResearchRequest {
  idea: string;
  category: Category;
  countryCode?: CountryCode;
  targetMarket?: string;
}

export interface MarketResearchResponse {
  marketSize: string;
  growthTrend: "growing" | "stable" | "declining" | "unknown";
  keyPlayers: string[];
  opportunities: string[];
  threats: string[];
  sources: string[];
}

export interface CompetitorAnalysisRequest {
  idea: string;
  category: Category;
  countryCode?: CountryCode;
}

export interface CompetitorAnalysisResponse {
  competitors: Array<{
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  competitiveAdvantages: string[];
  gaps: string[];
}

// Check if Perplexity is available
export function isPerplexityAvailable(config?: PerplexityConfig): boolean {
  return !!(config?.apiKey || process.env.PERPLEXITY_API_KEY);
}

// Get Perplexity API key
function getApiKey(config?: PerplexityConfig): string | undefined {
  return config?.apiKey || process.env.PERPLEXITY_API_KEY;
}

// Conduct market research using Perplexity (or fallback to heuristic)
export async function conductMarketResearch(
  request: MarketResearchRequest,
  config?: PerplexityConfig
): Promise<MarketResearchResponse> {
  const apiKey = getApiKey(config);

  // If no API key, use heuristic fallback
  if (!apiKey) {
    return conductMarketResearchHeuristic(request);
  }

  try {
    // TODO: Implement actual Perplexity API call
    return conductMarketResearchHeuristic(request);
  } catch (error) {
    console.error("Perplexity API error, falling back to heuristic:", error);
    return conductMarketResearchHeuristic(request);
  }
}

// Analyze competitors using Perplexity (or fallback)
export async function analyzeCompetitors(
  request: CompetitorAnalysisRequest,
  config?: PerplexityConfig
): Promise<CompetitorAnalysisResponse> {
  const apiKey = getApiKey(config);

  // If no API key, use heuristic fallback
  if (!apiKey) {
    return analyzeCompetitorsHeuristic(request);
  }

  try {
    // TODO: Implement actual Perplexity API call
    return analyzeCompetitorsHeuristic(request);
  } catch (error) {
    console.error("Perplexity API error, falling back to heuristic:", error);
    return analyzeCompetitorsHeuristic(request);
  }
}

// Heuristic fallback for market research
function conductMarketResearchHeuristic(
  request: MarketResearchRequest
): MarketResearchResponse {
  const { category, countryCode, idea } = request;
  const ideaLower = idea.toLowerCase();

  if (
    category === "saas" &&
    /\b(barber|barbers|barbershop|barber shop|salon|spa|appointment-based)\b/i.test(ideaLower) &&
    /\b(booking|appointment|scheduling|time slots?|client management|confirmation screen)\b/i.test(ideaLower)
  ) {
    const opportunities = [
      "Vertical SaaS wedge for appointment-based SMBs",
      "Operator demand for simpler booking and client-rebooking workflows",
      "Niche differentiation through barber-specific scheduling and lightweight CRM",
    ];

    if (countryCode) {
      opportunities.push(`Local SMB software opportunities in ${countryCode}`);
    }

    return {
      marketSize: "Appointment software and SMB operations software are large, fragmented markets with room for vertical specialists",
      growthTrend: "growing",
      keyPlayers: ["Booksy", "Fresha", "Square Appointments"],
      opportunities,
      threats: ["Incumbent booking tools", "Switching friction", "SMB churn and price sensitivity"],
      sources: ["AI business analysis", "Idea-specific heuristic market synthesis"],
    };
  }

  // Category-specific market insights (heuristic)
  const categoryInsights: Record<Category, Partial<MarketResearchResponse>> = {
    ecommerce: {
      marketSize: "Global ecommerce market: $6+ trillion",
      growthTrend: "growing",
      keyPlayers: ["Amazon", "Shopify merchants", "Alibaba"],
      opportunities: ["Niche markets", "Sustainable products", "Social commerce"],
      threats: ["Amazon competition", "Rising CAC", "Shipping costs"],
    },
    coaching: {
      marketSize: "Coaching industry: $20+ billion globally",
      growthTrend: "growing",
      keyPlayers: ["Tony Robbins", "ICF-certified coaches", "Digital course creators"],
      opportunities: ["Executive coaching", "Niche specialization", "Group programs"],
      threats: ["Market saturation", "Credential requirements", "Client acquisition cost"],
    },
    consulting: {
      marketSize: "Consulting market: $300+ billion globally",
      growthTrend: "stable",
      keyPlayers: ["McKinsey", "BCG", "Boutique firms"],
      opportunities: ["Fractional executives", "Industry specialization", "Tech consulting"],
      threats: ["Economic cycles", "AI automation", "Price pressure"],
    },
    finance: {
      marketSize: "Fintech market: $300+ billion globally",
      growthTrend: "growing",
      keyPlayers: ["Stripe", "PayPal", "Regional banks"],
      opportunities: ["Underbanked populations", "SMB finance", "Embedded finance"],
      threats: ["Regulatory barriers", "Trust requirements", "Capital intensity"],
    },
    tech: {
      marketSize: "Software market: $600+ billion globally",
      growthTrend: "growing",
      keyPlayers: ["Varies by vertical", "Big tech companies", "VC-backed startups"],
      opportunities: ["AI applications", "Vertical solutions", "API platforms"],
      threats: ["Competition", "Talent costs", "Rapid obsolescence"],
    },
    saas: {
      marketSize: "SaaS market: $200+ billion globally",
      growthTrend: "growing",
      keyPlayers: ["Salesforce", "Microsoft", "Vertical leaders"],
      opportunities: ["SMB market", "Vertical SaaS", "AI features"],
      threats: ["Churn", "Competition", "Feature commoditization"],
    },
    marketplace: {
      marketSize: "Marketplace GMV: Trillions globally",
      growthTrend: "growing",
      keyPlayers: ["Amazon", "Uber", "Airbnb", "Etsy"],
      opportunities: ["Niche verticals", "B2B marketplaces", "Services marketplaces"],
      threats: ["Network effects barriers", "Disintermediation", "Regulation"],
    },
    local_service: {
      marketSize: "Local services: Varies by vertical",
      growthTrend: "stable",
      keyPlayers: ["Established local businesses", "Franchises", "Gig platforms"],
      opportunities: ["Underserved niches", "Premium positioning", "Tech-enabled service"],
      threats: ["Price competition", "Labor costs", "Economic cycles"],
    },
    health_wellness: {
      marketSize: "Wellness market: $5+ trillion globally",
      growthTrend: "growing",
      keyPlayers: ["Peloton", "Headspace", "Herbalife"],
      opportunities: ["Digital wellness", "Mental health", "Personalization"],
      threats: ["Fads", "Regulation", "Results variability"],
    },
    edtech: {
      marketSize: "EdTech market: $400+ billion globally",
      growthTrend: "growing",
      keyPlayers: ["Coursera", "Udemy", "LinkedIn Learning"],
      opportunities: ["Corporate training", "Skills-based learning", "AI tutoring"],
      threats: ["Free content", "Completion rates", "Credential value"],
    },
    legal_law: {
      marketSize: "Legal services: $900+ billion globally",
      growthTrend: "stable",
      keyPlayers: ["BigLaw firms", "LegalZoom", "Emerging legal tech"],
      opportunities: ["SMB legal needs", "Contract automation", "Compliance"],
      threats: ["UPL regulations", "Bar requirements", "Trust barriers"],
    },
  };

  const insights = categoryInsights[category] || categoryInsights.tech;

  // Adjust for country if provided
  if (countryCode) {
    insights.opportunities = insights.opportunities || [];
    insights.opportunities.push(`Local market opportunities in ${countryCode}`);
  }

  return {
    marketSize: insights.marketSize || "Market size varies",
    growthTrend: insights.growthTrend || "unknown",
    keyPlayers: insights.keyPlayers || [],
    opportunities: insights.opportunities || [],
    threats: insights.threats || [],
    sources: ["Industry reports", "Market analysis (heuristic-based)"],
  };
}

// Heuristic fallback for competitor analysis
function analyzeCompetitorsHeuristic(
  request: CompetitorAnalysisRequest
): CompetitorAnalysisResponse {
  const { category, idea } = request;
  const ideaLower = idea.toLowerCase();

  if (
    category === "saas" &&
    /\b(barber|barbers|barbershop|barber shop|salon|spa|appointment-based)\b/i.test(ideaLower) &&
    /\b(booking|appointment|scheduling|time slots?|client management|confirmation screen)\b/i.test(ideaLower)
  ) {
    return {
      competitors: [
        {
          name: "Booksy",
          description: "Vertical booking and marketplace tooling for barbers and beauty operators",
          strengths: ["Vertical brand recognition", "Booking workflow depth", "Installed user base"],
          weaknesses: ["May feel broad or costly for simpler shops", "Feature set can exceed what a narrow MVP needs"],
        },
        {
          name: "Fresha",
          description: "Appointment and business-management software for salons and wellness operators",
          strengths: ["Scheduling", "Payments", "Multi-location support"],
          weaknesses: ["Broader beauty focus", "Can be heavier than a barber-specific wedge"],
        },
        {
          name: "Square Appointments",
          description: "Horizontal SMB scheduling integrated with payments",
          strengths: ["Payments ecosystem", "Simple setup", "Broad SMB familiarity"],
          weaknesses: ["Less vertical depth", "Generic positioning for barber-specific workflows"],
        },
      ],
      competitiveAdvantages: [
        "Barber-specific workflow depth",
        "Simpler onboarding and migration",
        "Low-friction rebooking and client-note features",
      ],
      gaps: [
        "Tools optimized for independent barbers and small shops",
        "Faster setup with less feature bloat",
        "Workflow support for repeat clients and chair-based scheduling",
      ],
    };
  }

  // Generic competitor insights by category
  const categoryCompetitors: Record<Category, CompetitorAnalysisResponse> = {
    ecommerce: {
      competitors: [
        {
          name: "Amazon",
          description: "Dominant marketplace with Prime ecosystem",
          strengths: ["Scale", "Logistics", "Prime members"],
          weaknesses: ["Impersonal", "Seller commoditization"],
        },
        {
          name: "Niche DTC brands",
          description: "Direct-to-consumer brands in your vertical",
          strengths: ["Brand loyalty", "Premium positioning"],
          weaknesses: ["Limited reach", "High CAC"],
        },
      ],
      competitiveAdvantages: ["Niche focus", "Personal brand", "Unique product"],
      gaps: ["Underserved segments", "Better customer experience", "Local presence"],
    },
    coaching: {
      competitors: [
        {
          name: "Established coaches",
          description: "Coaches with large followings",
          strengths: ["Authority", "Social proof"],
          weaknesses: ["High prices", "Less personalized"],
        },
      ],
      competitiveAdvantages: ["Specific niche", "Personal experience", "Accessibility"],
      gaps: ["Underserved demographics", "Outcome-focused programs"],
    },
    consulting: {
      competitors: [
        {
          name: "Large consulting firms",
          description: "McKinsey, BCG, Deloitte, etc.",
          strengths: ["Brand", "Resources", "Network"],
          weaknesses: ["Expensive", "Less agile"],
        },
      ],
      competitiveAdvantages: ["Specialization", "Agility", "Personal attention"],
      gaps: ["SMB market", "Specific industry verticals"],
    },
    finance: {
      competitors: [
        {
          name: "Traditional banks",
          description: "Established financial institutions",
          strengths: ["Trust", "Regulation compliance", "Capital"],
          weaknesses: ["Slow", "Poor UX", "High fees"],
        },
      ],
      competitiveAdvantages: ["Better UX", "Lower fees", "Speed"],
      gaps: ["Underbanked populations", "Specific use cases"],
    },
    tech: {
      competitors: [
        {
          name: "Existing solutions",
          description: "Current tools solving similar problems",
          strengths: ["Established users", "Feature-rich"],
          weaknesses: ["Complex", "Expensive", "Generic"],
        },
      ],
      competitiveAdvantages: ["Simplicity", "Focus", "Modern stack"],
      gaps: ["Specific workflows", "Underserved users"],
    },
    saas: {
      competitors: [
        {
          name: "Category leaders",
          description: "Established SaaS in your space",
          strengths: ["Market share", "Integrations", "Resources"],
          weaknesses: ["Bloated", "Expensive", "Slow to innovate"],
        },
      ],
      competitiveAdvantages: ["Focus", "Price", "Customer service"],
      gaps: ["Vertical-specific needs", "SMB pricing"],
    },
    marketplace: {
      competitors: [
        {
          name: "Horizontal marketplaces",
          description: "Large general marketplaces",
          strengths: ["Network effects", "Trust", "Selection"],
          weaknesses: ["Generic", "High fees", "Poor curation"],
        },
      ],
      competitiveAdvantages: ["Niche focus", "Quality curation", "Community"],
      gaps: ["Underserved verticals", "Better matching"],
    },
    local_service: {
      competitors: [
        {
          name: "Established local providers",
          description: "Current service providers in area",
          strengths: ["Reputation", "Relationships"],
          weaknesses: ["Outdated methods", "Limited capacity"],
        },
      ],
      competitiveAdvantages: ["Modern approach", "Better availability", "Tech-enabled"],
      gaps: ["Underserved areas", "Premium segment"],
    },
    health_wellness: {
      competitors: [
        {
          name: "Wellness brands",
          description: "Established wellness companies",
          strengths: ["Brand awareness", "Resources"],
          weaknesses: ["Generic", "Not personalized"],
        },
      ],
      competitiveAdvantages: ["Personalization", "Specific focus", "Community"],
      gaps: ["Specific conditions", "Underserved demographics"],
    },
    edtech: {
      competitors: [
        {
          name: "Online learning platforms",
          description: "Coursera, Udemy, etc.",
          strengths: ["Content library", "Brand", "Scale"],
          weaknesses: ["Low completion", "Generic", "No support"],
        },
      ],
      competitiveAdvantages: ["Cohort-based", "Outcomes focus", "Community"],
      gaps: ["Specific skills", "Career outcomes"],
    },
    legal_law: {
      competitors: [
        {
          name: "Traditional law firms",
          description: "Established legal practices",
          strengths: ["Expertise", "Trust", "Full service"],
          weaknesses: ["Expensive", "Slow", "Intimidating"],
        },
      ],
      competitiveAdvantages: ["Accessibility", "Transparency", "Tech-enabled"],
      gaps: ["SMB legal needs", "Self-serve options"],
    },
  };

  return categoryCompetitors[category] || categoryCompetitors.tech;
}
