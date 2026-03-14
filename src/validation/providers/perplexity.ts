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

  // Idea-specific heuristics — check before falling back to generic category data

  // Real estate agent / brokerage
  if (/\b(real\s*estate\s*agent|realtor|real\s*estate\s*brokerage|home\s*buyer|first[\s-]?time\s*buyer|real\s*estate\s*business)\b/i.test(ideaLower)) {
    const location = /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i.exec(idea)?.[1] ?? "the target area";
    return {
      marketSize: `Real estate is a high-value, relationship-driven business — success depends on trust, local expertise, and a clear niche rather than broad coverage`,
      growthTrend: "stable",
      keyPlayers: [`Established agents and teams in ${location}`, "National brokerages (Keller Williams, RE/MAX, eXp)", "Online platforms (Zillow, Redfin, Opendoor)"],
      opportunities: [
        "First-time buyers often feel underserved and want more guided, educational support",
        "Education-first positioning (workshops, checklists, guides) builds trust before the transaction",
        "Partnerships with lenders, financial planners, and apartment complexes create referral pipelines",
        `Local expertise in ${location} neighborhoods, pricing trends, and assistance programs`,
      ],
      threats: [
        "Long sales cycles — first-time buyers can take 6-12 months from interest to closing",
        "Established agents dominate through referral networks that take years to build",
        "Commission compression and online platforms reducing agent value perception",
        "Market sensitivity to mortgage rates, inventory, and affordability",
      ],
      sources: ["AI business analysis", "Real estate market heuristic"],
    };
  }

  // Freelance/creative CRM or workflow tool
  if (/\b(crm|pipeline|project\s*status|client\s*management|contacts?)\b/i.test(ideaLower) && /\b(freelanc|designer|creative|photographer|consultant)\b/i.test(ideaLower)) {
    return {
      marketSize: "Freelancer productivity tools are a growing niche, but most freelancers use 'good enough' free tools — switching requires clear value",
      growthTrend: "growing",
      keyPlayers: ["HoneyBook", "Dubsado", "Notion/Airtable (used as makeshift CRMs)", "Bonsai"],
      opportunities: [
        "Most freelancers cobble together Notion, Trello, and spreadsheets — a purpose-built tool can simplify their workflow",
        "Designer-specific features (revision tracking, asset approvals, portfolio flags) create a defensible wedge",
        "Solo operators value simplicity over enterprise feature bloat",
      ],
      threats: [
        "Free tools (Notion, Trello, Google Sheets) are 'good enough' for many freelancers",
        "HoneyBook and Dubsado already serve creative freelancers with established brands",
        "Low willingness to pay — freelancers are cost-sensitive and churn when work slows",
      ],
      sources: ["AI business analysis", "Creative tools market heuristic"],
    };
  }

  // Inventory / stock management app for small retail
  if (/\b(inventory|stock\s*(tracking|management|control)|reorder|low[\s-]?stock|warehouse)\b/i.test(ideaLower) && /\b(shop|store|retail|boutique|grocer|pharmacy|small\s*business)\b/i.test(ideaLower)) {
    return {
      marketSize: "Small retail inventory management is a real need, but most shops use POS-integrated inventory or manual methods — standalone tools must prove clear switching value",
      growthTrend: "stable",
      keyPlayers: ["POS systems with built-in inventory (Square, Shopify POS, Lightspeed)", "Dedicated inventory tools (Sortly, inFlow, Cin7)", "Spreadsheets and manual tracking"],
      opportunities: [
        "Shops with perishable goods (groceries, bakeries) need waste reduction and expiry tracking that POS inventory lacks",
        "Seasonal retailers need sell-through analysis and collection management",
        "Shops outgrowing spreadsheets but not ready for full POS systems want a simple, affordable middle ground",
        "Reorder automation tied to real usage patterns can save time and reduce stockouts",
      ],
      threats: [
        "POS systems increasingly include basic inventory — standalone tools must offer something POS cannot",
        "Small shop owners are extremely price-sensitive and resist new monthly subscriptions",
        "Manual tracking with pen and paper works 'well enough' for many operators",
        "Switching cost is high if the tool requires manual data entry of existing inventory",
      ],
      sources: ["AI business analysis", "Retail inventory market heuristic"],
    };
  }

  // Category-specific market insights (heuristic)
  const categoryInsights: Record<Category, Partial<MarketResearchResponse>> = {
    ecommerce: {
      marketSize: "Ecommerce continues to grow, but success depends on finding an underserved niche rather than competing head-on with major platforms",
      growthTrend: "growing",
      keyPlayers: ["Niche DTC brands in your vertical", "Shopify merchants", "Marketplace sellers"],
      opportunities: ["Underserved niche with passionate buyers", "Sustainable or locally-sourced products", "Social commerce and community-driven brands"],
      threats: ["Rising customer acquisition costs", "Shipping and fulfillment complexity", "Price competition from larger sellers"],
    },
    coaching: {
      marketSize: "Online coaching is growing, but competition is intense — differentiation requires a clear niche and measurable outcomes",
      growthTrend: "growing",
      keyPlayers: ["Niche coaches with strong personal brands", "Course creators on platforms like Teachable/Kajabi", "ICF-certified coaches"],
      opportunities: ["Niche specialization with a clear transformation promise", "Group programs that scale beyond 1-on-1", "Community-driven accountability models"],
      threats: ["Saturated market with free alternatives on YouTube and social media", "Clients skeptical without proven results or credentials", "High churn if transformation is not clearly delivered"],
    },
    consulting: {
      marketSize: "Small business consulting is a large, fragmented market with strong demand for specialized, outcome-driven services",
      growthTrend: "stable",
      keyPlayers: ["Boutique niche firms", "Independent consultants", "Freelance specialists"],
      opportunities: ["Deep specialization in one industry vertical", "Outcome-based pricing tied to client results", "Productized service packages"],
      threats: ["Crowded generalist market makes differentiation hard", "Clients may not see value without clear proof of results", "AI tools reducing demand for basic advisory work"],
    },
    finance: {
      marketSize: "Fintech is growing but heavily regulated — success requires deep compliance knowledge and trust-building",
      growthTrend: "growing",
      keyPlayers: ["Regional fintech startups", "Neobanks", "Embedded finance providers"],
      opportunities: ["Underbanked populations with unmet needs", "SMB financial tools", "Embedded finance in vertical platforms"],
      threats: ["Regulatory barriers and licensing costs", "Trust is hard to build without track record", "Capital-intensive to operate"],
    },
    tech: {
      marketSize: "Software market is large but highly competitive — success depends on solving a specific pain point better than existing tools",
      growthTrend: "growing",
      keyPlayers: ["Established tools in your vertical", "VC-backed competitors", "Open-source alternatives"],
      opportunities: ["AI-powered workflow improvements", "Vertical-specific solutions ignored by horizontal players", "API-first platforms for developers"],
      threats: ["Fast-moving competition", "High talent costs", "Risk of building something that becomes obsolete quickly"],
    },
    saas: {
      marketSize: "SaaS is mature and competitive — winning requires a clear niche, strong retention, and a focused v1",
      growthTrend: "growing",
      keyPlayers: ["Category leaders in your vertical", "Horizontal tools (Notion, Airtable, etc.)", "Vertical SaaS specialists"],
      opportunities: ["Underserved SMB segments", "Vertical SaaS for specific industries", "AI features that save time on repetitive tasks"],
      threats: ["High churn if value is not immediately clear", "Feature commoditization by larger players", "Long sales cycles for enterprise"],
    },
    marketplace: {
      marketSize: "Marketplaces are powerful but require solving the chicken-and-egg problem of supply and demand",
      growthTrend: "growing",
      keyPlayers: ["Dominant platforms in your vertical", "Niche marketplace startups", "Aggregators"],
      opportunities: ["Niche verticals underserved by horizontal platforms", "B2B marketplaces with high transaction value", "Services marketplaces with quality curation"],
      threats: ["Cold-start problem: need both buyers and sellers", "Disintermediation once parties connect", "Regulatory complexity in some verticals"],
    },
    local_service: {
      marketSize: "Local services are always in demand but compete on reputation, convenience, and price",
      growthTrend: "stable",
      keyPlayers: ["Established local providers", "Franchise chains", "Gig platforms like TaskRabbit"],
      opportunities: ["Underserved niches in your area", "Premium positioning with guaranteed outcomes", "Tech-enabled service delivery"],
      threats: ["Price competition from established players", "Labor costs and reliability", "Seasonal or economic sensitivity"],
    },
    health_wellness: {
      marketSize: "Wellness is growing but crowded — differentiation requires a specific audience and measurable outcomes",
      growthTrend: "growing",
      keyPlayers: ["Niche wellness brands", "Fitness apps and platforms", "Local practitioners"],
      opportunities: ["Digital wellness for specific demographics", "Mental health and stress management", "Personalized programs with accountability"],
      threats: ["Trend-driven market with high churn", "Regulatory requirements for health claims", "Hard to prove results without long-term data"],
    },
    edtech: {
      marketSize: "EdTech is growing but completion rates are low — success requires clear outcomes and engagement mechanisms",
      growthTrend: "growing",
      keyPlayers: ["Course platforms (Coursera, Udemy, Skillshare)", "Niche educators with strong brands", "Corporate training providers"],
      opportunities: ["Corporate training with measurable ROI", "Skills-based learning tied to job outcomes", "AI-powered personalized tutoring"],
      threats: ["Free content on YouTube and social media", "Low completion rates undermine value perception", "Credential value is often unclear to buyers"],
    },
    legal_law: {
      marketSize: "Legal services for SMBs are underserved, but regulatory barriers are high",
      growthTrend: "stable",
      keyPlayers: ["Solo practitioners and small firms", "Legal tech platforms (LegalZoom, Rocket Lawyer)", "Emerging AI legal tools"],
      opportunities: ["SMB legal needs that are too small for traditional firms", "Contract automation and templates", "Compliance-as-a-service for specific industries"],
      threats: ["Unauthorized practice of law regulations", "Bar requirements and licensing", "Trust barriers — clients want human lawyers for serious matters"],
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

  // Idea-specific competitor heuristics

  // Real estate agent
  if (/\b(real\s*estate\s*agent|realtor|real\s*estate\s*brokerage|home\s*buyer|first[\s-]?time\s*buyer)\b/i.test(ideaLower)) {
    return {
      competitors: [
        {
          name: "Established local agents and teams",
          description: "Experienced agents with years of referral networks, reviews, and local reputation",
          strengths: ["Deep referral networks", "Track record and reviews", "Brokerage support and mentorship"],
          weaknesses: ["May not specialize in first-time buyers", "Less focused on education and guidance"],
        },
        {
          name: "Online platforms (Zillow, Redfin, Opendoor)",
          description: "Tech-enabled platforms that offer agent matching, iBuying, or reduced-commission models",
          strengths: ["Brand recognition", "Lead generation at scale", "Lower commission options"],
          weaknesses: ["Impersonal experience", "Less hand-holding for first-time buyers", "Agent quality varies"],
        },
      ],
      competitiveAdvantages: [
        "Education-first positioning builds trust before the transaction",
        "Specializing in first-time buyers creates a clear, ownable niche",
        "Workshops, guides, and community events serve as organic lead generation",
      ],
      gaps: [
        "Most agents treat first-time buyers as lower-priority compared to repeat buyers",
        "Few agents create structured education programs (workshops, checklists, bootcamps)",
        "Down payment assistance and local program expertise is an underutilized differentiator",
      ],
    };
  }

  // Freelance/creative CRM or workflow tool
  if (/\b(crm|pipeline|project\s*status|client\s*management|contacts?)\b/i.test(ideaLower) && /\b(freelanc|designer|creative|photographer|consultant)\b/i.test(ideaLower)) {
    return {
      competitors: [
        {
          name: "HoneyBook / Dubsado",
          description: "All-in-one business management for creative freelancers",
          strengths: ["Contracts, invoicing, and scheduling built in", "Strong brand in creative community"],
          weaknesses: ["Can feel heavy for solo operators who just need a simple pipeline", "Monthly cost may not justify for low-volume freelancers"],
        },
        {
          name: "Notion / Trello / Airtable (used as makeshift CRMs)",
          description: "General productivity tools repurposed for client tracking",
          strengths: ["Free or cheap", "Flexible and customizable", "Already in the workflow"],
          weaknesses: ["Require manual setup", "No built-in CRM features like follow-up reminders or proposal tracking"],
        },
      ],
      competitiveAdvantages: [
        "Purpose-built simplicity vs. repurposed general tools",
        "Designer-specific features like revision tracking, asset approvals, and portfolio flags",
        "Fast onboarding — works out of the box without template setup",
      ],
      gaps: [
        "No tool specifically designed for the freelance designer client pipeline",
        "Revision round and approval tracking is missing from existing CRM tools",
        "Simple, opinionated tools beat flexible-but-complex ones for solo operators",
      ],
    };
  }

  // Inventory / stock management app for small retail
  if (/\b(inventory|stock\s*(tracking|management|control)|reorder|low[\s-]?stock)\b/i.test(ideaLower) && /\b(shop|store|retail|boutique|grocer|pharmacy|small\s*business)\b/i.test(ideaLower)) {
    return {
      competitors: [
        {
          name: "POS systems with built-in inventory (Square, Shopify POS, Lightspeed)",
          description: "Point-of-sale platforms that include inventory tracking as part of a larger suite",
          strengths: ["Already installed at checkout", "Payments + inventory in one system", "Familiar to shop owners"],
          weaknesses: ["Inventory features are basic — limited reorder automation, no expiry tracking", "Overkill for very small shops"],
        },
        {
          name: "Dedicated inventory tools (Sortly, inFlow, Cin7)",
          description: "Standalone inventory management software for small-to-mid businesses",
          strengths: ["Purpose-built for inventory", "Barcode scanning and warehouse features", "Reporting and analytics"],
          weaknesses: ["Can be expensive for micro-businesses", "Feature-heavy for a shop with 50-200 SKUs", "Setup and data entry is a barrier"],
        },
        {
          name: "Spreadsheets and manual tracking",
          description: "Most small shops still use Excel, Google Sheets, or pen-and-paper to track stock",
          strengths: ["Free", "Familiar", "No learning curve"],
          weaknesses: ["Error-prone", "No automation or alerts", "Time-consuming for weekly stock checks"],
        },
      ],
      competitiveAdvantages: [
        "Extreme simplicity — works out of the box for a shop with 50-300 SKUs",
        "Vertical-specific features (perishable tracking, seasonal sell-through, consignment)",
        "Mobile-first design for owners who walk aisles doing stock checks",
      ],
      gaps: [
        "No simple, affordable inventory tool designed specifically for micro-retail (1-3 employees)",
        "Perishable/expiry tracking is rarely built into lightweight tools",
        "Automatic reorder suggestions based on actual sales velocity are missing from simple tools",
      ],
    };
  }

  // Generic competitor insights by category
  const categoryCompetitors: Record<Category, CompetitorAnalysisResponse> = {
    ecommerce: {
      competitors: [
        {
          name: "Niche DTC brands",
          description: "Direct-to-consumer brands already serving your target audience",
          strengths: ["Brand loyalty", "Premium positioning", "Community engagement"],
          weaknesses: ["Limited reach", "High customer acquisition cost"],
        },
        {
          name: "Marketplace sellers",
          description: "Existing sellers on platforms like Etsy, Amazon, or Shopify stores in your niche",
          strengths: ["Built-in traffic", "Low barrier to entry"],
          weaknesses: ["Race to bottom on price", "No direct customer relationship"],
        },
      ],
      competitiveAdvantages: ["Deep niche focus", "Authentic brand story", "Unique or curated product selection"],
      gaps: ["Underserved customer segments", "Better post-purchase experience", "Local or sustainable sourcing"],
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
          name: "Established niche consultants",
          description: "Independent consultants and boutique firms already serving your target vertical",
          strengths: ["Proven track record", "Client relationships", "Industry expertise"],
          weaknesses: ["May lack scalable systems", "Often overloaded with clients"],
        },
        {
          name: "Freelance generalists",
          description: "Freelancers on platforms like Upwork, Fiverr, or Toptal offering broad consulting",
          strengths: ["Low prices", "Easy to find", "Fast to engage"],
          weaknesses: ["Shallow expertise", "No accountability for results"],
        },
      ],
      competitiveAdvantages: ["Deep niche specialization", "Outcome-based pricing", "Personal attention and accountability"],
      gaps: ["Specific industry verticals underserved by generalists", "Consultants who guarantee measurable outcomes", "Productized services with clear deliverables and timelines"],
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
          description: "Experienced operators with years of local reputation and word-of-mouth referrals",
          strengths: ["Built-in trust from years of operation", "Strong referral and repeat customer base", "Local knowledge"],
          weaknesses: ["May resist modernization", "Often over-committed or hard to reach", "Limited online presence"],
        },
        {
          name: "Gig platforms and franchises",
          description: "TaskRabbit, Thumbtack, or franchise chains competing on price or convenience",
          strengths: ["Easy to find online", "Standardized service levels", "Built-in trust through platform"],
          weaknesses: ["Impersonal experience", "Race to bottom on pricing", "High platform fees cut into margins"],
        },
      ],
      competitiveAdvantages: ["Specialized expertise in a specific service niche", "Personal relationships and responsiveness", "Premium positioning with guaranteed outcomes"],
      gaps: ["Specific neighborhoods or demographics underserved by current providers", "Premium or specialized service tiers", "Better online booking and communication"],
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
