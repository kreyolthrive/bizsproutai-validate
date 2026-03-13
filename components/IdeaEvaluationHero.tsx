"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { DynamicValidationResult, FrameworkDecision, ValidationCta } from "@/src/validation/types";

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
  "Mobile car detailing service for busy professionals in Miami",
  "AI social media manager for real estate agents",
  "Online store for handmade leather bags with premium gifting",
];

const PROGRESS_STEPS = [
  "Detecting business category",
  "Selecting validation framework",
  "Researching market signals",
  "Scoring the idea",
  "Generating next steps",
];

function getDecision(result: DynamicValidationResult | null): FrameworkDecision | null {
  if (!result) return null;
  if (result.frameworkReport?.decision) return result.frameworkReport.decision;
  if (result.status === "GO") return "GO";
  if (result.status === "STOP") return "NO_GO";
  return "NEED_WORK";
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

function formatCategory(category: string | undefined): string {
  if (!category) return "Pending";
  return category
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function scoreColor(score: number | undefined): string {
  if (typeof score !== "number") return "text-slate-500";
  if (score >= 80) return "text-emerald-700";
  if (score >= 65) return "text-blue-700";
  if (score >= 50) return "text-amber-700";
  return "text-rose-700";
}

function defaultCtas(locale: string): ValidationCta[] {
  return [
    { key: "build_landing_page", label: "Build landing page", href: `/${locale}/website-builder` },
    { key: "create_sprint_plan", label: "Create sprint plan", href: `/${locale}/launch-kit` },
    { key: "improve_idea", label: "Improve idea", href: `/${locale}#validation` },
    { key: "generate_brand_kit", label: "Generate brand kit", href: `/${locale}/brand-kit` },
    { key: "test_pricing", label: "Test pricing", href: `/${locale}/launch-kit` },
    { key: "launch_validation_campaign", label: "Launch validation campaign", href: `/${locale}/waitlist` },
  ];
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
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DynamicValidationResult | null>(null);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const decision = useMemo(() => getDecision(result), [result]);
  const sampleIdeasRaw = t.raw("sampleIdeas") as unknown;
  const sampleIdeas = Array.isArray(sampleIdeasRaw)
    ? (sampleIdeasRaw.filter((item): item is string => typeof item === "string") as string[])
    : FALLBACK_IDEAS;

  const overallScore = result?.overall_score;
  const confidenceScore = result?.confidenceScore ?? result?.confidence_score;
  const category = result?.businessCategory ?? result?.business_category ?? result?.category;
  const frameworkUsed = result?.frameworkUsed ?? result?.framework_used;
  const strengths = result?.strengths ?? result?.summary.topOpportunities ?? [];
  const weaknesses = result?.weaknesses ?? [];
  const keyRisks = result?.keyRisks ?? result?.key_risks ?? result?.summary.biggestRisks ?? [];
  const assumptions = result?.assumptionsToTest ?? result?.assumptions_to_test ?? [];
  const nextSteps = result?.recommendedNextSteps ?? result?.recommended_next_steps ?? result?.nextActions ?? [];
  const scoreBreakdown = result?.scores;
  const researchSignals = result?.researchSummary?.demandSignals ?? [];
  const ctas = result?.nextActionCtas ?? defaultCtas(locale === "pt" ? "en" : locale);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!loading) {
      setProgressIndex(0);
      return;
    }

    setProgressIndex(0);
    const timer = window.setInterval(() => {
      setProgressIndex((current) => Math.min(current + 1, PROGRESS_STEPS.length - 1));
    }, 900);

    return () => window.clearInterval(timer);
  }, [loading]);

  const clearFeedback = () => {
    setError(null);
    setResult(null);
    setReport(null);
    setEmailStatus(null);
    setLeadStatus(null);
    setRunStatus(null);
  };

  const decisionLabel = (() => {
    if (!decision) return t("result.awaiting");
    if (decision === "CONDITIONAL_GO") return t("result.conditionalGo");
    if (decision === "NO_GO") return t("result.noGo");
    if (decision === "NEED_WORK") return t("result.needsWork");
    return t("result.go");
  })();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
          budgetUsd: budgetUsd.trim() || undefined,
          skillSummary: skillSummary.trim() || undefined,
          timelineDays: timelineDays.trim() || undefined,
          email: trimmedEmail || undefined,
          locale: locale === "pt" ? "en" : locale,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text.slice(0, 160) || "Invalid server response.");
      }

      const data = (await response.json()) as ValidateApiResponse;
      if (!response.ok) {
        throw new Error(data.error || "Validation failed.");
      }

      setProgressIndex(PROGRESS_STEPS.length - 1);
      setResult(data);
      setReport(data.report ?? null);

      if (data.report) {
        downloadReport(data.report);
      }

      if (data.emailDelivery) {
        if (data.emailDelivery.sentToUser) {
          setEmailStatus(t("status.emailSent"));
        } else if (data.emailDelivery.errors.length) {
          setEmailStatus(`${t("status.emailIssue")}: ${data.emailDelivery.errors.join(" | ")}`);
        } else if (data.emailDelivery.attempted) {
          setEmailStatus(t("status.emailAttempted"));
        } else {
          setEmailStatus(t("status.emailOptional"));
        }
      } else if (!trimmedEmail) {
        setEmailStatus(t("status.emailOptional"));
      }

      if (data.leadCapture?.saved) {
        setLeadStatus(t("status.leadSaved"));
      } else if (data.leadCapture?.error) {
        setLeadStatus(`${t("status.leadIssue")}: ${data.leadCapture.error}`);
      }

      if (data.validationRun?.saved) {
        setRunStatus(t("status.runSaved"));
      } else if (data.validationRun?.error) {
        setRunStatus(`${t("status.runIssue")}: ${data.validationRun.error}`);
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : t("errors.generic");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="validation" className="mx-auto max-w-7xl px-6 pb-10">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="brand-panel rounded-[2rem] p-7">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5c6f95]">
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[#0b1f4d]">{t("title")}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#30558d]">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
            <div>
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
                className="mt-2 h-32 w-full rounded-[1.5rem] border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                placeholder={t("form.ideaPlaceholder")}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="customer-input">
                  {t("form.customerLabel")}
                </label>
                <input
                  id="customer-input"
                  value={targetCustomer}
                  onChange={(event) => {
                    clearFeedback();
                    setTargetCustomer(event.target.value);
                  }}
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.customerPlaceholder")}
                />
              </div>
              <div>
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
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.marketPlaceholder")}
                />
              </div>
              <div>
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
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.locationPlaceholder")}
                />
              </div>
              <div>
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
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.offerPlaceholder")}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div>
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
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.problemPlaceholder")}
                />
              </div>
              <div>
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
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.pricingPlaceholder")}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
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
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.budgetPlaceholder")}
                />
              </div>
              <div>
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
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.skillsPlaceholder")}
                />
              </div>
              <div>
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
                  className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                  placeholder={t("form.timelinePlaceholder")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="email-input">
                {t("form.emailLabel")}
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(event) => {
                  clearFeedback();
                  setEmail(event.target.value);
                }}
                className="mt-2 w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
                placeholder={t("form.emailPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !hydrated}
              className="brand-cta w-full rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/35 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t("form.validating") : t("form.submit")}
            </button>

            <p className="text-xs text-[#30558d]">{t("form.note")}</p>

            {error ? (
              <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
          </form>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6f95]">{t("sample.title")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sampleIdeas.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    clearFeedback();
                    setIdea(sample);
                  }}
                  className="rounded-full border border-[#c7d4ea] bg-white px-3 py-1 text-xs text-[#22477f] transition hover:border-[#0fb085] hover:text-[#0b1f4d]"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="brand-panel rounded-[2rem] p-7">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${decisionStyles(decision)}`}>
              {decisionLabel}
            </div>
            <div className="inline-flex rounded-full border border-[#d8e2f3] bg-white px-4 py-2 text-xs font-semibold text-[#22477f]">
              {t("result.category")}: {formatCategory(category)}
            </div>
            <div className="inline-flex rounded-full border border-[#d8e2f3] bg-white px-4 py-2 text-xs font-semibold text-[#22477f]">
              {t("result.framework")}: {frameworkUsed ?? t("result.pending")}
            </div>
          </div>

          <p className="mt-4 text-lg font-semibold text-[#0b1f4d]">
            {result?.summary.oneLiner || t("result.summaryDefault")}
          </p>

          {loading ? (
            <div className="mt-6 rounded-[1.75rem] border border-[#dde7f7] bg-[#f5f9ff] p-5">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.progressTitle")}</p>
              <div className="mt-4 space-y-3">
                {PROGRESS_STEPS.map((step, index) => {
                  const active = index === progressIndex;
                  const complete = index < progressIndex;
                  return (
                    <div key={step} className="flex items-center gap-3 text-sm">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          complete
                            ? "bg-emerald-500"
                            : active
                              ? "bg-[#0fb085] shadow-[0_0_0_6px_rgba(15,176,133,0.12)]"
                              : "bg-slate-200"
                        }`}
                      />
                      <span className={active || complete ? "text-[#0b1f4d]" : "text-[#6d7f9f]"}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#d8e2f3] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6f95]">{t("result.score")}</p>
              <p className={`mt-2 text-3xl font-semibold ${scoreColor(overallScore)}`}>
                {typeof overallScore === "number" ? `${overallScore}/100` : t("result.pending")}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d8e2f3] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6f95]">{t("result.confidence")}</p>
              <p className="mt-2 text-3xl font-semibold text-[#0b1f4d]">
                {typeof confidenceScore === "number" ? `${confidenceScore}/100` : t("result.pending")}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[#d8e2f3] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6f95]">{t("result.verdict")}</p>
              <p className="mt-2 text-lg font-semibold text-[#0b1f4d]">{decisionLabel}</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-[#dde7f7] bg-[#f5f9ff] p-5">
            <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.breakdownTitle")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-[#22477f]">{t("result.marketDemand")}: {scoreBreakdown?.market_demand ?? t("result.pending")}</p>
              <p className="text-sm text-[#22477f]">{t("result.monetization")}: {scoreBreakdown?.monetization ?? t("result.pending")}</p>
              <p className="text-sm text-[#22477f]">{t("result.competition")}: {scoreBreakdown?.competition ?? t("result.pending")}</p>
              <p className="text-sm text-[#22477f]">{t("result.acquisition")}: {scoreBreakdown?.acquisition ?? t("result.pending")}</p>
              <p className="text-sm text-[#22477f]">{t("result.execution")}: {scoreBreakdown?.execution_feasibility ?? t("result.pending")}</p>
              <p className="text-sm text-[#22477f]">{t("result.differentiation")}: {scoreBreakdown?.differentiation ?? t("result.pending")}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-[#e8fbf6] to-white p-4">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.strengthsTitle")}</p>
              {strengths.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#1d497a]">
                  {strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#5a6f95]">{t("result.pending")}</p>
              )}
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-gradient-to-br from-[#fff6ea] to-white p-4">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.weaknessesTitle")}</p>
              {weaknesses.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#6a4b12]">
                  {weaknesses.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#5a6f95]">{t("result.pending")}</p>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="rounded-[1.5rem] border border-rose-200 bg-[#fff6f7] p-4">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.risksTitle")}</p>
              {keyRisks.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#6f2434]">
                  {keyRisks.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#5a6f95]">{t("result.pending")}</p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-[#d8e2f3] bg-white p-4">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.assumptionsTitle")}</p>
              {assumptions.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#1d497a]">
                  {assumptions.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#5a6f95]">{t("result.pending")}</p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-[#d8e2f3] bg-white p-4">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.nextStepsTitle")}</p>
              {nextSteps.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#1d497a]">
                  {nextSteps.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#5a6f95]">{t("result.sprintPending")}</p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-[#d8e2f3] bg-white p-4">
              <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.researchTitle")}</p>
              {researchSignals.length ? (
                <ul className="mt-3 space-y-2 text-sm text-[#1d497a]">
                  {researchSignals.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#5a6f95]">{t("result.pending")}</p>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-[#d8e2f3] bg-white p-4">
            <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.ctaTitle")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ctas.map((cta) => (
                <a
                  key={cta.key}
                  href={cta.href}
                  className="rounded-full border border-[#c7d4ea] bg-[#f5f9ff] px-4 py-2 text-xs font-semibold text-[#22477f] transition hover:border-[#0fb085] hover:text-[#0b1f4d]"
                >
                  {cta.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-[#d8e2f3] bg-white p-4">
            <button
              type="button"
              disabled={!report}
              onClick={() => report && downloadReport(report)}
              className="brand-cta inline-flex rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("result.download")}
            </button>
            <p className="mt-2 text-xs text-[#5a6f95]">
              {report ? `${t("result.downloaded")}: ${report.pdf?.filename ?? report.filename}` : t("result.downloadHint")}
            </p>
            {report?.pdfError ? <p className="mt-1 text-xs text-amber-700">PDF warning: {report.pdfError}</p> : null}
            {emailStatus ? <p className="mt-2 text-xs text-[#2b4d7d]">{emailStatus}</p> : null}
            {leadStatus ? <p className="mt-1 text-xs text-[#2b4d7d]">{leadStatus}</p> : null}
            {runStatus ? <p className="mt-1 text-xs text-[#2b4d7d]">{runStatus}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
