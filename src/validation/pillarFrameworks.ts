/**
 * Category-Specific Pillar Validation Frameworks
 * 
 * BizSproutAI uses AI + LLM reasoning to validate business ideas.
 * This file provides category-specific frameworks with 6 consistent pillars.
 * 
 * Each category uses the same backbone:
 * 1. Problem & Demand
 * 2. Customer & Context Fit
 * 3. Competition & Differentiation
 * 4. Business Model & Money
 * 5. Acquisition & Channels
 * 6. Execution & Founder Fit
 * 
 * Verdicts are always constructive:
 * - "promising_execution": Ready to test with focused execution
 * - "promising_needs_validation": Promising but needs more validation work
 * - "high_risk_improve_or_pivot": High risk — here's how to improve or pivot
 * 
 * NEVER say "NO GO" — always couple issues with a path forward.
 */

import type { Category, PillarKey, ConstructiveVerdict, PillarStatus } from "./types";

export type PillarFrameworkQuestion = {
  question: string;
  followUp?: string;
};

export type PillarFrameworkAdvice = {
  condition: string;
  advice: string;
};

export type PillarFrameworkDefinition = {
  key: PillarKey;
  label: string;
  weight: number;
  questions: PillarFrameworkQuestion[];
  weakAdvice: PillarFrameworkAdvice[];
  moderateAdvice: PillarFrameworkAdvice[];
  strongAdvice: PillarFrameworkAdvice[];
};

export type CategoryFramework = {
  category: Category;
  displayName: string;
  description: string;
  pillars: PillarFrameworkDefinition[];
  verdictExamples: {
    promising_execution: string[];
    promising_needs_validation: string[];
    high_risk_improve_or_pivot: string[];
  };
  analysisInstructions: string[];
};

// Helper function to determine pillar status from score
export function getPillarStatus(score: number): PillarStatus {
  if (score >= 70) return "strong";
  if (score >= 40) return "moderate";
  return "weak";
}

// Helper function to determine verdict from overall score
export function getConstructiveVerdict(overallScore: number): ConstructiveVerdict {
  if (overallScore >= 70) return "promising_execution";
  if (overallScore >= 45) return "promising_needs_validation";
  return "high_risk_improve_or_pivot";
}

// Helper function to get verdict label
export function getVerdictLabel(verdict: ConstructiveVerdict): string {
  switch (verdict) {
    case "promising_execution":
      return "Promising — focus on execution and testing";
    case "promising_needs_validation":
      return "Promising — but needs more validation work";
    case "high_risk_improve_or_pivot":
      return "High risk in current form — here's how to improve or pivot";
  }
}

