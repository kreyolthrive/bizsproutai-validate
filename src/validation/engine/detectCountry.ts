import type { CountryCode, Region, CountryDetection, Locale } from "../types";
import { countrySchemas, regionSchemas } from "../schemas";

// Mapping from locale to likely country
const localeToCountry: Record<Locale, CountryCode> = {
  en: "US",
  fr: "FR",
  ht: "HT",
  es: "MX",
  pt: "BR",
};

// Country indicators in text
const countryIndicators: Record<CountryCode, { keywords: string[]; currencies: string[]; cities: string[]; payments: string[] }> = {
  US: {
    keywords: ["united states", "usa", "america", "american"],
    currencies: ["usd", "$", "dollar", "dollars"],
    cities: ["new york", "los angeles", "chicago", "miami", "houston", "phoenix", "san francisco", "seattle"],
    payments: ["venmo", "zelle", "cash app"],
  },
  HT: {
    keywords: ["haiti", "haitian", "ayiti", "ayisyen"],
    currencies: ["htg", "gourde", "goud"],
    cities: ["port-au-prince", "cap-haitien", "gonaives", "les cayes", "jacmel", "petion-ville", "delmas"],
    payments: ["moncash", "natcash", "lajan cash", "cam transfer"],
  },
  MX: {
    keywords: ["mexico", "mexican", "mexicano"],
    currencies: ["mxn", "peso", "pesos mexicanos"],
    cities: ["mexico city", "cdmx", "guadalajara", "monterrey", "cancun", "tijuana", "puebla"],
    payments: ["oxxo", "spei", "kueski"],
  },
  NG: {
    keywords: ["nigeria", "nigerian", "naija"],
    currencies: ["ngn", "naira"],
    cities: ["lagos", "abuja", "kano", "ibadan", "port harcourt"],
    payments: ["paystack", "flutterwave", "opay", "palmpay"],
  },
  KE: {
    keywords: ["kenya", "kenyan"],
    currencies: ["kes", "shilling", "kenyan shilling"],
    cities: ["nairobi", "mombasa", "kisumu", "nakuru"],
    payments: ["m-pesa", "mpesa", "safaricom"],
  },
  BR: {
    keywords: ["brazil", "brazilian", "brasil", "brasileiro"],
    currencies: ["brl", "r$", "reais"],
    cities: ["sao paulo", "rio de janeiro", "brasilia", "salvador", "belo horizonte", "fortaleza"],
    payments: ["pix", "boleto", "nubank", "pagseguro", "mercado pago"],
  },
  FR: {
    keywords: ["france", "french", "francais"],
    currencies: ["eur", "euro", "euros"],
    cities: ["paris", "marseille", "lyon", "toulouse", "nice", "bordeaux"],
    payments: ["cb", "carte bancaire", "lydia"],
  },
};

function containsCurrencyToken(text: string, currency: string): boolean {
  // Symbols can be checked with direct includes.
  if (currency === "$" || currency === "r$") {
    return text.includes(currency);
  }

  const escaped = currency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "i");
  return regex.test(text);
}

// Region mappings
const countryToRegion: Record<string, Region> = {
  US: "north_america",
  CA: "north_america",
  MX: "latin_america",
  HT: "caribbean",
  DO: "caribbean",
  JM: "caribbean",
  BR: "latin_america",
  AR: "latin_america",
  CO: "latin_america",
  NG: "africa",
  KE: "africa",
  ZA: "africa",
  GH: "africa",
  GB: "europe",
  DE: "europe",
  FR: "europe",
  ES: "europe",
  IT: "europe",
  IN: "asia",
  ID: "asia",
  PH: "asia",
  SG: "asia",
  JP: "asia",
};

export interface DetectCountryInput {
  idea: string;
  locale?: Locale;
  location?: string;
  targetMarket?: string;
}

