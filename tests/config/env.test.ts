import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import os from "node:os";
import path from "node:path";
import { loadEnv } from "../../src/config/env.js";

describe("loadEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Start with a clean env for each test
    process.env = { ...originalEnv };
    delete process.env.JUNBAN_PROFILE;
    delete process.env.DB_PATH;
    delete process.env.MARKDOWN_PATH;
    delete process.env.STORAGE_MODE;
    delete process.env.LOG_LEVEL;
    delete process.env.PORT;
    delete process.env.DEFAULT_THEME;
    delete process.env.NLP_LOCALE;
    delete process.env.PLUGIN_DIR;
    delete process.env.PLUGIN_SANDBOX;
    delete process.env.PLUGIN_REGISTRY_URL;
    delete process.env.PLUGIN_MAX_SIZE_MB;
    delete process.env.CLI_OUTPUT_FORMAT;
    delete process.env.XDG_DATA_HOME;
    process.env.HOME = "/tmp/junban-home";
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns defaults when no env vars set", () => {
    const env = loadEnv();
    expect(env.JUNBAN_PROFILE).toBe("daily");
    expect(env.DB_PATH).toBe(
      process.platform === "linux"
        ? path.join("/tmp/junban-home", ".local", "share", "junban", "junban.db")
        : "./data/junban.db",
    );
    expect(env.STORAGE_MODE).toBe("sqlite");
    expect(env.MARKDOWN_PATH).toBe(
      process.platform === "linux"
        ? path.join("/tmp/junban-home", ".local", "share", "junban", "tasks")
        : "./tasks/",
    );
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.PORT).toBe(5173);
    expect(env.DEFAULT_THEME).toBe("light");
    expect(env.NLP_LOCALE).toBe("en");
    expect(env.PLUGIN_DIR).toBe("./plugins/");
    expect(env.PLUGIN_SANDBOX).toBe(true);
    expect(env.PLUGIN_MAX_SIZE_MB).toBe(10);
    expect(env.CLI_OUTPUT_FORMAT).toBe("text");
  });

  it("uses XDG_DATA_HOME for daily Linux storage defaults", () => {
    process.env.XDG_DATA_HOME = "/tmp/xdg-data";

    const env = loadEnv();

    if (process.platform === "linux") {
      expect(env.DB_PATH).toBe(path.join("/tmp/xdg-data", "junban", "junban.db"));
      expect(env.MARKDOWN_PATH).toBe(path.join("/tmp/xdg-data", "junban", "tasks"));
    } else {
      expect(env.DB_PATH).toBe("./data/junban.db");
      expect(env.MARKDOWN_PATH).toBe("./tasks/");
    }
  });

  it("falls back to HOME when XDG_DATA_HOME is relative or empty", () => {
    for (const invalidXdgDataHome of ["relative/path", "   "]) {
      process.env.XDG_DATA_HOME = invalidXdgDataHome;

      const env = loadEnv();

      if (process.platform === "linux") {
        expect(env.DB_PATH).toBe(
          path.join("/tmp/junban-home", ".local", "share", "junban", "junban.db"),
        );
        expect(env.MARKDOWN_PATH).toBe(
          path.join("/tmp/junban-home", ".local", "share", "junban", "tasks"),
        );
      } else {
        expect(env.DB_PATH).toBe("./data/junban.db");
        expect(env.MARKDOWN_PATH).toBe("./tasks/");
      }
    }
  });

  it("falls back to non-XDG daily defaults when Linux home cannot be resolved", () => {
    vi.spyOn(process, "platform", "get").mockReturnValue("linux");
    vi.spyOn(os, "homedir").mockImplementation(() => {
      throw new Error("home unavailable");
    });
    delete process.env.HOME;

    const env = loadEnv();

    expect(env.DB_PATH).toBe("./data/junban.db");
    expect(env.MARKDOWN_PATH).toBe("./tasks/");
  });

  it("uses dev profile defaults when JUNBAN_PROFILE=dev", () => {
    process.env.JUNBAN_PROFILE = "dev";

    const env = loadEnv();

    expect(env.JUNBAN_PROFILE).toBe("dev");
    expect(env.DB_PATH).toBe("./data/dev/junban.db");
    expect(env.MARKDOWN_PATH).toBe("./tasks/dev/");
  });

  it("rejects invalid JUNBAN_PROFILE", () => {
    process.env.JUNBAN_PROFILE = "staging";
    expect(() => loadEnv()).toThrow();
  });

  it("lets explicit paths override profile defaults", () => {
    process.env.JUNBAN_PROFILE = "dev";
    process.env.DB_PATH = "/tmp/custom.db";
    process.env.MARKDOWN_PATH = "/tmp/tasks";

    const env = loadEnv();

    expect(env.DB_PATH).toBe("/tmp/custom.db");
    expect(env.MARKDOWN_PATH).toBe("/tmp/tasks");
  });

  it("reads custom DB_PATH", () => {
    process.env.DB_PATH = "/tmp/test.db";
    expect(loadEnv().DB_PATH).toBe("/tmp/test.db");
  });

  it("rejects empty DB_PATH", () => {
    process.env.DB_PATH = "   ";
    expect(() => loadEnv()).toThrow();
  });

  it("rejects DB_PATH with null byte", () => {
    process.env.DB_PATH = "bad\u0000path.db";
    expect(() => loadEnv()).toThrow();
  });

  it("reads STORAGE_MODE=markdown", () => {
    process.env.STORAGE_MODE = "markdown";
    expect(loadEnv().STORAGE_MODE).toBe("markdown");
  });

  it("rejects empty MARKDOWN_PATH", () => {
    process.env.MARKDOWN_PATH = "";
    expect(() => loadEnv()).toThrow();
  });

  it("rejects MARKDOWN_PATH with null byte", () => {
    process.env.MARKDOWN_PATH = "tasks\u0000dev";
    expect(() => loadEnv()).toThrow();
  });

  it("rejects invalid STORAGE_MODE", () => {
    process.env.STORAGE_MODE = "postgres";
    expect(() => loadEnv()).toThrow();
  });

  it("reads LOG_LEVEL", () => {
    process.env.LOG_LEVEL = "debug";
    expect(loadEnv().LOG_LEVEL).toBe("debug");
  });

  it("rejects invalid LOG_LEVEL", () => {
    process.env.LOG_LEVEL = "verbose";
    expect(() => loadEnv()).toThrow();
  });

  it("coerces PORT to number", () => {
    process.env.PORT = "3000";
    expect(loadEnv().PORT).toBe(3000);
  });

  it("reads DEFAULT_THEME", () => {
    process.env.DEFAULT_THEME = "dark";
    expect(loadEnv().DEFAULT_THEME).toBe("dark");
  });

  it("rejects invalid DEFAULT_THEME", () => {
    process.env.DEFAULT_THEME = "solarized";
    expect(() => loadEnv()).toThrow();
  });

  it("coerces PLUGIN_SANDBOX to boolean", () => {
    process.env.PLUGIN_SANDBOX = "false";
    expect(loadEnv().PLUGIN_SANDBOX).toBe(false);
  });

  it("reads optional PLUGIN_REGISTRY_URL", () => {
    process.env.PLUGIN_REGISTRY_URL = "https://example.com/registry.json";
    expect(loadEnv().PLUGIN_REGISTRY_URL).toBe("https://example.com/registry.json");
  });

  it("rejects empty PLUGIN_DIR", () => {
    process.env.PLUGIN_DIR = "   ";
    expect(() => loadEnv()).toThrow();
  });

  it("rejects PLUGIN_DIR with null byte", () => {
    process.env.PLUGIN_DIR = "plugins\u0000bad";
    expect(() => loadEnv()).toThrow();
  });

  it("CLI_OUTPUT_FORMAT accepts json", () => {
    process.env.CLI_OUTPUT_FORMAT = "json";
    expect(loadEnv().CLI_OUTPUT_FORMAT).toBe("json");
  });

  it("rejects invalid CLI_OUTPUT_FORMAT", () => {
    process.env.CLI_OUTPUT_FORMAT = "yaml";
    expect(() => loadEnv()).toThrow();
  });
});
