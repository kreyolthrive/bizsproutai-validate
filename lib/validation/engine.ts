import { getEngineTranslations } from "./engineTranslations";
import { detectIdeaContext, buildFallbackIdeaContext, hasBroadUnclearOutcomes } from "./ideaContexts";
import type { IdeaContext, IdeaStageKey } from "./ideaContexts";

export type { IdeaContext };

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
  /** Full enriched niche context. English-only — null for non-English or undetected niches. */
  ideaContext: IdeaContext | null;
  /** Convenience: nicheLabel from ideaContext, or null. */
  nicheLabel: string | null;
  /** Convenience: nicheSteps from ideaContext, or null. */
  nicheSteps: string[] | null;
}

// ─── Base result type (without computed enrichment fields) ────────────────────

type BaseResult = Omit<
  ValidationResult,
  "domainLabel" | "ideaQualityNote" | "ideaContext" | "nicheLabel" | "nicheSteps"
>;

// ─── Keyword detection (language-agnostic — matches English input text) ───────

function detectAssetKey(
  idea: string,
  audience: string,
  stageIndex: number
): keyof import("./engineTranslations").LocaleEngineData["assets"] {
  const text = (idea + " " + audience).toLowerCase();

  // B2B SaaS / AI SaaS signals win before booking — "book a workflow audit" is a
  // validation CTA, not evidence that this is a service/appointment business.
  const hasSaaSSignal = /\bsaas\b|workflow audit/.test(text);
  // Consumer app / waitlist signals win before booking — "study sessions" or
  // "track sessions" are feature descriptions, not service/appointment signals.
  const hasConsumerAppSignal =
    /\b(waitlist|waiting list)\b|consumer (app|product|facing)|pre.launch (app|product|landing)|b2c (app|product)/.test(
      text
    );
  if (!hasSaaSSignal && !hasConsumerAppSignal && /booking|appointment|consultation|session|therapy|coaching call|clinic|discovery call/.test(text)) {
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
  // Online course / workshop signals win before the generic "tool" / "platform"
  // webApp catch — "AI tools" is a course topic, not a product to build.
  const hasOnlineCourseSignal =
    /\bonline course\b|course creator|\bfree workshop\b|cohort.based|\bcurriculum\b|course (launch|waitlist|signup|page)/.test(
      text
    );
  if (!hasOnlineCourseSignal && /\bapps?\b|software|platform|tool|portal|login|users\b|accounts\b/.test(text)) {
    // Broad commerce marketplace signals override the generic "platform/tool → webApp" default.
    // "platform that connects...products...to sell", "connects sellers/vendors", explicit
    // two-sided language all indicate a marketplace idea, not a web app to build now.
    if (
      /\bconnects\b.{0,80}\b(products|sellers?|vendors?)\b|\bconnects\b.{0,60}\bsell\b|\b(sellers?|vendors?)\b.{0,50}\bbuyers?\b|\bbuyers?\b.{0,50}\b(sellers?|vendors?)\b/.test(
        text
      )
    ) {
      return "marketplace";
    }
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
  return null;
}

// ─── English-only stage tag map (for logic matching, never translated) ────────

const EN_STAGE_TAGS: Record<IdeaStageKey, string> = {
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

  const assetKey = detectAssetKey(idea, audience, stageIndex);
  const { asset, reason } = t.assets[assetKey];

  const domainKey = detectDomainKey(assetKey);
  const domainLabel = domainKey ? t.domainLabels[domainKey] : null;

  // Select stage content
  let stageKey: IdeaStageKey;

  if (stageIndex === 1) {
    stageKey = "firstAsset";
  } else if (stageIndex === 2) {
    stageKey = hasLiveAsset ? "optimization" : "assembly";
  } else if (stageIndex === 3) {
    stageKey = hasTraction ? "launchScale" : "launchReady";
  } else {
    // stageIndex 0 and any invalid/out-of-range value → safest interpretation
    stageKey = "idea";
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

  // Niche/idea context — English-only; null for non-English locales so generic content shows.
  // Falls back to a universal context when no niche template matches, so every English
  // submission gets specific, founder-useful guidance rather than weak generic copy.
  const ideaContext =
    locale === "en"
      ? (detectIdeaContext(idea, audience, stageKey) ??
          buildFallbackIdeaContext(idea, audience, stageKey, assetKey))
      : null;

  // Broad/unclear fallback: idea contains 2+ vague life-improvement outcomes with no
  // specific audience. "platform" in the idea text must not force a "Web app" label
  // when the idea lacks audience, problem, and offer clarity.
  const isBroadFallback =
    ideaContext?.nicheLabel === null &&
    (assetKey === "webApp" || assetKey === "saas") &&
    hasBroadUnclearOutcomes(idea, audience);

  // For AI SaaS prompts the base asset key is "saas" → "Web app (SaaS)", which sounds
  // like a recommendation to build the SaaS app. The nicheAssetReason already says
  // "demo page / workflow audit CTA", so align the label to match.
  const firstAsset = isBroadFallback
    ? "Idea clarity test"
    : ideaContext?.nicheLabel === "AI-powered SaaS product" && assetKey === "saas"
    ? "SaaS demo page"
    : ideaContext?.nicheLabel === "local service business" && assetKey === "booking"
    ? "Service booking page"
    : ideaContext?.nicheLabel === "coaching or consulting practice" && assetKey === "booking"
    ? "Service consultation page"
    : ideaContext?.nicheLabel === "two-sided marketplace" && assetKey === "marketplace"
    ? "Marketplace interest page"
    : ideaContext?.nicheLabel === "product or ecommerce business" && assetKey === "ecommerce"
    ? "Preorder product page"
    : ideaContext?.nicheLabel === "consumer app or pre-launch product"
    ? "App waitlist page"
    : ideaContext?.nicheLabel === "online course or education product"
    ? "Workshop signup page"
    : ideaContext?.nicheLabel === "creator or digital product business"
    ? "Template landing page"
    : ideaContext?.nicheLabel === "community or social impact project" ||
      ideaContext?.nicheLabel === "nonprofit management app"
    ? "Community resource page"
    : ideaContext?.nicheLabel === "health or wellness offer" &&
      /challenge page/i.test(idea + " " + audience)
    ? "Wellness challenge page"
    : ideaContext?.nicheLabel === "health or wellness offer"
    ? "Wellness service page"
    : ideaContext?.nicheLabel === "real estate service or lead generation tool" &&
      /buyer readiness|lead.capture|lead capture/i.test(idea + " " + audience)
    ? "Buyer readiness page"
    : ideaContext?.nicheLabel === "real estate service or lead generation tool"
    ? "Real estate lead-capture page"
    : base.firstAsset;

  // For several niches the asset-derived domain label doesn't match the actual
  // business category. Override so the locked insight title uses the detected
  // idea context instead.
  const finalDomainLabel = isBroadFallback
    ? "early-stage idea"
    : ideaContext?.nicheLabel === "consumer app or pre-launch product"
    ? "consumer app"
    : ideaContext?.nicheLabel === "online course or education product"
    ? "online course"
    : ideaContext?.nicheLabel === "creator or digital product business"
    ? "digital product"
    : ideaContext?.nicheLabel === "community or social impact project"
    ? "community projects"
    : ideaContext?.nicheLabel === "nonprofit management app"
    ? "nonprofit / community"
    : ideaContext?.nicheLabel === "health or wellness offer"
    ? "health / wellness"
    : ideaContext?.nicheLabel === "real estate service or lead generation tool"
    ? "real estate services"
    : domainLabel;

  // Niche-specific verdict overrides at idea stage — "too early to build" undersells
  // prompts that already include audience, outcome, and a validation asset plan.
  const verdict =
    ideaContext?.nicheLabel === "local service business" &&
    assetKey === "booking" &&
    stageKey === "idea"
      ? "clear enough to test, but the offer needs package and service-area clarity first."
      : ideaContext?.nicheLabel === "coaching or consulting practice" &&
        assetKey === "booking" &&
        stageKey === "idea"
      ? "clear enough to test, but the offer needs sharper outcome and consultation positioning."
      : base.verdict;

  return {
    ...base,
    firstAsset,
    verdict,
    domainLabel: finalDomainLabel,
    ideaQualityNote: needsQualityNote(idea, audience) ? t.ideaQualityNote : null,
    ideaContext,
    nicheLabel: ideaContext?.nicheLabel ?? null,
    nicheSteps: ideaContext?.nicheSteps ?? null,
  };
}