export function detectCountry(input: DetectCountryInput): CountryDetection {
  const evidence: string[] = [];
  const scores: Record<CountryCode, number> = {};

  // Initialize scores
  Object.keys(countryIndicators).forEach((code) => {
    scores[code] = 0;
  });

  // 1. Check locale (weight: 0.3)
  if (input.locale && localeToCountry[input.locale]) {
    const localeCountry = localeToCountry[input.locale];
    scores[localeCountry] = (scores[localeCountry] || 0) + 30;
    evidence.push(`Locale ${input.locale} suggests ${localeCountry}`);
  }

  // 2. Check explicit location field (weight: 0.4)
  if (input.location) {
    const locationLower = input.location.toLowerCase();
    for (const [code, indicators] of Object.entries(countryIndicators)) {
      for (const keyword of indicators.keywords) {
        if (locationLower.includes(keyword)) {
          scores[code] = (scores[code] || 0) + 40;
          evidence.push(`Location mentions ${keyword} -> ${code}`);
        }
      }
      for (const city of indicators.cities) {
        if (locationLower.includes(city)) {
          scores[code] = (scores[code] || 0) + 40;
          evidence.push(`Location mentions city ${city} -> ${code}`);
        }
      }
    }
  }

  // 3. Check target market (weight: 0.3)
  if (input.targetMarket) {
    const marketLower = input.targetMarket.toLowerCase();
    for (const [code, indicators] of Object.entries(countryIndicators)) {
      for (const keyword of indicators.keywords) {
        if (marketLower.includes(keyword)) {
          scores[code] = (scores[code] || 0) + 30;
          evidence.push(`Target market mentions ${keyword} -> ${code}`);
        }
      }
    }
  }

  // 4. Check idea text for cues (weight: 0.3)
  const ideaLower = input.idea.toLowerCase();
  for (const [code, indicators] of Object.entries(countryIndicators)) {
    // Check keywords
    for (const keyword of indicators.keywords) {
      if (ideaLower.includes(keyword)) {
        scores[code] = (scores[code] || 0) + 20;
        evidence.push(`Idea mentions ${keyword} -> ${code}`);
      }
    }

    // Check currencies
    for (const currency of indicators.currencies) {
      if (containsCurrencyToken(ideaLower, currency)) {
        scores[code] = (scores[code] || 0) + 25;
        evidence.push(`Idea mentions currency ${currency} -> ${code}`);
      }
    }

    // Check cities
    for (const city of indicators.cities) {
      if (ideaLower.includes(city)) {
        scores[code] = (scores[code] || 0) + 30;
        evidence.push(`Idea mentions city ${city} -> ${code}`);
      }
    }

    // Check payment methods (strong signal)
    for (const payment of indicators.payments) {
      if (ideaLower.includes(payment)) {
        scores[code] = (scores[code] || 0) + 35;
        evidence.push(`Idea mentions payment method ${payment} -> ${code}`);
      }
    }
  }

  // Find the country with highest score
  let bestCountry: CountryCode = "US"; // Default
  let bestScore = 0;

  for (const [code, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCountry = code;
    }
  }

  // Calculate confidence (0-1)
  const maxPossibleScore = 100; // Rough estimate of max
  const confidence = Math.min(bestScore / maxPossibleScore, 1);

  // Get region
  const region = countryToRegion[bestCountry] || "north_america";

  // If no evidence found, use locale default
  if (evidence.length === 0 && input.locale) {
    bestCountry = localeToCountry[input.locale] || "US";
    evidence.push(`Defaulting to ${bestCountry} based on locale`);
  } else if (evidence.length === 0) {
    evidence.push("No country signals detected, defaulting to US");
  }

  return {
    code: bestCountry,
    region: region as Region,
    confidence: Math.max(confidence, 0.3), // Minimum 30% confidence
    evidence,
  };
}

// Utility to get country from locale for fallback
export function getDefaultCountryForLocale(locale: Locale): CountryCode {
  return localeToCountry[locale] || "US";
}
