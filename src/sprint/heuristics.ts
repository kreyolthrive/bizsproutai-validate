import type { MilestoneHeuristicInput, MilestoneStatus } from "@/src/sprint/types";

type Criterion = {
  key?: string;
  label?: string;
  score?: number;
};

const TASK_GROUPS = {
  ideaCustomer: ["w1_t1", "w1_t2"],
  offer: ["w1_t3"],
  assets: ["w1_t4", "w1_t5", "w1_t6", "w1_t8", "w1_t9"],
  channels: ["w1_t7", "w1_t10"],
};

const PATTERNS = {
  saas: {
    idea: [/problem/, /customer/, /pain/, /segment/],
    offer: [/pricing/, /revenue/, /monet/, /subscription/, /mrr/],
    asset: [/technical/, /integration/, /distribution/, /feasibility/],
    channel: [/distribution/, /go.?to.?market/, /acquisition/, /channel/],
  },
  local_service: {
    idea: [/local demand/, /customer/, /niche/, /problem/, /icp/],
    offer: [/pricing/, /purchasing/, /operations/, /service/, /capacity/],
    asset: [/discoverability/, /maps/, /directory/, /operations/, /repeat/],
    channel: [/maps/, /directory/, /referral/, /social/, /word.?of.?mouth/],
  },
  ecommerce: {
    idea: [/demand/, /competition/, /market/, /product/],
    offer: [/unit economics/, /margin/, /pricing/, /cogs/, /ltv/],
    asset: [/supply/, /fulfillment/, /shipping/, /logistics/, /channel/],
    channel: [/marketplace/, /traffic/, /social/, /dtc/, /acquisition/],
  },
  default: {
    idea: [/problem/, /customer/, /market/],
    offer: [/pricing/, /revenue/, /viability/],
    asset: [/feasibility/, /distribution/, /launch/],
    channel: [/channel/, /marketing/, /acquisition/],
  },
};

function normalizeCategory(category?: string): keyof typeof PATTERNS {
  const normalized = (category || "").toLowerCase();
  if (normalized === "saas") return "saas";
  if (normalized === "local_service") return "local_service";
  if (normalized === "ecommerce") return "ecommerce";
  return "default";
}

function completedTaskCount(taskIds: string[], completedTaskIds: Set<string>): number {
  return taskIds.filter((id) => completedTaskIds.has(id)).length;
}

function criterionSignal(criteria: Criterion[], patterns: RegExp[], minScore = 3): boolean {
  const matches = criteria.filter((criterion) => {
    const text = `${criterion.label || ""} ${criterion.key || ""}`.toLowerCase();
    return patterns.some((pattern) => pattern.test(text));
  });

  if (matches.length === 0) return false;
  return matches.some((criterion) => Number(criterion.score || 0) >= minScore);
}

function hasBuildJob(validationData: any, target: "website" | "social" | "content" | "brand"): boolean {
  const jobs = Array.isArray(validationData?.buildJobs) ? validationData.buildJobs : [];
  return jobs.some((job: any) => job?.type === target);
}

function missingInfoMentions(validationData: any, terms: string[]): boolean {
  const blob = Array.isArray(validationData?.missingInfo)
    ? validationData.missingInfo.join(" ").toLowerCase()
    : "";
  return terms.some((term) => blob.includes(term));
}

