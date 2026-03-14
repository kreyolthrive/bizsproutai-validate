import type { Locale, Verdict } from "./types";

export const ENGINE_VERSION = "1.0.0";
export const DEFAULT_LOCALE: Locale = "en";
export const locales: Locale[] = ["en", "fr", "ht", "es"];

export const VERDICT_THRESHOLDS: Array<{ min: number; verdict: Verdict }> = [
  { min: 4.0, verdict: "go" },      // 75+ on 0-100 scale (75/20 = 3.75 → rounds to 4)
  { min: 2.0, verdict: "caution" }, // 32+ on 0-100 scale (32/20 = 1.6 → rounds to 2)
  { min: 0, verdict: "pivot" }      // Below 32 on 0-100 scale - idea needs repositioning
];
