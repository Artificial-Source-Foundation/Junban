import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetServices = vi.fn();
const mockGetSecureSetting = vi.fn();
const mockSetSecureSetting = vi.fn();
const mockFetchAvailableModels = vi.fn();
const mockLoadLMStudioModel = vi.fn();
const mockUnloadLMStudioModel = vi.fn();
const mockGatherContext = vi.fn();

vi.mock("../../../src/ui/api/helpers.js", () => ({
  useDirectServices: () => true,
  BASE: "/api",
  handleResponse: async (res: Response) => res.json(),
  handleVoidResponse: async () => {},
}));

vi.mock("../../../src/ui/api/direct-services.js", () => ({
  getServices: () => mockGetServices(),
}));

vi.mock("../../../src/storage/encrypted-settings.js", () => ({
  getSecureSetting: (...args: unknown[]) => mockGetSecureSetting(...args),
  setSecureSetting: (...args: unknown[]) => mockSetSecureSetting(...args),
}));

vi.mock("../../../src/ai/model-discovery.js", () => ({
  fetchAvailableModels: (...args: unknown[]) => mockFetchAvailableModels(...args),
  loadLMStudioModel: (...args: unknown[]) => mockLoadLMStudioModel(...args),
  unloadLMStudioModel: (...args: unknown[]) => mockUnloadLMStudioModel(...args),
}));

vi.mock("../../../src/ai/chat.js", () => ({
  gatherContext: (...args: unknown[]) => mockGatherContext(...args),
}));

import {
  fetchModels,
  getAIConfig,
  getChatMessages,
  loadModel,
  sendChatMessage,
  switchChatSession,
  unloadModel,
  updateAIConfig,
} from "../../../src/ui/api/ai.js";

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text;
}

