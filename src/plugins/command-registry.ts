export interface PluginCommand {
  id: string;
  name: string;
  pluginId: string;
  callback: () => void;
  hotkey?: string;
}

/**
 * Command registry — stores plugin-registered commands.
 * Commands are callable but not wired to the React command palette yet (Sprint 4).
 */
export class CommandRegistry {
  private commands = new Map<string, PluginCommand>();

  register(cmd: PluginCommand): void {
    if (this.commands.has(cmd.id)) {
      throw new Error(`Command "${cmd.id}" is already registered`);
    }
    this.commands.set(cmd.id, cmd);
  }

  unregister(id: string): void {
    this.commands.delete(id);
  }

  unregisterByPlugin(pluginId: string): void {
    for (const [id, cmd] of this.commands) {
      if (cmd.pluginId === pluginId) {
        this.commands.delete(id);
      }
    }
  }

  get(id: string): PluginCommand | undefined {
    return this.commands.get(id);
  }

  getAll(): PluginCommand[] {
    return Array.from(this.commands.values());
  }

  execute(id: string): void {
    const cmd = this.commands.get(id);
    if (!cmd) {
      throw new Error(`Command "${id}" not found`);
    }
    cmd.callback();
  }
}
