import type { Task } from "../core/types.js";
import type { PluginAPI, PluginSettingsAccessor } from "./api.js";

/**
 * Plugin base class — all plugins extend this.
 * Provides access to the Docket API and plugin settings.
 *
 * `app` and `settings` are set by the loader before calling `onLoad()`.
 */
export abstract class Plugin {
  /** The Docket Plugin API — provides access to tasks, commands, UI, events, and storage. */
  app!: PluginAPI;

  /** Accessor for this plugin's settings (manifest-defined defaults + user overrides). */
  settings!: PluginSettingsAccessor;

  abstract onLoad(): Promise<void>;
  abstract onUnload(): Promise<void>;

  // Optional task lifecycle hooks — plugins can override these
  onTaskCreate?(task: Task): void;
  onTaskComplete?(task: Task): void;
  onTaskUpdate?(task: Task, changes: Partial<Task>): void;
  onTaskDelete?(task: Task): void;
}
