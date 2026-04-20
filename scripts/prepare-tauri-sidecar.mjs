import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const sidecarDir = path.join(rootDir, "src-tauri", "gen", "sidecar");
const backendDir = path.join(sidecarDir, "backend");
const nodeModulesDir = path.join(sidecarDir, "node_modules");
const binariesDir = path.join(rootDir, "src-tauri", "binaries");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function detectTargetTriple() {
  const { platform, arch } = process;

  if (platform === "linux" && arch === "x64") return "x86_64-unknown-linux-gnu";
  if (platform === "linux" && arch === "arm64") return "aarch64-unknown-linux-gnu";
  if (platform === "darwin" && arch === "x64") return "x86_64-apple-darwin";
  if (platform === "darwin" && arch === "arm64") return "aarch64-apple-darwin";
  if (platform === "win32" && arch === "x64") return "x86_64-pc-windows-msvc";
  if (platform === "win32" && arch === "arm64") return "aarch64-pc-windows-msvc";
  if (platform === "win32" && arch === "ia32") return "i686-pc-windows-msvc";

  throw new Error(`Unsupported Tauri sidecar platform: ${platform} ${arch}`);
}

function copyRuntimeAssets(sourceDir, destinationDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyRuntimeAssets(sourcePath, destinationPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!sourcePath.endsWith(".json") && !sourcePath.endsWith(".sql")) {
      continue;
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

function main() {
  fs.rmSync(sidecarDir, { recursive: true, force: true });
  fs.mkdirSync(sidecarDir, { recursive: true });

  run("pnpm", ["exec", "tsc", "-p", "tsconfig.node-sidecar.json"]);

  copyRuntimeAssets(path.join(rootDir, "src"), backendDir);
  fs.writeFileSync(
    path.join(backendDir, "package.json"),
    JSON.stringify({ type: "module" }, null, 2),
  );

  fs.cpSync(path.join(rootDir, "node_modules"), nodeModulesDir, {
    recursive: true,
    dereference: true,
    force: true,
  });

  fs.mkdirSync(binariesDir, { recursive: true });
  const targetTriple = detectTargetTriple();
  const extension = process.platform === "win32" ? ".exe" : "";
  const sidecarBinaryPath = path.join(binariesDir, `junban-node-${targetTriple}${extension}`);

  fs.copyFileSync(fs.realpathSync(process.execPath), sidecarBinaryPath);
  if (process.platform !== "win32") {
    fs.chmodSync(sidecarBinaryPath, 0o755);
  }
}

main();
