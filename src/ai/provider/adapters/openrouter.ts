/**
 * OpenRouter provider — thin config over the OpenAI-compatible base.
 *
 * Dynamically discovers models from OpenRouter's API, filters to only
 * those with tool-calling support, and sorts by price (capability proxy)
 * so the best options appear first in the dropdown.
 */

import { createOpenAICompatPlugin } from "./openai-compat.js";
import type { LLMProviderPlugin } from "../interface.js";
import type { ModelDescriptor } from "../../core/capabilities.js";
import type { AIProviderConfig } from "../../types.js";
import { DEFAULT_CAPABILITIES } from "../../core/capabilities.js";
import { fetchWithTimeout } from "./fetch-utils.js";

/** Shape of each model entry from OpenRouter's /models endpoint. */
interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  supported_parameters?: string[];
}

/** Strip provider prefix from OpenRouter's display name (e.g. "OpenAI: GPT-4.1" → "GPT-4.1"). */
function cleanLabel(name: string): string {
  const colonIdx = name.indexOf(": ");
  return colonIdx >= 0 ? name.slice(colonIdx + 2) : name;
}

/** Keywords in model ID or name that indicate non-chat models. */
const EXCLUDED_PATTERNS =
  /image|vision-preview|research|router|safeguard|oss-\d|embed|tts|whisper/i;

/**
 * Fetch models from OpenRouter, filter to tool-capable chat models only,
 * and sort alphabetically.
 */
async function discoverOpenRouterModels(config: AIProviderConfig): Promise<ModelDescriptor[]> {
  const apiKey = config.authType === "oauth" ? (config.oauthToken ?? "") : (config.apiKey ?? "");
  if (!apiKey) return [];

  const baseUrl = config.baseUrl ?? "https://openrouter.ai/api/v1";

  try {
    const res = await fetchWithTimeout(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as { data?: OpenRouterModel[] };
    const models = data.data ?? [];

    return models
      .filter(
        (m) =>
          m.supported_parameters != null &&
          m.supported_parameters.includes("tools") &&
          !m.id.includes(":free") &&
          !m.id.includes(":extended") &&
          !EXCLUDED_PATTERNS.test(m.id) &&
          !EXCLUDED_PATTERNS.test(m.name),
      )
      .sort((a, b) => cleanLabel(a.name).localeCompare(cleanLabel(b.name)))
      .map((m) => ({
        id: m.id,
        label: cleanLabel(m.name),
        capabilities: { ...DEFAULT_CAPABILITIES },
        loaded: true,
      }));
  } catch {
    return [];
  }
}

export const openrouterPlugin: LLMProviderPlugin = createOpenAICompatPlugin({
  name: "openrouter",
  displayName: "OpenRouter",
  needsApiKey: true,
  defaultModel: "anthropic/claude-sonnet-4.5",
  defaultBaseUrl: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/Artificial-Source/Junban",
    "X-Title": "ASF Junban",
  },
  discoverModels: discoverOpenRouterModels,
});
