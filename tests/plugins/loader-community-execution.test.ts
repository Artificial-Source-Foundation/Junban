import { afterEach, beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createTestServices } from "../integration/helpers.js";
import { PluginLoader, type PluginServices } from "../../src/plugins/loader.js";
import { PluginSettingsManager } from "../../src/plugins/settings.js";
import { CommandRegistry } from "../../src/plugins/command-registry.js";
import { UIRegistry } from "../../src/plugins/ui-registry.js";

const UNSAFE_COMMUNITY_PLUGIN_VM_ENV = "JUNBAN_ENABLE_UNSAFE_COMMUNITY_PLUGIN_VM";

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writePlugin(rootDir: string, pluginId: string, source: string): void {
  const pluginPath = path.join(rootDir, pluginId);
  fs.mkdirSync(pluginPath, { recursive: true });
  fs.writeFileSync(
    path.join(pluginPath, "manifest.json"),
    JSON.stringify(
      {
        id: pluginId,
        name: `Plugin ${pluginId}`,
        version: "1.0.0",
        author: "test",
        description: `Plugin ${pluginId}`,
        main: "index.mjs",
        minJunbanVersion: "1.0.0",
        permissions: ["commands"],
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(path.join(pluginPath, "index.mjs"), source);
}

function createLoader(pluginDir: string, builtinDir?: string) {
  const testServices = createTestServices();
  testServices.storage.setAppSetting("community_plugins_enabled", "true");
  const services: PluginServices = {
    taskService: testServices.taskService,
    projectService: testServices.projectService,
    tagService: testServices.tagService,
    eventBus: testServices.eventBus,
    settingsManager: new PluginSettingsManager(testServices.storage),
    commandRegistry: new CommandRegistry(),
    uiRegistry: new UIRegistry(),
    queries: testServices.storage,
  };

  return {
    loader: new PluginLoader(pluginDir, services, builtinDir),
    services,
    storage: testServices.storage,
  };
}

describe("PluginLoader community execution gate", () => {
  const tempDirs: string[] = [];
  let previousUnsafeOptIn: string | undefined;

  beforeEach(() => {
    previousUnsafeOptIn = process.env[UNSAFE_COMMUNITY_PLUGIN_VM_ENV];
    delete process.env[UNSAFE_COMMUNITY_PLUGIN_VM_ENV];
  });

  afterEach(() => {
    if (previousUnsafeOptIn === undefined) {
      delete process.env[UNSAFE_COMMUNITY_PLUGIN_VM_ENV];
    } else {
      process.env[UNSAFE_COMMUNITY_PLUGIN_VM_ENV] = previousUnsafeOptIn;
    }
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("does not execute community plugin code by default", async () => {
    const pluginDir = makeTempDir("junban-community-gate-");
    tempDirs.push(pluginDir);
    const markerPath = path.join(pluginDir, "executed.txt");
    writePlugin(
      pluginDir,
      "blocked-plugin",
      `
import fs from "node:fs";
fs.writeFileSync(${JSON.stringify(markerPath)}, "executed");
export default class BlockedPlugin {
  async onLoad() {}
  async onUnload() {}
}
`,
    );

    const { loader, storage } = createLoader(pluginDir);
    await loader.discover();
    storage.setPluginPermissions("blocked-plugin", ["commands"]);

    await expect(loader.load("blocked-plugin")).rejects.toThrow(
      /Community plugin execution is disabled/,
    );

    expect(loader.get("blocked-plugin")?.enabled).toBe(false);
    expect(fs.existsSync(markerPath)).toBe(false);
  });

  it("executes community plugins only with explicit unsafe local-dev opt-in", async () => {
    process.env[UNSAFE_COMMUNITY_PLUGIN_VM_ENV] = "true";
    const pluginDir = makeTempDir("junban-community-gate-");
    tempDirs.push(pluginDir);
    writePlugin(
      pluginDir,
      "unsafe-dev-plugin",
      `
export default class UnsafeDevPlugin {
  async onLoad() {
    this.app.commands.register({ id: "probe", name: "Probe", callback: () => {} });
  }
  async onUnload() {}
}
`,
    );

    const { loader, services, storage } = createLoader(pluginDir);
    await loader.discover();
    storage.setPluginPermissions("unsafe-dev-plugin", ["commands"]);

    await loader.load("unsafe-dev-plugin");

    expect(loader.get("unsafe-dev-plugin")?.enabled).toBe(true);
    expect(services.commandRegistry.getAll().map((command) => command.id)).toContain(
      "unsafe-dev-plugin:probe",
    );
  });

  it("keeps built-in plugins loadable without the unsafe community opt-in", async () => {
    const communityDir = makeTempDir("junban-community-gate-");
    const builtinDir = makeTempDir("junban-builtin-gate-");
    tempDirs.push(communityDir, builtinDir);
    writePlugin(
      builtinDir,
      "builtin-plugin",
      `
export default class BuiltinPlugin {
  async onLoad() {
    this.app.commands.register({ id: "probe", name: "Built-in Probe", callback: () => {} });
  }
  async onUnload() {}
}
`,
    );

    const { loader, services, storage } = createLoader(communityDir, builtinDir);
    await loader.discoverBuiltin();
    storage.setPluginPermissions("builtin-plugin", []);

    await loader.load("builtin-plugin");

    expect(loader.get("builtin-plugin")?.enabled).toBe(true);
    expect(services.commandRegistry.getAll().map((command) => command.id)).toContain(
      "builtin-plugin:probe",
    );
  });
});
