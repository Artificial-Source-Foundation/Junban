import type { Task } from "../core/types.js";

/**
 * Plugin base class — all plugins extend this.
 * Provides access to the Docket API and plugin settings.
 */
export abstract class Plugin {
  abstract onLoad(): Promise<void>;
  abstract onUnload(): Promise<void>;

  // Optional task lifecycle hooks — plugins can override these
  onTaskCreate?(task: Task): void;
  onTaskComplete?(task: Task): void;
  onTaskUpdate?(task: Task, changes: Partial<Task>): void;
  onTaskDelete?(task: Task): void;
}
