import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource/instrument-serif/400.css";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { RetargetingPixels } from "@/components/marketing/RetargetingPixels";
import { locales, seoMetadata, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";

const LOGO_CANDIDATES = [
  "bizsproutai-logo.png",
  "bizsproutai logo.png",
  "bizsproutai logo.svg",
  "bizsproutai-logo.svg",
  "logo.png",
  "logo.svg",
];


function pickLogoSrc(): string {
  const publicDir = path.join(process.cwd(), "public");
  for (const file of LOGO_CANDIDATES) {
    if (fs.existsSync(path.join(publicDir, file))) {
      return `/${encodeURI(file)}`;
    }
  }
  return "/bizsproutai-logo.png";
}

function getLayoutCopy(locale: string) {
  const normalized = locale.toLowerCase().split("-")[0];

  if (normalized === "fr") {
    return {
      nav: {
        pain: "Pour qui",
        how: "Comment ça marche",
        outcomes: "Résultats",
        faq: "FAQ",
        blog: "Blog",
        cta: "Validation gratuite",
      },
      footer: {
        description:
          "Validation, launch planning et systèmes de croissance pour fondateurs ambitieux.",
        note: "Construit pour les fondateurs prêts à avancer.",
        explore: "Explorer",
        connect: "Connexion",
        privacy: "Confidentialité",
        terms: "Conditions",
        contact: "Contact",
        followUs: "Suivez-nous",
      },
    };
  }

  if (normalized === "es") {
    return {
      nav: {
        pain: "Para quién es",
        how: "Cómo funciona",
        outcomes: "Resultados",
        faq: "FAQ",
        blog: "Blog",
        cta: "Validación gratuita",
      },
      footer: {
        description:
          "Validación, planificación de lanzamiento y sistemas de crecimiento para fundadores serios.",
        note: "Hecho para fundadores listos para avanzar.",
        explore: "Explorar",
        connect: "Conectar",
        privacy: "Privacidad",
        terms: "Términos",
        contact: "Contacto",
        followUs: "Síguenos",
      },
    };
  }

  if (normalized === "ht") {
    return {
      nav: {
        pain: "Pou kiyès",
        how: "Kijan li mache",
        outcomes: "Rezilta",
        faq: "FAQ",
        blog: "Blog",
        cta: "Validasyon gratis",
      },
      footer: {
        description:
          "Validasyon, plan lansman ak sistèm kwasans pou fondatè ki pran biznis yo oserye.",
        note: "Bati pou fondatè ki pare pou avanse.",
        explore: "Eksplore",
        connect: "Konekte",
        privacy: "Konfidansyalite",
        terms: "Tèm",
        contact: "Kontak",
        followUs: "Swiv nou",
      },
    };
  }

  if (normalized === "pt") {
    return {
      nav: {
        pain: "Para quem é",
        how: "Como funciona",
        outcomes: "Resultados",
        faq: "FAQ",
        blog: "Blog",
        cta: "Validação gratuita",
      },
      footer: {
        description:
          "Validacao, planejamento de lancamento e sistemas de crescimento para fundadores ambiciosos.",
        note: "Feito para fundadores prontos para avançar.",
        explore: "Explorar",
        connect: "Conectar",
        privacy: "Privacidade",
        terms: "Termos",
        contact: "Contato",
        followUs: "Siga-nos",
      },
    };
  }

  return {
    nav: {
      pain: "Who It's For",
      how: "How It Works",
      outcomes: "Outcomes",
      faq: "FAQ",
      blog: "Blog",
      cta: "Start Free Validation",
    },
    footer: {
      description:
        "Validation, launch planning, and growth systems for founders building with intention.",
      note: "Built for founders who are ready to move.",
      explore: "Explore",
      connect: "Connect",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
      followUs: "Follow Us",
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : "en";
  const meta = seoMetadata[validLocale];
  const baseUrl = "https://validate.bizsproutai.com";
  const canonicalPath = validLocale === "en" ? "/en" : `/${validLocale}`;
  const logoSrc = pickLogoSrc();

  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalPath,
      languages: {
        en: "/en",
        fr: "/fr",
        ht: "/ht",
        es: "/es",
        pt: "/pt",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${baseUrl}${canonicalPath}`,
      siteName: "BizSproutAI",
      locale: validLocale,
      type: "website",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/og-image.png"],
    },
    icons: {
      icon: [{ url: logoSrc }],
      shortcut: [logoSrc],
      apple: [{ url: logoSrc }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "sitemap": `${baseUrl}/sitemap.xml`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages] = await Promise.all([getMessages()]);
  const copy = getLayoutCopy(locale);
  const logoSrc = pickLogoSrc();
  const homeHref = `/${locale}`;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Meta Pixel — BizSproutAI Launch (ID: 1089915446436683) */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        {/* Meta Pixel init — loads fbevents.js and initializes fbq stub.
            PageView is fired by RetargetingPixels after React hydration. */}
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1089915446436683');
          fbq('track', 'PageView');
        ` }} />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{display:"none"}} alt=""
            src="https://www.facebook.com/tr?id=1089915446436683&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body className="font-[family:var(--font-body)] text-[var(--ink)] antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen bg-[var(--warm-white)]">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-lg focus:bg-[var(--landing-green-deep)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              Skip to main content
            </a>
            <header role="banner" className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(26,58,42,0.08)] bg-[rgba(253,250,245,0.9)] backdrop-blur-xl">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-10">
                <Link href="/" className="flex items-center gap-3" locale={locale}>
                  <Image
                    src={logoSrc}
                    alt="BizSproutAI logo"
                    width={240}
                    height={56}
                    className="h-11 w-auto max-w-[240px] object-contain"
                    priority
                  />
                </Link>

                <nav aria-label="Main navigation" className="hidden items-center gap-10 text-base font-medium text-[var(--landing-muted)] lg:flex">
                  <a href={`${homeHref}#who`} className="transition hover:text-[var(--landing-green-deep)]">
                    {copy.nav.pain}
                  </a>
                  <a href={`${homeHref}#how`} className="transition hover:text-[var(--landing-green-deep)]">
                    {copy.nav.how}
                  </a>
                  <a
                    href={`${homeHref}#outcomes`}
                    className="transition hover:text-[var(--landing-green-deep)]"
                  >
                    {copy.nav.outcomes}
                  </a>
                  <a href={`${homeHref}#faq`} className="transition hover:text-[var(--landing-green-deep)]">
                    {copy.nav.faq}
                  </a>
                </nav>

                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <LanguageSwitcher />
                  </div>
                  <a
                    href={`${homeHref}/validate`}
                    className="hidden items-center rounded-full bg-[var(--landing-green-deep)] px-5 py-3 text-sm font-bold text-white shadow-[0_2px_12px_rgba(26,58,42,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--landing-green-mid)] hover:shadow-[0_6px_20px_rgba(26,58,42,0.22)] lg:inline-flex"
                  >
                    {copy.nav.cta} →
                  </a>
                  <MobileNav
                    links={[
                      { href: `${homeHref}#who`, label: copy.nav.pain },
                      { href: `${homeHref}#how`, label: copy.nav.how },
                      { href: `${homeHref}#outcomes`, label: copy.nav.outcomes },
                      { href: `${homeHref}#faq`, label: copy.nav.faq },
                    ]}
                    ctaHref={`${homeHref}/validate`}
                    ctaLabel={copy.nav.cta}
                  />
                </div>
              </div>
              <div className="mx-auto flex max-w-7xl justify-center px-5 pb-3 md:hidden">
                <LanguageSwitcher />
              </div>
            </header>

            <main id="main-content">
              <div id="page-content" className="pb-12">
                {children}
              </div>
            </main>

            <Footer
              locale={locale}
              logoSrc={logoSrc}
              footerCopy={copy.footer}
              navCopy={{ blog: copy.nav.blog }}
              homeHref={homeHref}
            />

          </div>
        </NextIntlClientProvider>
        <Suspense fallback={null}>
          <RetargetingPixels />
        </Suspense>
      </body>
    </html>
  );
}
