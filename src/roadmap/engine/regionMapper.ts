/**
 * Region Mapper
 * Maps country codes and names to region configurations
 */

import { REGION_CONFIGS } from '../constants';

export function getRegionConfig(country: string): any {
  const countryUpper = country.toUpperCase();
  
  // Direct mapping
  const mapping: Record<string, string> = {
    'US': 'north_america_usa',
    'USA': 'north_america_usa',
    'UNITED STATES': 'north_america_usa',
    'NG': 'africa_nigeria',
    'NIGERIA': 'africa_nigeria',
    'KE': 'africa_kenya',
    'KENYA': 'africa_kenya',
    'HT': 'caribbean_haiti',
    'HAITI': 'caribbean_haiti',
    'BR': 'latin_america_brazil',
    'BRAZIL': 'latin_america_brazil',
    'MX': 'latin_america_mexico',
    'MEXICO': 'latin_america_mexico'
  };
  
  const configKey = mapping[countryUpper];
  
  if (configKey && REGION_CONFIGS[configKey]) {
    return REGION_CONFIGS[configKey];
  }
  
  // Fallback: search through configs
  for (const [key, config] of Object.entries(REGION_CONFIGS)) {
    if (config.countries.some(c => c.toUpperCase() === countryUpper)) {
      return config;
    }
  }
  
  // Default fallback
  return REGION_CONFIGS['north_america_usa'];
}

export function normalizeCountryName(country: string): string {
  const mapping: Record<string, string> = {
    'US': 'USA',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'HT': 'Haiti',
    'BR': 'Brazil',
    'MX': 'Mexico'
  };
  
  return mapping[country.toUpperCase()] || country;
}