// ============================================================================
// SaaS / Software Framework
// ============================================================================
export const saasFramework: CategoryFramework = {
  category: "saas",
  displayName: "SaaS / Software",
  description: "Software-as-a-Service products with recurring subscription revenue",
  pillars: [
    {
      key: "problem_demand",
      label: "Problem & Demand",
      weight: 0.2,
      questions: [
        { question: "Is the problem painful and frequent?", followUp: "How often do users experience this pain?" },
        { question: "Are people already solving it with workarounds (spreadsheets, hacks, multiple tools)?" },
        { question: "What's the cost of the problem remaining unsolved?" },
      ],
      weakAdvice: [
        { condition: "Problem not clear or painful enough", advice: "Talk to 10–20 target users and collect specific stories of when this problem hurt them." },
        { condition: "No evidence of demand", advice: "Try a simple manual service version before writing code." },
        { condition: "Users don't realize they have the problem", advice: "Document the current workflow and time wasted with concrete numbers." },
      ],
      moderateAdvice: [
        { condition: "Problem exists but unclear urgency", advice: "Quantify the pain: how much time/money does this cost users weekly?" },
        { condition: "Some demand signals", advice: "Set up 5 customer discovery calls to validate frequency and severity." },
      ],
      strongAdvice: [
        { condition: "Clear, painful problem", advice: "Focus on documenting the exact workflow pain for marketing messaging." },
        { condition: "Strong demand signals", advice: "Consider pre-selling before building to validate willingness to pay." },
      ],
    },
    {
      key: "customer_context_fit",
      label: "Customer & Context Fit",
      weight: 0.15,
      questions: [
        { question: "Clear ICP (role, company size, industry, region)?" },
        { question: "Do they have the budget and tech maturity to adopt SaaS?" },
        { question: "How do they currently buy software and what blocks approvals?" },
      ],
      weakAdvice: [
        { condition: "ICP too broad", advice: "Tighten your audience from 'businesses' to one niche (e.g., B2B agencies 5–20 people)." },
        { condition: "Budget concerns", advice: "Check how they currently buy software and what blocks approvals." },
        { condition: "Tech maturity mismatch", advice: "Consider a simpler entry point or done-for-you setup." },
      ],
      moderateAdvice: [
        { condition: "ICP defined but untested", advice: "Interview 5 prospects from your ICP to validate assumptions." },
        { condition: "Some budget uncertainty", advice: "Research typical software spending in your target segment." },
      ],
      strongAdvice: [
        { condition: "Well-defined ICP", advice: "Document 3 detailed buyer personas with specific pain points." },
        { condition: "Clear budget and buying process", advice: "Map the decision-making process and key stakeholders." },
      ],
    },
    {
      key: "competition_differentiation",
      label: "Competition & Differentiation",
      weight: 0.2,
      questions: [
        { question: "What tools do they use today?" },
        { question: "Is your wedge clearly different (faster, cheaper, localized, easier)?" },
        { question: "Why would someone switch from their current solution?" },
      ],
      weakAdvice: [
        { condition: "Too similar to existing tools", advice: "Write a one-sentence comparison vs the top 2 tools: 'Unlike X, we…'." },
        { condition: "Unclear differentiation", advice: "If your idea is too similar, focus on one workflow or vertical." },
        { condition: "Strong incumbent lock-in", advice: "Identify the switching trigger—what event makes users reconsider tools?" },
      ],
      moderateAdvice: [
        { condition: "Some differentiation", advice: "Test your positioning with 5 potential customers. Do they 'get it' in 30 seconds?" },
        { condition: "Competition exists but gaps remain", advice: "Focus on underserved segments or use cases competitors ignore." },
      ],
      strongAdvice: [
        { condition: "Clear wedge against competitors", advice: "Build comparison pages and competitor migration guides." },
        { condition: "Unique positioning", advice: "Document and protect your unique approach in marketing." },
      ],
    },
    {
      key: "business_model_money",
      label: "Business Model & Money",
      weight: 0.2,
      questions: [
        { question: "Pricing model clear? (per user, per account, per transaction)" },
        { question: "Does potential LTV support acquisition cost?" },
        { question: "What's your path to $1K MRR? $10K MRR?" },
      ],
      weakAdvice: [
        { condition: "Pricing unclear", advice: "Test 2–3 price points with potential customers before building." },
        { condition: "Unit economics uncertain", advice: "Offer a simple entry plan that matches the value of your first version." },
        { condition: "No revenue model yet", advice: "Define your minimum viable pricing before launch." },
      ],
      moderateAdvice: [
        { condition: "Pricing defined but untested", advice: "Run a pricing survey with 20+ potential customers." },
        { condition: "LTV/CAC unclear", advice: "Estimate customer lifetime based on similar products in your space." },
      ],
      strongAdvice: [
        { condition: "Clear pricing with validation", advice: "Consider value-based pricing tiers based on customer outcomes." },
        { condition: "Strong unit economics", advice: "Model different growth scenarios and required resources." },
      ],
    },
    {
      key: "acquisition_channels",
      label: "Acquisition & Channels",
      weight: 0.15,
      questions: [
        { question: "How will you reach your ICP?" },
        { question: "Are there existing communities, marketplaces, partners?" },
        { question: "What's your first 100 customers strategy?" },
      ],
      weakAdvice: [
        { condition: "No channel strategy", advice: "List 3 places your ICP hangs out (Slack groups, conferences, newsletters) and plan one test in each." },
        { condition: "Unclear acquisition path", advice: "Start with one channel and achieve repeatable results before diversifying." },
        { condition: "High CAC expected", advice: "Explore content marketing or community-led growth to reduce CAC." },
      ],
      moderateAdvice: [
        { condition: "Some channel ideas", advice: "Test your top 2 channels with small experiments before committing." },
        { condition: "Mixed channel signals", advice: "Track your first 20 customers closely to understand what's working." },
      ],
      strongAdvice: [
        { condition: "Clear channel strategy", advice: "Document your repeatable acquisition process." },
        { condition: "Multiple viable channels", advice: "Prioritize by CAC efficiency and double down on winners." },
      ],
    },
    {
      key: "execution_founder_fit",
      label: "Execution & Founder Fit",
      weight: 0.1,
      questions: [
        { question: "Do you or your team have the tech/product skills?" },
        { question: "Is the build scope realistic for a v1?" },
        { question: "What's your unfair advantage in this space?" },
      ],
      weakAdvice: [
        { condition: "Scope too large", advice: "Shrink the v1 to one critical workflow you can ship in 4–8 weeks." },
        { condition: "Skills gap", advice: "Consider a co-founder, contractor, or no-code approach for v1." },
        { condition: "No domain expertise", advice: "Spend 2 weeks deeply embedded with your target users." },
      ],
      moderateAdvice: [
        { condition: "Some skills present", advice: "Identify your biggest skill gap and make a plan to fill it." },
        { condition: "V1 scope needs refining", advice: "Cut features until you can ship in 6 weeks maximum." },
      ],
      strongAdvice: [
        { condition: "Strong execution capability", advice: "Focus on speed to market and rapid iteration." },
        { condition: "Domain expertise", advice: "Leverage your expertise in content marketing and thought leadership." },
      ],
    },
  ],
  verdictExamples: {
    promising_execution: [
      "Clear problem, defined ICP, and founder has relevant experience. Focus on building and testing.",
      "Strong differentiation and clear channel strategy. Execute quickly and iterate.",
    ],
    promising_needs_validation: [
      "Promising but needs a sharper wedge against existing tools.",
      "Good problem clarity but pricing needs validation with real customers.",
    ],
    high_risk_improve_or_pivot: [
      "High risk as a generic tool; consider niching down or adding a stronger daily-use workflow.",
      "Competition is intense—consider a vertical focus or different business model.",
    ],
  },
  analysisInstructions: [
    "Evaluate the SaaS idea using the 6 pillars framework.",
    "Focus on problem urgency, willingness to pay, and retention potential.",
    "Consider switching costs from existing tools and acquisition difficulty.",
    "Always provide constructive feedback and a path forward, even for weak ideas.",
  ],
};

