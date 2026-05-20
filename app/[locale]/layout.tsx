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
import { LocaleHtmlUpdater } from "@/components/LocaleHtmlUpdater";
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
        bookCall: "Réserver un appel",
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
        bookCall: "Reservar una llamada",
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
        bookCall: "Rezève yon apèl",
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
        bookCall: "Agendar uma chamada",
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
      bookCall: "Book a Call",
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
          url: "/api/og",
          width: 1200,
          height: 630,
          alt: "Validate Before You Build | BizSproutAI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/api/og"],
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
    <>
      <LocaleHtmlUpdater locale={locale} />
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
              <Link href="/" className="flex items-center gap-2.5" locale={locale}>
                <Image
                  src={logoSrc}
                  alt="BizSproutAI"
                  width={36}
                  height={36}
                  className="h-9 w-9 flex-shrink-0 rounded-lg object-contain"
                  priority
                />
                <span className="hidden text-[1rem] font-bold tracking-[-0.02em] text-[var(--landing-green-deep)] sm:inline">
                  BizSproutAI
                </span>
              </Link>

              <nav aria-label="Main navigation" className="hidden items-center gap-10 text-base font-medium text-[var(--landing-muted)] lg:flex">
                <a href={`${homeHref}#pain`} className="transition hover:text-[var(--landing-green-deep)]">
                  {copy.nav.pain}
                </a>
                <a href={`${homeHref}#bridge`} className="transition hover:text-[var(--landing-green-deep)]">
                  {copy.nav.how}
                </a>
                <a
                  href={`${homeHref}#booking`}
                  className="transition hover:text-[var(--landing-green-deep)]"
                >
                  {copy.nav.bookCall}
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
                    { href: `${homeHref}#pain`, label: copy.nav.pain },
                    { href: `${homeHref}#bridge`, label: copy.nav.how },
                    { href: `${homeHref}#booking`, label: copy.nav.bookCall },
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
    </>
  );
}
