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

// SEO metadata per locale
export const seoMetadata: Record<
  Locale,
  { title: string; description: string }
> = {
  en: {
    title:
      "30-Day Founder Sprint | BizSproutAI — Launch Your Business & Land Your First Customer",
    description:
      "The 30-Day Founder Sprint is a done-with-you business launch program for early-stage founders. Go from idea to real offer, website, and client system — and work toward your first paying customer in 30 days. Results guarantee included.",
  },
  fr: {
    title: "BizSproutAI — Validez votre idée. Lancez avec confiance",
    description:
      "Validation d'entreprise alimentée par l'IA adaptée à votre marché. Obtenez des verdicts GO/FIX/STOP, des corrections actionnables et des conseils de lancement.",
  },
  ht: {
    title: "BizSproutAI — Valide ide biznis ou. Lanse ak konfyans",
    description:
      "Validasyon biznis ki itilize AI adapte pou mache ou. Jwenn vèdik GO/FIX/STOP, koreksyon aksyonab, ak gidans pou lanse.",
  },
  es: {
    title: "BizSproutAI — Valida tu idea. Lanza con confianza",
    description:
      "Validación de negocios impulsada por IA adaptada a tu mercado. Obtén veredictos GO/FIX/STOP, correcciones accionables y guía de lanzamiento.",
  },
  pt: {
    title: "BizSproutAI — Valide sua ideia. Lance com confiança",
    description:
      "Validação de negócios com IA adaptada ao seu mercado. Receba vereditos GO/FIX/STOP, melhorias acionáveis e orientação de lançamento.",
  },
};