// ============================================================================
// Local Service Business Framework
// ============================================================================
export const localServiceFramework: CategoryFramework = {
  category: "local_service",
  displayName: "Local Service Business",
  description: "Service businesses like cleaning, salon, tutoring, handyman",
  pillars: [
    {
      key: "problem_demand",
      label: "Problem & Demand",
      weight: 0.2,
      questions: [
        { question: "Is this service needed regularly in the area?" },
        { question: "Are people already paying others for it?" },
        { question: "What's the current demand-supply gap in your area?" },
      ],
      weakAdvice: [
        { condition: "Unclear local demand", advice: "Talk to 10 neighbors or local businesses about how they solve this today." },
        { condition: "No evidence of paying customers", advice: "Check how many similar providers exist within a 5–10 km radius." },
        { condition: "Seasonal demand concerns", advice: "Identify complementary services to offer during slow periods." },
      ],
      moderateAdvice: [
        { condition: "Some demand signals", advice: "Survey 20 people in your target area about frequency and willingness to pay." },
        { condition: "Competition suggests demand", advice: "Interview 5 competitors' customers about pain points." },
      ],
      strongAdvice: [
        { condition: "Clear local demand", advice: "Document peak demand times and plan capacity accordingly." },
        { condition: "Proven demand exists", advice: "Focus on differentiation since market exists." },
      ],
    },
    {
      key: "customer_context_fit",
      label: "Customer & Context Fit",
      weight: 0.15,
      questions: [
        { question: "Who exactly are you serving (students, families, offices)?" },
        { question: "Do they live/work within a reachable radius?" },
        { question: "What's their typical budget for this service?" },
      ],
      weakAdvice: [
        { condition: "Target too broad", advice: "Pick one primary segment and design your offer just for them first." },
        { condition: "Geographic mismatch", advice: "Define your initial service radius based on realistic travel time." },
        { condition: "Budget uncertainty", advice: "Research what competitors charge and survey willingness to pay." },
      ],
      moderateAdvice: [
        { condition: "Segment identified but untested", advice: "Interview 10 potential customers from your target segment." },
        { condition: "Some geographic clarity", advice: "Map your ideal first 20 customers by location." },
      ],
      strongAdvice: [
        { condition: "Clear segment focus", advice: "Build your entire marketing message for this one segment." },
        { condition: "Strong geographic fit", advice: "Consider expansion areas for phase 2." },
      ],
    },
    {
      key: "competition_differentiation",
      label: "Competition & Differentiation",
      weight: 0.2,
      questions: [
        { question: "How many similar providers exist nearby?" },
        { question: "What will make people choose you first?" },
        { question: "What's your unique value proposition?" },
      ],
      weakAdvice: [
        { condition: "No clear differentiator", advice: "List 3 ways you can clearly stand out (faster response, specialized focus, premium, mobile, etc.)." },
        { condition: "Crowded market", advice: "Consider a niche within the service (e.g., eco-friendly, luxury, for-women-only)." },
        { condition: "Competing on price alone", advice: "Find non-price differentiators to avoid race to bottom." },
      ],
      moderateAdvice: [
        { condition: "Some differentiation ideas", advice: "Test your differentiator with 10 potential customers." },
        { condition: "Moderate competition", advice: "Interview competitor customers about what they wish was different." },
      ],
      strongAdvice: [
        { condition: "Clear differentiation", advice: "Build your brand and marketing around your unique angle." },
        { condition: "Underserved niche identified", advice: "Focus all energy on dominating this niche first." },
      ],
    },
    {
      key: "business_model_money",
      label: "Business Model & Money",
      weight: 0.2,
      questions: [
        { question: "After costs (transport, supplies, helpers), is there enough profit per job?" },
        { question: "Can you get repeat clients?" },
        { question: "What's your path to covering monthly expenses?" },
      ],
      weakAdvice: [
        { condition: "Unclear unit economics", advice: "Calculate your true cost per job including time, transport, and supplies." },
        { condition: "No repeat business model", advice: "Create simple bundles or subscriptions (weekly, monthly) for recurring revenue." },
        { condition: "Margin concerns", advice: "Find ways to increase average ticket size or reduce costs." },
      ],
      moderateAdvice: [
        { condition: "Some profit potential", advice: "Price your first 10 jobs to learn true costs and optimize." },
        { condition: "Some repeat potential", advice: "Design a simple loyalty or subscription offer." },
      ],
      strongAdvice: [
        { condition: "Clear profitable unit economics", advice: "Focus on increasing capacity and reducing variable costs." },
        { condition: "Strong repeat business model", advice: "Prioritize customer retention and referral programs." },
      ],
    },
    {
      key: "acquisition_channels",
      label: "Acquisition & Channels",
      weight: 0.15,
      questions: [
        { question: "How will customers find you (WhatsApp, Facebook groups, flyers, referrals)?" },
        { question: "Do you have trust anchors (photos, testimonials)?" },
        { question: "What's your first 10 customers strategy?" },
      ],
      weakAdvice: [
        { condition: "No acquisition plan", advice: "Start with referrals and WhatsApp before paid ads. Aim for your first 5–10 clients this way." },
        { condition: "No social proof", advice: "Offer free or discounted services to get photos and testimonials." },
        { condition: "High acquisition cost expected", advice: "Focus on referral incentives and word-of-mouth first." },
      ],
      moderateAdvice: [
        { condition: "Some channel ideas", advice: "Test 2 channels this week: one online, one offline." },
        { condition: "Building social proof", advice: "Ask your first 5 customers for testimonials and reviews." },
      ],
      strongAdvice: [
        { condition: "Clear acquisition strategy", advice: "Document what's working and systematize the process." },
        { condition: "Strong referral base", advice: "Create a formal referral program with incentives." },
      ],
    },
    {
      key: "execution_founder_fit",
      label: "Execution & Founder Fit",
      weight: 0.1,
      questions: [
        { question: "Do you have the skills/equipment?" },
        { question: "Any regulations/certifications needed?" },
        { question: "Can you personally deliver the service initially?" },
      ],
      weakAdvice: [
        { condition: "Skills gap", advice: "Start with a minimal setup and validate demand before buying more equipment." },
        { condition: "Regulatory concerns", advice: "Research local licensing requirements before launching." },
        { condition: "Can't deliver personally", advice: "Find a skilled partner or contractor to start." },
      ],
      moderateAdvice: [
        { condition: "Some skills present", advice: "Identify training or certifications that could strengthen your offering." },
        { condition: "Partial equipment", advice: "Start with what you have, upgrade as revenue justifies." },
      ],
      strongAdvice: [
        { condition: "Strong skills and equipment", advice: "Focus on building systems for scaling later." },
        { condition: "Compliant and certified", advice: "Use certifications in marketing for trust." },
      ],
    },
  ],
  verdictExamples: {
    promising_execution: [
      "Service can work locally with clear demand and a repeat-client model. Focus on execution.",
      "Strong skills, defined service area, and differentiation. Start acquiring customers.",
    ],
    promising_needs_validation: [
      "Promising but needs to validate pricing and customer acquisition channels.",
      "Good service idea but unit economics need testing with first 10 customers.",
    ],
    high_risk_improve_or_pivot: [
      "Service can work locally if you secure a clear niche and a repeat-client model.",
      "Consider starting with a smaller service area or more focused offering.",
    ],
  },
  analysisInstructions: [
    "Evaluate local service businesses using the 6 pillars framework.",
    "Focus on local demand, service radius, and repeat business potential.",
    "Consider regulatory requirements and equipment needs.",
    "Always provide constructive feedback with specific local action items.",
  ],
};

