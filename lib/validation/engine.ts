export interface ValidationResult {
  stage: string;
  stageTag: string;
  verdict: string;
  firstAsset: string;
  firstAssetReason: string;
  nextSteps: string[];
  warning: string;
}

function detectFirstAsset(
  idea: string,
  audience: string,
  stageIndex: number
): { asset: string; reason: string } {
  const text = (idea + " " + audience).toLowerCase();

  if (/booking|appointment|consultation|session|therapy|coaching call|clinic|discovery call/.test(text)) {
    return {
      asset: "Booking page",
      reason:
        "Your offer requires conversations or appointments. A booking page lets people schedule directly — no complex site needed yet.",
    };
  }
  if (/mobile app|ios app|android app|phone app|flutter|react native|on the go|field worker/.test(text)) {
    return {
      asset: "Mobile app",
      reason:
        "Your business depends on recurring mobile usage. A mobile app is the right primary asset — but validate the core workflow before building.",
    };
  }
  if (/marketplace|two.sided|connect buyers|gig platform|freelance platform|match.*provider|buy.*sell/.test(text)) {
    return {
      asset: "Marketplace web app",
      reason:
        "You are building a two-sided platform. This requires a web app — but start with a hand-matched MVP before full automation.",
    };
  }
  if (/\b(saas|software as|dashboard|workspace|user account|login|multi.tenant|platform tool|automation tool)\b/.test(text)) {
    return {
      asset: "Web app (SaaS)",
      reason:
        "Your offer has user accounts, dashboards, or workflow automation. A web app is the right asset — but validate demand with a landing page first.",
    };
  }
  if (/app|software|platform|tool|portal|login|users\b|accounts\b/.test(text)) {
    return {
      asset: "Web app",
      reason:
        "Your idea requires user interaction, stored data, or specific workflows that need a web app — not just a static site.",
    };
  }
  if (/funnel|email list|lead magnet|opt.in|nurture|drip|email sequence|free guide|free training/.test(text)) {
    return {
      asset: "Lead funnel",
      reason:
        "Your model requires nurturing leads before a sale. A funnel collects and converts — start with one clear opt-in and a short email sequence.",
    };
  }
  if (/store|shop|ecommerce|product|sell online|dropship|physical product|inventory/.test(text)) {
    return {
      asset: "E-commerce store",
      reason:
        "You are selling a physical or digital product online. A simple store (Shopify, Gumroad, or similar) is the right starting point.",
    };
  }

  const fallbacks: { asset: string; reason: string }[] = [
    {
      asset: "Simple landing page (offer test)",
      reason:
        "Before you build anything complex, test whether people respond to your offer with a single clear page.",
    },
    {
      asset: "Landing page or booking page",
      reason:
        "You have an offer — now it needs a home. One clear page with a single CTA is all you need to start getting traction.",
    },
    {
      asset: "Unified website or funnel",
      reason:
        "You have pieces — now connect them. One clear path from awareness to conversion is more powerful than multiple disconnected assets.",
    },
    {
      asset: "Full launch system",
      reason:
        "You are ready. Connect your asset, outreach, and follow-up into one working system and start sending.",
    },
  ];
  return fallbacks[stageIndex] ?? fallbacks[0];
}

export function computeValidationResult(
  stageIndex: number,
  idea: string,
  audience: string,
  hasLiveAsset: boolean,
  hasTraction: boolean
): ValidationResult {
  const { asset, reason } = detectFirstAsset(idea, audience, stageIndex);

  const base: ValidationResult[] = [
    {
      stage: "Idea Stage",
      stageTag: "Idea Stage",
      verdict: "Too early to build. You need offer clarity first.",
      firstAsset: asset,
      firstAssetReason: reason,
      nextSteps: [
        "Write one sentence: who you help, what problem you solve, and what you give them",
        "Share that sentence with 5 real people in your target audience — watch their reaction",
        "Ask one of them: 'Would you pay for this? What would stop you?' — record the answer",
        "Only build after at least 3 people say they would pay or sign up",
      ],
      warning:
        "Do not build anything yet. Every day you spend building the wrong thing is a day you could spend validating the right one. Most founders who skip this step rebuild everything within 90 days.",
    },
    {
      stage: "First Asset Stage",
      stageTag: "First Asset Stage",
      verdict: "Clear enough to launch. Build the minimum asset now.",
      firstAsset: asset,
      firstAssetReason: reason,
      nextSteps: [
        "Choose your minimum asset: one page, one CTA, one clear offer — no more",
        "Launch it this week — imperfect and live beats perfect and invisible",
        "Write 5 direct outreach messages to people you already know who fit your audience",
        "Follow up within 24 hours of every response — speed is your biggest advantage right now",
      ],
      warning:
        "Do not wait for the design to be perfect. A clear, specific page outperforms a polished but vague one every time. Ship it today and improve from real feedback — not from your imagination.",
    },
    {
      stage: hasLiveAsset ? "Optimization Stage" : "Assembly Stage",
      stageTag: hasLiveAsset ? "Optimization Stage" : "Assembly Stage",
      verdict: hasLiveAsset
        ? "You have pieces. Connect them before building more."
        : "You have the components. Now connect them into one clear path.",
      firstAsset: asset,
      firstAssetReason: reason,
      nextSteps: [
        "List every tool, page, and asset you have — then map the path a client would actually take",
        "Identify the single moment where most people drop off or get confused",
        "Fix that one point before touching anything else",
        "Consolidate to one traffic or outreach source — depth beats breadth right now",
      ],
      warning:
        "Do not add more tools, pages, or platforms before fixing what you already have. Every new addition before consolidation makes the problem harder to diagnose. Stop adding — start connecting.",
    },
    {
      stage: hasTraction ? "Launch + Scale Stage" : "Launch-Ready Stage",
      stageTag: hasTraction ? "Launch + Scale Stage" : "Launch-Ready Stage",
      verdict: hasTraction
        ? "You have traction. Now build systems to scale what works."
        : "Clear enough to launch. You need execution support, not more planning.",
      firstAsset: asset,
      firstAssetReason: reason,
      nextSteps: hasTraction
        ? [
            "Document what is working: which channel, which message, which offer converts best",
            "Systematize the outreach or acquisition that produced your best results",
            "Set up a follow-up sequence so no lead goes cold after first contact",
            "Build the next layer only after current conversion is above 10%",
          ]
        : [
            "Lock your offer messaging and CTA today — no more adjusting, start sending",
            "Test your booking or checkout flow end to end before launch day",
            "Prepare your first 30 outreach messages and schedule them over the next 5 days",
            "Set a hard public launch date — tell someone you trust so you are accountable",
          ],
      warning: hasTraction
        ? "Do not scale what you have not confirmed converts. Scaling a broken funnel just amplifies the problem. Fix conversion first, then scale."
        : "Do not delay for perfection. Launching at 80% ready teaches you more than planning at 100% ready. The market will tell you what to fix — your imagination cannot.",
    },
  ];

  return base[stageIndex] ?? base[0];
}
