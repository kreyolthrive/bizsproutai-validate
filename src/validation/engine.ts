import type { Category, ValidationInput } from "./types";
import { frameworksByCategory } from "./frameworks";
import { normalizeResult } from "./normalize";
import { maybeTranslateResult } from "./i18n";
export { validateIdeaDynamic } from "./engine/orchestrator";

export async function validateIdea(input: ValidationInput) {
  if (!input.category) {
    throw new Error("Category is required for validateIdea(). Use validateIdeaDynamic() for auto-classification.");
  }

  const framework = frameworksByCategory[input.category as Category];
  if (!framework) throw new Error(`Unsupported category: ${input.category}`);

  const raw = await framework.run(input);
  const normalized = normalizeResult(raw, input);
  return await maybeTranslateResult(normalized, input.locale ?? normalized.locale);
}
