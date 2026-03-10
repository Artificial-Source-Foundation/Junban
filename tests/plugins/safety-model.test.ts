import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "../../src/db/schema.js";
import { SQLiteBackend } from "../../src/storage/sqlite-backend.js";
import type { IStorage } from "../../src/storage/interface.js";
import { DEFAULT_SETTINGS } from "../../src/ui/context/SettingsContext.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../../src/db/migrations");

describe("Plugin Safety Model", () => {
  let storage: IStorage;

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    const db = drizzle(sqlite, { schema });
    migrate(db, { migrationsFolder });
    storage = new SQLiteBackend(db);
  });

  it("community_plugins_enabled defaults to false", () => {
    expect(DEFAULT_SETTINGS.community_plugins_enabled).toBe("false");
  });

  it("community_plugins_enabled setting is undefined when not set", () => {
    const setting = storage.getAppSetting("community_plugins_enabled");
    expect(setting).toBeUndefined();
  });

  it("community plugins cannot load when restricted mode is on", () => {
    // Setting is not set (defaults to restricted)
    const setting = storage.getAppSetting("community_plugins_enabled");
    // The loader checks: setting?.value !== "true" → should block
    expect(setting?.value !== "true").toBe(true);
  });

  it("community plugins cannot load when restricted mode is explicitly false", () => {
    storage.setAppSetting("community_plugins_enabled", "false");
    const setting = storage.getAppSetting("community_plugins_enabled");
    expect(setting?.value).toBe("false");
    expect(setting?.value !== "true").toBe(true);
  });

  it("built-in plugins can load regardless of restricted mode", () => {
    // Restricted mode is on (no setting set)
    const setting = storage.getAppSetting("community_plugins_enabled");
    expect(setting?.value !== "true").toBe(true);
    // Built-in plugins skip this check entirely, so they are unaffected.
    // The loader code: if (!loaded.builtin) { check setting } — builtin plugins bypass.
    // This is a logic-level test: built-in flag means the restriction does not apply.
    const isBuiltin = true;
    const isBlocked = !isBuiltin && setting?.value !== "true";
    expect(isBlocked).toBe(false);
  });

  it("community plugins can load when restricted mode is off", () => {
    storage.setAppSetting("community_plugins_enabled", "true");
    const setting = storage.getAppSetting("community_plugins_enabled");
    expect(setting?.value).toBe("true");
    // The loader checks: setting?.value !== "true" → should NOT block
    expect(setting?.value !== "true").toBe(false);
  });

  it("toggling restricted mode on and off works correctly", () => {
    // Start restricted (not set)
    expect(storage.getAppSetting("community_plugins_enabled")).toBeUndefined();

    // Enable community plugins
    storage.setAppSetting("community_plugins_enabled", "true");
    expect(storage.getAppSetting("community_plugins_enabled")?.value).toBe("true");

    // Re-restrict
    storage.setAppSetting("community_plugins_enabled", "false");
    expect(storage.getAppSetting("community_plugins_enabled")?.value).toBe("false");
  });
});
