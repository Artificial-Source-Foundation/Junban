/**
 * Provider setup and default registry factory.
 * Creates the LLMProviderRegistry with all built-in providers registered.
 */

import { LLMProviderRegistry } from "./provider/registry.js";
import type { LLMProviderPlugin } from "./provider/interface.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("ai-provider");

const BUILTIN_PROVIDER_COUNT = 12;

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

/**
 * Async variant for browser startup paths.
 * Loads provider adapter modules lazily to keep startup bundle smaller.
 */
export async function createDefaultRegistryAsync(): Promise<LLMProviderRegistry> {
  const [
    openai,
    anthropic,
    openrouter,
    ollama,
    lmstudio,
    deepseek,
    gemini,
    mistral,
    kimi,
    dashscope,
    groq,
    zai,
  ] = await Promise.all([
    import("./provider/adapters/openai.js"),
    import("./provider/adapters/anthropic.js"),
    import("./provider/adapters/openrouter.js"),
    import("./provider/adapters/ollama.js"),
    import("./provider/adapters/lmstudio.js"),
    import("./provider/adapters/deepseek.js"),
    import("./provider/adapters/gemini.js"),
    import("./provider/adapters/mistral.js"),
    import("./provider/adapters/kimi.js"),
    import("./provider/adapters/dashscope.js"),
    import("./provider/adapters/groq.js"),
    import("./provider/adapters/zai.js"),
  ]);

  const providers: LLMProviderPlugin[] = [
    openai.openaiPlugin,
    anthropic.anthropicPlugin,
    openrouter.openrouterPlugin,
    ollama.ollamaPlugin,
    lmstudio.lmstudioPlugin,
    deepseek.deepseekPlugin,
    gemini.geminiPlugin,
    mistral.mistralPlugin,
    kimi.kimiPlugin,
    dashscope.dashscopePlugin,
    groq.groqPlugin,
    zai.zaiPlugin,
  ];

  if (providers.length !== BUILTIN_PROVIDER_COUNT) {
    logger.warn("Unexpected built-in provider count", {
      expected: BUILTIN_PROVIDER_COUNT,
      actual: providers.length,
    });
  }

  return registerProviders(new LLMProviderRegistry(), providers);
}