export function computeMilestoneStatuses({
  category,
  validationData,
  completedTaskIds,
}: MilestoneHeuristicInput): MilestoneStatus[] {
  const criteria: Criterion[] = Array.isArray(validationData?.criteria) ? validationData.criteria : [];
  const patternSet = PATTERNS[normalizeCategory(category)];
  const ideaTasksDone = completedTaskCount(TASK_GROUPS.ideaCustomer, completedTaskIds);
  const offerTasksDone = completedTaskCount(TASK_GROUPS.offer, completedTaskIds);
  const assetTasksDone = completedTaskCount(TASK_GROUPS.assets, completedTaskIds);
  const channelTasksDone = completedTaskCount(TASK_GROUPS.channels, completedTaskIds);

  const ideaSignal = criterionSignal(criteria, patternSet.idea);
  const offerSignal = criterionSignal(criteria, patternSet.offer);
  const assetSignal = criterionSignal(criteria, patternSet.asset);
  const channelSignal = criterionSignal(criteria, patternSet.channel);

  const missingPricingContext = missingInfoMentions(validationData, ["price", "pricing", "margin", "cogs"]);
  const websiteBuildReady = Boolean(validationData?.buildTriggered) && hasBuildJob(validationData, "website");
  const socialBuildReady = Boolean(validationData?.buildTriggered) && hasBuildJob(validationData, "social");

  const phase1IdeaComplete = ideaTasksDone === TASK_GROUPS.ideaCustomer.length || ideaSignal;
  const phase1OfferComplete = offerTasksDone === TASK_GROUPS.offer.length || (offerSignal && !missingPricingContext);
  const phase1AssetsComplete = assetTasksDone >= 2 || (websiteBuildReady && assetSignal);

  const phase2ChannelsComplete = channelTasksDone === TASK_GROUPS.channels.length || channelSignal;
  const phase2LaunchComplete = websiteBuildReady && (socialBuildReady || phase2ChannelsComplete);
  const phase2LeadFlowComplete = websiteBuildReady && socialBuildReady && assetTasksDone >= 2 && channelTasksDone >= 1;

  const phase3SalesComplete = phase2LaunchComplete && Number(validationData?.overallScore || 0) >= 4;
  const phase3RefineComplete = phase1OfferComplete && !missingPricingContext && phase2LeadFlowComplete;
  const phase3GrowthPlanComplete = phase3SalesComplete && Array.isArray(validationData?.nextActions) &&
    validationData.nextActions.some((action: string) => /iterate|growth|next/i.test(action));

  return [
    {
      id: "p1_m1",
      phaseId: "phase_1",
      label: "Idea & customer defined",
      completed: phase1IdeaComplete,
      reason: phase1IdeaComplete
        ? "Customer definition signals are strong for this business model."
        : "Complete idea + customer tasks to ground your sprint.",
    },
    {
      id: "p1_m2",
      phaseId: "phase_1",
      label: "Offer & price locked in",
      completed: phase1OfferComplete,
      reason: phase1OfferComplete
        ? "Offer clarity and pricing viability are present."
        : "Set one clear offer and starting price before outreach.",
    },
    {
      id: "p1_m3",
      phaseId: "phase_1",
      label: "Site/app live with lead capture",
      completed: phase1AssetsComplete,
      reason: phase1AssetsComplete
        ? "Core launch assets are ready enough to share publicly."
        : "Finish brand, first page, and publish steps.",
    },
    {
      id: "p2_m1",
      phaseId: "phase_2",
      label: "Primary channels selected",
      completed: phase2ChannelsComplete,
      reason: phase2ChannelsComplete
        ? "Channel choice is now clear for this category."
        : "Pick 1-2 acquisition channels and commit for 4 weeks.",
    },
    {
      id: "p2_m2",
      phaseId: "phase_2",
      label: "Launch push executed",
      completed: phase2LaunchComplete,
      reason: phase2LaunchComplete
        ? "You are ready for a first launch push."
        : "Publish assets and outreach scripts first.",
    },
    {
      id: "p2_m3",
      phaseId: "phase_2",
      label: "Lead capture + follow-up running",
      completed: phase2LeadFlowComplete,
      reason: phase2LeadFlowComplete
        ? "Lead flow fundamentals are in place."
        : "Add lead capture and a basic follow-up loop.",
    },
    {
      id: "p3_m1",
      phaseId: "phase_3",
      label: "Direct sales push completed",
      completed: phase3SalesComplete,
      reason: phase3SalesComplete
        ? "Signals support direct asks and closing conversations."
        : "Execute launch-and-leads fundamentals first.",
    },
    {
      id: "p3_m2",
      phaseId: "phase_3",
      label: "Offer refined from objections",
      completed: phase3RefineComplete,
      reason: phase3RefineComplete
        ? "Offer is now refined by feedback and conversion blockers."
        : "Gather objections and tighten offer/FAQ.",
    },
    {
      id: "p3_m3",
      phaseId: "phase_3",
      label: "Next 90-day growth plan drafted",
      completed: phase3GrowthPlanComplete,
      reason: phase3GrowthPlanComplete
        ? "You have enough signal to plan the next 90 days."
        : "Capture lessons and draft the follow-on growth plan.",
    },
  ];
}

export function computeSprintCompletionPercent(milestones: MilestoneStatus[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((milestone) => milestone.completed).length;
  return Math.round((completed / milestones.length) * 100);
}
