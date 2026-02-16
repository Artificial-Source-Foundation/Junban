/**
 * Example Plugin — demonstrates the Saydo Plugin API.
 *
 * This plugin:
 * - Registers a "Greet" command in the command palette
 * - Shows a task count in the status bar
 * - Listens for task creation events
 *
 * Use this as a starting point for your own plugins.
 * See docs/plugins/API.md for the full API reference.
 */

import { Plugin } from "../../src/plugins/lifecycle.js";

export default class ExamplePlugin extends Plugin {
  private statusItem: { update: (data: { text?: string }) => void } | null = null;

  async onLoad() {
    // Register a command
    this.app.commands?.register({
      id: "example:greet",
      name: "Greet",
      callback: () => {
        const greeting = this.settings.get<string>("greeting");
        console.log(`[ExamplePlugin] ${greeting}`);
      },
    });

    // Add a status bar item showing pending task count
    if (this.settings.get<boolean>("showTaskCount")) {
      const tasks = await this.app.tasks.list?.();
      const pendingCount = tasks?.filter((t) => t.status === "pending").length ?? 0;

      this.statusItem = this.app.ui.addStatusBarItem?.({
        id: "example-task-count",
        text: `${pendingCount} pending`,
        icon: "list",
      }) ?? null;
    }

    // Listen for new tasks
    this.app.events.on("task:create", (task) => {
      console.log(`[ExamplePlugin] New task created: ${task.title}`);
      this.updateCount();
    });

    this.app.events.on("task:complete", () => {
      this.updateCount();
    });
  }

  async onUnload() {
    this.statusItem = null;
  }

  private async updateCount() {
    if (!this.statusItem) return;
    const tasks = await this.app.tasks.list?.();
    const pendingCount = tasks?.filter((t) => t.status === "pending").length ?? 0;
    this.statusItem.update({ text: `${pendingCount} pending` });
  }
}
