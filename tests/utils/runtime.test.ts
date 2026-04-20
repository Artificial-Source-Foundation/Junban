// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const readyRuntime = {
  mode: "default" as const,
  desktop: {
    apiBase: "http://127.0.0.1:7001/api",
    healthUrl: "http://127.0.0.1:7001/api/health",
    ready: true,
    service: "junban-backend",
  },
};

describe("runtime descriptor synchronization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    delete window.__JUNBAN_RUNTIME__;
    delete window.__JUNBAN_RUNTIME_READY__;
  });

  it("subscribes to desktop runtime descriptor changes in packaged Tauri mode", async () => {
    const listenMock = vi.fn(async () => vi.fn());

    vi.doMock("../../src/utils/tauri.js", () => ({
      isTauri: () => true,
    }));
    vi.doMock("@tauri-apps/api/event", () => ({
      listen: listenMock,
    }));

    window.__JUNBAN_RUNTIME__ = readyRuntime;
    window.__JUNBAN_RUNTIME_READY__ = Promise.resolve(readyRuntime);

    const runtime = await import("../../src/utils/runtime.js");
    await runtime.waitForRuntimeConfig();

    expect(listenMock).toHaveBeenCalledWith(
      runtime.DESKTOP_RUNTIME_DESCRIPTOR_CHANGED_EVENT,
      expect.any(Function),
    );
  });

  it("refreshes window runtime when a desktop runtime update event arrives", async () => {
    let onRuntimeUpdate: ((event: { payload: typeof readyRuntime }) => void) | null = null;
    const listenMock = vi.fn(async (_eventName: string, handler: typeof onRuntimeUpdate) => {
      onRuntimeUpdate = handler;
      return vi.fn();
    });

    vi.doMock("../../src/utils/tauri.js", () => ({
      isTauri: () => true,
    }));
    vi.doMock("@tauri-apps/api/event", () => ({
      listen: listenMock,
    }));

    window.__JUNBAN_RUNTIME__ = readyRuntime;
    window.__JUNBAN_RUNTIME_READY__ = Promise.resolve(readyRuntime);

    const runtime = await import("../../src/utils/runtime.js");
    await runtime.waitForRuntimeConfig();

    const updatedRuntime = {
      mode: "default" as const,
      desktop: {
        apiBase: "http://127.0.0.1:7001/api",
        healthUrl: "http://127.0.0.1:7001/api/health",
        ready: false,
        service: "junban-backend",
        error: "Desktop backend exited with code Some(1) signal None",
      },
    };

    onRuntimeUpdate?.({ payload: updatedRuntime });

    expect(window.__JUNBAN_RUNTIME__).toEqual(updatedRuntime);
    await expect(window.__JUNBAN_RUNTIME_READY__).resolves.toEqual(updatedRuntime);
    expect(runtime.getDesktopApiRuntime()?.ready).toBe(false);
    expect(runtime.getDesktopApiRuntime()?.error).toContain("exited");
  });
});
