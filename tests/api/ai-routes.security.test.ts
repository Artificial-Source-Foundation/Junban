import { describe, expect, it, vi } from "vitest";
import { aiRoutes } from "../../src/api/ai.js";

function createServices(overrides: Record<string, unknown> = {}) {
  return {
    pluginLoader: {
      loadAll: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    },
    storage: {
      getAppSetting: vi.fn(),
      setAppSetting: vi.fn(),
      deleteAppSetting: vi.fn(),
    },
    chatManager: {
      clearSession: vi.fn(),
      getSession: vi.fn().mockReturnValue(null),
    },
    aiProviderRegistry: {
      getAll: vi.fn().mockReturnValue([]),
      createExecutor: vi.fn(),
    },
    ...overrides,
  } as any;
}

describe("aiRoutes security guardrails", () => {
  it("persists allowed AI base URLs on config writes", async () => {
    const services = createServices();
    const app = aiRoutes(services);

    const res = await app.request("http://localhost/config", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ baseUrl: "https://api.openai.com/v1" }),
    });

    expect(res.status).toBe(200);
    expect(services.storage.setAppSetting).toHaveBeenCalledWith(
      "ai_base_url",
      "https://api.openai.com/v1",
    );
    expect(services.chatManager.clearSession).toHaveBeenCalledWith(services.storage);
  });

  it("rejects unsafe AI base URLs on config writes", async () => {
    const services = createServices();
    const app = aiRoutes(services);

    const res = await app.request("http://localhost/config", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ baseUrl: "http://192.168.1.20:11434" }),
    });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Invalid baseUrl" });
    expect(services.storage.setAppSetting).not.toHaveBeenCalledWith(
      "ai_base_url",
      expect.any(String),
    );
    expect(services.chatManager.clearSession).not.toHaveBeenCalled();
  });

  it("rejects unsafe model-operation base URL overrides", async () => {
    const services = createServices();
    const app = aiRoutes(services, {
      ensurePluginsLoaded: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    });

    const res = await app.request("http://localhost/providers/lmstudio/models/load", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "local-model", baseUrl: "http://10.0.0.2:1234/v1" }),
    });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Invalid baseUrl" });
  });

  it("blocks chat executor creation when a persisted base URL is unsafe", async () => {
    const storage = {
      getAppSetting: vi.fn((key: string) => {
        if (key === "ai_provider") return { value: "openai" };
        if (key === "ai_base_url") return { value: "http://192.168.1.20:11434" };
        return undefined;
      }),
      setAppSetting: vi.fn(),
      deleteAppSetting: vi.fn(),
    };
    const services = createServices({ storage });
    const app = aiRoutes(services, {
      ensurePluginsLoaded: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    });

    const res = await app.request("http://localhost/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "hello" }),
    });

    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Stored AI provider baseUrl is not allowed");
    expect(services.aiProviderRegistry.createExecutor).not.toHaveBeenCalled();
  });
});
