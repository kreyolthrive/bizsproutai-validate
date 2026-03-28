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
import { FloatingExitCta } from "@/components/marketing/FloatingExitCta";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileNav } from "@/components/MobileNav";
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
        services: "Services",
        blog: "Blog",
        cta: "Réserver un appel",
      },
      footer: {
        note: "Construit pour les fondateurs prêts à avancer.",
        privacy: "Confidentialité",
        terms: "Conditions",
        contact: "Contact",
      },
    };
  }

  if (normalized === "es") {
    return {
      nav: {
        pain: "Para quién es",
        how: "Cómo funciona",
        services: "Servicios",
        blog: "Blog",
        cta: "Reservar llamada",
      },
      footer: {
        note: "Hecho para fundadores listos para avanzar.",
        privacy: "Privacidad",
        terms: "Términos",
        contact: "Contacto",
      },
    };
  }

  if (normalized === "ht") {
    return {
      nav: {
        pain: "Pou kiyès",
        how: "Kijan li mache",
        services: "Sèvis",
        blog: "Blog",
        cta: "Pran yon apèl",
      },
      footer: {
        note: "Bati pou fondatè ki pare pou avanse.",
        privacy: "Konfidansyalite",
        terms: "Tèm",
        contact: "Kontak",
      },
    };
  }

  if (normalized === "pt") {
    return {
      nav: {
        pain: "Para quem é",
        how: "Como funciona",
        services: "Serviços",
        blog: "Blog",
        cta: "Agendar ligação",
      },
      footer: {
        note: "Feito para fundadores prontos para avançar.",
        privacy: "Privacidade",
        terms: "Termos",
        contact: "Contato",
      },
    };
  }

  return {
    nav: {
      pain: "Who It's For",
      how: "How It Works",
      services: "Services",
      blog: "Blog",
      podcast: "Podcast",
      cta: "Book a Free Call",
    },
    footer: {
      note: "Built for founders who are ready to move.",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
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
                  <a href={`${homeHref}#pain`} className="transition hover:text-[var(--landing-green-deep)]">
                    {copy.nav.pain}
                  </a>
                  <a href={`${homeHref}#how`} className="transition hover:text-[var(--landing-green-deep)]">
                    {copy.nav.how}
                  </a>
                  <a
                    href={`${homeHref}#services`}
                    className="transition hover:text-[var(--landing-green-deep)]"
                  >
                    {copy.nav.services}
                  </a>
                  <Link href="/blog" className="transition hover:text-[var(--landing-green-deep)]">
                    {copy.nav.blog}
                  </Link>
                </nav>

                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <LanguageSwitcher />
                  </div>
                  <a
                    href="https://cal.com/bizsproutai/30-min-founder-clarity-session"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden items-center rounded-full bg-[var(--landing-green-deep)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--landing-green-mid)] lg:inline-flex"
                  >
                    {copy.nav.cta} →
                  </a>
                  <MobileNav
                    links={[
                      { href: `${homeHref}#pain`, label: copy.nav.pain },
                      { href: `${homeHref}#how`, label: copy.nav.how },
                      { href: `${homeHref}#services`, label: copy.nav.services },
                      { href: `/${locale}/blog`, label: copy.nav.blog },
                    ]}
                    ctaHref="https://cal.com/bizsproutai/30-min-founder-clarity-session"
                    ctaLabel={copy.nav.cta}
                  />
                </div>
              </div>
              <div className="mx-auto flex max-w-7xl justify-center px-5 pb-3 md:hidden">
                <LanguageSwitcher />
              </div>
            </header>

            <main id="main-content">
              {children}
            </main>

            <footer role="contentinfo" className="bg-[var(--landing-green-deep)] px-5 py-12 text-white lg:px-10">
              <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <Image
                    src={logoSrc}
                    alt="BizSproutAI logo"
                    width={220}
                    height={52}
                    className="h-10 w-auto max-w-[220px] object-contain brightness-[1.08]"
                  />
                </div>

                <p className="text-sm text-white/60">
                  © 2026 BizSproutAI. {copy.footer.note}
                </p>

                <div className="flex items-center gap-5 text-sm text-white/70">
                  <Link href="/privacy" className="transition hover:text-[var(--landing-sprout)]">
                    {copy.footer.privacy}
                  </Link>
                  <Link href="/terms" className="transition hover:text-[var(--landing-sprout)]">
                    {copy.footer.terms}
                  </Link>
                  <Link href="/contact" className="transition hover:text-[var(--landing-sprout)]">
                    {copy.footer.contact}
                  </Link>
                </div>
              </div>
            </footer>

            <FloatingExitCta locale={locale} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
