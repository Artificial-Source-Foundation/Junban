import type { SettingDefinition } from "./types.js";

/**
 * Per-plugin settings manager.
 * Stores settings in the database, keyed by plugin ID.
 * Defaults come from the plugin manifest.
 */
export class PluginSettingsManager {
  private cache: Map<string, Record<string, unknown>> = new Map();

  /** Get a setting value for a plugin, falling back to the manifest default. */
  get<T>(pluginId: string, settingId: string, definitions: SettingDefinition[]): T {
    const stored = this.cache.get(pluginId);
    if (stored && settingId in stored) {
      return stored[settingId] as T;
    }

    const def = definitions.find((d) => d.id === settingId);
    if (def) {
      return def.default as T;
    }

    throw new Error(`Unknown setting: ${pluginId}/${settingId}`);
  }

  /** Update a setting value for a plugin. */
  async set(pluginId: string, settingId: string, value: unknown): Promise<void> {
    const stored = this.cache.get(pluginId) ?? {};
    stored[settingId] = value;
    this.cache.set(pluginId, stored);

    // TODO: Persist to database
  }

  /** Load all settings for a plugin from the database. */
  async load(pluginId: string): Promise<Record<string, unknown>> {
    // TODO: Read from database
    const settings: Record<string, unknown> = {};
    this.cache.set(pluginId, settings);
    return settings;
  }
}
