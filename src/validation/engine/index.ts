// Core engine modules
export { detectCountry, getDefaultCountryForLocale } from "./detectCountry";
export type { DetectCountryInput } from "./detectCountry";

export { classifyCategory, isValidCategory, getAllCategories } from "./classifyCategory";
export type { ClassifyCategoryInput, CategoryClassification } from "./classifyCategory";

export { loadFramework, summarizeAdjustments } from "./loadFramework";
export type { LoadedFramework, LoadFrameworkInput } from "./loadFramework";

export { evaluateRisks, sortRisksBySeverity, getSeverityWeight } from "./evaluateRisks";
export type { RiskEvaluation } from "./evaluateRisks";

export { runFixLoop, shouldTriggerFixLoop } from "./fixLoop";
export type { FixLoopResult, FixIteration } from "./fixLoop";

export { suggestAlternatives, formatAlternativesForDisplay } from "./suggestAlternatives";
export type { AlternativeSuggestion } from "./suggestAlternatives";

export { triggerBuildFlow, shouldTriggerBuild, getBuildFlowSummary } from "./triggerBuildFlow";
export type { BuildFlowConfig, BuildFlowResult } from "./triggerBuildFlow";

// Main orchestrator
export { validateIdeaDynamic } from "./orchestrator";
