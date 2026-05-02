import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..", "..");
const scriptPath = path.join(rootDir, "scripts", "prepare-release.ts");
const tsxPath = path.join(rootDir, "node_modules", ".bin", "tsx");
const tempDirs: string[] = [];

function createTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "junban-release-test-"));
  tempDirs.push(tempDir);
  return tempDir;
}

function writeJson(filePath: string, value: unknown) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function createReleaseFixture() {
  const fixtureDir = createTempDir();
  fs.mkdirSync(path.join(fixtureDir, "src-tauri"), { recursive: true });
  fs.mkdirSync(path.join(fixtureDir, "src", "config"), { recursive: true });

  writeJson(path.join(fixtureDir, "package.json"), {
    name: "asf-junban",
    version: "1.0.6",
  });
  writeJson(path.join(fixtureDir, "src-tauri", "tauri.conf.json"), {
    productName: "Junban",
    version: "1.0.6",
  });
  fs.writeFileSync(
    path.join(fixtureDir, "src", "config", "defaults.ts"),
    'export const APP_VERSION = "1.0.6";\n',
  );
  fs.writeFileSync(
    path.join(fixtureDir, "src-tauri", "Cargo.toml"),
    '[package]\nname = "asf-junban"\nversion = "1.0.6"\n',
  );
  writeJson(path.join(fixtureDir, "sources.json"), {
    version: 1,
    lastUpdated: "2026-04-18",
    plugins: [
      { id: "junban-kanban", minJunbanVersion: "1.0.5" },
      { id: "legacy-compatible", minJunbanVersion: "1.0.0" },
    ],
  });

  return fixtureDir;
}

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("prepare-release", () => {
  it("updates release versions without raising plugin minimum app versions", () => {
    const fixtureDir = createReleaseFixture();
    const result = spawnSync(tsxPath, [scriptPath, "1.2.3"], {
      cwd: fixtureDir,
      encoding: "utf8",
      env: { ...process.env, CI: "true" },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(readJson<{ version: string }>(path.join(fixtureDir, "package.json")).version).toBe(
      "1.2.3",
    );
    expect(
      readJson<{ version: string }>(path.join(fixtureDir, "src-tauri", "tauri.conf.json")).version,
    ).toBe("1.2.3");
    expect(
      fs.readFileSync(path.join(fixtureDir, "src", "config", "defaults.ts"), "utf8"),
    ).toContain('APP_VERSION = "1.2.3"');
    expect(fs.readFileSync(path.join(fixtureDir, "src-tauri", "Cargo.toml"), "utf8")).toContain(
      'version = "1.2.3"',
    );

    const sources = readJson<{
      lastUpdated: string;
      plugins: Array<{ id: string; minJunbanVersion: string }>;
    }>(path.join(fixtureDir, "sources.json"));
    expect(sources.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sources.plugins).toEqual([
      { id: "junban-kanban", minJunbanVersion: "1.0.5" },
      { id: "legacy-compatible", minJunbanVersion: "1.0.0" },
    ]);
  });
});
