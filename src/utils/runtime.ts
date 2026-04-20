import { isTauri } from "./tauri.js";

export type RuntimeMode = "default" | "remote-desktop";

export const JUNBAN_BACKEND_SERVICE = "junban-backend";
export const DESKTOP_RUNTIME_DESCRIPTOR_CHANGED_EVENT = "junban:desktop-runtime-descriptor-changed";
export const JUNBAN_RUNTIME_UPDATED_EVENT = "junban:runtime-updated";

export interface DesktopApiRuntimeConfig {
  apiBase: string;
  healthUrl: string;
  ready: boolean;
  service: string;
  error?: string | null;
}

export interface JunbanRuntimeConfig {
  mode?: RuntimeMode;
  desktop?: DesktopApiRuntimeConfig;
}

const DEFAULT_RUNTIME_CONFIG: Readonly<JunbanRuntimeConfig> = {
  mode: "default",
};

declare global {
  interface Window {
    __JUNBAN_RUNTIME__?: JunbanRuntimeConfig;
    __JUNBAN_RUNTIME_READY__?: Promise<JunbanRuntimeConfig>;
  }
}

let desktopRuntimeListenerSetup: Promise<void> | null = null;

function normalizeRuntimeConfig(config?: JunbanRuntimeConfig): JunbanRuntimeConfig {
  return {
    mode: config?.mode ?? DEFAULT_RUNTIME_CONFIG.mode,
    desktop: config?.desktop,
  };
}

export function getRuntimeConfig(): JunbanRuntimeConfig {
  if (typeof window === "undefined") {
    return DEFAULT_RUNTIME_CONFIG;
  }

  return normalizeRuntimeConfig(window.__JUNBAN_RUNTIME__);
}

function applyRuntimeConfig(config?: JunbanRuntimeConfig): JunbanRuntimeConfig {
  const normalized = normalizeRuntimeConfig(config);
  window.__JUNBAN_RUNTIME__ = normalized;
  window.__JUNBAN_RUNTIME_READY__ = Promise.resolve(normalized);
  return normalized;
}

function shouldListenForDesktopRuntimeChanges(): boolean {
  return isTauri() && import.meta.env.VITE_USE_BACKEND !== "true" && !import.meta.env.VITE_API_URL;
}

async function ensureDesktopRuntimeChangeListener(): Promise<void> {
  if (typeof window === "undefined" || !shouldListenForDesktopRuntimeChanges()) {
    return;
  }

  if (desktopRuntimeListenerSetup) {
    return desktopRuntimeListenerSetup;
  }

  desktopRuntimeListenerSetup = (async () => {
    try {
      const { listen } = await import("@tauri-apps/api/event");
      await listen<JunbanRuntimeConfig>(DESKTOP_RUNTIME_DESCRIPTOR_CHANGED_EVENT, (event) => {
        const nextRuntime = applyRuntimeConfig(event.payload);
        window.dispatchEvent(
          new CustomEvent<JunbanRuntimeConfig>(JUNBAN_RUNTIME_UPDATED_EVENT, {
            detail: nextRuntime,
          }),
        );
      });
    } catch {
      // Degrade gracefully when Tauri event APIs are unavailable.
    }
  })();

  return desktopRuntimeListenerSetup;
}

export async function waitForRuntimeConfig(): Promise<JunbanRuntimeConfig> {
  if (typeof window === "undefined") {
    return DEFAULT_RUNTIME_CONFIG;
  }

  await ensureDesktopRuntimeChangeListener();

  if (window.__JUNBAN_RUNTIME_READY__) {
    return applyRuntimeConfig(await window.__JUNBAN_RUNTIME_READY__);
  }

  return applyRuntimeConfig(window.__JUNBAN_RUNTIME__);
}

export function getRuntimeMode(): RuntimeMode {
  return getRuntimeConfig().mode ?? "default";
}

export function getDesktopApiRuntime(): DesktopApiRuntimeConfig | null {
  return getRuntimeConfig().desktop ?? null;
}

export function isRemoteDesktopRuntime(): boolean {
  return !isTauri() && getRuntimeMode() === "remote-desktop";
}
