import { LandingPageReveal } from "@/components/marketing/LandingPageReveal";
import { BookingCalendar } from "@/components/marketing/BookingCalendar";
import { HeroQuizCard } from "@/components/marketing/HeroQuizCard";
import { HeroIdeaInput } from "@/components/marketing/HeroIdeaInput";
import { LandingPageTracker } from "@/components/marketing/LandingPageTracker";
import { getLandingCopy } from "@/i18n/landingCopy";

const startingPoint = [
  {
    number: "01",
    icon: "🎯",
    title: "Market Validation Score",
    body: "Understand where your idea has real demand and where it needs more evidence.",
  },
  {
    number: "02",
    icon: "🔗",
    title: "$1 Brand Domain Lock-In",
    body: "Claim an available starter domain (.site, .online, .store) for $1 to make your business official.",
  },
  {
    number: "03",
    icon: "⚡",
    title: "Recommended Launch Asset",
    body: "Generate the right asset for your stage — a discovery script, offer test page, or interactive web app preview.",
  },
  {
    number: "04",
    icon: "🗺️",
    title: "First-Customer Roadmap",
    body: "Follow a clear sequence of actions to reach, pitch, and convert your first 10 customers.",
  },
];

const comparisonRows = [
  {
    generic: "Dumps code or static templates on you.",
    bizsprout: "Validates market demand before you write a line of code.",
  },
  {
    generic: "Assumes you know what to build.",
    bizsprout: "Recommends the exact minimum asset you need.",
  },
  {
    generic: "Zero help finding customers.",
    bizsprout: "Gives you the step-by-step outreach & customer acquisition plan.",
  },
];

const nextMove = [
  {
    number: "01",
    title: "You Have an Idea",
    body: "Clarify who it helps, what problem it solves, lock in your $1 domain, and test key assumptions first.",
  },
  {
    number: "02",
    title: "You Are Ready to Build",
    body: "Generate an interactive web/app preview or landing page tailored to your exact offer before committing to heavy development.",
  },
  {
    number: "03",
    title: "You Launched But Feel Stuck",
    body: "Examine where your offer is losing customer interest and get a targeted change to fix conversions.",
  },
];

const howItWorks = [
  {
    number: "01",
    title: "Clarify & Validate",
    body: "Describe your customer, problem, and offer. Our AI analyzes market demand and competition in under 60 seconds.",
  },
  {
    number: "02",
    title: "Secure Your Domain ($1)",
    body: "Lock in your brand name with an affordable starter domain so you have a real web presence immediately.",
  },
  {
    number: "03",
    title: "Build the Right Asset",
    body: "Turn your next step into something useful: a discovery script, an offer-test landing page, or an interactive web app preview.",
  },
  {
    number: "04",
    title: "Execute the Customer Roadmap",
    body: "Put your asset in front of real customers using our guided outreach scripts and track your first conversions.",
  },
];

const testimonials = [
  {
    quote:
      "I had too many ideas and no idea where to start. Getting a validated score and a clear customer roadmap changed everything for me.",
    attribution: "Early-Stage Founder",
  },
  {
    quote:
      "I stopped trying to vibe-code a massive app and focused on building the right first asset. I got my first lead in 2 weeks.",
    attribution: "Non-Technical Founder",
  },
];

const faqs = [
  {
    q: "What does free validation include?",
    a: "You get a market demand score, target audience analysis, a recommended first asset, and domain availability checking — 100% free with no credit card required.",
  },
  {
    q: "How does the $1 domain work?",
    a: "Once your idea passes validation, you can register an available starter domain extension (.site, .online, .store, .tech) for just $1 to secure your brand name instantly.",
  },
  {
    q: "Do I need to know how to code?",
    a: "Not at all. BizSproutAI generates human-readable launch assets, interactive previews, and landing pages without technical design or coding headaches.",
  },
  {
    q: "What is the 30-Day Founder Sprint Beta?",
    a: "It's a high-touch program combining BizSproutAI's execution tools with direct strategic review checkpoints from founder Wagner Desir to help you go from idea to first paying customer.",
  },
];

