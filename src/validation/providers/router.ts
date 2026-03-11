import type { ValidationInput, FailureRisk, FixSuggestion, AlternativeModel } from "../types";

// Provider types
export type ProviderName = "claude" | "chatgpt" | "perplexity" | "heuristic";

// Task types that can be routed to providers
export type TaskType =
  | "failure_analysis"
  | "risk_reasoning"
  | "verdict_narrative"
  | "positioning"
  | "landing_copy"
  | "content_generation"
  | "market_research"
  | "competitor_analysis";

// Provider configuration
export interface ProviderConfig {
  claude?: {
    apiKey: string;
    model?: string;
  };
  chatgpt?: {
    apiKey: string;
    model?: string;
  };
  perplexity?: {
    apiKey: string;
    model?: string;
  };
}

// Task-to-provider mapping
const taskProviderMapping: Record<TaskType, ProviderName[]> = {
  failure_analysis: ["claude", "heuristic"],
  risk_reasoning: ["claude", "heuristic"],
  verdict_narrative: ["claude", "chatgpt", "heuristic"],
  positioning: ["chatgpt", "claude", "heuristic"],
  landing_copy: ["chatgpt", "claude", "heuristic"],
  content_generation: ["chatgpt", "claude", "heuristic"],
  market_research: ["perplexity", "claude", "heuristic"],
  competitor_analysis: ["perplexity", "claude", "heuristic"],
};

// Provider availability check
function isProviderAvailable(provider: ProviderName, config: ProviderConfig): boolean {
  switch (provider) {
    case "claude":
      return !!config.claude?.apiKey || !!process.env.ANTHROPIC_API_KEY;
    case "chatgpt":
      return !!config.chatgpt?.apiKey || !!process.env.OPENAI_API_KEY;
    case "perplexity":
      return !!config.perplexity?.apiKey || !!process.env.PERPLEXITY_API_KEY;
    case "heuristic":
      return true; // Always available
    default:
      return false;
  }
}

// Get the best available provider for a task
export function getProviderForTask(
  task: TaskType,
  config: ProviderConfig = {}
): ProviderName {
  const providers = taskProviderMapping[task] || ["heuristic"];

  for (const provider of providers) {
    if (isProviderAvailable(provider, config)) {
      return provider;
    }
  }

  return "heuristic"; // Fallback
}

// Check which providers are available
export function getAvailableProviders(config: ProviderConfig = {}): ProviderName[] {
  const providers: ProviderName[] = ["claude", "chatgpt", "perplexity", "heuristic"];
  return providers.filter(p => isProviderAvailable(p, config));
}

// Provider router class for managing provider calls
export class ProviderRouter {
  private config: ProviderConfig;

  constructor(config: ProviderConfig = {}) {
    this.config = config;
  }

  getProvider(task: TaskType): ProviderName {
    return getProviderForTask(task, this.config);
  }

  async executeTask<T>(
    task: TaskType,
    executor: Record<ProviderName, () => Promise<T>>
  ): Promise<T> {
    const provider = this.getProvider(task);

    if (executor[provider]) {
      return executor[provider]();
    }

    // Fallback to heuristic
    if (executor.heuristic) {
      return executor.heuristic();
    }

    throw new Error(`No executor found for task ${task}`);
  }

  isAIEnabled(): boolean {
    const available = getAvailableProviders(this.config);
    return available.some(p => p !== "heuristic");
  }
}

// Create a default router instance
export function createRouter(config?: ProviderConfig): ProviderRouter {
  return new ProviderRouter(config);
}

// Export singleton for simple usage
export const defaultRouter = new ProviderRouter();
