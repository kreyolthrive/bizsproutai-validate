"use client";

import { useState, useEffect, type ReactNode } from "react";
import { trackMeta, trackMetaStandard } from "@/lib/analytics/metaEvents";
import type { ValidationResult } from "@/lib/validation/engine";
import { getValidateCopy } from "@/i18n/validateCopy";
import type { ValidateCopy } from "@/i18n/validateCopy";

// ─── Attribution ──────────────────────────────────────────────────────────────

interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  fbp: string | null;
  fbc: string | null;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function captureAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  const fbcCookie = getCookie("_fbc");
  // Construct fbc from fbclid if cookie not yet set (e.g. same-session first hit)
  const fbc = fbcCookie ?? (fbclid ? `fb.1.${Date.now()}.${fbclid}` : null);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
    fbclid,
    page_url: window.location.href,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    fbp: getCookie("_fbp"),
    fbc,
  };
}

// ─── Result view helpers ──────────────────────────────────────────────────────

/**
 * Maps the internal English stageTag to a launch-readiness percentage.
 * Always operates on the English stageTag (never the localised display version)
 * so the logic is locale-independent.
 */
function getReadinessPercent(stageTag: string): number {
  if (stageTag.includes("Idea")) return 20;
  if (stageTag.includes("First Asset")) return 45;
  if (stageTag.includes("Assembly")) return 55;
  if (stageTag.includes("Optimization")) return 65;
  if (stageTag.includes("Launch + Scale")) return 85;
  if (stageTag.includes("Launch-Ready")) return 80;
  return 50;
}