export function EnLandingPage({ locale }: { locale: string }) {
  const lc = getLandingCopy(locale);
  const validateHref = `/${locale}/validate`;

  return (
    <main className="overflow-x-hidden bg-[var(--warm-white)] text-[var(--ink)]">
      <LandingPageTracker />
      <LandingPageReveal />

      {/* ── Hero ── */}
      <section id="hero" className="relative overflow-hidden px-5 pb-16 pt-36 md:pt-28 lg:px-10 lg:pt-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-8%] top-[62%] h-[320px] w-[320px] rounded-full bg-[rgba(74,140,92,0.06)] blur-3xl" />
          <div className="absolute right-[6%] top-[8%] h-[360px] w-[360px] rounded-full bg-[rgba(126,200,80,0.06)] blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1fr_0.82fr]">
          {/* Left column */}
          <div>
            <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-[rgba(126,200,80,0.3)] bg-[rgba(126,200,80,0.14)] px-3.5 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[var(--landing-green-mid)]">
              <span>🚀</span>
              More Than Code — The AI Co-Founder for Early-Stage Founders
            </div>

            <h1 className="landing-reveal mt-6 max-w-[18ch] font-[family:var(--font-serif)] text-[clamp(2.6rem,4.2vw,3.8rem)] leading-[1.08] tracking-[-0.01em] text-[var(--landing-green-deep)]">
              Don&rsquo;t just build an app.
              <br />
              <em className="italic text-[var(--landing-green-light)]">Build a business with paying customers.</em>
            </h1>

            <p className="landing-reveal mt-5 max-w-[34rem] text-[1.02rem] leading-[1.65] text-[var(--landing-muted)]">
              Generic AI builders give you code and leave you stranded. BizSproutAI validates real market demand, builds the exact launch asset you need, and hands you the step-by-step roadmap to your first paying customer.
            </p>

            <div className="landing-reveal mt-7 max-w-xl">
              <HeroIdeaInput
                id="hero-idea-input"
                source="hero"
                locale={locale}
                placeholder="Describe your business idea (e.g. EV detailing service in Miami)..."
                cta="Validate Idea & Claim $1 Domain →"
              />
              <p className="mt-3 text-[0.8rem] text-[var(--landing-muted)]">
                Free 60-second validation · Lock in a $1 starter domain · No credit card required to test
              </p>
            </div>

            <div className="landing-reveal mt-8 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(126,200,80,0.14)] text-sm font-medium text-[var(--landing-green-mid)]">
                WD
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--landing-green-deep)]">
                  Founded by Wagner Desir, Business &amp; Mindset Strategist
                </p>
                <a
                  href="https://bizsproutai.com/founder-story"
                  className="mt-px inline-block text-xs font-semibold text-[var(--landing-green-mid)] underline underline-offset-2 transition hover:text-[var(--landing-green-deep)]"
                >
                  Meet the Founder ↗
                </a>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="landing-reveal lg:sticky lg:top-28">
            <HeroQuizCard
              eyebrow={lc.clarityLabel}
              question={lc.clarityQuestion}
              options={lc.clarityChoices}
              cta={lc.quizCta}
              footer={lc.widgetNote}
              outcomes={lc.miniCards.map((c) => ({ icon: c.icon, label: c.title, sub: c.subtitle }))}
              locale={locale}
            />
          </div>
        </div>
      </section>

      {/* ── Section 1: Your Starting Point ── */}
      <section id="starting-point" className="border-t border-[rgba(26,58,42,0.1)] bg-white px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="landing-reveal mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 inline-block text-[0.70rem] font-bold uppercase tracking-[0.10em] text-[var(--landing-green-light)]">
              Your Starting Point
            </p>
            <h2 className="font-[family:var(--font-serif)] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.15] text-[var(--landing-green-deep)]">
              Less guessing. A clearer direction to revenue.
            </h2>
            <p className="mt-4 text-[1rem] leading-[1.65] text-[var(--landing-muted)]">
              Describe your idea in seconds. Get a structured execution plan for deciding what to test, what to build, and how to acquire customers.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {startingPoint.map((item) => (
              <article
                key={item.number}
                className="landing-reveal rounded-[18px] border border-[rgba(26,58,42,0.1)] bg-[var(--warm-white)] p-6 transition duration-[220ms] hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(26,58,42,0.09)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[0.7rem] font-bold text-[var(--landing-green-light)]">{item.number}</span>
                  <span className="text-[1.2rem]">{item.icon}</span>
                </div>
                <h3 className="mt-3 font-[family:var(--font-serif)] text-[1.05rem] leading-tight text-[var(--landing-green-deep)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.85rem] leading-[1.6] text-[var(--landing-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Why BizSproutAI is Built Differently ── */}
      <section id="comparison" className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="landing-reveal mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 inline-block text-[0.70rem] font-bold uppercase tracking-[0.10em] text-[var(--landing-green-light)]">
              Why BizSproutAI is Built Differently
            </p>
            <h2 className="font-[family:var(--font-serif)] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.15] text-[var(--landing-green-deep)]">
              The difference between an app and a real business.
            </h2>
          </div>

          <div className="landing-reveal grid gap-5 md:grid-cols-2">
            <div className="rounded-[20px] border border-[rgba(26,58,42,0.1)] bg-white p-7">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--landing-muted)]">
                Generic AI Builders (Lovable, Replit, Wix)
              </p>
              <div className="mt-5 space-y-4">
                {comparisonRows.map((row) => (
                  <div key={row.generic} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(26,58,42,0.08)] text-[0.7rem] text-[var(--landing-muted)]">
                      ✕
                    </span>
                    <p className="text-[0.9rem] leading-[1.55] text-[var(--landing-muted)]">{row.generic}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[rgba(126,200,80,0.35)] bg-[var(--landing-green-deep)] p-7 text-white shadow-[0_20px_50px_rgba(26,58,42,0.16)]">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--landing-sprout)]">
                BizSproutAI Launch System
              </p>
              <div className="mt-5 space-y-4">
                {comparisonRows.map((row) => (
                  <div key={row.bizsprout} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(126,200,80,0.25)] text-[0.7rem] text-[var(--landing-sprout)]">
                      ✓
                    </span>
                    <p className="text-[0.9rem] font-medium leading-[1.55]">{row.bizsprout}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Built for Your Next Move ── */}
      <section id="next-move" className="bg-white px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="landing-reveal mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 inline-block text-[0.70rem] font-bold uppercase tracking-[0.10em] text-[var(--landing-green-light)]">
              Built for Your Next Move
            </p>
            <h2 className="font-[family:var(--font-serif)] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.15] text-[var(--landing-green-deep)]">
              Start where you are.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {nextMove.map((item) => (
              <article
                key={item.number}
                className="landing-reveal rounded-[18px] border border-[rgba(26,58,42,0.1)] bg-[var(--warm-white)] p-7 transition duration-[220ms] hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(26,58,42,0.09)]"
              >
                <span className="text-[0.7rem] font-bold text-[var(--landing-green-light)]">{item.number}</span>
                <h3 className="mt-2 font-[family:var(--font-serif)] text-[1.15rem] leading-tight text-[var(--landing-green-deep)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[0.875rem] leading-[1.6] text-[var(--landing-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: How It Works ── */}
      <section id="how" className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="landing-reveal mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 inline-block text-[0.70rem] font-bold uppercase tracking-[0.10em] text-[var(--landing-green-light)]">
              How It Works
            </p>
            <h2 className="font-[family:var(--font-serif)] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.15] text-[var(--landing-green-deep)]">
              Validation and execution, connected.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {howItWorks.map((step) => (
              <div
                key={step.number}
                className="landing-reveal flex gap-4 rounded-[18px] border border-[rgba(26,58,42,0.1)] bg-white p-6"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--landing-green-deep)] text-[0.8rem] font-bold text-white">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-[family:var(--font-serif)] text-[1.05rem] leading-tight text-[var(--landing-green-deep)]">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-[0.875rem] leading-[1.6] text-[var(--landing-muted)]">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: After Validation (Free Beta Sprint Offer) ── */}
      <section id="sprint-beta" className="bg-white px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="landing-reveal mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 inline-block text-[0.70rem] font-bold uppercase tracking-[0.10em] text-[var(--landing-green-light)]">
              After Validation
            </p>
            <h2 className="font-[family:var(--font-serif)] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.15] text-[var(--landing-green-deep)]">
              Keep moving with hands-on support.
            </h2>
          </div>

          <div className="landing-reveal grid gap-6 lg:grid-cols-2">
            <div className="rounded-[24px] border border-[rgba(26,58,42,0.1)] bg-[var(--warm-white)] p-8">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--landing-muted)]">
                Option A
              </p>
              <h3 className="mt-3 font-[family:var(--font-serif)] text-[1.3rem] text-[var(--landing-green-deep)]">
                Self-Guided Execution
              </h3>
              <p className="mt-3 text-[0.9rem] leading-[1.6] text-[var(--landing-muted)]">
                Continue using the BizSproutAI workspace to build your recommended assets, manage your domain, and track your launch progress.
              </p>
              <a
                href="https://bizsproutai.com"
                className="mt-6 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-[var(--landing-green-deep)] underline underline-offset-4 transition hover:text-[var(--landing-green-mid)]"
              >
                Explore Platform Features ↗
              </a>
            </div>

            <div className="relative rounded-[24px] border border-[rgba(126,200,80,0.35)] bg-[var(--landing-green-deep)] p-8 text-white shadow-[0_20px_50px_rgba(26,58,42,0.18)]">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[var(--landing-sprout)]">
                Option B · Limited founding seats
              </p>
              <h3 className="mt-3 font-[family:var(--font-serif)] text-[1.3rem]">
                30-Day Guided Founder Sprint (Free Beta Cohort)
              </h3>
              <p className="mt-3 text-[0.9rem] leading-[1.6] text-white/75">
                Want 1-on-1 strategic support? Join our 30-day guided Sprint focused on testing assumptions, launching your asset, and getting your first customer.
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-[1rem] text-white/50 line-through">$497</span>
                <span className="text-[1.4rem] font-bold text-[var(--landing-sprout)]">FREE</span>
                <span className="pb-0.5 text-[0.78rem] text-white/60">for the first 10 founding members</span>
              </div>
              <p className="mt-2 text-[0.75rem] text-white/50">Waived in exchange for a case study.</p>
              <a
                href="https://bizsproutai.com/apply"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--landing-sprout)] px-6 py-3.5 text-[0.95rem] font-bold text-[var(--landing-ink)] shadow-[0_4px_20px_rgba(126,200,80,0.35)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Apply for Free Founder Sprint Beta →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Social Proof ── */}
      <section id="proof" className="bg-[var(--landing-cream)] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="landing-reveal mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-[family:var(--font-serif)] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.15] text-[var(--landing-green-deep)]">
              What early founders have shared
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure
                key={t.attribution}
                className="landing-reveal rounded-[18px] border border-[rgba(26,58,42,0.1)] bg-white p-7 shadow-sm"
              >
                <blockquote className="text-[0.95rem] leading-[1.6] text-[var(--landing-ink)]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 text-[0.8rem] font-semibold text-[var(--landing-green-deep)]">
                  — {t.attribution}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: FAQ ── */}
      <section id="faq" className="bg-white px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="landing-reveal mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-[family:var(--font-serif)] text-[clamp(1.9rem,3.2vw,2.8rem)] leading-[1.15] text-[var(--landing-green-deep)]">
              What founders usually want to know.
            </h2>
          </div>

          <div className="landing-reveal space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-[16px] border border-[rgba(26,58,42,0.1)] bg-[var(--warm-white)] px-6 py-4 open:bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-[0.98rem] font-semibold text-[var(--landing-green-deep)]">
                  {item.q}
                  <span className="ml-4 flex-shrink-0 text-[var(--landing-green-light)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[0.9rem] leading-[1.65] text-[var(--landing-muted)]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8: Final CTA ── */}
      <section id="final-cta" className="bg-[var(--landing-green-deep)] px-5 py-20 text-white lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="landing-reveal font-[family:var(--font-serif)] text-[clamp(2rem,3.6vw,3rem)] leading-[1.12]">
            You don&rsquo;t need every answer to begin.
            <br />
            <em className="italic text-[var(--landing-sprout)]">You just need a validated start.</em>
          </h2>

          <div className="landing-reveal mx-auto mt-9 max-w-xl text-left sm:text-center">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.06] p-4 sm:p-5">
              <HeroIdeaInput
                id="final-cta-idea-input"
                source="final_cta"
                locale={locale}
                placeholder="Enter your business idea to test it..."
                cta="Start Free Validation & Claim $1 Domain →"
              />
            </div>
          </div>

          <p className="landing-reveal mt-5 text-[0.8rem] text-white/50">
            Free to start · No account required for validation
          </p>
        </div>
      </section>

      {/* ── Bonus: Booking calendar (secondary option, not in primary nav) ── */}
      <section id="booking" className="relative overflow-hidden bg-[var(--landing-cream)] px-5 pb-20 pt-20 lg:px-10">
        <div className="relative mx-auto max-w-5xl">
          <div className="landing-reveal text-center">
            <h2 className="font-[family:var(--font-serif)] text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-[var(--landing-green-deep)]">
              Prefer to talk first?
              <br />
              <em className="italic text-[var(--landing-green-light)]">Free 30-Minute Founder Sprint Fit Call</em>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[1rem] leading-[1.65] text-[var(--landing-muted)]">
              We&rsquo;ll map your fastest path to a first paying customer and tell you whether the Sprint is the right fit. No pitch — just clarity and one clear action to take today.
            </p>
          </div>

          <div className="landing-reveal mt-10 rounded-[28px] border border-[rgba(26,58,42,0.1)] bg-white p-4 shadow-[0_24px_60px_rgba(26,58,42,0.08)] md:p-6">
            <BookingCalendar
              title="Founder Sprint Fit Call"
              subtitle={lc.bookingSubtitle}
              hideHeader
              className="max-w-none"
              frameClassName="overflow-hidden rounded-[1.5rem] border border-[rgba(26,58,42,0.08)] bg-white shadow-[0_18px_50px_rgba(26,58,42,0.08)]"
            />
          </div>

          <div className="landing-reveal mt-8 text-center">
            <p className="text-[0.82rem] text-[var(--landing-muted)]">
              Free validation is still the fastest path.{" "}
              <a
                href={validateHref}
                className="font-semibold text-[var(--landing-green-deep)] underline underline-offset-2"
              >
                Start free validation instead →
              </a>
            </p>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BizSproutAI",
              url: "https://validate.bizsproutai.com",
              logo: "https://validate.bizsproutai.com/bizsproutai-logo.png",
              description:
                "BizSproutAI is the AI Co-Founder for early-stage founders: validate real market demand for free, claim a $1 starter domain, build the exact launch asset you need, and get the roadmap to your first paying customer.",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                email: "info@bizsproutai.com",
                contactType: "customer support",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: "30-Day Founder Sprint",
              description:
                "A done-with-you founder sprint that helps early-stage founders validate their idea, build the right launch asset, start real conversations, and reach their first paying customer in 30 days.",
              provider: {
                "@type": "Organization",
                name: "BizSproutAI",
                url: "https://validate.bizsproutai.com",
              },
              offers: {
                "@type": "Offer",
                category: "Business Launch Program",
                availability: "https://schema.org/LimitedAvailability",
                url: "https://bizsproutai.com/apply",
              },
            },
          ]),
        }}
      />
    </main>
  );
}
