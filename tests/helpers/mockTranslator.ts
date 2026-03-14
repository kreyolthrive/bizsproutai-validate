type TranslationValues = Record<string, string>;
type RawValues = Record<string, unknown>;

function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, template);
}

export function createMockTranslator(values: TranslationValues = {}, rawValues: RawValues = {}) {
  const translate = ((key: string, params?: Record<string, unknown>) => {
    const template = values[key] ?? key;
    return interpolate(template, params);
  }) as ((key: string, params?: Record<string, unknown>) => string) & {
    raw: (key: string) => unknown;
  };

  translate.raw = (key: string) => rawValues[key] ?? values[key] ?? key;

  return translate;
}
