import type { BuildJob, Category, CountryCode, Locale } from "../types";

export interface BuildFlowConfig {
  category: Category;
  countryCode?: CountryCode;
  locale: Locale;
  ideaSummary: string;
}

export interface BuildFlowResult {
  triggered: boolean;
  jobs: BuildJob[];
  estimatedSteps: string[];
  nextAction: string;
}

// Build job definitions by category
const categoryBuildJobs: Record<Category, BuildJob["type"][]> = {
  ecommerce: ["brand", "website", "content", "social"],
  coaching: ["brand", "website", "content", "social"],
  consulting: ["brand", "website", "content"],
  finance: ["brand", "website", "content"],
  tech: ["brand", "website", "content"],
  saas: ["brand", "website", "content"],
  marketplace: ["brand", "website", "content", "social"],
  local_service: ["brand", "website", "social"],
  health_wellness: ["brand", "website", "content", "social"],
  edtech: ["brand", "website", "content"],
  legal_law: ["brand", "website", "content"],
};

// Estimated steps by job type
const jobSteps: Record<BuildJob["type"], string[]> = {
  brand: [
    "Generate brand name options",
    "Create logo concepts",
    "Define brand colors and fonts",
    "Write brand voice guidelines",
  ],
  website: [
    "Design landing page layout",
    "Write homepage copy",
    "Create key pages (About, Services, Contact)",
    "Set up hosting and domain",
  ],
  content: [
    "Create content strategy",
    "Write foundational blog posts",
    "Develop lead magnet",
    "Create email welcome sequence",
  ],
  social: [
    "Set up social media profiles",
    "Create profile graphics",
    "Write initial posts",
    "Develop content calendar",
  ],
};

export function triggerBuildFlow(config: BuildFlowConfig): BuildFlowResult {
  // Get the jobs for this category
  const jobTypes = categoryBuildJobs[config.category] || ["brand", "website", "content"];

  // Create job objects
  const jobs: BuildJob[] = jobTypes.map(type => ({
    type,
    status: "queued" as const,
  }));

  // Gather all estimated steps
  const estimatedSteps: string[] = [];
  for (const job of jobs) {
    const steps = jobSteps[job.type] || [];
    estimatedSteps.push(`${job.type.toUpperCase()}:`);
    estimatedSteps.push(...steps.map(s => `  • ${s}`));
  }

  // Determine next action based on locale/country
  let nextAction = "Start with your brand identity - click to begin";

  if (config.locale === "fr") {
    nextAction = "Commencez par votre identité de marque - cliquez pour commencer";
  } else if (config.locale === "ht") {
    nextAction = "Kòmanse ak idantite mak ou - klike pou kòmanse";
  } else if (config.locale === "es") {
    nextAction = "Comienza con tu identidad de marca - haz clic para empezar";
  }

  return {
    triggered: true,
    jobs,
    estimatedSteps,
    nextAction,
  };
}

// Check if build flow should be triggered
export function shouldTriggerBuild(overallScore: number, hasCriticalRisks: boolean): boolean {
  // Only trigger for GO status (score >= 4.0 and no critical risks)
  return overallScore >= 4.0 && !hasCriticalRisks;
}

// Get build flow summary for display
export function getBuildFlowSummary(result: BuildFlowResult): string[] {
  const summary: string[] = [
    "🚀 Build flow triggered!",
    "",
    "Jobs queued:",
  ];

  for (const job of result.jobs) {
    summary.push(`  • ${job.type}: ${job.status}`);
  }

  summary.push("");
  summary.push(`Next: ${result.nextAction}`);

  return summary;
}
