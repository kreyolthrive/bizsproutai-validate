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
    title: "Validate Your Business Idea for Free | BizSproutAI",
    description:
      "BizSproutAI helps you validate your business idea, see what stage you're in, and find what to build first — free. Get your stage, recommended first asset, next 4 steps, and the mistake to avoid.",
  },
  fr: {
    title: "Validez votre idée gratuitement | BizSproutAI",
    description:
      "BizSproutAI vous aide à valider votre idée, identifier votre stade et trouver quoi construire en premier — gratuitement. Résultats en moins d'une minute.",
  },
  ht: {
    title: "Valide ide biznis ou gratis | BizSproutAI",
    description:
      "BizSproutAI ede ou valide ide ou, wè kile ou ye, ak jwenn sa pou bati an premye — gratis. Rezilta an mwens pase yon minit.",
  },
  es: {
    title: "Valida tu idea de negocio gratis | BizSproutAI",
    description:
      "BizSproutAI te ayuda a validar tu idea, ver en qué etapa estás y encontrar qué construir primero — gratis. Resultados en menos de un minuto.",
  },
  pt: {
    title: "Valide sua ideia de negócio de graça | BizSproutAI",
    description:
      "BizSproutAI ajuda você a validar sua ideia, ver em qual estágio está e encontrar o que construir primeiro — de graça. Resultados em menos de um minuto.",
  },
};