describe("ui/api/ai direct-services updateAIConfig", () => {
  const mockStorage = {
    getAppSetting: vi.fn(),
    setAppSetting: vi.fn(),
    deleteAppSetting: vi.fn(),
  };
  const mockSave = vi.fn();
  const mockClearSession = vi.fn();
  const mockCreateExecutor = vi.fn();
  const mockGetSession = vi.fn();
  const mockSetSession = vi.fn();
  const mockBuildSystemMessage = vi.fn();
  const mockGetAIRuntime = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSecureSetting.mockResolvedValue(null);
    mockSetSecureSetting.mockResolvedValue(undefined);
    mockFetchAvailableModels.mockResolvedValue([]);
    mockLoadLMStudioModel.mockResolvedValue("model-loaded");
    mockUnloadLMStudioModel.mockResolvedValue(undefined);
    mockGatherContext.mockResolvedValue("context");
    mockGetSession.mockReturnValue(null);
    mockGetAIRuntime.mockResolvedValue({
      aiProviderRegistry: {
        createExecutor: mockCreateExecutor,
      },
      chatManager: {
        clearSession: mockClearSession,
        getSession: mockGetSession,
        setSession: mockSetSession,
        buildSystemMessage: mockBuildSystemMessage,
      },
      toolRegistry: {},
    });
    mockGetServices.mockResolvedValue({
      storage: mockStorage,
      save: mockSave,
      getAIRuntime: mockGetAIRuntime,
      taskService: {},
      projectService: {},
      tagService: {},
      statsService: {},
    });
    mockStorage.getAppSetting.mockImplementation((key: string) => {
      if (key === "ai_provider") return { value: "openai" };
      if (key === "ai_model") return { value: "gpt-4o-mini" };
      if (key === "ai_base_url") return { value: "https://api.openai.com/v1" };
      if (key === "ai_auth_type") return { value: "oauth" };
      return undefined;
    });
  });

  function useUnsafeStoredBaseUrl(): void {
    mockStorage.getAppSetting.mockImplementation((key: string) => {
      if (key === "ai_provider") return { value: "openai" };
      if (key === "ai_model") return { value: "gpt-4o-mini" };
      if (key === "ai_base_url") return { value: "http://192.168.1.20:11434" };
      if (key === "ai_auth_type") return { value: "oauth" };
      return undefined;
    });
  }

  it("reads API key and OAuth token via secure setting helper", async () => {
    mockGetSecureSetting
      .mockResolvedValueOnce("sk-secure")
      .mockResolvedValueOnce("oauth-secure-token");

    const config = await getAIConfig();

    expect(mockGetSecureSetting).toHaveBeenNthCalledWith(1, mockStorage, "ai_api_key");
    expect(mockGetSecureSetting).toHaveBeenNthCalledWith(2, mockStorage, "ai_oauth_token");
    expect(config).toEqual({
      provider: "openai",
      model: "gpt-4o-mini",
      baseUrl: "https://api.openai.com/v1",
      hasApiKey: true,
      authType: "oauth",
      hasOAuthToken: true,
    });
  });

  it("saves config before requesting AI runtime", async () => {
    mockGetAIRuntime.mockRejectedValue(new Error("runtime unavailable"));

    await expect(updateAIConfig({ provider: "openai" })).rejects.toThrow("runtime unavailable");

    expect(mockStorage.setAppSetting).toHaveBeenCalledWith("ai_provider", "openai");
    expect(mockSetSecureSetting).not.toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave.mock.invocationCallOrder[0]).toBeLessThan(
      mockGetAIRuntime.mock.invocationCallOrder[0],
    );
  });

  it("persists again after clearing chat session", async () => {
    mockGetAIRuntime.mockResolvedValue({
      chatManager: {
        clearSession: mockClearSession,
      },
    });

    await updateAIConfig({ provider: "anthropic" });

    expect(mockClearSession).toHaveBeenCalledWith(mockStorage);
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it("rejects unsafe base URLs before direct-service persistence", async () => {
    mockGetAIRuntime.mockResolvedValue({
      chatManager: {
        clearSession: mockClearSession,
      },
    });

    await expect(updateAIConfig({ baseUrl: "http://192.168.1.20:11434" })).rejects.toThrow(
      "Invalid baseUrl",
    );

    expect(mockStorage.setAppSetting).not.toHaveBeenCalledWith("ai_base_url", expect.any(String));
    expect(mockSave).not.toHaveBeenCalled();
    expect(mockGetAIRuntime).not.toHaveBeenCalled();
  });

  it("writes API key and OAuth token via secure setting helper", async () => {
    mockGetAIRuntime.mockResolvedValue({
      chatManager: {
        clearSession: mockClearSession,
      },
    });

    await updateAIConfig({
      provider: "anthropic",
      apiKey: "sk-ant-secure",
      oauthToken: "oauth-secure-token",
    });

    expect(mockSetSecureSetting).toHaveBeenNthCalledWith(
      1,
      mockStorage,
      "ai_api_key",
      "sk-ant-secure",
    );
    expect(mockSetSecureSetting).toHaveBeenNthCalledWith(
      2,
      mockStorage,
      "ai_oauth_token",
      "oauth-secure-token",
    );
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it("returns safe empty models for unsafe direct-service discovery overrides", async () => {
    const models = await fetchModels("lmstudio", "http://192.168.1.20:1234/v1");

    expect(models).toEqual([]);
    expect(mockGetServices).not.toHaveBeenCalled();
    expect(mockFetchAvailableModels).not.toHaveBeenCalled();
  });

  it("returns safe empty models when stored direct-service discovery baseUrl is unsafe", async () => {
    useUnsafeStoredBaseUrl();

    const models = await fetchModels("lmstudio");

    expect(models).toEqual([]);
    expect(mockFetchAvailableModels).not.toHaveBeenCalled();
  });

  it("rejects unsafe direct-service load and unload overrides before model lifecycle calls", async () => {
    await expect(loadModel("lmstudio", "llama-3.1", "http://192.168.1.20:1234/v1")).rejects.toThrow(
      "Invalid baseUrl",
    );
    await expect(
      unloadModel("lmstudio", "llama-3.1", "http://192.168.1.20:1234/v1"),
    ).rejects.toThrow("Invalid baseUrl");

    expect(mockGetServices).not.toHaveBeenCalled();
    expect(mockLoadLMStudioModel).not.toHaveBeenCalled();
    expect(mockUnloadLMStudioModel).not.toHaveBeenCalled();
  });

  it("rejects unsafe stored direct-service load/unload baseUrl before model lifecycle calls", async () => {
    useUnsafeStoredBaseUrl();

    await expect(loadModel("lmstudio", "llama-3.1")).rejects.toThrow("Invalid stored baseUrl");
    await expect(unloadModel("lmstudio", "llama-3.1")).rejects.toThrow("Invalid stored baseUrl");

    expect(mockLoadLMStudioModel).not.toHaveBeenCalled();
    expect(mockUnloadLMStudioModel).not.toHaveBeenCalled();
  });

  it("streams an error for unsafe stored direct-service chat baseUrl before executor/context", async () => {
    useUnsafeStoredBaseUrl();

    const stream = await sendChatMessage("Hello");

    expect(stream).not.toBeNull();
    await expect(readStream(stream as ReadableStream<Uint8Array>)).resolves.toContain(
      "Stored AI provider baseUrl is not allowed",
    );
    expect(mockCreateExecutor).not.toHaveBeenCalled();
    expect(mockGatherContext).not.toHaveBeenCalled();
  });

  it("skips direct-service chat restore when stored baseUrl is unsafe", async () => {
    useUnsafeStoredBaseUrl();

    const messages = await getChatMessages();

    expect(messages).toEqual([]);
    expect(mockCreateExecutor).not.toHaveBeenCalled();
  });

  it("rejects direct-service session switch when stored baseUrl is unsafe", async () => {
    useUnsafeStoredBaseUrl();

    await expect(switchChatSession("session-1")).rejects.toThrow("Invalid stored baseUrl");

    expect(mockCreateExecutor).not.toHaveBeenCalled();
  });
});
