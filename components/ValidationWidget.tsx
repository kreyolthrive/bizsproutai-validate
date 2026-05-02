"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type StageIndex = 0 | 1 | 2 | 3;

interface ValidationResult {
  stage: string;
  verdict: string;
  firstAsset: string;
  nextSteps: string[];
  warning: string;
}

// ─── Quick inline results (hero preview) ─────────────────────────────────────

const RESULTS: Record<StageIndex, ValidationResult> = {
  0: {
    stage: "Idea Stage",
    verdict: "Too early to build. You need offer clarity first.",
    firstAsset: "Simple landing page — one clear offer, one CTA",
    nextSteps: [
      "Define exactly who you help and what problem you solve",
      "Write one clear offer statement a stranger could understand",
      "Test that message with 3 real people before building anything",
      "Identify one thing someone would pay you for this week",
    ],
    warning:
      "Do not build a full app or website yet. A validated offer comes before a built product.",
  },
  1: {
    stage: "First Asset Stage",
    verdict: "Clear enough to launch. Build the minimum asset now.",
    firstAsset: "Booking page or simple landing page with one CTA",
    nextSteps: [
      "Build one page that clearly describes your offer and who it is for",
      "Add a booking link or lead capture form — no complex flow needed yet",
      "Write 3 direct outreach messages and send them this week",
      "Follow up within 24 hours of every response",
    ],
    warning:
      "Do not wait for a perfect design. A clear, simple page outperforms a polished but vague one. Ship it, then improve it.",
  },
  2: {
    stage: "Optimization Stage",
    verdict: "Needs consolidation first. Connect what you have before adding more.",
    firstAsset: "Unified funnel or website connecting your existing pieces",
    nextSteps: [
      "List every tool and asset you have — map the actual client path",
      "Identify the single conversion point that matters most right now",
      "Remove or pause everything not on that direct path",
      "Focus on one outreach source before expanding to others",
    ],
    warning:
      "Do not add more tools or platforms. Adding complexity before clarity makes the problem worse.",
  },
  3: {
    stage: "Launch-Ready Stage",
    verdict: "Clear enough to launch. You need execution, not more planning.",
    firstAsset: "Full launch system — asset, outreach, and follow-up connected",
    nextSteps: [
      "Lock your offer messaging and CTA today — stop adjusting, start sending",
      "Test your booking or checkout flow end to end before launch day",
      "Prepare your first 30 outreach messages and schedule them",
      "Set a hard public launch date and tell someone you trust",
    ],
    warning:
      "Do not wait for perfection. Launching at 80% teaches you more than planning at 100%. The market will show you what to fix.",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  choices: string[];
  clarityLabel: string;
  clarityQuestion: string;
  validationCta: string;
  platformBridgeCta: string;
  callCta: string;
  callHref: string;
  actionHref: string;
  locale: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ValidationWidget({
  choices,
  clarityLabel,
  clarityQuestion,
  validationCta,
  platformBridgeCta,
  callCta,
  callHref,
  actionHref,
  locale,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<StageIndex | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);

  function handleSubmit() {
    if (selected === null) return;
    // Navigate to the full validation page with the stage pre-selected
    router.push(`/${locale}/validate?stage=${selected}`);
  }

  function handleReset() {
    setSelected(null);
    setResult(null);
  }

  // ── Quick inline result (kept for reference, currently navigates away) ──

  if (result) {
    return (
      <div className="rounded-[24px] bg-[var(--landing-green-deep)] p-6 text-white shadow-[0_20px_50px_rgba(26,58,42,0.16)] sm:p-7">
        <div className="mb-4">
          <span className="rounded-full bg-[var(--landing-sprout)] px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-ink)]">
            {result.stage}
          </span>
        </div>
        <p className="font-[family:var(--font-serif)] text-[1.2rem] leading-[1.3] sm:text-[1.35rem]">
          {result.verdict}
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-sprout)]">
            Recommended first asset
          </p>
          <p className="mt-1 text-[0.93rem] font-semibold text-white">
            {result.firstAsset}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-sprout)]">
            Your next 4 steps
          </p>
          <ol className="mt-2 space-y-2">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.85rem] leading-[1.55] text-white/85">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.68rem] font-bold text-[var(--landing-sprout)]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4 rounded-xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.07)] px-4 py-3">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-amber)]">
            One mistake to avoid
          </p>
          <p className="mt-1 text-[0.85rem] leading-[1.55] text-white/80">
            {result.warning}
          </p>
        </div>
        <div className="mt-5 space-y-2.5">
          <a
            href={actionHref}
            className="flex w-full items-center justify-center rounded-full bg-[var(--landing-sprout)] px-5 py-4 text-[0.95rem] font-semibold text-[var(--landing-ink)] transition hover:brightness-105"
          >
            {platformBridgeCta} →
          </a>
          <a
            href={callHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 text-[0.85rem] font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
          >
            {callCta}
          </a>
        </div>
        <button
          onClick={handleReset}
          className="mt-3 text-[0.75rem] text-white/35 transition hover:text-white/55"
        >
          ← Validate again
        </button>
      </div>
    );
  }

  // ── Selection form ────────────────────────────────────────────────────────

  return (
    <div className="rounded-[24px] bg-[var(--landing-green-deep)] p-6 text-white shadow-[0_20px_50px_rgba(26,58,42,0.16)] sm:p-7">
      <div className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--landing-sprout)]">
        {clarityLabel}
      </div>
      <p className="max-w-md font-[family:var(--font-serif)] text-[1.3rem] leading-[1.22] sm:text-[1.45rem]">
        {clarityQuestion}
      </p>

      <div className="mt-5 space-y-2.5">
        {choices.map((label, index) => (
          <button
            key={label}
            onClick={() => setSelected(index as StageIndex)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3.5 text-left text-[0.9rem] transition ${
              selected === index
                ? "border-[rgba(126,200,80,0.65)] bg-[rgba(126,200,80,0.22)]"
                : "border-white/10 bg-white/[0.06] hover:border-white/20 hover:bg-white/[0.1]"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 flex-shrink-0 rounded-full transition ${
                selected === index ? "bg-[var(--landing-sprout)]" : "bg-white/25"
              }`}
            />
            {label}
          </button>
        ))}
      </div>

      {/* Primary CTA — large and dominant */}
      <button
        onClick={handleSubmit}
        disabled={selected === null}
        className="mt-6 w-full rounded-full bg-[var(--landing-sprout)] px-6 py-4 text-[1rem] font-bold text-[var(--landing-ink)] shadow-[0_4px_20px_rgba(126,200,80,0.35)] transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_8px_30px_rgba(126,200,80,0.45)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {validationCta} →
      </button>

      <p className="mt-3 text-center text-[0.75rem] text-white/40">
        Free · No account needed · Takes under a minute
      </p>
    </div>
  );
}
