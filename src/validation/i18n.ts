import type { Locale, ValidationResult, DynamicValidationResult, Verdict, ValidationStatus } from "./types";

// Translation dictionaries for validation result labels
const translations: Record<Locale, {
  verdicts: Record<Verdict, string>;
  status: Record<ValidationStatus, string>;
  labels: Record<string, string>;
  common: Record<string, string>;
}> = {
  en: {
    verdicts: {
      "go": "Your idea is ready to build!",
      "caution": "Proceed with caution—address the risks first.",
      "no-go": "This idea needs significant changes."
    },
    status: {
      "GO": "GO",
      "FIX": "FIX",
      "STOP": "STOP"
    },
    labels: {
      overallScore: "Overall Score",
      failureRisks: "Failure Risks",
      fixes: "Recommended Fixes",
      alternatives: "Alternative Models",
      nextActions: "Next Actions",
      country: "Detected Country",
      category: "Business Category",
      criteria: "Evaluation Criteria",
      summary: "Summary",
      opportunities: "Top Opportunities",
      risks: "Biggest Risks"
    },
    common: {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low"
    }
  },
  fr: {
    verdicts: {
      "go": "Votre idée est prête à être construite !",
      "caution": "Procédez avec prudence—adressez d'abord les risques.",
      "no-go": "Cette idée nécessite des changements significatifs."
    },
    status: {
      "GO": "FONCEZ",
      "FIX": "AJUSTEZ",
      "STOP": "ARRÊTEZ"
    },
    labels: {
      overallScore: "Score global",
      failureRisks: "Risques d'échec",
      fixes: "Corrections recommandées",
      alternatives: "Modèles alternatifs",
      nextActions: "Prochaines actions",
      country: "Pays détecté",
      category: "Catégorie d'entreprise",
      criteria: "Critères d'évaluation",
      summary: "Résumé",
      opportunities: "Meilleures opportunités",
      risks: "Risques majeurs"
    },
    common: {
      critical: "Critique",
      high: "Élevé",
      medium: "Moyen",
      low: "Faible"
    }
  },
  ht: {
    verdicts: {
      "go": "Lide ou pare pou bati!",
      "caution": "Ale ak prekosyon—adrese risk yo anvan.",
      "no-go": "Lide sa a bezwen gwo chanjman."
    },
    status: {
      "GO": "ALE",
      "FIX": "RANJE",
      "STOP": "KANPE"
    },
    labels: {
      overallScore: "Nòt global",
      failureRisks: "Risk echèk",
      fixes: "Koreksyon rekòmande",
      alternatives: "Modèl altènatif",
      nextActions: "Pwochen aksyon",
      country: "Peyi detekte",
      category: "Kategori biznis",
      criteria: "Kritè evalyasyon",
      summary: "Rezime",
      opportunities: "Pi bon opòtinite",
      risks: "Pi gwo risk"
    },
    common: {
      critical: "Kritik",
      high: "Wo",
      medium: "Mwayen",
      low: "Ba"
    }
  },
  es: {
    verdicts: {
      "go": "¡Tu idea está lista para construir!",
      "caution": "Procede con precaución—aborda los riesgos primero.",
      "no-go": "Esta idea necesita cambios significativos."
    },
    status: {
      "GO": "ADELANTE",
      "FIX": "AJUSTAR",
      "STOP": "PARAR"
    },
    labels: {
      overallScore: "Puntuación general",
      failureRisks: "Riesgos de fracaso",
      fixes: "Correcciones recomendadas",
      alternatives: "Modelos alternativos",
      nextActions: "Próximas acciones",
      country: "País detectado",
      category: "Categoría de negocio",
      criteria: "Criterios de evaluación",
      summary: "Resumen",
      opportunities: "Mejores oportunidades",
      risks: "Mayores riesgos"
    },
    common: {
      critical: "Crítico",
      high: "Alto",
      medium: "Medio",
      low: "Bajo"
    }
  }
};

type TranslationSection = "verdicts" | "status" | "labels" | "common";

// Get translation for a specific key
export function getTranslation(locale: Locale, category: TranslationSection, key: string): string {
  const localeTranslations = translations[locale] || translations.en;
  const categoryTranslations = localeTranslations[category] as Record<string, string>;
  const fallbackTranslations = translations.en[category] as Record<string, string>;
  return categoryTranslations?.[key] || fallbackTranslations?.[key] || key;
}

// Translate verdict
export function translateVerdict(verdict: Verdict, locale: Locale): string {
  return getTranslation(locale, "verdicts", verdict);
}

// Translate status
export function translateStatus(status: ValidationStatus, locale: Locale): string {
  return getTranslation(locale, "status", status);
}

// Translate severity
export function translateSeverity(severity: string, locale: Locale): string {
  return getTranslation(locale, "common", severity);
}

// Translate label
export function translateLabel(key: string, locale: Locale): string {
  return getTranslation(locale, "labels", key);
}

// Legacy function for backward compatibility
export async function maybeTranslateResult(
  result: ValidationResult,
  locale: Locale
): Promise<ValidationResult> {
  // For legacy results, just set the locale
  // The actual translation happens in the UI layer using the translation functions above
  return { ...result, locale };
}

// Translate dynamic validation result labels (not content)
export function translateResultLabels(
  result: DynamicValidationResult,
  locale: Locale
): DynamicValidationResult {
  // Return result with translated metadata
  // Note: We don't translate free-form text here, only structured labels
  return {
    ...result,
    language: locale,
  };
}

// Check if translation exists for locale
export function hasTranslation(locale: Locale): boolean {
  return locale in translations;
}

// Get all available locales
export function getAvailableLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

// Warn in dev if translation key is missing
export function warnMissingTranslation(locale: Locale, category: string, key: string): void {
  if (process.env.NODE_ENV === "development") {
    const localeTranslations = translations[locale];
    if (!localeTranslations) {
      console.warn(`[i18n] Missing locale: ${locale}`);
      return;
    }
    const categoryTranslations = localeTranslations[category as keyof typeof localeTranslations];
    if (!categoryTranslations || !(key in (categoryTranslations as Record<string, string>))) {
      console.warn(`[i18n] Missing translation: ${locale}.${category}.${key}`);
    }
  }
}
