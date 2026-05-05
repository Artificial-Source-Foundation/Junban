import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

const aiChatMocks = vi.hoisted(() => ({
  config: { provider: "lmstudio", model: "llama-3.1" } as {
    provider: string | null;
    model: string | null;
  },
  loadModel: vi.fn(),
  unloadModel: vi.fn(),
}));

vi.mock("../../../src/ui/context/AIVoiceFeatureProviders.js", () => ({
  AIVoiceFeatureProviders: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("../../../src/ui/context/AIContext.js", () => ({
  useAIContext: () => ({ config: aiChatMocks.config }),
}));

vi.mock("../../../src/ui/context/AppStateContext.js", () => ({
  useAppState: () => ({ selectedTaskId: null }),
}));

vi.mock("../../../src/ui/api/ai.js", () => ({
  loadModel: aiChatMocks.loadModel,
  unloadModel: aiChatMocks.unloadModel,
}));

vi.mock("../../../src/ui/components/AIChatPanel.js", () => ({
  AIChatPanel: () => <div data-testid="ai-chat-panel">AI Chat Panel</div>,
}));

import { AIChat } from "../../../src/ui/views/AIChat.js";

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("AIChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiChatMocks.config.provider = "lmstudio";
    aiChatMocks.config.model = "llama-3.1";
    window.localStorage.setItem("junban.ai.auto-manage-lmstudio", "1");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("unloads an auto-managed model after a pending load resolves post-unmount", async () => {
    const pendingLoad = createDeferred<void>();
    aiChatMocks.loadModel.mockReturnValueOnce(pendingLoad.promise);
    aiChatMocks.unloadModel.mockResolvedValue(undefined);

    const { unmount } = render(<AIChat onOpenSettings={vi.fn()} />);

    await waitFor(() => {
      expect(aiChatMocks.loadModel).toHaveBeenCalledWith("lmstudio", "llama-3.1");
    });

    unmount();
    expect(aiChatMocks.unloadModel).not.toHaveBeenCalled();

    await act(async () => {
      pendingLoad.resolve();
      await pendingLoad.promise;
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(aiChatMocks.unloadModel).toHaveBeenCalledWith("lmstudio", "llama-3.1");
    });
  });

  it("does not let a stale unmount unload the same model after rapid remount", async () => {
    const firstLoad = createDeferred<void>();
    const secondLoad = createDeferred<void>();
    aiChatMocks.loadModel
      .mockReturnValueOnce(firstLoad.promise)
      .mockReturnValueOnce(secondLoad.promise);
    aiChatMocks.unloadModel.mockResolvedValue(undefined);

    const firstRender = render(<AIChat onOpenSettings={vi.fn()} />);
    await waitFor(() => expect(aiChatMocks.loadModel).toHaveBeenCalledTimes(1));
    firstRender.unmount();

    const secondRender = render(<AIChat onOpenSettings={vi.fn()} />);
    await waitFor(() => expect(aiChatMocks.loadModel).toHaveBeenCalledTimes(2));

    await act(async () => {
      firstLoad.resolve();
      await firstLoad.promise;
      await Promise.resolve();
    });

    expect(aiChatMocks.unloadModel).not.toHaveBeenCalled();

    await act(async () => {
      secondLoad.resolve();
      await secondLoad.promise;
      await Promise.resolve();
    });

    secondRender.unmount();

    await waitFor(() => {
      expect(aiChatMocks.unloadModel).toHaveBeenCalledTimes(1);
      expect(aiChatMocks.unloadModel).toHaveBeenCalledWith("lmstudio", "llama-3.1");
    });
  });
});
