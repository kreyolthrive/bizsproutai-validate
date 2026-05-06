import { getEngineTranslations } from "./engineTranslations";

export interface ValidationResult {
  stage: string;
  /** Internal English stage tag — used for logic matching (readiness %, upsell copy). Never changes locale. */
  stageTag: string;
  /** Localised display name for the stage, shown in the UI badge. Equals stageTag for English. */
  stageTagDisplay: string;
  verdict: string;
  firstAsset: string;
  firstAssetReason: string;
  nextSteps: string[];
  warning: string;
  /** Domain label derived from the detected first asset, e.g. "SaaS", "service / appointment". Null when the idea fell through to a generic stage-based fallback. */
  domainLabel: string | null;
  /** Present when the idea description was too brief to generate precise recommendations. */
  ideaQualityNote: string | null;
}

// ─── Base result type (without computed enrichment fields) ────────────────────

type BaseResult = Omit<ValidationResult, "domainLabel" | "ideaQualityNote">;

// ─── Keyword detection (language-agnostic — matches English input text) ───────

function detectAssetKey(
  idea: string,
  audience: string,
  stageIndex: number
): keyof import("./engineTranslations").LocaleEngineData["assets"] {
  const text = (idea + " " + audience).toLowerCase();

  if (/booking|appointment|consultation|session|therapy|coaching call|clinic|discovery call/.test(text)) {
    return "booking";
  }
  if (/mobile app|ios app|android app|phone app|flutter|react native|on the go|field worker/.test(text)) {
    return "mobileApp";
  }
  if (/marketplace|two.sided|connect buyers|gig platform|freelance platform|match.*provider|buy.*sell/.test(text)) {
    return "marketplace";
  }
  if (/\b(saas|software as|dashboard|workspace|user account|login|multi.tenant|platform tool|automation tool)\b/.test(text)) {
    return "saas";
  }
  if (/app|software|platform|tool|portal|login|users\b|accounts\b/.test(text)) {
    return "webApp";
  }
  if (/funnel|email list|lead magnet|opt.in|nurture|drip|email sequence|free guide|free training/.test(text)) {
    return "leadFunnel";
  }
  if (/store|shop|ecommerce|product|sell online|dropship|physical product|inventory/.test(text)) {
    return "ecommerce";
  }

  // Stage-index fallbacks
  const fallbackKeys = ["fallback0", "fallback1", "fallback2", "fallback3"] as const;
  return fallbackKeys[stageIndex] ?? "fallback0";
}

// ─── Domain label key detection ───────────────────────────────────────────────

type DomainKey = keyof import("./engineTranslations").LocaleEngineData["domainLabels"] | null;

function detectDomainKey(
  assetKey: keyof import("./engineTranslations").LocaleEngineData["assets"]
): DomainKey {
  if (assetKey === "booking") return "booking";
  if (assetKey === "mobileApp") return "mobileApp";
  if (assetKey === "marketplace") return "marketplace";
  if (assetKey === "saas") return "saas";
  if (assetKey === "webApp") return "webApp";
  if (assetKey === "leadFunnel") return "leadGeneration";
  if (assetKey === "ecommerce") return "ecommerce";
  return null; // fallback assets have no specific domain
}

// ─── English-only stage tag map (for logic matching, never translated) ────────

const EN_STAGE_TAGS: Record<
  | "idea"
  | "firstAsset"
  | "assembly"
  | "optimization"
  | "launchReady"
  | "launchScale",
  string
> = {
  idea: "Idea Stage",
  firstAsset: "First Asset Stage",
  assembly: "Assembly Stage",
  optimization: "Optimization Stage",
  launchReady: "Launch-Ready Stage",
  launchScale: "Launch + Scale Stage",
};

// ─── Idea quality check (logic — not locale-dependent) ───────────────────────

function needsQualityNote(idea: string, audience: string): boolean {
  const wordCount = idea.trim().split(/\s+/).filter(Boolean).length;
  const hasAudience = audience.trim().length > 3;
  return wordCount < 20 && !hasAudience;
}

// ─── Main computation ─────────────────────────────────────────────────────────

export function computeValidationResult(
  stageIndex: number,
  idea: string,
  audience: string,
  hasLiveAsset: boolean,
  hasTraction: boolean,
  locale: string = "en"
): ValidationResult {
  const t = getEngineTranslations(locale);

  // Detect asset using keyword matching (idea text is always in the user's language,
  // but the keywords we match are generic enough to work cross-locale for the most
  // common terms, and English senders still dominate). For non-English submissions
  // the fallback path is acceptable and produces a useful generic recommendation.
  const assetKey = detectAssetKey(idea, audience, stageIndex);
  const { asset, reason } = t.assets[assetKey];

  const domainKey = detectDomainKey(assetKey);
  const domainLabel = domainKey ? t.domainLabels[domainKey] : null;

  // Select stage content
  let stageKey: "idea" | "firstAsset" | "assembly" | "optimization" | "launchReady" | "launchScale";

  if (stageIndex === 0) {
    stageKey = "idea";
  } else if (stageIndex === 1) {
    stageKey = "firstAsset";
  } else if (stageIndex === 2) {
    stageKey = hasLiveAsset ? "optimization" : "assembly";
  } else {
    stageKey = hasTraction ? "launchScale" : "launchReady";
  }

  const stageContent = t.stages[stageKey];
  const englishStageTag = EN_STAGE_TAGS[stageKey];

  const base: BaseResult = {
    stage: englishStageTag,
    stageTag: englishStageTag,
    stageTagDisplay: stageContent.stageTag,
    verdict: stageContent.verdict,
    firstAsset: asset,
    firstAssetReason: reason,
    nextSteps: stageContent.nextSteps,
    warning: stageContent.warning,
  };

  return {
    ...base,
    domainLabel,
    ideaQualityNote: needsQualityNote(idea, audience) ? t.ideaQualityNote : null,
  };
}