// ============================================================================
// Restaurant / Food Truck Framework
// ============================================================================
export const restaurantFramework: CategoryFramework = {
  category: "local_service",
  displayName: "Restaurant / Food Truck",
  description: "Food service businesses including restaurants, food trucks, and cloud kitchens",
  pillars: [
    {
      key: "problem_demand",
      label: "Problem & Demand",
      weight: 0.2,
      questions: [
        { question: "Is there demand for this cuisine/price point/location?" },
        { question: "Are there lines at similar places, or gaps at key hours?" },
        { question: "What's the foot traffic like at your target location?" },
      ],
      weakAdvice: [
        { condition: "Unclear demand", advice: "Run a pop-up or delivery-only test weekend before committing to a full venue." },
        { condition: "No location research", advice: "Count foot traffic at your target location at breakfast, lunch, and dinner." },
        { condition: "Untested cuisine", advice: "Test your menu at farmers markets or pop-ups first." },
      ],
      moderateAdvice: [
        { condition: "Some demand signals", advice: "Survey 30 potential customers in the area about dining preferences." },
        { condition: "Competition suggests demand", advice: "Identify what nearby options are missing." },
      ],
      strongAdvice: [
        { condition: "Clear demand validated", advice: "Focus on capacity planning and operations." },
        { condition: "Proven concept in similar markets", advice: "Adapt your approach to local preferences." },
      ],
    },
    {
      key: "customer_context_fit",
      label: "Customer & Context Fit",
      weight: 0.15,
      questions: [
        { question: "Who are your primary customers (office workers, students, families)?" },
        { question: "Are there enough of them nearby at meal times?" },
        { question: "What's their typical dining budget?" },
      ],
      weakAdvice: [
        { condition: "Unclear target customer", advice: "Map where your customers are at breakfast, lunch, dinner, and adapt hours/menu." },
        { condition: "Location-customer mismatch", advice: "Consider different locations or day-parts." },
        { condition: "Budget mismatch", advice: "Adjust menu pricing to match local spending patterns." },
      ],
      moderateAdvice: [
        { condition: "Target identified but untested", advice: "Interview 10 potential customers about their dining habits." },
        { condition: "Some location fit", advice: "Test specific day-parts before full commitment." },
      ],
      strongAdvice: [
        { condition: "Clear customer-location fit", advice: "Design menu and hours specifically for your core customer." },
        { condition: "Strong foot traffic alignment", advice: "Plan capacity for peak hours." },
      ],
    },
    {
      key: "competition_differentiation",
      label: "Competition & Differentiation",
      weight: 0.2,
      questions: [
        { question: "How many similar options exist nearby?" },
        { question: "Why would someone cross the street for you?" },
        { question: "What's your signature or hook?" },
      ],
      weakAdvice: [
        { condition: "No clear hook", advice: "Define one hook: signature dish, speed, health angle, vibe, or story." },
        { condition: "Crowded market", advice: "Consider a niche cuisine, dietary focus, or unique experience." },
        { condition: "Competing on price alone", advice: "Find experiential or quality differentiators." },
      ],
      moderateAdvice: [
        { condition: "Some differentiation ideas", advice: "Test your hook with potential customers before investing." },
        { condition: "Some competition gaps", advice: "Focus on the underserved gap in the market." },
      ],
      strongAdvice: [
        { condition: "Clear differentiation", advice: "Build all marketing around your unique hook." },
        { condition: "Validated hook", advice: "Make it the centerpiece of your brand identity." },
      ],
    },
    {
      key: "business_model_money",
      label: "Business Model & Money",
      weight: 0.2,
      questions: [
        { question: "Estimated daily covers vs break-even?" },
        { question: "Delivery vs dine-in mix?" },
        { question: "What are your fixed and variable costs?" },
      ],
      weakAdvice: [
        { condition: "No unit economics", advice: "Run basic math: rent + salaries + ingredients vs realistic daily customers." },
        { condition: "Break-even unclear", advice: "Calculate your required covers per day to cover all costs." },
        { condition: "High fixed costs", advice: "Consider starting smaller: cloud kitchen, food truck, or pop-up." },
      ],
      moderateAdvice: [
        { condition: "Some cost analysis", advice: "Refine your food cost percentage target (aim for 28-35%)." },
        { condition: "Path to profitability unclear", advice: "Model different scenarios: slow, expected, busy." },
      ],
      strongAdvice: [
        { condition: "Clear unit economics", advice: "Focus on increasing average ticket and table turnover." },
        { condition: "Strong margins identified", advice: "Plan for scale and multiple revenue streams." },
      ],
    },
    {
      key: "acquisition_channels",
      label: "Acquisition & Channels",
      weight: 0.15,
      questions: [
        { question: "How will people hear about you (walk-by, social, delivery apps)?" },
        { question: "Can you get repeat customers?" },
        { question: "What's your opening buzz strategy?" },
      ],
      weakAdvice: [
        { condition: "No marketing plan", advice: "Plan a simple loyalty mechanic (punch card, WhatsApp list, lunchtime deals)." },
        { condition: "Relying only on walk-by", advice: "Build a social media presence and delivery app profiles." },
        { condition: "No repeat strategy", advice: "Design a loyalty program before opening." },
      ],
      moderateAdvice: [
        { condition: "Some marketing ideas", advice: "Focus on one strong channel before diversifying." },
        { condition: "Some repeat potential", advice: "Create incentives for second and third visits." },
      ],
      strongAdvice: [
        { condition: "Clear marketing strategy", advice: "Budget for opening promotions and community engagement." },
        { condition: "Strong repeat model", advice: "Track and nurture your regulars." },
      ],
    },
    {
      key: "execution_founder_fit",
      label: "Execution & Founder Fit",
      weight: 0.1,
      questions: [
        { question: "Experience running F&B?" },
        { question: "Supply chain reliability?" },
        { question: "Kitchen and staff capabilities?" },
      ],
      weakAdvice: [
        { condition: "No F&B experience", advice: "Start with a smaller format (cloud kitchen, food truck) if risk feels high." },
        { condition: "Supply chain unclear", advice: "Line up reliable suppliers before committing to a location." },
        { condition: "Staffing concerns", advice: "Plan for hiring challenges—F&B has high turnover." },
      ],
      moderateAdvice: [
        { condition: "Some F&B experience", advice: "Bring in expertise where you're weak (kitchen, front-of-house)." },
        { condition: "Some supplier relationships", advice: "Secure backup suppliers for key ingredients." },
      ],
      strongAdvice: [
        { condition: "Strong F&B background", advice: "Focus on unique concept execution." },
        { condition: "Proven operations capability", advice: "Plan for growth from day one." },
      ],
    },
  ],
  verdictExamples: {
    promising_execution: [
      "Strong location, clear concept, and F&B experience. Focus on execution and soft launch.",
      "Validated demand through pop-up testing. Ready to commit to full operation.",
    ],
    promising_needs_validation: [
      "Concept needs stronger numbers or differentiation; consider starting smaller or adjusting menu.",
      "Good idea but location economics need validation first.",
    ],
    high_risk_improve_or_pivot: [
      "Consider starting with a cloud kitchen or food truck before full restaurant investment.",
      "Test the concept with delivery-only before committing to a physical location.",
    ],
  },
  analysisInstructions: [
    "Evaluate restaurant and food concepts using the 6 pillars framework.",
    "Focus on location fit, foot traffic, and break-even analysis.",
    "Consider F&B-specific risks: spoilage, staffing, seasonality.",
    "Always suggest lower-risk entry points for unvalidated concepts.",
  ],
};

