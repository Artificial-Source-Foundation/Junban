#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "dist-node");
const cliEntry = path.join(outDir, "cli", "index.js");
const migrationsSource = path.join(root, "src", "db", "migrations");
const migrationsTarget = path.join(outDir, "db", "migrations");
const tscEntry = path.join(root, "node_modules", "typescript", "bin", "tsc");

function fail(message) {
  console.error(message);
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });

const tsc = spawnSync(process.execPath, [tscEntry, "-p", "tsconfig.cli.json"], {
  cwd: root,
  stdio: "inherit",
});

if (tsc.error) {
  fail(`Failed to run TypeScript CLI build: ${tsc.error.message}`);
}

if (tsc.status !== 0) {
  process.exit(tsc.status ?? 1);
}

fs.cpSync(migrationsSource, migrationsTarget, { recursive: true });

if (!fs.existsSync(cliEntry)) {
  fail(`CLI build did not produce ${path.relative(root, cliEntry)}`);
}

const firstLine = fs.readFileSync(cliEntry, "utf8").split(/\r?\n/, 1)[0];
if (firstLine !== "#!/usr/bin/env node") {
  fail("CLI entrypoint is missing the node shebang.");
}

if (process.platform !== "win32") {
  fs.chmodSync(cliEntry, fs.statSync(cliEntry).mode | 0o755);
}

console.log(`Built CLI package output in ${path.relative(root, outDir)}`);
