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
    title: "BizSproutAI — Validate your idea. Launch with confidence",
    description:
      "AI-powered business validation tailored to your market. Get GO/FIX/STOP verdicts, actionable fixes, and launch guidance for entrepreneurs in emerging markets.",
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
