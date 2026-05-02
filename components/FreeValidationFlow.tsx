"use client";

import { useState, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ValidationResult {
  stage: string;
  stageTag: string;
  verdict: string;
  firstAsset: string;
  firstAssetReason: string;
  nextSteps: string[];
  warning: string;
}

// ─── Keyword detection for first asset recommendation ───────────────────────

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

  // fallback by stage
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

// ─── Core result logic ───────────────────────────────────────────────────────

function computeResult(
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

// ─── Stage choices ────────────────────────────────────────────────────────────

const STAGE_CHOICES = [
  "I have an idea but no clear offer or direction",
  "I have an offer but no launch asset or system behind it",
  "I have scattered pieces but nothing connected",
  "I am ready to launch but need hands-on support",
];

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  locale: string;
  initialStage?: number;
  phoneHref: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FreeValidationFlow({ locale, initialStage, phoneHref }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stageIndex, setStageIndex] = useState<number | null>(
    initialStage != null && initialStage >= 0 && initialStage <= 3
      ? initialStage
      : null
  );
  const [idea, setIdea] = useState("");
  const [audience, setAudience] = useState("");
  const [hasLiveAsset, setHasLiveAsset] = useState<boolean | null>(null);
  const [hasTraction, setHasTraction] = useState<boolean | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);

  // If stage was pre-filled from URL, skip to step 2 after first render
  useEffect(() => {
    if (initialStage != null && initialStage >= 0 && initialStage <= 3) {
      setStep(2);
    }
  }, [initialStage]);

  function handleStep1Next() {
    if (stageIndex === null) return;
    setStep(2);
  }

  function handleStep2Next() {
    setStep(3);
  }

  function handleSubmit() {
    if (stageIndex === null || hasLiveAsset === null || hasTraction === null) return;
    const r = computeResult(stageIndex, idea, audience, hasLiveAsset, hasTraction);
    setResult(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setStep(1);
    setStageIndex(null);
    setIdea("");
    setAudience("");
    setHasLiveAsset(null);
    setHasTraction(null);
    setResult(null);
  }

  // ── Result view ────────────────────────────────────────────────────────────

  if (result) {
    return (
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(126,200,80,0.3)] bg-[rgba(126,200,80,0.12)] px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-[var(--landing-green-mid)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--landing-sprout)]" />
            Your Free Validation Result
          </span>
          <h2 className="mt-4 font-[family:var(--font-serif)] text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.1] text-[var(--landing-green-deep)]">
            Here is where you stand.
          </h2>
          <p className="mt-2 text-[0.95rem] text-[var(--landing-muted)]">
            Based on what you shared — here is what BizSproutAI recommends.
          </p>
        </div>

        {/* Stage badge */}
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full bg-[var(--landing-green-deep)] px-4 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-white">
            {result.stageTag}
          </span>
        </div>

        {/* Verdict */}
        <div className="rounded-[20px] border border-[rgba(26,58,42,0.1)] bg-white p-6 shadow-sm">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-green-light)]">
            Verdict
          </p>
          <p className="mt-2 font-[family:var(--font-serif)] text-[1.35rem] leading-[1.3] text-[var(--landing-green-deep)]">
            {result.verdict}
          </p>
        </div>

        {/* First asset */}
        <div className="mt-4 rounded-[20px] border border-[rgba(126,200,80,0.25)] bg-[rgba(126,200,80,0.06)] p-6">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-green-mid)]">
            BizSproutAI recommends first
          </p>
          <p className="mt-2 text-[1.15rem] font-semibold text-[var(--landing-green-deep)]">
            {result.firstAsset}
          </p>
          <p className="mt-2 text-[0.9rem] leading-[1.6] text-[var(--landing-muted)]">
            {result.firstAssetReason}
          </p>
        </div>

        {/* Next steps */}
        <div className="mt-4 rounded-[20px] border border-[rgba(26,58,42,0.08)] bg-white p-6 shadow-sm">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-green-light)]">
            Your next 4 steps
          </p>
          <ol className="mt-4 space-y-3">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-[0.93rem] leading-[1.6] text-[var(--landing-muted)]">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(126,200,80,0.15)] text-[0.72rem] font-bold text-[var(--landing-green-deep)]">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Warning */}
        <div className="mt-4 rounded-[20px] border border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.06)] p-6">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#b45309]">
            Avoid this mistake
          </p>
          <p className="mt-2 text-[0.93rem] leading-[1.65] text-[var(--landing-muted)]">
            {result.warning}
          </p>
        </div>

        {/* Platform CTA */}
        <div className="mt-8 rounded-[20px] bg-[var(--landing-green-deep)] p-6 text-white sm:p-8">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--landing-sprout)]">
            Your next step
          </p>
          <h3 className="mt-2 font-[family:var(--font-serif)] text-[1.35rem] leading-tight">
            Want the full diagnosis, sprint plan, and build support?
          </h3>
          <p className="mt-2 text-[0.9rem] leading-[1.6] text-white/70">
            Free validation shows you where you are. The full BizSproutAI platform takes you from
            here to your first paying customer — with a 30-day sprint, hands-on support, and build
            help at every stage.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={phoneHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center rounded-full bg-[var(--landing-sprout)] px-6 py-4 text-[0.95rem] font-semibold text-[var(--landing-ink)] transition hover:brightness-105"
            >
              Unlock my full sprint inside BizSproutAI →
            </a>
            <a
              href={phoneHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-full border border-white/20 px-6 py-4 text-[0.9rem] font-semibold text-white/80 transition hover:border-white/40 hover:text-white sm:flex-none"
            >
              Book a free fit call
            </a>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="mt-6 text-[0.82rem] text-[var(--landing-muted)] underline underline-offset-4 transition hover:text-[var(--landing-green-deep)]"
        >
          ← Validate a different idea
        </button>
      </div>
    );
  }

  // ── Form view ──────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-between">
        <StepDots total={3} current={step - 1} />
        <span className="text-[0.8rem] text-[var(--landing-muted)]">
          Step {step} of 3
        </span>
      </div>

      {/* ── Step 1: Stage ── */}
      {step === 1 && (
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            Free Validation — Step 1
          </p>
          <h2 className="mt-3 font-[family:var(--font-serif)] text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.12] text-[var(--landing-green-deep)]">
            Where are you right now?
          </h2>
          <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--landing-muted)]">
            Pick what best describes your current situation. Be honest — the result will be more
            useful if you are accurate.
          </p>

          <div className="mt-7 space-y-3">
            {STAGE_CHOICES.map((label, i) => (
              <button
                key={label}
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
            onClick={handleStep1Next}
            disabled={stageIndex === null}
            className="mt-8 w-full rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 2: About your idea ── */}
      {step === 2 && (
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            Free Validation — Step 2
          </p>
          <h2 className="mt-3 font-[family:var(--font-serif)] text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.12] text-[var(--landing-green-deep)]">
            Tell us about your idea.
          </h2>
          <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--landing-muted)]">
            One or two sentences is enough. The more specific you are, the more useful the
            recommendation will be.
          </p>

          <div className="mt-7 space-y-5">
            <div>
              <label className="block text-[0.82rem] font-semibold text-[var(--landing-green-deep)]">
                What are you building or offering?
                <span className="ml-1 font-normal text-[var(--landing-muted)]">(required)</span>
              </label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. A coaching service for first-time founders who want to validate their idea before building."
                rows={3}
                maxLength={400}
                className="mt-2 w-full resize-none rounded-[14px] border border-[rgba(26,58,42,0.15)] bg-white px-4 py-3 text-[0.95rem] leading-[1.6] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/60 focus:border-[var(--landing-green-mid)] focus:ring-2 focus:ring-[rgba(126,200,80,0.2)]"
              />
            </div>

            <div>
              <label className="block text-[0.82rem] font-semibold text-[var(--landing-green-deep)]">
                Who is it for?
                <span className="ml-1 font-normal text-[var(--landing-muted)]">(optional)</span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Solo founders, freelancers, small service businesses"
                maxLength={200}
                className="mt-2 w-full rounded-[14px] border border-[rgba(26,58,42,0.15)] bg-white px-4 py-3 text-[0.95rem] text-[var(--landing-ink)] outline-none transition placeholder:text-[var(--landing-muted)]/60 focus:border-[var(--landing-green-mid)] focus:ring-2 focus:ring-[rgba(126,200,80,0.2)]"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-full border border-[rgba(26,58,42,0.15)] px-6 py-4 text-[0.95rem] font-semibold text-[var(--landing-muted)] transition hover:border-[rgba(26,58,42,0.3)] hover:text-[var(--landing-green-deep)]"
            >
              ← Back
            </button>
            <button
              onClick={handleStep2Next}
              disabled={idea.trim().length < 10}
              className="flex-1 rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Current status ── */}
      {step === 3 && (
        <div>
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--landing-green-light)]">
            Free Validation — Step 3
          </p>
          <h2 className="mt-3 font-[family:var(--font-serif)] text-[clamp(1.65rem,3vw,2.4rem)] leading-[1.12] text-[var(--landing-green-deep)]">
            What exists right now?
          </h2>
          <p className="mt-3 text-[0.95rem] leading-[1.65] text-[var(--landing-muted)]">
            Two quick questions to sharpen the recommendation.
          </p>

          <div className="mt-7 space-y-6">
            {/* Question 1 */}
            <div>
              <p className="text-[0.88rem] font-semibold text-[var(--landing-green-deep)]">
                Do you have a live website, landing page, or booking system?
              </p>
              <div className="mt-3 flex gap-3">
                {[
                  { label: "Yes, something is live", value: true },
                  { label: "No, nothing live yet", value: false },
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

            {/* Question 2 */}
            <div>
              <p className="text-[0.88rem] font-semibold text-[var(--landing-green-deep)]">
                Are people already paying, booking, or signing up?
              </p>
              <div className="mt-3 flex gap-3">
                {[
                  { label: "Yes, I have some traction", value: true },
                  { label: "No, not yet", value: false },
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
              onClick={() => setStep(2)}
              className="rounded-full border border-[rgba(26,58,42,0.15)] px-6 py-4 text-[0.95rem] font-semibold text-[var(--landing-muted)] transition hover:border-[rgba(26,58,42,0.3)] hover:text-[var(--landing-green-deep)]"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={hasLiveAsset === null || hasTraction === null}
              className="flex-1 rounded-full bg-[var(--landing-green-deep)] px-8 py-4 text-[1rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_10px_30px_rgba(26,58,42,0.2)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Get My Free Validation →
            </button>
          </div>

          <p className="mt-4 text-center text-[0.78rem] text-[var(--landing-muted)]">
            No account needed. Results are instant.
          </p>
        </div>
      )}
    </div>
  );
}
