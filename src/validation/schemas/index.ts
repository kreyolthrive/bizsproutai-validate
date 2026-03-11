import type { Category, Region, CountryCode, CategorySchema, RegionSchema, CountrySchema } from "../types";

// Category schemas
import ecommerceSchema from "./categories/ecommerce.json";
import coachingSchema from "./categories/coaching.json";
import consultingSchema from "./categories/consulting.json";
import financeSchema from "./categories/finance.json";
import techSchema from "./categories/tech.json";
import saasSchema from "./categories/saas.json";
import marketplaceSchema from "./categories/marketplace.json";
import localServiceSchema from "./categories/local_service.json";
import healthWellnessSchema from "./categories/health_wellness.json";
import edtechSchema from "./categories/edtech.json";
import legalLawSchema from "./categories/legal_law.json";

// Region schemas
import northAmericaRegion from "./regions/north_america.json";
import caribbeanRegion from "./regions/caribbean.json";
import latinAmericaRegion from "./regions/latin_america.json";
import africaRegion from "./regions/africa.json";
import europeRegion from "./regions/europe.json";
import asiaRegion from "./regions/asia.json";

// Country schemas
import usCountry from "./countries/us.json";
import htCountry from "./countries/ht.json";
import mxCountry from "./countries/mx.json";
import ngCountry from "./countries/ng.json";
import keCountry from "./countries/ke.json";
import brCountry from "./countries/br.json";

// Category schema registry
export const categorySchemas: Record<Category, CategorySchema> = {
  ecommerce: ecommerceSchema as CategorySchema,
  coaching: coachingSchema as CategorySchema,
  consulting: consultingSchema as CategorySchema,
  finance: financeSchema as CategorySchema,
  tech: techSchema as CategorySchema,
  saas: saasSchema as CategorySchema,
  marketplace: marketplaceSchema as CategorySchema,
  local_service: localServiceSchema as CategorySchema,
  health_wellness: healthWellnessSchema as CategorySchema,
  edtech: edtechSchema as CategorySchema,
  legal_law: legalLawSchema as CategorySchema,
};

// Region schema registry
export const regionSchemas: Record<Region, RegionSchema> = {
  north_america: northAmericaRegion as RegionSchema,
  caribbean: caribbeanRegion as RegionSchema,
  latin_america: latinAmericaRegion as RegionSchema,
  africa: africaRegion as RegionSchema,
  europe: europeRegion as RegionSchema,
  asia: asiaRegion as RegionSchema,
};

// Country schema registry
export const countrySchemas: Record<CountryCode, CountrySchema> = {
  US: usCountry as CountrySchema,
  HT: htCountry as CountrySchema,
  MX: mxCountry as CountrySchema,
  NG: ngCountry as CountrySchema,
  KE: keCountry as CountrySchema,
  BR: brCountry as CountrySchema,
};

// Helper functions
export function getCategorySchema(category: Category): CategorySchema | undefined {
  return categorySchemas[category];
}

export function getRegionSchema(region: Region): RegionSchema | undefined {
  return regionSchemas[region];
}

export function getCountrySchema(countryCode: CountryCode): CountrySchema | undefined {
  return countrySchemas[countryCode.toUpperCase()];
}

export function getCountryByCode(code: string): CountrySchema | undefined {
  return countrySchemas[code.toUpperCase()];
}

export function getAllCategories(): Category[] {
  return Object.keys(categorySchemas) as Category[];
}

export function getAllRegions(): Region[] {
  return Object.keys(regionSchemas) as Region[];
}

export function getAllCountries(): CountryCode[] {
  return Object.keys(countrySchemas);
}

// Get region for a country
export function getRegionForCountry(countryCode: CountryCode): Region | undefined {
  const country = getCountrySchema(countryCode);
  return country?.region;
}
