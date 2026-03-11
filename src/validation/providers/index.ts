// Provider router
export {
  ProviderRouter,
  createRouter,
  defaultRouter,
  getProviderForTask,
  getAvailableProviders,
} from "./router";
export type { ProviderName, TaskType, ProviderConfig } from "./router";

// Claude provider
export {
  isClaudeAvailable,
  analyzeFailures,
  generateVerdictNarrative,
} from "./claude";
export type {
  ClaudeConfig,
  FailureAnalysisRequest,
  FailureAnalysisResponse,
  VerdictNarrativeRequest,
  VerdictNarrativeResponse,
} from "./claude";

// ChatGPT provider
export {
  isChatGPTAvailable,
  generatePositioning,
  generateLandingCopy,
  generateContent,
} from "./chatgpt";
export type {
  ChatGPTConfig,
  PositioningRequest,
  PositioningResponse,
  LandingCopyRequest,
  LandingCopyResponse,
  ContentRequest,
  ContentResponse,
} from "./chatgpt";

// Perplexity provider
export {
  isPerplexityAvailable,
  conductMarketResearch,
  analyzeCompetitors,
} from "./perplexity";
export type {
  PerplexityConfig,
  MarketResearchRequest,
  MarketResearchResponse,
  CompetitorAnalysisRequest,
  CompetitorAnalysisResponse,
} from "./perplexity";
