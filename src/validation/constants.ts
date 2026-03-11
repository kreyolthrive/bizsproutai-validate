import type { Locale, Verdict } from "./types";

export const ENGINE_VERSION = "1.0.0";
export const DEFAULT_LOCALE: Locale = "en";
export const locales: Locale[] = ["en", "fr", "ht", "es"];

export const VERDICT_THRESHOLDS: Array<{ min: number; verdict: Verdict }> = [
  { min: 4.0, verdict: "go" },
  { min: 3.0, verdict: "caution" },
  { min: 0, verdict: "no-go" }
];
