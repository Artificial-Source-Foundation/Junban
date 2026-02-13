/**
 * Plugin sandbox — lightweight wrapper for plugin execution.
 *
 * Currently, plugins run in the same process via dynamic import().
 * Access is controlled by permission-checked API injection in createPluginAPI().
 *
 * Full isolation (vm module, Worker, or iframe) deferred to Sprint 4.
 */

export interface SandboxOptions {
  pluginId: string;
  pluginDir: string;
  permissions: string[];
}

export function createSandbox(_options: SandboxOptions) {
  // No sandbox isolation — permission checks happen in createPluginAPI()
  return {
    execute: async (_entryFile: string) => {},
    destroy: () => {},
  };
}
