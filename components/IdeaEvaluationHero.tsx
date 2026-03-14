"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { DynamicValidationResult, FrameworkDecision } from "@/src/validation/types";
import { resolveFrameworkDecision, resolveOverallScore100 } from "@/src/validation/decision";

type IdeaEvaluationHeroProps = {
  locale: string;
};

type ReportPayload = {
  filename: string;
  generatedAt: string;
  text: string;
  pdf?: {
    filename: string;
    mimeType: string;
    contentBase64: string;
    sizeBytes: number;
  } | null;
  pdfError?: string | null;
};

type ValidateApiResponse = DynamicValidationResult & {
  error?: string;
  report?: ReportPayload;
  emailDelivery?: {
    attempted: boolean;
    enabled: boolean;
    sentToUser: boolean;
    sentToOwner: boolean;
    errors: string[];
  };
  leadCapture?: {
    saved: boolean;
    eventId: string | null;
    error: string | null;
  };
  validationRun?: {
    saved: boolean;
    runId: string | null;
    error: string | null;
  };
};

const FALLBACK_IDEAS = [
  "Mobile car detailing for busy professionals in Miami.",
  "SaaS platform that automates invoicing for small creative agencies.",
  "Online coaching program for first-time managers.",
];

function getDecision(result: DynamicValidationResult | null): FrameworkDecision | null {
  if (!result) return null;
  return resolveFrameworkDecision(result);
}