function getVerdictBand(stageTag: string): "early" | "building" | "ready" {
  if (stageTag.includes("Idea") || stageTag.includes("First Asset")) return "early";
  if (stageTag.includes("Assembly") || stageTag.includes("Optimization")) return "building";
  return "ready";
}

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i < current
              ? "w-5 bg-[var(--landing-green-light)]"
              : i === current
              ? "w-5 bg-[var(--landing-sprout)]"
              : "w-2 bg-[rgba(26,58,42,0.18)]"
          }`}
        />
      ))}
    </div>
  );
}

function FieldMessageSlot({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-1.5 min-h-[1.25rem] text-[0.8rem] leading-5">
      {children}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  locale: string;
  initialStage?: number;
  phoneHref: string;
  /** Round 1 variant token: "control" | "hero-a" | "cta-b" */
  pageVariant?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FreeValidationFlow({ locale, initialStage, phoneHref, pageVariant = "control" }: Props) {
  const copy = getValidateCopy(locale);
  const hasPreselectedStage =
    initialStage != null && initialStage >= 0 && initialStage <= 3;

  // Step order: 0=Stage, 1=Idea, 2=Status, 3=Email+Submit
  // If stage came from the hero widget, skip step 0 and start at step 1
  const [step, setStep] = useState<0 | 1 | 2 | 3>(hasPreselectedStage ? 1 : 0);
  const [attribution, setAttribution] = useState<Attribution>({
    utm_source: null, utm_medium: null, utm_campaign: null,
    utm_content: null, utm_term: null, fbclid: null,
    page_url: null, referrer: null, user_agent: null,
    fbp: null, fbc: null,
  });
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [stageIndex, setStageIndex] = useState<number | null>(
    hasPreselectedStage ? initialStage : null
  );
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [hasLiveAsset, setHasLiveAsset] = useState<boolean | null>(null);
  const [hasTraction, setHasTraction] = useState<boolean | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitRequestId, setSubmitRequestId] = useState<string | null>(null);
  const [waitlistState, setWaitlistState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmailError, setWaitlistEmailError] = useState("");
  const [serverLeadId, setServerLeadId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<"idle" | "submitted">("idle");

  useEffect(() => {
    setAttribution(captureAttribution());
    trackMetaStandard("ViewContent", {
      content_name: "FreeValidation",
      content_type: "product",
      value: 1.0,
      currency: "USD",
      page_variant: pageVariant,
      locale,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  }

  function handleStep0Next() {
    if (stageIndex === null) return;
    trackMeta("ValidationStarted", {
      stageIndex,
      page_variant: pageVariant,
      locale,
      traffic_source: attribution.utm_source ?? (attribution.referrer ? "referral" : "direct"),
    });
    setStep(1);
  }

  function handleFeedback(rating: "yes" | "somewhat" | "no") {
    if (!result) return;
    setFeedbackState("submitted");
    trackMeta("ResultFeedback", {
      rating,
      idea_stage: result.stageTag,
      verdict_band: getVerdictBand(result.stageTag),
      page_variant: pageVariant,
      locale,
    });
  }

  function handleStep1Next() {
    setStep(2);
  }

  function handleStep2Next() {
    setStep(3);
  }

  // Step 3: validate email, fire analytics, submit all inputs to server
  async function handleSubmit() {
    if (stageIndex === null || hasLiveAsset === null || hasTraction === null) return;

    if (!isValidEmail(email)) {
      setEmailError(copy.s3emailError);
      return;
    }
    setEmailError("");

    setSubmitting(true);
    setSubmitError(null);

    const reqId = submitRequestId ?? crypto.randomUUID();
    if (!submitRequestId) setSubmitRequestId(reqId);

    try {
      const res = await fetch("/api/free-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: firstName.trim(),
          locale,
          stageIndex,
          idea,
          audience,
          hasLiveAsset,
          hasTraction,
          requestId: reqId,
          attribution,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      const data = await res.json();

      if (!data.result) {
        throw new Error("No result returned from server");
      }

      const isInternalTest = !!(data as any).isInternalTest;
      const leadType = (data as any).leadType ?? "unknown";
      const leadSaved = !!(data as any).leadSaved;
      const metaFired = leadSaved && !isInternalTest;
      const capiEventIds = (data as any).capiEventIds as { lead?: string; validationCompleted?: string } | undefined;

      trackMetaStandard("Lead", {
        content_name: "FreeValidation",
        source: "free_validation",
        page_variant: pageVariant,
        locale,
      }, capiEventIds?.lead);
      if (metaFired) {
        trackMetaStandard("CompleteRegistration", {
          value: 1.00,
          currency: "USD",
          content_name: "FreeValidation",
          stage: data.result.stage,
          page_variant: pageVariant,
        });
      }
      trackMeta("ValidationCompleted", {
        stage: data.result.stage,
        stageIndex,
        idea_stage: data.result.stageTag,
        verdict_band: getVerdictBand(data.result.stageTag),
        page_variant: pageVariant,
        locale,
        traffic_source: attribution.utm_source ?? (attribution.referrer ? "referral" : "direct"),
      }, capiEventIds?.validationCompleted);

      console.log(JSON.stringify({
        event: "lead_saved",
        lead_type: leadType,
        internal_test: isInternalTest,
        page_variant: pageVariant,
        idea_stage: data.result.stageTag,
        verdict_band: getVerdictBand(data.result.stageTag),
        utm_source: attribution.utm_source,
        utm_campaign: attribution.utm_campaign,
        utm_content: attribution.utm_content,
        fbclid_present: !!attribution.fbclid,
        meta_complete_registration_fired: metaFired,
      }));

      setWaitlistEmail(email);
      setWaitlistName(firstName);
      setServerLeadId((data as any).validationLeadId ?? null);
      setResult(data.result as ValidationResult);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("[FreeValidationFlow] Submit failed:", err);
      setSubmitError(copy.s3error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setStep(0);
    setEmail("");
    setFirstName("");
    setEmailError("");
    setStageIndex(null);
    setIdea("");
    setAudience("");
    setHasLiveAsset(null);
    setHasTraction(null);
    setResult(null);
    setSubmitError(null);
    setSubmitRequestId(null);
    setWaitlistState("idle");
    setWaitlistEmail("");
    setWaitlistName("");
    setWaitlistEmailError("");
    setServerLeadId(null);
    setFeedbackState("idle");
  }

  async function handleWaitlist() {
    if (!isValidEmail(waitlistEmail)) {
      setWaitlistEmailError(copy.rWaitlistEmailError);
      return;
    }
    setWaitlistEmailError("");
    setWaitlistState("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: waitlistEmail.trim().toLowerCase(),
          name: waitlistName.trim() || undefined,
          source: "free_validation_result",
          locale,
          validationLeadId: serverLeadId ?? undefined,
          stage: result?.stage,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `Server error ${res.status}`);
      trackMeta("WaitlistJoined", {
        source: "free_validation",
        locale,
        idea_stage: result?.stageTag,
        verdict_band: result ? getVerdictBand(result.stageTag) : undefined,
        page_variant: pageVariant,
        traffic_source: attribution.utm_source ?? (attribution.referrer ? "referral" : "direct"),
      });
      setWaitlistState("success");
    } catch (err) {
      console.error("[FreeValidationFlow] Waitlist join failed:", err);
      setWaitlistState("error");
    }
  }

  useEffect(() => {
    if (result) {
      trackMeta("ValidationResultView", {
        stage: result.stage,
        idea_stage: result.stageTag,
        verdict_band: getVerdictBand(result.stageTag),
        page_variant: pageVariant,
        locale,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // ── Result view ────────────────────────────────────────────────────────────

  if (result) {
    // stageTag is always in English (used for logic); stageTagDisplay is localised
    const readiness = getReadinessPercent(result.stageTag);
    const { stageUpsells } = copy;
    const upsell =
      result.stageTag.includes("Idea") ? stageUpsells.idea
      : result.stageTag.includes("First Asset") ? stageUpsells.firstAsset
      : result.stageTag.includes("Assembly") || result.stageTag.includes("Optimization") ? stageUpsells.assemblyOptimization
      : result.stageTag.includes("Launch + Scale") ? stageUpsells.launchScale
      : stageUpsells.launchReady;

    const lockedPreviews = copy.lockedPreviewsTemplate.map((t) => ({
      title: result.domainLabel
        ? t.titleWithDomain.replace("{domain}", result.domainLabel)
        : t.titleWithoutDomain,
      meta: t.meta,
    }));
    // Build personalised sub-headline: "Jessica, your results are below…"
    const subhead = firstName
      ? `${firstName}, ${copy.rSubhead}`
      : copy.rSubhead.charAt(0).toUpperCase() + copy.rSubhead.slice(1);

    // Test 4 — result-page primary CTA label (variant cta-b)
    const ctaButtonLabel = pageVariant === "cta-b"
      ? (copy.rCtaLabelB ?? "See My Full Demand Analysis →")
      : copy.rWaitlistCta;

    // Shared analytics metadata for result-page events
    const resultMeta = {
      idea_stage: result.stageTag,
      verdict_band: getVerdictBand(result.stageTag),
      page_variant: pageVariant,
      locale,
    };

    return (
      <div className="mx-auto min-h-[1180px] max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(126,200,80,0.3)] bg-[rgba(126,200,80,0.12)] px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-green-mid)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--landing-sprout)]" />
            {copy.rBadge}
          </span>
          <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.1] text-[var(--landing-green-deep)]">
            {copy.rHeading}
          </h2>
          <p className="mt-2 text-[0.95rem] text-[var(--landing-muted)]">
            {subhead}
          </p>
        </div>

        {/* ── Submitted idea callout ── */}
        {idea && (
          <div className="mb-6 rounded-[14px] border border-[rgba(26,58,42,0.1)] bg-[rgba(26,58,42,0.03)] px-4 py-3">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-muted)]">
              {copy.rSubmittedIdeaLabel}
            </p>
            <p className="mt-1.5 text-[0.88rem] italic leading-[1.55] text-[var(--landing-green-deep)]">
              &ldquo;{idea.length > 160 ? idea.slice(0, 160).trimEnd() + "\u2026" : idea}&rdquo;
            </p>
          </div>
        )}

        {/* Stage tag + context note */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[var(--landing-green-deep)] px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white">
            {result.stageTagDisplay ?? result.stageTag}
          </span>
          <span className="text-[0.75rem] text-[var(--landing-muted)]">
            {copy.rStageContextNote}
          </span>
        </div>

        {/* ── Readiness gauge ── */}
        <div className="rounded-[20px] border border-[rgba(26,58,42,0.08)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-green-light)]">
              {copy.rReadinessLabel}
            </p>
            <span className="text-[0.85rem] font-bold text-[var(--landing-green-deep)]">
              {readiness}%
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[rgba(26,58,42,0.08)]">
            <div
              className="h-2.5 rounded-full bg-[var(--landing-sprout)]"
              style={{ width: `${readiness}%` }}
            />
          </div>
          <p className="mt-2 text-[0.73rem] text-[var(--landing-muted)]">
            {copy.rReadinessMeta}
          </p>
        </div>

        {/* ── Verdict — uses niche label when detected, domain label as fallback ── */}
        <div className="mt-4 rounded-[20px] border border-[rgba(26,58,42,0.1)] bg-white p-6 shadow-sm">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-green-light)]">
            {copy.rVerdictLabel}
          </p>
          <p className="mt-2 font-[family:var(--font-serif)] text-[1.35rem] leading-[1.3] text-[var(--landing-green-deep)]">
            {(result.nicheLabel || (locale === "en" && result.domainLabel))
              ? (() => {
                  const label = result.nicheLabel ?? result.domainLabel ?? "";
                  const article = /^[aeiou]/i.test(label) ? "an" : "a";
                  return `For ${article} ${label} at this stage: ${result.verdict.charAt(0).toLowerCase()}${result.verdict.slice(1)}`;
                })()
              : result.verdict}
          </p>
          {result.stageTag.includes("Idea") && copy.rIdeaStageReassurance && (
            <p className="mt-3 rounded-[10px] bg-[rgba(126,200,80,0.08)] px-4 py-2.5 text-[0.88rem] leading-[1.6] text-[var(--landing-green-mid)]">
              {copy.rIdeaStageReassurance}
            </p>
          )}
        </div>

        {/* ── First asset ── */}
        <div className="mt-4 rounded-[20px] border border-[rgba(126,200,80,0.25)] bg-[rgba(126,200,80,0.06)] p-6">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-green-mid)]">
            {copy.rFirstAssetLabel}
          </p>
          <p className="mt-2 text-[1.15rem] font-semibold text-[var(--landing-green-deep)]">
            {result.firstAsset}
          </p>
          <p className="mt-2 text-[0.9rem] leading-[1.6] text-[var(--landing-muted)]">
            {result.ideaContext?.nicheAssetReason ?? result.firstAssetReason}
          </p>
        </div>

        {/* ── Next steps — niche-specific when detected, generic fallback ── */}
        <div className="mt-4 rounded-[20px] border border-[rgba(26,58,42,0.08)] bg-white p-6 shadow-sm">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-green-light)]">
            {copy.rNextStepsLabel}
          </p>
          <ol className="mt-4 space-y-3">
            {(result.nicheSteps ?? result.nextSteps).map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-[0.93rem] leading-[1.6] text-[var(--landing-muted)]">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(126,200,80,0.15)] text-[0.72rem] font-bold text-[var(--landing-green-deep)]">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {/* ── Warning ── */}
        <div className="mt-4 rounded-[20px] border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.06)] p-6">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#b45309]">
            {copy.rWarningLabel}
          </p>
          <p className="mt-2 text-[0.93rem] leading-[1.65] text-[var(--landing-muted)]">
            {result.ideaContext?.nicheMistake ?? result.warning}
          </p>
        </div>

        {/* ── Idea quality note (only shown when description was brief) ── */}
        {result.ideaQualityNote && (
          <div className="mt-4 rounded-[20px] border border-[rgba(26,58,42,0.1)] bg-[rgba(26,58,42,0.03)] p-5">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-muted)]">
              {copy.rNoteLabel}
            </p>
            <p className="mt-2 text-[0.88rem] leading-[1.65] text-[var(--landing-muted)]">
              {result.ideaQualityNote}
            </p>
          </div>
        )}

        {/* ── Qualitative feedback signal ── */}
        <div className="mt-4 rounded-[20px] border border-[rgba(26,58,42,0.07)] bg-[rgba(26,58,42,0.02)] px-5 py-4">
          {feedbackState === "submitted" ? (
            <p className="text-center text-[0.82rem] text-[var(--landing-muted)]">
              Thank you — this helps us improve the analysis.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[0.82rem] font-semibold text-[var(--landing-muted)]">
                Was this result helpful?
              </p>
              <div className="flex gap-2">
                {(["yes", "somewhat", "no"] as const).map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFeedback(rating)}
                    className="rounded-full border border-[rgba(26,58,42,0.15)] px-4 py-1.5 text-[0.8rem] font-semibold text-[var(--landing-muted)] transition hover:border-[var(--landing-green-mid)] hover:text-[var(--landing-green-deep)] capitalize"
                  >
                    {rating === "somewhat" ? "Somewhat" : rating.charAt(0).toUpperCase() + rating.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Locked premium preview ── */}
        <div className="mt-6 rounded-[20px] border border-[rgba(26,58,42,0.1)] bg-[var(--landing-cream)] p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[0.88rem]" aria-hidden>🔒</span>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-muted)]">
              {copy.rLockedSectionTitle}
            </p>
          </div>

          <div className="space-y-3">
            {lockedPreviews.map((item) => (
              <div
                key={item.title}
                className="rounded-[14px] border border-[rgba(26,58,42,0.08)] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.82rem] font-semibold leading-snug text-[var(--landing-green-deep)]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[0.72rem] text-[var(--landing-muted)]">
                      {item.meta}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[rgba(26,58,42,0.12)] px-2 py-0.5 text-[0.68rem] font-semibold text-[var(--landing-muted)]">
                    Locked
                  </span>
                </div>
                {/* Blurred placeholder rows */}
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 w-4/5 rounded-full bg-[rgba(26,58,42,0.07)]" />
                  <div className="h-2 w-3/5 rounded-full bg-[rgba(26,58,42,0.05)]" />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[0.75rem] text-[var(--landing-muted)]">
            {copy.rLockedMeta}
          </p>
        </div>

        {/* ── Waitlist CTA — PRIMARY ── */}
        <div className="mt-6 rounded-[20px] border-2 border-[var(--landing-sprout)] bg-white p-6 sm:p-8">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-green-mid)]">
            {copy.rUpsellLabel}
          </p>
          <h3 className="mt-2 font-[family:var(--font-serif)] text-[1.35rem] leading-tight text-[var(--landing-green-deep)]">
            {copy.rWaitlistHeadline}
          </h3>
          <p className="mt-2 text-[0.9rem] leading-[1.6] text-[var(--landing-muted)]">
            {copy.rWaitlistBody}
          </p>

          {waitlistState === "success" ? (
            <div className="mt-5 rounded-[14px] border border-[rgba(126,200,80,0.35)] bg-[rgba(126,200,80,0.1)] px-5 py-4 text-center">
              <p className="text-[0.95rem] font-semibold text-[var(--landing-green-deep)]">
                {copy.rWaitlistSuccess}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 space-y-3">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => {
                    setWaitlistEmail(e.target.value);
                    if (waitlistEmailError) setWaitlistEmailError("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full rounded-[14px] border bg-white px-4 py-3 text-[0.95rem] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/60 focus:ring-2 focus:ring-[rgba(126,200,80,0.2)] ${
                    waitlistEmailError
                      ? "border-red-400 focus:border-red-400"
                      : "border-[rgba(26,58,42,0.15)] focus:border-[var(--landing-green-mid)]"
                  }`}
                />
                {waitlistEmailError && (
                  <p className="text-[0.8rem] text-red-500">{waitlistEmailError}</p>
                )}
                <input
                  type="text"
                  value={waitlistName}
                  onChange={(e) => setWaitlistName(e.target.value)}
                  placeholder="First name (optional)"
                  autoComplete="given-name"
                  className="w-full rounded-[14px] border border-[rgba(26,58,42,0.15)] bg-white px-4 py-3 text-[0.95rem] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/60 focus:border-[var(--landing-green-mid)] focus:ring-2 focus:ring-[rgba(126,200,80,0.2)]"
                />
              </div>
              {waitlistState === "error" && (
                <p className="mt-2 text-[0.8rem] text-red-500">{copy.rWaitlistError}</p>
              )}
              <button
                onClick={handleWaitlist}
                disabled={waitlistState === "submitting"}
                className="mt-4 w-full rounded-full bg-[var(--landing-sprout)] px-8 py-4 text-[1rem] font-semibold text-[var(--landing-ink)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_10px_30px_rgba(126,200,80,0.3)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {waitlistState === "submitting" ? copy.rWaitlistSubmitting : ctaButtonLabel}
              </button>
            </>
          )}
        </div>

        {/* ── Stage-specific context + Fit Call — SECONDARY ── */}
        <div className="mt-4 rounded-[20px] bg-[var(--landing-green-deep)] p-6 text-white sm:p-8">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-sprout)]">
            {copy.rFitCallLabel}
          </p>
          <h3 className="mt-2 font-[family:var(--font-serif)] text-[1.2rem] leading-tight">
            {upsell.headline}
          </h3>
          <p className="mt-2 text-[0.88rem] leading-[1.6] text-white/70">
            {upsell.body}
          </p>
          <div className="mt-5 flex flex-col items-start gap-1">
            <a
              href={phoneHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackMetaStandard("Schedule", { page_variant: pageVariant });
                trackMeta("FitCallClick", { stage: result.stage, ...resultMeta });
              }}
              className="flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-[0.9rem] font-semibold text-white/80 transition hover:border-white/50 hover:text-white"
            >
              {copy.rFitCta}
            </a>
            <span className="ml-1 text-[0.7rem] text-white/40">{copy.rFitNote}</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="mt-6 text-[0.82rem] text-[var(--landing-muted)] underline underline-offset-4 transition hover:text-[var(--landing-green-deep)]"
        >
          {copy.rReset}
        </button>
      </div>
    );
  }

  // ── Form view ──────────────────────────────────────────────────────────────

  const totalSteps = 4;
  const displayStep = step + 1;

  return (
    <div className="mx-auto min-h-[560px] max-w-2xl sm:min-h-[500px]">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-between">
        <StepDots total={totalSteps} current={step} />
        <span className="text-[0.8rem] text-[var(--landing-muted)]">
          {copy.stepCounter(displayStep, totalSteps)}
        </span>
      </div>

      {/* ── Step 0: Stage selection ── */}
      {step === 0 && (
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            {copy.stepLabel(1)}
          </p>
          <h2 className="mt-3 font-[family:var(--font-serif)] text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.12] text-[var(--landing-green-deep)]">
            {copy.s0heading}
          </h2>
          <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--landing-muted)]">
            {copy.s0body}
          </p>

          <div className="mt-7 space-y-3">
            {copy.s0choices.map((label, i) => (
              <button
                key={i}
                onClick={() => setStageIndex(i)}
                className={`flex w-full items-center gap-4 rounded-[16px] border px-5 py-4 text-left text-[0.95rem] leading-[1.5] transition ${
                  stageIndex === i
                    ? "border-[var(--landing-green-mid)] bg-[rgba(126,200,80,0.1)] text-[var(--landing-green-deep)]"
                    : "border-[rgba(26,58,42,0.1)] bg-white text-[var(--landing-muted)] hover:border-[rgba(26,58,42,0.25)] hover:bg-[var(--landing-cream)]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                    stageIndex === i
                      ? "border-[var(--landing-green-mid)] bg-[var(--landing-green-mid)]"
                      : "border-[rgba(26,58,42,0.2)] bg-white"
                  }`}
                >
                  {stageIndex === i && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleStep0Next}
            disabled={stageIndex === null}
            className="mt-8 w-full rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copy.s0cta}
          </button>
        </div>
      )}

      {/* ── Step 1: About your idea ── */}
      {step === 1 && (
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            {copy.stepLabel(2)}
          </p>
          <h2 className="mt-3 font-[family:var(--font-serif)] text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.12] text-[var(--landing-green-deep)]">
            {copy.s1heading}
          </h2>
          <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--landing-muted)]">
            {copy.s1body}
          </p>

          <div className="mt-7 space-y-5">
            <div>
              <label className="block text-[0.82rem] font-semibold text-[var(--landing-green-deep)]">
                {copy.s1ideaLabel}
                <span className="ml-1 font-normal text-[var(--landing-muted)]">{copy.s1ideaRequired}</span>
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={copy.s1ideaPlaceholder}
                rows={3}
                maxLength={400}
                className="mt-2 w-full resize-none rounded-[14px] border border-[rgba(26,58,42,0.15)] bg-white px-4 py-3 text-[0.95rem] leading-[1.6] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/60 focus:border-[var(--landing-green-mid)] focus:ring-2 focus:ring-[rgba(126,200,80,0.2)]"
              />
            </div>

            <div>
              <label className="block text-[0.82rem] font-semibold text-[var(--landing-green-deep)]">
                {copy.s1audienceLabel}
                <span className="ml-1 font-normal text-[var(--landing-muted)]">{copy.s1audienceOptional}</span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder={copy.s1audiencePlaceholder}
                maxLength={200}
                className="mt-2 w-full rounded-[14px] border border-[rgba(26,58,42,0.15)] bg-white px-4 py-3 text-[0.95rem] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/60 focus:border-[var(--landing-green-mid)] focus:ring-2 focus:ring-[rgba(126,200,80,0.2)]"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="rounded-full border border-[rgba(26,58,42,0.15)] px-6 py-4 text-[0.95rem] font-semibold text-[var(--landing-muted)] transition hover:border-[rgba(26,58,42,0.3)] hover:text-[var(--landing-green-deep)]"
            >
              {copy.back}
            </button>
            <button
              onClick={handleStep1Next}
              disabled={idea.trim().length < 10}
              className="flex-1 rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.next}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Current status ── */}
      {step === 2 && (
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            {copy.stepLabel(3)}
          </p>
          <h2 className="mt-3 font-[family:var(--font-serif)] text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.12] text-[var(--landing-green-deep)]">
            {copy.s2heading}
          </h2>
          <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--landing-muted)]">
            {copy.s2body}
          </p>

          <div className="mt-7 space-y-6">
            <div>
              <p className="text-[0.88rem] font-semibold text-[var(--landing-green-deep)]">
                {copy.s2liveQ}
              </p>
              <div className="mt-3 flex gap-3">
                {[
                  { label: copy.s2liveYes, value: true },
                  { label: copy.s2liveNo, value: false },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => setHasLiveAsset(value)}
                    className={`flex-1 rounded-[14px] border px-4 py-3 text-[0.88rem] font-semibold transition ${
                      hasLiveAsset === value
                        ? "border-[var(--landing-green-mid)] bg-[rgba(126,200,80,0.1)] text-[var(--landing-green-deep)]"
                        : "border-[rgba(26,58,42,0.1)] bg-white text-[var(--landing-muted)] hover:border-[rgba(26,58,42,0.25)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[0.88rem] font-semibold text-[var(--landing-green-deep)]">
                {copy.s2tractionQ}
              </p>
              <div className="mt-3 flex gap-3">
                {[
                  { label: copy.s2tractionYes, value: true },
                  { label: copy.s2tractionNo, value: false },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => setHasTraction(value)}
                    className={`flex-1 rounded-[14px] border px-4 py-3 text-[0.88rem] font-semibold transition ${
                      hasTraction === value
                        ? "border-[var(--landing-green-mid)] bg-[rgba(126,200,80,0.1)] text-[var(--landing-green-deep)]"
                        : "border-[rgba(26,58,42,0.1)] bg-white text-[var(--landing-muted)] hover:border-[rgba(26,58,42,0.25)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-full border border-[rgba(26,58,42,0.15)] px-6 py-4 text-[0.95rem] font-semibold text-[var(--landing-muted)] transition hover:border-[rgba(26,58,42,0.3)] hover:text-[var(--landing-green-deep)]"
            >
              {copy.back}
            </button>
            <button
              onClick={handleStep2Next}
              disabled={hasLiveAsset === null || hasTraction === null}
              className="flex-1 rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.next}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Email capture + Submit ── */}
      {step === 3 && (
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            {copy.stepLabel(4)}
          </p>
          <h2 className="mt-3 font-[family:var(--font-serif)] text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.12] text-[var(--landing-green-deep)]">
            {copy.s3heading}
          </h2>
          <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--landing-muted)]">
            {copy.s3body}
          </p>

          <div className="mt-7 space-y-4">
            <div>
              <label className="block text-[0.82rem] font-semibold text-[var(--landing-green-deep)]">
                {copy.s3nameLabel}
                <span className="ml-1 font-normal text-[var(--landing-muted)]">{copy.s3nameOptional}</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={copy.s3namePlaceholder}
                maxLength={80}
                autoComplete="given-name"
                className="mt-2 w-full rounded-[14px] border border-[rgba(26,58,42,0.15)] bg-white px-4 py-3 text-[0.95rem] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/60 focus:border-[var(--landing-green-mid)] focus:ring-2 focus:ring-[rgba(126,200,80,0.2)]"
              />
            </div>

            <div>
              <label className="block text-[0.82rem] font-semibold text-[var(--landing-green-deep)]">
                {copy.s3emailLabel}
                <span className="ml-1 font-normal text-[var(--landing-muted)]">{copy.s3emailRequired}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder={copy.s3emailPlaceholder}
                autoComplete="email"
                className={`mt-2 w-full rounded-[14px] border bg-white px-4 py-3 text-[0.95rem] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/60 focus:ring-2 focus:ring-[rgba(126,200,80,0.2)] ${
                  emailError
                    ? "border-red-400 focus:border-red-400"
                    : "border-[rgba(26,58,42,0.15)] focus:border-[var(--landing-green-mid)]"
                }`}
              />
              <FieldMessageSlot>
                {emailError ? <p className="text-red-500">{emailError}</p> : null}
              </FieldMessageSlot>
            </div>
          </div>

          <div className="mt-5 min-h-[4.125rem]">
            {submitError ? (
              <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] text-red-700">
                {submitError}
              </div>
            ) : null}
          </div>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => setStep(2)}
              disabled={submitting}
              className="rounded-full border border-[rgba(26,58,42,0.15)] px-6 py-4 text-[0.95rem] font-semibold text-[var(--landing-muted)] transition hover:border-[rgba(26,58,42,0.3)] hover:text-[var(--landing-green-deep)] disabled:opacity-40"
            >
              {copy.back}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? copy.s3submitting : copy.s3submit}
            </button>
          </div>

          <p className="mt-3 text-center text-[0.75rem] text-[var(--landing-muted)]">
            {copy.s3privacy}
          </p>
        </div>
      )}
    </div>
  );
}
