/**
 * Ollama provider — OpenAI-compatible with native /api/tags discovery.
 */

import { createOpenAICompatPlugin } from "./openai-compat.js";
import type { LLMProviderPlugin } from "../interface.js";
import type { ModelDescriptor } from "../../core/capabilities.js";
import type { AIProviderConfig } from "../../types.js";
import { DEFAULT_CAPABILITIES } from "../../core/capabilities.js";
import { DEFAULT_OLLAMA_BASE_URL } from "../../../config/defaults.js";
import { fetchWithTimeout } from "./fetch-utils.js";

async function discoverOllamaModels(config: AIProviderConfig): Promise<ModelDescriptor[]> {
  const baseUrl = config.baseUrl ?? DEFAULT_OLLAMA_BASE_URL;
  // Strip /v1 suffix if present (user might pass the OpenAI-compat URL)
  const host = baseUrl.replace(/\/v1\/?$/, "");
  const res = await fetchWithTimeout(`${host}/api/tags`);
  if (!res.ok) return [];
  const data = (await res.json()) as { models?: { name: string }[] };
  return (data.models ?? []).map((m) => ({
    id: m.name,
    label: m.name,
    capabilities: { ...DEFAULT_CAPABILITIES },
    loaded: true,
  }));
}

export const ollamaPlugin: LLMProviderPlugin = createOpenAICompatPlugin({
  name: "ollama",
  displayName: "Ollama (local)",
  needsApiKey: false,
  defaultModel: "llama3.2",
  defaultBaseUrl: `${DEFAULT_OLLAMA_BASE_URL}/v1`,
  showBaseUrl: true,
  fakeApiKey: "ollama",
  discoverModels: discoverOllamaModels,
});
