import { describe, it, expect } from "vitest";
import { PluginManifest, SettingDefinition } from "../../src/plugins/types.js";

describe("PluginManifest schema", () => {
  const validManifest = {
    id: "my-plugin",
    name: "My Plugin",
    version: "1.0.0",
    author: "Test Author",
    description: "A test plugin",
    main: "index.ts",
    minSaydoVersion: "0.1.0",
  };

  it("accepts a valid minimal manifest", () => {
    const result = PluginManifest.parse(validManifest);
    expect(result.id).toBe("my-plugin");
    expect(result.permissions).toEqual([]);
    expect(result.settings).toEqual([]);
    expect(result.keywords).toEqual([]);
  });

  it("accepts a full manifest", () => {
    const result = PluginManifest.parse({
      ...validManifest,
      permissions: ["task:read", "commands"],
      repository: "https://github.com/test/plugin",
      license: "MIT",
      keywords: ["timer", "productivity"],
      settings: [
        { id: "interval", name: "Interval", type: "number", default: 25 },
      ],
    });
    expect(result.permissions).toEqual(["task:read", "commands"]);
    expect(result.license).toBe("MIT");
    expect(result.keywords).toEqual(["timer", "productivity"]);
  });

  it("rejects id with uppercase", () => {
    expect(() =>
      PluginManifest.parse({ ...validManifest, id: "My-Plugin" }),
    ).toThrow();
  });

  it("rejects id with spaces", () => {
    expect(() =>
      PluginManifest.parse({ ...validManifest, id: "my plugin" }),
    ).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() => PluginManifest.parse({})).toThrow();
    expect(() => PluginManifest.parse({ id: "test" })).toThrow();
    expect(() =>
      PluginManifest.parse({ id: "test", name: "Test" }),
    ).toThrow();
  });

  it("rejects invalid repository URL", () => {
    expect(() =>
      PluginManifest.parse({ ...validManifest, repository: "not-a-url" }),
    ).toThrow();
  });

  it("accepts manifest without optional fields", () => {
    const result = PluginManifest.parse(validManifest);
    expect(result.repository).toBeUndefined();
    expect(result.license).toBeUndefined();
    expect(result.dependencies).toBeUndefined();
  });

  it("accepts optional targetApiVersion field", () => {
    const result = PluginManifest.parse({
      ...validManifest,
      targetApiVersion: "1.0.0",
    });
    expect(result.targetApiVersion).toBe("1.0.0");
  });

  it("parses correctly without targetApiVersion", () => {
    const result = PluginManifest.parse(validManifest);
    expect(result.targetApiVersion).toBeUndefined();
    expect(result.id).toBe("my-plugin");
  });
});

describe("SettingDefinition schema", () => {
  it("accepts text setting", () => {
    const result = SettingDefinition.parse({
      id: "greeting",
      name: "Greeting",
      type: "text",
      default: "Hello",
      description: "The greeting text",
    });
    expect(result.type).toBe("text");
    expect(result.default).toBe("Hello");
  });

  it("accepts number setting with min/max", () => {
    const result = SettingDefinition.parse({
      id: "interval",
      name: "Interval",
      type: "number",
      default: 25,
      min: 1,
      max: 120,
    });
    expect(result.type).toBe("number");
    expect(result.default).toBe(25);
  });

  it("accepts boolean setting", () => {
    const result = SettingDefinition.parse({
      id: "enabled",
      name: "Enabled",
      type: "boolean",
      default: true,
    });
    expect(result.type).toBe("boolean");
    expect(result.default).toBe(true);
  });

  it("accepts select setting", () => {
    const result = SettingDefinition.parse({
      id: "sound",
      name: "Sound",
      type: "select",
      default: "bell",
      options: ["bell", "chime", "none"],
    });
    expect(result.type).toBe("select");
    expect((result as { options: string[] }).options).toEqual(["bell", "chime", "none"]);
  });

  it("rejects unknown setting type", () => {
    expect(() =>
      SettingDefinition.parse({
        id: "test",
        name: "Test",
        type: "color",
        default: "#fff",
      }),
    ).toThrow();
  });

  it("rejects number setting with string default", () => {
    expect(() =>
      SettingDefinition.parse({
        id: "interval",
        name: "Interval",
        type: "number",
        default: "25",
      }),
    ).toThrow();
  });
});