// ============================================================================
// Agency / Freelancer / Marketing Services Framework
// ============================================================================
export const agencyFramework: CategoryFramework = {
  category: "consulting",
  displayName: "Agency / Freelancer / Marketing Services",
  description: "Service businesses providing marketing, design, consulting, or other professional services",
  pillars: [
    {
      key: "problem_demand",
      label: "Problem & Demand",
      weight: 0.2,
      questions: [
        { question: "Do target clients already pay for this outcome (more leads, better content)?" },
        { question: "Is the pain clear and urgent?" },
        { question: "What triggers clients to seek this service?" },
      ],
      weakAdvice: [
        { condition: "Vague value proposition", advice: "Reframe from 'I do marketing' to 'I get X result for Y niche'." },
        { condition: "No evidence of demand", advice: "Interview 10 potential clients about their last 3 budgets for this service." },
        { condition: "Clients don't see urgency", advice: "Identify the trigger events that create urgency (launch, growth, crisis)." },
      ],
      moderateAdvice: [
        { condition: "Some demand signals", advice: "Test your offer with 5 prospects before building full service." },
        { condition: "Unclear urgency", advice: "Focus on clients in growth or crisis moments." },
      ],
      strongAdvice: [
        { condition: "Clear demand validated", advice: "Document case studies and results for marketing." },
        { condition: "Strong pain identified", advice: "Build your entire positioning around solving this pain." },
      ],
    },
    {
      key: "customer_context_fit",
      label: "Customer & Context Fit",
      weight: 0.15,
      questions: [
        { question: "Clear niche (restaurants, coaches, real estate, local shops)?" },
        { question: "Can they afford your fees?" },
        { question: "Do they have decision-making authority?" },
      ],
      weakAdvice: [
        { condition: "No niche focus", advice: "Pick one narrow niche and talk to 5–10 prospects about their last 3–6 months." },
        { condition: "Budget mismatch", advice: "Either target higher-budget clients or create lower-cost packages." },
        { condition: "Wrong decision-maker", advice: "Map the buying process and who holds budget authority." },
      ],
      moderateAdvice: [
        { condition: "Niche identified but broad", advice: "Narrow to a specific sub-segment you can dominate." },
        { condition: "Some budget clarity", advice: "Test different pricing with your next 5 proposals." },
      ],
      strongAdvice: [
        { condition: "Clear niche focus", advice: "Build all content and positioning for this one niche." },
        { condition: "Budget-aligned clients", advice: "Create premium tiers for clients with larger budgets." },
      ],
    },
    {
      key: "competition_differentiation",
      label: "Competition & Differentiation",
      weight: 0.2,
      questions: [
        { question: "How many similar agencies/freelancers exist?" },
        { question: "What makes you different?" },
        { question: "Why would someone choose you over cheaper alternatives?" },
      ],
      weakAdvice: [
        { condition: "No differentiation", advice: "Design 1–2 simple offers with outcomes and timelines instead of vague 'services'." },
        { condition: "Crowded market", advice: "Specialize in one niche, platform, or outcome." },
        { condition: "Competing on price", advice: "Find value-based differentiators: speed, expertise, guarantee." },
      ],
      moderateAdvice: [
        { condition: "Some differentiation", advice: "Test your unique angle with potential clients." },
        { condition: "Some competition gaps", advice: "Focus on the underserved segment or capability." },
      ],
      strongAdvice: [
        { condition: "Clear differentiation", advice: "Make your unique approach the centerpiece of marketing." },
        { condition: "Niche expertise", advice: "Build thought leadership content around your specialty." },
      ],
    },
    {
      key: "business_model_money",
      label: "Business Model & Money",
      weight: 0.2,
      questions: [
        { question: "Pricing (retainer, project, performance)?" },
        { question: "Minimum number of clients for your income goal?" },
        { question: "What's your capacity constraint?" },
      ],
      weakAdvice: [
        { condition: "Pricing unclear", advice: "Calculate: target income ÷ average retainer = clients needed. Check if realistic." },
        { condition: "Capacity unclear", advice: "Define your maximum client load before taking more." },
        { condition: "No recurring revenue", advice: "Design a retainer or ongoing service component." },
      ],
      moderateAdvice: [
        { condition: "Some pricing defined", advice: "Test value-based pricing with your next 3 clients." },
        { condition: "Some capacity planning", advice: "Document your service delivery process to identify bottlenecks." },
      ],
      strongAdvice: [
        { condition: "Clear pricing validated", advice: "Consider raising prices and adding premium tiers." },
        { condition: "Strong unit economics", advice: "Plan for scale: hiring, systems, or productization." },
      ],
    },
    {
      key: "acquisition_channels",
      label: "Acquisition & Channels",
      weight: 0.15,
      questions: [
        { question: "Will you get clients via referrals, cold outreach, inbound content?" },
        { question: "Do you have social proof?" },
        { question: "What's your first 5 clients strategy?" },
      ],
      weakAdvice: [
        { condition: "No acquisition plan", advice: "Plan a 30-day outreach sprint: DMs, calls, and valuable content to your niche." },
        { condition: "No social proof", advice: "Offer a discounted pilot project to build case studies." },
        { condition: "Relying only on referrals", advice: "Build an outbound system alongside referrals." },
      ],
      moderateAdvice: [
        { condition: "Some acquisition ideas", advice: "Test one channel systematically for 30 days." },
        { condition: "Some social proof", advice: "Create case studies and testimonials from past work." },
      ],
      strongAdvice: [
        { condition: "Clear acquisition strategy", advice: "Double down on what's working and document the process." },
        { condition: "Strong social proof", advice: "Use case studies in all marketing materials." },
      ],
    },
    {
      key: "execution_founder_fit",
      label: "Execution & Founder Fit",
      weight: 0.1,
      questions: [
        { question: "Skills in delivery (ads, content, strategy)?" },
        { question: "Can you deliver consistently?" },
        { question: "What's your capacity for client work?" },
      ],
      weakAdvice: [
        { condition: "Skills gap", advice: "Start with a smaller promise you can over-deliver on to build testimonials." },
        { condition: "Consistency concerns", advice: "Build templates and processes before taking more clients." },
        { condition: "Capacity limited", advice: "Consider partnerships or subcontractors for overflow." },
      ],
      moderateAdvice: [
        { condition: "Some skills present", advice: "Invest in filling your biggest skill gap." },
        { condition: "Some delivery systems", advice: "Document and improve your delivery process." },
      ],
      strongAdvice: [
        { condition: "Strong skills and delivery", advice: "Build thought leadership content showcasing expertise." },
        { condition: "Proven consistency", advice: "Consider scaling with team or productization." },
      ],
    },
  ],
  verdictExamples: {
    promising_execution: [
      "Clear niche, validated demand, and delivery capability. Focus on client acquisition.",
      "Strong portfolio and referral base. Scale systematically.",
    ],
    promising_needs_validation: [
      "Service is viable but needs a sharper niche and offer before investing in complex systems.",
      "Good skills but pricing and positioning need testing with real clients.",
    ],
    high_risk_improve_or_pivot: [
      "Consider starting with project work before retainers to build portfolio.",
      "Niche down significantly or find a unique angle before competing with generalists.",
    ],
  },
  analysisInstructions: [
    "Evaluate agency and freelance services using the 6 pillars framework.",
    "Focus on niche clarity, pricing model, and acquisition strategy.",
    "Consider capacity constraints and sustainable workload.",
    "Always suggest ways to sharpen positioning and prove value.",
  ],
};

