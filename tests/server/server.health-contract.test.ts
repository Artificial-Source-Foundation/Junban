import { beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";

function mockServerDependencies() {
  vi.doMock("../../src/bootstrap.js", () => ({
    createNodeBackendRuntime: vi.fn(() => ({
      services: { marker: "services" },
      initialize: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
      dispose: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    })),
  }));

  vi.doMock("../../src/config/env.js", () => ({
    loadEnv: vi.fn(() => ({ LOG_LEVEL: "info" })),
  }));

  vi.doMock("../../src/utils/logger.js", () => ({
    setDefaultLogLevel: vi.fn(),
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
    })),
  }));

  vi.doMock("../../src/core/errors.js", () => ({
    NotFoundError: class NotFoundError extends Error {},
    ValidationError: class ValidationError extends Error {},
  }));

  vi.doMock("@hono/node-server", () => ({
    serve: vi.fn(() => ({
      close: vi.fn(),
    })),
  }));

  vi.doMock("hono/cors", () => ({
    cors: vi.fn(() => async (_c: unknown, next: () => Promise<void>) => next()),
  }));

  vi.doMock("hono/secure-headers", () => ({
    secureHeaders: vi.fn(() => async (_c: unknown, next: () => Promise<void>) => next()),
  }));

  vi.doMock("hono/body-limit", () => ({
    bodyLimit: vi.fn(() => async (_c: unknown, next: () => Promise<void>) => next()),
  }));

  vi.doMock("../../src/api/tasks.js", () => ({ taskRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/projects.js", () => ({ projectRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/tags.js", () => ({ tagRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/sections.js", () => ({ sectionRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/comments.js", () => ({ commentRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/templates.js", () => ({ templateRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/settings.js", () => ({ settingsRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/stats.js", () => ({ statsRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/plugins.js", () => ({ pluginRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/ai.js", () => ({ aiRoutes: vi.fn(() => new Hono()) }));
  vi.doMock("../../src/api/voice.js", () => ({ voiceRoutes: vi.fn(() => new Hono()) }));
}

describe("server health contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    mockServerDependencies();
  });

  it("identifies Junban's backend instead of returning a generic 200", async () => {
    const { app } = await import("../../src/server.js");

    const response = await app.request("http://localhost/api/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      ready: true,
      degraded: false,
      service: "junban-backend",
      runtime: "node",
    });
  });
});