function decisionStyles(decision: FrameworkDecision | null): string {
  if (decision === "GO") return "bg-emerald-100 text-emerald-800 border border-emerald-200";
  if (decision === "CONDITIONAL_GO") return "bg-blue-100 text-blue-800 border border-blue-200";
  if (decision === "NEED_WORK") return "bg-amber-100 text-amber-800 border border-amber-200";
  if (decision === "NO_GO") return "bg-rose-100 text-rose-800 border border-rose-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function downloadReport(report: ReportPayload): void {
  if (report.pdf?.contentBase64) {
    const byteString = atob(report.pdf.contentBase64);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) {
      bytes[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: report.pdf.mimeType || "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = report.pdf.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return;
  }

  const blob = new Blob([report.text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = report.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toDisplayCategory(value?: string | null): string {
  if (!value) return "";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveOverallScore(result: DynamicValidationResult | null): number | null {
  if (!result) return null;
  return resolveOverallScore100(result);
}

function scoreCard(label: string, value?: number): { label: string; value: string } {
  return {
    label,
    value: typeof value === "number" ? `${value}/100` : "Awaiting score",
  };
}

export function IdeaEvaluationHero({ locale }: IdeaEvaluationHeroProps) {
  const t = useTranslations("validationHero");

  const [idea, setIdea] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [location, setLocation] = useState("");
  const [offer, setOffer] = useState("");
  const [problem, setProblem] = useState("");
  const [pricingIdea, setPricingIdea] = useState("");
  const [budgetUsd, setBudgetUsd] = useState("");
  const [skillSummary, setSkillSummary] = useState("");
  const [timelineDays, setTimelineDays] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeProgressStep, setActiveProgressStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DynamicValidationResult | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);

  const decision = useMemo(() => getDecision(result), [result]);
  const overallScore = useMemo(() => resolveOverallScore(result), [result]);
  const confidenceScore = result?.confidenceScore ?? result?.confidence_score;
  const categoryLabel = toDisplayCategory(result?.businessCategory ?? result?.business_category ?? result?.category);
  const subcategoryLabel = toDisplayCategory(
    result?.inferredBusinessModel?.subcategory ?? result?.categoryRouting?.subcategory ?? null
  );
  const strengths = result?.strengths ?? result?.summary.topOpportunities ?? [];
  const keyRisks = result?.keyRisks ?? result?.key_risks ?? result?.summary.biggestRisks ?? [];
  const nextSteps = result?.recommendedNextSteps ?? result?.recommended_next_steps ?? result?.nextActions ?? [];
  const weaknesses = result?.weaknesses ?? [];
  const assumptions = result?.assumptionsToTest ?? result?.assumptions_to_test ?? result?.assumptions ?? [];
  const researchSignals = [
    ...(result?.researchSummary?.demandSignals ?? []),
    ...(result?.researchSummary?.marketTrends ?? []),
    ...(result?.researchSummary?.monetizationNotes ?? []),
  ].slice(0, 4);
  const scoreBreakdown = [
    scoreCard(t("result.marketDemand"), result?.scores?.market_demand),
    scoreCard(t("result.monetization"), result?.scores?.monetization),
    scoreCard(t("result.competition"), result?.scores?.competition),
    scoreCard(t("result.acquisition"), result?.scores?.acquisition),
    scoreCard(t("result.execution"), result?.scores?.execution_feasibility),
    scoreCard(t("result.differentiation"), result?.scores?.differentiation),
    scoreCard(t("result.risk"), result?.scores?.risk),
  ];
  const frameworkLabel =
    result?.selectedFramework?.frameworkLabel ??
    result?.frameworkUsed ??
    result?.framework_used ??
    result?.framework?.label ??
    "";
  const ctas = result?.nextActionCtas ?? [];
  const progressSteps = [
    t("progress.detecting"),
    t("progress.framework"),
    t("progress.research"),
    t("progress.scoring"),
    t("progress.nextSteps"),
  ];

  const sampleIdeasRaw = t.raw("sampleIdeas") as unknown;
  const sampleIdeas = Array.isArray(sampleIdeasRaw)
    ? (sampleIdeasRaw.filter((item): item is string => typeof item === "string") as string[])
    : FALLBACK_IDEAS;

  const clearFeedback = () => {
    setError(null);
    setResult(null);
    setEmailStatus(null);
    setLeadStatus(null);
    setWaitlistMessage(null);
    if (!loading) {
      setActiveProgressStep(-1);
    }
  };

  useEffect(() => {
    if (!loading) {
      setActiveProgressStep(result ? progressSteps.length - 1 : -1);
      return;
    }

    setActiveProgressStep(0);
    const timer = window.setInterval(() => {
      setActiveProgressStep((current) => {
        if (current >= progressSteps.length - 1) return current;
        return current + 1;
      });
    }, 900);

    return () => {
      window.clearInterval(timer);
    };
  }, [loading, progressSteps.length, result]);

  const decisionLabel = (() => {
    if (!decision) return t("result.awaiting");
    if (decision === "CONDITIONAL_GO") return t("result.conditionalGo");
    if (decision === "NO_GO") return t("result.noGo");
    if (decision === "NEED_WORK") return t("result.needsWork");
    return t("result.go");
  })();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const trimmedIdea = idea.trim();
    const trimmedEmail = email.trim();

    clearFeedback();

    if (trimmedIdea.length < 10) {
      setError(t("errors.minIdea"));
      return;
    }

    if (trimmedEmail && !isEmailValid(trimmedEmail)) {
      setError(t("errors.invalidEmail"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: trimmedIdea,
          targetCustomer: targetCustomer.trim() || undefined,
          targetMarket: targetMarket.trim() || undefined,
          location: location.trim() || undefined,
          offer: offer.trim() || undefined,
          problem: problem.trim() || undefined,
          pricingIdea: pricingIdea.trim() || undefined,
          budgetUsd: budgetUsd.trim() ? Number(budgetUsd) : undefined,
          skillSummary: skillSummary.trim() || undefined,
          timelineDays: timelineDays.trim() ? Number(timelineDays) : undefined,
          email: trimmedEmail || undefined,
          website: typeof formData.get("website") === "string" ? formData.get("website") : undefined,
          locale: locale === "pt" ? "en" : locale,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text.slice(0, 120) || "Invalid server response.");
      }

      const data = (await response.json()) as ValidateApiResponse;
      if (!response.ok) {
        throw new Error(data.error || "Validation failed.");
      }

      setResult(data);

      if (data.report) {
        downloadReport(data.report);
      }

      if (data.emailDelivery) {
        if (!trimmedEmail) {
          setEmailStatus(t("status.emailOptional"));
        } else if (data.emailDelivery.sentToUser) {
          setEmailStatus(t("status.emailSent"));
        } else if (data.emailDelivery.errors.length) {
          setEmailStatus(`${t("status.emailIssue")}: ${data.emailDelivery.errors.join(" | ")}`);
        } else if (data.emailDelivery.attempted) {
          setEmailStatus(t("status.emailAttempted"));
        } else {
          setEmailStatus(t("status.emailDisabled"));
        }
      }

      if (data.leadCapture?.saved) {
        setLeadStatus(t("status.leadSaved"));
        setWaitlistMessage(t("status.waitlist"));
      } else if (data.validationRun?.saved) {
        setLeadStatus(t("status.runSaved"));
      } else if (data.leadCapture?.error) {
        setLeadStatus(`${t("status.leadIssue")}: ${data.leadCapture.error}`);
      } else if (data.validationRun?.error) {
        setLeadStatus(`${t("status.runIssue")}: ${data.validationRun.error}`);
      } else {
        setLeadStatus(null);
      }
      setActiveProgressStep(progressSteps.length - 1);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : t("errors.generic");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const emptyCategory = t("result.categoryEmpty");
  const emptyScore = t("result.scoreEmpty");
  const emptyConfidence = t("result.confidenceEmpty");
  const emptyVerdict = t("result.verdictEmpty");
  const hasStatusFeedback = Boolean(emailStatus || leadStatus);
  const primaryNextStep = nextSteps[0] ?? t("result.nextStepEmpty");

  return (
    <section id="validation" className="mx-auto max-w-6xl px-6 pb-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <div className="brand-panel rounded-[2rem] p-6 sm:p-7">
          <div className="mb-5">
            <p className="text-sm font-semibold text-[#0b1f4d]">{t("form.cardTitle")}</p>
            <p className="mt-1 text-sm text-[#44658f]">{t("form.cardBody")}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4" aria-busy={loading}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="idea-input">
                {t("form.ideaLabel")}
              </label>
              <textarea
                id="idea-input"
                value={idea}
                onChange={(event) => {
                  clearFeedback();
                  setIdea(event.target.value);
                }}
                className="h-36 w-full rounded-[1.4rem] border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                placeholder={t("form.ideaPlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="email-input">
                {t("form.emailLabel")}
              </label>
              <input
                id="email-input"
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  clearFeedback();
                  setEmail(event.target.value);
                }}
                className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                placeholder={t("form.emailPlaceholder")}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="target-customer-input">
                  {t("form.targetCustomerLabel")}
                </label>
                <input
                  id="target-customer-input"
                  value={targetCustomer}
                  onChange={(event) => {
                    clearFeedback();
                    setTargetCustomer(event.target.value);
                  }}
                  className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                  placeholder={t("form.targetCustomerPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="offer-input">
                  {t("form.offerLabel")}
                </label>
                <input
                  id="offer-input"
                  value={offer}
                  onChange={(event) => {
                    clearFeedback();
                    setOffer(event.target.value);
                  }}
                  className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                  placeholder={t("form.offerPlaceholder")}
                />
              </div>
            </div>

            <details className="rounded-[1.35rem] border border-[#d6e3f7] bg-[#f8fbff] px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold text-[#163761] marker:hidden">
                {t("form.moreDetails")}
              </summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="market-input">
                    {t("form.marketLabel")}
                  </label>
                  <input
                    id="market-input"
                    value={targetMarket}
                    onChange={(event) => {
                      clearFeedback();
                      setTargetMarket(event.target.value);
                    }}
                    className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                    placeholder={t("form.marketPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="location-input">
                    {t("form.locationLabel")}
                  </label>
                  <input
                    id="location-input"
                    value={location}
                    onChange={(event) => {
                      clearFeedback();
                      setLocation(event.target.value);
                    }}
                    className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                    placeholder={t("form.locationPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="pricing-input">
                    {t("form.pricingLabel")}
                  </label>
                  <input
                    id="pricing-input"
                    value={pricingIdea}
                    onChange={(event) => {
                      clearFeedback();
                      setPricingIdea(event.target.value);
                    }}
                    className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                    placeholder={t("form.pricingPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="problem-input">
                    {t("form.problemLabel")}
                  </label>
                  <input
                    id="problem-input"
                    value={problem}
                    onChange={(event) => {
                      clearFeedback();
                      setProblem(event.target.value);
                    }}
                    className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                    placeholder={t("form.problemPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="budget-input">
                    {t("form.budgetLabel")}
                  </label>
                  <input
                    id="budget-input"
                    inputMode="numeric"
                    value={budgetUsd}
                    onChange={(event) => {
                      clearFeedback();
                      setBudgetUsd(event.target.value);
                    }}
                    className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                    placeholder={t("form.budgetPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="skills-input">
                    {t("form.skillsLabel")}
                  </label>
                  <input
                    id="skills-input"
                    value={skillSummary}
                    onChange={(event) => {
                      clearFeedback();
                      setSkillSummary(event.target.value);
                    }}
                    className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                    placeholder={t("form.skillsPlaceholder")}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="timeline-input">
                    {t("form.timelineLabel")}
                  </label>
                  <input
                    id="timeline-input"
                    inputMode="numeric"
                    value={timelineDays}
                    onChange={(event) => {
                      clearFeedback();
                      setTimelineDays(event.target.value);
                    }}
                    className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/20 transition focus:border-[#8fcdb9] focus:ring-4"
                    placeholder={t("form.timelinePlaceholder")}
                  />
                </div>
              </div>
            </details>

            <input
              aria-hidden="true"
              autoComplete="off"
              className="hidden"
              name="website"
              tabIndex={-1}
              type="text"
            />

            {waitlistMessage ? (
              <div className="rounded-[1.3rem] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-4 py-3">
                <p className="text-sm font-semibold text-emerald-900">{t("status.waitlistTitle")}</p>
                <p className="mt-1 text-sm text-emerald-800">{waitlistMessage}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="brand-cta w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/35 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t("form.validating") : t("form.submit")}
            </button>

            {error ? (
              <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
          </form>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6f95]">{t("sample.title")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sampleIdeas.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    clearFeedback();
                    setIdea(sample);
                  }}
                  className="rounded-full border border-[#c7d4ea] bg-white px-3 py-2 text-xs text-[#22477f] transition hover:border-[#0fb085] hover:text-[#0b1f4d]"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="brand-panel rounded-[2rem] p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0fb085]">{t("result.panelEyebrow")}</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#0b1f4d]">{t("result.panelTitle")}</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#44658f]">{t("result.panelBody")}</p>
            </div>
            <div
              aria-live="polite"
              className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${decisionStyles(decision)}`}
            >
              {result ? decisionLabel : emptyVerdict}
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-[#d6e3f7] bg-[#f7fbff] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.25em] text-[#5d7094]">{t("progress.title")}</p>
              <p className="text-xs font-semibold text-[#163761]">
                {loading ? t("progress.running") : result ? t("progress.done") : t("progress.pending")}
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              {progressSteps.map((step, index) => {
                const isDone = !loading && result ? true : index < activeProgressStep;
                const isRunning = loading && index === activeProgressStep;
                const statusLabel = isDone ? t("progress.done") : isRunning ? t("progress.running") : t("progress.pending");

                return (
                  <div
                    key={step}
                    className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm ${
                      isDone
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : isRunning
                          ? "border-blue-200 bg-blue-50 text-blue-900"
                          : "border-[#d6e3f7] bg-white text-[#44658f]"
                    }`}
                  >
                    <span>{step}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">{statusLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.65rem] bg-[linear-gradient(145deg,#0b1f4d,#123669)] p-5 text-white shadow-[0_25px_60px_-35px_rgba(11,31,77,0.9)]">
              <p className="text-xs uppercase tracking-[0.25em] text-white/65">{t("result.score")}</p>
              <p className="mt-2 text-5xl font-semibold">{typeof overallScore === "number" ? overallScore : "—"}</p>
              <p className="mt-2 text-sm text-white/75">{typeof overallScore === "number" ? decisionLabel : emptyScore}</p>
            </div>
            <div className="rounded-[1.65rem] border border-[#d6e3f7] bg-[#f7fbff] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#5d7094]">{t("result.category")}</p>
              <p className="mt-3 text-lg font-semibold text-[#14345f]">{categoryLabel || emptyCategory}</p>
              {subcategoryLabel ? (
                <p className="mt-1 text-sm text-[#44658f]">{subcategoryLabel}</p>
              ) : null}
            </div>
            <div className="rounded-[1.65rem] border border-[#d6e3f7] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#5d7094]">{t("result.confidence")}</p>
              <p className="mt-3 text-lg font-semibold text-[#14345f]">
                {typeof confidenceScore === "number" ? `${confidenceScore}/100` : emptyConfidence}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[1.5rem] border border-[#d6e3f7] bg-[#f7fbff] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#5d7094]">{t("result.framework")}</p>
              <p className="mt-2 text-sm font-semibold text-[#17345f]">
                {frameworkLabel || t("result.frameworkEmpty")}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d6e3f7] bg-[#f7fbff] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#5d7094]">{t("result.nextBestAction")}</p>
              <p className="mt-2 text-sm leading-6 text-[#17345f]">{primaryNextStep}</p>
            </div>
          </div>

          {hasStatusFeedback ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {emailStatus ? (
                <p className="rounded-full border border-[#d6e3f7] bg-white px-4 py-2 text-xs font-medium text-[#2b4d7d]">
                  {emailStatus}
                </p>
              ) : null}
              {leadStatus ? (
                <p className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800">
                  {leadStatus}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 rounded-[1.5rem] border border-[#d6e3f7] bg-[#f7fbff] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#12345f]">{t("result.breakdownTitle")}</p>
              <p className="text-xs text-[#5d7094]">
                {result ? t("result.breakdownHintReady") : t("result.breakdownHintEmpty")}
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {scoreBreakdown.map((item) => (
                <div key={item.label} className="rounded-[1.2rem] border border-white bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6b7d9d]">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-[#163761]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-emerald-900">{t("result.strengths")}</p>
              <ul className="mt-3 space-y-2 text-sm text-emerald-950">
                {(strengths.length ? strengths : [t("result.strengthsEmpty")]).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-4">
              <p className="text-sm font-semibold text-amber-900">{t("result.weaknesses")}</p>
              <ul className="mt-3 space-y-2 text-sm text-amber-950">
                {(weaknesses.length ? weaknesses : [t("result.weaknessesEmpty")]).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50/70 p-4">
              <p className="text-sm font-semibold text-rose-900">{t("result.risks")}</p>
              <ul className="mt-3 space-y-2 text-sm text-rose-950">
                {(keyRisks.length ? keyRisks : [t("result.risksEmpty")]).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50/70 p-4">
              <p className="text-sm font-semibold text-blue-900">{t("result.assumptions")}</p>
              <ul className="mt-3 space-y-2 text-sm text-blue-950">
                {(assumptions.length ? assumptions : [t("result.assumptionsEmpty")]).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.5rem] border border-[#d6e3f7] bg-white p-4">
              <p className="text-sm font-semibold text-[#12345f]">{t("result.researchSignals")}</p>
              <ul className="mt-3 space-y-2 text-sm text-[#234875]">
                {(researchSignals.length ? researchSignals : [t("result.researchEmpty")]).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-[#d6e3f7] bg-white p-4">
              <p className="text-sm font-semibold text-[#12345f]">{t("result.nextSteps")}</p>
              <ul className="mt-3 space-y-2 text-sm text-[#234875]">
                {(nextSteps.length ? nextSteps : [t("result.nextStepEmpty")]).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[#d6e3f7] bg-[#f7fbff] p-5">
            <p className="text-sm font-semibold text-[#12345f]">{t("result.ctaTitle")}</p>
            <p className="mt-1 text-sm text-[#44658f]">{t("result.ctaBody")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {ctas.length ? (
                ctas.map((cta) => (
                  <a
                    key={cta.key}
                    href={cta.href}
                    className="rounded-full border border-[#8fcdb9] bg-white px-4 py-2 text-sm font-semibold text-[#12345f] transition hover:border-[#0fb085] hover:text-[#0b1f4d]"
                  >
                    {cta.label}
                  </a>
                ))
              ) : (
                <p className="text-sm text-[#44658f]">{t("result.sprintPending")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
