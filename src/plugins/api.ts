import type { Permission } from "./types.js";

/**
 * Plugin API surface — the controlled interface that plugins interact with.
 * Access is filtered by the plugin's declared permissions.
 */
export function createPluginAPI(pluginId: string, permissions: Permission[]) {
  const hasPermission = (p: Permission) => permissions.includes(p);

  return {
    tasks: {
      list: hasPermission("task:read")
        ? async () => {
            // TODO: Delegate to TaskService
            return [];
          }
        : undefined,
      create: hasPermission("task:write")
        ? async () => {
            // TODO: Delegate to TaskService
            return null;
          }
        : undefined,
    },

    commands: hasPermission("commands")
      ? {
          register: (command: { id: string; name: string; callback: () => void; hotkey?: string }) => {
            // TODO: Register in command palette
          },
        }
      : undefined,

    ui: {
      addSidebarPanel: hasPermission("ui:panel")
        ? (panel: { id: string; title: string; icon: string; component: unknown }) => {
            // TODO: Register sidebar panel
          }
        : undefined,
      addView: hasPermission("ui:view")
        ? (view: { id: string; name: string; icon: string; component: unknown }) => {
            // TODO: Register view
          }
        : undefined,
      addStatusBarItem: hasPermission("ui:status")
        ? (item: { id: string; text: string; icon: string; onClick?: () => void }) => {
            // TODO: Add status bar item
            return { update: (data: { text?: string }) => {} };
          }
        : undefined,
    },

    storage: hasPermission("storage")
      ? {
          get: async <T>(key: string): Promise<T | null> => {
            // TODO: Read from plugin_settings storage
            return null;
          },
          set: async (key: string, value: unknown): Promise<void> => {
            // TODO: Write to plugin_settings storage
          },
          delete: async (key: string): Promise<void> => {
            // TODO: Delete from plugin_settings storage
          },
          keys: async (): Promise<string[]> => {
            // TODO: List keys from plugin_settings storage
            return [];
          },
        }
      : undefined,

    events: {
      on: (event: string, callback: (...args: unknown[]) => void) => {
        // TODO: Subscribe to event bus
      },
      off: (event: string, callback: (...args: unknown[]) => void) => {
        // TODO: Unsubscribe from event bus
      },
    },
  };
}