// ============================================================================
// Online Education / Coaching Framework
// ============================================================================
export const educationCoachingFramework: CategoryFramework = {
  category: "edtech",
  displayName: "Online Education / Coaching",
  description: "Online courses, coaching programs, and educational products",
  pillars: [
    {
      key: "problem_demand",
      label: "Problem & Demand",
      weight: 0.2,
      questions: [
        { question: "Clear transformation (pass exam, get job, lose weight)?" },
        { question: "Do people already buy courses/coaching for this?" },
        { question: "What's the urgency to learn this?" },
      ],
      weakAdvice: [
        { condition: "Unclear transformation", advice: "Write your promise as 'In X weeks, I help Y do Z' and test interest." },
        { condition: "No evidence of demand", advice: "Search for competing courses and assess their sales." },
        { condition: "Nice-to-have not urgent", advice: "Focus on must-have skills or urgent life transitions." },
      ],
      moderateAdvice: [
        { condition: "Some demand signals", advice: "Pre-sell to 5 people before building the full course." },
        { condition: "Transformation unclear", advice: "Interview 5 potential students about their goals and obstacles." },
      ],
      strongAdvice: [
        { condition: "Clear transformation promise", advice: "Build marketing around specific, measurable outcomes." },
        { condition: "Proven demand", advice: "Focus on differentiation from existing options." },
      ],
    },
    {
      key: "customer_context_fit",
      label: "Customer & Context Fit",
      weight: 0.15,
      questions: [
        { question: "Do they have time, internet, and money to participate?" },
        { question: "Cultural attitudes to paying coaches?" },
        { question: "What's their learning context (career, hobby, necessity)?" },
      ],
      weakAdvice: [
        { condition: "Audience constraints unclear", advice: "Run a small cohort or 1-1 beta with 3–5 people to learn before scaling." },
        { condition: "Budget mismatch", advice: "Adjust pricing or create tiered access for different budgets." },
        { condition: "Time constraints", advice: "Design for time-poor learners: short modules, flexible completion." },
      ],
      moderateAdvice: [
        { condition: "Some audience clarity", advice: "Survey 20 potential students about learning preferences and budget." },
        { condition: "Some budget fit", advice: "Test different price points with early access offers." },
      ],
      strongAdvice: [
        { condition: "Clear audience fit", advice: "Design the entire experience around their specific context." },
        { condition: "Budget-aligned audience", advice: "Consider premium tiers for motivated learners." },
      ],
    },
    {
      key: "competition_differentiation",
      label: "Competition & Differentiation",
      weight: 0.2,
      questions: [
        { question: "Free/cheap alternatives (YouTube, MOOCs)?" },
        { question: "Why choose you?" },
        { question: "What do competing courses lack?" },
      ],
      weakAdvice: [
        { condition: "Free alternatives exist", advice: "Lean on accountability, community, and local context instead of just content." },
        { condition: "No differentiation", advice: "Offer something free content can't: feedback, certification, community, guarantee." },
        { condition: "Competing on content alone", advice: "Focus on transformation support, not just information delivery." },
      ],
      moderateAdvice: [
        { condition: "Some differentiation ideas", advice: "Test your unique angle with potential students." },
        { condition: "Some gaps in alternatives", advice: "Double down on what free resources can't provide." },
      ],
      strongAdvice: [
        { condition: "Clear differentiation", advice: "Build marketing around your unique transformation method." },
        { condition: "Unique approach validated", advice: "Consider systematizing your method into a brand." },
      ],
    },
    {
      key: "business_model_money",
      label: "Business Model & Money",
      weight: 0.2,
      questions: [
        { question: "Pricing vs income in your region?" },
        { question: "Group vs 1-1 vs self-paced?" },
        { question: "What's your revenue model (one-time, subscription, cohort)?" },
      ],
      weakAdvice: [
        { condition: "Pricing unclear", advice: "Pre-sell a cohort with a clear date and curriculum before recording everything." },
        { condition: "Format unclear", advice: "Start with a small group cohort to learn delivery before scaling." },
        { condition: "No recurring revenue", advice: "Design a continuation path: advanced courses, membership, ongoing coaching." },
      ],
      moderateAdvice: [
        { condition: "Some pricing ideas", advice: "Test pricing with early-bird offers." },
        { condition: "Some format clarity", advice: "Run one cohort to learn optimal format." },
      ],
      strongAdvice: [
        { condition: "Clear pricing validated", advice: "Consider value-based pricing tied to outcomes." },
        { condition: "Strong format fit", advice: "Document your delivery system for scale." },
      ],
    },
    {
      key: "acquisition_channels",
      label: "Acquisition & Channels",
      weight: 0.15,
      questions: [
        { question: "Audience already (email list, social following)?" },
        { question: "Can you reach them cheaply?" },
        { question: "What's your launch strategy?" },
      ],
      weakAdvice: [
        { condition: "No audience", advice: "Host a free workshop or challenge as a feeder into your paid offer." },
        { condition: "No channel strategy", advice: "Build audience through valuable free content before launching paid." },
        { condition: "High acquisition cost expected", advice: "Start with organic content and community before paid ads." },
      ],
      moderateAdvice: [
        { condition: "Some audience", advice: "Nurture your list with valuable content before selling." },
        { condition: "Some reach", advice: "Test one content channel consistently for 30 days." },
      ],
      strongAdvice: [
        { condition: "Established audience", advice: "Launch to your warmest leads first for testimonials." },
        { condition: "Multiple reach channels", advice: "Systematize content production for consistent reach." },
      ],
    },
    {
      key: "execution_founder_fit",
      label: "Execution & Founder Fit",
      weight: 0.1,
      questions: [
        { question: "Expertise and credibility?" },
        { question: "Time to deliver live?" },
        { question: "Teaching ability?" },
      ],
      weakAdvice: [
        { condition: "Credibility gap", advice: "Start with a small, time-bound program to test energy and results." },
        { condition: "Time constraints", advice: "Design for asynchronous delivery with limited live components." },
        { condition: "Teaching inexperience", advice: "Practice with free workshops before launching paid." },
      ],
      moderateAdvice: [
        { condition: "Some expertise", advice: "Document your results and build credibility content." },
        { condition: "Some teaching experience", advice: "Get feedback on your teaching style from beta students." },
      ],
      strongAdvice: [
        { condition: "Strong expertise", advice: "Build thought leadership content to establish authority." },
        { condition: "Proven teaching ability", advice: "Consider scaling with additional instructors." },
      ],
    },
  ],
  verdictExamples: {
    promising_execution: [
      "Clear transformation, established audience, and proven expertise. Launch and iterate.",
      "Validated demand through waitlist and pre-sales. Ready to deliver.",
    ],
    promising_needs_validation: [
      "Idea could work with a clearer outcome, tighter audience, and pre-sales.",
      "Good expertise but needs audience building before course launch.",
    ],
    high_risk_improve_or_pivot: [
      "Build audience and test demand with free content before investing in course creation.",
      "Consider starting with 1-1 coaching to validate approach before scaling.",
    ],
  },
  analysisInstructions: [
    "Evaluate online education and coaching using the 6 pillars framework.",
    "Focus on transformation clarity, competition with free content, and audience access.",
    "Consider delivery format constraints and sustainable teaching load.",
    "Always suggest ways to validate before building full course.",
  ],
};

