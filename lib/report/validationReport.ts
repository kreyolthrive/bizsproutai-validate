function resolveCountry(result: DynamicValidationResult): string {
  const code = result.country?.code;
  if (typeof code === "string" && code.trim().length > 0) {
    return code.trim();
  }

  const country = result.country as unknown;

  if (country && typeof country === "object" && !Array.isArray(country)) {
    const record = country as Record<string, unknown>;

    const name = record.name;
    if (typeof name === "string" && name.trim().length > 0) {
      return name.trim();
    }

    const label = record.label;
    if (typeof label === "string" && label.trim().length > 0) {
      return label.trim();
    }

    const countryValue = record.country;
    if (typeof countryValue === "string" && countryValue.trim().length > 0) {
      return countryValue.trim();
    }
  }

  return "n/a";
}
