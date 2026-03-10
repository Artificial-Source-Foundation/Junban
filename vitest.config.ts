import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const alias = { "@": path.resolve(__dirname, "src") };

export default defineConfig({
  resolve: { alias },
  test: {
    globals: true,
    restoreMocks: true,
    setupFiles: ["tests/ui/setup.ts"],
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
          exclude: ["tests/ui/**", "tests/**/components/**/*.test.tsx"],
          globals: true,
          restoreMocks: true,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "ui",
          include: ["tests/ui/**/*.test.ts", "tests/ui/**/*.test.tsx"],
          environment: "jsdom",
          globals: true,
          restoreMocks: true,
          setupFiles: ["tests/ui/setup.ts"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "plugin-ui",
          include: ["tests/**/components/**/*.test.tsx"],
          exclude: ["tests/ui/**"],
          environment: "jsdom",
          globals: true,
          restoreMocks: true,
          setupFiles: ["tests/ui/setup.ts"],
        },
      },
    ],
  },
});
