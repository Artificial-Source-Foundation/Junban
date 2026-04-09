import type { ChatManager } from "./ai/chat.js";
import type { LLMProviderRegistry } from "./ai/provider/registry.js";
import type { ToolRegistry } from "./ai/tools/registry.js";

export interface WebAIRuntime {
  chatManager: ChatManager;
  aiProviderRegistry: LLMProviderRegistry;
  toolRegistry: ToolRegistry;
}

export async function createWebAIRuntime(): Promise<WebAIRuntime> {
  const { ChatManager } = await import("./ai/chat.js");
  const { createDefaultRegistryAsync } = await import("./ai/provider.js");
  const { createDefaultToolRegistry } = await import("./ai/tool-registry.js");

  return {
    chatManager: new ChatManager(),
    aiProviderRegistry: await createDefaultRegistryAsync(),
    toolRegistry: createDefaultToolRegistry(),
  };
}