// ============================================================================
// Framework Registry
// ============================================================================
export const PILLAR_FRAMEWORKS: Record<string, CategoryFramework> = {
  saas: saasFramework,
  tech: saasFramework, // Tech ideas use SaaS framework
  local_service: localServiceFramework,
  restaurant: restaurantFramework,
  food_truck: restaurantFramework,
  consulting: agencyFramework,
  coaching: agencyFramework,
  agency: agencyFramework,
  marketing_services: agencyFramework,
  edtech: educationCoachingFramework,
  online_education: educationCoachingFramework,
  online_coaching: educationCoachingFramework,
  ecommerce: saasFramework, // Base on SaaS, adapted
  marketplace: saasFramework, // Base on SaaS, adapted
  health_wellness: localServiceFramework, // Base on local service, adapted
  finance: saasFramework, // Base on SaaS, adapted
  legal_law: agencyFramework, // Base on agency, adapted
};

// Get framework for a category
export function getPillarFramework(category: string): CategoryFramework {
  const framework = PILLAR_FRAMEWORKS[category.toLowerCase()];
  return framework ?? saasFramework; // Default to SaaS framework
}

// Get all pillar keys
export const PILLAR_KEYS: PillarKey[] = [
  "problem_demand",
  "customer_context_fit",
  "competition_differentiation",
  "business_model_money",
  "acquisition_channels",
  "execution_founder_fit",
];

// Pillar labels for display
export const PILLAR_LABELS: Record<PillarKey, string> = {
  problem_demand: "Problem & Demand",
  customer_context_fit: "Customer & Context Fit",
  competition_differentiation: "Competition & Differentiation",
  business_model_money: "Business Model & Money",
  acquisition_channels: "Acquisition & Channels",
  execution_founder_fit: "Execution & Founder Fit",
};
