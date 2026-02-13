import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [["tests/ui/**", "jsdom"]],
    setupFiles: ["tests/ui/setup.ts"],
  },
});
