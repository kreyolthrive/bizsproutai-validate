import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getLandingCopy } from "@/i18n/landingCopy";
import { LandingPageTracker } from "@/components/marketing/LandingPageTracker";
import { locales, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = getLandingCopy(locale);
  return {
    title: `BizSproutAI | ${c.eyebrow}`,
    description: c.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries([
        ...locales.map((l) => [l, `/${l}`]),
        ["x-default", "/en"],
      ]),
    },
    openGraph: {
      title: `BizSproutAI | ${c.eyebrow}`,
      description: c.description,
      url: `https://validate.bizsproutai.com/${locale}`,
      siteName: "BizSproutAI",
      type: "website",
      images: [
        {
          url: `/api/og?locale=${locale}`,
          width: 1200,
          height: 630,
          alt: c.eyebrow,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `BizSproutAI | ${c.eyebrow}`,
      description: c.description,
      images: [`/api/og?locale=${locale}`],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = getLandingCopy(locale);
  const validateHref = `/${locale}/validate`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bizsproutai.com/#organization",
        name: "BizSproutAI",
        url: "https://bizsproutai.com/",
        description: c.description,
        founder: { "@id": "https://bizsproutai.com/#founder" },
      },
      {
        "@type": "Person",
        "@id": "https://bizsproutai.com/#founder",
        name: "Wagner Desir",
        sameAs: ["https://www.linkedin.com/in/wagner-desir/"],
      },
      {
        "@type": "WebPage",
        "@id": `https://validate.bizsproutai.com/${locale}#webpage`,
        url: `https://validate.bizsproutai.com/${locale}`,
        name: `BizSproutAI | ${c.eyebrow}`,
        description: c.description,
        inLanguage: locale as Locale,
        about: { "@id": "https://bizsproutai.com/#organization" },
      },
    ],
  };

  return (
    <div className="validation-landing">
      <LandingPageTracker />
      <section className="vl-hero vl-section" aria-labelledby="landing-title">
        <div className="vl-glow" aria-hidden="true" />
        <div className="vl-container vl-hero-grid">
          <div>
            <p className="vl-eyebrow">
              <span aria-hidden="true" className="vl-dot" />
              {c.eyebrow}
            </p>
            <h1 id="landing-title">
              {c.title} <span>{c.accent}</span>
            </h1>
            <p className="vl-lead">{c.description}</p>
            <div className="vl-actions">
              <a className="vl-button" href={validateHref}>
                {c.primary}
                <span aria-hidden="true"> ↗</span>
              </a>
              <a className="vl-text-link" href="#how">
                {c.secondary}
                <span aria-hidden="true"> ↓</span>
              </a>
            </div>
            <p className="vl-note">{c.note}</p>
            <div className="vl-founder">
              <span aria-hidden="true" className="vl-monogram">
                WD
              </span>
              <div>
                <p>{c.founderIntro}</p>
                <a href="https://bizsproutai.com/founder-story">
                  {c.founderLink} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
          <aside className="vl-result-card" aria-labelledby="result-title">
            <p className="vl-eyebrow">{c.label}</p>
            <h2 id="result-title">{c.resultTitle}</h2>
            <p className="vl-muted">{c.resultIntro}</p>
            <ol className="vl-results">
              {c.results.map(([title, body], i) => (
                <li key={title}>
                  <span className="vl-number" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="vl-evidence">{c.evidence}</p>
          </aside>
        </div>
      </section>

      <section
        id="pain"
        className="vl-section"
        aria-labelledby="audience-title"
      >
        <div className="vl-container">
          <p className="vl-eyebrow">{c.audienceLabel}</p>
          <h2 id="audience-title">{c.audienceTitle}</h2>
          <div className="vl-audience-grid">
            {c.audiences.map(([title, body], i) => (
              <article className="vl-card" key={title}>
                <span className="vl-kicker" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how"
        className="vl-section vl-method"
        aria-labelledby="method-title"
      >
        <div className="vl-container">
          <p className="vl-eyebrow">{c.methodLabel}</p>
          <h2 id="method-title">{c.methodTitle}</h2>
          <p className="vl-section-intro">{c.methodIntro}</p>
          <ol className="vl-step-grid">
            {c.steps.map(([title, body], i) => (
              <li key={title}>
                <span className="vl-step-number" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <a className="vl-text-link" href={validateHref}>
            {c.primary} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section id="bridge" className="vl-section" aria-labelledby="next-title">
        <div className="vl-container">
          <p className="vl-eyebrow">{c.nextLabel}</p>
          <h2 id="next-title">{c.nextTitle}</h2>
          <div className="vl-next-grid">
            <article className="vl-card vl-platform">
              <h3>{c.appTitle}</h3>
              <p>{c.appBody}</p>
              <a className="vl-button" href="https://bizsproutai.com/">
                {c.appCta} <span aria-hidden="true">↗</span>
              </a>
            </article>
            <article id="booking" className="vl-card">
              <h3>{c.coachingTitle}</h3>
              <p>{c.coachingBody}</p>
              <a
                className="vl-button vl-button-secondary"
                href="https://cal.com/bizsproutai/30-min-founder-clarity-session"
              >
                {c.coachingCta} <span aria-hidden="true">↗</span>
              </a>
              <p className="vl-note">{c.coachingNote}</p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="vl-section vl-feedback"
        aria-labelledby="feedback-title"
      >
        <div className="vl-container">
          <p className="vl-eyebrow">{c.feedbackTitle}</p>
          <h2 id="feedback-title" className="sr-only">
            {c.feedbackTitle}
          </h2>
          <div className="vl-next-grid">
            {c.quotes.map((quote) => (
              <figure key={quote}>
                <blockquote>“{quote}”</blockquote>
                <figcaption>— {c.founderLabel}</figcaption>
              </figure>
            ))}
          </div>
          <p className="vl-note">{c.anonymousNote}</p>
        </div>
      </section>

      <section className="vl-section" aria-labelledby="faq-title">
        <div className="vl-container vl-faq-layout">
          <h2 id="faq-title">{c.faqTitle}</h2>
          <div>
            {c.faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="vl-section vl-final" aria-labelledby="final-title">
        <div className="vl-container">
          <h2 id="final-title">{c.finalTitle}</h2>
          <p className="vl-section-intro">{c.finalBody}</p>
          <a className="vl-button" href={validateHref}>
            {c.primary} <span aria-hidden="true">↗</span>
          </a>
          <p className="vl-note">{c.note}</p>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
