"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { DynamicValidationResult, FrameworkDecision } from "@/src/validation/types";

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
};

const FALLBACK_IDEAS = [
  "Handmade leather bags sold directly online to customers",
  "Mobile car wash subscription service for busy professionals in Miami",
  "AI social media manager for real estate agents",
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

export function IdeaEvaluationHero({ locale }: IdeaEvaluationHeroProps) {
  const t = useTranslations("validationHero");

  const [idea, setIdea] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DynamicValidationResult | null>(null);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);

  const decision = useMemo(() => getDecision(result), [result]);
  const demandScore = result?.frameworkReport?.problemDemand.total;
  const competitionScore = result?.frameworkReport?.solutionValidation.differentiation;
  const modelMargin = result?.frameworkReport?.businessModelValidation.margin;
  const nextActions = (result?.nextActions ?? []).slice(0, 3);

  const sampleIdeasRaw = t.raw("sampleIdeas") as unknown;
  const sampleIdeas = Array.isArray(sampleIdeasRaw)
    ? (sampleIdeasRaw.filter((item): item is string => typeof item === "string") as string[])
    : FALLBACK_IDEAS;

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

    if (trimmedIdea.length < 10) {
      setError(t("errors.minIdea"));
      return;
    }
    if (!isEmailValid(trimmedEmail)) {
      setError(t("errors.invalidEmail"));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: trimmedIdea,
          email: trimmedEmail,
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
          setEmailStatus(t("status.emailDisabled"));
        }
      } else {
        setEmailStatus(t("status.emailDisabled"));
      }

      if (data.leadCapture?.saved) {
        setLeadStatus(t("status.leadSaved"));
      } else if (data.leadCapture?.error) {
        setLeadStatus(`${t("status.leadIssue")}: ${data.leadCapture.error}`);
      } else {
        setLeadStatus(null);
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : t("errors.generic");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="validation" className="mx-auto max-w-6xl px-6 pb-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="brand-panel rounded-3xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="idea-input">
              {t("form.ideaLabel")}
            </label>
            <textarea
              id="idea-input"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              className="h-40 w-full rounded-2xl border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
              placeholder={t("form.ideaPlaceholder")}
              required
            />

            <label className="block text-sm font-semibold text-[#0b1f4d]" htmlFor="email-input">
              {t("form.emailLabel")}
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-full border border-[#c7d4ea] bg-white px-4 py-3 text-sm text-[#0b1f4d] outline-none ring-[#0fb085]/25 focus:ring-4"
              placeholder={t("form.emailPlaceholder")}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="brand-cta w-full rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/35 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t("form.validating") : t("form.submit")}
            </button>

            <p className="text-xs text-[#30558d]">{t("form.note")}</p>

            {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          </form>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6f95]">{t("sample.title")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sampleIdeas.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setIdea(sample)}
                  className="rounded-full border border-[#c7d4ea] bg-white px-3 py-1 text-xs text-[#22477f] transition hover:border-[#0fb085] hover:text-[#0b1f4d]"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="brand-panel rounded-3xl p-7">
          <div className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold ${decisionStyles(decision)}`}>
            {decisionLabel}
          </div>

          <p className="mt-4 text-lg font-semibold text-[#0b1f4d]">
            {result?.summary.oneLiner || t("result.summaryDefault")}
          </p>

          <div className="mt-5 space-y-3 rounded-2xl border border-[#dde7f7] bg-[#f5f9ff] p-4">
            <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.breakdownTitle")}</p>
            <p className="text-sm text-[#22477f]">
              {t("result.demand")}:{" "}
              {typeof demandScore === "number" ? `${demandScore}/20` : t("result.pending")}
            </p>
            <p className="text-sm text-[#22477f]">
              {t("result.competition")}:{" "}
              {typeof competitionScore === "number" ? `${competitionScore}/5` : t("result.pending")}
            </p>
            <p className="text-sm text-[#22477f]">
              {t("result.model")}:{" "}
              {typeof modelMargin === "number" ? `${modelMargin}%` : t("result.pending")}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-[#e8fbf6] to-[#eff5ff] p-4">
            <p className="text-sm font-semibold text-[#0b1f4d]">{t("result.sprintTitle")}</p>
            {nextActions.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm text-[#1d497a]">
                {nextActions.map((action) => (
                  <li key={action}>• {action}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[#1f4678]">{t("result.sprintPending")}</p>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-[#d8e2f3] bg-white p-4">
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
          </div>
        </div>
      </div>
    </section>
  );
}
