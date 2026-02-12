import { PluginManifest } from "./types.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("info");

export interface LoadedPlugin {
  manifest: PluginManifest;
  path: string;
  enabled: boolean;
}

/**
 * Plugin loader — discovers, validates, and loads plugins from the plugins directory.
 */
export class PluginLoader {
  private plugins: Map<string, LoadedPlugin> = new Map();

  constructor(private pluginDir: string) {}

  /** Scan the plugins directory and validate all manifests. */
  async discover(): Promise<LoadedPlugin[]> {
    // TODO: Read pluginDir, find manifest.json files
    // TODO: Validate each manifest with Zod
    // TODO: Check minDocketVersion compatibility
    logger.info(`Scanning for plugins in ${this.pluginDir}`);
    return [];
  }

  /** Load and activate a plugin by ID. */
  async load(pluginId: string): Promise<void> {
    // TODO: Create sandbox, import entry file, call onLoad()
    logger.info(`Loading plugin: ${pluginId}`);
  }

  /** Deactivate and unload a plugin by ID. */
  async unload(pluginId: string): Promise<void> {
    // TODO: Call onUnload(), tear down sandbox
    logger.info(`Unloading plugin: ${pluginId}`);
  }

  /** Get all discovered plugins. */
  getAll(): LoadedPlugin[] {
    return Array.from(this.plugins.values());
  }

  /** Get a specific plugin by ID. */
  get(pluginId: string): LoadedPlugin | undefined {
    return this.plugins.get(pluginId);
  }
}
