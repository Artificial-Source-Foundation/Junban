import { LLMProviderRegistry } from "./provider/registry.js";
import type { LLMProviderPlugin } from "./provider/interface.js";
import { createLogger } from "../utils/logger.js";
import { openaiPlugin } from "./provider/adapters/openai.js";
import { anthropicPlugin } from "./provider/adapters/anthropic.js";
import { openrouterPlugin } from "./provider/adapters/openrouter.js";
import { ollamaPlugin } from "./provider/adapters/ollama.js";
import { lmstudioPlugin } from "./provider/adapters/lmstudio.js";
import { deepseekPlugin } from "./provider/adapters/deepseek.js";
import { geminiPlugin } from "./provider/adapters/gemini.js";
import { mistralPlugin } from "./provider/adapters/mistral.js";
import { kimiPlugin } from "./provider/adapters/kimi.js";
import { dashscopePlugin } from "./provider/adapters/dashscope.js";
import { groqPlugin } from "./provider/adapters/groq.js";
import { zaiPlugin } from "./provider/adapters/zai.js";

const logger = createLogger("ai-provider");

function registerProviders(
  registry: LLMProviderRegistry,
  providers: readonly LLMProviderPlugin[],
): LLMProviderRegistry {
  for (const provider of providers) {
    registry.register(provider);
  }
  logger.info("LLM provider registry initialized", { providers: providers.length });
  return registry;
}

export function createDefaultRegistry(): LLMProviderRegistry {
  return registerProviders(new LLMProviderRegistry(), [
    openaiPlugin,
    anthropicPlugin,
    openrouterPlugin,
    ollamaPlugin,
    lmstudioPlugin,
    deepseekPlugin,
    geminiPlugin,
    mistralPlugin,
    kimiPlugin,
    dashscopePlugin,
    groqPlugin,
    zaiPlugin,
  ]);
}
