import type { ValidationInput, FailureRisk, FixSuggestion, AlternativeModel } from "../types";

// Provider types
export type ProviderName = "claude" | "chatgpt" | "perplexity" | "heuristic";

// Task types that can be routed to providers
export type TaskType =
  | "business_validation"
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
  business_validation: ["claude", "perplexity", "chatgpt"],
  failure_analysis: ["claude", "perplexity", "chatgpt"],
  risk_reasoning: ["claude", "perplexity", "chatgpt"],
  verdict_narrative: ["claude", "chatgpt", "perplexity"],
  positioning: ["chatgpt", "claude", "perplexity"],
  landing_copy: ["chatgpt", "claude", "perplexity"],
  content_generation: ["chatgpt", "claude", "perplexity"],
  market_research: ["perplexity", "claude", "chatgpt"],
  competitor_analysis: ["perplexity", "claude", "chatgpt"],
};

function isProviderEnabled(provider: ProviderName): boolean {
  switch (provider) {
    case "claude":
      return process.env.ENABLE_CLAUDE !== "false";
    case "chatgpt":
      return process.env.ENABLE_CHATGPT !== "false";
    case "perplexity":
      return process.env.ENABLE_PERPLEXITY !== "false";
    case "heuristic":
      return true;
    default:
      return true;
  }
}

// Provider availability check
function isProviderAvailable(provider: ProviderName, config: ProviderConfig): boolean {
  if (!isProviderEnabled(provider)) {
    return false;
  }

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
  const providers = taskProviderMapping[task] || ["claude", "perplexity", "chatgpt"];

  for (const provider of providers) {
    if (isProviderAvailable(provider, config)) {
      return provider;
    }
  }

  return providers[0] ?? "chatgpt";
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
    const providers = taskProviderMapping[task] || ["claude", "perplexity", "chatgpt"];

    for (const provider of providers) {
      if (executor[provider] && isProviderAvailable(provider, this.config)) {
        return executor[provider]();
      }
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
