import {
  useDirectServices,
  BASE,
  buildApiUrl,
  handleResponse,
  handleVoidResponse,
} from "../helpers.js";
import { getServices } from "../direct-services.js";
import type { AIProviderInfo, ModelDiscoveryInfo } from "./ai-types.js";
import { DEFAULT_LMSTUDIO_BASE_URL } from "../../../config/defaults.js";
import { getSecureSetting } from "../../../storage/encrypted-settings.js";
import { isAllowedAIBaseUrl } from "../../../ai/base-url-policy.js";

type AIBaseUrlSettings = {
  getAppSetting(key: string): { value: string } | undefined;
};

function getValidatedStoredBaseUrl(storage: AIBaseUrlSettings): string | undefined {
  const baseUrlSetting = storage.getAppSetting("ai_base_url");
  if (!baseUrlSetting?.value) return undefined;
  if (!isAllowedAIBaseUrl(baseUrlSetting.value)) {
    throw new Error("Stored AI provider baseUrl is not allowed");
  }
  return baseUrlSetting.value;
}

export async function listAIProviders(): Promise<AIProviderInfo[]> {
  if (useDirectServices()) {
    const svc = await getServices();
    const ai = await svc.getAIRuntime();
    return ai.aiProviderRegistry.getAll().map((r) => ({
      name: r.plugin.name,
      displayName: r.plugin.displayName,
      needsApiKey: r.plugin.needsApiKey,
      optionalApiKey: r.plugin.optionalApiKey ?? false,
      supportsOAuth: r.plugin.supportsOAuth ?? false,
      defaultModel: r.plugin.defaultModel,
      defaultBaseUrl: r.plugin.defaultBaseUrl,
      showBaseUrl: r.plugin.showBaseUrl ?? false,
      pluginId: r.pluginId,
    }));
  }
  const res = await fetch(`${BASE}/ai/providers`);
  return handleResponse<AIProviderInfo[]>(res);
}

export async function fetchModels(
  providerName: string,
  baseUrl?: string,
): Promise<ModelDiscoveryInfo[]> {
  if (useDirectServices()) {
    if (baseUrl && !isAllowedAIBaseUrl(baseUrl)) {
      return [];
    }

    const svc = await getServices();
    let storedBaseUrl: string | undefined;
    try {
      storedBaseUrl = getValidatedStoredBaseUrl(svc.storage);
    } catch {
      return [];
    }
    const apiKey = await getSecureSetting(svc.storage, "ai_api_key");
    const { fetchAvailableModels } = await import("../../../ai/model-discovery.js");
    return fetchAvailableModels(providerName, {
      apiKey: apiKey ?? undefined,
      baseUrl: baseUrl || storedBaseUrl,
    });
  }
  const res = await fetch(
    buildApiUrl(`/ai/providers/${encodeURIComponent(providerName)}/models`, {
      baseUrl,
    }),
  );
  const data = await handleResponse<{ models: ModelDiscoveryInfo[] }>(res);
  return data.models;
}

export async function loadModel(
  providerName: string,
  modelKey: string,
  baseUrl?: string,
): Promise<void> {
  if (useDirectServices()) {
    if (baseUrl && !isAllowedAIBaseUrl(baseUrl)) {
      throw new Error("Invalid baseUrl");
    }

    const svc = await getServices();
    let storedBaseUrl: string | undefined;
    try {
      storedBaseUrl = getValidatedStoredBaseUrl(svc.storage);
    } catch {
      throw new Error("Invalid stored baseUrl");
    }
    const apiKey = await getSecureSetting(svc.storage, "ai_api_key");
    if (providerName === "lmstudio") {
      const { loadLMStudioModel } = await import("../../../ai/model-discovery.js");
      await loadLMStudioModel(
        modelKey,
        baseUrl || storedBaseUrl || DEFAULT_LMSTUDIO_BASE_URL,
        apiKey ?? undefined,
      );
    }
    return;
  }
  await handleVoidResponse(
    await fetch(`${BASE}/ai/providers/${encodeURIComponent(providerName)}/models/load`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelKey, baseUrl }),
    }),
  );
}

export async function unloadModel(
  providerName: string,
  modelKey: string,
  baseUrl?: string,
): Promise<void> {
  if (useDirectServices()) {
    if (baseUrl && !isAllowedAIBaseUrl(baseUrl)) {
      throw new Error("Invalid baseUrl");
    }

    const svc = await getServices();
    let storedBaseUrl: string | undefined;
    try {
      storedBaseUrl = getValidatedStoredBaseUrl(svc.storage);
    } catch {
      throw new Error("Invalid stored baseUrl");
    }
    const apiKey = await getSecureSetting(svc.storage, "ai_api_key");
    if (providerName === "lmstudio") {
      const { unloadLMStudioModel } = await import("../../../ai/model-discovery.js");
      await unloadLMStudioModel(
        modelKey,
        baseUrl || storedBaseUrl || DEFAULT_LMSTUDIO_BASE_URL,
        apiKey ?? undefined,
      );
    }
    return;
  }
  await handleVoidResponse(
    await fetch(`${BASE}/ai/providers/${encodeURIComponent(providerName)}/models/unload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelKey, baseUrl }),
    }),
  );
}
