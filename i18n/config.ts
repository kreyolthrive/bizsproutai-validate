import { getLandingCopy } from "./landingCopy";
export const locales = ["en", "fr", "ht", "es", "pt"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ht: "Kreyòl",
  es: "Español",
  pt: "Português",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  fr: "🇫🇷",
  ht: "🇭🇹",
  es: "🇪🇸",
  pt: "🇵🇹",
};

// Keep shared metadata aligned with the public landing copy in every language.
export const seoMetadata = Object.fromEntries(
  locales.map((locale) => {
    const copy = getLandingCopy(locale);
    return [
      locale,
      { title: `BizSproutAI | ${copy.eyebrow}`, description: copy.description },
    ];
  }),
) as Record<Locale, { title: string; description: string }>;
