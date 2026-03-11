import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { locales, seoMetadata, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Metadata } from "next";
import Image from "next/image";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import fs from "node:fs";
import path from "node:path";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const LOGO_CANDIDATES = [
  "bizsprouai-logo.svg",
  "bizsproutai logo.svg",
  "bizsproutai-logo.svg",
  "bizsproutai logo.png",
  "bizsproutai logo.jpg",
  "Bizsproutai logo.svg",
  "Bizsproutai logo.png",
  "Bizsproutai logo.jpg",
  "company-logo.png",
  "logo.png",
  "bizsproutai-logo.png",
  "company-logo.jpg",
  "logo.jpg",
  "company-logo.svg",
  "logo.svg",
  "bizsproutai-logo.svg",
];

function pickLogoSrc(): string {
  const publicDir = path.join(process.cwd(), "public");
  for (const file of LOGO_CANDIDATES) {
    if (fs.existsSync(path.join(publicDir, file))) {
      return `/${encodeURI(file)}`;
    }
  }
  return "/bizsproutai-logo.svg";
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
  const faviconSrc = pickLogoSrc();

  return {
    title: meta.title,
    description: meta.description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${validLocale === "en" ? "" : validLocale}`,
      languages: {
        en: "/",
        fr: "/fr",
        ht: "/ht",
        es: "/es",
        pt: "/pt",
        "x-default": "/",
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: baseUrl,
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
      icon: [{ url: faviconSrc }],
      shortcut: [faviconSrc],
      apple: [{ url: faviconSrc }],
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

  const [messages, t] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "layout" }),
  ]);

  const logoSrc = pickLogoSrc();
  const baseUrl = "https://validate.bizsproutai.com";

  return (
    <html lang={locale} className={`${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href={logoSrc} />
        <link rel="alternate" hrefLang="en" href={`${baseUrl}/`} />
        <link rel="alternate" hrefLang="fr" href={`${baseUrl}/fr`} />
        <link rel="alternate" hrefLang="ht" href={`${baseUrl}/ht`} />
        <link rel="alternate" hrefLang="es" href={`${baseUrl}/es`} />
        <link rel="alternate" hrefLang="pt" href={`${baseUrl}/pt`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/`} />
      </head>
      <body className="font-[family:var(--font-body)] text-slate-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1f4d]/95 shadow-lg shadow-[#09183d]/40 backdrop-blur-xl">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <Link href="/" className="flex items-center gap-3">
                  <Image
                    src={logoSrc}
                    alt="BizSproutAI logo"
                    width={164}
                    height={40}
                    className="h-9 w-auto max-w-[164px] object-contain"
                    priority
                  />
                </Link>
                <a
                  href={`/${locale}#validation`}
                  className="brand-cta hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/35 transition hover:brightness-110 sm:inline-flex"
                >
                  {t("nav.validate")}
                </a>
                <div className="flex items-center gap-4 text-sm font-semibold text-slate-200">
                  <a href={`/${locale}#features`} className="transition hover:text-white">{t("nav.features")}</a>
                  <a href={`/${locale}#faq`} className="transition hover:text-white">{t("nav.faq")}</a>
                  <LanguageSwitcher />
                </div>
              </div>
            </header>

            {children}

            <footer className="mt-8 border-t border-[#0b1f4d]/20 bg-[#edf3ff]">
              <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-[#17366d] sm:flex-row">
                <div className="text-center sm:text-left">
                  <p className="font-medium text-[#0b1f4d]">{t("footer.copyright")}</p>
                  <p className="text-xs text-[#2a4f82]">BizSproutAI is a DBA of Kreyol Thrive Biz.</p>
                </div>
                <a href="mailto:info@bizsproutai.com" className="font-semibold text-[#0fb085] hover:text-[#0b1f4d]">
                  info@bizsproutai.com
                </a>
                <div className="flex items-center gap-3">
                  <Link href="/terms" className="hover:text-[#0b1f4d]">{t("footer.terms")}</Link>
                  <span>-</span>
                  <Link href="/privacy" className="hover:text-[#0b1f4d]">{t("footer.privacy")}</Link>
                </div>
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
